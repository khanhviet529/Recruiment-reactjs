import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';

const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

const COLUMNS = [
  {
    title: 'Về ProHire',
    links: [
      { to: '/', label: 'Trang chủ' },
      { to: '/about', label: 'Về chúng tôi' },
      { to: '/contact', label: 'Liên hệ' },
    ],
  },
  {
    title: 'Dành cho ứng viên',
    links: [
      { to: '/jobs', label: 'Tìm việc làm' },
      { to: '/jobs/search', label: 'Tìm kiếm nâng cao' },
      { to: '/companies', label: 'Danh sách công ty' },
      { to: '/candidate/register', label: 'Đăng ký ứng viên' },
    ],
  },
  {
    title: 'Dành cho nhà tuyển dụng',
    links: [
      { to: '/employer/register', label: 'Đăng ký nhà tuyển dụng' },
      { to: '/employer/login', label: 'Đăng nhập' },
      { to: '/employer/jobs', label: 'Quản lý tin tuyển dụng' },
    ],
  },
];

const Footer = () => (
  <footer className="ft">
    <div className="ft__top app-container">
      {/* Cột giới thiệu */}
      <div className="ft__about">
        <Link to="/" className="ft__brand" onClick={scrollToTop}>
          <img src="/image/logo-256.png" alt="" className="ft__logo" width="34" height="34" />
          <span className="ft__word">ProHire</span>
        </Link>
        <p className="ft__desc">
          Nền tảng kết nối ứng viên và nhà tuyển dụng, hỗ trợ đánh giá năng lực
          trực tuyến để quá trình tuyển chọn nhanh và khách quan hơn.
        </p>
      </div>

      {/* Các cột liên kết */}
      {COLUMNS.map((col) => (
        <nav className="ft__col" key={col.title} aria-label={col.title}>
          <h2 className="ft__col-title">{col.title}</h2>
          <ul className="ft__list">
            {col.links.map((l) => (
              <li key={l.to + l.label}>
                <Link to={l.to} className="ft__link" onClick={scrollToTop}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </div>

    <div className="ft__bottom">
      <div className="app-container ft__bottom-inner">
        <span>© {new Date().getFullYear()} ProHire. Đồ án tốt nghiệp.</span>
        <span className="ft__made">Xây dựng với React &amp; Ant Design</span>
      </div>
    </div>
  </footer>
);

export default Footer;
