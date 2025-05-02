import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const referenceSchema = Yup.object({
  name: Yup.string().required('Tên người tham chiếu là bắt buộc'),
  position: Yup.string().required('Vị trí là bắt buộc'),
  company: Yup.string().required('Công ty là bắt buộc'),
  email: Yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  phone: Yup.string().required('Số điện thoại là bắt buộc'),
  relationship: Yup.string().required('Mối quan hệ là bắt buộc'),
});

const ReferencesSection = ({ candidate, setCandidate }) => {
  const [editMode, setEditMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const handleReferenceSubmit = async (values) => {
    try {
      const updatedReferences = editingItem
        ? candidate.references.map(ref => ref.id === editingItem.id ? values : ref)
        : [...(candidate.references || []), { ...values, id: Date.now().toString() }];

      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        references: updatedReferences,
      });

      setCandidate(response.data);
      setEditMode(null);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating references:', error);
    }
  };

  const handleReferenceDelete = async (id) => {
    try {
      const updatedReferences = candidate.references.filter(ref => ref.id !== id);
      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        references: updatedReferences,
      });
      setCandidate(response.data);
    } catch (error) {
      console.error('Error deleting reference:', error);
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Người tham chiếu</h5>
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => {
            setEditMode('reference');
            setEditingItem(null);
          }}
        >
          <i className="bi bi-plus me-1"></i> Thêm mới
        </button>
      </div>
      <div className="card-body">
        {editMode === 'reference' && (
          <Formik
            initialValues={editingItem || {
              name: '',
              position: '',
              company: '',
              email: '',
              phone: '',
              relationship: ''
            }}
            validationSchema={referenceSchema}
            onSubmit={handleReferenceSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="mb-4">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Họ tên</label>
                    <Field type="text" name="name" className="form-control" />
                    <ErrorMessage name="name" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Vị trí</label>
                    <Field type="text" name="position" className="form-control" />
                    <ErrorMessage name="position" component="div" className="text-danger" />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Công ty</label>
                    <Field type="text" name="company" className="form-control" />
                    <ErrorMessage name="company" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mối quan hệ</label>
                    <Field as="select" name="relationship" className="form-select">
                      <option value="">Chọn mối quan hệ</option>
                      <option value="manager">Quản lý trực tiếp</option>
                      <option value="colleague">Đồng nghiệp</option>
                      <option value="client">Khách hàng</option>
                      <option value="professor">Giáo viên/Giảng viên</option>
                      <option value="other">Khác</option>
                    </Field>
                    <ErrorMessage name="relationship" component="div" className="text-danger" />
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
        <div className="references-list">
          {candidate?.references?.length > 0 ? (
            candidate.references.map((ref, index) => (
              <div key={index} className="mb-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{ref.name}</h6>
                    <p className="mb-1 text-muted">
                      {ref.position} tại {ref.company}
                    </p>
                    <p className="mb-1 small">
                      Mối quan hệ: {
                        ref.relationship === 'manager' ? 'Quản lý trực tiếp' :
                        ref.relationship === 'colleague' ? 'Đồng nghiệp' :
                        ref.relationship === 'client' ? 'Khách hàng' :
                        ref.relationship === 'professor' ? 'Giáo viên/Giảng viên' :
                        'Khác'
                      }
                    </p>
                    <p className="mb-1 small">
                      Email: <a href={`mailto:${ref.email}`}>{ref.email}</a>
                    </p>
                    <p className="mb-0 small">
                      Điện thoại: <a href={`tel:${ref.phone}`}>{ref.phone}</a>
                    </p>
                  </div>
                  <div>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => {
                        setEditMode('reference');
                        setEditingItem(ref);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleReferenceDelete(ref.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">Chưa có người tham chiếu nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferencesSection; 