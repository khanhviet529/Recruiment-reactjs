import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import http from '../../../services/httpClient';
import './jobDetail.scss';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [application, setApplication] = useState({
    cover_letter: '',
    resume_url: ''
  });
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true);
      
      // Fetch job details
      const jobData = await http.get(`/jobPosts/${id}`);
      if (!jobData) {
        throw new Error('Không tìm thấy công việc');
      }
      
      // Fetch employer details
      const employerData = await http.get(`/employers/${jobData.employer_id}`);
      
      // Fetch saved status if user is logged in
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.roleProfile) {
        const savedJobsData = await http.get(`/savedJobs?candidate_id=${user.roleProfile.id}&job_post_id=${id}`);
        setIsSaved(savedJobsData && savedJobsData.length > 0);
        
        // Check if already applied
        const applicationsData = await http.get(`/applications?candidate_id=${user.roleProfile.id}&job_post_id=${id}`);
        if (applicationsData && applicationsData.length > 0) {
          setApplicationStatus(applicationsData[0].status);
        }
      }
      
      setJob(jobData);
      setEmployer(employerData);
      
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError(error.message || 'Đã xảy ra lỗi khi tải thông tin công việc');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJob = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.roleProfile) {
        navigate('/login');
        return;
      }
      
      if (isSaved) {
        // Find the savedJob entry to delete
        const savedJobsData = await http.get(`/savedJobs?candidate_id=${user.roleProfile.id}&job_post_id=${id}`);
        if (savedJobsData && savedJobsData.length > 0) {
          await http.delete(`/savedJobs/${savedJobsData[0].id}`);
          setIsSaved(false);
        }
      } else {
        // Add new saved job
        await http.post('/savedJobs', {
          candidate_id: user.roleProfile.id,
          job_post_id: id,
          saved_at: new Date().toISOString()
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.roleProfile) {
        navigate('/login');
        return;
      }
      
      await http.post('/applications', {
        job_post_id: id,
        candidate_id: user.roleProfile.id,
        cover_letter: application.cover_letter,
        resume_url: application.resume_url || user.roleProfile.resume_url,
        status: 'pending',
        applied_at: new Date().toISOString(),
        last_status_update: new Date().toISOString(),
        notes: ''
      });
      
      setApplicationStatus('pending');
      setIsApplying(false);
    } catch (error) {
      console.error('Error applying for job:', error);
      setError('Đã xảy ra lỗi khi nộp đơn ứng tuyển');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (isLoading) {
    return <div className="loading">Đang tải thông tin công việc...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="job-detail-container">
      <div className="job-detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
        <button className={`save-button ${isSaved ? 'saved' : ''}`} onClick={handleSaveJob}>
          <i className={isSaved ? 'fas fa-heart' : 'far fa-heart'}></i>
          {isSaved ? 'Đã lưu' : 'Lưu tin'}
        </button>
      </div>

      <div className="job-detail-content">
        <div className="job-main-info">
          <div className="job-logo">
            <img src={employer?.company_logo || '/default-company-logo.png'} alt="Company logo" />
          </div>
          <div className="job-info">
            <h1 className="job-title">{job?.title}</h1>
            <div className="company-name">{employer?.company_name}</div>
            <div className="job-meta">
              <div className="job-deadline">
                <i className="fas fa-calendar-alt"></i>
                Hạn nộp hồ sơ: {job?.deadline ? formatDate(job.deadline) : 'Không có thời hạn'}
              </div>
              <div className="job-views">
                <i className="fas fa-eye"></i>
                Lượt xem: {job?.views_count || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="job-apply-section">
          {applicationStatus ? (
            <div className={`application-status ${applicationStatus}`}>
              <i className="fas fa-info-circle"></i>
              Trạng thái ứng tuyển: {applicationStatus === 'pending' ? 'Đang chờ xét duyệt' : 
                applicationStatus === 'reviewing' ? 'Đang xét duyệt' : 
                applicationStatus === 'accepted' ? 'Đã được chấp nhận' : 'Đã bị từ chối'}
            </div>
          ) : (
            <div className="apply-buttons">
              <button 
                className="apply-button"
                onClick={() => setIsApplying(true)}
              >
                <i className="fas fa-paper-plane"></i> Ứng tuyển ngay
              </button>
            </div>
          )}
        </div>

        <div className="job-highlights">
          <div className="highlight-item">
            <div className="highlight-label">Mức lương</div>
            <div className="highlight-value">
              {job?.is_salary_negotiable 
                ? 'Thỏa thuận' 
                : `${job?.salary_min} - ${job?.salary_max} ${job?.salary_currency || 'VND'}`
              }
            </div>
          </div>
          <div className="highlight-item">
            <div className="highlight-label">Địa điểm</div>
            <div className="highlight-value">{job?.location || 'Không xác định'}</div>
          </div>
          <div className="highlight-item">
            <div className="highlight-label">Kinh nghiệm</div>
            <div className="highlight-value">{job?.experience_required || 'Không yêu cầu'}</div>
          </div>
          <div className="highlight-item">
            <div className="highlight-label">Hình thức</div>
            <div className="highlight-value">
              {job?.employment_type === 'full-time' ? 'Toàn thời gian' :
               job?.employment_type === 'part-time' ? 'Bán thời gian' :
               job?.employment_type === 'internship' ? 'Thực tập' :
               job?.employment_type === 'contract' ? 'Hợp đồng' : 'Không xác định'}
            </div>
          </div>
          <div className="highlight-item">
            <div className="highlight-label">Học vấn</div>
            <div className="highlight-value">{job?.education_required || 'Không yêu cầu'}</div>
          </div>
        </div>

        <div className="job-description-section">
          <h2>Mô tả công việc</h2>
          <div className="description-content">
            {job?.description || 'Không có mô tả'}
          </div>
        </div>

        <div className="job-requirements-section">
          <h2>Yêu cầu công việc</h2>
          <div className="requirements-content">
            {job?.requirements || 'Không có yêu cầu cụ thể'}
          </div>
        </div>

        <div className="job-benefits-section">
          <h2>Quyền lợi</h2>
          <div className="benefits-content">
            {job?.benefits || 'Không có thông tin'}
          </div>
        </div>

        <div className="employer-info-section">
          <h2>Thông tin công ty</h2>
          <div className="employer-info">
            <div className="employer-logo">
              <img src={employer?.company_logo || '/default-company-logo.png'} alt="Company logo" />
            </div>
            <div className="employer-details">
              <h3>{employer?.company_name}</h3>
              <div className="employer-meta">
                <div className="employer-size">
                  <i className="fas fa-users"></i>
                  Quy mô: {employer?.company_size || 'Không có thông tin'}
                </div>
                <div className="employer-industry">
                  <i className="fas fa-building"></i>
                  Ngành nghề: {employer?.industry || 'Không có thông tin'}
                </div>
                {employer?.website && (
                  <div className="employer-website">
                    <i className="fas fa-globe"></i>
                    Website: <a href={employer.website} target="_blank" rel="noopener noreferrer">{employer.website}</a>
                  </div>
                )}
              </div>
              <div className="employer-description">
                {employer?.company_description || 'Không có mô tả'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isApplying && (
        <div className="application-modal">
          <div className="application-form">
            <div className="form-header">
              <h3>Ứng tuyển: {job?.title}</h3>
              <button className="close-button" onClick={() => setIsApplying(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label>Thư giới thiệu</label>
                <textarea 
                  value={application.cover_letter}
                  onChange={(e) => setApplication({...application, cover_letter: e.target.value})}
                  placeholder="Giới thiệu về bản thân và lý do bạn phù hợp với vị trí này..."
                  rows="8"
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label>Link CV/Hồ sơ (nếu có)</label>
                <input 
                  type="text"
                  value={application.resume_url}
                  onChange={(e) => setApplication({...application, resume_url: e.target.value})}
                  placeholder="Link đến CV/hồ sơ của bạn (nếu có)"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setIsApplying(false)}>
                  Hủy
                </button>
                <button type="submit" className="submit-button">
                  Nộp đơn ứng tuyển
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail; 