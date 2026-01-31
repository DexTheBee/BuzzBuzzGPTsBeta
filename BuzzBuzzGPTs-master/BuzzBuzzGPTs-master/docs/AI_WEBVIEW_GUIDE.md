# AI WebView Integration Guide

## Overview
Your BuzzBuzzGPTs app now integrates with popular AI services like WhisprGPT does - allowing you to use your own ChatGPT, Gemini, Claude, or Perplexity accounts directly within the app!

## How It Works

### 1. **Choose Your AI Service**
- Click the **Settings** button (⚙️)
- Select your preferred AI from the dropdown:
  - **ChatGPT** (chat.openai.com)
  - **Google Gemini** (gemini.google.com)
  - **Claude AI** (claude.ai)
  - **Perplexity AI** (perplexity.ai)

### 2. **Start Interview Session**
- Click **"Start Interview"** button
- A browser window will open inside the app
- **Login to your AI account** (you only need to do this once)
- The app remembers your session using `persist:ai-session`

### 3. **Take Screenshots**
- Press `Ctrl+H` or click the **Screenshot** button
- The screenshot is automatically captured
- It's copied to your clipboard
- A notification appears in the AI interface
- **Press `Ctrl+V`** to paste the screenshot into the AI chat
- Type your question or use the pre-filled prompt

### 4. **Get AI Responses**
- The AI processes your screenshot and question
- Responses appear directly in the embedded browser
- You can scroll, copy code, and interact normally

## Features

### ✓ Browser Controls
- **← Back** - Go to previous page
- **→ Forward** - Go to next page
- **⟳ Reload** - Refresh the current page
- **Close AI View** - Hide the AI interface

### ✓ Stealth Mode
- The AI interface is **invisible** to screen recording software
- Works seamlessly during Zoom, Teams, Google Meet interviews
- Only you can see the AI responses

### ✓ Click-Through
- Hover over the AI window to interact
- Move your mouse away and it becomes click-through
- Access other applications while AI window is open

### ✓ Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+H` | Take Screenshot |
| `Ctrl+Enter` | Trigger Solve (in AI chat) |
| `Ctrl+B` | Show/Hide Window |
| `Ctrl+G` | Start Over |
| Arrow Keys + `Ctrl` | Move window position |

## Supported AI Services

### ChatGPT (Recommended)
- Supports image uploads via clipboard
- Best for coding problems
- Works with ChatGPT Free, Plus, and Team accounts

### Google Gemini
- Excellent for multi-modal understanding
- Fast response times
- Free tier available

### Claude AI
- Great for detailed explanations
- Strong reasoning capabilities
- Supports large context windows

### Perplexity AI
- Real-time web search integration
- Fact-checking and sources
- Good for research questions

## Usage Workflow

```
1. Open BuzzBuzzGPTs
2. Click "Start Interview"
3. Login to your AI service
4. During interview:
   - See coding problem on screen
   - Press Ctrl+H (screenshot)
   - Press Ctrl+V in AI chat
   - Get solution
   - Read and understand
   - Implement solution
```

## Privacy & Security

- **Your credentials stay local** - We don't store or see your AI account passwords
- **Sessions are isolated** - Each AI service has its own session storage
- **No data collection** - Screenshots are temporary and never sent to our servers
- **Open source** - You can review all the code

## Troubleshooting

### Screenshot not pasting?
- Make sure the AI webview is in focus
- Try clicking inside the text input field first
- Press `Ctrl+V` to paste

### AI service not loading?
- Check your internet connection
- Try clicking the Reload button (⟳)
- Switch to a different AI service in Settings

### Can't login?
- The webview uses Chromium
- Enable cookies in the AI service settings
- Try clearing app data and logging in again

### Webview blank/white screen?
- This happens sometimes on first load
- Click the Reload button (⟳)
- Or close and reopen the AI view

## Next Steps

### Planned Features:
- [ ] Automatic screenshot paste (no Ctrl+V needed)
- [ ] Audio transcription support
- [ ] Custom AI prompts/templates
- [ ] Response extraction to clipboard
- [ ] Multiple AI tabs
- [ ] Conversation history

## Comparison to WhisprGPT

| Feature | BuzzBuzzGPTs | WhisprGPT |
|---------|-----------|-----------|
| Price | **Free & Open Source** | $20-30/month |
| AI Services | ChatGPT, Gemini, Claude, Perplexity | Same |
| Stealth Mode | ✅ Yes | ✅ Yes |
| Screenshots | ✅ Yes | ✅ Yes |
| Auto-paste | ⏳ Coming Soon | ✅ Yes |
| Audio Recording | ⏳ Planned | ✅ Yes |
| Customization | ✅ Full Source Access | ❌ Closed |

---

**Questions?** Open an issue on GitHub or contribute to the project!
