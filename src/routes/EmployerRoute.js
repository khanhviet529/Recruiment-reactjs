import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ClipLoader } from 'react-spinners';

const EmployerRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // Hiển thị loading indicator trong khi kiểm tra authentication
  if (loading) {
    return (
      <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ClipLoader color="#4A90E2" size={50} />
      </div>
    );
  }

  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Nếu đã đăng nhập nhưng không phải employer, chuyển hướng về trang chủ phù hợp
  if (user && user.role !== 'employer') {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'applicant') {
      return <Navigate to="/candidate/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Nếu là employer đã đăng nhập, hiển thị nội dung
  return children;
};

export default EmployerRoute;

