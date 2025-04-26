import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedJobs, removeFromSaved } from '../../../services/jobService';
import { formatSalary, formatDate } from '../../../utils/formatters';
import './savedJobs.scss';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const jobs = await getSavedJobs(userId);
      setSavedJobs(jobs);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      setError('Failed to load saved jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromSaved = async (jobId) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      await removeFromSaved(userId, jobId);
      
      // Update local state without refetching
      setSavedJobs(savedJobs.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Error removing job from saved:', err);
      setError('Failed to remove job from saved list. Please try again.');
    }
  };

  const viewJobDetails = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <div className="saved-jobs-container">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i> Loading saved jobs...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-jobs-container">
        <div className="error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="saved-jobs-container">
      <div className="saved-jobs-header">
        <div className="header-left">
          <h1>Saved Jobs</h1>
          <p>You have saved {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="back-button" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
      </div>

      <div className="saved-jobs-content">
        {savedJobs.length === 0 ? (
          <div className="no-saved-jobs">
            <i className="fas fa-bookmark"></i>
            <p>You haven't saved any jobs yet</p>
            <button onClick={() => navigate('/jobs')}>Browse Jobs</button>
          </div>
        ) : (
          <div className="saved-jobs-list">
            {savedJobs.map(job => (
              <div className="job-card" key={job.id}>
                <div className="job-info" onClick={() => viewJobDetails(job.id)}>
                  <div className="company-logo">
                    {job.employer?.logo_url ? (
                      <img src={job.employer.logo_url} alt={`${job.employer.company_name} logo`} />
                    ) : (
                      <div className="logo-placeholder">
                        {job.employer?.company_name?.charAt(0) || 'C'}
                      </div>
                    )}
                  </div>
                  <div className="job-details">
                    <h3 className="job-title">{job.title}</h3>
                    <p className="company-name">{job.employer?.company_name}</p>
                    <div className="job-meta">
                      <span><i className="fas fa-map-marker-alt"></i> {job.location}</span>
                      {job.salary_min && job.salary_max && (
                        <span><i className="fas fa-money-bill-wave"></i> {formatSalary(job.salary_min)} - {formatSalary(job.salary_max)}</span>
                      )}
                      <span><i className="fas fa-calendar"></i> Posted on {formatDate(job.posted_date)}</span>
                    </div>
                    <div className="job-tags">
                      {job.job_type && <span className="job-type">{job.job_type}</span>}
                      {job.experience_level && <span className="experience-level">{job.experience_level}</span>}
                    </div>
                  </div>
                </div>
                <div className="job-actions">
                  <button className="apply-button" onClick={() => viewJobDetails(job.id)}>
                    <i className="fas fa-external-link-alt"></i> View Details
                  </button>
                  <button className="unsave-button" onClick={() => handleRemoveFromSaved(job.id)}>
                    <i className="fas fa-trash-alt"></i> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs; 