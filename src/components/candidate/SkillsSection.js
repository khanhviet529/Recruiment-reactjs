import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const skillSchema = Yup.object({
  name: Yup.string().required('Tên kỹ năng là bắt buộc'),
  level: Yup.string().required('Mức độ là bắt buộc'),
  yearsOfExperience: Yup.number()
    .min(0, 'Số năm kinh nghiệm phải lớn hơn hoặc bằng 0')
    .required('Số năm kinh nghiệm là bắt buộc'),
  description: Yup.string(),
});

const SkillsSection = ({ candidate, setCandidate }) => {
  const [editMode, setEditMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const handleSkillSubmit = async (values) => {
    try {
      const updatedSkills = editingItem
        ? candidate.skills.map(skill => skill.id === editingItem.id ? values : skill)
        : [...(candidate.skills || []), { ...values, id: Date.now().toString() }];

      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        skills: updatedSkills,
      });

      setCandidate(response.data);
      setEditMode(null);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating skills:', error);
    }
  };

  const handleSkillDelete = async (id) => {
    try {
      const updatedSkills = candidate.skills.filter(skill => skill.id !== id);
      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        skills: updatedSkills,
      });
      setCandidate(response.data);
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Kỹ năng</h5>
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => {
            setEditMode('skill');
            setEditingItem(null);
          }}
        >
          <i className="bi bi-plus me-1"></i> Thêm mới
        </button>
      </div>
      <div className="card-body">
        {editMode === 'skill' && (
          <Formik
            initialValues={editingItem || {
              name: '',
              level: '',
              yearsOfExperience: '',
              description: ''
            }}
            validationSchema={skillSchema}
            onSubmit={handleSkillSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="mb-4">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Tên kỹ năng</label>
                    <Field type="text" name="name" className="form-control" />
                    <ErrorMessage name="name" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mức độ</label>
                    <Field as="select" name="level" className="form-select">
                      <option value="">Chọn mức độ</option>
                      <option value="beginner">Mới bắt đầu</option>
                      <option value="intermediate">Trung bình</option>
                      <option value="advanced">Nâng cao</option>
                      <option value="expert">Chuyên gia</option>
                    </Field>
                    <ErrorMessage name="level" component="div" className="text-danger" />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Số năm kinh nghiệm</label>
                    <Field type="number" name="yearsOfExperience" className="form-control" min="0" step="0.5" />
                    <ErrorMessage name="yearsOfExperience" component="div" className="text-danger" />
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
        <div className="skills-list">
          {candidate?.skills?.length > 0 ? (
            candidate.skills.map((skill, index) => (
              <div key={index} className="mb-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{skill.name}</h6>
                    <p className="mb-1 text-muted">
                      Mức độ: {
                        skill.level === 'beginner' ? 'Mới bắt đầu' :
                        skill.level === 'intermediate' ? 'Trung bình' :
                        skill.level === 'advanced' ? 'Nâng cao' :
                        'Chuyên gia'
                      }
                    </p>
                    <p className="mb-1">
                      Kinh nghiệm: {skill.yearsOfExperience} năm
                    </p>
                    {skill.description && (
                      <p className="mb-0 small">{skill.description}</p>
                    )}
                  </div>
                  <div>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => {
                        setEditMode('skill');
                        setEditingItem(skill);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleSkillDelete(skill.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">Chưa có kỹ năng nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsSection; 