import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const AuthChecker = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize auth state from localStorage
    const initializeAuth = () => {
      try {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (userStr && token) {
          const user = JSON.parse(userStr);
          
          // Check if token is still valid (if using our authService logic)
          if (user.expirationTime && new Date().getTime() > user.expirationTime) {
            // Token expired, clear storage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            return;
          }
          
          // Dispatch action to set authenticated state
          dispatch({
            type: 'auth/setAuthState',
            payload: {
              isAuthenticated: true,
              user: user,
              token: token,
              loading: false
            }
          });
        } else {
          // No auth data, set unauthenticated state
          dispatch({
            type: 'auth/setAuthState',
            payload: {
              isAuthenticated: false,
              user: null,
              token: null,
              loading: false
            }
          });
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        dispatch({
          type: 'auth/setAuthState',
          payload: {
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false
          }
        });
      }
    };

    initializeAuth();
  }, [dispatch]);

  return children;
};

export default AuthChecker; 