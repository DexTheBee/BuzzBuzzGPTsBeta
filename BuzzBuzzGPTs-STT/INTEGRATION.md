# Integration Guide: BuzzBuzzGPTs-STT

This guide explains how to integrate the live transcription components into your other project.

## 1. Setup

### Files to Copy
Copy these files into your target project:
- `audio_capture.py` (Core audio loop)
- `transcriber.py` (Whisper processing)
- `config.py` (Global settings)
- `utils.py` (Crucial NumPy 2.0 fixes)
- `requirements.txt` (Pinned dependencies)

### Installation
```bash
pip install -r requirements.txt
```

## 2. Library Usage

You can use the STT system without the GUI. Here is a minimal implementation:

```python
import queue
from audio_capture import AudioCapture
from transcriber import WhisperTranscriber
from utils import apply_patches

# 1. Apply compatibility patches (MANDATORY for Python 3.13+)
apply_patches()

def on_text(text, latency, timestamp, is_final):
    if is_final:
        print(f"DONE: {text}")
    else:
        print(f"LIVE: {text}", end="\r")

# 2. Setup Queue and Components
audio_queue = queue.Queue(maxsize=5)
capture = AudioCapture(audio_queue)
transcriber = WhisperTranscriber(audio_queue, on_text)

# 3. Start
transcriber.start()  # Starts Whisper thread
capture.start()      # Starts Audio loop + Hot-swap monitor

try:
    while True:
        # Your main app logic here
        pass
except KeyboardInterrupt:
    # 4. Clean Shutdown
    capture.stop()
    transcriber.stop()
```

## 3. Production Checklist (A-Grade)

- [x] **Locked Versions**: Always use the pinned versions in `requirements.txt`.
- [x] **Hot-Swapping**: Enabled by default in `AudioCapture`.
- [x] **NumPy Patch**: Ensure `apply_patches()` is called as early as possible.
- [x] **Thread Safe**: The `VoiceTranscriptionManager` is thread-safe for UI button rapid-firing.

## 4. Voice Button Integration (Easiest Method)

If you are building a "Voice Button", use the `VoiceTranscriptionManager` class for the cleanest implementation.

```python
from voice_button_example import VoiceTranscriptionManager

# 1. State callback (what happens with the text)
def my_output_function(text, latency, timestamp, is_final):
    if is_final:
        print(f"Final: {text}")
    else:
        print(f"Live: {text}")

# 2. Initialize once
vt_manager = VoiceTranscriptionManager(on_text_callback=my_output_function)

# 3. Link to your button
def on_voice_button_click():
    if not vt_manager.is_recording:
        vt_manager.start_recording()
        # Update button UI to 'Stop'
    else:
        vt_manager.stop_recording()
        # Update button UI to 'Start'
```

## 5. Customizing Latency
Adjust these in `config.py`:
- `CHUNK_DURATION`: Lower (e.g., `0.4`) for faster UI feedback.
- `WHISPER_MODEL`: Use `tiny.en` for speed, `base` for balance.
