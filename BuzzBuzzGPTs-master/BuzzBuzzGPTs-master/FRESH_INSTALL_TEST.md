# Fresh Install Test Guide 🐝

## Current Setup - Perfect! ✅

Your app is already configured to show the login/signup window on fresh install:

### Flow Diagram:
```
First Launch (Fresh Download)
    ↓
Check: Does settings.json exist?
    ↓ NO
Show Auth Window (Login/Signup)
    ↓
User Signs In/Signs Up
    ↓
Save to settings.json:
  - isLoggedIn: true
  - user: { email, id }
    ↓
Close Auth Window
    ↓
Open Main Window (Menu)
```

```
Second Launch (Already Logged In)
    ↓
Check: Does settings.json exist?
    ↓ YES
Read settings.json
    ↓
isLoggedIn = true?
    ↓ YES
Skip Auth Window
    ↓
Open Main Window Directly (Menu)
```

## Testing Instructions:

### Test 1: Fresh Install Experience
I've already cleared your app data, so when you run:
```bash
npm start
```

You will see:
1. ✅ Auth window appears (login/signup screen)
2. ✅ No main menu yet
3. You can:
   - Sign in with existing account
   - Sign up for new account
   - Use Google/GitHub OAuth
   - Click "Continue Offline"

### Test 2: After Login
Once you sign in or sign up:
1. ✅ Auth window closes
2. ✅ Main menu window opens
3. ✅ Settings.json is saved to:
   - Windows: `%APPDATA%\buzzbuzzgpts\settings.json`

### Test 3: Second Launch (Returning User)
Close the app, then run `npm start` again:
1. ✅ Auth window is SKIPPED
2. ✅ Main menu opens immediately
3. ✅ Settings shows your email
4. ✅ Logout button is visible

## What Gets Saved:

### File: `%APPDATA%\buzzbuzzgpts\settings.json`
```json
{
  "isLoggedIn": true,
  "hasAccount": true,
  "user": {
    "id": "user-id-from-supabase",
    "email": "your@email.com"
  }
}
```

OR if you clicked "Continue Offline":
```json
{
  "offlineMode": true,
  "hasAccount": true
}
```

## To Reset (Simulate Fresh Install Again):

### Windows:
```bash
rmdir /S /Q "%APPDATA%\buzzbuzzgpts"
npm start
```

### PowerShell:
```powershell
Remove-Item "$env:APPDATA\buzzbuzzgpts" -Recurse -Force -ErrorAction SilentlyContinue
npm start
```

## Current Status:

✅ Settings cleared - You're ready for fresh install experience
✅ Run `npm start` now to see the login/signup window
✅ After login, it will save locally
✅ Next `npm start` will skip auth and go straight to menu

## Ready to Test!

Just run:
```bash
cd "C:\Users\khan1\Videos\BuzzBuzzProduc\BuzzBuzzGPTs-master"
npm start
```

You'll see the auth window first! 🎉
