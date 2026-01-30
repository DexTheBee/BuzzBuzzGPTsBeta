"""
Whisper transcription module for real-time speech-to-text.
Optimized for long sentences with silence-based finalization.
"""

import threading
import queue
import time
import numpy as np
from faster_whisper import WhisperModel
from config import Config
from logger_config import get_logger
from typing import Callable, Optional

logger = get_logger(__name__)


class WhisperTranscriber:
    """Real-time transcription using OpenAI Whisper, optimized for continuous flow."""
    
    def __init__(self, audio_queue: queue.Queue, text_callback: Callable):
        self.audio_queue = audio_queue
        self.text_callback = text_callback
        self.is_running = False
        self.transcribe_thread = None
        self.model = None
        self._lock = threading.Lock()  # Thread safety for shared state
        self._model_loaded = threading.Event()
        
        # Audio Buffer (holds current active sentence)
        self.audio_buffer = np.zeros(0, dtype=np.float32)
        self.last_finalized_text = ""  # Context memory for next sentence
        self.error_count = 0
        self.last_error: Optional[Exception] = None
        
    def load_model(self, max_retries: Optional[int] = None) -> bool:
        """Load the faster-whisper model with retry logic.
        
        Args:
            max_retries: Maximum retry attempts (uses Config.MAX_RETRIES if None)
            
        Returns:
            True if successful, False otherwise
        """
        if max_retries is None:
            max_retries = Config.MAX_RETRIES
            
        logger.info(f"Loading Faster-Whisper model '{Config.WHISPER_MODEL}'...")
        device = Config.get_device()
        compute_type = "float16" if device == "cuda" else "int8"
        
        for attempt in range(max_retries):
            try:
                self.model = WhisperModel(
                    Config.WHISPER_MODEL, 
                    device=device, 
                    compute_type=compute_type,
                    cpu_threads=4
                )
                logger.info(f"Model loaded successfully on {device} (compute_type={compute_type})")
                self._model_loaded.set()
                return True
                
            except Exception as e:
                logger.error(f"Model loading attempt {attempt + 1}/{max_retries} failed: {e}")
                self.last_error = e
                
                if attempt < max_retries - 1:
                    delay = Config.RETRY_DELAY * (2 ** attempt)  # Exponential backoff
                    logger.info(f"Retrying in {delay} seconds...")
                    time.sleep(delay)
                else:
                    logger.critical(f"Failed to load model after {max_retries} attempts")
                    return False
        
        return False
        
    def start(self) -> bool:
        """Start transcription thread.
        
        Returns:
            True if started successfully, False otherwise
        """
        with self._lock:
            if self.is_running:
                logger.warning("Transcriber already running")
                return True
                
            if self.model is None:
                logger.info("Model not loaded, loading now...")
                if not self.load_model():
                    logger.error("Failed to start transcriber: model loading failed")
                    return False
                    
            self.is_running = True
            self.transcribe_thread = threading.Thread(target=self._transcribe_loop, daemon=True)
            self.transcribe_thread.start()
            logger.info("Transcriber started successfully")
            return True
        
    def stop(self):
        """Stop transcription thread."""
        with self._lock:
            if not self.is_running:
                return
            self.is_running = False
            
        logger.info("Stopping transcriber...")
        if self.transcribe_thread:
            self.transcribe_thread.join(timeout=5.0)
            if self.transcribe_thread.is_alive():
                logger.warning("Transcriber thread did not stop gracefully")
            else:
                logger.info("Transcriber stopped successfully")
            
    def _transcribe_loop(self):
        """Main loop that only finalizes on a specific silence duration."""
        last_audio_time = time.time()
        
        while self.is_running:
            try:
                # 1. Get new audio
                chunks = []
                try:
                    # Wait a bit for audio
                    chunks.append(self.audio_queue.get(timeout=0.2))
                    last_audio_time = time.time() # Reset silence timer when audio received
                except queue.Empty:
                    # check for Silence Finalization
                    silence_duration = time.time() - last_audio_time
                    if len(self.audio_buffer) > 0 and silence_duration >= Config.FINALIZATION_PAUSE:
                        # FINALIZATION: Pause detected, save the buffer to history
                        try:
                            segments, info = self.model.transcribe(
                                self.audio_buffer, 
                                language="en", 
                                beam_size=1
                            )
                            text = "".join([s.text for s in segments]).strip()
                            if text:
                                # Move to history
                                self.text_callback(text, 0, time.time(), is_final=True)
                                self.last_finalized_text = text  # Store for live context
                                logger.debug(f"Finalized: {text[:50]}...")
                        except Exception as e:
                            logger.error(f"Error during finalization: {e}")
                            self.error_count += 1
                        
                        # Reset buffer for the next sentence
                        self.audio_buffer = np.zeros(0, dtype=np.float32)
                    continue

                # Drain the rest of the queue
                while not self.audio_queue.empty():
                    try: chunks.append(self.audio_queue.get_nowait())
                    except queue.Empty: break
                
                # 2. Update buffer
                new_audio = np.concatenate(chunks)
                self.audio_buffer = np.concatenate([self.audio_buffer, new_audio])
                
                # Emergency limit: Prevent memory leak if user never stops talking (10 mins)
                emergency_limit = int(Config.SAMPLE_RATE * Config.WINDOW_DURATION)
                if len(self.audio_buffer) > emergency_limit:
                    # Force a finalization if we hit the limit
                    logger.warning("Context limit reached. Finalizing current passage.")
                    try:
                        # Use slightly higher beam_size for the final pass to ensure quality
                        segments, info = self.model.transcribe(
                            self.audio_buffer, 
                            language="en", 
                            beam_size=2  # Higher accuracy final pass
                        )
                        res_text = "".join([s.text for s in segments]).strip()
                        if res_text:
                            self.text_callback(res_text, 0, time.time(), is_final=True)
                            self.last_finalized_text = res_text
                    except Exception as e:
                        logger.error(f"Error during emergency finalization: {e}")
                        self.error_count += 1
                        
                    self.audio_buffer = np.zeros(0, dtype=np.float32)
                    continue

                # 3. Live Update (Streaming) - OPTIMIZED
                # Use a shorter 3s window for maximum speed with context for accuracy
                if len(self.audio_buffer) > 0:
                    # Reduced window to 3 seconds for lightning fast inference
                    live_context_samples = int(Config.SAMPLE_RATE * 3.0)
                    live_audio = self.audio_buffer[-live_context_samples:]
                    
                    start_t = time.time()
                    try:
                        segments, info = self.model.transcribe(
                            live_audio,
                            language="en",
                            beam_size=1,
                            initial_prompt=self.last_finalized_text  # Context memory
                        )
                        text = "".join([s.text for s in segments]).strip()
                        duration = time.time() - start_t
                        
                        # Update the live display
                        if text:
                            # Add ellipsis if text was truncated
                            prefix = "... " if len(self.audio_buffer) > live_context_samples else ""
                            self.text_callback(prefix + text, duration, time.time(), is_final=False)
                    except Exception as e:
                        logger.error(f"Error during live transcription: {e}")
                        self.error_count += 1
                
            except Exception as e:
                logger.error(f"Error in transcription loop: {e}", exc_info=True)
                self.error_count += 1
                time.sleep(1)  # Prevent tight error loop
        
        logger.info("Transcription loop ended")

    def get_average_latency(self):
        return 0.0 # Standard latency reporting
