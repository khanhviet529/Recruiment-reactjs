import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Upload, message, Button } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import "../../styles/ProfilePage.scss";
import PersonalInfoSection from '../../components/candidate/PersonalInfoSection';
import EducationSection from '../../components/candidate/EducationSection';
import WorkExperienceSection from '../../components/candidate/WorkExperienceSection';
import SkillsSection from '../../components/candidate/SkillsSection';
import ProjectsSection from '../../components/candidate/ProjectsSection';
import CertificationsSection from '../../components/candidate/CertificationsSection';
import LanguagesSection from '../../components/candidate/LanguagesSection';
import ReferencesSection from '../../components/candidate/ReferencesSection';
import JobPreferencesSection from '../../components/candidate/JobPreferencesSection';

const { Dragger } = Upload;

const CandidateProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCandidateData();
  }, [user]);

  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);
      
      if (response.data && response.data.length > 0) {
        setCandidate(response.data[0]);
      } else {
        setError('Không tìm thấy thông tin hồ sơ');
      }
    } catch (err) {
      console.error('Error fetching candidate data:', err);
      setError('Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post(
        `http://localhost:5000/candidates/${candidate.id}/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setCandidate(prev => ({ ...prev, avatar: response.data.avatar }));
      message.success('Cập nhật ảnh đại diện thành công');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      message.error('Có lỗi xảy ra khi cập nhật ảnh đại diện');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const uploadProps = {
    name: 'avatar',
    multiple: false,
    showUploadList: false,
    beforeUpload: handleUpload,
    accept: 'image/*',
  };

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

  if (!candidate) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">Không tìm thấy thông tin hồ sơ</div>
      </div>
    );
  }

  return (
    <div className="candidate-profile-page">
      <div className="profile-header mb-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex flex-column flex-md-row align-items-center">
              <div className="profile-avatar-container me-md-4 mb-3 mb-md-0">
                {candidate?.avatar ? (
                  <img 
                    src={candidate.avatar} 
                    alt={`${candidate.firstName || ''} ${candidate.lastName || ''}`} 
                    className="profile-avatar rounded-circle"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="profile-avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ width: '120px', height: '120px', fontSize: '3rem' }}
                  >
                    {candidate?.firstName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <Upload {...uploadProps}>
                  <Button 
                    type="primary" 
                    icon={<UploadOutlined />} 
                    loading={uploading}
                    className="mt-2"
                  >
                    Đổi ảnh
                  </Button>
                </Upload>
              </div>
              <div className="profile-info">
                <h2 className="mb-1">{`${candidate?.firstName || ''} ${candidate?.lastName || ''}`}</h2>
                <p className="text-muted mb-2">{candidate?.headline || 'Chưa cập nhật tiêu đề'}</p>
                <div className="d-flex flex-wrap mb-3">
                  <div className="me-4 mb-2">
                    <i className="bi bi-geo-alt me-2"></i>
                    {candidate?.location?.address || 'Chưa cập nhật địa chỉ'}
                  </div>
                </div>
                <p>{candidate?.summary || 'Chưa cập nhật giới thiệu'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="row">
          <div className="col-md-12 mb-4">
            <PersonalInfoSection candidate={candidate} setCandidate={setCandidate} />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <EducationSection candidate={candidate} setCandidate={setCandidate} />
          </div>
          <div className="col-md-6 mb-4">
            <WorkExperienceSection candidate={candidate} setCandidate={setCandidate} />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <SkillsSection candidate={candidate} setCandidate={setCandidate} />
          </div>
          <div className="col-md-6 mb-4">
            <LanguagesSection candidate={candidate} setCandidate={setCandidate} />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <ProjectsSection candidate={candidate} setCandidate={setCandidate} />
          </div>
          <div className="col-md-6 mb-4">
            <CertificationsSection candidate={candidate} setCandidate={setCandidate} />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <ReferencesSection candidate={candidate} setCandidate={setCandidate} />
          </div>
          <div className="col-md-6 mb-4">
            <JobPreferencesSection candidate={candidate} setCandidate={setCandidate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfilePage;
