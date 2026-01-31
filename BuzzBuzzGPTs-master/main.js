/**
 * Windows Audio Host - Main Process
 * 
 * This is the legacy entry point that maintains backward compatibility.
 * For the modular, organized version, see: src/main/index.js
 * 
 * Module Organization:
 *   src/main/window.js       - Window creation and management
 *   src/main/shortcuts.js    - Global keyboard shortcuts
 *   src/main/ipc-handlers.js - IPC communication handlers
 */

const { app, BrowserWindow, globalShortcut, ipcMain, screen, desktopCapturer, shell } = require('electron');
const path = require('path');
const { enableStealthMode } = require('./set-window-stealth');
const { supabase } = require('./src/main/supabase');

// Don't import shortcuts here - we'll register them manually below

// Fix cache permission errors and silence logs
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-gpu-cache');
app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('log-level', '3'); // Only log errors

let mainWindow = null;
let isVisible = true;
let stealthModeActive = false;

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: screenWidth,
    height: screenHeight,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,        // SECURITY: Disabled for safety
      contextIsolation: true,         // SECURITY: Enabled for sandboxing
      enableRemoteModule: false,
      backgroundThrottling: false,
      webviewTag: true,               // Enable webview tag
      enableWebSQL: false,
      allowRunningInsecureContent: false,
      sandbox: false,                 // Need false for webview functionality
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // Enable click-through by default - clicks pass through transparent areas
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // Open DevTools for debugging (can be closed after use)
  // mainWindow.webContents.openDevTools({ mode: 'detach' });

  // Enable screen capture protection (Windows 10+)
  // This makes the window invisible in screen shares while still visible to you
  mainWindow.setContentProtection(true);

  // Handle permission requests for screen capture
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    console.log('[PERMISSIONS] Request for:', permission);

    // Allow screen capture, microphone, and media permissions
    const allowedPermissions = ['media', 'screen', 'video', 'audio', 'audioCapture', 'videoCapture', 'display-capture'];

    if (allowedPermissions.includes(permission)) {
      console.log('[PERMISSIONS] Granted:', permission);
      callback(true);
    } else {
      console.log('[PERMISSIONS] Denied:', permission);
      callback(false);
    }
  });

  // Handle media access requests
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    console.log('[PERMISSIONS] Check for:', permission, 'from:', requestingOrigin);

    // Allow media access
    if (permission === 'media' || permission === 'screen' || permission === 'display-capture') {
      return true;
    }

    return false;
  });

  // Apply advanced stealth mode
  mainWindow.webContents.on('did-finish-load', () => {
    enableStealthMode(mainWindow, (success) => {
      stealthModeActive = success;
      console.log('Stealth mode initialized:', success);

      // Send initial status to renderer after a delay
      setTimeout(() => {
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('stealth-status', {
            success: success,
            platform: process.platform,
            version: process.getSystemVersion()
          });
        }
      }, 1000);
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Disable error dialogs
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

app.whenReady().then(() => {
  // Open main window directly
  createWindow();

  // Register global shortcuts
  // Alt+H - Toggle window visibility
  globalShortcut.register('Alt+H', () => {
    console.log('Global shortcut: Alt+H - Toggling window visibility');
    if (mainWindow) {
      isVisible = !isVisible;
      if (isVisible) {
        mainWindow.show();
      } else {
        mainWindow.hide();
      }
    }
  });

  // Alt+S - Take screenshot
  globalShortcut.register('Alt+S', () => {
    console.log('Global shortcut: Alt+S - Taking screenshot');
    mainWindow?.webContents.send('take-screenshot');
  });

  // Alt+A - Toggle voice/audio
  globalShortcut.register('Alt+A', () => {
    console.log('Global shortcut: Alt+A - Toggling voice input');
    mainWindow?.webContents.send('toggle-voice');
  });
  
  console.log('Global shortcuts enabled: Alt+H (hide/show), Alt+S (screenshot), Alt+A (audio)');

  // IPC handlers for button clicks
  ipcMain.on('trigger-screenshot', () => {
    mainWindow?.webContents.send('take-screenshot');
  });

  ipcMain.on('trigger-showhide', () => {
    if (mainWindow) {
      isVisible = !isVisible;
      if (isVisible) {
        mainWindow.show();
      } else {
        mainWindow.hide();
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC handlers
ipcMain.on('prepare-for-tutorial', (event) => {
  if (mainWindow) {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow.setPosition(0, 0);
    mainWindow.setSize(screenWidth, screenHeight);
    console.log('[MAIN] Window reset to full screen for tutorial');
  }
});

ipcMain.on('resize-window', (event, { width, height }) => {
  if (mainWindow) {
    mainWindow.setSize(width, height);
  }
});

ipcMain.on('quit-app', () => {
  app.quit();
});

ipcMain.on('toggle-click-through', (event, enableClickThrough) => {
  console.log('[MAIN] Toggle click-through received:', enableClickThrough);
  if (mainWindow) {
    // enableClickThrough=true means clicks pass through (ignore mouse events)
    // enableClickThrough=false means we can interact with the window
    mainWindow.setIgnoreMouseEvents(enableClickThrough, { forward: true });
    console.log('[MAIN] setIgnoreMouseEvents set to:', enableClickThrough);
  }
});

ipcMain.on('check-stealth-status', (event) => {
  console.log('Checking stealth status...');
  console.log('Stealth mode active:', stealthModeActive);

  if (mainWindow) {
    mainWindow.webContents.send('stealth-status', {
      success: stealthModeActive,
      platform: process.platform,
      version: process.getSystemVersion()
    });
  }
});

// Get all connected displays
ipcMain.handle('get-displays', async () => {
  const displays = screen.getAllDisplays();
  return displays.map((display, index) => ({
    id: display.id,
    index: index,
    label: display.label || `Display ${index + 1}`,
    bounds: display.bounds,
    size: display.size,
    workArea: display.workArea,
    scaleFactor: display.scaleFactor,
    rotation: display.rotation,
    internal: display.internal,
    primary: display.bounds.x === 0 && display.bounds.y === 0
  }));
});

// Show blue overlay on selected display
let overlayWindow = null;
ipcMain.on('show-display-overlay', (event, displayIndex) => {
  console.log(`Showing blue overlay on display ${displayIndex}`);

  // Get all displays
  const displays = screen.getAllDisplays();

  // Validate display index
  if (displayIndex < 0 || displayIndex >= displays.length) {
    console.error(`Invalid display index: ${displayIndex}`);
    return;
  }

  const targetDisplay = displays[displayIndex];
  const { x, y, width, height } = targetDisplay.bounds;

  // Close existing overlay if any
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
  }

  // Create a new fullscreen overlay window on the selected display
  overlayWindow = new BrowserWindow({
    x: targetDisplay.bounds.x,
    y: targetDisplay.bounds.y,
    width: targetDisplay.bounds.width,
    height: targetDisplay.bounds.height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    hasShadow: false,
    enableLargerThanScreen: true,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  // Explicitly set bounds to handle potential display coordinate issues
  overlayWindow.setBounds(targetDisplay.bounds);

  // Get display info for overlay
  const displayLabel = targetDisplay.label || `Display ${displayIndex + 1}`;
  const isPrimary = targetDisplay.bounds.x === 0 && targetDisplay.bounds.y === 0;
  const resolution = `${width} x ${height}`;

  // Load HTML with blue overlay showing actual display info
  overlayWindow.loadURL(`data:text/html,
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, rgba(0, 123, 255, 0.15) 0%, rgba(0, 150, 255, 0.25) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            backdrop-filter: blur(2px);
          }
          .display-indicator {
            background: linear-gradient(135deg, rgba(0, 123, 255, 0.95) 0%, rgba(0, 100, 235, 0.95) 100%);
            color: white;
            padding: 70px 90px;
            border-radius: 32px;
            text-align: center;
            box-shadow: 
              0 25px 80px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.1) inset,
              0 0 100px rgba(0, 123, 255, 0.4);
            animation: fadeIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
            overflow: hidden;
          }
          .display-indicator::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
              45deg,
              transparent,
              rgba(255, 255, 255, 0.05),
              transparent
            );
            transform: rotate(45deg);
          }
          .display-number {
            font-size: 84px;
            font-weight: 700;
            margin-bottom: 16px;
            letter-spacing: -1px;
            text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            position: relative;
          }
          .display-info {
            font-size: 36px;
            font-weight: 500;
            opacity: 0.95;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
            position: relative;
          }
          .display-resolution {
            font-size: 28px;
            font-weight: 400;
            opacity: 0.85;
            margin-top: 8px;
            font-family: 'Consolas', 'Monaco', monospace;
            letter-spacing: 1px;
            position: relative;
          }
          @keyframes fadeIn {
            from { 
              opacity: 0; 
              transform: scale(0.85) translateY(20px);
            }
            to { 
              opacity: 1; 
              transform: scale(1) translateY(0);
            }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          body.fade-out {
            animation: fadeOut 0.35s ease-out forwards !important;
          }
        </style>
      </head>
      <body>
        <div class="display-indicator">
          <div class="display-number">${displayLabel}</div>
          <div class="display-info">${isPrimary ? 'Primary Display' : 'Secondary Display'}</div>
          <div class="display-resolution">${resolution}</div>
        </div>
        <script>
          // Unified fade-out of entire screen to prevent tint glitch
          setTimeout(() => {
            document.body.classList.add('fade-out');
          }, 1300);
        </script>
      </body>
    </html>
  `);

  overlayWindow.setIgnoreMouseEvents(true);

  // Close window after animation completes (1300ms active + 350ms animation + 50ms buffer)
  setTimeout(() => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.close();
      overlayWindow = null;
    }
  }, 1750);
});

// Move window by delta (for bee button drag)
ipcMain.on('move-window', (event, { deltaX, deltaY }) => {
  if (mainWindow) {
    const [x, y] = mainWindow.getPosition();
    mainWindow.setPosition(x + deltaX, y + deltaY);
  }
});

// Capture screenshot in main process
ipcMain.handle('capture-screenshot', async (event) => {
  try {
    console.log('Screenshot request received in main process');

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });

    console.log('Desktop sources found:', sources.length);

    if (sources.length === 0) {
      throw new Error('No screen sources found');
    }

    // Get the primary screen
    const primarySource = sources[0];
    const screenshot = primarySource.thumbnail;

    // Convert to data URL
    const dataUrl = screenshot.toDataURL();

    console.log('Screenshot captured successfully');

    return {
      success: true,
      dataUrl: dataUrl
    };
  } catch (error) {
    console.error('Screenshot capture error in main:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Get audio sources for capture
ipcMain.handle('get-audio-sources', async (event) => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      fetchWindowIcons: false
    });

    return {
      success: true,
      sources: sources.map(source => ({
        id: source.id,
        name: source.name,
        type: source.display_id ? 'screen' : 'window'
      }))
    };
  } catch (error) {
    console.error('Get audio sources error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// =============================================================================
// SECURE IPC HANDLERS for contextBridge API
// =============================================================================

// Window controls
ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('close-window', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('continue-offline', () => {
  // Save offline mode setting
  const fs = require('fs');
  const userDataPath = app.getPath('userData');
  const settingsPath = path.join(userDataPath, 'settings.json');
  
  try {
    let settings = {};
    if (fs.existsSync(settingsPath)) {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }
    settings.offlineMode = true;
    settings.hasAccount = true; // Mark as having account to skip auth next time
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error saving offline mode:', error);
  }
  
  // Close auth window and open main window
  if (authWindow) {
    authWindow.close();
    authWindow = null;
  }
  if (!mainWindow) {
    createWindow();
  }
});

ipcMain.handle('toggle-always-on-top', () => {
  if (mainWindow) {
    const isOnTop = mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(!isOnTop);
    return !isOnTop;
  }
  return false;
});

ipcMain.handle('set-window-stealth', async (event, enabled) => {
  if (enabled) {
    stealthModeActive = await enableStealthMode(mainWindow);
    return stealthModeActive;
  } else {
    // Disable stealth mode - show in taskbar
    mainWindow?.setSkipTaskbar(false);
    stealthModeActive = false;
    return false;
  }
});

// Settings persistence
const fs = require('fs').promises;
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

ipcMain.handle('save-settings', async (event, settings) => {
  try {
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-settings', async () => {
  try {
    const data = await fs.readFile(settingsPath, 'utf-8');
    return { success: true, settings: JSON.parse(data) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Tutorial state persistence
const tutorialPath = path.join(app.getPath('userData'), 'tutorial-state.json');

ipcMain.handle('save-tutorial-state', async (event, state) => {
  try {
    await fs.writeFile(tutorialPath, JSON.stringify(state, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-tutorial-state', async () => {
  try {
    const data = await fs.readFile(tutorialPath, 'utf-8');
    return { success: true, state: JSON.parse(data) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Environment info
ipcMain.handle('is-dev', () => {
  return process.env.NODE_ENV === 'development' || !app.isPackaged;
});

ipcMain.handle('get-version', () => {
  return app.getVersion();
});

// Safe logging - only logs in dev mode
ipcMain.handle('log', async (event, ...args) => {
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    console.log('[RENDERER]', ...args);
  }
});

ipcMain.handle('error', async (event, ...args) => {
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    console.error('[RENDERER]', ...args);
  }
});

// Additional handlers needed by renderer
ipcMain.handle('move-window', async (event, { deltaX, deltaY }) => {
  if (mainWindow) {
    const [x, y] = mainWindow.getPosition();
    mainWindow.setPosition(x + deltaX, y + deltaY);
    return { success: true };
  }
  return { success: false };
});

ipcMain.handle('resize-window', async (event, { width, height }) => {
  if (mainWindow) {
    mainWindow.setSize(width, height);
    return { success: true };
  }
  return { success: false };
});

ipcMain.handle('toggle-click-through', async (event, enableClickThrough) => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(enableClickThrough, { forward: true });
    return { success: true };
  }
  return { success: false };
});

ipcMain.handle('quit-app', async () => {
  app.quit();
});

