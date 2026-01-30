"""
Desktop GUI display module for live transcription.
Uses CustomTkinter for a modern, sleek interface.
"""

import customtkinter as ctk
import tkinter as tk
from datetime import datetime
from collections import deque
from config import Config
from logger_config import get_logger
import threading

logger = get_logger(__name__)

# Set appearance and color theme
ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class TranscriptionDisplay:
    """Modern Desktop GUI for live transcription."""
    
    def __init__(self):
        """Initialize the GUI window."""
        logger.info("Initializing display module")
        self.transcriptions = deque(maxlen=Config.MAX_DISPLAY_LINES)
        self.current_text = ""
        self.status = "Initializing..."
        self.chunks_processed = 0
        self.avg_latency = 0.0
        self.current_latency = 0.0
        self.root = None
        self._lock = threading.Lock()  # Thread safety for UI updates
        
    def _setup_ui(self):
        """Setup the window layout."""
        try:
            logger.info("Setting up UI components")
            self.root = ctk.CTk()
            self.root.title("System Audio Live STT")
            self.root.geometry("800x600")
            
            # Configure grid
            self.root.grid_columnconfigure(0, weight=1)
            self.root.grid_rowconfigure(1, weight=1)
            
            # --- Header Section (Metrics) ---
            header_frame = ctk.CTkFrame(self.root, corner_radius=10)
            header_frame.grid(row=0, column=0, padx=20, pady=(20, 10), sticky="ew")
            header_frame.grid_columnconfigure((0, 1, 2, 3), weight=1)
            
            self.status_label = ctk.CTkLabel(header_frame, text=f"Status: {self.status}", font=("Inter", 14, "bold"))
            self.status_label.grid(row=0, column=0, padx=10, pady=10)
            
            self.latency_label = ctk.CTkLabel(header_frame, text="Live: 0.00s", font=("Inter", 13))
            self.latency_label.grid(row=0, column=1, padx=10, pady=10)
            
            self.avg_latency_label = ctk.CTkLabel(header_frame, text="Avg: 0.00s", font=("Inter", 13))
            self.avg_latency_label.grid(row=0, column=2, padx=10, pady=10)
            
            self.processed_label = ctk.CTkLabel(header_frame, text="Done: 0", font=("Inter", 13))
            self.processed_label.grid(row=0, column=3, padx=10, pady=10)
            
            # --- Main Transcription Area ---
            text_frame = ctk.CTkFrame(self.root, corner_radius=10)
            text_frame.grid(row=1, column=0, padx=20, pady=10, sticky="nsew")
            text_frame.grid_columnconfigure(0, weight=1)
            text_frame.grid_rowconfigure(0, weight=1)
            
            self.text_area = ctk.CTkTextbox(text_frame, font=("Inter", 15), corner_radius=10, wrap="word", state="disabled")
            self.text_area.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")
            
            # --- Live Feed (The "Green Box" equivalent) ---
            self.live_label = ctk.CTkLabel(
                self.root, 
                text="Waiting for audio...", 
                font=("Inter", 14, "italic"),
                text_color="#4ade80",
                fg_color="#18181b",
                corner_radius=8,
                padx=15,
                pady=10
            )
            self.live_label.grid(row=2, column=0, padx=20, pady=(10, 20), sticky="ew")
            
            logger.info("UI setup completed successfully")
            
        except Exception as e:
            logger.error(f"Error setting up UI: {e}", exc_info=True)
            raise

    def start(self):
        """Start the GUI main loop."""
        try:
            if self.root is None:
                self._setup_ui()
            logger.info("Starting GUI mainloop")
            self.root.mainloop()
        except Exception as e:
            logger.error(f"Error in GUI mainloop: {e}", exc_info=True)
            raise
        
    def stop(self):
        """Stop the GUI."""
        if self.root:
            logger.info("Stopping GUI")
            try:
                self.root.destroy()
            except Exception as e:
                logger.error(f"Error stopping GUI: {e}")
            
    def update_status(self, status: str):
        """Update status message in the GUI thread.
        
        Args:
            status: Status message to display
        """
        with self._lock:
            self.status = status
            
        if self.root and hasattr(self, 'status_label'):
            try:
                self.root.after(0, lambda: self.status_label.configure(text=f"Status: {status}"))
            except Exception as e:
                logger.debug(f"Could not update status: {e}")
        
    def update_transcription(self, text, latency=None, timestamp=None, is_final=False):
        """Update transcription in the GUI thread."""
        if not text and not is_final:
            return
            
        if self.root is None: return

        # Schedule updates on the main thread
        self.root.after(0, lambda: self._perform_update(text, latency, timestamp, is_final))
        
    def _perform_update(self, text, latency, timestamp, is_final):
        """Perform the actual UI update (must be on main thread)."""
        if is_final:
            time_str = datetime.now().strftime("%H:%M:%S")
            if timestamp:
                dt = datetime.fromtimestamp(timestamp)
                time_str = dt.strftime("%H:%M:%S")
            
            # Add to main text area (Enable -> Insert -> Disable)
            self.text_area.configure(state="normal")
            self.text_area.insert("end", f"[{time_str}] ", "time_style")
            self.text_area.insert("end", f"{text}\n\n")
            self.text_area.configure(state="disabled")
            self.text_area.see("end")
            
            # Clear live feed
            self.live_label.configure(text="Listening...", font=("Inter", 14, "italic"))
            self.current_text = ""
        else:
            self.current_text = text
            # Update live feed label
            display_text = text
            if len(text) > 200:
                display_text = "... " + text[-197:]
            self.live_label.configure(text=f"{display_text}", font=("Inter", 14, "bold"))
            
        # Update metrics
        if latency:
            self.current_latency = latency
            self.chunks_processed += 1
            self.avg_latency = (
                (self.avg_latency * (self.chunks_processed - 1) + latency) 
                / (self.chunks_processed or 1)
            )
            
            # Update UI labels
            self.latency_label.configure(text=f"Live: {self.current_latency:.2f}s")
            self.avg_latency_label.configure(text=f"Avg: {self.avg_latency:.2f}s")
            self.processed_label.configure(text=f"Done: {self.chunks_processed}")

    def show_welcome(self):
        """Handled by the initial UI state."""
        pass
        
    def show_goodbye(self):
        """Optionally show a popup or change status."""
        self.update_status("Session Complete")
