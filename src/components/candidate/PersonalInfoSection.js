import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { message } from 'antd';
import moment from 'moment';

const PersonalInfoSection = ({ candidate, setCandidate }) => {
  const [editMode, setEditMode] = useState(false);

  const initialValues = {
    firstName: candidate?.firstName || '',
    lastName: candidate?.lastName || '',
    headline: candidate?.headline || '',
    summary: candidate?.summary || '',
    gender: candidate?.gender || 'male',
    dateOfBirth: candidate?.dateOfBirth || '',
    nationality: candidate?.nationality || '',
    maritalStatus: candidate?.maritalStatus || 'single',
    email: candidate?.email || '',
    phone: candidate?.phone || '',
    address: candidate?.address || '',
    city: candidate?.city || '',
    country: candidate?.country || '',
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('Vui lòng nhập họ'),
    lastName: Yup.string().required('Vui lòng nhập tên'),
    email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
    phone: Yup.string().required('Vui lòng nhập số điện thoại'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      console.log('🔄 Updating personal info for candidate:', candidate.id);
      console.log('📝 Form values:', values);
      
      // SAFETY CHECK: Get current candidate data first to preserve all fields
      let currentCandidateData = {};
      try {
        const currentResponse = await axios.get(`http://localhost:5000/candidates/${candidate.id}`);
        currentCandidateData = currentResponse.data;
        console.log('📦 Current candidate data:', currentCandidateData);
      } catch (error) {
        console.warn('⚠️ Could not fetch current candidate data, using props:', error);
        currentCandidateData = candidate;
      }
      
      // Prepare updated data - preserve ALL existing fields, only update what's changed
      const updatedCandidate = {
        ...currentCandidateData, // Keep all existing data
        // Only update the personal info fields
        firstName: values.firstName,
        lastName: values.lastName,
        headline: values.headline,
        summary: values.summary,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth,
        nationality: values.nationality,
        maritalStatus: values.maritalStatus,
        email: values.email,
        phone: values.phone,
        address: values.address,
        city: values.city,
        country: values.country,
        updatedAt: new Date().toISOString()
      };

      console.log('📝 Sending updated candidate data:', updatedCandidate);
      
      // Use PUT with complete data to ensure all fields are preserved
      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, updatedCandidate);
      
      if (response.data) {
        setCandidate(response.data);
        message.success('Cập nhật thông tin thành công');
        console.log('✅ Personal info updated successfully');
        setEditMode(false); // Exit edit mode after successful update
      }
    } catch (error) {
      console.error('❌ Error updating personal info:', error);
      message.error('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Thông tin cá nhân</h5>
        {!editMode && (
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => setEditMode(true)}
          >
            <i className="bi bi-pencil me-1"></i> Chỉnh sửa
          </button>
        )}
      </div>
      <div className="card-body">
        {editMode ? (
          // Edit Mode - Show Form
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, isSubmitting }) => (
              <Form>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Họ</label>
                    <Field type="text" name="firstName" className="form-control" />
                    <ErrorMessage name="firstName" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tên</label>
                    <Field type="text" name="lastName" className="form-control" />
                    <ErrorMessage name="lastName" component="div" className="text-danger" />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-12">
                    <label className="form-label">Tiêu đề hồ sơ</label>
                    <Field 
                      type="text" 
                      name="headline" 
                      className="form-control" 
                      placeholder="VD: Frontend Developer với 5 năm kinh nghiệm"
                    />
                    <ErrorMessage name="headline" component="div" className="text-danger" />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-12">
                    <label className="form-label">Tóm tắt bản thân</label>
                    <Field 
                      as="textarea" 
                      name="summary" 
                      className="form-control" 
                      rows="4"
                      placeholder="Mô tả ngắn gọn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp của bạn"
                    />
                    <ErrorMessage name="summary" component="div" className="text-danger" />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">Giới tính</label>
                    <Field as="select" name="gender" className="form-select">
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </Field>
                    <ErrorMessage name="gender" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Ngày sinh</label>
                    <Field type="date" name="dateOfBirth" className="form-control" />
                    <ErrorMessage name="dateOfBirth" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Tình trạng hôn nhân</label>
                    <Field as="select" name="maritalStatus" className="form-select">
                      <option value="single">Độc thân</option>
                      <option value="married">Đã kết hôn</option>
                      <option value="divorced">Đã ly hôn</option>
                    </Field>
                    <ErrorMessage name="maritalStatus" component="div" className="text-danger" />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <Field type="email" name="email" className="form-control" />
                    <ErrorMessage name="email" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Số điện thoại</label>
                    <Field type="text" name="phone" className="form-control" />
                    <ErrorMessage name="phone" component="div" className="text-danger" />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">Địa chỉ</label>
                    <Field type="text" name="address" className="form-control" />
                    <ErrorMessage name="address" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Thành phố</label>
                    <Field type="text" name="city" className="form-control" />
                    <ErrorMessage name="city" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Quốc gia</label>
                    <Field type="text" name="country" className="form-control" />
                    <ErrorMessage name="country" component="div" className="text-danger" />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Quốc tịch</label>
                    <Field type="text" name="nationality" className="form-control" />
                    <ErrorMessage name="nationality" component="div" className="text-danger" />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setEditMode(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          // View Mode - Show Data
          <div className="personal-info-view">
            <div className="row mb-3">
              <div className="col-md-6">
                <div>
                  <strong>Họ và tên:</strong> {candidate?.firstName} {candidate?.lastName}
                </div>
              </div>
              <div className="col-md-6">
                <div>
                  <strong>Email:</strong> {candidate?.email || 'Chưa cập nhật'}
                </div>
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-12">
                <div>
                  <strong>Tiêu đề:</strong> {candidate?.headline || 'Chưa cập nhật'}
                </div>
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-12">
                <div>
                  <strong>Tóm tắt:</strong> {candidate?.summary || 'Chưa cập nhật'}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <div>
                  <strong>Giới tính:</strong> {
                    candidate?.gender === 'male' ? 'Nam' :
                    candidate?.gender === 'female' ? 'Nữ' :
                    candidate?.gender === 'other' ? 'Khác' : 'Chưa cập nhật'
                  }
                </div>
              </div>
              <div className="col-md-4">
                <div>
                  <strong>Ngày sinh:</strong> {
                    candidate?.dateOfBirth ? 
                    new Date(candidate.dateOfBirth).toLocaleDateString('vi-VN') : 
                    'Chưa cập nhật'
                  }
                </div>
              </div>
              <div className="col-md-4">
                <div>
                  <strong>Tình trạng hôn nhân:</strong> {
                    candidate?.maritalStatus === 'single' ? 'Độc thân' :
                    candidate?.maritalStatus === 'married' ? 'Đã kết hôn' :
                    candidate?.maritalStatus === 'divorced' ? 'Đã ly hôn' : 'Chưa cập nhật'
                  }
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <div>
                  <strong>Số điện thoại:</strong> {candidate?.phone || 'Chưa cập nhật'}
                </div>
              </div>
              <div className="col-md-6">
                <div>
                  <strong>Quốc tịch:</strong> {candidate?.nationality || 'Chưa cập nhật'}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <div>
                  <strong>Địa chỉ:</strong> {candidate?.address || 'Chưa cập nhật'}
                </div>
              </div>
              <div className="col-md-4">
                <div>
                  <strong>Thành phố:</strong> {candidate?.city || 'Chưa cập nhật'}
                </div>
              </div>
              <div className="col-md-4">
                <div>
                  <strong>Quốc gia:</strong> {candidate?.country || 'Chưa cập nhật'}
                </div>
              </div>
            </div>

            {!candidate?.firstName && !candidate?.lastName && !candidate?.email && (
              <div className="text-center text-muted py-4">
                <i className="bi bi-person fs-1 d-block mb-2"></i>
                <p>Chưa có thông tin cá nhân</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setEditMode(true)}
                >
                  Cập nhật thông tin
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSection;
