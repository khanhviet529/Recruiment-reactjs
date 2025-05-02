import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ClipLoader } from 'react-spinners';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  // Hiển thị loading indicator trong khi kiểm tra authentication
  if (loading) {
    return (
      <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ClipLoader color="#4A90E2" size={50} />
      </div>
    );
  }

  // Nếu chưa đăng nhập, chuyển hướng đến trang login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập, hiển thị nội dung
  return children;
};

export default PrivateRoute;

