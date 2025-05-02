import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import moment from 'moment';

const educationSchema = Yup.object({
  school: Yup.string().required('Tên trường là bắt buộc'),
  degree: Yup.string().required('Bằng cấp là bắt buộc'),
  major: Yup.string().required('Chuyên ngành là bắt buộc'),
  startDate: Yup.string().required('Ngày bắt đầu là bắt buộc'),
  endDate: Yup.string().nullable(),
  gpa: Yup.number().min(0).max(4),
  description: Yup.string(),
});

const EducationSection = ({ candidate, setCandidate }) => {
  const [editMode, setEditMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const handleEducationSubmit = async (values) => {
    try {
      const updatedEducations = editingItem
        ? candidate.educations.map(edu => edu.id === editingItem.id ? values : edu)
        : [...(candidate.educations || []), { ...values, id: Date.now().toString() }];

      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        educations: updatedEducations,
      });

      setCandidate(response.data);
      setEditMode(null);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating educations:', error);
    }
  };

  const handleEducationDelete = async (id) => {
    try {
      const updatedEducations = candidate.educations.filter(edu => edu.id !== id);
      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        educations: updatedEducations,
      });
      setCandidate(response.data);
    } catch (error) {
      console.error('Error deleting education:', error);
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Học vấn</h5>
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => {
            setEditMode('education');
            setEditingItem(null);
          }}
        >
          <i className="bi bi-plus me-1"></i> Thêm mới
        </button>
      </div>
      <div className="card-body">
        {editMode === 'education' && (
          <Formik
            initialValues={editingItem || {
              school: '',
              degree: '',
              major: '',
              startDate: '',
              endDate: '',
              gpa: '',
              description: ''
            }}
            validationSchema={educationSchema}
            onSubmit={handleEducationSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="mb-4">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Tên trường</label>
                    <Field type="text" name="school" className="form-control" />
                    <ErrorMessage name="school" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Bằng cấp</label>
                    <Field as="select" name="degree" className="form-select">
                      <option value="">Chọn bằng cấp</option>
                      <option value="high_school">Trung học phổ thông</option>
                      <option value="college">Cao đẳng</option>
                      <option value="bachelor">Đại học</option>
                      <option value="master">Thạc sĩ</option>
                      <option value="phd">Tiến sĩ</option>
                    </Field>
                    <ErrorMessage name="degree" component="div" className="text-danger" />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Chuyên ngành</label>
                    <Field type="text" name="major" className="form-control" />
                    <ErrorMessage name="major" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">GPA</label>
                    <Field type="number" name="gpa" className="form-control" min="0" max="4" step="0.01" />
                    <ErrorMessage name="gpa" component="div" className="text-danger" />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Ngày bắt đầu</label>
                    <Field type="date" name="startDate" className="form-control" />
                    <ErrorMessage name="startDate" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Ngày kết thúc</label>
                    <Field type="date" name="endDate" className="form-control" />
                    <ErrorMessage name="endDate" component="div" className="text-danger" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Mô tả</label>
                  <Field as="textarea" name="description" className="form-control" rows="3" />
                  <ErrorMessage name="description" component="div" className="text-danger" />
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
        <div className="education-list">
          {candidate?.educations?.length > 0 ? (
            candidate.educations.map((edu, index) => (
              <div key={index} className="mb-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{edu.school}</h6>
                    <p className="mb-1 text-muted">
                      {edu.degree === 'high_school' ? 'Trung học phổ thông' :
                       edu.degree === 'college' ? 'Cao đẳng' :
                       edu.degree === 'bachelor' ? 'Đại học' :
                       edu.degree === 'master' ? 'Thạc sĩ' :
                       'Tiến sĩ'} - {edu.major}
                    </p>
                    <p className="mb-1 small">
                      {new Date(edu.startDate).toLocaleDateString('vi-VN')} - 
                      {edu.endDate ? new Date(edu.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
                    </p>
                    {edu.gpa && (
                      <p className="mb-1">GPA: {edu.gpa}</p>
                    )}
                    {edu.description && (
                      <p className="mb-0 small">{edu.description}</p>
                    )}
                  </div>
                  <div>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => {
                        setEditMode('education');
                        setEditingItem(edu);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleEducationDelete(edu.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">Chưa có thông tin học vấn nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationSection; 