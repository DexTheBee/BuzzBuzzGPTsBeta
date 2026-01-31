# Building BuzzBuzzGPTs for Distribution

This guide explains how to build BuzzBuzzGPTs as a Windows installer for distribution.

## Prerequisites

1. **Node.js & npm** installed (v16 or higher)
2. **All dependencies installed:**
   ```bash
   npm install
   ```
3. **App icon created:** `build/icon.ico` (see `build/README-ICON.md`)

## Quick Build

### Build Windows Installer

```bash
npm run build:win
```

**First build time:** 5-10 minutes (downloads electron binaries)

**Subsequent builds:** 2-3 minutes

**Output:** `dist/BuzzBuzzGPTs Setup 1.0.0.exe`

## Build Configuration

The build is configured in [`package.json`](package.json) under the `"build"` section.

### Key Configuration Options

**Product Name:**
```json
"productName": "BuzzBuzzGPTs"
```

**Version Number:**
```json
"version": "1.0.0"
```

**Icon:**
```json
"win": {
  "icon": "build/icon.ico"
}
```

**Installer Options:**
```json
"nsis": {
  "oneClick": false,
  "allowToChangeInstallationDirectory": true,
  "createDesktopShortcut": true,
  "createStartMenuShortcut": true
}
```

## Build Output

### Directory Structure

```
dist/
├── BuzzBuzzGPTs Setup 1.0.0.exe    # The installer (~200 MB)
├── win-unpacked/                # Unpacked app files (for testing)
│   ├── BuzzBuzzGPTs.exe
│   ├── resources/
│   └── ...
└── builder-debug.yml            # Build metadata
```

### Installer File Naming

Pattern: `{productName} Setup {version}.exe`

Examples:
- `BuzzBuzzGPTs Setup 1.0.0.exe`
- `BuzzBuzzGPTs Setup 1.1.0.exe`
- `BuzzBuzzGPTs Setup 2.0.0-beta.exe`

## Testing the Build

### Option 1: Test Unpacked Version (Fast)

```bash
# After building, run the unpacked version:
.\dist\win-unpacked\BuzzBuzzGPTs.exe
```

This skips installation and runs directly. Good for quick testing.

### Option 2: Test the Installer (Recommended)

1. Run `dist/BuzzBuzzGPTs Setup 1.0.0.exe`
2. Install to a test location
3. Test all features:
   - ✅ App launches
   - ✅ Settings work
   - ✅ Shortcuts work (Ctrl+H, Ctrl+R, etc.)
   - ✅ AI services load
   - ✅ Voice transcription (with API key)
   - ✅ Screenshot capture
   - ✅ Tutorial works
4. Test uninstall process

### Option 3: Test on Clean Windows VM

**Best practice** before distribution:

1. Create a Windows 10/11 VM (VirtualBox, VMware, etc.)
2. Install the app from the installer
3. Test as a fresh user would
4. Check for missing dependencies
5. Verify SmartScreen warnings work as documented

## Versioning Strategy

Update version in `package.json` before each release:

### Semantic Versioning

```
MAJOR.MINOR.PATCH

1.0.0  → Initial release
1.0.1  → Bug fixes
1.1.0  → New features
2.0.0  → Breaking changes
```

### Pre-release Versions

```json
"version": "1.1.0-beta.1"   // Beta releases
"version": "1.1.0-rc.1"     // Release candidates
```

## Distribution Checklist

Before distributing a new build:

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md` (if you have one)
- [ ] Test on clean Windows machine
- [ ] Generate SHA256 checksum
- [ ] Update website download page
- [ ] Update GitHub release (if applicable)
- [ ] Test download from distribution server
- [ ] Verify SmartScreen bypass instructions are clear

## Generate SHA256 Checksum

After building, generate a checksum for users to verify:

### PowerShell

```powershell
Get-FileHash "dist/BuzzBuzzGPTs Setup 1.0.0.exe" -Algorithm SHA256
```

### Command Prompt

```cmd
certutil -hashfile "dist\BuzzBuzzGPTs Setup 1.0.0.exe" SHA256
```

**Copy the output** and include it in:
- Website download page
- INSTALL.md
- GitHub release notes

## Troubleshooting Build Issues

### Error: "icon.ico not found"

**Solution:**
- Create the icon: See `build/README-ICON.md`
- Or temporarily comment out icon in package.json

### Error: "Cannot find module electron-builder"

**Solution:**
```bash
npm install --save-dev electron-builder
```

### Error: "EPERM: operation not permitted"

**Solution:**
- Close any running instances of the app
- Delete `dist/` folder and rebuild
- Run as administrator

### Build is Very Slow

**Causes:**
- First build downloads ~150 MB of Electron binaries
- Antivirus scanning files during build
- Limited disk I/O speed

**Solutions:**
- Add `dist/` and `node_modules/` to antivirus exclusions
- Use SSD for development
- Subsequent builds are much faster

### Installer File Size Too Large

**Normal size:** 150-200 MB (includes Chromium engine)

**Cannot reduce below ~100 MB** because:
- Electron includes full Chromium
- Required for webview functionality

This is expected for Electron apps.

## Advanced Build Options

### Build for Different Architectures

```bash
# 64-bit only (default)
npm run build:win

# 32-bit only
electron-builder --win --ia32

# Both architectures
electron-builder --win --x64 --ia32
```

### Portable Version (No Installation)

Update `package.json`:

```json
"win": {
  "target": [
    {
      "target": "portable",
      "arch": ["x64"]
    }
  ]
}
```

Creates a single `.exe` that runs without installation.

### ZIP Archive (For Manual Distribution)

```json
"win": {
  "target": ["zip"]
}
```

Creates `BuzzBuzzGPTs-1.0.0-win.zip` instead of installer.

## Code Signing (Optional)

To eliminate SmartScreen warnings, purchase a code signing certificate:

1. Buy certificate (~$100-300/year)
   - DigiCert
   - Sectigo
   - GlobalSign

2. Update `package.json`:
   ```json
   "win": {
     "certificateFile": "path/to/certificate.p12",
     "certificatePassword": "your-password",
     "verifyUpdateCodeSignature": true
   }
   ```

3. Rebuild

**Note:** Not required for open-source projects. Users can bypass SmartScreen.

## Continuous Integration (Optional)

### GitHub Actions Example

Create `.github/workflows/build.yml`:

```yaml
name: Build Windows App

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build:win
      - uses: actions/upload-artifact@v3
        with:
          name: windows-installer
          path: dist/*.exe
```

Automatically builds on version tags.

## Support

**Having build issues?**

1. Check the error message carefully
2. Try cleaning: `rm -rf dist node_modules && npm install`
3. Update dependencies: `npm update`
4. Check electron-builder docs: https://www.electron.build/

## Next Steps

After successful build:

1. Test the installer thoroughly
2. Generate checksum
3. Upload to distribution server
4. Update documentation with download link
5. Announce the release!
