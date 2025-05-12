import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';

const CandidateLayout = () => {
  const location = useLocation();
  
  // Helper function to check if the link is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="candidate-layout">
      <Header />
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 sidebar">
            <div className="sidebar-sticky pt-3">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/candidate/dashboard') ? 'active' : ''}`}
                    to="/candidate/dashboard"
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/candidate/profile') ? 'active' : ''}`}
                    to="/candidate/profile"
                  >
                    <i className="bi bi-person me-2"></i>
                    Hồ sơ cá nhân
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/candidate/jobs') ? 'active' : ''}`}
                    to="/candidate/jobs"
                  >
                    <i className="bi bi-search me-2"></i>
                    Tìm việc làm
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/candidate/applications') ? 'active' : ''}`}
                    to="/candidate/applications"
                  >
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Hồ sơ đã nộp
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/candidate/meetings') ? 'active' : ''}`}
                    to="/candidate/meetings"
                  >
                    <i className="bi bi-camera-video me-2"></i>
                    Lịch phỏng vấn
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/candidate/saved-jobs') ? 'active' : ''}`}
                    to="/candidate/saved-jobs"
                  >
                    <i className="bi bi-bookmark-heart me-2"></i>
                    Công việc đã lưu
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/candidate/job-search') ? 'active' : ''}`}
                    to="/candidate/job-search"
                  >
                    <i className="bi bi-search me-2"></i>
                    Tìm kiếm nâng cao
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

export default CandidateLayout;
