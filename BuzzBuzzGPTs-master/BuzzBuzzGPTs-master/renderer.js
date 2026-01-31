/**
 * BuzzBuzzGPTs - Renderer Process
 * 
 * This is the legacy entry point that maintains backward compatibility.
 * For the modular, organized version, see: src/renderer/index.js
 * 
 * Module Organization:
 *   src/renderer/config/         - Constants and configuration

 *   src/renderer/ui/             - UI component managers
 *   src/renderer/utils/          - Utility functions
 */

// Use secure electron API exposed via preload.js
// No direct requires needed - everything is available via window.electronAPI

// ============================================
// Global Error Handlers
// ============================================
window.addEventListener('error', (event) => {
  console.error('[RENDERER ERROR]', event.error);
  if (window.electronAPI && window.electronAPI.error) {
    window.electronAPI.error('Renderer error:', event.error?.message || 'Unknown error');
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[UNHANDLED REJECTION]', event.reason);
  if (window.electronAPI && window.electronAPI.error) {
    window.electronAPI.error('Unhandled promise rejection:', event.reason);
  }
});

// ============================================
// DOM Elements
// ============================================
const toolbar = document.getElementById('toolbar');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
// Entrance Animation Trigger
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const toolbar = document.getElementById('toolbar');
    if (toolbar) {
      toolbar.classList.remove('initial-load');
    }
  }, 500); // 500ms delay after load
});

const startBtn = document.getElementById('start-btn');
const quitBtn = document.getElementById('quit-btn');
const beeBtn = document.getElementById('bee-btn');

// AI WebView Elements
const aiWebviewContainer = document.getElementById('ai-webview-container');
const aiWebview = document.getElementById('ai-webview');
const aiServiceSelect = document.getElementById('ai-service'); // May be null - not currently in HTML
const webviewBack = document.getElementById('webview-back');
const webviewForward = document.getElementById('webview-forward');
const webviewReload = document.getElementById('webview-reload');
const webviewClose = document.getElementById('webview-close');
const webviewUrl = document.getElementById('webview-url');

// AI Service Selector Elements
const aiServiceSelector = document.getElementById('ai-service-selector');
const cancelServiceSelector = document.getElementById('cancel-service-selector');
const serviceCards = document.querySelectorAll('.service-card');

// Floating Action Buttons
const actionScreenshot = document.getElementById('action-screenshot');

// Language Dropdowns
const outputLangSelect = document.getElementById('output-lang'); // May be null - not currently in HTML
const codeLangSelect = document.getElementById('code-lang'); // May be null - not currently in HTML

// Custom Prompts (removed)

// Tutorial Elements (declared early to avoid initialization issues)
const tutorialOverlay = document.getElementById('tutorial-overlay');
const tutorialSpotlight = document.getElementById('tutorial-spotlight');
const tutorialIcon = document.getElementById('tutorial-icon');
const tutorialTitle = document.getElementById('tutorial-title');
const tutorialDescription = document.getElementById('tutorial-description');
const tutorialClose = document.getElementById('tutorial-close');
const tutorialSkip = document.getElementById('tutorial-skip');
const tutorialPrev = document.getElementById('tutorial-prev');
const tutorialNext = document.getElementById('tutorial-next');
const tutorialGuideBee = document.getElementById('tutorial-guide-bee');




// ============================================
// State
// ============================================
let isSessionActive = false;
let settingsVisible = false;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let aiWebviewVisible = false;
let serviceSelectorVisible = false;
let selectedService = 'chatgpt'; // Default
let pendingPrompt = null;

// AI Service URLs
const aiServices = {
  chatgpt: 'https://chat.openai.com',
  gemini: 'https://gemini.google.com',
  claude: 'https://claude.ai/new',
  perplexity: 'https://www.perplexity.ai',
  openrouter: 'https://openrouter.ai/chat'
};

// ============================================
// Bee Button Drag to Move Window (Joystick-style)
// ============================================
let dragAnimationFrame = null;

