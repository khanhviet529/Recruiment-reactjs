import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin, FaTiktok } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import './footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          {/* Về CareerLink */}
          <div className="footer__section">
            <h3 className="footer__title">Về CareerLink</h3>
            <ul className="footer__links">
              <li><Link to="/about">Về chúng tôi</Link></li>
              <li><Link to="/rules">Quy chế hoạt động</Link></li>
              <li><Link to="/privacy">Quy định bảo mật</Link></li>
              <li><Link to="/terms">Thoả thuận sử dụng</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
              <li><Link to="/sitemap">Sơ đồ trang web</Link></li>
              <li><Link to="https://careerlink.asia">CareerLink.asia</Link></li>
            </ul>
          </div>

          {/* Dành cho ứng viên & nhà tuyển dụng */}
          <div className="footer__section">
            <div className="footer__subsection">
              <h3 className="footer__title">Dành cho ứng viên</h3>
              <ul className="footer__links">
                <li><Link to="/jobs">Việc làm</Link></li>
                <li><Link to="/jobs/quick-apply">Tìm việc làm nhanh</Link></li>
                <li><Link to="/companies">Công ty</Link></li>
                <li><Link to="/career-guide">Cẩm Nang Việc Làm</Link></li>
                <li><Link to="/cv-templates">Mẫu CV Xin Việc</Link></li>
                <li><Link to="/study-abroad">Tư Vấn Du Học Nhật Bản</Link></li>
              </ul>
            </div>
            <div className="footer__subsection">
              <h3 className="footer__title">Dành cho nhà tuyển dụng</h3>
              <ul className="footer__links">
                <li><Link to="/employer/services">Dịch vụ nhân sự cao cấp</Link></li>
                <li><Link to="/employer/guide">Cẩm nang tuyển dụng</Link></li>
              </ul>
            </div>
          </div>

          {/* Việc làm theo khu vực & ngành nghề */}
          <div className="footer__section">
            <div className="footer__subsection">
              <h3 className="footer__title">Việc làm theo khu vực</h3>
              <ul className="footer__links">
                <li><Link to="/jobs/ho-chi-minh">Hồ Chí Minh</Link></li>
                <li><Link to="/jobs/ha-noi">Hà Nội</Link></li>
                <li><Link to="/jobs/da-nang">Đà Nẵng</Link></li>
                <li><Link to="/jobs/hai-phong">Hải Phòng</Link></li>
                <li><Link to="/jobs/can-tho">Cần Thơ</Link></li>
              </ul>
            </div>
            <div className="footer__subsection">
              <h3 className="footer__title">Việc làm theo ngành nghề</h3>
              <ul className="footer__links">
                <li><Link to="/jobs/ke-toan">Kế toán</Link></li>
                <li><Link to="/jobs/tieng-nhat">Tiếng Nhật</Link></li>
                <li><Link to="/jobs/ngan-hang">Ngân hàng</Link></li>
                <li><Link to="/jobs/it-phan-mem">IT - Phần mềm</Link></li>
                <li><Link to="/jobs/it-phan-cung-mang">IT - Phần cứng / Mạng</Link></li>
              </ul>
            </div>
          </div>

          {/* Tải ứng dụng & Chứng nhận */}
          <div className="footer__section">
            <div className="footer__subsection">
              <h3 className="footer__title">Tải ứng dụng</h3>
              <div className="footer__app-buttons">
                <a href="#" className="footer__app-button">
                  <img src="/images/google-play.png" alt="Get it on Google Play" />
                </a>
                <a href="#" className="footer__app-button">
                  <img src="/images/app-store.png" alt="Download on the App Store" />
                </a>
              </div>
            </div>
            <div className="footer__subsection">
              <h3 className="footer__title">Chứng nhận</h3>
              <div className="footer__cert">
                <img src="/images/bo-cong-thuong.png" alt="Chứng nhận Bộ Công Thương" />
                <div className="footer__cert-info">
                  <p>GPKD TP.HCM Số: 0400539269</p>
                  <p>VPDD TP.Hà Nội Số: 0400539269-001</p>
                  <p>VPDD TP.DN Số: 0400539269-003</p>
                  <p>GPDVVL Số: 3116/SLĐTBXH-GPGH</p>
                </div>
              </div>
            </div>

            <div className="footer__social">
              <h3 className="footer__title">Kết nối với CareerLink.vn</h3>
              <div className="footer__social-links">
                <a href="#" aria-label="Facebook"><FaFacebook /></a>
                <a href="#" aria-label="Instagram"><FaInstagram /></a>
                <a href="#" aria-label="YouTube"><FaYoutube /></a>
                <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
                <a href="#" aria-label="Zalo"><SiZalo /></a>
                <a href="#" aria-label="TikTok"><FaTiktok /></a>
              </div>
            </div>

          </div>
        </div>


      </div>
    </footer>
  );
};

export default Footer; 