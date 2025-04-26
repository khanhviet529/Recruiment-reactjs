import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';
import './dashboard.scss';

const CandidateDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="candidate-dashboard">
      <div className="dashboard-header">
        <h1>Candidate Dashboard</h1>
        <button 
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <div className="quick-stats">
        <div className="stat-card">
          <h3>Applied Jobs</h3>
          <p>12</p>
        </div>
        <div className="stat-card">
          <h3>Interviews</h3>
          <p>3</p>
        </div>
        <div className="stat-card">
          <h3>Saved Jobs</h3>
          <p>8</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-applications">
          <h2>Recent Applications</h2>
          {/* TODO: Add recent applications list */}
        </div>

        <div className="recommended-jobs">
          <h2>Recommended Jobs</h2>
          {/* TODO: Add recommended jobs list */}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard; 