/**
 * Tutorial Step Definitions
 * Each step defines content and spotlight target for the interactive tutorial
 */

const TUTORIAL_STEPS = [
  {
    icon: '👋',
    title: 'Welcome to BuzzBuzzGPTs!',
    description: 'Your AI-powered interview assistant. Let me show you how to use all the features in just a few quick steps!',
    spotlight: null,
    action: null
  },
  {
    icon: '🐝',
    title: 'Drag the Bee to Move',
    description: 'Click and hold the bee button to drag the entire menu anywhere on your screen. Position it wherever you need it!',
    spotlight: '#bee-btn',
    action: null
  },
  {
    icon: '🎯',
    title: 'Start Your Interview',
    description: 'Click "Start Interview" to choose an AI assistant. Pick from ChatGPT, Gemini, Claude, or Perplexity!',
    spotlight: '#start-btn',
    action: null
  },
  {
    icon: '🎛️',
    title: 'Control Toolbar',
    description: 'When you start an interview, this toolbar appears with the Screenshot (<kbd>Ctrl</kbd> + <kbd>H</kbd>) button. Use it to capture your screen and paste it directly into the AI assistant!',
    spotlight: '#toolbar',
    action: null
  },
  {
    icon: '⚙️',
    title: 'Customize Settings',
    description: 'Click the settings gear to configure display, languages, API keys, and view all keyboard shortcuts.',
    spotlight: '#settings-btn',
    action: null
  },
  {
    icon: '✨',
    title: 'You\'re Ready!',
    description: 'Click "Start Interview" to begin. The app is invisible in screen recordings (stealth mode). Good luck!',
    spotlight: null,
    action: null
  }
];

module.exports = { TUTORIAL_STEPS };
