import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ClipLoader } from 'react-spinners';
import authService from '../services/authService';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [localAuth, setLocalAuth] = useState({ 
    checked: false, 
    isAuthenticated: false, 
    user: null 
  });
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    // Check authentication from authService directly
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser();
      const isLoggedIn = authService.isLoggedIn();
      
      console.log('PrivateRoute: Checking auth for', location.pathname, { isLoggedIn, currentUser: currentUser?.role });
      
      setLocalAuth({
        checked: true,
        isAuthenticated: isLoggedIn,
        user: currentUser
      });

      // Sync with Redux if needed
      if (isLoggedIn && currentUser && !isAuthenticated) {
        dispatch({
          type: 'auth/login/fulfilled',
          payload: {
            user: currentUser,
            token: currentUser.token || 'mock_token'
          }
        });
      }
    };

    checkAuth();
  }, [isAuthenticated, dispatch, location.pathname]);

  // Hiển thị loading indicator trong khi kiểm tra authentication
  if (loading || !localAuth.checked) {
    return (
      <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ClipLoader color="#4A90E2" size={50} />
      </div>
    );
  }

  // Use local auth state first, fallback to Redux
  const authToUse = localAuth.checked ? localAuth : { isAuthenticated };

  // Nếu chưa đăng nhập, chuyển hướng đến trang login phù hợp với user role
  if (!authToUse.isAuthenticated) {
    console.log('PrivateRoute: User not authenticated, redirecting to login');
    
    // Determine redirect path based on the requested route
    let redirectPath = '/auth/login';
    
    if (location.pathname.includes('/employer') || location.pathname.includes('/meeting')) {
      redirectPath = '/employer/login';
    } else if (location.pathname.includes('/candidate')) {
      redirectPath = '/candidate/login';
    }
    
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  console.log('PrivateRoute: Authenticated access granted for', authToUse.user?.role);
  // Nếu đã đăng nhập, hiển thị nội dung
  return children;
};

export default PrivateRoute;

