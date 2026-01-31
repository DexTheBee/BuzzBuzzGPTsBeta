# Audio Echo Fix - System Audio Capture

## Problem
When using "Capture System Audio (Interviewer's Voice)" feature, you may hear an echo effect. This happens because audio can create feedback loops between your microphone and speakers.

## What Was Fixed

### 1. **Fixed System Audio Capture** ✅
- **Fixed browser requirement**: `getDisplayMedia()` requires `video: true` (cannot be false)
- Request video track but immediately stop and remove it (we only want audio)
- This matches browser security requirements while still capturing system audio

### 2. **Improved Audio Routing** ✅
- Added `suppressLocalAudioPlayback: true` to system audio capture
- Implemented **isolated audio processing** - audio is NEVER sent to your speakers
- Added gain nodes for better audio mixing control
- Ensured `AudioContext.destination` (speakers) is never connected

### 2. **Prevented Feedback Loops** ✅
- Microphone audio only goes to transcription, NOT to speakers
- System audio is mixed separately without looping back
- Reduced system audio gain slightly (0.8) to minimize any residual feedback

### 3. **Enhanced Echo Cancellation** ✅
- Microphone uses `echoCancellation: true`
- Noise suppression and auto gain control enabled on mic
- System audio keeps echo cancellation OFF (we want to capture interviewer clearly)

## How to Fix Remaining Echo (Windows Settings)

Even with the code fixes, Windows might still be playing your mic through speakers. Run this helper script:

```powershell
.\fix-audio-echo.ps1
```

Or manually:

1. Right-click the **speaker icon** in Windows taskbar
2. Select **"Sounds"** or **"Sound settings" → "Sound Control Panel"**
3. Go to **"Recording"** tab
4. Double-click your **Microphone**
5. Go to **"Listen"** tab
6. **UNCHECK** "Listen to this device"
7. Click **Apply** → **OK**

## Testing Steps

1. **Enable System Audio Capture** in BuzzBuzzGPTs settings
2. **Use headphones** (recommended) or speakers
3. Click the **Voice button**
4. Speak normally - you should **NOT** hear your voice echoing back
5. Play a video/audio - it should be captured along with your mic

## Recommended Setup

### For Interview Recording:
- ✅ **Use headphones** (prevents any speaker feedback)
- ✅ Enable "Capture System Audio"
- ✅ Make sure "Listen to this device" is OFF in Windows

### For Personal Use:
- ✅ **Speakers are OK** if "Listen to this device" is disabled
- ✅ Keep system audio OFF if you don't need to capture other audio
- ✅ Just use microphone-only mode

## Technical Details

### Audio Flow (No Echo):
```
Microphone → AudioContext → GainNode → MediaStreamDestination → WhisperLive
                                         (isolated, no speaker output)

System Audio → AudioContext → GainNode → MediaStreamDestination → WhisperLive
                                           (isolated, no speaker output)
```

### Why This Prevents Echo:
- **MediaStreamDestination** creates an isolated stream for processing
- Stream is ONLY used for transcription (WhisperLive or OpenAI API)
- Audio is NEVER connected to `AudioContext.destination` (which routes to speakers)
- `suppressLocalAudioPlayback` tells the browser to prevent tab audio playback during capture

## Troubleshooting

### Still hearing echo?
1. Check Windows "Listen to this device" is OFF (see above)
2. Make sure you're using **headphones**
3. Check if any other app is monitoring/playing back your mic
4. Try lowering your speaker volume

### System audio not capturing?
1. Make sure you're capturing the correct audio source (e.g., Chrome tab, Zoom window)
2. Grant permission when the browser asks to capture screen/audio
3. Check that the app you want to capture has audio playing

### Audio quality issues?
- Mic gain: 1.0 (100%)
- System audio gain: 0.8 (80%)
- Adjust these values in `renderer.js` if needed:
  ```javascript
  micGain.gain.value = 1.0;      // Change this value
  systemGain.gain.value = 0.8;   // Change this value
  ```

## Summary

✅ Code has been updated to prevent audio feedback loops
✅ Audio is isolated and never plays through speakers
✅ Windows "Listen to this device" should be disabled
✅ Use headphones for best results with system audio capture

The echo issue should now be completely resolved! 🎉
