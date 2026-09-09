import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import moment from 'moment';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const workExperienceSchema = Yup.object({
  company: Yup.string().required('Tên công ty là bắt buộc'),
  position: Yup.string().required('Vị trí là bắt buộc'),
  startDate: Yup.string().required('Ngày bắt đầu là bắt buộc'),
  endDate: Yup.string().nullable(),
  description: Yup.string().required('Mô tả công việc là bắt buộc'),
  achievements: Yup.array().of(Yup.string()),
});

const WorkExperienceSection = ({ candidate, setCandidate }) => {
  const [editMode, setEditMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Debug effect to track candidate prop changes
  useEffect(() => {
    console.log('🔍 WorkExperienceSection - Candidate prop:', candidate);
    if (candidate && candidate.workExperiences) {
      console.log('🔍 WorkExperienceSection - Data:', candidate.workExperiences);
      console.log('🔍 WorkExperienceSection - Count:', candidate.workExperiences?.length || 0);
    }
  }, [candidate]);


const handleWorkExperienceSubmit = async (values) => {
    try {
      console.log('🔄 Submitting work experience data:', values);
      
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
      
      // Format dates to strings
      const formattedValues = {
        ...values,
        startDate: values.startDate,
        endDate: values.endDate,
        id: editingItem ? editingItem.id : Date.now().toString()
      };

      const updatedExperiences = editingItem
        ? (currentCandidateData.workExperiences || []).map(exp => exp.id === editingItem.id ? formattedValues : exp)
        : [...(currentCandidateData.workExperiences || []), formattedValues];

      console.log('💼 Updated work experiences:', updatedExperiences);

      // Preserve ALL existing fields, only update workExperiences
      const updatedCandidate = {
        ...currentCandidateData, // Keep all existing data
        workExperiences: updatedExperiences,
        updatedAt: new Date().toISOString()
      };

      console.log('📝 Sending updated candidate data');
      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, updatedCandidate);

      setCandidate(response.data);
      setEditMode(null);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating work experiences:', error);
    }
  };

  const handleWorkExperienceDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa kinh nghiệm làm việc này?')) return;

    try {
      console.log('🗑️ Deleting work experience with id:', id);
      
      // SAFETY CHECK: Get current candidate data first
      let currentCandidateData = {};
      try {
        const currentResponse = await axios.get(`http://localhost:5000/candidates/${candidate.id}`);
        currentCandidateData = currentResponse.data;
      } catch (error) {
        console.warn('⚠️ Could not fetch current candidate data, using props:', error);
        currentCandidateData = candidate;
      }
      
      const updatedWorkExperiences = (currentCandidateData.workExperiences || []).filter(exp => exp.id !== id);
      
      // Preserve ALL existing fields, only update workExperiences
      const updatedCandidate = {
        ...currentCandidateData, // Keep all existing data
        workExperiences: updatedWorkExperiences,
        updatedAt: new Date().toISOString()
      };

      console.log('📝 Sending updated candidate data');
      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, updatedCandidate);
      setCandidate(response.data);
      alert('Kinh nghiệm làm việc đã được xóa thành công!');
    } catch (error) {
      console.error('Error deleting work experience:', error);
      alert('Có lỗi xảy ra khi xóa kinh nghiệm làm việc!');
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Kinh nghiệm làm việc</h5>
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => {
            setEditMode('workExperience');
            setEditingItem(null);
          }}
        >
          <PlusOutlined className="me-1" /> Thêm mới
        </button>
      </div>
      <div className="card-body">
        {editMode === 'workExperience' && (
          <Formik
            initialValues={editingItem || {
              company: '',
              position: '',
              startDate: '',
              endDate: '',
              description: '',
              achievements: []
            }}
            validationSchema={workExperienceSchema}
            onSubmit={handleWorkExperienceSubmit}
          >
            {({ isSubmitting, values }) => (
              <Form className="mb-4">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Tên công ty</label>
                    <Field type="text" name="company" className="form-control" />
                    <ErrorMessage name="company" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Vị trí</label>
                    <Field type="text" name="position" className="form-control" />
                    <ErrorMessage name="position" component="div" className="text-danger" />
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
                  <label className="form-label">Mô tả công việc</label>
                  <Field as="textarea" name="description" className="form-control" rows="3" />
                  <ErrorMessage name="description" component="div" className="text-danger" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Thành tựu</label>
                  <FieldArray
                    name="achievements"
                    render={arrayHelpers => (
                      <div>
                        {values.achievements?.map((achievement, index) => (
                          <div key={index} className="d-flex mb-2">
                            <Field 
                              name={`achievements.${index}`} 
                              className="form-control me-2" 
                            />
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => arrayHelpers.remove(index)}
                            >
                              <DeleteOutlined />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => arrayHelpers.push('')}
                        >
                          Thêm thành tựu
                        </button>
                      </div>
                    )}
                  />
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
        <div className="work-experiences-list">
          {candidate?.workExperiences?.length > 0 ? (
            candidate.workExperiences.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{exp.position}</h6>
                    <p className="mb-1 text-muted">{exp.company}</p>
                    <p className="mb-1 small">
                      {new Date(exp.startDate).toLocaleDateString('vi-VN')} - 
                      {exp.endDate ? new Date(exp.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
                    </p>
                    <p className="mb-2">{exp.description}</p>
                    {exp.achievements?.length > 0 && (
                      <div>
                        <h6 className="small">Thành tựu:</h6>
                        <ul className="mb-0">
                          {exp.achievements.map((achievement, idx) => (
                            <li key={idx}>{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => {
                        setEditMode('workExperience');
                        setEditingItem(exp);
                      }}
                    >
                      <EditOutlined />
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleWorkExperienceDelete(exp.id)}
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">Chưa có kinh nghiệm làm việc nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkExperienceSection; 