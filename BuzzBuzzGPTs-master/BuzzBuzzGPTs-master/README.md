# BuzzBuzzGPTs

An AI-powered interview assistant with screenshot capture and stealth mode. Works as a floating overlay that's invisible in screen recordings.

## ✨ Features

- 🎯 **Floating Toolbar** - Always-on-top overlay that stays visible during interviews
- 📸 **Screenshot Capture** - Capture and auto-paste to AI chat (Ctrl+H)
- 🤖 **Multi-AI Support** - ChatGPT, Gemini, Claude, Perplexity, and OpenRouter integration
- 👻 **Stealth Mode** - Invisible in screen recordings and shares
- 🎨 **Sleek Dark Theme** - Golden amber accents on a dark background
- 📖 **Interactive Tutorial** - Guided walkthrough for new users

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the application
npm start
```



## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Show/Hide | `Ctrl + B` |
| Screenshot | `Ctrl + H` |
| Solve | `Ctrl + Enter` |
| Start Over | `Ctrl + G` |
| Move Window | `Ctrl + Arrow Keys` |

## 📁 Project Structure

```
buzzbuzzgpts/
├── 📄 main.js              # Electron main process (entry point)
├── 📄 renderer.js          # Renderer process (UI logic)
├── 📄 index.html           # Main UI markup
├── 📄 styles.css           # All styles (dark theme)
├── 📄 set-window-stealth.js # Windows stealth mode
├── 📄 package.json         # Dependencies & build config
│
├── 📁 src/                 # Modular source code
│   ├── 📁 main/            # Main process modules
│   │   ├── index.js        # Main entry (modular)
│   │   ├── window.js       # Window management
│   │   ├── shortcuts.js    # Global shortcuts
│   │   └── ipc-handlers.js # IPC handlers
│   │
│   ├── 📁 renderer/        # Renderer modules
│   │   ├── index.js        # Renderer entry (modular)
│   │   ├── 📁 config/      # Configuration
│   │   │   ├── constants.js
│   │   │   └── tutorial-steps.js
│   │   ├── 📁 features/    # Feature modules
│   │   │   └── (empty)
│   │   ├── 📁 ui/          # UI components
│   │   │   ├── api-keys.js
│   │   │   ├── click-through.js
│   │   │   ├── drag-manager.js
│   │   │   ├── service-selector.js
│   │   │   ├── settings.js
│   │   │   ├── tutorial.js
│   │   │   └── webview.js
│   │   └── 📁 utils/       # Utilities
│   │       ├── debug.js
│   │       └── dom.js
│   │
│   └── 📁 styles/          # Modular CSS
│       ├── main.css        # CSS entry point
│       ├── variables.css   # Design tokens
│       ├── base.css        # Reset & base
│       ├── 📁 components/  # Component styles
│       │   ├── toolbar.css
│       │   ├── buttons.css
│       │   ├── settings.css
│       │   ├── tutorial.css
│       │   ├── service-selector.css
│       │   ├── webview.css
│       │   └── api-keys.css
│       └── 📁 utils/
│           └── animations.css
│
├── 📁 docs/                # Documentation
│   ├── BUILD.md
│   ├── INSTALL.md
│   ├── DISTRIBUTION.md
│   └── ...more guides
│
├── 📁 scripts/             # Build scripts
│   ├── build-and-checksum.ps1
│   └── build-and-checksum.bat
│
├── 📁 public/              # Static assets
│   ├── 📁 logos/
│   └── 📁 icons/
│
└── 📁 build/               # Build resources
    └── (icon files go here)
```

## 🏗️ Building for Production

### Quick Build (Recommended)

```powershell
# PowerShell (generates checksum automatically)
.\scripts\build-and-checksum.ps1
```

### Manual Build

```bash
npm run build:win    # Windows
npm run build:mac    # macOS  
npm run build:linux  # Linux
```

Output goes to `dist/` folder.

## 🎨 Customization

### Colors (CSS Variables)

Edit `styles.css` or `src/styles/variables.css`:

```css
:root {
  --primary-gold: #E8A838;
  --primary-gold-light: #FFD166;
  --bg-dark: rgba(28, 28, 30, 0.95);
  --bg-card: rgba(44, 44, 46, 0.9);
}
```

### Adding AI Services

Edit `src/renderer/config/constants.js`:

```javascript
const AI_SERVICES = {
  chatgpt: 'https://chat.openai.com',
  // Add your service:
  myai: 'https://myai.example.com'
};
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [INSTALL.md](docs/INSTALL.md) | User installation guide |
| [BUILD.md](docs/BUILD.md) | Detailed build instructions |
| [DISTRIBUTION.md](docs/DISTRIBUTION.md) | Marketing & hosting |

## 🔧 Development

```bash
# Start in development mode
npm start

# With DevTools (F12 or Ctrl+Shift+I)
```

### Code Organization

- **Legacy files** (`main.js`, `renderer.js`, `styles.css`) - Single-file versions, maintained for compatibility
- **Modular files** (`src/`) - Well-organized modules for easier maintenance

Both work identically. Use modular files for new development.

## 📜 License

MIT License - Use, modify, and distribute freely!

## ⚠️ Disclaimer

This tool is for educational and practice purposes. Use responsibly and ethically.
