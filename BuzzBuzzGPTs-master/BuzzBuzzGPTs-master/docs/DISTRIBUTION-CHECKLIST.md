# Distribution Checklist ✅

Use this checklist to track your progress from development to distribution.

## Pre-Build Setup

- [ ] **Create app icon** - Open `build/create-icon.html`, follow instructions, save to `build/icon.ico`
- [ ] **Update package.json** - Replace "Your Name", website URL, GitHub repo URL
- [ ] **Update publisher name** - In package.json: `win.publisherName`

## Build & Test

- [ ] **Run build script** - Execute `.\build-and-checksum.ps1` or `build-and-checksum.bat`
- [ ] **Verify build output** - Check that `dist/BuzzBuzzGPTs Setup 1.0.0.exe` exists
- [ ] **Check file size** - Should be ~200 MB
- [ ] **Note the checksum** - Copy from `dist/CHECKSUM-SHA256.txt`

## Testing

- [ ] **Install on test machine** - Run the installer
- [ ] **Bypass SmartScreen** - Click "More info" → "Run anyway"
- [ ] **Test app launch** - App should start successfully
- [ ] **Test all features:**
  - [ ] Settings panel opens
  - [ ] Tutorial works
  - [ ] Screenshot button exists (Ctrl+H)
  - [ ] Voice button exists (Ctrl+R)
  - [ ] AI service selector works
  - [ ] Keyboard shortcuts work
- [ ] **Test shortcuts:**
  - [ ] Desktop shortcut works
  - [ ] Start Menu shortcut works
- [ ] **Test uninstall** - Go to Windows Settings → Apps → Uninstall

## Documentation Updates

- [ ] **Update INSTALL.md** - Add your SHA256 checksum to "File Verification" section
- [ ] **Update download page** - Add checksum to `download-page-template.html`
- [ ] **Update README** - Add download link (after upload)
- [ ] **Create release notes** - Document what's new in v1.0.0

## Website Preparation

- [ ] **Customize download page** - Edit `download-page-template.html`:
  - [ ] Update all "yourusername" placeholders
  - [ ] Update links and URLs
  - [ ] Add your website branding
  - [ ] Add checksum
- [ ] **Test page locally** - Open in browser, check all links
- [ ] **Prepare file structure:**
  ```
  /downloads/
    └── BuzzBuzzGPTs-Setup-1.0.0.exe
  /install-guide/
    └── index.html (from INSTALL.md)
  ```

## Upload & Distribution

- [ ] **Upload installer** - Upload to your web server/hosting
- [ ] **Upload download page** - Upload customized HTML
- [ ] **Upload install guide** - Convert INSTALL.md to HTML or upload as is
- [ ] **Test download link** - Download from your website, verify it works
- [ ] **Verify checksum** - Run checksum on downloaded file, matches original

## GitHub (If Using)

- [ ] **Create git tag** - `git tag -a v1.0.0 -m "Initial release"`
- [ ] **Push tag** - `git push origin v1.0.0`
- [ ] **Create GitHub release:**
  - [ ] Select tag v1.0.0
  - [ ] Add title: "BuzzBuzzGPTs v1.0.0 - Initial Release"
  - [ ] Add release notes (see DISTRIBUTION.md for template)
  - [ ] Upload installer as asset
  - [ ] Include SHA256 checksum in description
  - [ ] Publish release

## Marketing & Announcement

- [ ] **Update main website** - Add download button/link
- [ ] **Write announcement post:**
  - [ ] Features list
  - [ ] Screenshots or GIF
  - [ ] Download link
  - [ ] Installation instructions
- [ ] **Share on social media:**
  - [ ] Twitter/X
  - [ ] LinkedIn
  - [ ] Reddit (r/software, r/productivity, etc.)
  - [ ] Your personal/company accounts
- [ ] **Post to communities:**
  - [ ] Hacker News
  - [ ] Product Hunt
  - [ ] Dev.to
  - [ ] Hashnode
- [ ] **Email announcement** - If you have a mailing list

## Post-Launch Setup

- [ ] **Monitor downloads** - Set up analytics if desired
- [ ] **Watch for issues** - Monitor GitHub Issues, email, social media
- [ ] **Prepare support responses:**
  - [ ] SmartScreen FAQ ready
  - [ ] Installation help ready
  - [ ] Link to INSTALL.md ready
- [ ] **Plan first update** - Start tracking bugs and feature requests

## Version Updates (For Future Releases)

When releasing v1.0.1, v1.1.0, etc.:

- [ ] **Update version** - Change `"version"` in package.json
- [ ] **Update changelog** - Document what changed
- [ ] **Rebuild** - Run build script again
- [ ] **Generate new checksum** - Will be done automatically
- [ ] **Test new version** - Full testing cycle
- [ ] **Update all docs** - Replace old checksum with new
- [ ] **Upload new installer** - Keep old versions available
- [ ] **Create new release** - GitHub or website announcement
- [ ] **Announce update** - Let users know about the new version

---

## Quick Command Reference

### Build
```powershell
.\build-and-checksum.ps1
```

### Manual Checksum
```powershell
Get-FileHash "dist/BuzzBuzzGPTs Setup 1.0.0.exe" -Algorithm SHA256
```

### Git Tag
```bash
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

---

## Estimated Time

| Task | Time |
|------|------|
| Icon creation | 5 min |
| Update info | 2 min |
| Build | 10 min |
| Test | 15 min |
| Update docs | 5 min |
| Upload | 10 min |
| Announce | 20 min |
| **Total** | **~1 hour** |

---

## Success Indicators

✅ Installer builds without errors  
✅ App installs and runs on test machine  
✅ All features work after installation  
✅ Uninstall works cleanly  
✅ Download link works on website  
✅ Checksum verification passes  
✅ SmartScreen instructions are clear  
✅ Users can successfully install and use the app  

---

## Emergency Fixes

If you discover a critical bug after release:

1. **Quick fix:**
   - Fix the code
   - Update version to 1.0.1
   - Rebuild immediately
   - Test thoroughly
   - Upload new version
   - Post urgent update notice

2. **Temporary measure:**
   - Add warning to download page
   - Pin GitHub issue
   - Update social media posts
   - Provide workaround if possible

---

## Support Checklist

- [ ] GitHub Issues enabled and monitored
- [ ] GitHub Discussions set up (optional)
- [ ] Email for support questions
- [ ] FAQ document created
- [ ] Common issues documented in INSTALL.md

---

## Long-term Maintenance

### Monthly:
- [ ] Check for security updates
- [ ] Review open issues
- [ ] Update dependencies
- [ ] Check download statistics

### Per Release:
- [ ] Test on latest Windows version
- [ ] Update documentation
- [ ] Generate new checksum
- [ ] Announce update

---

## Files to Keep Track Of

### For Each Version:
- Installer exe file
- SHA256 checksum
- Release notes
- Build date/time
- Source code commit hash

### Archive Strategy:
```
/releases/
├── v1.0.0/
│   ├── BuzzBuzzGPTs-Setup-1.0.0.exe
│   ├── CHECKSUM-SHA256.txt
│   └── RELEASE-NOTES.md
├── v1.0.1/
│   ├── BuzzBuzzGPTs-Setup-1.0.1.exe
│   ├── CHECKSUM-SHA256.txt
│   └── RELEASE-NOTES.md
```

---

Print this checklist and check off items as you complete them!
