# Authentication Setup Complete! 🎉

## What was implemented:

### 1. Supabase Integration
- ✅ Installed `@supabase/supabase-js` and `dotenv`
- ✅ Created `.env` file with your Supabase credentials
- ✅ Created `src/main/supabase.js` - Supabase client for Electron
- ✅ Updated `.gitignore` to exclude `.env` (already present)

### 2. Authentication Window
- ✅ Created `auth-preload.js` - Secure preload script for auth window
- ✅ Updated `auth.js` to connect to Supabase
- ✅ Updated `main.js` to show auth window on first launch

### 3. Authentication Features
- ✅ Email/Password Sign In
- ✅ Email/Password Sign Up
- ✅ Google OAuth (opens external browser)
- ✅ GitHub OAuth (opens external browser)
- ✅ "Continue Offline" option (skips auth)
- ✅ Session persistence (saves to settings.json)

### 4. User Flow
1. **First launch**: Auth window appears
2. **User can**:
   - Sign in with existing account
   - Sign up for new account
   - Use Google/GitHub
   - Continue offline (limited features)
3. **After auth**: Main app window opens
4. **Next launches**: Goes directly to main app (logged in)

## How to test:

### Test 1: First Launch
```bash
# Delete settings file to simulate first launch
rm "%APPDATA%/buzzbuzzgpts/settings.json"

# Start app
npm start
```
You should see the auth window with login/signup tabs.

### Test 2: Sign Up
1. Click "Sign Up" tab
2. Enter email and password (min 8 chars)
3. Click "Create My Hive"
4. Check email for verification link
5. After verification, you can sign in

### Test 3: Sign In
1. Enter email and password
2. Click "Buzz In!"
3. Auth window closes
4. Main app opens

### Test 4: Continue Offline
1. Click "Continue Offline" button
2. Auth window closes
3. Main app opens
4. App won't ask for auth again

### Test 5: Google/GitHub OAuth
1. Click Google or GitHub button
2. External browser opens with OAuth flow
3. Complete authentication in browser
4. (Note: OAuth callback needs additional setup for desktop apps - see notes below)

## File Changes:

### New Files:
- `.env` - Supabase credentials (NOT committed to git)
- `src/main/supabase.js` - Supabase client
- `auth-preload.js` - Auth window preload script

### Modified Files:
- `main.js` - Added auth IPC handlers and auth window logic
- `auth.js` - Connected to Supabase APIs
- `package.json` - Added dependencies and auth-preload to build

## Important Notes:

### OAuth Callback Setup (Optional Enhancement)
Google/GitHub OAuth currently opens in external browser. To fully complete the OAuth flow, you need to:
1. Set up a local server to handle OAuth callbacks
2. Or use Supabase's PKCE flow for desktop apps
3. Or keep it simple: users complete auth in browser, then manually sign in to desktop app

For now, users can:
- Sign up in browser (website)
- Then sign in to desktop app with email/password

### Supabase Tables Required:
Make sure your Supabase project has the `profiles` table (as referenced in your website code). The auth system uses:
- Supabase Auth (built-in)
- `profiles` table for user metadata (optional)

### Security:
- ✅ `.env` excluded from git
- ✅ Context isolation enabled
- ✅ No node integration in renderer
- ✅ Secure IPC with contextBridge
- ⚠️ Note: `.env` is included in production build (so app works after install)

### Settings Storage:
User session is stored in:
- Windows: `%APPDATA%/buzzbuzzgpts/settings.json`
- Mac: `~/Library/Application Support/buzzbuzzgpts/settings.json`
- Linux: `~/.config/buzzbuzzgpts/settings.json`

## Troubleshooting:

### "Supabase not configured" error:
Check that `.env` file exists with correct credentials:
```
SUPABASE_URL=https://ezekyyyuskotihcdjetc.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

### Auth window doesn't appear:
Delete settings file to reset:
```bash
# Windows
del "%APPDATA%\buzzbuzzgpts\settings.json"

# Mac/Linux
rm ~/Library/Application\ Support/buzzbuzzgpts/settings.json
```

### "Invalid credentials" on sign in:
1. Make sure you signed up first
2. Check email for verification link
3. Verify your email before signing in

## Next Steps (Optional):

1. **Add password reset**: 
   - Add "Forgot password?" link in auth.html
   - Use `supabase.auth.resetPasswordForEmail(email)`

2. **Better OAuth handling**:
   - Set up deep links for OAuth callback
   - Or implement PKCE flow for desktop

3. **User profile display**:
   - Show user email in settings panel
   - Add sign out button

4. **Subscription sync**:
   - Fetch user subscription from Supabase
   - Enable/disable pro features based on tier

Would you like me to implement any of these enhancements?
