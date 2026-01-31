/**
 * DOM Utilities
 * Helper functions for DOM manipulation and element queries
 */

/**
 * Get all DOM elements by their IDs
 * @param {string[]} ids - Array of element IDs
 * @returns {Object} Object mapping IDs to elements
 */
function getElementsByIds(ids) {
  const elements = {};
  for (const id of ids) {
    elements[id] = document.getElementById(id);
  }
  return elements;
}

/**
 * Add event listeners to multiple elements
 * @param {NodeList|Element[]} elements - Elements to attach listeners to
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 */
function addEventListeners(elements, event, handler) {
  elements.forEach(element => {
    if (element) {
      element.addEventListener(event, handler);
    }
  });
}

/**
 * Toggle visibility class on an element
 * @param {Element} element - DOM element
 * @param {boolean} visible - Whether to show or hide
 * @param {string} className - Class name to toggle (default: 'visible')
 */
function toggleVisibility(element, visible, className = 'visible') {
  if (!element) return;
  
  if (visible) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}

/**
 * Create an element with attributes and content
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Attributes to set
 * @param {string|Element} content - Inner content
 * @returns {Element} Created element
 */
function createElement(tag, attrs = {}, content = '') {
  const element = document.createElement(tag);
  
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else {
      element.setAttribute(key, value);
    }
  }
  
  if (typeof content === 'string') {
    element.textContent = content;
  } else if (content instanceof Element) {
    element.appendChild(content);
  }
  
  return element;
}

/**
 * Wait for DOM content to be loaded
 * @returns {Promise} Resolves when DOM is ready
 */
function domReady() {
  return new Promise(resolve => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve);
    } else {
      resolve();
    }
  });
}

module.exports = {
  getElementsByIds,
  addEventListeners,
  toggleVisibility,
  createElement,
  domReady
};
