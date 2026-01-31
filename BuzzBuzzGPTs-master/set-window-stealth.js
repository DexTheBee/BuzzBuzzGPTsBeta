// Additional stealth configuration for Windows
// This script provides enhanced screen capture protection

const { BrowserWindow } = require('electron');

function enableStealthMode(window, callback) {
  if (process.platform === 'win32') {
    // Enable content protection (prevents screen capture on supported platforms)
    window.setContentProtection(true);
    
    // Additional Windows-specific settings
    try {
      // Set window to exclude from capture using native Windows API
      const { exec } = require('child_process');
      const windowId = window.getNativeWindowHandle().readUInt32LE(0);
      
      // PowerShell command to set WDA_EXCLUDEFROMCAPTURE
      const psCommand = `
        Add-Type -TypeDefinition @"
        using System;
        using System.Runtime.InteropServices;
        public class WindowCapture {
            [DllImport("user32.dll")]
            public static extern bool SetWindowDisplayAffinity(IntPtr hwnd, uint affinity);
            public const uint WDA_EXCLUDEFROMCAPTURE = 0x00000011;
        }
"@
        [WindowCapture]::SetWindowDisplayAffinity(${windowId}, [WindowCapture]::WDA_EXCLUDEFROMCAPTURE)
      `;
      
      exec(`powershell -Command "${psCommand}"`, (error) => {
        if (error) {
          console.log('⚠️ Note: Advanced stealth mode requires Windows 10 2004+');
          console.log('Using basic content protection only');
          if (callback) callback(false);
        } else {
          console.log('✅ Stealth Mode: ACTIVE - Window hidden from screen capture');
          if (callback) callback(true);
        }
      });
    } catch (err) {
      console.log('Using basic stealth mode');
      if (callback) callback(false);
    }
  } else {
    // Non-Windows platforms
    window.setContentProtection(true);
    if (callback) callback(true);
  }
}

module.exports = { enableStealthMode };
