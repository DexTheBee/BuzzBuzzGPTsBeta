/**
 * Input Validation Utilities
 * Validates IPC handler inputs to prevent crashes and security issues
 */

/**
 * Validate numeric input
 * @param {any} value - Value to validate
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 * @returns {boolean}
 */
function isValidNumber(value, min = -Infinity, max = Infinity) {
  return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
}

/**
 * Validate string input
 * @param {any} value - Value to validate
 * @param {number} maxLength - Maximum length (optional)
 * @returns {boolean}
 */
function isValidString(value, maxLength = 10000) {
  return typeof value === 'string' && value.length <= maxLength;
}

/**
 * Validate boolean input
 * @param {any} value - Value to validate
 * @returns {boolean}
 */
function isValidBoolean(value) {
  return typeof value === 'boolean';
}

/**
 * Validate object input
 * @param {any} value - Value to validate
 * @returns {boolean}
 */
function isValidObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validate window dimensions
 * @param {object} dimensions - Object with width and height
 * @returns {boolean}
 */
function isValidDimensions(dimensions) {
  if (!isValidObject(dimensions)) return false;
  const { width, height } = dimensions;
  return isValidNumber(width, 1, 10000) && isValidNumber(height, 1, 10000);
}

/**
 * Validate delta movement
 * @param {object} delta - Object with deltaX and deltaY
 * @returns {boolean}
 */
function isValidDelta(delta) {
  if (!isValidObject(delta)) return false;
  const { deltaX, deltaY } = delta;
  return isValidNumber(deltaX, -5000, 5000) && isValidNumber(deltaY, -5000, 5000);
}

/**
 * Validate screenshot options
 * @param {object} options - Screenshot options
 * @returns {boolean}
 */
function isValidScreenshotOptions(options) {
  if (!isValidObject(options)) return false;
  
  // Optional properties validation
  if (options.format && !['png', 'jpg', 'jpeg'].includes(options.format)) {
    return false;
  }
  
  if (options.quality && !isValidNumber(options.quality, 0, 100)) {
    return false;
  }
  
  return true;
}

/**
 * Sanitize user input by removing potentially dangerous characters
 * @param {string} input - String to sanitize
 * @returns {string}
 */
function sanitizeString(input) {
  if (!isValidString(input)) return '';
  // Remove null bytes and control characters
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x1F\x7F]/g, '');
}

module.exports = {
  isValidNumber,
  isValidString,
  isValidBoolean,
  isValidObject,
  isValidDimensions,
  isValidDelta,
  isValidScreenshotOptions,
  sanitizeString
};
