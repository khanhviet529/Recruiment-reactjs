import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const contactInfoSchema = Yup.object({
  email: Yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  phone: Yup.string().required('Số điện thoại là bắt buộc'),
  address: Yup.string().required('Địa chỉ là bắt buộc'),
  city: Yup.string().required('Thành phố là bắt buộc'),
  country: Yup.string().required('Quốc gia là bắt buộc'),
  linkedin: Yup.string().url('URL LinkedIn không hợp lệ'),
  github: Yup.string().url('URL GitHub không hợp lệ'),
  website: Yup.string().url('URL website không hợp lệ'),
});

const ContactInfoSection = ({ candidate, setCandidate }) => {
  const [editMode, setEditMode] = useState(false);

  const handleContactInfoSubmit = async (values) => {
    try {
      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        contactInfo: values,
      });
      setCandidate(response.data);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating contact information:', error);
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Thông tin liên hệ</h5>
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => setEditMode(!editMode)}
        >
          <i className="bi bi-pencil me-1"></i> {editMode ? 'Hủy' : 'Chỉnh sửa'}
        </button>
      </div>
      <div className="card-body">
        {editMode ? (
          <Formik
            initialValues={candidate?.contactInfo || {
              email: '',
              phone: '',
              address: '',
              city: '',
              country: '',
              linkedin: '',
              github: '',
              website: ''
            }}
            validationSchema={contactInfoSchema}
            onSubmit={handleContactInfoSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
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
                  <div className="col-md-6">
                    <label className="form-label">Địa chỉ</label>
                    <Field type="text" name="address" className="form-control" />
                    <ErrorMessage name="address" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Thành phố</label>
                    <Field type="text" name="city" className="form-control" />
                    <ErrorMessage name="city" component="div" className="text-danger" />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Quốc gia</label>
                    <Field type="text" name="country" className="form-control" />
                    <ErrorMessage name="country" component="div" className="text-danger" />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">LinkedIn</label>
                    <Field type="url" name="linkedin" className="form-control" />
                    <ErrorMessage name="linkedin" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">GitHub</label>
                    <Field type="url" name="github" className="form-control" />
                    <ErrorMessage name="github" component="div" className="text-danger" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Website cá nhân</label>
                  <Field type="url" name="website" className="form-control" />
                  <ErrorMessage name="website" component="div" className="text-danger" />
                </div>
                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    Lưu thay đổi
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <div>
            <div className="row mb-3">
              <div className="col-md-6">
                <h6>Email</h6>
                <p>{candidate?.contactInfo?.email || 'Chưa cập nhật'}</p>
              </div>
              <div className="col-md-6">
                <h6>Số điện thoại</h6>
                <p>{candidate?.contactInfo?.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <h6>Địa chỉ</h6>
                <p>{candidate?.contactInfo?.address || 'Chưa cập nhật'}</p>
              </div>
              <div className="col-md-6">
                <h6>Thành phố</h6>
                <p>{candidate?.contactInfo?.city || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <h6>Quốc gia</h6>
                <p>{candidate?.contactInfo?.country || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <h6>LinkedIn</h6>
                <p>
                  {candidate?.contactInfo?.linkedin ? (
                    <a href={candidate.contactInfo.linkedin} target="_blank" rel="noopener noreferrer">
                      {candidate.contactInfo.linkedin}
                    </a>
                  ) : 'Chưa cập nhật'}
                </p>
              </div>
              <div className="col-md-6">
                <h6>GitHub</h6>
                <p>
                  {candidate?.contactInfo?.github ? (
                    <a href={candidate.contactInfo.github} target="_blank" rel="noopener noreferrer">
                      {candidate.contactInfo.github}
                    </a>
                  ) : 'Chưa cập nhật'}
                </p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <h6>Website cá nhân</h6>
                <p>
                  {candidate?.contactInfo?.website ? (
                    <a href={candidate.contactInfo.website} target="_blank" rel="noopener noreferrer">
                      {candidate.contactInfo.website}
                    </a>
                  ) : 'Chưa cập nhật'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactInfoSection; 