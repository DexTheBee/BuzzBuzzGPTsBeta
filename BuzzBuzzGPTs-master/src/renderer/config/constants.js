/**
 * Application Constants
 * Centralized configuration values used throughout the application
 */

// AI Service URLs for different providers
const AI_SERVICES = {
  chatgpt: 'https://chat.openai.com',
  gemini: 'https://gemini.google.com',
  claude: 'https://claude.ai/new',
  perplexity: 'https://www.perplexity.ai',
  openrouter: 'https://openrouter.ai/chat'
};

// Local storage keys for API keys
const API_KEY_STORAGE = {
  gemini: 'gemini_api_key',
  claude: 'claude_api_key',
  perplexity: 'perplexity_api_key'
};

// Help links for obtaining API keys
const API_KEY_HELP_LINKS = {

  gemini: 'https://aistudio.google.com/app/apikey',
  claude: 'https://console.anthropic.com/settings/keys',
  perplexity: 'https://www.perplexity.ai/settings/api'
};

// Human-readable service names
const SERVICE_NAMES = {
  chatgpt: 'ChatGPT (OpenAI)',
  gemini: 'Gemini (Google)',
  claude: 'Claude (Anthropic)',
  perplexity: 'Perplexity AI',
  openrouter: 'OpenRouter'
};

// Selectors for AI service input fields
const AI_INPUT_SELECTORS = {
  chatgpt: [
    'textarea[data-id="root"]',
    'textarea[placeholder*="Message"]',
    '#prompt-textarea'
  ],
  gemini: [
    'div[contenteditable="true"]',
    '.ql-editor',
    'textarea'
  ],
  claude: [
    'div[contenteditable="true"]',
    'textarea',
    '[role="textbox"]'
  ],
  perplexity: [
    'textarea[placeholder*="Ask"]',
    'textarea'
  ],
  openrouter: [
    'textarea',
    '#chat-input'
  ]
};
module.exports = {
  AI_SERVICES,
  API_KEY_STORAGE,
  API_KEY_HELP_LINKS,
  SERVICE_NAMES,
  AI_INPUT_SELECTORS
};
