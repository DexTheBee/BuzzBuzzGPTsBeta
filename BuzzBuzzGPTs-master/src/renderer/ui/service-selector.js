/**
 * AI Service Selector
 * Handles the service selection modal
 */

/**
 * ServiceSelector - manages the AI service selection UI
 */
class ServiceSelector {
  constructor(elements) {
    this.elements = elements;
    this.isVisible = false;
    this.onServiceSelected = null;
    
    this._bindEvents();
  }

  /**
   * Bind event listeners
   */
  _bindEvents() {
    const { serviceCards, cancelServiceSelector } = this.elements;
    
    // Service card clicks
    serviceCards.forEach(card => {
      card.addEventListener('click', () => {
        const service = card.dataset.service;
        this.hide();
        this.onServiceSelected?.(service);
      });
    });
    
    // Cancel button
    if (cancelServiceSelector) {
      cancelServiceSelector.addEventListener('click', () => this.hide());
    }
  }

  /**
   * Show the selector
   */
  show() {
    this.isVisible = true;
    this.elements.aiServiceSelector?.classList.add('visible');
  }

  /**
   * Hide the selector
   */
  hide() {
    this.isVisible = false;
    this.elements.aiServiceSelector?.classList.remove('visible');
  }

  /**
   * Set callback for service selection
   */
  setOnServiceSelected(callback) {
    this.onServiceSelected = callback;
  }
}

module.exports = { ServiceSelector };
