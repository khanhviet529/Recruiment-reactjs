import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';

const EmployerLayout = () => {
  const location = useLocation();
  
  // Helper function to check if the link is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="employer-layout">
      <Header />
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 sidebar">
            <div className="sidebar-sticky pt-3">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/employer/dashboard') ? 'active' : ''}`}
                    to="/employer/dashboard"
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/employer/profile') ? 'active' : ''}`}
                    to="/employer/profile"
                  >
                    <i className="bi bi-person me-2"></i>
                    Thông tin công ty
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/employer/jobs') ? 'active' : ''}`}
                    to="/employer/jobs"
                  >
                    <i className="bi bi-briefcase me-2"></i>
                    Tin tuyển dụng
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/employer/applications') ? 'active' : ''}`}
                    to="/employer/applications"
                  >
                    <i className="bi bi-file-earmark-person me-2"></i>
                    Hồ sơ ứng viên
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/employer/recruitment-process') ? 'active' : ''}`}
                    to="/employer/recruitment-process"
                  >
                    <i className="bi bi-diagram-3 me-2"></i>
                    Quy trình tuyển dụng
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

export default EmployerLayout;
