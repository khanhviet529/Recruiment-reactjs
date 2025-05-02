import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';

const AdminLayout = () => {
  const location = useLocation();
  
  // Helper function to check if the link is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      <Header />
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 sidebar bg-dark">
            <div className="sidebar-sticky pt-3">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <Link 
                    className={`nav-link text-white ${isActive('/admin/dashboard') ? 'active' : ''}`}
                    to="/admin/dashboard"
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link text-white ${isActive('/admin/users') ? 'active' : ''}`}
                    to="/admin/users"
                  >
                    <i className="bi bi-people me-2"></i>
                    Quản lý người dùng
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link text-white ${isActive('/admin/jobs') ? 'active' : ''}`}
                    to="/admin/jobs"
                  >
                    <i className="bi bi-briefcase me-2"></i>
                    Quản lý tin tuyển dụng
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link text-white ${isActive('/admin/messages') ? 'active' : ''}`}
                    to="/admin/messages"
                  >
                    <i className="bi bi-chat-dots me-2"></i>
                    Tin nhắn hỗ trợ
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link text-white ${isActive('/admin/reports') ? 'active' : ''}`}
                    to="/admin/reports"
                  >
                    <i className="bi bi-bar-chart me-2"></i>
                    Báo cáo & Thống kê
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Main content */}
          <div className="col-md-9 col-lg-10 ms-sm-auto px-md-4 py-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
