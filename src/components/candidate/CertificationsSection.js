import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const certificationSchema = Yup.object({
  name: Yup.string().required('Tên chứng chỉ là bắt buộc'),
  issuer: Yup.string().required('Tổ chức cấp là bắt buộc'),
  issueDate: Yup.date().required('Ngày cấp là bắt buộc'),
  expiryDate: Yup.date().min(Yup.ref('issueDate'), 'Ngày hết hạn phải sau ngày cấp'),
  credentialId: Yup.string(),
  credentialUrl: Yup.string().url('URL không hợp lệ'),
});

const CertificationsSection = ({ candidate, setCandidate }) => {
  const [editMode, setEditMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Debug effect to track candidate prop changes
  useEffect(() => {
    console.log('🔍 CertificationsSection - Candidate prop:', candidate);
    if (candidate && candidate.certificationss) {
      console.log('🔍 CertificationsSection - Data:', candidate.certificationss);
      console.log('🔍 CertificationsSection - Count:', candidate.certificationss?.length || 0);
    }
  }, [candidate]);


const handleCertificationSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      console.log('🔄 Updating section data...');
      
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
      console.log('Submitting certification data:', values);
      
      // Create new certification item with unique ID
      const newCertification = {
        ...values,
        id: editingItem ? editingItem.id : Date.now().toString(),
        issueDate: values.issueDate,
        expiryDate: values.expiryDate || null
      };

      // Update certifications array
      let updatedCertifications;
      if (editingItem) {
        // Update existing certification
        updatedCertifications = (candidate.certifications || []).map(cert => 
          cert.id === editingItem.id ? newCertification : cert
        );
      } else {
        // Add new certification
        updatedCertifications = [...(candidate.certifications || []), newCertification];
      }

      console.log('Updated certifications:', updatedCertifications);

      // Update candidate with new certifications
      const updatedCandidate = {
        ...currentCandidateData, // Keep all existing data
        certifications: updatedCertifications,
        updatedAt: new Date().toISOString()
      };

      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, updatedCandidate);
      console.log('Server response:', response.data);

      setCandidate(response.data);
      setEditMode(null);
      setEditingItem(null);
      resetForm();
      alert('Chứng chỉ đã được lưu thành công!');
    } catch (error) {
      console.error('Error updating certifications:', error);
      alert('Có lỗi xảy ra khi lưu chứng chỉ!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCertificationDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chứng chỉ này?')) return;

    try {
      console.log('🔄 Updating section data...');
      
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
      const updatedCertifications = (candidate.certifications || []).filter(cert => cert.id !== id);
      const updatedCandidate = {
        ...currentCandidateData, // Keep all existing data
        certifications: updatedCertifications,
        updatedAt: new Date().toISOString()
      };

      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, updatedCandidate);
      setCandidate(response.data);
      alert('Chứng chỉ đã được xóa thành công!');
    } catch (error) {
      console.error('Error deleting certification:', error);
      alert('Có lỗi xảy ra khi xóa chứng chỉ!');
    }
  };

  const handleEdit = (certification) => {
    setEditingItem(certification);
    setEditMode('certification');
  };

  const handleCancel = () => {
    setEditMode(null);
    setEditingItem(null);
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
          <i className="bi bi-plus me-1"></i> Thêm chứng chỉ
        </button>
      </div>
      <div className="card-body">
        {editMode === 'certification' && (
          <div className="border p-3 mb-4 rounded">
            <h6 className="mb-3">{editingItem ? 'Chỉnh sửa chứng chỉ' : 'Thêm chứng chỉ mới'}</h6>
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
              enableReinitialize
            >
              {({ isSubmitting, values }) => (
                <Form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Tên chứng chỉ</label>
                      <Field type="text" name="name" className="form-control" placeholder="VD: AWS Certified Solutions Architect" />
                      <ErrorMessage name="name" component="div" className="text-danger" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Tổ chức cấp</label>
                      <Field type="text" name="issuer" className="form-control" placeholder="VD: Amazon Web Services" />
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
                      <label className="form-label">Ngày hết hạn (tùy chọn)</label>
                      <Field type="date" name="expiryDate" className="form-control" />
                      <ErrorMessage name="expiryDate" component="div" className="text-danger" />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">ID chứng chỉ (tùy chọn)</label>
                      <Field type="text" name="credentialId" className="form-control" placeholder="Mã số chứng chỉ" />
                      <ErrorMessage name="credentialId" component="div" className="text-danger" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">URL chứng chỉ (tùy chọn)</label>
                      <Field type="url" name="credentialUrl" className="form-control" placeholder="https://..." />
                      <ErrorMessage name="credentialUrl" component="div" className="text-danger" />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Đang lưu...' : (editingItem ? 'Cập nhật' : 'Thêm chứng chỉ')}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}

        <div className="certifications-list">
          {candidate?.certifications?.length > 0 ? (
            candidate.certifications.map((cert, index) => (
              <div key={cert.id || index} className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h6 className="mb-1 text-primary">{cert.name}</h6>
                    <p className="mb-1 text-muted">{cert.issuer}</p>
                    <p className="mb-1 small text-muted">
                      Cấp: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('vi-VN') : 'N/A'}
                      {cert.expiryDate && ` - Hết hạn: ${new Date(cert.expiryDate).toLocaleDateString('vi-VN')}`}
                    </p>
                    {cert.credentialId && (
                      <p className="mb-1 small"><strong>ID:</strong> {cert.credentialId}</p>
                    )}
                    {cert.credentialUrl && (
                      <p className="mb-0 small">
                        <strong>URL:</strong> 
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="ms-1">
                          Xem chứng chỉ
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="ms-3">
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(cert)}
                      title="Chỉnh sửa"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleCertificationDelete(cert.id)}
                      title="Xóa"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted py-4">
              <i className="bi bi-award fs-1 d-block mb-2"></i>
              <p>Chưa có chứng chỉ nào</p>
              <button 
                className="btn btn-outline-primary"
                onClick={() => {
                  setEditMode('certification');
                  setEditingItem(null);
                }}
              >
                Thêm chứng chỉ đầu tiên
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificationsSection; 