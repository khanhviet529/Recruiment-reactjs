import React from 'react';
import { Link } from 'react-router-dom';
import { BiBell, BiUser, BiBookmark, BiFile, BiCog } from 'react-icons/bi';
import authService from '../../../services/authService';
import './navbar.scss';

const Navbar = () => {
  const user = authService.getCurrentUser();
  const isCandidate = user?.role === 'candidate';
  const isEmployer = user?.role === 'employer';

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <div className="navbar__left">
          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <img src="/logo.png" alt="CareerViet" />
          </Link>
          
          {/* Main Menu */}
          <div className="navbar__menu">
            <Link to="/jobs" className="navbar__menu-item">Tìm Việc Làm</Link>
            <Link to="/cv" className="navbar__menu-item">CV Hay</Link>
            <Link to="/salary" className="navbar__menu-item">VietnamSalary</Link>
            <Link to="/career-map" className="navbar__menu-item">CareerMap</Link>
          </div>
        </div>

        {/* Right Menu */}
        <div className="navbar__right">
          {!user ? (
            // Menu khi chưa đăng nhập
            <>
              <Link to="/login" className="navbar__login-btn">Đăng nhập</Link>
              <Link to="/employer" className="navbar__employer-btn">Dành cho nhà tuyển dụng</Link>
            </>
          ) : isCandidate ? (
            // Menu cho candidate đã đăng nhập
            <>
              <Link to="/jobs/matching" className="navbar__link">Việc làm phù hợp</Link>
              <button className="navbar__notification">
                <BiBell />
                <span className="navbar__notification-badge"></span>
              </button>
              <div className="navbar__profile">
                <div className="navbar__profile-button">
                  <img
                    src={user.avatar || "https://via.placeholder.com/40"}
                    alt=""
                  />
                </div>
                {/* Dropdown Menu */}
                <div className="navbar__dropdown">
                  <Link to="/candidate/profile" className="navbar__dropdown-item">
                    <BiUser className="navbar__dropdown-icon" />
                    Hồ sơ của tôi
                  </Link>
                  <Link to="/candidate/applications" className="navbar__dropdown-item">
                    <BiFile className="navbar__dropdown-icon" />
                    Việc làm đã ứng tuyển
                  </Link>
                  <Link to="/candidate/saved-jobs" className="navbar__dropdown-item">
                    <BiBookmark className="navbar__dropdown-icon" />
                    Việc làm đã lưu
                  </Link>
                  <Link to="/candidate/settings" className="navbar__dropdown-item">
                    <BiCog className="navbar__dropdown-icon" />
                    Cài đặt
                  </Link>
                  <button
                    onClick={() => authService.logout()}
                    className="navbar__dropdown-item"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </>
          ) : isEmployer ? (
            // Menu cho employer đã đăng nhập
            <>
              <Link to="/employer/dashboard" className="navbar__link">
                Quản lý tuyển dụng
              </Link>
            </>
          ) : null}

          <select className="navbar__language">
            <option value="vi">VI</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 