import React from 'react';
import { Outlet, Link } from 'react-router-dom';

/**
 * Khung cho các trang đăng nhập / đăng ký.
 *
 * Đã bỏ 2 thứ:
 *  - <footer> ghi dòng bản quyền: trang đăng nhập không cần chân trang,
 *    và nó bị trùng với dòng bản quyền vốn đã có trong form.
 *  - class `py-5` ở <main>: nó thêm 3rem padding trên và dưới, tạo ra
 *    dải trắng giữa thanh đầu trang và nội dung. Trang đăng nhập tự
 *    chiếm hết chiều cao nên không cần padding này.
 */
const AuthLayout = () => (
  <div className="auth-layout">
    <header className="auth-topbar">
      <div className="app-container auth-topbar__inner">
        <Link to="/" className="auth-topbar__brand">
          <img src="/image/logo-256.png" alt="" width="30" height="30" />
          <span>ProHire</span>
        </Link>
        <Link to="/" className="btn btn-outline-primary btn-sm">
          Trang chủ
        </Link>
      </div>
    </header>

    <main>
      <Outlet />
    </main>
  </div>
);

export default AuthLayout;
