import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';
import './adminHeader.scss';

const AdminHeader = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <div className="admin-header-left">
          <h1>Admin Dashboard</h1>
        </div>
        
        <div className="admin-header-right">
          <div className="admin-user-info">
            <span className="admin-username">
              {authService.getCurrentUser()?.email || 'Admin'}
            </span>
          </div>
          
          <button 
            className={`logout-button ${isLoggingOut ? 'loading' : ''}`}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 