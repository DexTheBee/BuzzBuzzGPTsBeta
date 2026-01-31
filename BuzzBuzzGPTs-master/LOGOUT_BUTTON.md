# Logout Button Added! 🎉

## What was added:

### 1. Logout Button in Settings Panel
- ✅ Added logout button to settings footer (next to Quit button)
- ✅ Shows user's email when logged in
- ✅ Shows "Offline Mode" when user continued offline
- ✅ Button changes to "Sign In" when in offline mode

### 2. Logout Functionality
- ✅ Signs out from Supabase
- ✅ Deletes local settings.json (clears session)
- ✅ Closes main window
- ✅ Opens auth window (login/signup screen)

### 3. User Info Display
- Shows user's email in settings footer when logged in
- Shows "Offline Mode" if user clicked "Continue Offline"
- Shows "Professional Assistant" if no user data

## Files Modified:

### 1. index.html
- Added `<button id="logout-btn">` to settings footer
- Changed user-info span to have an ID for dynamic updates

### 2. renderer.js
- Added `logoutBtn` and `userInfo` DOM element references
- Added `loadUserInfo()` function to display user email
- Added logout button click handler with confirmation
- Calls `window.electronAPI.logout()` on click

### 3. preload.js
- Added `logout()` method
- Added `getUserInfo()` method

### 4. main.js
- Added `auth:logout` IPC handler that:
  - Signs out from Supabase
  - Deletes settings.json
  - Closes main window
  - Opens auth window
- Added `auth:get-user-info` IPC handler that:
  - Reads user data from settings.json
  - Returns user email and offline mode status

### 5. src/styles/components/settings.css
- Updated footer-actions to have smaller gap (6px)
- Made user-info flex with ellipsis for long emails
- Made footer buttons smaller (9px font, 4px padding)

## How to Use:

### Step 1: Open Settings
Hover over the settings gear icon (⚙️) to open the settings panel.

### Step 2: Find the Logout Button
Look at the bottom of the settings panel. You'll see:
- Your email address (or "Offline Mode")
- **Logout** button (yellow)
- **Quit** button (red)

### Step 3: Click Logout
1. Click the "Logout" button
2. Confirm "Are you sure you want to logout?"
3. Main app window closes
4. Login/Signup window appears

### Step 4: Sign In Again
Use the login/signup window to:
- Sign in with your existing account
- Sign up for a new account
- Use Google/GitHub
- Continue Offline

## Visual Flow:

```
Main App (Logged In)
  └─> Settings Panel
      └─> Shows: "user@example.com"
      └─> Logout button visible
      └─> Click Logout
          └─> Confirmation dialog
              └─> Main window closes
              └─> Auth window opens
                  └─> Login/Signup screen
```

## Testing:

### Test 1: View User Email
```bash
npm start
```
- Open settings (hover over gear icon)
- Check footer: should show your email
- Logout button should be visible

### Test 2: Logout and Back to Auth
1. Click "Logout" button in settings
2. Confirm dialog
3. Main window should close
4. Auth window should appear

### Test 3: Sign In Again
1. Enter email and password in auth window
2. Click "Buzz In!"
3. Auth window closes
4. Main window opens
5. Settings shows email again

### Test 4: Offline Mode Display
1. Click "Continue Offline" in auth window
2. Main window opens
3. Open settings
4. Footer shows "Offline Mode"
5. Button shows "Sign In" instead of "Logout"

## Security Notes:

- ✅ Logout properly clears Supabase session
- ✅ Deletes local settings file (no cached credentials)
- ✅ User must re-authenticate after logout
- ✅ Confirmation dialog prevents accidental logout

## Next Features (Optional):

1. **Profile Settings**:
   - View/edit user profile
   - Change password
   - Update email

2. **Session Management**:
   - Auto-logout after inactivity
   - Remember me checkbox
   - Session timeout warnings

3. **Account Management**:
   - Delete account
   - Export user data
   - Subscription status

Would you like me to implement any of these features?
