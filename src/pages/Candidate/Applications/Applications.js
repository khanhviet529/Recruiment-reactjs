import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../../../services/httpClient';
import './applications.scss';

const Applications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user.roleProfile) {
        navigate('/login');
        return;
      }
      
      // Fetch applications
      const applicationsData = await http.get(`/applications?candidate_id=${user.roleProfile.id}`);
      
      if (!applicationsData || applicationsData.length === 0) {
        setApplications([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch job and employer details for each application
      const applicationPromises = applicationsData.map(async (application) => {
        try {
          const jobData = await http.get(`/jobPosts/${application.job_post_id}`);
          
          if (!jobData) return null;
          
          // Fetch employer details
          const employerData = await http.get(`/employers/${jobData.employer_id}`);
          
          return {
            ...application,
            job: jobData,
            employer: employerData,
          };
        } catch (error) {
          console.error(`Error fetching application details ${application.id}:`, error);
          return null;
        }
      });
      
      const applicationsWithDetails = (await Promise.all(applicationPromises)).filter(app => app !== null);
      
      // Sort by application date (newest first)
      applicationsWithDetails.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));
      
      setApplications(applicationsWithDetails);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Đã xảy ra lỗi khi tải danh sách đơn ứng tuyển');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredApplications = () => {
    if (statusFilter === 'all') {
      return applications;
    }
    return applications.filter(app => app.status === statusFilter);
  };

  const handleViewJobDetails = (jobId) => {
    navigate(`/candidate/jobs/${jobId}`);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ xét duyệt';
      case 'reviewing':
        return 'Đang xét duyệt';
      case 'accepted':
        return 'Đã được chấp nhận';
      case 'rejected':
        return 'Đã bị từ chối';
      default:
        return 'Không xác định';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'reviewing':
        return 'reviewing';
      case 'accepted':
        return 'accepted';
      case 'rejected':
        return 'rejected';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (isLoading) {
    return <div className="loading">Đang tải danh sách đơn ứng tuyển...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const filteredApplications = getFilteredApplications();

  return (
    <div className="applications-container">
      <div className="applications-header">
        <div className="header-left">
          <h1>Đơn ứng tuyển của tôi</h1>
          <div className="status-filters">
            <button 
              className={`filter-button ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              Tất cả ({applications.length})
            </button>
            <button 
              className={`filter-button ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              Đang chờ ({applications.filter(app => app.status === 'pending').length})
            </button>
            <button 
              className={`filter-button ${statusFilter === 'reviewing' ? 'active' : ''}`}
              onClick={() => setStatusFilter('reviewing')}
            >
              Đang xét duyệt ({applications.filter(app => app.status === 'reviewing').length})
            </button>
            <button 
              className={`filter-button ${statusFilter === 'accepted' ? 'active' : ''}`}
              onClick={() => setStatusFilter('accepted')}
            >
              Đã chấp nhận ({applications.filter(app => app.status === 'accepted').length})
            </button>
            <button 
              className={`filter-button ${statusFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setStatusFilter('rejected')}
            >
              Đã từ chối ({applications.filter(app => app.status === 'rejected').length})
            </button>
          </div>
        </div>
        <button className="back-button" onClick={() => navigate('/candidate')}>
          <i className="fas fa-arrow-left"></i> Quay lại trang chủ
        </button>
      </div>

      <div className="applications-content">
        {applications.length === 0 ? (
          <div className="no-applications">
            <i className="far fa-file-alt"></i>
            <p>Bạn chưa có đơn ứng tuyển nào</p>
            <button className="browse-button" onClick={() => navigate('/candidate')}>
              Tìm việc làm ngay
            </button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="no-applications">
            <i className="far fa-folder-open"></i>
            <p>Không có đơn ứng tuyển nào trong trạng thái đã chọn</p>
            <button className="reset-button" onClick={() => setStatusFilter('all')}>
              Xem tất cả đơn ứng tuyển
            </button>
          </div>
        ) : (
          <div className="applications-list">
            {filteredApplications.map(application => (
              <div key={application.id} className="application-card">
                <div className="application-info" onClick={() => handleViewJobDetails(application.job.id)}>
                  <div className="job-logo">
                    <img src={application.employer?.company_logo || '/default-company-logo.png'} alt="Company logo" />
                  </div>
                  <div className="application-details">
                    <div className="application-header">
                      <h3 className="job-title">{application.job.title}</h3>
                      <div className={`status-badge ${getStatusClass(application.status)}`}>
                        {getStatusLabel(application.status)}
                      </div>
                    </div>
                    <div className="company-name">{application.employer?.company_name}</div>
                    <div className="application-meta">
                      <span className="application-date">
                        <i className="fas fa-calendar-alt"></i> Ngày nộp: {formatDate(application.applied_at)}
                      </span>
                      <span className="location">
                        <i className="fas fa-map-marker-alt"></i> {application.job.location || 'Không xác định'}
                      </span>
                      {application.last_status_update && (
                        <span className="update-date">
                          <i className="fas fa-clock"></i> Cập nhật: {formatDate(application.last_status_update)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {application.cover_letter && (
                  <div className="cover-letter">
                    <h4>Thư giới thiệu</h4>
                    <div className="letter-content">
                      {application.cover_letter}
                    </div>
                  </div>
                )}
                
                {application.notes && (
                  <div className="employer-notes">
                    <h4>Ghi chú từ nhà tuyển dụng</h4>
                    <div className="notes-content">
                      {application.notes}
                    </div>
                  </div>
                )}
                
                <div className="application-actions">
                  <button 
                    className="view-job-button"
                    onClick={() => handleViewJobDetails(application.job.id)}
                  >
                    <i className="fas fa-eye"></i> Xem chi tiết việc làm
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

export default Applications; 