import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import moment from 'moment';

const certificationSchema = Yup.object({
  name: Yup.string().required('Tên chứng chỉ là bắt buộc'),
  issuer: Yup.string().required('Tổ chức cấp là bắt buộc'),
  issueDate: Yup.string().required('Ngày cấp là bắt buộc'),
  expiryDate: Yup.string().nullable(),
  credentialId: Yup.string(),
  credentialUrl: Yup.string().url('URL chứng chỉ không hợp lệ'),
});

const CertificationsSection = ({ candidate, setCandidate }) => {
  const [editMode, setEditMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const handleCertificationSubmit = async (values) => {
    try {
      const updatedCertifications = editingItem
        ? candidate.certifications.map(cert => cert.id === editingItem.id ? values : cert)
        : [...(candidate.certifications || []), { ...values, id: Date.now().toString() }];

      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        certifications: updatedCertifications,
      });

      setCandidate(response.data);
      setEditMode(null);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating certifications:', error);
    }
  };

  const handleCertificationDelete = async (id) => {
    try {
      const updatedCertifications = candidate.certifications.filter(cert => cert.id !== id);
      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        certifications: updatedCertifications,
      });
      setCandidate(response.data);
    } catch (error) {
      console.error('Error deleting certification:', error);
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Chứng chỉ</h5>
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => {
            setEditMode('certification');
            setEditingItem(null);
          }}
        >
          <i className="bi bi-plus me-1"></i> Thêm mới
        </button>
      </div>
      <div className="card-body">
        {editMode === 'certification' && (
          <Formik
            initialValues={editingItem || {
              name: '',
              issuer: '',
              issueDate: '',
              expiryDate: '',
              credentialId: '',
              credentialUrl: ''
            }}
            validationSchema={certificationSchema}
            onSubmit={handleCertificationSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="mb-4">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Tên chứng chỉ</label>
                    <Field type="text" name="name" className="form-control" />
                    <ErrorMessage name="name" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tổ chức cấp</label>
                    <Field type="text" name="issuer" className="form-control" />
                    <ErrorMessage name="issuer" component="div" className="text-danger" />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Ngày cấp</label>
                    <Field type="date" name="issueDate" className="form-control" />
                    <ErrorMessage name="issueDate" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Ngày hết hạn</label>
                    <Field type="date" name="expiryDate" className="form-control" />
                    <ErrorMessage name="expiryDate" component="div" className="text-danger" />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Mã chứng chỉ</label>
                    <Field type="text" name="credentialId" className="form-control" />
                    <ErrorMessage name="credentialId" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">URL chứng chỉ</label>
                    <Field type="url" name="credentialUrl" className="form-control" />
                    <ErrorMessage name="credentialUrl" component="div" className="text-danger" />
                  </div>
                </div>
                <div className="d-flex justify-content-end">
                  <button type="button" className="btn btn-secondary me-2" onClick={() => {
                    setEditMode(null);
                    setEditingItem(null);
                  }}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {editingItem ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
        <div className="certifications-list">
          {candidate?.certifications?.length > 0 ? (
            candidate.certifications.map((cert, index) => (
              <div key={index} className="mb-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{cert.name}</h6>
                    <p className="mb-1 text-muted">{cert.issuer}</p>
                    <p className="mb-1 small">
                      Ngày cấp: {new Date(cert.issueDate).toLocaleDateString('vi-VN')}
                      {cert.expiryDate && (
                        <> - Hết hạn: {new Date(cert.expiryDate).toLocaleDateString('vi-VN')}</>
                      )}
                    </p>
                    {cert.credentialId && (
                      <p className="mb-1 small">Mã chứng chỉ: {cert.credentialId}</p>
                    )}
                    {cert.credentialUrl && (
                      <a 
                        href={cert.credentialUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="small d-block mb-2"
                      >
                        Xem chứng chỉ
                      </a>
                    )}
                  </div>
                  <div>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => {
                        setEditMode('certification');
                        setEditingItem(cert);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleCertificationDelete(cert.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">Chưa có chứng chỉ nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificationsSection; 