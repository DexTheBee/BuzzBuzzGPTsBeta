# 🎤 System Audio Capture

## Overview

System Audio Capture allows BuzzBuzzGPTs to record **both your voice AND the interviewer's voice** from video conferencing apps like Zoom, Microsoft Teams, and Google Meet. This gives your AI assistant full context of the conversation, not just your responses.

## How It Works

### Technical Implementation

1. **Microphone Capture**: Records your voice using `getUserMedia()`
2. **System Audio Capture**: Records desktop audio (interviewer's voice) using `getDisplayMedia()`
3. **Audio Mixing**: Both streams are mixed together using Web Audio API's `AudioContext`
4. **Transcription**: The combined audio is sent to OpenAI Whisper API for transcription

### Features

✅ Captures interviewer's voice in real-time  
✅ Mixes microphone + system audio seamlessly  
✅ Works with Zoom, Teams, Google Meet, and more  
✅ Fallback to microphone-only if system audio fails  
✅ Easy toggle in settings  

## Usage Instructions

### 1. Enable System Audio Capture

1. Click the **Settings** ⚙️ button in the toolbar
2. Find **"Capture System Audio (Interviewer's Voice)"**
3. Check the checkbox to enable
4. The setting is saved automatically

### 2. Start Recording

1. Join your interview (Zoom/Teams/Meet)
2. Click **"Start Interview"** in BuzzBuzzGPTs
3. Select your AI assistant (ChatGPT, Gemini, etc.)
4. Click the **Voice** button (🎤) to start recording

### 3. Grant Permissions

When system audio is enabled, you'll see **TWO permission prompts**:

#### Prompt 1: Microphone Access
- Click **"Allow"** to grant microphone access
- This captures your voice

#### Prompt 2: Screen Share with Audio
- Select the **window or tab** with your interview
- ⚠️ **IMPORTANT**: Check **"Share audio"** or **"Share tab audio"** at the bottom
- Click **"Share"**
- This captures the interviewer's voice

### 4. Recording Indicator

When recording with system audio enabled, you'll see:
```
🎤 Recording: Microphone + System Audio
```

## Browser Compatibility

### ✅ Supported (Chrome/Electron)
- Windows 10/11
- Captures system audio via `getDisplayMedia()` API
- Works with all video conferencing apps

### ⚠️ Limitations
- **First-time setup**: You must grant screen share permissions each session
- **Tab audio**: When sharing a tab, ensure "Share tab audio" is checked
- **Fallback**: If system audio fails, recording continues with microphone only

## Troubleshooting

### No Interviewer Voice in Transcription

**Problem**: Only your voice is transcribed, not the interviewer's

**Solutions**:
1. Check if system audio toggle is **enabled** in settings
2. When sharing screen, ensure **"Share audio"** checkbox is selected
3. Select the correct **tab or window** with the interview
4. Restart the recording after granting permissions

### "Failed to capture system audio" Warning

This is normal! The app automatically falls back to microphone-only mode. To fix:

1. Click Voice button again
2. Select the correct window/tab
3. **Check "Share audio"** or "Share tab audio"
4. Click "Share"

### Audio Quality Issues

- Ensure good internet connection
- Check your microphone is working properly
- Test in a quiet environment
- Verify Zoom/Teams audio settings

## Privacy & Security

### What's Captured
- ✅ Your microphone audio
- ✅ System audio from selected tab/window (if enabled)
- ✅ Sent to OpenAI Whisper API for transcription

### What's NOT Captured
- ❌ Other tabs or applications (unless explicitly shared)
- ❌ Desktop notifications
- ❌ System sounds outside the selected window

### Data Handling
- Audio is transcribed in real-time
- Only text transcriptions are stored locally
- Audio blobs are temporary and discarded after transcription
- Your OpenAI API key is stored locally only

## Comparison with Competitors

| Feature | BuzzBuzzGPTs | WhisprGPT | InterviewCoder |
|---------|-----------|-----------|----------------|
| Microphone Capture | ✅ | ✅ | ✅ |
| System Audio Capture | ✅ | ✅ | ✅ |
| Audio Mixing | ✅ | ✅ | ✅ |
| Easy Toggle | ✅ | ❓ | ❓ |
| Fallback Mode | ✅ | ❓ | ❓ |

## Technical Details

### Audio Context Setup

```javascript
// Create audio context
audioContext = new AudioContext();

// Create sources
const micSource = audioContext.createMediaStreamSource(micStream);
const systemSource = audioContext.createMediaStreamSource(systemStream);

// Create destination
const destination = audioContext.createMediaStreamDestination();

// Mix both sources
micSource.connect(destination);
systemSource.connect(destination);

// Record mixed stream
const mixedStream = destination.stream;
```

### Stream Management

- Microphone stream: Persistent during recording
- System stream: Persistent during recording
- Audio context: Created on recording start, closed on stop
- All tracks properly cleaned up on stop

## Future Enhancements

🔮 Planned features:
- [ ] Separate volume controls for mic/system audio
- [ ] Audio visualization (waveform)
- [ ] Speaker diarization (who said what)
- [ ] Automatic switching between speakers
- [ ] Real-time transcript display

## Support

Having issues? Check:
1. Browser/Electron version (Chrome 74+)
2. Permissions granted properly
3. "Share audio" checked in screen share dialog
4. Internet connection stable
5. OpenAI API key valid

For more help, see the main README or open an issue.

---

**Note**: This feature requires Chrome 74+ / Electron 6+ for `getDisplayMedia()` audio support.
