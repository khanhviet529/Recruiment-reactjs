import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="container py-5 text-center">
        <div className="error-container">
          <h1 className="display-1">404</h1>
          <h2 className="mb-4">Trang không tìm thấy</h2>
          <p className="lead mb-4">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
          </p>
          <Link to="/" className="btn btn-primary">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
