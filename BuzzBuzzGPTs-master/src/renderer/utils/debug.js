/**
 * Debug Utilities
 * NDJSON logging and diagnostic helpers for development
 */

// Debug endpoint should be configured via environment variable
const DEBUG_ENDPOINT = process.env.DEBUG_ENDPOINT || null;
const DEBUG_SESSION = process.env.DEBUG_SESSION || 'debug-session';
let debugRunId = 'pre-fix';

// Check if running in development mode
const isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';

/**
 * Safe console logging that only runs in development
 * @param {...any} args - Arguments to log
 */
function log(...args) {
  if (isDev) {
    console.log('[DEV]', ...args);
  }
}

/**
 * Safe console error logging that only runs in development
 * @param {...any} args - Arguments to log
 */
function error(...args) {
  if (isDev) {
    console.error('[DEV]', ...args);
  }
}

/**
 * Safe console warning logging that only runs in development
 * @param {...any} args - Arguments to log
 */
function warn(...args) {
  if (isDev) {
    console.warn('[DEV]', ...args);
  }
}

/**
 * Set the debug run ID for grouping logs
 * @param {string} runId - Identifier for this debug run
 */
function setDebugRunId(runId) {
  debugRunId = runId;
}

/**
 * Send a debug log entry to the NDJSON endpoint
 * @param {string} hypothesisId - Identifier for the hypothesis being tested
 * @param {string} location - Code location (e.g., 'renderer.js:functionName')
 * @param {string} message - Human-readable log message
 * @param {object} data - Additional data to log
 */
function debugLog(hypothesisId, location, message, data) {
  // Only log if DEBUG_ENDPOINT is configured
  if (!DEBUG_ENDPOINT) {
    return;
  }
  
  try {
    fetch(DEBUG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION,
        runId: debugRunId,
        hypothesisId,
        location,
        message,
        data,
        timestamp: Date.now(),
      }),
    }).catch(() => { });
  } catch (_) {
    // Silently ignore debug logging failures
  }
}



module.exports = {
  debugLog,
  setDebugRunId,
  log,
  error,
  warn,
  isDev
};
