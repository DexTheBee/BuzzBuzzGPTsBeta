/**
 * Auth Window Preload Script
 * Exposes auth-related APIs to the auth window renderer
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Auth functions
  authSignIn: (email, password) => ipcRenderer.invoke('auth:sign-in', email, password),
  authSignUp: (email, password, name) => ipcRenderer.invoke('auth:sign-up', email, password, name),
  authSignInWithGoogle: () => ipcRenderer.invoke('auth:sign-in-google'),
  authSignInWithGithub: () => ipcRenderer.invoke('auth:sign-in-github'),
  continueOffline: () => ipcRenderer.send('auth:continue-offline'),
  closeWindow: () => ipcRenderer.send('auth:close'),
  
  // Listen for auth events
  onAuthSuccess: (callback) => ipcRenderer.on('auth:success', callback),
  onAuthError: (callback) => ipcRenderer.on('auth:error', callback),
});
