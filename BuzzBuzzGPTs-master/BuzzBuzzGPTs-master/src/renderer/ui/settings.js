/**
 * Settings Panel Manager
 * Handles settings panel visibility and interactions
 */

/**
 * SettingsManager - manages the settings dropdown panel
 */
class SettingsManager {
  constructor(elements, ipcRenderer) {
    this.elements = elements;
    this.ipcRenderer = ipcRenderer;
    this.isVisible = false;
    this._hideTimer = null;
    this._fadeTimer = null;
    this._bindEvents();
    this._populateOptions();
    this._populateDisplays();
  }

  /**
   * Bind event listeners
   */
  _bindEvents() {
    const {
      settingsBtn, settingsPanel, displaySelect,
      tutorialBtn
    } = this.elements;

    // Hover to open settings
    if (settingsBtn) {
      settingsBtn.addEventListener('mouseenter', () => this.show());
      settingsBtn.addEventListener('mouseleave', (e) => this._handleMouseLeave());
    }

    if (settingsPanel) {
      settingsPanel.addEventListener('mouseenter', () => this._clearTimers());
      settingsPanel.addEventListener('mouseleave', () => this._handleMouseLeave());
    }

    // Display selection
    if (displaySelect) {
      displaySelect.addEventListener('change', () => this._handleDisplayChange());
      
      // Show overlay on hover over options
      displaySelect.addEventListener('mouseover', (e) => {
        if (e.target.tagName === 'OPTION') {
          const displayIndex = parseInt(e.target.value);
          console.log(`Hovering over display ${displayIndex} - showing blue overlay`);
          this.ipcRenderer.send('show-display-overlay', displayIndex);
        }
      });
      
      // Show overlay when clicking on options
      displaySelect.addEventListener('click', (e) => {
        if (e.target.tagName === 'OPTION') {
          const displayIndex = parseInt(e.target.value);
          console.log(`Clicked display option ${displayIndex} - showing blue overlay`);
          this.ipcRenderer.send('show-display-overlay', displayIndex);
        }
      });
    }

    // Dashboard removed - button intentionally hidden/removed

    // Custom prompts removed from settings
  }

  /**
   * Clear any pending hide/fade timers
   */
  _clearTimers() {
    if (this._hideTimer) {
      clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }
    if (this._fadeTimer) {
      clearTimeout(this._fadeTimer);
      this._fadeTimer = null;
    }
    // Remove fading class if re-entering
    this.elements.settingsPanel?.classList.remove('fading');
  }

  /**
   * Start the hide timer with fade (1 second delay)
   */
  _startHideTimer() {
    const { settingsPanel, settingsBtn } = this.elements;

    this._clearTimers();

    // Wait 1 second before starting fade (quick response when leaving)
    this._hideTimer = setTimeout(() => {
      if (!settingsPanel?.matches(':hover') && !settingsBtn?.matches(':hover')) {
        // Start fade animation
        settingsPanel?.classList.add('fading');

        // After fade completes (400ms), actually hide
        this._fadeTimer = setTimeout(() => {
          if (!settingsPanel?.matches(':hover') && !settingsBtn?.matches(':hover')) {
            this.hide();
          } else {
            // Mouse came back during fade, cancel
            settingsPanel?.classList.remove('fading');
          }
        }, 400);
      }
    }, 1000);
  }

  /**
   * Show settings panel
   */
  show() {
    this._clearTimers();
    this.isVisible = true;
    this.elements.settingsPanel?.classList.add('visible');
    this.ipcRenderer.send('check-stealth-status');
  }

  /**
   * Hide settings panel
   */
  hide() {
    this.isVisible = false;
    this.elements.settingsPanel?.classList.remove('visible', 'fading');
  }

  /**
   * Handle mouse leave with 3-second delay
   */
  _handleMouseLeave() {
    const { settingsPanel, settingsBtn } = this.elements;

    setTimeout(() => {
      if (!settingsPanel?.matches(':hover') && !settingsBtn?.matches(':hover')) {
        this._startHideTimer();
      }
    }, 100);
  }

  /**
   * Populate initial options from localStorage
   */
  _populateOptions() {
    const { outputLang, codeLang } = this.elements;

    if (outputLang) {
      const savedOutputLang = localStorage.getItem('outputLang');
      if (savedOutputLang) outputLang.value = savedOutputLang;
    }

    if (codeLang) {
      const savedCodeLang = localStorage.getItem('codeLang');
      if (savedCodeLang) codeLang.value = savedCodeLang;
    }
  }

  /**
   * Populate display dropdown with connected monitors
   */
  async _populateDisplays() {
    const { displaySelect } = this.elements;
    if (!displaySelect) return;

    try {
      const displays = await this.ipcRenderer.invoke('get-displays');
      console.log('Connected displays:', displays);

      if (!displays || displays.length === 0) {
        // Fallback if no displays returned
        displaySelect.innerHTML = '<option value="0">Display 1 (Primary)</option>';
        return;
      }

      displaySelect.innerHTML = '';

      displays.forEach((display, index) => {
        const option = document.createElement('option');
        option.value = index;

        let label = display.label || `Display ${index + 1}`;
        if (display.primary) label += ' (Primary)';
        label += ` - ${display.bounds.width} x ${display.bounds.height}`;

        option.textContent = label;
        displaySelect.appendChild(option);
      });

      // Restore saved selection
      const savedDisplay = localStorage.getItem('selectedDisplay');
      if (savedDisplay !== null && parseInt(savedDisplay) < displays.length) {
        displaySelect.value = savedDisplay;
      }
    } catch (error) {
      console.error('Failed to get displays:', error);
      // Fallback on error
      displaySelect.innerHTML = '<option value="0">Display 1 (Primary)</option>';
    }
  }

  /**
   * Handle display selection change
   */
  _handleDisplayChange() {
    const displayIndex = parseInt(this.elements.displaySelect.value);
    localStorage.setItem('selectedDisplay', displayIndex);
    console.log(`Display ${displayIndex} selected - showing overlay`);
    this.ipcRenderer.send('show-display-overlay', displayIndex);
  }

  // Dashboard functionality removed; dashboard button no longer present in UI

  /**
   * Update stealth mode status display
   */
  updateStealthStatus(status) {
    const { stealthStatus } = this.elements;
    if (!stealthStatus) return;

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

  // Custom prompt methods removed
}

module.exports = { SettingsManager };
