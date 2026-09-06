import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Dropdown, Avatar, Button } from 'antd';
import {
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
  BookOutlined,
  FileTextOutlined,
  TeamOutlined,
  ShopOutlined,
  IdcardOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';

import { logout } from '../../redux/slices/authSlice';
import { fetchUserAvatar } from '../../utils/avatarUtils';
import NotificationBell from '../NotificationBell';
import './Header.scss';

const NAV = [
  { to: '/', label: 'Trang chủ' },
  { to: '/jobs', label: 'Việc làm' },
  { to: '/companies', label: 'Công ty' },
  { to: '/about', label: 'Về chúng tôi' },
  { to: '/contact', label: 'Liên hệ' },
];

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const loadAvatar = useCallback(async () => {
    if (!user?.id) return;
    try {
      setAvatarUrl(await fetchUserAvatar(user));
    } catch {
      setAvatarUrl(null);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) loadAvatar();
    else setAvatarUrl(null);
  }, [isAuthenticated, loadAvatar]);

  // Đóng menu mobile mỗi khi chuyển trang
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const profileRoute = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin/profile';
      case 'employer':
        return '/employer/profile';
      case 'applicant':
        return '/candidate/profile';
      default:
        return '/profile';
    }
  };

  const dashboardRoute = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'employer':
        return '/employer/dashboard';
      default:
        return '/candidate/dashboard';
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  /* ---------- menu người dùng ---------- */
  const userMenuItems = () => {
    const items = [
      {
        key: 'head',
        label: (
          <div className="hd-usercard">
            <div className="hd-usercard__name">{user?.name || user?.email}</div>
            <div className="hd-usercard__mail">{user?.email}</div>
          </div>
        ),
        disabled: true,
      },
      { type: 'divider' },
      { key: 'dash', icon: <DashboardOutlined />, label: <Link to={dashboardRoute()}>Bảng điều khiển</Link> },
    ];

    if (user?.role === 'employer') {
      items.push(
        { key: 'jobs', icon: <ShopOutlined />, label: <Link to="/employer/jobs">Tin tuyển dụng</Link> },
        { key: 'apps', icon: <TeamOutlined />, label: <Link to="/employer/applications">Đơn ứng tuyển</Link> },
      );
    }

    if (user?.role === 'applicant') {
      items.push(
        { key: 'myapps', icon: <FileTextOutlined />, label: <Link to="/candidate/applications">Đơn đã nộp</Link> },
        { key: 'saved', icon: <BookOutlined />, label: <Link to="/candidate/saved-jobs">Việc đã lưu</Link> },
        { key: 'cv', icon: <IdcardOutlined />, label: <Link to="/candidate/cv-templates">Mẫu CV</Link> },
      );
    }

    items.push(
      { type: 'divider' },
      { key: 'profile', icon: <UserOutlined />, label: <Link to={profileRoute()}>Thông tin cá nhân</Link> },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout },
    );

    return items;
  };

  const registerMenu = {
    items: [
      { key: 'r1', icon: <UserOutlined />, label: <Link to="/candidate/register">Tôi là ứng viên</Link> },
      { key: 'r2', icon: <ShopOutlined />, label: <Link to="/employer/register">Tôi là nhà tuyển dụng</Link> },
    ],
  };

  const loginMenu = {
    items: [
      { key: 'l1', icon: <UserOutlined />, label: <Link to="/candidate/login">Ứng viên</Link> },
      { key: 'l2', icon: <ShopOutlined />, label: <Link to="/employer/login">Nhà tuyển dụng</Link> },
    ],
  };

  return (
    <header className="hd">
      <div className="hd__inner app-container">
        {/* Thương hiệu */}
        <Link to="/" className="hd__brand" aria-label="JobConnect - về trang chủ">
          <span className="hd__mark" aria-hidden="true">JC</span>
          <span className="hd__word">JobConnect</span>
        </Link>

        {/* Điều hướng chính */}
        <nav className="hd__nav" aria-label="Điều hướng chính">
          {NAV.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className={`hd__link ${isActive(it.to) ? 'is-active' : ''}`}
              aria-current={isActive(it.to) ? 'page' : undefined}
            >
              {it.label}
            </Link>
          ))}
        </nav>

        {/* Khu vực bên phải */}
        <div className="hd__right">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Dropdown
                menu={{ items: userMenuItems() }}
                trigger={['click']}
                placement="bottomRight"
                overlayClassName="hd__usermenu"
              >
                <button className="hd__user" type="button">
                  <Avatar
                    size={32}
                    src={avatarUrl || undefined}
                    style={!avatarUrl ? { background: 'var(--brand)' } : undefined}
                  >
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                  <span className="hd__username">{user?.name || user?.email?.split('@')[0]}</span>
                </button>
              </Dropdown>
            </>
          ) : (
            <div className="hd__auth">
              <Dropdown menu={loginMenu} trigger={['click']} placement="bottomRight">
                <Button type="text" className="hd__btn-ghost">Đăng nhập</Button>
              </Dropdown>
              <Dropdown menu={registerMenu} trigger={['click']} placement="bottomRight">
                <Button type="primary">Đăng ký</Button>
              </Dropdown>
            </div>
          )}

          {/* Nút mở menu trên mobile */}
          <button
            className="hd__burger"
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <nav className="hd__mobile" aria-label="Điều hướng trên di động">
          {NAV.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className={`hd__mobile-link ${isActive(it.to) ? 'is-active' : ''}`}
            >
              {it.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <div className="hd__mobile-auth">
              <Link to="/candidate/login" className="hd__mobile-link">Đăng nhập ứng viên</Link>
              <Link to="/employer/login" className="hd__mobile-link">Đăng nhập nhà tuyển dụng</Link>
              <Link to="/candidate/register" className="hd__mobile-link">Đăng ký</Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
