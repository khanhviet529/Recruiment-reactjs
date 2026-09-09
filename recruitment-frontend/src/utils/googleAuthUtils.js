// Google OAuth session management utilities

/**
 * Clear Google OAuth session data completely
 */
export const clearGoogleSession = () => {
  try {
    console.log('Clearing Google OAuth session...');
    
    // Clear Google's session state cookies
    const googleCookies = [
      'g_state', 'g_csrf_token', '__Host-1PLSID', '__Host-3PLSID', 
      'SAPISID', 'APISID', 'SSID', 'HSID', 'SID', 'NID', '1P_JAR'
    ];
    
    googleCookies.forEach(cookieName => {
      // Clear for different domains
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.google.com;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.googleapis.com;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.accounts.google.com;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // Try to reset active Google accounts if the API is available
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.cancel();
        window.google.accounts.id.disableAutoSelect();
        console.log('Google accounts API session reset');
      } catch (e) {
        console.log('Google accounts API not available or already reset');
      }
    }
    
    // Clear session storage
    if (window.sessionStorage) {
      const googleSessionKeys = [
        'google_oauth_state',
        'google_auth_cache',
        'gapi.loaded_0',
        'gapi.auth2'
      ];
      
      googleSessionKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
    }
    
    // Clear local storage Google-related items
    if (window.localStorage) {
      const googleLocalKeys = [
        'google_oauth_credentials',
        'google_user_info'
      ];
      
      googleLocalKeys.forEach(key => {
        localStorage.removeItem(key);
      });
    }
    
    console.log('Google OAuth session cleared successfully');
  } catch (error) {
    console.error('Error clearing Google session:', error);
  }
};

/**
 * Initialize Google OAuth with proper settings for fresh login
 */
export const initializeGoogleAuth = () => {
  try {
    // Clear any existing session first
    clearGoogleSession();
    
    // Force Google to prompt for account selection
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.prompt((notification) => {
          console.log('Google account prompt notification:', notification);
        });
      } catch (e) {
        console.log('Google account prompt not available');
      }
    }
    
    console.log('Google OAuth initialized for fresh login');
  } catch (error) {
    console.error('Error initializing Google OAuth:', error);
  }
};

/**
 * Reset Google OAuth state before login attempt
 */
export const resetGoogleAuthState = () => {
  return new Promise((resolve) => {
    try {
      console.log('Resetting Google OAuth state...');
      
      // Clear cookies and session
      clearGoogleSession();
      
      // Wait a bit for cleanup to complete
      setTimeout(() => {
        console.log('Google OAuth state reset complete');
        resolve();
      }, 100);
      
    } catch (error) {
      console.error('Error resetting Google OAuth state:', error);
      resolve(); // Don't block the login process
    }
  });
};

/**
 * Handle Google login success with proper data validation
 */
export const handleGoogleLoginSuccess = (credentialResponse, dispatch, loginAction) => {
  try {
    if (!credentialResponse || !credentialResponse.credential) {
      throw new Error('Invalid Google credential response');
    }
    
    // Decode the JWT token
    const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
    console.log('Google login successful for:', decoded.email);
    
    // Validate required fields
    if (!decoded.sub || !decoded.email) {
      throw new Error('Missing required Google user data');
    }
    
    // Dispatch the login action
    dispatch(loginAction(decoded));
    
  } catch (error) {
    console.error('Error handling Google login success:', error);
    throw error;
  }
};

/**
 * Handle Google login error
 */
export const handleGoogleLoginError = (error) => {
  console.error('Google login failed:', error);
  
  // Clear any partial session data
  clearGoogleSession();
  
  // You can add error reporting here if needed
  return {
    success: false,
    error: 'Google login failed. Please try again.'
  };
};

export default {
  clearGoogleSession,
  initializeGoogleAuth,
  resetGoogleAuthState,
  handleGoogleLoginSuccess,
  handleGoogleLoginError
}; 