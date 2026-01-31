/**
 * BuzzBuzzGPTs Preload Script
 * This script runs in a sandboxed context and exposes secure APIs to the renderer
 */

const { contextBridge, ipcRenderer, nativeImage, clipboard, shell } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  continueOffline: () => ipcRenderer.invoke('continue-offline'),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  setWindowStealth: (enabled) => ipcRenderer.invoke('set-window-stealth', enabled),
  moveWindow: (deltaX, deltaY) => ipcRenderer.invoke('move-window', { deltaX, deltaY }),
  resizeWindow: (width, height) => ipcRenderer.invoke('resize-window', { width, height }),
  toggleClickThrough: (enabled) => ipcRenderer.invoke('toggle-click-through', enabled),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  
  // Screenshot functionality
  captureScreenshot: (options) => ipcRenderer.invoke('capture-screenshot', options),
  
  // AI webview controls
  sendToAI: (message) => ipcRenderer.invoke('send-to-ai', message),
  executeInWebview: (script) => ipcRenderer.invoke('execute-in-webview', script),
  
  // Settings
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  
  // Tutorial
  saveTutorialState: (state) => ipcRenderer.invoke('save-tutorial-state', state),
  loadTutorialState: () => ipcRenderer.invoke('load-tutorial-state'),
  
  // Session management
  startSession: () => ipcRenderer.invoke('start-session'),
  endSession: () => ipcRenderer.invoke('end-session'),
  
  // Auth management
  logout: () => ipcRenderer.invoke('auth:logout'),
  getUserInfo: () => ipcRenderer.invoke('auth:get-user-info'),
  
  // Display management
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  showDisplayOverlay: (displayIndex) => ipcRenderer.send('show-display-overlay', displayIndex),
  
  // Trigger actions (for slash commands)
  triggerScreenshot: () => ipcRenderer.send('trigger-screenshot'),
  triggerShowHide: () => ipcRenderer.send('trigger-showhide'),
  
  // Stealth mode
  checkStealthStatus: () => ipcRenderer.send('check-stealth-status'),
  
  // Tutorial
  prepareForTutorial: () => ipcRenderer.send('prepare-for-tutorial'),
  
  // Keyboard shortcuts - these send from main to renderer
  onTakeScreenshot: (callback) => {
    ipcRenderer.on('take-screenshot', callback);
    return () => ipcRenderer.removeListener('take-screenshot', callback);
  },
  onSolve: (callback) => {
    ipcRenderer.on('solve', callback);
    return () => ipcRenderer.removeListener('solve', callback);
  },
  onStartOver: (callback) => {
    ipcRenderer.on('start-over', callback);
    return () => ipcRenderer.removeListener('start-over', callback);
  },
  onToggleVoice: (callback) => {
    ipcRenderer.on('toggle-voice', callback);
    return () => ipcRenderer.removeListener('toggle-voice', callback);
  },
  onStealthStatus: (callback) => {
    ipcRenderer.on('stealth-status', callback);
    return () => ipcRenderer.removeListener('stealth-status', callback);
  },
  
  // Keyboard shortcuts
  registerShortcut: (shortcut, callback) => {
    // This is one-way communication from main to renderer
    ipcRenderer.on(`shortcut-${shortcut}`, callback);
    return () => ipcRenderer.removeListener(`shortcut-${shortcut}`, callback);
  },
  
  // WebView events
  onWebviewReady: (callback) => ipcRenderer.on('webview-ready', callback),
  onWebviewError: (callback) => ipcRenderer.on('webview-error', callback),
  
  // Screenshot events
  onScreenshotCaptured: (callback) => ipcRenderer.on('screenshot-captured', callback),
  onScreenshotError: (callback) => ipcRenderer.on('screenshot-error', callback),
  
  // Environment
  isDev: () => ipcRenderer.invoke('is-dev'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // Utility - safe logging that respects dev mode
  log: (...args) => ipcRenderer.invoke('log', ...args),
  error: (...args) => ipcRenderer.invoke('error', ...args),
  
  // Shell operations (secure)
  openExternal: (url) => shell.openExternal(url),
  openPath: (path) => shell.openPath(path),
  
  // Clipboard functionality
  clipboard: {
    writeText: (text) => clipboard.writeText(text),
    readText: () => clipboard.readText(),
    writeImage: (dataUrl) => {
      const image = nativeImage.createFromDataURL(dataUrl);
      clipboard.writeImage(image);
    },
    clear: () => clipboard.clear(),
  },
});

// Log that preload script has loaded (for debugging)
console.log('BuzzBuzzGPTs preload script loaded - secure context established');
