import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import moment from 'moment';

const experienceSchema = Yup.object({
  title: Yup.string().required('Chức danh là bắt buộc'),
  company: Yup.string().required('Công ty là bắt buộc'),
  location: Yup.string(),
  startDate: Yup.string().required('Ngày bắt đầu là bắt buộc'),
  endDate: Yup.string().nullable(),
  description: Yup.string(),
});

const ExperienceSection = ({ candidate, setCandidate }) => {
  const [editMode, setEditMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const handleAddExperience = async (values) => {
    try {
      const newExperience = [...(candidate.experience || []), { ...values, id: Date.now().toString() }];
      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        experience: newExperience,
      });
      setCandidate(response.data);
      setEditMode(null);
    } catch (error) {
      console.error('Error adding experience:', error);
    }
  };

  const handleUpdateExperience = async (values) => {
    try {
      const updatedExperience = candidate.experience.map(exp => 
        exp.id === editingItem.id ? values : exp
      );
      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        experience: updatedExperience,
      });
      setCandidate(response.data);
      setEditMode(null);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating experience:', error);
    }
  };

  const handleDeleteExperience = async (id) => {
    try {
      const updatedExperience = candidate.experience.filter(exp => exp.id !== id);
      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        experience: updatedExperience,
      });
      setCandidate(response.data);
    } catch (error) {
      console.error('Error deleting experience:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Hiện tại';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Kinh nghiệm làm việc</h5>
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => {
            setEditMode('experience');
            setEditingItem(null);
          }}
        >
          <i className="bi bi-plus me-1"></i> Thêm mới
        </button>
      </div>
      <div className="card-body">
        {editMode === 'experience' && (
          <Formik
            initialValues={editingItem || {
              title: '',
              company: '',
              location: '',
              startDate: '',
              endDate: '',
              description: ''
            }}
            validationSchema={experienceSchema}
            onSubmit={editingItem ? handleUpdateExperience : handleAddExperience}
          >
            {({ isSubmitting }) => (
              <Form className="mb-4">
                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Chức danh</label>
                    <Field type="text" name="title" className="form-control" />
                    <ErrorMessage name="title" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Công ty</label>
                    <Field type="text" name="company" className="form-control" />
                    <ErrorMessage name="company" component="div" className="text-danger" />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Địa điểm</label>
                    <Field type="text" name="location" className="form-control" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Thời gian</label>
                    <div className="row">
                      <div className="col-6">
                        <Field type="date" name="startDate" className="form-control" />
                        <ErrorMessage name="startDate" component="div" className="text-danger" />
                      </div>
                      <div className="col-6">
                        <Field type="date" name="endDate" className="form-control" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12">
                    <label className="form-label">Mô tả công việc</label>
                    <Field as="textarea" name="description" className="form-control" rows="3" />
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
        {candidate?.experience?.length > 0 ? (
          candidate.experience.map((exp, index) => (
            <div key={index} className="mb-4 experience-item">
              <div className="d-flex justify-content-between">
                <h5>{exp.title}</h5>
                <div>
                  <button 
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => {
                      setEditMode('experience');
                      setEditingItem(exp);
                    }}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteExperience(exp.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <p className="text-muted">{exp.company} - {exp.location}</p>
              <p className="text-muted">
                {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
              </p>
              <p>{exp.description}</p>
            </div>
          ))
        ) : (
          <p className="text-muted">Chưa có kinh nghiệm làm việc</p>
        )}
      </div>
    </div>
  );
};

export default ExperienceSection; 