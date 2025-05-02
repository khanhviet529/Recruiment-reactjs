import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [job, setJob] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch job details
        const jobResponse = await axios.get(`http://localhost:5000/jobs/${id}`);
        setJob(jobResponse.data);

        // Fetch employer details
        const employerResponse = await axios.get(`http://localhost:5000/employers/${jobResponse.data.employerId}`);
        setEmployer(employerResponse.data);

        setLoading(false);
      } catch (err) {
        setError('Không thể tải thông tin công việc');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    setApplying(true);
    try {
      // Here you would typically make an API call to apply for the job
      // For now, we'll just show a success message
      alert('Đã gửi đơn ứng tuyển thành công!');
    } catch (err) {
      alert('Có lỗi xảy ra khi gửi đơn ứng tuyển');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (salary) => {
    if (salary.isHidden) return 'Thương lượng';
    return `${salary.min} - ${salary.max} ${salary.currency}/${salary.period}`;
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
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

  if (!job) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">Không tìm thấy công việc</div>
      </div>
    );
  }

  return (
    <div className="job-detail-page py-5">
      <div className="container">
        <div className="row">
          {/* Main Content */}
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h1 className="h3 mb-2">{job.title}</h1>
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-primary me-2">{job.jobType}</span>
                      {job.isUrgent && <span className="badge bg-danger me-2">Gấp</span>}
                      {job.isRemote && <span className="badge bg-info">Remote</span>}
                    </div>
                    <div className="text-muted">
                      <i className="bi bi-geo-alt me-1"></i>
                      {job.location}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="h4 text-primary mb-2">{formatSalary(job.salary)}</div>
                    <div className="text-muted small">
                      <i className="bi bi-eye me-1"></i>
                      {job.views} lượt xem
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="mb-3">Mô tả công việc</h5>
                  <p>{job.description}</p>
                </div>

                <div className="mb-4">
                  <h5 className="mb-3">Trách nhiệm</h5>
                  <ul className="list-unstyled">
                    {job.responsibilities.map((item, index) => (
                      <li key={index} className="mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="mb-3">Yêu cầu</h5>
                  <ul className="list-unstyled">
                    {job.requirements.map((item, index) => (
                      <li key={index} className="mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="mb-3">Quyền lợi</h5>
                  <ul className="list-unstyled">
                    {job.benefits.map((item, index) => (
                      <li key={index} className="mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="mb-3">Kỹ năng yêu cầu</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span key={index} className="badge bg-light text-dark">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Thông tin ứng tuyển</h5>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Hạn nộp hồ sơ:</span>
                    <span>{new Date(job.applicationDeadline).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Số lượng tuyển:</span>
                    <span>{job.positions} người</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Đã ứng tuyển:</span>
                    <span>{job.applications} người</span>
                  </div>
                </div>
                <button
                  className="btn btn-primary w-100"
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang gửi...
                    </>
                  ) : (
                    'Ứng tuyển ngay'
                  )}
                </button>
              </div>
            </div>

            {/* Employer Information */}
            {employer && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">Thông tin nhà tuyển dụng</h5>
                  
                  {/* Company Header */}
                  <Link 
                    to={`/companies/${employer.id}`}
                    className="text-decoration-none text-dark"
                  >
                    <div className="d-flex align-items-center mb-3 hover-effect">
                      <div className="company-logo me-3">
                        <img
                          src={employer.logo}
                          alt={employer.companyName}
                          className="rounded-circle"
                          width="60"
                          height="60"
                        />
                      </div>
                      <div>
                        <h6 className="mb-1">{employer.companyName}</h6>
                        <div className="text-muted small">
                          <i className="bi bi-building me-1"></i>
                          {employer.industry}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Company Description */}
                  <div className="mb-3">
                    <p className="small text-muted mb-2">{employer.description}</p>
                  </div>

                  {/* Company Details */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-geo-alt me-2"></i>
                      <span className="small text-muted">
                        {employer.location.address}, {employer.location.city}, {employer.location.country}
                      </span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-people me-2"></i>
                      <span className="small text-muted">Quy mô: {employer.companySize} nhân viên</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-calendar me-2"></i>
                      <span className="small text-muted">Thành lập: {employer.foundedYear}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-envelope me-2"></i>
                      <span className="small text-muted">{employer.contactEmail}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-telephone me-2"></i>
                      <span className="small text-muted">{employer.contactPhone}</span>
                    </div>
                  </div>

                  {/* Company Culture */}
                  <div className="mb-3">
                    <h6 className="small mb-2">Văn hóa công ty</h6>
                    <p className="small text-muted">{employer.culture}</p>
                  </div>

                  {/* Company Benefits */}
                  <div className="mb-3">
                    <h6 className="small mb-2">Quyền lợi</h6>
                    <ul className="list-unstyled small text-muted">
                      {employer.benefits.map((benefit, index) => (
                        <li key={index} className="mb-1">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Social Links */}
                  <div className="d-flex gap-2">
                    {employer.socialLinks.linkedin && (
                      <a href={employer.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted">
                        <i className="bi bi-linkedin fs-5"></i>
                      </a>
                    )}
                    {employer.socialLinks.facebook && (
                      <a href={employer.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted">
                        <i className="bi bi-facebook fs-5"></i>
                      </a>
                    )}
                    {employer.socialLinks.twitter && (
                      <a href={employer.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted">
                        <i className="bi bi-twitter fs-5"></i>
                      </a>
                    )}
                    {employer.website && (
                      <a href={employer.website} target="_blank" rel="noopener noreferrer" className="text-muted">
                        <i className="bi bi-globe fs-5"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail; 