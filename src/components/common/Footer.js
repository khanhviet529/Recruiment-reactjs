import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/scss/main.scss';

// Helper function to scroll to top when clicking links
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

const Footer = () => {
  return (
    <footer className="text-white py-4" style={{ backgroundColor: '#000D2C' }}>
      <div className="container">
        <div className="row">
          {/* Về JobConnect */}
          <div className="col-md-3 mb-4">
            <h5 className="text-white mb-3">Về JobConnect</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-white text-decoration-none" onClick={scrollToTop}>Trang chủ</Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-white text-decoration-none" onClick={scrollToTop}>Về chúng tôi</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-white text-decoration-none" onClick={scrollToTop}>Liên hệ</Link>
              </li>
            </ul>
          </div>

          {/* Dành cho ứng viên */}
          <div className="col-md-3 mb-4">
            <h5 className="text-white mb-3">Dành cho ứng viên</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/jobs" className="text-white text-decoration-none" onClick={scrollToTop}>Tìm việc làm</Link>
              </li>
              <li className="mb-2">
                <Link to="/jobs/search" className="text-white text-decoration-none" onClick={scrollToTop}>Tìm kiếm nâng cao</Link>
              </li>
              <li className="mb-2">
                <Link to="/companies" className="text-white text-decoration-none" onClick={scrollToTop}>Danh sách công ty</Link>
              </li>
              <li className="mb-2">
                <Link to="/candidate/register" className="text-white text-decoration-none" onClick={scrollToTop}>Đăng ký ứng viên</Link>
              </li>
            </ul>
          </div>

          {/* Dành cho nhà tuyển dụng */}
          <div className="col-md-3 mb-4">
            <h5 className="text-white mb-3">Dành cho nhà tuyển dụng</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/employer/register" className="text-white text-decoration-none" onClick={scrollToTop}>Đăng ký nhà tuyển dụng</Link>
              </li>
              <li className="mb-2">
                <Link to="/employer/login" className="text-white text-decoration-none" onClick={scrollToTop}>Đăng nhập</Link>
              </li>
              <li className="mb-2">
                <Link to="/companies" className="text-white text-decoration-none" onClick={scrollToTop}>Hồ sơ công ty</Link>
              </li>
              <li className="mb-2">
                <Link to="/jobs" className="text-white text-decoration-none" onClick={scrollToTop}>Xem việc làm</Link>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div className="col-md-3 mb-4">
            <h5 className="text-white mb-3">Hỗ trợ</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/candidate/login" className="text-white text-decoration-none" onClick={scrollToTop}>Đăng nhập</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-white text-decoration-none" onClick={scrollToTop}>Liên hệ hỗ trợ</Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-white text-decoration-none" onClick={scrollToTop}>Hướng dẫn sử dụng</Link>
              </li>
              <li className="mb-2">
                <Link to="/notifications" className="text-white text-decoration-none" onClick={scrollToTop}>Thông báo</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social links */}
        <div className="row mt-3 pt-3 border-top border-secondary">
          <div className="col-md-6">
            <div className="text-white-50">Kết nối với JobConnect.vn</div>
          </div>
          <div className="col-md-6">
            <div className="d-flex justify-content-md-end">
              <a href="https://facebook.com" className="text-white me-3">
                <i className="bi bi-facebook" style={{ fontSize: "1.5rem" }}></i>
              </a>
              <a href="https://instagram.com" className="text-white me-3">
                <i className="bi bi-instagram" style={{ fontSize: "1.5rem" }}></i>
              </a>
              <a href="https://youtube.com" className="text-white me-3">
                <i className="bi bi-youtube" style={{ fontSize: "1.5rem" }}></i>
              </a>
              <a href="https://linkedin.com" className="text-white me-3">
                <i className="bi bi-linkedin" style={{ fontSize: "1.5rem" }}></i>
              </a>
              <a href="https://tiktok.com" className="text-white">
                <i className="bi bi-tiktok" style={{ fontSize: "1.5rem" }}></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
