import queue
import threading
from audio_capture import AudioCapture
from transcriber import WhisperTranscriber
from utils import apply_patches
from config import Config

class VoiceTranscriptionManager:
    """
    Production-ready manager to integrate live transcription into UI buttons.
    Designed to work without a GUI of its own.
    """
    
    def __init__(self, on_text_callback):
        """
        Initialize the manager.
        Args:
            on_text_callback: A function(text, latency, timestamp, is_final) 
                              called when transcriptions are ready.
        """
        # 1. Mandatory patch for NumPy 2.0 / Python 3.13 stability
        apply_patches()
        
        self.on_text_callback = on_text_callback
        self.audio_queue = None
        self.capture = None
        self.transcriber = None
        self.is_recording = False
        self._lock = threading.Lock()

    def start_recording(self):
        """Triggers the 'Record' state (linked to your Voice Button)."""
        with self._lock:
            if self.is_recording:
                print("[VoiceManager] Already recording.")
                return
            
            print("[VoiceManager] Starting session...")
            self.audio_queue = queue.Queue(maxsize=Config.MAX_QUEUE_SIZE)
            
            # Initialize components
            self.capture = AudioCapture(self.audio_queue)
            self.transcriber = WhisperTranscriber(self.audio_queue, self.on_text_callback)
            
            # Start background threads
            self.transcriber.start()
            self.capture.start()
            self.is_recording = True

    def stop_recording(self):
        """Triggers the 'Stop' state (linked to your Voice Button)."""
        with self._lock:
            if not self.is_recording:
                print("[VoiceManager] Not recording.")
                return
            
            print("[VoiceManager] Stopping session...")
            if self.capture:
                self.capture.stop()
            if self.transcriber:
                self.transcriber.stop()
            
            self.is_recording = False
            self.capture = None
            self.transcriber = None
            self.audio_queue = None

# --- EXAMPLE USAGE ---
if __name__ == "__main__":
    import time

    def my_ui_callback(text, latency, timestamp, is_final):
        prefix = "FINISH" if is_final else "LIVE"
        print(f"[{prefix}] {text}")

    # Initialize the manager once
    voice_manager = VoiceTranscriptionManager(on_text_callback=my_ui_callback)

    # Simulate Button Press: START
    print("--- User clicked START ---")
    voice_manager.start_recording()
    
    time.sleep(10) # Simulating 10 seconds of speech
    
    # Simulate Button Press: STOP
    print("--- User clicked STOP ---")
    voice_manager.stop_recording()
