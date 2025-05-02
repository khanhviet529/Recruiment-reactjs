import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/CompanyDetail.scss';

const CompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch company details
        const companyResponse = await axios.get(`http://localhost:5000/employers/${id}`);
        setCompany(companyResponse.data);

        // Fetch company jobs
        const jobsResponse = await axios.get('http://localhost:5000/jobs');
        const companyJobs = jobsResponse.data.filter(job => job.employerId === parseInt(id));
        setJobs(companyJobs);

        setLoading(false);
      } catch (err) {
        setError('Không thể tải thông tin công ty');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">Không tìm thấy thông tin công ty</div>
      </div>
    );
  }

  const formatSalary = (salary) => {
    if (salary.isHidden) return 'Thương lượng';
    return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency}/${salary.period}`;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="company-detail">
      {/* Cover Image */}
      <div 
        className="cover-image position-relative"
        style={{
          height: '300px',
          backgroundImage: `url(${company.coverImage || 'https://via.placeholder.com/1920x300'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="overlay position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>
      </div>

      {/* Company Info Header */}
      <div className="container position-relative" style={{ marginTop: '-80px' }}>
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-8 d-flex align-items-center">
                {/* Logo */}
                <div 
                  className="company-logo rounded bg-white shadow-sm p-3 me-4"
                  style={{ width: '120px', height: '120px' }}
                >
                  {company.logo ? (
                    <img 
                      src={company.logo} 
                      alt={company.companyName}
                      className="img-fluid"
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                      <span className="display-4 text-muted">
                        {company.companyName?.charAt(0).toUpperCase() || 'C'}
                      </span>
                    </div>
                  )}
                </div>
                {/* Basic Info */}
                <div>
                  <h1 className="h3 mb-2">{company.companyName || 'Công ty chưa đặt tên'}</h1>
                  <div className="d-flex flex-wrap gap-3 text-muted">
                    <div>
                      <i className="bi bi-geo-alt me-1"></i>
                      {company.location?.city ? `${company.location.city}, ${company.location.country}` : 'Chưa cập nhật địa điểm'}
                    </div>
                    <div>
                      <i className="bi bi-people me-1"></i>
                      {company.companySize || 'Chưa cập nhật'} nhân viên
                    </div>
                    <div>
                      <i className="bi bi-briefcase me-1"></i>
                      {company.industry || 'Chưa cập nhật ngành nghề'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-md-end mt-3 mt-md-0">
                {company.verified && (
                  <div className="text-primary mb-2">
                    <i className="bi bi-patch-check-fill me-1"></i>
                    Đã xác thực
                  </div>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    <i className="bi bi-globe me-1"></i>
                    Trang web công ty
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-4">
        <div className="row">
          {/* Left Content */}
          <div className="col-lg-8">
            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'about' ? 'active' : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  Giới thiệu
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'jobs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('jobs')}
                >
                  Việc làm ({jobs.length})
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            {activeTab === 'about' ? (
              <div className="tab-content">
                {/* Description */}
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-3">Giới thiệu công ty</h5>
                    <p className="text-justify mb-0">
                      {company.description || 'Chưa có thông tin giới thiệu'}
                    </p>
                  </div>
                </div>

                {/* Company Culture */}
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-3">Văn hóa công ty</h5>
                    <p className="text-justify mb-0">
                      {company.culture || 'Chưa có thông tin về văn hóa công ty'}
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                {company.benefits && company.benefits.length > 0 && (
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Phúc lợi</h5>
                      <div className="row g-3">
                        {company.benefits.map((benefit, index) => (
                          <div key={index} className="col-md-6">
                            <div className="d-flex align-items-center p-3 rounded border benefit-item">
                              <i className="bi bi-check-circle-fill text-primary me-2"></i>
                              {benefit}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="tab-content">
                {jobs.length > 0 ? (
                  <div className="job-list">
                    {jobs.map(job => (
                      <div key={job.id} className="card mb-3 job-card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="card-title mb-2">
                                <Link to={`/jobs/${job.id}`} className="text-decoration-none">
                                  {job.title}
                                </Link>
                              </h5>
                              <div className="d-flex flex-wrap gap-3 text-muted mb-3">
                                <div>
                                  <i className="bi bi-briefcase me-1"></i>
                                  {job.jobType === 'full-time' ? 'Toàn thời gian' : 'Bán thời gian'}
                                </div>
                                <div>
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {job.location}
                                </div>
                                <div>
                                  <i className="bi bi-cash me-1"></i>
                                  {formatSalary(job.salary)}
                                </div>
                              </div>
                              <p className="card-text text-muted mb-3">
                                {job.shortDescription}
                              </p>
                              <div className="d-flex flex-wrap gap-2 mb-3">
                                {job.skills.slice(0, 5).map((skill, index) => (
                                  <span key={index} className="badge bg-light text-dark">
                                    {skill}
                                  </span>
                                ))}
                                {job.skills.length > 5 && (
                                  <span className="badge bg-light text-primary">
                                    +{job.skills.length - 5}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-end">
                              {job.isUrgent && (
                                <span className="badge bg-danger mb-2">Gấp</span>
                              )}
                              <div className="text-muted small">
                                <i className="bi bi-eye me-1"></i>
                                {job.views} lượt xem
                              </div>
                              <div className="text-muted small">
                                <i className="bi bi-people me-1"></i>
                                {job.applications} ứng viên
                              </div>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <div className="text-muted small">
                              <i className="bi bi-clock me-1"></i>
                              Hạn nộp: {formatDate(job.applicationDeadline)}
                            </div>
                            <Link 
                              to={`/jobs/${job.id}`}
                              className="btn btn-outline-primary btn-sm"
                            >
                              Xem chi tiết
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-info">
                    Hiện tại không có vị trí tuyển dụng nào
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="col-lg-4">
            {/* Company Details */}
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Thông tin chi tiết</h5>
                
                {company.foundedYear && (
                  <div className="mb-3">
                    <div className="text-muted mb-2">Năm thành lập</div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-calendar3 text-primary me-2"></i>
                      {company.foundedYear}
                    </div>
                  </div>
                )}

                {company.location?.address && (
                  <div className="mb-3">
                    <div className="text-muted mb-2">Địa chỉ</div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-geo-alt text-primary me-2"></i>
                      {company.location.address}, {company.location.city}, {company.location.country}
                    </div>
                  </div>
                )}

                {company.contactEmail && (
                  <div className="mb-3">
                    <div className="text-muted mb-2">Email liên hệ</div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-envelope text-primary me-2"></i>
                      <a href={`mailto:${company.contactEmail}`} className="text-decoration-none">
                        {company.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {company.contactPhone && (
                  <div className="mb-3">
                    <div className="text-muted mb-2">Số điện thoại</div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-telephone text-primary me-2"></i>
                      <a href={`tel:${company.contactPhone}`} className="text-decoration-none">
                        {company.contactPhone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {(company.socialLinks?.linkedin || company.socialLinks?.facebook || company.socialLinks?.twitter) && (
                  <div>
                    <div className="text-muted mb-2">Mạng xã hội</div>
                    <div className="d-flex gap-2 social-links">
                      {company.socialLinks?.linkedin && (
                        <a href={company.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" 
                           className="btn btn-outline-primary btn-sm">
                          <i className="bi bi-linkedin"></i>
                        </a>
                      )}
                      {company.socialLinks?.facebook && (
                        <a href={company.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                           className="btn btn-outline-primary btn-sm">
                          <i className="bi bi-facebook"></i>
                        </a>
                      )}
                      {company.socialLinks?.twitter && (
                        <a href={company.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                           className="btn btn-outline-primary btn-sm">
                          <i className="bi bi-twitter"></i>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail; 