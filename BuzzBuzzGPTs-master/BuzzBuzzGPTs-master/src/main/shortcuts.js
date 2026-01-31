/**
 * Global Keyboard Shortcuts
 * Registers and handles application-wide hotkeys
 */

const { globalShortcut } = require('electron');
const { toggleVisibility } = require('./window');

/**
 * Register all global shortcuts
 */
function registerShortcuts() {
  // Register Ctrl+Shift+H as global shortcut for show/hide
  // This works even when window is hidden
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    console.log('Global shortcut: Ctrl+Shift+H - Toggling window visibility');
    toggleVisibility();
  });
  
  console.log('Global shortcuts enabled: Ctrl+Shift+H to toggle window');
}

/**
 * Unregister all shortcuts
 */
function unregisterShortcuts() {
  globalShortcut.unregisterAll();
}

module.exports = {
  registerShortcuts,
  unregisterShortcuts
};
