import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ErrorPage = () => {
  const location = useLocation();
  const { error, message } = location.state || {
    error: 'Lỗi không xác định',
    message: 'Đã xảy ra lỗi không mong muốn trong quá trình xử lý yêu cầu của bạn.'
  };

  return (
    <div className="error-page">
      <div className="container py-5 text-center">
        <div className="error-container">
          <h1 className="display-4 text-danger">{error}</h1>
          <p className="lead mb-4">{message}</p>
          <div className="mt-4">
            <Link to="/" className="btn btn-primary me-3">
              Quay về trang chủ
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="btn btn-outline-secondary"
            >
              Quay lại trang trước
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
