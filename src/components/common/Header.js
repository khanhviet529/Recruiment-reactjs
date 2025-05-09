import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [navbarCollapsed, setNavbarCollapsed] = useState(true);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close navbar collapse when route changes
  useEffect(() => {
    setNavbarCollapsed(true);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setShowDropdown(false);
  };

  // Get profile route based on user role
  const getProfileRoute = () => {
    if (!user) return '/profile';
    
    switch (user.role) {
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

  // Check if the link is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header className="main-header">
      <nav className="navbar navbar-expand-lg navbar-light bg-white">
        <div className="container">
          {/* Logo */}
          <Link to="/" className="navbar-brand">
            <span className="text-primary fw-bold">JobConnect</span>
          </Link>

          {/* Mobile toggle */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setNavbarCollapsed(!navbarCollapsed)}
            aria-controls="navbarContent"
            aria-expanded={!navbarCollapsed}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navbar items */}
          <div className={`collapse navbar-collapse ${navbarCollapsed ? '' : 'show'}`} id="navbarContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}>
                  Find Jobs
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/companies" className={`nav-link ${isActive('/companies') ? 'active' : ''}`}>
                  Companies
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
                  Contact
                </Link>
              </li>
            </ul>

            {/* Auth buttons */}
            <div className="d-flex align-items-center">
              {isAuthenticated ? (
                <div className="d-flex align-items-center">
                  {/* Notification icon */}
                  <Link to="/notifications" className="notification-badge me-3">
                    <i className="bi bi-bell-fill fs-5"></i>
                    <span className="badge bg-danger">
                      3
                    </span>
                  </Link>

                  {/* User dropdown */}
                  <div className="dropdown" ref={dropdownRef}>
                    <div 
                      className="d-flex align-items-center cursor-pointer" 
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      {user?.avatar ? (
                        <Link to={getProfileRoute()}>
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="user-avatar avatar-image me-2"
                          />
                        </Link>
                      ) : (
                        <Link to={getProfileRoute()}>
                          <div className="user-avatar bg-primary text-white me-2">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </Link>
                      )}
                      <span className="d-none d-md-inline me-1">{user?.name || 'User'}</span>
                      <i className="bi bi-caret-down-fill small ms-1"></i>
                    </div>
                    
                    {showDropdown && (
                      <div className="dropdown-menu position-absolute mt-2 show">
                        {/* Admin */}
                        {user?.role === 'admin' && (
                          <Link to="/admin/dashboard" className="dropdown-item">
                            <i className="bi bi-speedometer2 me-2"></i> Admin Dashboard
                          </Link>
                        )}

                        {/* Employer */}
                        {user?.role === 'employer' && (
                          <>
                            <Link to="/employer/dashboard" className="dropdown-item">
                              <i className="bi bi-speedometer2 me-2"></i> Dashboard
                            </Link>
                            <Link to="/employer/jobs" className="dropdown-item">
                              <i className="bi bi-briefcase me-2"></i> Manage Jobs
                            </Link>
                            <Link to="/employer/applications" className="dropdown-item">
                              <i className="bi bi-people me-2"></i> Applications
                            </Link>
                          </>
                        )}

                        {/* Applicant */}
                        {user?.role === 'applicant' && (
                          <>
                            <Link to="/candidate/dashboard" className="dropdown-item">
                              <i className="bi bi-speedometer2 me-2"></i> Dashboard
                            </Link>
                            <Link to="/candidate/applications" className="dropdown-item">
                              <i className="bi bi-file-earmark-text me-2"></i> My Applications
                            </Link>
                            <Link to="/candidate/jobs" className="dropdown-item">
                              <i className="bi bi-search me-2"></i> Find Jobs
                            </Link>
                            <Link to="/candidate/saved-jobs" className="dropdown-item">
                              <i className="bi bi-bookmark me-2"></i> Saved Jobs
                            </Link>
                            <Link to="/candidate/cv-templates" className="dropdown-item">
                              <i className="bi bi-file-earmark-text me-2"></i> Mẫu CV
                            </Link>
                          </>
                        )}

                        {/* Common items */}
                        <div className="dropdown-divider"></div>
                        <Link to={getProfileRoute()} className="dropdown-item">
                          <i className="bi bi-person me-2"></i> My Profile
                        </Link>
                        <Link to="/settings" className="dropdown-item">
                          <i className="bi bi-gear me-2"></i> Settings
                        </Link>
                        <div className="dropdown-divider"></div>
                        <button onClick={handleLogout} className="dropdown-item text-danger d-flex align-items-center">
                          <i className="bi bi-box-arrow-right me-2"></i>
                          <span className="fw-medium">Đăng xuất</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <div className="btn-group">
                    <Link 
                      to="/candidate/login" 
                      className="btn btn-outline-primary px-3 py-2 rounded-start-pill fw-medium d-flex align-items-center"
                      data-role="candidate"
                      onClick={() => localStorage.setItem('intended_role', 'candidate')}
                    >
                      <i className="bi bi-person me-2"></i>
                      Ứng viên
                    </Link>
                    <Link 
                      to="/employer/login" 
                      className="btn btn-outline-primary px-3 py-2 rounded-end-pill fw-medium d-flex align-items-center"
                      data-role="employer"
                      onClick={() => localStorage.setItem('intended_role', 'employer')}
                    >
                      <i className="bi bi-building me-2"></i>
                      Nhà tuyển dụng
                    </Link>
                  </div>
                  
                  <div className="dropdown">
                    <button 
                      className="btn btn-primary px-4 py-2 rounded-pill fw-medium dropdown-toggle"
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Đăng ký
                    </button>
                    
                    {showDropdown && (
                      <div className="dropdown-menu position-absolute mt-2 show">
                        <Link 
                          to="/candidate/register" 
                          className="dropdown-item"
                          data-role="candidate"
                          onClick={() => localStorage.setItem('intended_role', 'candidate')}
                        >
                          <i className="bi bi-person me-2"></i> Đăng ký Ứng viên
                        </Link>
                        <Link 
                          to="/employer/register" 
                          className="dropdown-item"
                          data-role="employer"
                          onClick={() => localStorage.setItem('intended_role', 'employer')}
                        >
                          <i className="bi bi-building me-2"></i> Đăng ký Nhà tuyển dụng
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
