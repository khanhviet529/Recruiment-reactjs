import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ClipLoader } from 'react-spinners';
import authService from '../services/authService';

const EmployerRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const [localAuth, setLocalAuth] = useState({ 
    checked: false, 
    isAuthenticated: false, 
    user: null 
  });
  const dispatch = useDispatch();

  useEffect(() => {
    // Check authentication from authService directly
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser();
      const isLoggedIn = authService.isLoggedIn();
      
      console.log('EmployerRoute: Checking auth', { isLoggedIn, currentUser: currentUser?.role });
      
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
  }, [isAuthenticated, dispatch]);

  // Hiển thị loading indicator trong khi kiểm tra authentication
  if (loading || !localAuth.checked) {
    return (
      <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ClipLoader color="#4A90E2" size={50} />
      </div>
    );
  }

  // Use local auth state first, fallback to Redux
  const authToUse = localAuth.checked ? localAuth : { isAuthenticated, user };

  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!authToUse.isAuthenticated) {
    console.log('EmployerRoute: User not authenticated, redirecting to login');
    return <Navigate to="/auth/login" replace />;
  }

  // Nếu đã đăng nhập nhưng không phải employer, chuyển hướng về trang chủ phù hợp
  if (authToUse.user && authToUse.user.role !== 'employer') {
    console.log('EmployerRoute: User role is not employer:', authToUse.user.role);
    if (authToUse.user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (authToUse.user.role === 'applicant' || authToUse.user.role === 'candidate') {
      return <Navigate to="/candidate/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  console.log('EmployerRoute: Authenticated employer access granted');
  // Nếu là employer đã đăng nhập, hiển thị nội dung
  return children;
};

export default EmployerRoute;

