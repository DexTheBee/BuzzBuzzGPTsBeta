/**
 * BuzzBuzzGPTs - Renderer Entry Point
 * Initializes and coordinates all UI components
 */

const { ipcRenderer, nativeImage, clipboard } = require('electron');
const path = require('path');

// Import managers
const { TutorialManager } = require('./ui/tutorial');
const { WebViewManager } = require('./ui/webview');
const { SettingsManager } = require('./ui/settings');
const { ServiceSelector } = require('./ui/service-selector');
const { DragManager } = require('./ui/drag-manager');
const { ClickThroughManager } = require('./ui/click-through');


// ============================================
// DOM Elements
// ============================================
const elements = {
  // Main toolbar
  toolbar: document.getElementById('toolbar'),
  settingsBtn: document.getElementById('settings-btn'),
  settingsPanel: document.getElementById('settings-panel'),
  startBtn: document.getElementById('start-btn'),
  quitBtn: document.getElementById('quit-btn'),
  beeBtn: document.getElementById('bee-btn'),

  // AI WebView
  aiWebviewContainer: document.getElementById('ai-webview-container'),
  aiWebview: document.getElementById('ai-webview'),
  aiServiceSelect: document.getElementById('ai-service'),
  webviewBack: document.getElementById('webview-back'),
  webviewForward: document.getElementById('webview-forward'),
  webviewReload: document.getElementById('webview-reload'),
  webviewClose: document.getElementById('webview-close'),
  webviewUrl: document.getElementById('webview-url'),

  // Service Selector
  aiServiceSelector: document.getElementById('ai-service-selector'),
  cancelServiceSelector: document.getElementById('cancel-service-selector'),
  serviceCards: document.querySelectorAll('.service-card'),

  // Action Buttons
  actionScreenshot: document.getElementById('action-screenshot'),

  // Settings
  displaySelect: document.getElementById('display-select'),
  dashboardBtn: document.getElementById('dashboard-btn'),
  tutorialBtn: document.getElementById('tutorial-btn'),
  stealthStatus: document.getElementById('stealth-status'),
  outputLang: document.getElementById('output-lang'),
  codeLang: document.getElementById('code-lang'),
  // custom prompts removed

  // Tutorial
  tutorialOverlay: document.getElementById('tutorial-overlay'),
  tutorialSpotlight: document.getElementById('tutorial-spotlight'),
  tutorialIcon: document.getElementById('tutorial-icon'),
  tutorialTitle: document.getElementById('tutorial-title'),
  tutorialDescription: document.getElementById('tutorial-description'),
  tutorialClose: document.getElementById('tutorial-close'),
  tutorialSkip: document.getElementById('tutorial-skip'),
  tutorialPrev: document.getElementById('tutorial-prev'),
  tutorialNext: document.getElementById('tutorial-next'),
  tutorialGuideBee: document.getElementById('tutorial-guide-bee'),
};

// ============================================
// Application State
// ============================================
let isSessionActive = false;

// ============================================
// Initialize Managers
// ============================================
const clickThroughManager = new ClickThroughManager(ipcRenderer);
const dragManager = new DragManager(elements.beeBtn, ipcRenderer);
const webviewManager = new WebViewManager(elements, ipcRenderer);
const settingsManager = new SettingsManager(elements, ipcRenderer);
const serviceSelector = new ServiceSelector(elements);
const tutorialManager = new TutorialManager(elements, ipcRenderer);

// Custom prompt logic removed (UI deprecated)


// Link click-through with tutorial
clickThroughManager.setTutorialManager(tutorialManager);

// Register interactive elements for click-through
clickThroughManager.registerElements([
  elements.toolbar,
  elements.settingsPanel,
  elements.aiWebviewContainer,
  elements.aiServiceSelector
]);





// ============================================
// Session Control
// ============================================
elements.startBtn.addEventListener('click', () => {
  if (!isSessionActive) {
    serviceSelector.show();
    settingsManager.hide();
  } else {
    stopSession();
  }
});

serviceSelector.setOnServiceSelected((service) => {
  startSession(service);
});

function startSession(service) {
  isSessionActive = true;
  elements.startBtn.innerHTML = '<span>Stop</span>';
  elements.startBtn.classList.add('active');

  webviewManager.loadService(service);
  webviewManager.show();
}

function stopSession() {
  isSessionActive = false;
  elements.startBtn.innerHTML = '<span>Start</span>';
  elements.startBtn.classList.remove('active');

  webviewManager.hide();
}

webviewManager.setOnClose(() => {
  stopSession();
});

// ============================================
// Action Buttons
// ============================================

// Screenshot Button
if (elements.actionScreenshot) {
  elements.actionScreenshot.addEventListener('click', () => {
    console.log('Screenshot button clicked');
    captureAndPasteScreenshot();
  });
}





// ============================================
// Screenshot Capture
// ============================================
async function captureAndPasteScreenshot() {
  try {
    const result = await ipcRenderer.invoke('capture-screenshot');

    if (!result.success) {
      throw new Error(result.error);
    }

    if (webviewManager.isVisible) {
      const image = nativeImage.createFromDataURL(result.dataUrl);
      clipboard.writeImage(image);

      const webview = webviewManager.getWebview();
      webview?.focus();

      setTimeout(async () => {
        try {
          await webview?.executeJavaScript(`
            (async function() {
              const selectors = [
                'textarea[data-id="root"]',
                'textarea[placeholder*="Message"]',
                'div[contenteditable="true"]',
                'textarea',
                'input[type="text"]'
              ];
              
              let input = null;
              for (const sel of selectors) {
                input = document.querySelector(sel);
                if (input) break;
              }
              
              if (input) {
                input.focus();
                document.execCommand('paste');
                return { success: true };
              }
              return { success: false };
            })();
          `);
        } catch (err) {
          console.error('Failed to auto-paste:', err);
        }
      }, 300);
    } else {
      alert('Please start the interview first!');
    }
  } catch (error) {
    console.error('Screenshot error:', error);
    alert('Failed to capture screenshot: ' + error.message);
  }
}

// ============================================
// IPC Listeners
// ============================================
ipcRenderer.on('take-screenshot', captureAndPasteScreenshot);

ipcRenderer.on('start-over', () => {
  console.log('Start over requested');
  webviewManager.reload();
});



ipcRenderer.on('stealth-status', (event, status) => {
  console.log('Stealth status received:', status);
  settingsManager.updateStealthStatus(status);
});

// ============================================
// Quit Button
// ============================================
elements.quitBtn.addEventListener('click', () => {
  ipcRenderer.send('quit-app');
});

// ============================================
// Tutorial Button
// ============================================
if (elements.tutorialBtn) {
  elements.tutorialBtn.addEventListener('click', () => {
    tutorialManager.show();
  });
}

// ============================================
// Global shortcuts are now handled in main process (Alt+H, Alt+S, Alt+A)
// ============================================

// ============================================
// Dynamic Styles
// ============================================
const style = document.createElement('style');
style.textContent = `
  .loading-spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto;
    border: 3px solid var(--bg-card);
    border-top: 3px solid var(--primary-gold);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  

`;
document.head.appendChild(style);

// ============================================
// Request Stealth Status
// ============================================
setTimeout(() => {
  console.log('Requesting stealth status...');
  ipcRenderer.send('check-stealth-status');
}, 2000);

// ============================================
// Initialize Complete
// ============================================
console.log('BuzzBuzzGPTs initialized');
