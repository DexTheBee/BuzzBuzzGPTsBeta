# Quick Start: Distribute Your App

Follow these steps to build and distribute BuzzBuzzGPTs.

## Step 1: Create App Icon

1. Open `build/create-icon.html` in your browser
2. Screenshot the bee icon (256x256)
3. Go to https://icoconvert.com
4. Upload screenshot, select sizes: 16, 32, 48, 256
5. Download as `icon.ico`
6. Save to `build/icon.ico`

**Alternative:** Use any .ico file you want!

## Step 2: Update Your Info

Edit `package.json`:

```json
{
  "author": "Your Name <your.email@example.com>",
  "homepage": "https://your-website.com",
  "repository": {
    "url": "https://github.com/yourusername/BuzzBuzzGPTs.git"
  }
}
```

Update `win.publisherName` to your name/company.

## Step 3: Build the Installer

```bash
npm run build:win
```

**Wait:** First build takes 5-10 minutes (downloads Electron)

**Output:** `dist/BuzzBuzzGPTs Setup 1.0.0.exe` (~200 MB)

## Step 4: Test the Installer

1. Run `dist/BuzzBuzzGPTs Setup 1.0.0.exe`
2. Click "More info" → "Run anyway" (SmartScreen)
3. Install and test all features
4. Verify uninstall works

## Step 5: Generate Checksum

### PowerShell

```powershell
cd dist
Get-FileHash "BuzzBuzzGPTs Setup 1.0.0.exe" -Algorithm SHA256
```

### Command Prompt

```cmd
cd dist
certutil -hashfile "BuzzBuzzGPTs Setup 1.0.0.exe" SHA256
```

**Copy the hash!** Example:
```
SHA256: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f
```

## Step 6: Update Documentation

1. **INSTALL.md** - Add checksum to "File Verification" section
2. **Website/README** - Add download link and checksum
3. **GitHub Release** (if using) - Include checksum in release notes

## Step 7: Upload & Share

### Option A: Your Website

1. Upload `BuzzBuzzGPTs Setup 1.0.0.exe` to your web server
2. Use the HTML template in `DISTRIBUTION.md`
3. Test the download link
4. Announce on social media!

### Option B: GitHub Releases

1. Go to your repo → Releases → New release
2. Tag: `v1.0.0`
3. Title: "BuzzBuzzGPTs v1.0.0 - Initial Release"
4. Upload the installer as an asset
5. Add release notes with checksum
6. Publish!

## Checklist for Each Release

- [ ] Icon created (`build/icon.ico`)
- [ ] Version updated in `package.json`
- [ ] Build successful (`npm run build:win`)
- [ ] Installer tested on Windows
- [ ] SHA256 checksum generated
- [ ] Documentation updated with checksum
- [ ] Installer uploaded to distribution server
- [ ] Download link tested
- [ ] Release announced

## Troubleshooting

**"icon.ico not found"**
- Create the icon first (Step 1)
- Or comment out icon in package.json temporarily

**Build fails**
- Run: `npm install`
- Delete `dist/` folder and try again
- Check `BUILD.md` for detailed troubleshooting

**SmartScreen blocks installer**
- This is normal for unsigned apps
- Users click "More info" → "Run anyway"
- See `INSTALL.md` for full instructions

## Files You Created

✅ **Installer:** `dist/BuzzBuzzGPTs Setup 1.0.0.exe`

✅ **Documentation:**
- `INSTALL.md` - User installation guide
- `BUILD.md` - Developer build guide
- `DISTRIBUTION.md` - Distribution strategies
- `LICENSE` - MIT License

✅ **Configuration:**
- `package.json` - Enhanced build config
- `build/icon.ico` - App icon
- `build/README-ICON.md` - Icon creation guide

## Next Version

When releasing v1.0.1:

1. Update version in `package.json`: `"version": "1.0.1"`
2. Rebuild: `npm run build:win`
3. Generate new checksum
4. Update docs
5. Upload new installer

## Need Help?

- **Detailed build guide:** See `BUILD.md`
- **Distribution strategies:** See `DISTRIBUTION.md`
- **User installation:** See `INSTALL.md`
- **Icon creation:** See `build/README-ICON.md`

## Success! 🎉

Your app is ready for distribution. Users can now:

1. Download the installer
2. Install BuzzBuzzGPTs
3. Use all the amazing features you built!

**Share your creation** and help others succeed in their interviews!
