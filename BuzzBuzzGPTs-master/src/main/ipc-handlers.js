/**
 * IPC Handlers
 * Handles inter-process communication between main and renderer
 */

const { ipcMain, screen, desktopCapturer, BrowserWindow } = require('electron');
const { getMainWindow, toggleVisibility, moveWindow, setClickThrough } = require('./window');
const { isValidDimensions, isValidDelta, isValidBoolean, isValidNumber } = require('./utils/validation');

let overlayWindow = null;
let stealthModeActive = false;

/**
 * Set stealth mode status
 */
function setStealthStatus(active) {
  stealthModeActive = active;
}

/**
 * Register all IPC handlers
 */
function registerHandlers() {
  // Resize window
  ipcMain.on('resize-window', (event, { width, height }) => {
    if (!isValidDimensions({ width, height })) {
      console.error('Invalid window dimensions:', { width, height });
      return;
    }
    
    const mainWindow = getMainWindow();
    if (mainWindow) {
      mainWindow.setSize(width, height);
    }
  });

  // Quit application
  ipcMain.on('quit-app', () => {
    require('electron').app.quit();
  });

  // Toggle click-through
  ipcMain.on('toggle-click-through', (event, enable) => {
    if (!isValidBoolean(enable)) {
      console.error('Invalid click-through value:', enable);
      return;
    }
    
    console.log('[MAIN] Toggle click-through:', enable);
    setClickThrough(enable);
  });

  // Trigger screenshot from button
  ipcMain.on('trigger-screenshot', () => {
    getMainWindow()?.webContents.send('take-screenshot');
  });

  // Trigger show/hide
  ipcMain.on('trigger-showhide', () => {
    toggleVisibility();
  });

  // Move window by delta
  ipcMain.on('move-window', (event, { deltaX, deltaY }) => {
    if (!isValidDelta({ deltaX, deltaY })) {
      console.error('Invalid window delta:', { deltaX, deltaY });
      return;
    }
    
    moveWindow(deltaX, deltaY);
  });

  // Check stealth status
  ipcMain.on('check-stealth-status', (event) => {
    console.log('Checking stealth status:', stealthModeActive);
    const mainWindow = getMainWindow();
    if (mainWindow) {
      mainWindow.webContents.send('stealth-status', {
        success: stealthModeActive,
        platform: process.platform,
        version: process.getSystemVersion()
      });
    }
  });

  // Get all displays
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

  // Show display overlay
  ipcMain.on('show-display-overlay', (event, displayIndex) => {
    if (!isValidNumber(displayIndex, 0, 10)) {
      console.error('Invalid display index:', displayIndex);
      return;
    }
    
    showDisplayOverlay(displayIndex);
  });

  // Capture screenshot
  ipcMain.handle('capture-screenshot', captureScreenshot);

  // Get audio sources
  ipcMain.handle('get-audio-sources', getAudioSources);
}

/**
 * Show blue overlay on selected display
 */
function showDisplayOverlay(displayIndex) {
  console.log(`Showing overlay on display ${displayIndex}`);

  const displays = screen.getAllDisplays();

  if (displayIndex < 0 || displayIndex >= displays.length) {
    console.error(`Invalid display index: ${displayIndex}`);
    return;
  }

  const targetDisplay = displays[displayIndex];
  const { x, y, width, height } = targetDisplay.bounds;

  // Close existing overlay
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
  }

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
    webPreferences: { nodeIntegration: false },
  });

  // Explicitly set bounds to handle potential display coordinate issues
  overlayWindow.setBounds(targetDisplay.bounds);

  const displayLabel = targetDisplay.label || `Display ${displayIndex + 1}`;
  const isPrimary = targetDisplay.bounds.x === 0 && targetDisplay.bounds.y === 0;
  const resolution = `${width} x ${height}`;

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
}

/**
 * Capture screenshot of primary display
 */
async function captureScreenshot(event) {
  try {
    console.log('Screenshot request received');

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });

    console.log('Desktop sources found:', sources.length);

    if (sources.length === 0) {
      throw new Error('No screen sources found');
    }

    const primarySource = sources[0];
    const dataUrl = primarySource.thumbnail.toDataURL();

    console.log('Screenshot captured successfully');

    return { success: true, dataUrl };
  } catch (error) {
    console.error('Screenshot capture error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get audio sources for capture
 */
async function getAudioSources(event) {
  try {
    const { desktopCapturer } = require('electron');
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
}



module.exports = {
  registerHandlers,
  setStealthStatus
};
