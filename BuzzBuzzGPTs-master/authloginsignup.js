/**
 * Authentication Login/Signup Handler for Electron
 */

// Rate limiting
const rateLimiter = {
  attempts: 0,
  lastAttempt: 0,
  maxAttempts: 5,
  lockoutDuration: 5 * 60 * 1000, // 5 minutes
  
  canAttempt() {
    const now = Date.now();
    
    // Reset if lockout duration has passed
    if (now - this.lastAttempt > this.lockoutDuration) {
      this.attempts = 0;
    }
    
    return this.attempts < this.maxAttempts;
  },
  
  recordAttempt() {
    this.attempts++;
    this.lastAttempt = Date.now();
  },
  
  getRemainingTime() {
    const elapsed = Date.now() - this.lastAttempt;
    const remaining = this.lockoutDuration - elapsed;
    return Math.ceil(remaining / 1000 / 60); // minutes
  }
};

// Validation helpers
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 8;
}

// Show error message on page
function showError(message, formType = 'login') {
  const errorDiv = formType === 'signup' 
    ? document.getElementById('signup-error-message')
    : document.getElementById('error-message');
    
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }
}

// Hide error message
function hideError(formType = 'login') {
  const errorDiv = formType === 'signup'
    ? document.getElementById('signup-error-message')
    : document.getElementById('error-message');
    
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

// Show loading state
function setLoading(button, loading) {
  const btnText = button.querySelector('.btn-text');
  const btnSpinner = button.querySelector('.btn-spinner');
  
  if (loading) {
    button.classList.add('loading');
    button.disabled = true;
    if (btnText) btnText.style.opacity = '0';
    if (btnSpinner) btnSpinner.style.display = 'inline-block';
  } else {
    button.classList.remove('loading');
    button.disabled = false;
    if (btnText) btnText.style.opacity = '1';
    if (btnSpinner) btnSpinner.style.display = 'none';
  }
}

// Handle login
async function handleLogin(event) {
  event.preventDefault();
  
  const loginBtn = document.getElementById('login-btn');
  
  // Hide any previous errors
  hideError('login');
  
  // Check rate limiting
  if (!rateLimiter.canAttempt()) {
    const minutes = rateLimiter.getRemainingTime();
    showError(`Too many failed attempts. Please try again in ${minutes} minute(s)`, 'login');
    return;
  }
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  
  // Validation
  if (!email || !password) {
    showError('Please enter both email and password', 'login');
    return;
  }
  
  if (!validateEmail(email)) {
    showError('Please enter a valid email address', 'login');
    return;
  }
  
  if (!window.electronAPI) {
    showError('Electron API not available', 'login');
    return;
  }
  
  setLoading(loginBtn, true);
  
  try {
    const result = await window.electronAPI.authSignIn(email, password);
    
    if (!result.success) {
      // Record failed attempt
      rateLimiter.recordAttempt();
      
      setLoading(loginBtn, false);
      let errorMessage = result.error || 'Unknown error';
      
      // User-friendly error messages
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email before logging in';
      } else if (errorMessage.includes('network')) {
        errorMessage = 'Network error. Please check your connection';
      }
      
      showError('Login failed: ' + errorMessage, 'login');
      return;
    }
    
    if (result.user) {
      // Reset rate limiter on success
      rateLimiter.attempts = 0;
      
      // Keep loading state while transitioning
      window.electronAPI.continueOffline();
    }
  } catch (err) {
    rateLimiter.recordAttempt();
    setLoading(loginBtn, false);
    showError('Network error. Please check your connection', 'login');
  }
}