beeBtn.addEventListener('mousedown', (e) => {
  // Prevent dragging if tutorial is active
  if (tutorialOverlay && tutorialOverlay.classList.contains('active')) {
    return;
  }
  isDragging = true;
  dragStartX = e.screenX;
  dragStartY = e.screenY;
  beeBtn.classList.add('dragging');
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    // Cancel any pending animation frame
    if (dragAnimationFrame) {
      cancelAnimationFrame(dragAnimationFrame);
    }

    // Use requestAnimationFrame for smooth joystick-like movement
    dragAnimationFrame = requestAnimationFrame(() => {
      const deltaX = e.screenX - dragStartX;
      const deltaY = e.screenY - dragStartY;
      dragStartX = e.screenX;
      dragStartY = e.screenY;
      window.electronAPI.moveWindow(deltaX, deltaY);
    });
  }
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    beeBtn.classList.remove('dragging');
    if (dragAnimationFrame) {
      cancelAnimationFrame(dragAnimationFrame);
      dragAnimationFrame = null;
    }
  }
});

// ============================================
// Click-Through Toggle
// ============================================
// When mouse enters UI elements, disable click-through so we can interact
// When mouse leaves UI elements, enable click-through so clicks pass to apps below

function enableClickThrough() {
  // Don't enable click-through if tutorial is active
  const tutorialActive = document.getElementById('tutorial-overlay')?.classList.contains('active');
  if (!tutorialActive) {
    window.electronAPI.toggleClickThrough(true);
  }
}

function disableClickThrough() {
  window.electronAPI.toggleClickThrough(false);
}

// Add hover listeners to all interactive UI elements
[toolbar, settingsPanel, aiWebviewContainer, aiServiceSelector].forEach(element => {
  if (element) {
    element.addEventListener('mouseenter', disableClickThrough);
    element.addEventListener('mouseleave', enableClickThrough);
  }
});

// ============================================
// Window Resize Helper
// ============================================
function resizeWindow(width, height) {
  window.electronAPI.resizeWindow(width, height);
}

function updateWindowSize() {
  // Window is now fullscreen, no resizing needed
  // This function is kept for compatibility but does nothing
}

// ============================================
// Settings Panel - Hover to open with 3-second delay before closing
// ============================================
let settingsHideTimer = null;
let settingsFadeTimer = null;

function clearSettingsTimers() {
  if (settingsHideTimer) {
    clearTimeout(settingsHideTimer);
    settingsHideTimer = null;
  }
  if (settingsFadeTimer) {
    clearTimeout(settingsFadeTimer);
    settingsFadeTimer = null;
  }
  // Remove fading class if we're re-entering
  settingsPanel.classList.remove('fading');
}

function startSettingsHideTimer() {
  // Clear any existing timers
  clearSettingsTimers();

  // Wait 1 second before starting the fade (quick response when leaving)
  settingsHideTimer = setTimeout(() => {
    // Check if mouse is still outside both elements
    if (!settingsPanel.matches(':hover') && !settingsBtn.matches(':hover')) {
      // Start the fade animation
      settingsPanel.classList.add('fading');

      // After fade completes (400ms), actually hide
      settingsFadeTimer = setTimeout(() => {
        if (!settingsPanel.matches(':hover') && !settingsBtn.matches(':hover')) {
          settingsVisible = false;
          settingsPanel.classList.remove('visible', 'fading');
          updateWindowSize();
        } else {
          // Mouse came back during fade, cancel
          settingsPanel.classList.remove('fading');
        }
      }, 400);
    }
  }, 1000);
}

settingsBtn.addEventListener('mouseenter', () => {
  clearSettingsTimers();
  settingsVisible = true;
  settingsPanel.classList.add('visible');
  disableClickThrough(); // Ensure click-through is disabled when settings opens
  updateWindowSize();
});

// Close settings when mouse leaves both the button and the panel (with 3s delay)
settingsBtn.addEventListener('mouseleave', (e) => {
  // Check if mouse is moving to the settings panel
  setTimeout(() => {
    if (!settingsPanel.matches(':hover') && !settingsBtn.matches(':hover')) {
      startSettingsHideTimer();
    }
  }, 100);
});

settingsPanel.addEventListener('mouseenter', () => {
  // Cancel any pending hide when mouse enters panel
  clearSettingsTimers();
  disableClickThrough(); // Ensure click-through is disabled when hovering settings
});

