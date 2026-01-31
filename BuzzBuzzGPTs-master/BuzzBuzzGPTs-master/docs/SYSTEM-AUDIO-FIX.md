# System Audio Capture Fix

## Problem
System audio capture was failing with error:
```
Failed to execute 'getDisplayMedia' on 'MediaDevices': video must be requested
```

## Root Cause
- **Chrome Extension API** (`chrome.tabCapture.capture()`) allows `video: false` for audio-only capture
- **Regular Web/Electron apps** must use `getDisplayMedia()` which **requires `video: true`**
- This is a browser security requirement

## How WhisperLive Does It
WhisperLive uses the Chrome Extension API:
```javascript
chrome.tabCapture.capture({
  audio: true,
  video: false  // ✅ Works in extensions!
}, (stream) => {
  // handle stream
});
```

## How BuzzBuzzGPTs Fixed It
BuzzBuzzGPTs is an Electron app (not an extension), so we use `getDisplayMedia()`:

```javascript
// Request BOTH video and audio (browser requirement)
systemStream = await navigator.mediaDevices.getDisplayMedia({
  video: {
    displaySurface: 'monitor'
  },
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    suppressLocalAudioPlayback: true
  }
});

// Immediately stop and remove video track (we only want audio!)
const videoTracks = systemStream.getVideoTracks();
videoTracks.forEach(track => {
  track.stop();
  systemStream.removeTrack(track);
});

// Now systemStream only has audio track
```

## What This Means for Users

### When you enable System Audio Capture:

1. **Browser will show a screen picker** - this is normal
2. **Video preview will appear** - don't worry, video is immediately discarded
3. **Select the window/tab with audio** (e.g., Zoom call, YouTube)
4. **Check "Share audio"** in the dialog
5. **Only audio is captured** for transcription (no video is used or stored)

### Best Practices:
- ✅ Use **headphones** to prevent feedback loops
- ✅ Select the specific **window with audio** (not entire screen unless needed)
- ✅ Make sure **"Share audio"** is checked in the dialog
- ✅ The video track is automatically stopped - no video data is captured

## Technical Details

### Audio Flow:
```
User clicks Voice button
  ↓
Microphone requested (audio only)
  ↓
If "System Audio" enabled:
  → Browser shows screen picker (WITH video)
  → User selects window/tab
  → Stream captured WITH video track
  → Video track immediately stopped & removed
  → Only audio track remains
  ↓
Both mic + system audio → AudioContext → Mixed → WhisperLive
  ↓
Transcription appears in AI chatbox
```

### Why This Works:
- Browser enforces `video: true` for `getDisplayMedia()` (security policy)
- We comply by requesting video
- We immediately discard the video track
- Only audio is processed for transcription
- No video data is ever stored or transmitted

## Comparison: Extension vs Electron App

| Feature | Chrome Extension (WhisperLive) | Electron App (BuzzBuzzGPTs) |
|---------|-------------------------------|---------------------------|
| API | `chrome.tabCapture.capture()` | `navigator.mediaDevices.getDisplayMedia()` |
| Audio-only | ✅ `video: false` allowed | ❌ Must request `video: true` |
| Solution | Direct audio capture | Request video, discard immediately |
| User Experience | No video picker shown | Video picker shown (normal) |
| Privacy | Audio only | Audio only (video discarded) |

## Summary

✅ **Fixed**: System audio capture now works by requesting video (browser requirement) then discarding it
✅ **Privacy**: No video is ever used - only audio for transcription
✅ **User Experience**: Users will see video picker but can ignore it - only audio is captured
✅ **Echo Prevention**: Isolated audio processing prevents feedback loops

The fix ensures compliance with browser security policies while achieving the same result as WhisperLive's Chrome extension! 🎉
