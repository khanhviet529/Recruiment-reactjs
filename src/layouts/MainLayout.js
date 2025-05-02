import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Header />
      <main className="content-container">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h3>JobConnect</h3>
              <p>Kết nối nhà tuyển dụng và ứng viên tài năng</p>
            </div>
            <div className="col-md-6">
              <div className="footer-links">
                <a href="/about">Về chúng tôi</a>
                <a href="/contact">Liên hệ</a>
                <a href="/terms">Điều khoản</a>
                <a href="/privacy">Chính sách bảo mật</a>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <p className="copyright">© {new Date().getFullYear()} JobConnect. Tất cả quyền được bảo lưu.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
