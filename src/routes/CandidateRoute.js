import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ClipLoader } from 'react-spinners';
import authService from '../services/authService';

const CandidateRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const [localAuth, setLocalAuth] = useState({ 
    checked: false, 
    isAuthenticated: false, 
    user: null 
  });

  useEffect(() => {
    // Check authentication from authService directly - NO DISPATCH!
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser();
      const isLoggedIn = authService.isLoggedIn();
      
      console.log('CandidateRoute: Checking auth', { isLoggedIn, currentUser: currentUser?.role });
      
      setLocalAuth({
        checked: true,
        isAuthenticated: isLoggedIn,
        user: currentUser
      });

      // DO NOT DISPATCH - this causes infinite loops!
      // The auth state should be managed by the parent components
    };

    checkAuth();
  }, []); // EMPTY dependencies - only run once!

  // Hiển thị loading indicator trong khi kiểm tra authentication
  if (loading || !localAuth.checked) {
    return (
      <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ClipLoader color="#4f46e5" size={50} />
      </div>
    );
  }

  // Use Redux state if available, otherwise use local auth
  const authToUse = isAuthenticated ? { isAuthenticated, user } : localAuth;

  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!authToUse.isAuthenticated) {
    console.log('CandidateRoute: User not authenticated, redirecting to login');
    return <Navigate to="/auth/login" replace />;
  }

  // Nếu đã đăng nhập nhưng không phải applicant/candidate, chuyển hướng về trang chủ phù hợp
  if (!authToUse.user || (authToUse.user.role !== 'applicant' && authToUse.user.role !== 'candidate')) {
    console.log('CandidateRoute: User role is not candidate:', authToUse.user?.role);
    if (authToUse.user && authToUse.user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (authToUse.user && authToUse.user.role === 'employer') {
      return <Navigate to="/employer/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  console.log('CandidateRoute: Authenticated candidate access granted');
  // Nếu là applicant/candidate đã đăng nhập, hiển thị nội dung
  return children;
};

export default CandidateRoute;
