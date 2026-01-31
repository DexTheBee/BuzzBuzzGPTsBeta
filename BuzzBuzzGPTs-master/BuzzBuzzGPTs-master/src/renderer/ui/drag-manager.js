/**
 * Drag Manager
 * Handles bee button joystick-style dragging for window movement
 */

/**
 * DragManager - manages window dragging via bee button
 */
class DragManager {
  constructor(beeBtn, ipcRenderer) {
    this.beeBtn = beeBtn;
    this.ipcRenderer = ipcRenderer;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.animationFrame = null;
    
    this._bindEvents();
  }

  /**
   * Bind drag event listeners
   */
  _bindEvents() {
    if (!this.beeBtn) return;
    
    this.beeBtn.addEventListener('mousedown', (e) => this._onMouseDown(e));
    document.addEventListener('mousemove', (e) => this._onMouseMove(e));
    document.addEventListener('mouseup', () => this._onMouseUp());
  }

  /**
   * Handle mouse down on bee button
   */
  _onMouseDown(e) {
    this.isDragging = true;
    this.dragStartX = e.screenX;
    this.dragStartY = e.screenY;
    this.beeBtn.classList.add('dragging');
    e.preventDefault();
  }

  /**
   * Handle mouse move during drag
   */
  _onMouseMove(e) {
    if (!this.isDragging) return;
    
    // Cancel any pending animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    // Use requestAnimationFrame for smooth movement
    this.animationFrame = requestAnimationFrame(() => {
      const deltaX = e.screenX - this.dragStartX;
      const deltaY = e.screenY - this.dragStartY;
      this.dragStartX = e.screenX;
      this.dragStartY = e.screenY;
      this.ipcRenderer.send('move-window', { deltaX, deltaY });
    });
  }

  /**
   * Handle mouse up to end drag
   */
  _onMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.beeBtn.classList.remove('dragging');
      
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
    }
  }
}

module.exports = { DragManager };
