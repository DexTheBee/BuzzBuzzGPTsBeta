"""
System audio capture module using soundcard for loopback recording.
Production-ready with proper logging, error handling, and thread safety.
"""

import numpy as np
import soundcard as sc
import threading
import queue
import time
from config import Config
from logger_config import get_logger
from typing import Optional

logger = get_logger(__name__)


class AudioCaptureError(Exception):
    """Custom exception for audio capture errors."""
    pass


class AudioCapture:
    """Captures system audio (loopback) in real-time with robust error handling."""
    
    def __init__(self, audio_queue: queue.Queue, device_name: Optional[str] = None):
        """
        Initialize audio capture.
        
        Args:
            audio_queue: Queue to push captured audio chunks
            device_name: Name of audio device (None for default loopback)
            
        Raises:
            AudioCaptureError: If audio device initialization fails
        """
        self.audio_queue = audio_queue
        self.device_name = device_name
        self.is_running = False
        self.capture_thread = None
        self.monitor_thread = None
        self.last_error: Optional[Exception] = None
        self._lock = threading.Lock()  # Thread safety
        self.error_count = 0
        
        # Initialize audio device
        try:
            self.mic = self._initialize_device(device_name)
            logger.info(f"Audio device initialized: {self.mic.name}")
        except Exception as e:
            logger.error(f"Failed to initialize audio device: {e}")
            raise AudioCaptureError(f"Audio device initialization failed: {e}")
    
    def _initialize_device(self, device_name: Optional[str] = None):
        """Initialize and return the audio device."""
        if device_name:
            # Find specific device by name
            mics = sc.all_microphones(include_loopback=True)
            for mic in mics:
                if device_name.lower() in mic.name.lower():
                    logger.debug(f"Found requested device: {mic.name}")
                    return mic
            raise AudioCaptureError(f"Could not find audio device: {device_name}")
        else:
            # Get loopback microphone from default speaker
            try:
                default_speaker = sc.default_speaker()
                speaker_name = default_speaker.name
                logger.debug(f"Default speaker: {speaker_name}")
            except Exception:
                speaker_name = ""
                logger.warning("Could not detect default speaker")
                
            # Find the loopback mic that corresponds to default speaker
            mics = sc.all_microphones(include_loopback=True)
            if speaker_name:
                for mic in mics:
                    if mic.isloopback and speaker_name in mic.name:
                        return mic
            
            # Fallback: use first loopback mic found
            for mic in mics:
                if mic.isloopback:
                    logger.info(f"Using fallback loopback device: {mic.name}")
                    return mic
            
            raise AudioCaptureError("No loopback audio device found. Please check your audio settings.")
            
    def start(self) -> bool:
        """Start capturing audio in background threads.
        
        Returns:
            True if started successfully, False otherwise
        """
        with self._lock:
            if self.is_running:
                logger.warning("Audio capture already running")
                return True
                
            self.is_running = True
            self.capture_thread = threading.Thread(target=self._capture_loop, daemon=True)
            self.monitor_thread = threading.Thread(target=self._monitor_devices, daemon=True)
            
            self.capture_thread.start()
            self.monitor_thread.start()
            
            logger.info("Audio capture started successfully")
            return True
        
    def stop(self):
        """Stop capturing audio."""
        with self._lock:
            if not self.is_running:
                return
            self.is_running = False
        
        logger.info("Stopping audio capture...")
        
        # Wait for threads to finish
        if self.capture_thread:
            self.capture_thread.join(timeout=5.0)
            if self.capture_thread.is_alive():
                logger.warning("Capture thread did not stop gracefully")
        
        if self.monitor_thread:
            self.monitor_thread.join(timeout=2.0)
            
        logger.info("Audio capture stopped")
            
    def _capture_loop(self):
        """Main capture loop running in background thread."""
        logger.info(f"Starting capture loop with mic: {self.mic.name}")
        
        try:
            with self.mic.recorder(
                samplerate=Config.SAMPLE_RATE,
                channels=None,
                blocksize=Config.BUFFER_SIZE
            ) as recorder:
                logger.debug("Recorder opened, listening for audio...")
                chunk_count = 0
                
                while self.is_running:
                    try:
                        # Record a chunk of audio
                        audio_data = recorder.record(numframes=Config.BUFFER_SIZE)
                        
                        # Ensure it's float32
                        audio_fp32 = audio_data.astype(np.float32)
                        
                        # Convert to mono if multi-channel
                        if len(audio_fp32.shape) > 1 and audio_fp32.shape[1] > 1:
                            audio_chunk = np.mean(audio_fp32, axis=1)
                        else:
                            audio_chunk = audio_fp32.flatten()
                        
                        # Periodic audio level monitoring
                        chunk_count += 1
                        if chunk_count % 50 == 0:
                            rms = np.sqrt(np.mean(audio_chunk**2))
                            logger.debug(f"Audio chunk #{chunk_count}, RMS level: {rms:.6f}")
                        
                        # Voice Activity Detection
                        if Config.ENABLE_VAD:
                            rms = np.sqrt(np.mean(audio_chunk**2))
                            if rms < Config.VAD_THRESHOLD:
                                continue  # Skip silent chunks
                        
                        # Put audio chunk in queue
                        try:
                            self.audio_queue.put(audio_chunk, timeout=0.1)
                        except queue.Full:
                            logger.warning("Audio queue full, dropping chunk to prevent latency")
                            
                    except Exception as e:
                        logger.error(f"Error processing audio chunk: {e}")
                        self.error_count += 1
                        
        except Exception as e:
            logger.critical(f"Fatal error in capture loop: {e}", exc_info=True)
            self.last_error = e
            self.is_running = False
        finally:
            logger.info("Capture loop ended")

    def _monitor_devices(self):
        """Monitor for default device changes (hot-swapping)."""
        logger.debug("Device monitor thread started")
        
        while self.is_running:
            time.sleep(5.0)  # Check every 5 seconds
            
            if self.device_name:
                continue  # Don't hot-swap if specific device was requested
            
            try:
                new_default = sc.default_speaker().name
                if self.mic and new_default not in self.mic.name:
                    logger.info(f"Default device changed to: {new_default}. Attempting restart...")
                    self._restart_capture()
            except Exception as e:
                logger.debug(f"Device monitor check error: {e}")
        
        logger.debug("Device monitor thread ended")

    def _restart_capture(self):
        """Restart the capture process with updated default device."""
        try:
            default_speaker = sc.default_speaker()
            mics = sc.all_microphones(include_loopback=True)
            new_mic = None
            
            for mic in mics:
                if mic.isloopback and default_speaker.name in mic.name:
                    new_mic = mic
                    break
            
            if new_mic and new_mic.name != self.mic.name:
                self.mic = new_mic
                logger.info(f"Switched to new device: {self.mic.name}")
        except Exception as e:
            logger.error(f"Failed to restart capture: {e}")
            
    @staticmethod
    def list_devices():
        """List all available audio devices with detailed loopback info."""
        print("\n" + "="*50)
        print("   AVAILABLE AUDIO DEVICES")
        print("="*50 + "\n")
        
        print("🔊 Speakers (Output):")
        for i, s in enumerate(sc.all_speakers()):
            print(f"  {i}: {s.name}")
            
        print("\n🎤 Microphones & Loopbacks:")
        for i, m in enumerate(sc.all_microphones(include_loopback=True)):
            loopback_str = "[LOOPBACK]" if m.isloopback else ""
            print(f"  {i}: {m.name} {loopback_str}")
            
        print("\n⭐ Default System Output (Loopback Target):")
        try:
            ds = sc.default_speaker()
            print(f"  Name: {ds.name}")
        except:
            print("  None detected")
        print("\n" + "="*50)
    
    def get_health_status(self) -> dict:
        """Get health status of audio capture.
        
        Returns:
            Dictionary with health metrics
        """
        return {
            "is_running": self.is_running,
            "device_name": self.mic.name if self.mic else None,
            "error_count": self.error_count,
            "last_error": str(self.last_error) if self.last_error else None,
            "queue_size": self.audio_queue.qsize(),
            "queue_full": self.audio_queue.full()
        }
