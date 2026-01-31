# BuzzBuzzGPTs Installation Guide

## System Requirements

- **Operating System:** Windows 10 or Windows 11 (64-bit)
- **RAM:** 4 GB minimum, 8 GB recommended
- **Disk Space:** 500 MB free space
- **Display:** 1920x1080 or higher recommended
- **.NET Framework:** Not required (standalone application)

## Download

1. Download `BuzzBuzzGPTs-Setup-1.0.0.exe` from the official website
2. File size: ~200 MB (includes Chromium engine for AI integration)
3. Verify SHA256 checksum (see bottom of this guide)

## Installation Steps

### Step 1: Run the Installer

Double-click `BuzzBuzzGPTs-Setup-1.0.0.exe` to start installation.

### Step 2: Bypass Windows SmartScreen (Important!)

**Why does this happen?**
BuzzBuzzGPTs is not digitally signed with an expensive code signing certificate (~$300/year). This is normal for open-source applications and doesn't mean the software is unsafe.

**You will see this warning:**

```
Windows protected your PC
Microsoft Defender SmartScreen prevented an unrecognized app from starting.
Running this app might put your PC at risk.

App: BuzzBuzzGPTs-Setup-1.0.0.exe
Publisher: Unknown publisher
```

**How to proceed safely:**

1. ✅ **Click "More info"** (small text link on the warning dialog)
2. ✅ **Click "Run anyway"** button (will appear after step 1)
3. ✅ The installer will now start

**Visual Guide:**

```
┌─────────────────────────────────────────┐
│ Windows protected your PC               │
│                                         │
│ Microsoft Defender SmartScreen          │
│ prevented an unrecognized app...        │
│                                         │
│ [More info] ← CLICK HERE FIRST          │
│                                         │
└─────────────────────────────────────────┘
            ↓ After clicking
┌─────────────────────────────────────────┐
│ Windows protected your PC               │
│                                         │
│ App: BuzzBuzzGPTs-Setup-1.0.0.exe         │
│ Publisher: Unknown publisher            │
│                                         │
│        [Run anyway] ← THEN CLICK HERE   │
│        [Don't run]                      │
└─────────────────────────────────────────┘
```

### Step 3: Choose Installation Location

