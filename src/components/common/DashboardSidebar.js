import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import './DashboardSidebar.scss';

/**
 * Sidebar dùng chung cho khu vực ứng viên và nhà tuyển dụng.
 *
 * Trước đây mỗi layout tự viết <ul className="nav"> — mà Bootstrap `.nav`
 * là flex NGANG, nên các mục xếp ngang rồi tự xuống dòng, trông như bị lỗi.
 * Ngoài ra không có CSS nào cho `.sidebar` nên nó không có nền lẫn viền.
 *
 * items: [{ to, label, icon }]
 */
const DashboardSidebar = ({ items, title }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <>
      {/* Nút mở menu khi màn hình hẹp */}
      <button
        className="dsb__toggle"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? <CloseOutlined /> : <MenuOutlined />}
        <span>{title || 'Menu'}</span>
      </button>

      <aside className={`dsb ${open ? 'is-open' : ''}`}>
        {title && <div className="dsb__title">{title}</div>}
        <nav className="dsb__nav" aria-label={title || 'Menu quản lý'}>
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className={`dsb__link ${isActive(it.to) ? 'is-active' : ''}`}
              aria-current={isActive(it.to) ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              <span className="dsb__icon" aria-hidden="true">{it.icon}</span>
              <span className="dsb__label">{it.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default DashboardSidebar;
