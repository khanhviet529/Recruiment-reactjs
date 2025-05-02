import React from 'react';
import { Link } from 'react-router-dom';

const JobCard = ({ job }) => {
  const formatSalary = (salary) => {
    if (salary.isHidden) return 'Thương lượng';
    return `${salary.min} - ${salary.max} ${salary.currency}/${salary.period}`;
  };

  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title mb-0">{job.title}</h5>
          {job.isUrgent && (
            <span className="badge bg-danger">Gấp</span>
          )}
        </div>
        <h6 className="card-subtitle mb-2 text-muted">
          {job.company?.name}
        </h6>
        <p className="card-text text-truncate">{job.shortDescription}</p>
        <div className="mb-3">
          <small className="text-muted">
            <i className="bi bi-geo-alt me-1"></i>
            {job.location?.name}
          </small>
          <small className="text-muted ms-3">
            <i className="bi bi-cash me-1"></i>
            {formatSalary(job.salary)}
          </small>
        </div>
        <div className="mb-3">
          {job.skills?.slice(0, 3).map((skill, index) => (
            <span key={index} className="badge bg-light text-dark me-1">
              {skill}
            </span>
          ))}
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            <i className="bi bi-clock me-1"></i>
            {new Date(job.createdAt).toLocaleDateString('vi-VN')}
          </small>
          <Link to={`/jobs/${job.id}`} className="btn btn-outline-primary btn-sm">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard; 