1. The installer will ask where to install BuzzBuzzGPTs
2. Default location: `C:\Program Files\BuzzBuzzGPTs\`
3. You can change this if desired
4. Click **Next** to continue

### Step 4: Choose Shortcuts

The installer will offer to create:
- ✅ Desktop shortcut (recommended)
- ✅ Start Menu shortcut (recommended)

Check the boxes you prefer and click **Install**.

### Step 5: Wait for Installation

Installation typically takes 1-2 minutes. The progress bar will show:
- Extracting files
- Creating shortcuts
- Registering application

### Step 6: Launch BuzzBuzzGPTs

After installation completes:
1. Click **Finish** (keep "Launch BuzzBuzzGPTs" checked)
2. Or find "BuzzBuzzGPTs" in your Start Menu
3. Or double-click the Desktop shortcut

## First Run Setup

### Choose Your AI Service

On first launch, you'll see the AI service selector:
1. **ChatGPT** - Most popular, requires OpenAI account
2. **Claude** - Anthropic's AI, requires account
3. **Gemini** - Google's AI, requires Google account
4. **Perplexity** - AI with web search capabilities

Click the service you want to use.

### Configure API Keys (Optional)

For voice transcription, you'll need an OpenAI API key:
1. Click Settings ⚙️
2. Click API Key button next to "OpenAI"
3. Paste your API key
4. Click Save

Get your API key: https://platform.openai.com/api-keys

### Learn the Features

Click **Settings** → **Tutorial** for an interactive walkthrough of:
- Dragging the window
- Taking screenshots (Ctrl+H)
- Voice transcription (Ctrl+R)
- Keyboard shortcuts

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Screenshot | `Ctrl + H` |
| Voice Input | `Ctrl + R` |
| Show/Hide | `Ctrl + B` |
| Ask AI | `Ctrl + Enter` |
| Start Over | `Ctrl + G` |
| Move Window | `Ctrl + Arrow Keys` |

## Troubleshooting

### Installer Won't Run

**Problem:** Double-clicking does nothing

**Solution:**
- Right-click the installer → "Run as administrator"
- Check Windows Security settings → App & browser control
- Temporarily disable antivirus (some flag unsigned apps)

### SmartScreen Won't Let Me Bypass

**Problem:** No "More info" link appears

**Solution:**
1. Right-click the installer → Properties
2. Check "Unblock" box at bottom
3. Click Apply → OK
4. Try running again

### Installation Fails Midway

**Problem:** Installation stops at X%

**Solution:**
- Ensure you have 500 MB free disk space
- Close other programs
- Disable antivirus temporarily
- Run installer as administrator
- Check Windows Event Viewer for errors

### App Won't Start After Installation

**Problem:** Nothing happens when clicking shortcut

**Solution:**
- Check if process is running (Task Manager → Details → BuzzBuzzGPTs.exe)
- Try running from: `C:\Program Files\BuzzBuzzGPTs\BuzzBuzzGPTs.exe`
- Check antivirus quarantine
- Reinstall the application

### Voice Transcription Not Working

**Problem:** Clicking Voice button does nothing

**Solution:**
- Add OpenAI API key in Settings
- Check your API key has credits
- Verify microphone permissions in Windows
- Test microphone in other apps first

## Uninstallation

### Method 1: Windows Settings
1. Open Windows Settings
2. Go to Apps → Installed apps
3. Find "BuzzBuzzGPTs"
4. Click three dots (•••) → Uninstall
5. Follow the uninstaller wizard

### Method 2: Control Panel
1. Open Control Panel
2. Programs → Programs and Features
3. Find "BuzzBuzzGPTs"
4. Right-click → Uninstall
5. Follow the uninstaller wizard

### What Gets Removed
- ✅ Application files
- ✅ Desktop shortcut
- ✅ Start Menu shortcut
- ❌ Settings and API keys (kept in `%APPDATA%\BuzzBuzzGPTs`)

To fully remove settings:
```
C:\Users\YourName\AppData\Roaming\BuzzBuzzGPTs
```

## Security & Privacy

### Is BuzzBuzzGPTs Safe?

✅ **Open Source** - Full source code available on GitHub
✅ **No Telemetry** - Doesn't track or send user data
✅ **Local First** - Runs entirely on your computer
✅ **Your API Keys** - Stored locally, never shared

### Why Isn't It Signed?

Code signing certificates cost $100-300/year. As an open-source project, we chose to keep the software free rather than charging to cover certificate costs.

### Can I Trust This?

- View the source code on GitHub
- Verify the SHA256 checksum (see below)
- Scan the installer with VirusTotal
- Build from source yourself

## File Verification

### SHA256 Checksum

Verify your download hasn't been tampered with:

```
Expected: dc811c04419143fb99b1444c6e109470d0d0ff30331468baaea674647e7835b5
```

**To verify in PowerShell:**
```powershell
Get-FileHash "BuzzBuzzGPTs-Setup-1.0.0.exe" -Algorithm SHA256
```

The output should match the checksum above.

**To verify in Command Prompt:**
```cmd
certutil -hashfile "BuzzBuzzGPTs-Setup-1.0.0.exe" SHA256
```

## Getting Help

- **GitHub Issues:** https://github.com/yourusername/buzzbuzzgpts/issues
- **Documentation:** https://github.com/yourusername/buzzbuzzgpts/wiki
- **Tutorial:** Built into the app (Settings → Tutorial)

## Updates

BuzzBuzzGPTs does not have automatic updates. To update:

1. Download the latest installer
2. Run it (will upgrade existing installation)
3. Your settings and API keys are preserved

## License

BuzzBuzzGPTs is released under the MIT License. You're free to use, modify, and distribute it!

---

**Still Having Issues?**

Open an issue on GitHub with:
- Windows version
- Error messages (screenshots help!)
- What you were trying to do
- Steps to reproduce the problem
