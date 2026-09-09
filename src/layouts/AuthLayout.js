import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header className="py-3 border-bottom">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center">
              <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
                <img src="/image/logo-256.png" alt="" width="32" height="32" />
                <h3 className="m-0 text-primary">ProHire</h3>
              </Link>
              <div>
                <Link to="/" className="btn btn-outline-primary me-2">
                  Trang chủ
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow-1 align-items-center py-5">
          <Outlet />
        </main>

        <footer className="py-3 bg-light">
          <div className="container text-center">
            <p className="mb-0">© {new Date().getFullYear()} ProHire. Tất cả quyền được bảo lưu.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AuthLayout;