settingsPanel.addEventListener('mouseleave', (e) => {
  // Check if mouse is moving to the settings button
  setTimeout(() => {
    if (!settingsPanel.matches(':hover') && !settingsBtn.matches(':hover')) {
      startSettingsHideTimer();
    }
  }, 100);
});

// ============================================
// Session Control
// ============================================
startBtn.addEventListener('click', () => {
  if (!isSessionActive) {
    // Show service selector
    serviceSelectorVisible = true;
    aiServiceSelector.classList.add('visible');
    settingsVisible = false;
    settingsPanel.classList.remove('visible');

    // Change button to "Stop" immediately, apply danger styling and center it
    isSessionActive = true;
    startBtn.innerHTML = '<span>Stop</span>';
    startBtn.classList.add('active', 'btn-danger', 'centered');
    startBtn.setAttribute('aria-label', 'Stop');
  } else {
    // Stop interview
    isSessionActive = false;
    startBtn.innerHTML = '<span>Start</span>';
    startBtn.classList.remove('active', 'btn-danger', 'centered');
    startBtn.setAttribute('aria-label', 'Start');

    // Close AI WebView
    aiWebviewVisible = false;
    aiWebviewContainer.classList.remove('visible');

    // Close service selector if open
    serviceSelectorVisible = false;
    aiServiceSelector.classList.remove('visible');
  }

  updateWindowSize();
});

// Service Selector - When user picks a service
serviceCards.forEach(card => {
  card.addEventListener('click', () => {
    const service = card.dataset.service;
    selectedService = service;

    // Update the settings dropdown to match (if it exists)
    if (aiServiceSelect) {
      aiServiceSelect.value = service;
    }

    // Hide selector
    serviceSelectorVisible = false;
    aiServiceSelector.classList.remove('visible');

    // Session is already active (button already says "Stop Interview")
    // Just open the AI WebView with selected service
    const url = aiServices[service];
    aiWebview.src = url;
    openAIView();
  });
});

// Cancel service selector
cancelServiceSelector.addEventListener('click', () => {
  serviceSelectorVisible = false;
  aiServiceSelector.classList.remove('visible');

  // Change button back to "Start Interview"
  isSessionActive = false;
  startBtn.innerHTML = '<span>Start</span>';
  startBtn.classList.remove('active');
});

// ============================================
// Bee Button - Now used for dragging only (see drag code above)
// ============================================


// ============================================
// AI WebView Management
// ============================================

// AI Service Selector
if (aiServiceSelect) {
  aiServiceSelect.addEventListener('change', () => {
    const selectedService = aiServiceSelect.value;
    const url = aiServices[selectedService];
    aiWebview.src = url;
    webviewUrl.textContent = `Loading ${selectedService}...`;
  });
}

// WebView Controls
webviewBack.addEventListener('click', () => {
  if (aiWebview.canGoBack()) {
    aiWebview.goBack();
  }
});

webviewForward.addEventListener('click', () => {
  if (aiWebview.canGoForward()) {
    aiWebview.goForward();
  }
});

webviewReload.addEventListener('click', () => {
  aiWebview.reload();
});

webviewClose.addEventListener('click', () => {
  aiWebviewVisible = false;
  aiWebviewContainer.classList.remove('visible');

  // Also stop the interview session
  isSessionActive = false;
  startBtn.innerHTML = '<span>Start</span>';
  startBtn.classList.remove('active');
});

// WebView Event Listeners
aiWebview.addEventListener('did-start-loading', () => {
  if (aiServiceSelect && aiServiceSelect.selectedIndex >= 0) {
    const serviceName = aiServiceSelect.options[aiServiceSelect.selectedIndex].text;
    webviewUrl.textContent = `Loading ${serviceName}...`;
  } else {
    webviewUrl.textContent = 'Loading...';
  }
});

aiWebview.addEventListener('did-stop-loading', () => {
  if (aiServiceSelect && aiServiceSelect.selectedIndex >= 0) {
    const serviceName = aiServiceSelect.options[aiServiceSelect.selectedIndex].text;
    webviewUrl.textContent = `${serviceName} - Ready`;
  } else {
    webviewUrl.textContent = 'Ready';
  }
});