// Handle signup
async function handleSignup(event) {
  event.preventDefault();
  
  const signupBtn = document.getElementById('signup-btn');
  
  // Hide any previous errors
  hideError('signup');
  
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;
  
  // Validation
  if (!name || !email || !password || !confirmPassword) {
    showError('Please fill in all fields', 'signup');
    return;
  }
  
  if (!validateEmail(email)) {
    showError('Please enter a valid email address', 'signup');
    return;
  }
  
  if (!validatePassword(password)) {
    showError('Password must be at least 8 characters long', 'signup');
    return;
  }
  
  if (password !== confirmPassword) {
    showError('Passwords do not match', 'signup');
    return;
  }
  
  if (!window.electronAPI) {
    showError('Electron API not available', 'signup');
    return;
  }
  
  setLoading(signupBtn, true);
  
  try {
    const result = await window.electronAPI.authSignUp(email, password, name);
    
    if (!result.success) {
      setLoading(signupBtn, false);
      let errorMessage = result.error || 'Unknown error';
      
      // User-friendly error messages
      if (errorMessage.includes('already registered')) {
        errorMessage = 'This email is already registered. Please log in instead';
      } else if (errorMessage.includes('password')) {
        errorMessage = 'Password is too weak. Please use a stronger password';
      } else if (errorMessage.includes('network')) {
        errorMessage = 'Network error. Please check your connection';
      }
      
      showError('Signup failed: ' + errorMessage, 'signup');
      return;
    }
    
    if (result.user) {
      // Success - switch back to login and show message
      showLoginForm();
      showError('Account created successfully! Please log in', 'login');
      setLoading(signupBtn, false);
    }
  } catch (err) {
    setLoading(signupBtn, false);
    showError('Network error. Please check your connection', 'signup');
  }
}

// Handle Google OAuth
async function handleGoogleLogin() {
  const googleBtn = document.getElementById('google-btn');
  
  // Hide any previous errors
  hideError('login');
  
  if (!window.electronAPI) {
    showError('Electron API not available', 'login');
    return;
  }
  
  setLoading(googleBtn, true);
  
  try {
    const result = await window.electronAPI.authSignInWithGoogle();
    
    if (!result.success && result.error) {
      setLoading(googleBtn, false);
      showError('Google login failed: ' + result.error, 'login');
    }
    // OAuth window will handle success/error events
  } catch (err) {
    setLoading(googleBtn, false);
    showError('Network error. Please check your connection', 'login');
  }
}

// Handle GitHub OAuth
async function handleGitHubLogin() {
  const githubBtn = document.getElementById('github-btn');
  
  // Hide any previous errors
  hideError('login');
  
  if (!window.electronAPI) {
    showError('Electron API not available', 'login');
    return;
  }
  
  setLoading(githubBtn, true);
  
  try {
    const result = await window.electronAPI.authSignInWithGithub();
    
    if (!result.success && result.error) {
      setLoading(githubBtn, false);
      showError('GitHub login failed: ' + result.error, 'login');
    }
    // OAuth window will handle success/error events
  } catch (err) {
    setLoading(githubBtn, false);
    showError('Network error. Please check your connection', 'login');
  }
}

// Show login form
function showLoginForm() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  
  if (loginForm) loginForm.style.display = 'block';
  if (signupForm) signupForm.style.display = 'none';
  
  // Clear signup form
  const signupName = document.getElementById('signup-name');
  const signupEmail = document.getElementById('signup-email');
  const signupPassword = document.getElementById('signup-password');
  const signupConfirmPassword = document.getElementById('signup-confirm-password');
  
  if (signupName) signupName.value = '';
  if (signupEmail) signupEmail.value = '';
  if (signupPassword) signupPassword.value = '';
  if (signupConfirmPassword) signupConfirmPassword.value = '';
  
  hideError('signup');
}

// Show signup form
function showSignupForm() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  
  if (loginForm) loginForm.style.display = 'none';
  if (signupForm) signupForm.style.display = 'block';
  
  hideError('login');
}

// Real-time email validation
function setupEmailValidation() {
  const signupEmail = document.getElementById('signup-email');
  const emailHint = document.getElementById('email-hint');
  
  if (signupEmail && emailHint) {
    signupEmail.addEventListener('input', () => {
      const email = signupEmail.value.trim();
      
      if (email.length === 0) {
        emailHint.textContent = '';
        emailHint.className = 'input-hint';
        return;
      }
      
      if (validateEmail(email)) {
        emailHint.textContent = '✓ Valid email';
        emailHint.className = 'input-hint success';
      } else {
        emailHint.textContent = '✗ Invalid email format';
        emailHint.className = 'input-hint error';
      }
    });
  }
}

