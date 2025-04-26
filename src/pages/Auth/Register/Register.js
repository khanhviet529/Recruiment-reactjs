import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, checkEmailExists } from '../../../services/api';
import './register.scss';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('candidate');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    // Candidate specific
    dateOfBirth: '',
    gender: '',
    yearsOfExperience: '',
    educationLevel: '',
    title: '',
    // Employer specific
    companyName: '',
    companySize: '',
    industry: '',
    website: '',
    companyDescription: '',
    establishedYear: '',
    taxCode: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Common fields validation
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role specific validation
    if (role === 'candidate') {
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience is required';
      if (!formData.educationLevel) newErrors.educationLevel = 'Education level is required';
      if (!formData.title) newErrors.title = 'Title is required';
    } else if (role === 'employer') {
      if (!formData.companyName) newErrors.companyName = 'Company name is required';
      if (!formData.companySize) newErrors.companySize = 'Company size is required';
      if (!formData.industry) newErrors.industry = 'Industry is required';
      if (!formData.taxCode) newErrors.taxCode = 'Tax code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      // Check if email exists
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        setErrors(prev => ({ ...prev, email: 'Email already exists' }));
        return;
      }

      // Prepare user data
      const userData = {
        ...formData,
        role
      };

      // Register user
      const result = await registerUser(userData);
      
      if (result.success) {
        // Redirect to login page
        navigate('/login', { state: { message: 'Registration successful! Please login.' } });
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors(prev => ({ ...prev, submit: 'Registration failed. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Create Account</h2>
        
        <div className="role-selector">
          <button
            className={`role-option ${role === 'candidate' ? 'active' : ''}`}
            onClick={() => setRole('candidate')}
          >
            Candidate
          </button>
          <button
            className={`role-option ${role === 'employer' ? 'active' : ''}`}
            onClick={() => setRole('employer')}
          >
            Employer
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
            />
            {errors.firstName && <span className="error">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
            {errors.lastName && <span className="error">{errors.lastName}</span>}
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          {role === 'candidate' && (
            <>
              <div className="form-group">
                <input
                  type="date"
                  name="dateOfBirth"
                  placeholder="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
                {errors.dateOfBirth && <span className="error">{errors.dateOfBirth}</span>}
              </div>

              <div className="form-group">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="error">{errors.gender}</span>}
              </div>

              <div className="form-group">
                <input
                  type="number"
                  name="yearsOfExperience"
                  placeholder="Years of Experience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                />
                {errors.yearsOfExperience && <span className="error">{errors.yearsOfExperience}</span>}
              </div>

              <div className="form-group">
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                >
                  <option value="">Select Education Level</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD</option>
                </select>
                {errors.educationLevel && <span className="error">{errors.educationLevel}</span>}
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="title"
                  placeholder="Professional Title"
                  value={formData.title}
                  onChange={handleChange}
                />
                {errors.title && <span className="error">{errors.title}</span>}
              </div>
            </>
          )}

          {role === 'employer' && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  name="companyName"
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                />
                {errors.companyName && <span className="error">{errors.companyName}</span>}
              </div>

              <div className="form-group">
                <select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                >
                  <option value="">Select Company Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
                {errors.companySize && <span className="error">{errors.companySize}</span>}
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="industry"
                  placeholder="Industry"
                  value={formData.industry}
                  onChange={handleChange}
                />
                {errors.industry && <span className="error">{errors.industry}</span>}
              </div>

              <div className="form-group">
                <input
                  type="url"
                  name="website"
                  placeholder="Company Website"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <textarea
                  name="companyDescription"
                  placeholder="Company Description"
                  value={formData.companyDescription}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <input
                  type="number"
                  name="establishedYear"
                  placeholder="Established Year"
                  value={formData.establishedYear}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="taxCode"
                  placeholder="Tax Code"
                  value={formData.taxCode}
                  onChange={handleChange}
                />
                {errors.taxCode && <span className="error">{errors.taxCode}</span>}
              </div>
            </>
          )}

          {errors.submit && <div className="error-message">{errors.submit}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register; 