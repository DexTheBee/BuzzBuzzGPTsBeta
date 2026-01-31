# 🕶️ Always-On Stealth Mode

## What is Always-On Stealth Mode?

The app is **permanently invisible** in screen sharing and recordings, but **always visible on your local screen**.

## How It Works

### 🎯 Core Technology:

1. **Windows Display Affinity** (`WDA_EXCLUDEFROMCAPTURE`)
   - Uses Windows 10 2004+ API
   - Excludes window from all screen capture
   - Works with Zoom, Teams, Meet, OBS, etc.

2. **Content Protection**
   - Electron's `setContentProtection(true)`
   - Platform-native capture prevention
   - Automatic and always active

3. **Local Visibility**
   - Window is fully visible on YOUR screen
   - Full opacity and interactivity
   - No transparency or click-through

## What You'll See vs Others

| What You See | What Others See (Screen Share) |
|--------------|--------------------------------|
| ✅ Full toolbar visible | ❌ Completely invisible |
| ✅ All buttons work | ❌ Nothing appears |
| ✅ Settings panel | ❌ No trace |
| ✅ Response panel | ❌ Can't be captured |

## Platform Support

### ✅ Windows 10 (2004+) / Windows 11
- **Full Support**: Window is completely hidden from screen capture
- Works with: Zoom, Teams, Google Meet, OBS, screen recording software

### ⚠️ Windows 10 (older versions)
- **Partial Support**: Basic content protection only
- May be partially visible in some capture tools

### ❌ macOS / Linux
- **Limited**: Electron content protection only
- Window may be partially visible in screen shares

## Verification

### How to Test if Stealth Mode is Working:

1. **Open the app** - You should see it normally
2. **Look for 🕶️ indicator** - Top right, pulsing blue glow
3. **Start a screen share** (Zoom/Meet test)
4. **Check if visible** to the other person/recording

### Expected Behavior:

- ✅ **Console message**: "Advanced stealth mode enabled"
- ✅ **Blue pulsing icon**: 🕶️ in toolbar
- ✅ **Invisible in screen share**: Others can't see it
- ✅ **Visible to you**: You see it normally

## Technical Details

### Windows Implementation:

```javascript
// Sets WDA_EXCLUDEFROMCAPTURE flag
SetWindowDisplayAffinity(hwnd, 0x00000011);

// Electron content protection
mainWindow.setContentProtection(true);
```

### What Gets Hidden:

- ✅ Window contents
- ✅ Toolbar
- ✅ Settings dropdown
- ✅ Response panel
- ✅ All UI elements

### What Stays Visible (to you):

- ✅ Everything! Normal operation
- ✅ Full interactivity
- ✅ No performance impact

## Limitations

### Known Issues:

1. **Requires Windows 10 2004+** for full stealth
   - Older versions: limited protection
   - Check: `winver` to see your version

2. **Some capture tools** may bypass protection
   - Hardware capture cards
   - HDMI recorders
   - Phone cameras pointing at screen

3. **Window frame** may be partially visible
   - Border/shadow might show
   - Content is always hidden

### Workarounds:

- Keep window at edge of screen
- Use borderless mode (already default)
- Position strategically

## Troubleshooting

**Problem**: App is visible in screen share

**Solutions**:
1. Check Windows version (need 2004+)
2. Look for console message: "Advanced stealth mode enabled"
3. Restart app
4. Try different screen share platform

**Problem**: Can't see the app at all

**Solution**: 
- This shouldn't happen - app is always visible locally
- Press `Ctrl + B` to show/hide
- Check if minimized

**Problem**: 🕶️ indicator not showing

**Solution**:
- Indicator is always there (top-right)
- If missing, stealth mode still works
- Check console for "Advanced stealth mode" message

## Best Practices

1. **Test First**: Start a test meeting to verify
2. **Know Limitations**: Understand platform requirements
3. **Use Responsibly**: Follow all applicable rules
4. **Strategic Positioning**: Keep app at screen edge
5. **Have Backup Plan**: Don't rely 100% on stealth

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + B` | Show/Hide Window |
| `Ctrl + H` | Take Screenshot |
| `Ctrl + Enter` | Solve Problem |
| `Ctrl + G` | Start Over |

Note: No toggle for stealth - it's **always on** automatically.

## Disclaimer

⚠️ **Important**: This tool is for **legitimate practice and preparation** only.

- Follow your company's policies
- Respect interview guidelines  
- Maintain academic integrity
- Comply with local laws

**Use ethically and responsibly.**

---

**Version**: 2.0.0 (Always-On Stealth)  
**Requirements**: Windows 10 (2004+) or Windows 11  
**Last Updated**: 2026-01-21
