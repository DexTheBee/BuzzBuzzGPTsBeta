/**
 * AI WebView Manager
 * Handles the embedded AI service webview
 */

const { AI_SERVICES, AI_INPUT_SELECTORS } = require('../config/constants');

/**
 * WebViewManager - manages the AI service webview
 */
class WebViewManager {
  constructor(elements, ipcRenderer) {
    this.elements = elements;
    this.ipcRenderer = ipcRenderer;
    this.isVisible = false;
    this.selectedService = 'chatgpt';
    this.pendingPrompt = null;

    this._bindEvents();
  }

  /**
   * Bind event listeners
   */
  _bindEvents() {
    const {
      aiWebview, aiServiceSelect,
      webviewBack, webviewForward, webviewReload, webviewClose,
      webviewUrl
    } = this.elements;

    // Service selector change
    if (aiServiceSelect) {
      aiServiceSelect.addEventListener('change', () => {
        const service = aiServiceSelect.value;
        this.loadService(service);
      });
    }

    // Navigation controls
    if (webviewBack) {
      webviewBack.addEventListener('click', () => {
        if (aiWebview?.canGoBack()) aiWebview.goBack();
      });
    }

    if (webviewForward) {
      webviewForward.addEventListener('click', () => {
        if (aiWebview?.canGoForward()) aiWebview.goForward();
      });
    }

    if (webviewReload) {
      webviewReload.addEventListener('click', () => {
        aiWebview?.reload();
      });
    }

    if (webviewClose) {
      webviewClose.addEventListener('click', () => {
        this.hide();
        this.onClose?.();
      });
    }

    // WebView events
    if (aiWebview) {
      aiWebview.addEventListener('did-start-loading', () => {
        const serviceName = aiServiceSelect?.options[aiServiceSelect.selectedIndex]?.text || 'AI Service';
        webviewUrl.textContent = 'Loading ' + serviceName + '...';
      });

      aiWebview.addEventListener('did-stop-loading', () => {
        const serviceName = aiServiceSelect?.options[aiServiceSelect.selectedIndex]?.text || 'AI Service';
        webviewUrl.textContent = serviceName + ' - Ready';
      });

      aiWebview.addEventListener('dom-ready', () => {
        console.log('AI WebView ready');
        this._injectStyles();

        // Auto-inject pending prompt if it exists
        if (this.pendingPrompt) {
          console.log('Injecting pending prompt:', this.pendingPrompt);
          this.sendMessage(this.pendingPrompt);
          this.pendingPrompt = null;
        }
      });
    }
  }

  /**
   * Inject custom CSS into webview
   */
  _injectStyles() {
    const { aiWebview } = this.elements;

    // Set default cursor throughout webview
    aiWebview?.insertCSS(`
      * { cursor: default !important; }
      a, button, input[type="submit"], [role="button"] { cursor: default !important; }
    `);
  }

  /**
   * Send a specific message to the AI service
   * @param {string} message - The message to send
   */
  sendMessage(message) {
    const { aiWebview } = this.elements;
    if (!aiWebview) return;

    const selectors = AI_INPUT_SELECTORS[this.selectedService] || ['textarea', 'div[contenteditable="true"]'];

    const script = `
        (function() {
          const selectors = ${JSON.stringify(selectors)};
          const message = ${JSON.stringify(message)};
          
          let input = null;
          for (const sel of selectors) {
            input = document.querySelector(sel);
            if (input) break;
          }
          
          if (!input) {
            const active = document.activeElement;
            if (active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT' || active.contentEditable === 'true')) {
              input = active;
            }
          }
          
          if (input) {
            input.focus();
            
            try {
              // Try selection-based insertion for React apps
              document.execCommand('insertText', false, message);
            } catch (e) {
              console.error('execCommand failed', e);
            }
            
            // Fallback for direct value setting if execCommand didn't work
            if (input.tagName === 'DIV') {
              if (input.innerText !== message && !input.innerText.includes(message)) {
                input.innerText = message;
              }
            } else {
              if (input.value !== message) {
                input.value = message;
              }
            }
            
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            
            setTimeout(() => {
              const sendButtons = [
                'button[aria-label*="Send"]',
                'button[data-testid*="send"]',
                '#prompt-textarea + button',
                '.absolute.bottom-1.5.right-2',
                'button:has(svg)',
                '[role="button"]:has(svg)'
              ];
              
              let sent = false;
              for (const sel of sendButtons) {
                const btn = document.querySelector(sel);
                if (btn && !btn.disabled) {
                  btn.click();
                  sent = true;
                  break;
                }
              }
              
              if (!sent) {
                input.dispatchEvent(new KeyboardEvent('keydown', {
                  key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true
                }));
              }
            }, 500);
            
            return true;
          }
          return false;
        })()
      `;

    aiWebview.executeJavaScript(script).catch(err => {
      console.error('Failed to send message:', err);
    });
  }

  /**
   * Load a specific AI service
   */
  loadService(service) {
    const { aiWebview, aiServiceSelect, webviewUrl } = this.elements;

    this.selectedService = service;
    const url = AI_SERVICES[service];

    if (aiWebview) {
      aiWebview.src = url;
    }

    if (aiServiceSelect) {
      aiServiceSelect.value = service;
    }

    if (webviewUrl) {
      webviewUrl.textContent = 'Loading ' + service + '...';
    }
  }

  /**
   * Show the webview container
   */
  show() {
    const { aiWebviewContainer } = this.elements;
    this.isVisible = true;
    aiWebviewContainer?.classList.add('visible');
  }

  /**
   * Hide the webview container
   */
  hide() {
    const { aiWebviewContainer } = this.elements;
    this.isVisible = false;
    aiWebviewContainer?.classList.remove('visible');
  }

  /**
   * Get the webview element
   */
  getWebview() {
    return this.elements.aiWebview;
  }

  /**
   * Set callback for close event
   */
  setOnClose(callback) {
    this.onClose = callback;
  }

  /**
   * Reload the current page
   */
  reload() {
    this.elements.aiWebview?.reload();
  }
}

module.exports = { WebViewManager };
