"""
System Audio Live Speech-to-Text
Main application entry point.
Production-ready with comprehensive logging and error handling.
"""

import sys
import os
import argparse
import queue
import signal
import numpy as np
import traceback
from utils import apply_patches

# Apply compatibility patches early
apply_patches()

# Setup logging before other imports
from logger_config import setup_logging, get_logger
from config import Config

# Initialize logging
setup_logging(
    log_level=Config.LOG_LEVEL,
    log_dir=Config.LOG_DIR,
    console=Config.ENABLE_CONSOLE_LOGGING,
    file_logging=Config.ENABLE_FILE_LOGGING
)

logger = get_logger(__name__)

from audio_capture import AudioCapture
from transcriber import WhisperTranscriber
from display import TranscriptionDisplay

class SystemAudioSTT:
    """Main application class with production-ready error handling."""
    
    def __init__(self):
        logger.info("Initializing System Audio STT application")
        self.audio_queue = queue.Queue(maxsize=Config.MAX_QUEUE_SIZE)
        self.display = TranscriptionDisplay()
        self.audio_capture = None
        self.transcriber = None
        self.is_running = False
        self._initialization_success = False
        
    def transcription_callback(self, text, latency, timestamp, is_final=False):
        self.display.update_transcription(text, latency, timestamp, is_final)
        
    def setup(self, device_name=None) -> bool:
        """Setup application components.
        
        Returns:
            True if setup successful, False otherwise
        """
        try:
            logger.info("Setting up application components...")
            
            # Validate configuration
            Config.validate()
            
            # Initialize audio capture
            self.audio_capture = AudioCapture(self.audio_queue, device_name)
            
            # Initialize transcriber
            self.transcriber = WhisperTranscriber(self.audio_queue, self.transcription_callback)
            
            # Setup display
            self.display.show_welcome()
            self.display.update_status("Loading models...")
            
            # Load Whisper model
            if not self.transcriber.load_model():
                logger.error("Failed to load Whisper model")
                self.display.update_status("Error: Failed to load model")
                return False
            
            self._initialization_success = True
            logger.info("Application setup completed successfully")
            return True
            
        except Exception as e:
            logger.critical(f"Setup failed: {e}", exc_info=True)
            self.display.update_status(f"Error: {e}")
            return False
        
    def start(self) -> bool:
        """Start application threads.
        
        Returns:
            True if started successfully, False otherwise
        """
        if not self._initialization_success:
            logger.error("Cannot start: initialization was not successful")
            return False
            
        try:
            self.is_running = True
            self.display.start()
            
            if not self.audio_capture.start():
                logger.error("Failed to start audio capture")
                return False
                
            if not self.transcriber.start():
                logger.error("Failed to start transcriber")
                return False
            
            self.display.update_status("Live - Listening to system audio...")
            logger.info("Application started successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start application: {e}", exc_info=True)
            return False
        
    def stop(self):
        """Stop application gracefully."""
        if not self.is_running:
            return
            
        logger.info("Stopping application...")
        self.is_running = False
        self.display.update_status("Stopping...")
        
        # Stop components in reverse order
        if self.audio_capture:
            self.audio_capture.stop()
        if self.transcriber:
            self.transcriber.stop()
        if self.display:
            self.display.stop()
            
        self.display.show_goodbye()
        logger.info("Application stopped successfully")
        
    def run(self):
        """Run the main application loop."""
        try:
            # Initialize UI if not already done
            if self.display.root is None:
                self.display._setup_ui()
            
            # Setup window close handler
            self.display.root.protocol("WM_DELETE_WINDOW", self.stop)
            
            # Start background threads before GUI mainloop
            if not self.audio_capture.start():
                logger.error("Failed to start audio capture")
                return
                
            if not self.transcriber.start():
                logger.error("Failed to start transcriber")
                return
                
            self.is_running = True
            self.display.update_status("Live - Listening...")
            
            # Log system information
            logger.info(f"Audio capture: {self.audio_capture.is_running}")
            logger.info(f"Transcriber: {self.transcriber.is_running}")
            logger.info(f"Device: {self.audio_capture.mic.name}")
            
            # Start GUI mainloop (blocking call)
            self._run_mainloop()
            
        except KeyboardInterrupt:
            logger.info("Received keyboard interrupt")
            self.stop()
        except Exception as e:
            logger.critical(f"Error in main loop: {e}", exc_info=True)
            self.stop()
            raise
        finally:
            self.stop()
    
    def _run_mainloop(self):
        """Run the GUI mainloop (blocking call)."""
        self.display.root.mainloop()

def main():
    """Main entry point for the application."""
    parser = argparse.ArgumentParser(
        description="System Audio Live Speech-to-Text",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "--list-devices",
        action="store_true",
        help="List all available audio devices and exit"
    )
    parser.add_argument(
        "--device",
        type=str,
        default=None,
        help="Audio device name to use (default: system loopback)"
    )
    parser.add_argument(
        "--model",
        type=str,
        default=None,
        help="Whisper model size (tiny, base, small, medium, large)"
    )
    
    args = parser.parse_args()
    
    # Handle device listing
    if args.list_devices:
        AudioCapture.list_devices()
        return
    
    # Override model if specified
    if args.model:
        logger.info(f"Using model override: {args.model}")
        Config.WHISPER_MODEL = args.model
    
    # Create and run application
    app = SystemAudioSTT()
    try:
        if not app.setup(device_name=args.device):
            logger.error("Application setup failed")
            sys.exit(1)
            
        app.run()
        
    except KeyboardInterrupt:
        logger.info("Application interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.critical(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
