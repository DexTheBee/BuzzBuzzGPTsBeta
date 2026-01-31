/**
 * BuzzBuzzGPTs - Main Process Entry Point
 * Initializes the Electron application
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');
const { createMainWindow, getMainWindow } = require('./window');
const { registerShortcuts, unregisterShortcuts } = require('./shortcuts');
const { registerHandlers, setStealthStatus } = require('./ipc-handlers');

// Import stealth mode from root
const { enableStealthMode } = require('../../set-window-stealth');

// Fix cache permission errors
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-software-rasterizer');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

// Application ready
app.whenReady().then(() => {
  // Create main window with stealth callback
  createMainWindow((mainWindow) => {
    enableStealthMode(mainWindow, (success) => {
      setStealthStatus(success);
      console.log('Stealth mode initialized:', success);

      // Send initial status after delay
      setTimeout(() => {
        const window = getMainWindow();
        if (window && window.webContents) {
          window.webContents.send('stealth-status', {
            success: success,
            platform: process.platform,
            version: process.getSystemVersion()
          });
        }
      }, 1000);
    });
  });

  // Register global shortcuts
  registerShortcuts();

  // Register IPC handlers
  registerHandlers();

  // macOS: re-create window when dock icon clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Clean up on window close
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Unregister shortcuts on quit
app.on('will-quit', () => {
  unregisterShortcuts();
});
