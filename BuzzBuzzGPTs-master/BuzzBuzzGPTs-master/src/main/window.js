/**
 * Window Management
 * Creates and configures the main application window
 */

const { BrowserWindow, screen } = require('electron');
const path = require('path');

let mainWindow = null;
let isVisible = true;

/**
 * Create the main application window
 * @param {Function} onStealthReady - Callback when stealth mode is initialized
 * @returns {BrowserWindow}
 */
function createMainWindow(onStealthReady) {
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
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../../preload.js'),
      enableRemoteModule: false,
      backgroundThrottling: false,
      webviewTag: true,
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // Disable click-through by default so UI is interactive
  // The ClickThroughManager will enable it when hovering outside interactive elements
  mainWindow.setIgnoreMouseEvents(false);

  // Enable screen capture protection (Windows 10+)
  mainWindow.setContentProtection(true);
  
  // Notify when stealth mode is ready
  mainWindow.webContents.on('did-finish-load', () => {
    if (onStealthReady) {
      onStealthReady(mainWindow);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

/**
 * Get the main window instance
 * @returns {BrowserWindow|null}
 */
function getMainWindow() {
  return mainWindow;
}

/**
 * Toggle window visibility
 * @returns {boolean} New visibility state
 */
function toggleVisibility() {
  if (!mainWindow) return false;
  
  isVisible = !isVisible;
  if (isVisible) {
    mainWindow.show();
  } else {
    mainWindow.hide();
  }
  return isVisible;
}

/**
 * Move window by delta
 * @param {number} deltaX
 * @param {number} deltaY
 */
function moveWindow(deltaX, deltaY) {
  if (!mainWindow) return;
  
  const [x, y] = mainWindow.getPosition();
  mainWindow.setPosition(x + deltaX, y + deltaY);
}

/**
 * Set click-through mode
 * @param {boolean} enable
 */
function setClickThrough(enable) {
  if (!mainWindow) return;
  mainWindow.setIgnoreMouseEvents(enable, { forward: true });
}

module.exports = {
  createMainWindow,
  getMainWindow,
  toggleVisibility,
  moveWindow,
  setClickThrough
};
