import React from 'react';
import { Link } from 'react-router-dom';
import { HeartOutlined, HeartFilled, EnvironmentOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';
import { useSavedJobs } from '../../context/SavedJobsContext';

const JobCard = ({ job, savedJobs = [], onSaveJob }) => {
  const { isJobSaved, toggleSaveJob } = useSavedJobs();
  
  // Use context if available, otherwise fall back to props
  const isSaved = isJobSaved ? isJobSaved(job.id) : savedJobs.includes(job.id);

  const formatSalary = (salary) => {
    if (!salary) return 'Thương lượng';
    if (salary.isHidden) return 'Thương lượng';
    return `${salary.min?.toLocaleString()} - ${salary.max?.toLocaleString()} ${salary.currency}/${salary.period}`;
  };

  const formattedDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hôm nay';
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays <= 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (toggleSaveJob) {
      // Use context method if available
      await toggleSaveJob(job.id);
    } else if (onSaveJob) {
      // Fall back to props method
      onSaveJob(job.id);
    }
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <Link to={`/jobs/${job.id}`} className="company-logo">
          <img 
            src={job.companyLogo || "https://via.placeholder.com/100?text=Logo"} 
            alt={job.companyName || "Company"}
          />
        </Link>
        {job.isUrgent && <span className="urgent-badge">Gấp</span>}
        <button 
          className={`save-button ${isSaved ? 'saved' : ''}`}
          onClick={handleSaveClick}
        >
          {isSaved ? <HeartFilled /> : <HeartOutlined />}
        </button>
      </div>
      
      <div className="job-card-body">
        <Link to={`/jobs/${job.id}`} className="job-title">{job.title}</Link>
        <Link to={`/companies/${job.employerId}`} className="company-name">
          {job.companyName}
        </Link>
        
        <div className="job-info">
          <div className="info-item">
            <EnvironmentOutlined />
            <span>{job.location}{job.isRemote ? ' (Remote)' : ''}</span>
          </div>
          <div className="info-item">
            <DollarOutlined />
            <span>{formatSalary(job.salary)}</span>
          </div>
          <div className="info-item">
            <ClockCircleOutlined />
            <span>{job.jobType}</span>
          </div>
        </div>
        
        <div className="job-skills">
          {job.skills && job.skills.slice(0, 3).map((skill, index) => (
            <Tag key={index}>{skill}</Tag>
          ))}
          {job.skills && job.skills.length > 3 && (
            <Tooltip title={job.skills.slice(3).join(', ')}>
              <Tag>+{job.skills.length - 3}</Tag>
            </Tooltip>
          )}
        </div>
      </div>
      
      <div className="job-card-footer">
        <div className="posted-date">
          <i className="bi bi-clock"></i>
          {formattedDate(job.createdAt)}
        </div>
        <Link to={`/jobs/${job.id}`} className="view-job">
          Xem chi tiết <i className="bi bi-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
};

export default JobCard; 