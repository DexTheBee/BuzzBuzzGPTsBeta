/**
 * Interactive Tutorial System
 * Guides users through app features with spotlight highlighting
 */

const { TUTORIAL_STEPS } = require('../config/tutorial-steps');

/**
 * TutorialManager - manages the interactive tutorial overlay
 */
class TutorialManager {
  constructor(elements, ipcRenderer) {
    this.elements = elements;
    this.ipcRenderer = ipcRenderer;
    this.currentStep = 0;
    this.steps = TUTORIAL_STEPS;

    this._bindEvents();
    this._checkFirstLaunch();
  }

  /**
   * Bind event listeners
   */
  _bindEvents() {
    const { tutorialClose, tutorialSkip, tutorialPrev, tutorialNext } = this.elements;

    if (tutorialClose) tutorialClose.addEventListener('click', () => this.hide());
    if (tutorialSkip) tutorialSkip.addEventListener('click', () => this.hide());

    if (tutorialPrev) {
      tutorialPrev.addEventListener('click', async () => {
        if (this.currentStep > 0) {
          this.currentStep--;
          // Wait for DOM to render before positioning spotlight
          await new Promise(resolve => setTimeout(resolve, 50));
          await this._updateStep();
        }
      });
    }

    if (tutorialNext) {
      tutorialNext.addEventListener('click', async () => {
        if (this.currentStep < this.steps.length - 1) {
          this.currentStep++;
          // Wait for DOM to render before positioning spotlight
          await new Promise(resolve => setTimeout(resolve, 50));
          await this._updateStep();
        } else {
          this.hide();
        }
      });
    }

    // Keyboard shortcuts disabled
  }

  /**
   * Check if this is first launch and show tutorial
   */
  _checkFirstLaunch() {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setTimeout(() => {
        this.show();
      }, 1000);
    }
  }

  /**
   * Show the tutorial
   */
  async show() {
    this.currentStep = 0;
    this.elements.tutorialOverlay.classList.add('active');
    
    // Wait for DOM to render before positioning spotlight
    await new Promise(resolve => setTimeout(resolve, 50));
    await this._updateStep();
    
    this.ipcRenderer.send('toggle-click-through', false);
  }

  /**
   * Hide the tutorial and mark as seen
   */
  hide() {
    this.elements.tutorialOverlay.classList.remove('active');
    this.elements.tutorialSpotlight.classList.remove('visible');
    this.ipcRenderer.send('toggle-click-through', true);
    
    // Mark tutorial as seen only when user closes/completes it
    localStorage.setItem('hasSeenTutorial', 'true');
  }

  /**
   * Check if tutorial is active
   */
  isActive() {
    return this.elements.tutorialOverlay.classList.contains('active');
  }

  /**
   * Update the current tutorial step
   */
  async _updateStep() {
    const step = this.steps[this.currentStep];
    const {
      tutorialIcon, tutorialTitle, tutorialDescription,
      tutorialSpotlight, tutorialPrev, tutorialNext
    } = this.elements;

    // Update step indicator
    document.querySelector('.step-current').textContent = this.currentStep + 1;
    document.querySelector('.step-total').textContent = this.steps.length;

    // Update content
    tutorialIcon.textContent = step.icon;
    tutorialTitle.textContent = step.title;
    tutorialDescription.innerHTML = step.description;

    // Update guide bee mascot
    const { tutorialGuideBee } = this.elements;
    if (tutorialGuideBee) {
      if (this.currentStep === 0) {
        tutorialGuideBee.src = 'logos/wave-bee.png';
      } else if (this.currentStep === 2) {
        tutorialGuideBee.src = 'logos/business-bee.png';
      } else if (this.currentStep === 3) {
        tutorialGuideBee.src = 'logos/wrench-bee.png';
      } else if (this.currentStep === 5) {
        tutorialGuideBee.src = 'logos/trophy-bee.png';
      } else {
        tutorialGuideBee.src = 'logos/pointing-bee.png';
      }

      // Manage sizes & positions
      tutorialGuideBee.classList.remove('large', 'extra-large', 'mega', 'pos-top', 'pos-right');

      if (this.currentStep === 2) {
        tutorialGuideBee.classList.add('extra-large');
      } else if (this.currentStep === 5) {
        tutorialGuideBee.classList.add('mega');
      } else if (this.currentStep === 0 || this.currentStep === 1 || this.currentStep === 3) {
        tutorialGuideBee.classList.add('large');
      }

      if (this.currentStep === 5) {
        tutorialGuideBee.classList.add('pos-top');
      } else if (this.currentStep === 3) {
        tutorialGuideBee.classList.add('pos-right');
      }
    }

    // Update navigation
    tutorialPrev.disabled = this.currentStep === 0;

    if (this.currentStep === this.steps.length - 1) {
      tutorialNext.textContent = 'Finish ✓';
      tutorialNext.classList.add('finish');
    } else {
      tutorialNext.textContent = 'Next →';
      tutorialNext.classList.remove('finish');
    }

    // Update spotlight and card position
    const tutorialContent = document.querySelector('.tutorial-content');

    // Always remove visible class first to ensure clean state
    tutorialSpotlight.classList.remove('visible');

    if (step.spotlight) {
      const targetElement = document.querySelector(step.spotlight);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();

        // Position spotlight
        tutorialSpotlight.style.left = `${rect.left - 10}px`;
        tutorialSpotlight.style.top = `${rect.top - 10}px`;
        tutorialSpotlight.style.width = `${rect.width + 20}px`;
        tutorialSpotlight.style.height = `${rect.height + 20}px`;
        
        // Force reflow to ensure position is applied before making visible
        void tutorialSpotlight.offsetHeight;
        
        // Make spotlight visible
        tutorialSpotlight.classList.add('visible');

        // Position card below spotlight
        this._positionCardBelowElement(tutorialContent, rect);
      } else {
        console.warn(`Tutorial target element not found: ${step.spotlight}`);
        this._centerCard(tutorialContent);
      }
    } else {
      this._centerCard(tutorialContent);
    }
  }

  /**
   * Position tutorial card below an element
   */
  _positionCardBelowElement(card, rect) {
    const cardTop = rect.bottom + 20;
    let cardLeft = rect.left + (rect.width / 2);

    // Clamp to viewport
    const cardWidth = 380;
    const cardHalfWidth = cardWidth / 2;
    const viewportWidth = window.innerWidth;
    const minLeft = cardHalfWidth + 20;
    const maxLeft = viewportWidth - cardHalfWidth - 20;

    cardLeft = Math.max(minLeft, Math.min(maxLeft, cardLeft));

    card.style.position = 'fixed';
    card.style.top = `${cardTop}px`;
    card.style.left = `${cardLeft}px`;
    card.style.bottom = 'auto';
    card.style.transform = 'translateX(-50%)';
  }

  /**
   * Center tutorial card on screen
   */
  _centerCard(card) {
    card.style.position = 'fixed';
    card.style.top = '50%';
    card.style.left = '50%';
    card.style.bottom = 'auto';
    card.style.transform = 'translate(-50%, -50%)';
  }
}

module.exports = { TutorialManager };