aiWebview.addEventListener('dom-ready', () => {
  console.log('AI WebView ready');

  // Inject styles
  aiWebview.insertCSS(`
    * { cursor: default !important; }
    a, button, input[type="submit"], [role="button"] { cursor: default !important; }
  `);

  // Auto-inject pending prompt if it exists
  // pendingPrompt handling removed (custom prompts UI removed)
});

aiWebview.addEventListener('console-message', (e) => {
  // Optional: log webview console messages for debugging
});

// Open AI View when Start Interview is clicked
function openAIView() {
  aiWebviewVisible = true;
  aiWebviewContainer.classList.add('visible');
}

// Quit Button
// ============================================
quitBtn.addEventListener('click', () => {
  // Add exit animation to toolbar
  if (toolbar) {
    toolbar.classList.add('exiting');
  }
  
  // Add fading animation to settings panel if visible
  if (settingsPanel && settingsPanel.classList.contains('visible')) {
    settingsPanel.classList.add('fading');
  }
  
  // Wait for animations to complete before quitting
  setTimeout(() => {
    window.electronAPI.quitApp();
  }, 600); // Match the longest animation duration
});



// ============================================
// Floating Action Buttons
// ============================================
console.log('[INIT] Setting up event listeners...');

if (actionScreenshot) {
  actionScreenshot.addEventListener('click', () => {
    console.log('Screenshot button clicked');
    autoPasteScreenshot();
  });
  console.log('[INIT] Screenshot listener attached');
} else {
  console.error('[INIT] actionScreenshot element not found!');
}



console.log('[INIT] Event listeners setup complete');

// ============================================
// Auto-Paste Screenshot Function
// ============================================
async function autoPasteScreenshot() {
  try {
    // Request screenshot from main process
    const result = await window.electronAPI.captureScreenshot();

    if (!result.success) {
      throw new Error(result.error);
    }

    // If AI webview is open, copy screenshot to clipboard and auto-paste
    if (aiWebviewVisible && aiWebview) {
      // Copy screenshot to clipboard
      window.electronAPI.clipboard.writeImage(result.dataUrl);

      // Focus webview first
      aiWebview.focus();

      // Wait a bit for focus, then try to auto-paste
      setTimeout(async () => {
        try {
          await aiWebview.executeJavaScript(`
            (async function() {
              // Try multiple selectors for different AI services
              const selectors = [
                'textarea[data-id="root"]',  // ChatGPT
                'textarea[placeholder*="Message"]',  // ChatGPT alternative
                'div[contenteditable="true"]',  // Gemini/Claude
                'textarea.ql-editor',  // Rich text editor
                'textarea',  // Fallback
                'input[type="text"]'  // Last resort
              ];
              
              let inputElement = null;
              for (const selector of selectors) {
                inputElement = document.querySelector(selector);
                if (inputElement) break;
              }
              
              if (!inputElement) {
                return { success: false, error: 'No input element found' };
              }
              
              // Focus the input and paste
              inputElement.focus();
              document.execCommand('paste');
              return { success: true };
            })();
          `);
        } catch (err) {
          console.error('Failed to auto-paste:', err);
        }
      }, 300);

    } else {
      alert('Please start the interview first to use screenshot feature!');
    }

  } catch (error) {
    console.error('Screenshot error:', error);
    alert('Failed to capture screenshot: ' + error.message);
  }
}

// ============================================
// IPC Listeners
// ============================================
window.electronAPI.onTakeScreenshot(autoPasteScreenshot);

window.electronAPI.onSolve(() => {
  console.log('Solve requested via keyboard shortcut');
  // Could open a solve panel or trigger AI analysis
});

window.electronAPI.onStartOver(() => {
  console.log('Start over requested');
  // Reload the AI webview or clear conversation
  if (aiWebview) {
    aiWebview.reload();
  }
});

window.electronAPI.onToggleVoice(() => {
  console.log('Toggle voice requested via Alt+A');
  const voiceBtn = document.getElementById('voice-btn');
  if (voiceBtn) {
    voiceBtn.click();
  }
});



// ============================================
// Keyboard Shortcuts (Local)
// ============================================
// ============================================
// Global shortcuts are now handled in main process (Alt+H, Alt+S, Alt+A)
// ============================================

// ============================================
// Add Loading Spinner Styles
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
  
  .ai-response pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
