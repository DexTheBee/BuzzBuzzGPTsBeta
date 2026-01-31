# How to Add a Custom Icon Later

The app will build successfully with Electron's default icon. To add your custom icon later:

## Step 1: Create the Icon

Follow instructions in `build/README-ICON.md` or:

1. Open `build/create-icon.html` in your browser
2. Take a screenshot of the bee icon
3. Convert to .ico format at https://icoconvert.com
4. Save as `build/icon.ico`

## Step 2: Update package.json

Add these lines back to `package.json`:

### In the "win" section, add:
```json
"win": {
  "target": [...],
  "icon": "build/icon.ico",        ← ADD THIS LINE
  "publisherName": "...",
  ...
}
```

### In the "nsis" section, add:
```json
"nsis": {
  "oneClick": false,
  ...
  "installerIcon": "build/icon.ico",       ← ADD THIS LINE
  "uninstallerIcon": "build/icon.ico",     ← ADD THIS LINE
  "installerHeaderIcon": "build/icon.ico", ← ADD THIS LINE
  "license": "LICENSE",
  ...
}
```

## Step 3: Rebuild

```powershell
.\build-and-checksum.ps1
```

Your installer will now have your custom icon!

## Complete Example

Here's the full configuration with icon:

```json
{
  "build": {
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ],
      "icon": "build/icon.ico",
      "publisherName": "Your Name or Company",
      "verifyUpdateCodeSignature": false,
      "requestedExecutionLevel": "asInvoker"
    },
    "nsis": {
      "oneClick": false,
      "allowElevation": true,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "BuzzBuzzGPTs",
      "deleteAppDataOnUninstall": false,
      "installerIcon": "build/icon.ico",
      "uninstallerIcon": "build/icon.ico",
      "installerHeaderIcon": "build/icon.ico",
      "license": "LICENSE",
      "warningsAsErrors": false
    }
  }
}
```

## Why Build Without Icon First?

- Faster to get started
- Test the build process
- Verify everything works
- Add icon polish later

The default Electron icon is perfectly fine for testing and even initial releases!
