/**
 * Click-Through Manager
 * Controls window click-through behavior for overlay UI
 */

/**
 * ClickThroughManager - manages click-through state
 */
class ClickThroughManager {
  constructor(ipcRenderer, tutorialManager = null) {
    this.ipcRenderer = ipcRenderer;
    this.tutorialManager = tutorialManager;
    this.interactiveElements = [];
  }

  /**
   * Register interactive elements that should disable click-through on hover
   */
  registerElements(elements) {
    elements.forEach(element => {
      if (element) {
        this.interactiveElements.push(element);
        element.addEventListener('mouseenter', () => this.disable());
        element.addEventListener('mouseleave', () => this.enable());
      }
    });
  }

  /**
   * Set the tutorial manager reference
   */
  setTutorialManager(manager) {
    this.tutorialManager = manager;
  }

  /**
   * Enable click-through (clicks pass to apps below)
   */
  enable() {
    // Don't enable if tutorial is active
    if (this.tutorialManager?.isActive()) {
      return;
    }
    this.ipcRenderer.send('toggle-click-through', true);
  }

  /**
   * Disable click-through (allow interaction with this window)
   */
  disable() {
    this.ipcRenderer.send('toggle-click-through', false);
  }
}

module.exports = { ClickThroughManager };