`;
document.head.appendChild(style);

// ============================================
// Stealth Mode Status
// ============================================
const stealthStatus = document.getElementById('stealth-status');

// Listen for stealth mode status from main process
window.electronAPI.onStealthStatus((event, status) => {
  console.log('Stealth status received:', status);
  updateStealthStatus(status);
});

function updateStealthStatus(status) {
  if (status.success) {
    stealthStatus.innerHTML = `
      <span class="status-indicator active"></span>
      <span>Active</span>
    `;
  } else {
    stealthStatus.innerHTML = `
      <span class="status-indicator disabled"></span>
      <span>Disabled</span>
    `;
  }
}

// Check stealth status on app load
let stealthStatusChecked = false;
setTimeout(() => {
  console.log('Requesting stealth status...');
  window.electronAPI.checkStealthStatus();
  stealthStatusChecked = true;
}, 2000);

// Also check when settings panel opens (but only once)
if (settingsBtn) {
  settingsBtn.addEventListener('mouseenter', () => {
    if (!stealthStatusChecked) {
      window.electronAPI.checkStealthStatus();
      stealthStatusChecked = true;
    }
  });
}

// ============================================
// Display Selection with Visual Overlay
// ============================================
const displaySelect = document.getElementById('display-select');

// Populate display dropdown with actual connected displays
async function populateDisplays() {
  if (!displaySelect) return;

  try {
    const displays = await window.electronAPI.getDisplays();
    console.log('Connected displays:', displays);

    if (!displays || displays.length === 0) {
      displaySelect.innerHTML = '<option value="0">Display 1 (Primary)</option>';
      return;
    }

    displaySelect.innerHTML = '';

    displays.forEach((display, index) => {
      const option = document.createElement('option');
      option.value = index;

      let label = display.label || `Display ${index + 1}`;
      
      const maxNameLength = 15;
      if (label.length > maxNameLength) {
        label = label.substring(0, maxNameLength) + '...';
      }

      if (display.primary) {
        label += ' (Primary)';
      }

      option.textContent = label;
      displaySelect.appendChild(option);
    });

    const savedDisplay = localStorage.getItem('selectedDisplay');
    if (savedDisplay !== null && parseInt(savedDisplay) < displays.length) {
      displaySelect.value = savedDisplay;
    }
  } catch (error) {
    console.error('Failed to get displays:', error);
    displaySelect.innerHTML = '<option value="0">Display 1 (Primary)</option>';
  }
}

// Populate displays on load
populateDisplays();

// Handle display dropdown - save selection and show overlay
if (displaySelect) {
  displaySelect.addEventListener('change', () => {
    const displayIndex = parseInt(displaySelect.value);
    localStorage.setItem('selectedDisplay', displayIndex);
    console.log(`Display ${displayIndex} selected - showing blue overlay`);
    window.electronAPI.showDisplayOverlay(displayIndex);
  });
}

// Language Selectors persistence
if (outputLangSelect) {
  const savedOutputLang = localStorage.getItem('outputLang');
  if (savedOutputLang) outputLangSelect.value = savedOutputLang;

  outputLangSelect.addEventListener('change', () => {
    localStorage.setItem('outputLang', outputLangSelect.value);
  });
}

if (codeLangSelect) {
  const savedCodeLang = localStorage.getItem('codeLang');
  if (savedCodeLang) codeLangSelect.value = savedCodeLang;

  codeLangSelect.addEventListener('change', () => {
    localStorage.setItem('codeLang', codeLangSelect.value);
  });
}

// Custom prompts removed




// ============================================
// Tutorial Button
// ============================================
const tutorialBtn = document.getElementById('tutorial-btn');

// Tutorial button - Shows interactive tutorial (moved to tutorial section below)

// ============================================
// Interactive Tutorial System
// ============================================
// Tutorial elements declared at top of file to avoid initialization issues

let currentTutorialStep = 0;

const tutorialSteps = [
  {
    icon: '👋',
    title: 'Welcome to BuzzBuzzGPTs!',
    description: 'Your AI-powered interview assistant. Let me show you how to use all the features in just a few quick steps!',
    spotlight: null,
    action: null
  },
  {
    icon: '🐝',
    title: 'Drag the Bee to Move',
    description: 'Click and hold the bee button to drag the entire menu anywhere on your screen. Position it wherever you need it!',
    spotlight: '#bee-btn',
    action: null
  },
  {
    icon: '🎯',
    title: 'Start Your Interview',
    description: 'Click "Start Interview" to choose an AI assistant. Pick from ChatGPT, Gemini, Claude, or Perplexity!',
    spotlight: '#start-btn',
    action: null
  },
  {
    icon: '🎛️',
    title: 'Control Toolbar',
    description: 'When you start an interview, this toolbar appears with the Screenshot (<kbd>Ctrl</kbd> + <kbd>H</kbd>) button. Use it to capture your screen and paste it directly into the AI assistant!',
    spotlight: '#toolbar',
    action: null
  },
  {
    icon: '⚙️',
    title: 'Customize Settings',
    description: 'Click the settings gear to configure display, languages, API keys, and view all keyboard shortcuts.',
    spotlight: '#settings-btn',
    action: null
  },
  {
    icon: '✨',
    title: 'You\'re Ready!',
    description: 'Click "Start Interview" to begin. The app is invisible in screen recordings (stealth mode). Good luck!',
    spotlight: null,
    action: null
  }
];

async function showTutorial() {
  currentTutorialStep = 0;
  // Reset window to full screen to prevent overlay gaps
  window.electronAPI.prepareForTutorial();
  tutorialOverlay.classList.add('active');
  await updateTutorialStep();
  // Disable click-through during tutorial
  window.electronAPI.toggleClickThrough(false);
}

function hideTutorial() {
  // Remove highlight from element and parent
  const highlighted = document.querySelector('.tutorial-highlighted');
  if (highlighted) {
    highlighted.classList.remove('tutorial-highlighted');
  }
  const parentHighlighted = document.querySelector('.tutorial-parent-highlighted');
  if (parentHighlighted) {
    parentHighlighted.classList.remove('tutorial-parent-highlighted');
  }

  tutorialOverlay.classList.remove('active');
  tutorialSpotlight.classList.remove('visible');
  // Re-enable click-through
  window.electronAPI.toggleClickThrough(true);

  // Mark tutorial as seen
  localStorage.setItem('hasSeenTutorial', 'true');
}

async function updateTutorialStep() {
  const step = tutorialSteps[currentTutorialStep];
  const totalSteps = tutorialSteps.length;

  // Update step indicator
  document.querySelector('.step-current').textContent = currentTutorialStep + 1;
  document.querySelector('.step-total').textContent = totalSteps;

  // Update content
  tutorialIcon.textContent = step.icon;
  tutorialTitle.textContent = step.title;
  tutorialDescription.innerHTML = step.description;

  // Update navigation buttons
  tutorialPrev.disabled = currentTutorialStep === 0;

  if (currentTutorialStep === totalSteps - 1) {
    tutorialNext.textContent = 'Finish ✓';
    tutorialNext.classList.add('finish');
  } else {
    tutorialNext.textContent = 'Next →';
    tutorialNext.classList.remove('finish');
  }

  // Update guide bee mascot
  if (tutorialGuideBee) {
    if (currentTutorialStep === 0) {
      tutorialGuideBee.src = 'logos/wave-bee.png';
    } else if (currentTutorialStep === 2) {
      tutorialGuideBee.src = 'logos/business-bee.png';
    } else if (currentTutorialStep === 3) {
      tutorialGuideBee.src = 'logos/wrench-bee.png';
    } else if (currentTutorialStep === 5) {
      tutorialGuideBee.src = 'logos/trophy-bee.png';
    } else {
      tutorialGuideBee.src = 'logos/pointing-bee.png';
    }

    // Manage sizes & positions
    tutorialGuideBee.classList.remove('large', 'extra-large', 'mega', 'pos-top', 'pos-right');

    if (currentTutorialStep === 2) {
      tutorialGuideBee.classList.add('extra-large');
    } else if (currentTutorialStep === 5) {
      tutorialGuideBee.classList.add('mega');
    } else if (currentTutorialStep === 0 || currentTutorialStep === 1 || currentTutorialStep === 3) {
      tutorialGuideBee.classList.add('large');
    }

    if (currentTutorialStep === 5) {
      tutorialGuideBee.classList.add('pos-top');
    } else if (currentTutorialStep === 3) {
      tutorialGuideBee.classList.add('pos-right');
    }
  }

  const tutorialContent = document.querySelector('.tutorial-content');

  // Remove previous highlight from element and parent
  const previousHighlighted = document.querySelector('.tutorial-highlighted');
  if (previousHighlighted) {
    previousHighlighted.classList.remove('tutorial-highlighted');
  }
  const previousParent = document.querySelector('.tutorial-parent-highlighted');
  if (previousParent) {
    previousParent.classList.remove('tutorial-parent-highlighted');
  }

  // Update spotlight and position tutorial card below it
  if (step.spotlight) {
    const targetElement = document.querySelector(step.spotlight);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();

      // Highlight the target element and its parent toolbar
      targetElement.classList.add('tutorial-highlighted');
      const toolbar = document.querySelector('.toolbar');
      if (toolbar) {
        toolbar.classList.add('tutorial-parent-highlighted');
      }

      tutorialSpotlight.style.left = `${rect.left - 10}px`;
      tutorialSpotlight.style.top = `${rect.top - 10}px`;
      tutorialSpotlight.style.width = `${rect.width + 20}px`;
      tutorialSpotlight.style.height = `${rect.height + 20}px`;
      tutorialSpotlight.classList.add('visible');

      // Position tutorial card below the highlighted element
      const cardTop = rect.bottom + 20;
      let cardLeft = rect.left + (rect.width / 2);

      // Get card width (max-width is 380px, min-width is 320px)
      const cardWidth = 380;
      const cardHalfWidth = cardWidth / 2;
      const viewportWidth = window.innerWidth;

      // Clamp card position to stay within viewport
      const minLeft = cardHalfWidth + 20; // 20px padding from left edge
      const maxLeft = viewportWidth - cardHalfWidth - 20; // 20px padding from right edge

      // Ensure card doesn't go off-screen
      if (cardLeft < minLeft) {
        cardLeft = minLeft;
      } else if (cardLeft > maxLeft) {
        cardLeft = maxLeft;
      }

      tutorialContent.style.position = 'fixed';
      tutorialContent.style.top = `${cardTop}px`;
      tutorialContent.style.left = `${cardLeft}px`;
      tutorialContent.style.bottom = 'auto';
      tutorialContent.style.transform = 'translateX(-50%)';
    } else {
      tutorialSpotlight.classList.remove('visible');
      resetTutorialCardPosition(tutorialContent);
    }
  } else {
    tutorialSpotlight.classList.remove('visible');
    resetTutorialCardPosition(tutorialContent);
  }
}

function resetTutorialCardPosition(tutorialContent) {
  tutorialContent.style.position = 'fixed';
  tutorialContent.style.top = '50%';
  tutorialContent.style.left = '50%';
  tutorialContent.style.bottom = 'auto';
  tutorialContent.style.transform = 'translate(-50%, -50%)';
}

// Tutorial button click (in settings)
if (tutorialBtn) {
  tutorialBtn.addEventListener('click', () => {
    disableClickThrough(); // Ensure click-through is off
    showTutorial();
  });
} else {
  console.warn('Tutorial button not found in DOM');
}

// Tutorial navigation
if (tutorialClose) {
  tutorialClose.addEventListener('click', hideTutorial);
}
if (tutorialSkip) {
  tutorialSkip.addEventListener('click', hideTutorial);
}

if (tutorialPrev) {
  tutorialPrev.addEventListener('click', async () => {
    if (currentTutorialStep > 0) {
      currentTutorialStep--;
      await updateTutorialStep();
    }
  });
}

if (tutorialNext) {
  tutorialNext.addEventListener('click', async () => {
    if (currentTutorialStep < tutorialSteps.length - 1) {
      currentTutorialStep++;
      await updateTutorialStep();
    } else {
      hideTutorial();
    }
  });
}

// Keyboard shortcuts disabled

// Show tutorial on first launch
const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
if (!hasSeenTutorial) {
  setTimeout(() => {
    showTutorial();
    localStorage.setItem('hasSeenTutorial', 'true');
  }, 1000);
}

// ============================================
// Initialize
// ============================================
console.log('BuzzBuzzGPTs initialized');
