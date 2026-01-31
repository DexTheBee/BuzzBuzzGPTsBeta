/**
 * BuzzBuzzGPTs - Auth Page Handler
 * Handles sign-in/sign-up UI interactions and OAuth
 */

// DOM Elements
const closeBtn = document.getElementById('close-btn');
const signinForm = document.getElementById('signin-form');
const signupLink = document.getElementById('signup-link');
const googleBtn = document.getElementById('google-signin');
const githubBtn = document.getElementById('github-signin');

// Close Button
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.closeWindow) {
      window.electronAPI.closeWindow();
    }
  });
}

// Sign Up Link
if (signupLink) {
  signupLink.addEventListener('click', () => {
    alert('Sign up coming soon! For now, try signing in with Google or GitHub, or continue offline.');
  });
}

// Sign In Form
if (signinForm) {
  signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const submitBtn = signinForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Buzzing in...</span>';
    
    try {
      const result = await window.electronAPI.authSignIn(email, password);
      
      if (result.error) {
        alert('Sign in failed: ' + result.error);
      } else {
        submitBtn.innerHTML = '<span>Success! 🐝</span>';
      }
    } catch (error) {
      alert('Sign in failed: ' + error.message);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// Google OAuth Button
if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    const originalHTML = googleBtn.innerHTML;
    googleBtn.disabled = true;
    googleBtn.innerHTML = '<span>Opening Google...</span>';
    
    try {
      const result = await window.electronAPI.authSignInWithGoogle();
      
      if (result.error) {
        alert('Google sign-in failed: ' + result.error);
        googleBtn.disabled = false;
        googleBtn.innerHTML = originalHTML;
      } else if (result.success) {
        googleBtn.innerHTML = '<span>Success! 🐝</span>';
        // Auth window will close automatically
      }
    } catch (error) {
      alert('Google sign-in failed: ' + error.message);
      googleBtn.disabled = false;
      googleBtn.innerHTML = originalHTML;
    }
  });
}

// GitHub OAuth Button
if (githubBtn) {
  githubBtn.addEventListener('click', async () => {
    const originalHTML = githubBtn.innerHTML;
    githubBtn.disabled = true;
    githubBtn.innerHTML = '<span>Opening GitHub...</span>';
    
    try {
      const result = await window.electronAPI.authSignInWithGithub();
      
      if (result.error) {
        alert('GitHub sign-in failed: ' + result.error);
        githubBtn.disabled = false;
        githubBtn.innerHTML = originalHTML;
      } else if (result.success) {
        githubBtn.innerHTML = '<span>Success! 🐝</span>';
        // Auth window will close automatically
      }
    } catch (error) {
      alert('GitHub sign-in failed: ' + error.message);
      githubBtn.disabled = false;
      githubBtn.innerHTML = originalHTML;
    }
  });
}