// Real-time password validation
function setupPasswordValidation() {
  const signupPassword = document.getElementById('signup-password');
  const passwordHint = document.getElementById('password-hint');
  
  if (signupPassword && passwordHint) {
    signupPassword.addEventListener('input', () => {
      const password = signupPassword.value;
      
      if (password.length === 0) {
        passwordHint.textContent = '';
        passwordHint.className = 'input-hint';
        return;
      }
      
      if (validatePassword(password)) {
        passwordHint.textContent = `✓ Strong password (${password.length} characters)`;
        passwordHint.className = 'input-hint success';
      } else {
        passwordHint.textContent = `✗ Too short (${password.length}/8 characters minimum)`;
        passwordHint.className = 'input-hint error';
      }
    });
  }
}

// Listen for auth events from main process
if (window.electronAPI) {
  window.electronAPI.onAuthSuccess((event, data) => {
    // OAuth success - close loading states
    const googleBtn = document.getElementById('google-btn');
    const githubBtn = document.getElementById('github-btn');
    
    if (googleBtn) setLoading(googleBtn, false);
    if (githubBtn) setLoading(githubBtn, false);
    
    // Close auth window and open main app immediately
    window.electronAPI.continueOffline();
  });
  
  window.electronAPI.onAuthError((event, error) => {
    // OAuth error - close loading states
    const googleBtn = document.getElementById('google-btn');
    const githubBtn = document.getElementById('github-btn');
    
    if (googleBtn) setLoading(googleBtn, false);
    if (githubBtn) setLoading(githubBtn, false);
    
    showError('Authentication failed: ' + error, 'login');
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check online status
  function updateOnlineStatus() {
    if (!navigator.onLine) {
      showError('No internet connection. Please check your network', 'login');
    }
  }
  
  // Listen for online/offline events
  window.addEventListener('online', () => {
    hideError('login');
    hideError('signup');
  });
  
  window.addEventListener('offline', () => {
    showError('No internet connection. Please check your network', 'login');
  });
  
  // Initial check
  updateOnlineStatus();
  
  // Setup click-through control for auth box
  const authBox = document.getElementById('auth-box');
  if (authBox && window.electronAPI) {
    authBox.addEventListener('mouseenter', () => {
      window.electronAPI.setClickThrough(false);
    });
    
    authBox.addEventListener('mouseleave', () => {
      window.electronAPI.setClickThrough(true);
    });
  }
  
  // Setup validation
  setupEmailValidation();
  setupPasswordValidation();
  
  // Login form event listeners
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }
  
  const googleBtn = document.getElementById('google-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', handleGoogleLogin);
  }
  
  const githubBtn = document.getElementById('github-btn');
  if (githubBtn) {
    githubBtn.addEventListener('click', handleGitHubLogin);
  }
  
  const passwordField = document.getElementById('password');
  if (passwordField) {
    passwordField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleLogin(e);
      }
    });
  }
  
  // Signup form event listeners
  const signupBtn = document.getElementById('signup-btn');
  if (signupBtn) {
    signupBtn.addEventListener('click', handleSignup);
  }
  
  const signupConfirmPassword = document.getElementById('signup-confirm-password');
  if (signupConfirmPassword) {
    signupConfirmPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSignup(e);
      }
    });
  }
  
  // Form toggle links
  const showSignupLink = document.getElementById('show-signup');
  if (showSignupLink) {
    showSignupLink.addEventListener('click', (e) => {
      e.preventDefault();
      showSignupForm();
    });
  }
  
  const showLoginLink = document.getElementById('show-login');
  if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      showLoginForm();
    });
  }
  
  // Forgot password link (placeholder)
  const forgotPasswordLink = document.getElementById('forgot-password-link');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      showError('Password reset feature coming soon! Please contact support for assistance.', 'login');
    });
  }
});
