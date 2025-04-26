import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';
import './dashboard.scss';

const EmployerDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="employer-dashboard">
      <div className="dashboard-header">
        <h1>Employer Dashboard</h1>
        <button 
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className="quick-stats">
        <div className="stat-card">
          <h3>Total Jobs Posted</h3>
          <p>15</p>
        </div>
        <div className="stat-card">
          <h3>Active Jobs</h3>
          <p>8</p>
        </div>
        <div className="stat-card">
          <h3>Total Applications</h3>
          <p>120</p>
        </div>
        <div className="stat-card">
          <h3>New Applications</h3>
          <p>12</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-applications">
          <div className="section-header">
            <h2>Recent Applications</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="applications-list">
            {/* TODO: Add recent applications list */}
            <div className="application-item">
              <div className="job-title">Senior Frontend Developer</div>
              <div className="candidate-name">John Doe</div>
              <div className="application-date">Applied 2 days ago</div>
              <div className="application-status pending">Pending Review</div>
            </div>
          </div>
        </div>

        <div className="active-jobs">
          <div className="section-header">
            <h2>Active Jobs</h2>
            <button 
              className="create-job-btn"
              onClick={() => navigate('/employer/jobs/create')}
            >
              Create New Job
            </button>
          </div>
          <div className="jobs-list">
            {/* TODO: Add active jobs list */}
            <div className="job-item">
              <div className="job-title">Senior Frontend Developer</div>
              <div className="job-stats">
                <span>12 Applications</span>
                <span>3 Interviews</span>
              </div>
              <div className="job-actions">
                <button className="view-btn">View Details</button>
                <button className="edit-btn">Edit</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard; 