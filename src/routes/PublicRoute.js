import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ClipLoader } from 'react-spinners';

const PublicRoute = ({ children, restricted = false }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  
  // Hiển thị loading indicator trong khi kiểm tra authentication
  if (loading) {
    return (
      <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ClipLoader color="#4A90E2" size={50} />
      </div>
    );
  }

  // Nếu đã đăng nhập và route bị giới hạn (như login/register), chuyển hướng dựa vào vai trò
  if (isAuthenticated && restricted) {
    if (user && user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user && user.role === 'employer') {
      return <Navigate to="/employer/dashboard" replace />;
    } else if (user && user.role === 'applicant') {
      return <Navigate to="/applicant/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Nếu route không bị hạn chế hoặc người dùng chưa đăng nhập, hiển thị nội dung
  return children;
};

// Hàm trả về trang chủ tương ứng dựa trên vai trò người dùng
const getUserHomePage = (role) => {
  switch (role) {
    case 'employer':
      return '/employer/dashboard';
    case 'candidate':
      return '/candidate/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/';
  }
};

export default PublicRoute;

