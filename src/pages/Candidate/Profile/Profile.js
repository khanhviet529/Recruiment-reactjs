import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../../../services/httpClient';
import './profile.scss';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    bio: '',
    date_of_birth: '',
    gender: '',
    title: '',
    years_of_experience: '',
    education_level: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        throw new Error('User not found');
      }

      // Fetch user profile
      const userProfiles = await http.get(`/userProfiles?user_id=${user.id}`);
      if (!userProfiles || userProfiles.length === 0) {
        throw new Error('Profile not found');
      }

      // Fetch candidate profile
      const candidates = await http.get(`/candidates?user_id=${user.id}`);
      
      const profileData = {
        ...userProfiles[0],
        ...candidates[0]
      };

      setProfile(profileData);
      setFormData({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        bio: profileData.bio || '',
        date_of_birth: profileData.date_of_birth || '',
        gender: profileData.gender || '',
        title: profileData.title || '',
        years_of_experience: profileData.years_of_experience || '',
        education_level: profileData.education_level || ''
      });
      setAvatarPreview(profileData.avatar_url || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Update user profile
      await http.patch(`/userProfiles/${profile.id}`, {
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        avatar_url: avatarPreview
      });

      // Update candidate profile
      await http.patch(`/candidates/${profile.id}`, {
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        title: formData.title,
        years_of_experience: formData.years_of_experience,
        education_level: formData.education_level
      });

      setIsEditing(false);
      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profile) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Information</h1>
        <button 
          className="edit-button"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="avatar-section">
          <div className="avatar-preview">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          {isEditing && (
            <div className="avatar-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isLoading}
              />
              <button type="button" className="upload-button">
                Change Avatar
              </button>
            </div>
          )}
        </div>

        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              disabled={!isEditing || isLoading}
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing || isLoading}
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing || isLoading}
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing || isLoading}
              rows="4"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Professional Information</h2>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={!isEditing || isLoading}
            />
          </div>

          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              name="years_of_experience"
              value={formData.years_of_experience}
              onChange={handleChange}
              disabled={!isEditing || isLoading}
            />
          </div>

          <div className="form-group">
            <label>Education Level</label>
            <select
              name="education_level"
              value={formData.education_level}
              onChange={handleChange}
              disabled={!isEditing || isLoading}
            >
              <option value="">Select Education Level</option>
              <option value="High School">High School</option>
              <option value="Associate Degree">Associate Degree</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="Doctorate">Doctorate</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h2>Personal Information</h2>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              disabled={!isEditing || isLoading}
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={!isEditing || isLoading}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {isEditing && (
          <div className="form-actions">
            <button
              type="submit"
              className="save-button"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;