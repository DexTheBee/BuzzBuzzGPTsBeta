# System Audio Live Speech-to-Text

A low-latency real-time transcription system that captures computer audio output (system audio) and transcribes it using OpenAI Whisper AI.

## Features

🎙️ **System Audio Capture** - Captures what your computer plays (loopback audio)  
🤖 **OpenAI Whisper** - State-of-the-art speech recognition  
⚡ **Low Latency** - Real-time transcription with 1-3 second latency  
🎨 **Beautiful Display** - Rich console interface with live updates  
🚀 **GPU Acceleration** - CUDA support for faster transcription  
🔇 **Voice Activity Detection** - Skips silent audio chunks  

## Requirements

- Python 3.8 or higher
- Windows OS (for soundcard loopback support)
- CUDA-capable GPU (optional, for better performance)

## Installation

1. **Clone or download this repository**

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

This will install:
- `openai-whisper` - Whisper transcription engine
- `torch` - PyTorch for Whisper
- `soundcard` - System audio capture
- `rich` - Beautiful console output
- Other supporting libraries

3. **Verify installation:**
```bash
python main.py --help
```

## Usage

### Basic Usage

Run with default settings (captures system audio, uses 'base' model):

```bash
python main.py
```

### List Available Audio Devices

```bash
python main.py --list-devices
```

### Specify Whisper Model

Choose from: `tiny`, `base`, `small`, `medium`, `large`

```bash
python main.py --model small
```

**Model Comparison:**
- `tiny` - Fastest, lowest accuracy (~39M params, ~1GB VRAM)
- `base` - Good balance (default, ~74M params, ~1GB VRAM)
- `small` - Better accuracy (~244M params, ~2GB VRAM)
- `medium` - High accuracy (~769M params, ~5GB VRAM)
- `large` - Best accuracy (~1550M params, ~10GB VRAM)

### Specify Language

```bash
python main.py --language en
```

Leave empty for auto-detection.

### Specify Audio Device

```bash
python main.py --device "Speakers (Realtek Audio)"
```

### Combined Example

```bash
python main.py --model small --language en
```

## Configuration

Edit `config.py` to customize:

- **Whisper Model**: Change `WHISPER_MODEL` (tiny/base/small/medium/large)
- **Chunk Duration**: Adjust `CHUNK_DURATION` for latency/accuracy tradeoff
- **VAD Threshold**: Tune `VAD_THRESHOLD` for voice detection sensitivity
- **Display Settings**: Toggle timestamps, metrics, max lines
- **GPU Settings**: Enable/disable CUDA, FP16

## How It Works

1. **Audio Capture**: Uses `soundcard` library to capture system loopback audio
2. **Buffering**: Audio is chunked into 2-second segments (configurable)
3. **Voice Detection**: Silent chunks are filtered out using RMS threshold
4. **Transcription**: Chunks are processed by Whisper model in real-time
5. **Display**: Transcribed text appears in a beautiful live console UI

## Performance Tips

### For Lower Latency:
- Use smaller models (`tiny` or `base`)
- Reduce `CHUNK_DURATION` to 1.0-1.5 seconds
- Enable GPU acceleration (set `USE_GPU = True`)
- Enable FP16 precision (`FP16 = True`)

### For Better Accuracy:
- Use larger models (`small`, `medium`, or `large`)
- Increase `CHUNK_DURATION` to 2.0-3.0 seconds
- Ensure audio quality is good
- Specify the correct language instead of auto-detect

### GPU Acceleration:
If you have an NVIDIA GPU with CUDA:
1. Install CUDA toolkit
2. Install PyTorch with CUDA support:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```
3. The app will automatically use GPU if available

## Troubleshooting

### No audio being captured:
- Check that audio is actually playing on your system
- Run `--list-devices` to see available devices
- Try specifying a device with `--device`
- Ensure `soundcard` library is installed correctly

### High latency:
- Use a smaller Whisper model
- Reduce chunk duration in `config.py`
- Enable GPU acceleration
- Close other resource-intensive applications

### "No module named 'soundcard'":
```bash
pip install soundcard
```

### CUDA out of memory:
- Use a smaller model
- Disable FP16 (`FP16 = False` in config.py)
- Reduce `BUFFER_SIZE`

### Poor transcription quality:
- Use a larger model
- Increase chunk duration
- Adjust VAD threshold
- Specify the correct language

## Stopping the Application

Press `Ctrl+C` to gracefully stop the application.

## Project Structure

```
CtrlClick-STT/
├── main.py              # Main application entry point
├── audio_capture.py     # System audio capture module
├── transcriber.py       # Whisper transcription module
├── display.py           # Rich console display
├── config.py            # Configuration settings
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## License

This project uses OpenAI Whisper which is released under the MIT License.

## Credits

- [OpenAI Whisper](https://github.com/openai/whisper) - Speech recognition model
- [soundcard](https://github.com/bastibe/SoundCard) - Audio I/O library
- [rich](https://github.com/Textualize/rich) - Terminal formatting

## Support

For issues or questions, please check:
1. This README's troubleshooting section
2. The configuration options in `config.py`
3. Try different Whisper models or settings

---

**Enjoy real-time transcription of your system audio!** 🎉
