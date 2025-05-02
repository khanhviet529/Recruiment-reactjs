import React from 'react';
import { Link } from 'react-router-dom';

const CompanyCard = ({ company }) => {
  const benefits = company?.benefits || [];
  const location = company?.location || {};

  return (
    <div className="card h-100 company-card">
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          {company.logo ? (
            <img 
              src={company.logo} 
              alt={company.companyName} 
              className="company-logo me-3"
            />
          ) : (
            <div className="company-logo-placeholder me-3">
              {company.companyName?.charAt(0).toUpperCase() || 'C'}
            </div>
          )}
          <div>
            <h5 className="card-title mb-1">
              <Link to={`/companies/${company.id}`} className="text-decoration-none">
                {company.companyName || 'Công ty chưa đặt tên'}
              </Link>
            </h5>
            <div className="text-muted small">
              <i className="bi bi-geo-alt me-1"></i>
              {location.city ? `${location.city}, ${location.country}` : 'Chưa cập nhật địa điểm'}
            </div>
          </div>
        </div>

        <div className="company-info mb-3">
          {company.industry && (
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-briefcase me-2 text-primary"></i>
              <span>{company.industry}</span>
            </div>
          )}
          {company.companySize && (
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-people me-2 text-primary"></i>
              <span>{company.companySize} nhân viên</span>
            </div>
          )}
          {company.foundedYear && (
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-calendar me-2 text-primary"></i>
              <span>Thành lập năm {company.foundedYear}</span>
            </div>
          )}
          {company.verified && (
            <div className="d-flex align-items-center">
              <i className="bi bi-patch-check-fill me-2 text-primary"></i>
              <span className="text-primary">Đã xác thực</span>
            </div>
          )}
        </div>

        {company.description && (
          <div className="company-description mb-3">
            <p className="text-muted mb-0 text-truncate">
              {company.description}
            </p>
          </div>
        )}

        {benefits.length > 0 && (
          <div className="company-benefits">
            <h6 className="fw-bold mb-2">Phúc lợi nổi bật</h6>
            <div className="d-flex flex-wrap gap-2">
              {benefits.slice(0, 3).map((benefit, index) => (
                <span key={index} className="badge bg-light text-dark">
                  {benefit}
                </span>
              ))}
              {benefits.length > 3 && (
                <span className="badge bg-light text-primary">
                  +{benefits.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="card-footer bg-white border-top-0">
        <Link 
          to={`/companies/${company.id}`} 
          className="btn btn-outline-primary w-100"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
};

export default CompanyCard; 