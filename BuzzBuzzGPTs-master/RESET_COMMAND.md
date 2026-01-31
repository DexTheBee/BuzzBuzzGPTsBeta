# Reset to Fresh Install (See Login Page Again)

## Quick Command (Windows CMD):
```bash
rmdir /S /Q "%APPDATA%\buzzbuzzgpts" && npm start
```

## Or Step by Step:

### Step 1: Delete Settings
```bash
rmdir /S /Q "%APPDATA%\buzzbuzzgpts"
```

### Step 2: Start App
```bash
npm start
```

## PowerShell Alternative:
```powershell
Remove-Item "$env:APPDATA\buzzbuzzgpts" -Recurse -Force -ErrorAction SilentlyContinue; npm start
```

## What This Does:
- Deletes `C:\Users\khan1\AppData\Roaming\buzzbuzzgpts` folder
- Removes all saved settings and login data
- App thinks it's a fresh install
- Shows login/signup window

## Quick Reset Commands:

### Windows CMD (Recommended):
```bash
cd "C:\Users\khan1\Videos\BuzzBuzzProduc\BuzzBuzzGPTs-master"
rmdir /S /Q "%APPDATA%\buzzbuzzgpts"
npm start
```

### PowerShell:
```powershell
cd "C:\Users\khan1\Videos\BuzzBuzzProduc\BuzzBuzzGPTs-master"
Remove-Item "$env:APPDATA\buzzbuzzgpts" -Recurse -Force -ErrorAction SilentlyContinue
npm start
```

### Git Bash / WSL:
```bash
cd "/c/Users/khan1/Videos/BuzzBuzzProduc/BuzzBuzzGPTs-master"
rm -rf "$APPDATA/buzzbuzzgpts"
npm start
```

## Save This Script:

Create a file called `reset-and-start.bat`:
```batch
@echo off
echo Resetting BuzzBuzzGPTs to fresh install...
rmdir /S /Q "%APPDATA%\buzzbuzzgpts" 2>nul
echo Starting app...
npm start
```

Then just run:
```bash
reset-and-start.bat
```

---

**Quick answer:** 
```bash
rmdir /S /Q "%APPDATA%\buzzbuzzgpts" && npm start
```
