# Architecture Note

## Current Active Files

This project currently uses the **LEGACY single-file architecture**:

### Active (Currently Used):
- `main.js` - Main process entry point (✅ ACTIVE)
- `renderer.js` - Renderer process entry point (✅ ACTIVE)
- `preload.js` - Preload script for secure IPC (✅ ACTIVE)

These files are loaded by:
- `package.json` line 5: `"main": "main.js"`
- `index.html` line 302: `<script src="renderer.js"></script>`

### Inactive (Not Currently Used):
- `src/main/index.js` - Modular main entry point (❌ NOT LOADED)
- `src/renderer/index.js` - Modular renderer entry point (❌ NOT LOADED)
- `src/main/**/*` - Modular main process files (❌ NOT LOADED)
- `src/renderer/**/*` - Modular renderer process files (❌ NOT LOADED)

## Why Keep the src/ Files?

The `src/` directory contains a **modular refactoring** that was started but never completed. These files demonstrate better code organization with:

- Separated concerns (UI components, utilities, config)
- Better maintainability
- Cleaner architecture

## Important Security Note

⚠️ **The src/renderer files CANNOT be used with contextIsolation enabled** because they use `require('electron')` directly, which violates the security model. If you want to switch to the modular architecture, you must:

1. Update all `src/renderer/**/*.js` files to use `window.electronAPI` instead of `require('electron')`
2. Change `package.json` main entry to `"src/main/index.js"`
3. Change `index.html` script tag to load `src/renderer/index.js`
4. Thoroughly test all functionality

## Recommendation

For now, **continue using the legacy files** (main.js, renderer.js) since:
- They work correctly with the security fixes
- They're battle-tested
- The modular refactor is incomplete

If you want to switch to modular in the future, create a separate branch and do a proper migration.

## To Remove src/ Files (Optional)

If you want to clean up and only keep the active files:

```bash
rm -rf src/
# Update package.json "files" section to remove "src/**/*"
```

**Note:** The src/ files are harmless to keep - they're just not loaded by the application.
