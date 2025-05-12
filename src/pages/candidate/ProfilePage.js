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

      // First check if we already have candidateProfile in user object from auth
      if (user?.candidateProfile) {
        const profile = user.candidateProfile;
        
        // If the profile is missing names but we have them in user object, add them
        if ((!profile.firstName || !profile.lastName) && 
            (user.firstName || user.lastName || user.name)) {
          
          let updatedProfile = { ...profile };
          
          // Use firstName/lastName from the user object if available
          if (!profile.firstName && user.firstName) {
            updatedProfile.firstName = user.firstName;
          }
          if (!profile.lastName && user.lastName) {
            updatedProfile.lastName = user.lastName;
          }
          
          // If we still don't have names but have full name, try to parse it
          if ((!updatedProfile.firstName || !updatedProfile.lastName) && user.name) {
            const names = user.name.split(' ');
            const lastName = names.pop() || '';
            const firstName = names.join(' ') || '';
            
            if (!updatedProfile.firstName) updatedProfile.firstName = firstName;
            if (!updatedProfile.lastName) updatedProfile.lastName = lastName;
          }
          
          // If we have a picture in the user object but not in profile
          if (!updatedProfile.avatar && (user.picture || user.profilePicture)) {
            updatedProfile.avatar = user.picture || user.profilePicture;
          }
          
          setCandidate(updatedProfile);
        } else {
          setCandidate(profile);
        }
        
        setLoading(false);
        return;
      }

      // Otherwise fetch from API
      // For applicants, we need to find the candidate record with matching email
      const candidateResponse = await axios.get(`http://localhost:5000/candidates?email=${user.email}`);
      
      if (candidateResponse.data && candidateResponse.data.length > 0) {
        setCandidate(candidateResponse.data[0]);
      } else {
        // If not found by email, try finding by userId if it exists
        if (user.id) {
          const userIdResponse = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);
          if (userIdResponse.data && userIdResponse.data.length > 0) {
            setCandidate(userIdResponse.data[0]);
          } else {
            setError('Không tìm thấy thông tin hồ sơ');
          }
        } else {
          setError('Không tìm thấy thông tin hồ sơ');
        }
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

      // Make sure we have the correct candidate ID
      if (!candidate || !candidate.id) {
        throw new Error('Không có thông tin ứng viên');
      }

      const response = await axios.patch(
        `http://localhost:5000/candidates/${candidate.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update candidate state with the new avatar URL
      if (response.data && response.data.avatar) {
      setCandidate(prev => ({ ...prev, avatar: response.data.avatar }));
      message.success('Cập nhật ảnh đại diện thành công');
      } else {
        throw new Error('Không nhận được URL ảnh từ server');
      }
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
    customRequest: ({ file, onSuccess }) => {
      // This prevents default Upload behavior
      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    }
  };

  // Helper function to get avatar URL from complex structure
  const getAvatarUrl = (avatar) => {
    if (!avatar) {
      // Try to get avatar from user object properties
      if (user?.picture) {
        return user.picture;
      }
      if (user?.profilePicture) {
        return user.profilePicture;
      }
      return null;
    }

    // Handle Facebook profile picture format
    if (avatar.data && avatar.data.url) {
      return avatar.data.url;
    }
    // Handle direct URL string
    else if (typeof avatar === 'string') {
      return avatar;
    }
    // Handle other object formats that might have url property
    else if (avatar.url) {
      return avatar.url;
    }

    return null;
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

  const avatarUrl = getAvatarUrl(candidate.avatar);

  return (
    <div className="candidate-profile-page">
      <div className="profile-header mb-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex flex-column flex-md-row align-items-center">
              <div className="profile-avatar-container me-md-4 mb-3 mb-md-0">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl}
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
                    {candidate?.address || candidate?.location?.address || 'Chưa cập nhật địa chỉ'}
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
