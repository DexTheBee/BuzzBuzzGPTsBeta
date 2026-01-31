const { desktopCapturer } = require('electron');
const fs = require('fs');
const path = require('path');

/**
 * Capture the entire screen and return as base64
 * This should be called from the MAIN process
 */
async function captureScreen() {
  try {
    console.log('captureScreen called in main process');
    
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });

    console.log('Desktop sources found:', sources.length);

    if (sources.length === 0) {
      throw new Error('No screen sources found');
    }

    // Get the primary screen
    const primarySource = sources[0];
    const screenshot = primarySource.thumbnail;

    // Convert to base64
    const base64Data = screenshot.toDataURL().replace(/^data:image\/png;base64,/, '');
    
    console.log('Screenshot captured, size:', base64Data.length);
    
    return {
      dataUrl: screenshot.toDataURL(),
      base64: base64Data,
      buffer: screenshot.toPNG()
    };
  } catch (error) {
    console.error('Screenshot capture error:', error);
    throw error;
  }
}

/**
 * Save screenshot to temp file
 */
async function saveScreenshotTemp(screenshotData) {
  const tempDir = path.join(__dirname, 'temp');
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const filename = `screenshot-${Date.now()}.png`;
  const filepath = path.join(tempDir, filename);
  
  fs.writeFileSync(filepath, screenshotData.buffer);
  
  return filepath;
}

/**
 * Inject JavaScript to send screenshot to AI service
 * This will be called from the renderer when screenshot is taken
 */
function getAIInjectionScript(service, screenshotDataUrl) {
  const scripts = {
    chatgpt: `
      (async function() {
        // Wait for page to be ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Find the textarea
        const textarea = document.querySelector('textarea[data-id="root"]') || 
                        document.querySelector('#prompt-textarea');
        
        if (!textarea) {
          console.log('ChatGPT textarea not found');
          return 'Error: Could not find input field';
        }
        
        // Focus on textarea
        textarea.focus();
        
        // Trigger input to enable buttons
        textarea.value = 'Here is a screenshot from my coding interview. Can you help me solve this problem?';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Find and click the attach button
        const attachBtn = document.querySelector('button[aria-label="Attach files"]');
        if (attachBtn) {
          attachBtn.click();
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        return 'Screenshot prepared - please manually paste the image for now';
      })()
    `,
    
    gemini: `
      (async function() {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const textarea = document.querySelector('rich-textarea[aria-label="Enter a prompt here"]') ||
                        document.querySelector('.ql-editor');
        
        if (!textarea) {
          return 'Error: Could not find Gemini input field';
        }
        
        textarea.focus();
        textarea.textContent = 'Here is a screenshot from my coding interview. Can you help me solve this problem?';
        
        return 'Screenshot prepared - please manually paste the image';
      })()
    `,
    
    claude: `
      (async function() {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const textarea = document.querySelector('[contenteditable="true"]');
        
        if (!textarea) {
          return 'Error: Could not find Claude input field';
        }
        
        textarea.focus();
        textarea.textContent = 'Here is a screenshot from my coding interview. Can you help me solve this problem?';
        
        return 'Screenshot prepared - please manually paste the image';
      })()
    `,
    
    perplexity: `
      (async function() {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const textarea = document.querySelector('textarea');
        
        if (!textarea) {
          return 'Error: Could not find Perplexity input field';
        }
        
        textarea.focus();
        textarea.value = 'Here is a screenshot from my coding interview. Can you help me solve this problem?';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        
        return 'Screenshot prepared - please manually paste the image';
      })()
    `
  };

  return scripts[service] || scripts.chatgpt;
}

module.exports = {
  captureScreen,
  saveScreenshotTemp,
  getAIInjectionScript
};
