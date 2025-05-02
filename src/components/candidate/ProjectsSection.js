import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import moment from 'moment';

const projectSchema = Yup.object({
  name: Yup.string().required('Tên dự án là bắt buộc'),
  description: Yup.string().required('Mô tả là bắt buộc'),
  startDate: Yup.string().required('Ngày bắt đầu là bắt buộc'),
  endDate: Yup.string().nullable(),
  technologies: Yup.array().of(Yup.string()),
  responsibilities: Yup.array().of(Yup.string()),
  achievements: Yup.array().of(Yup.string()),
  projectUrl: Yup.string().url('URL dự án không hợp lệ'),
});

const ProjectsSection = ({ candidate, setCandidate }) => {
  const [editMode, setEditMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const handleProjectSubmit = async (values) => {
    try {
      const updatedProjects = editingItem
        ? candidate.projects.map(proj => proj.id === editingItem.id ? values : proj)
        : [...(candidate.projects || []), { ...values, id: Date.now().toString() }];

      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        projects: updatedProjects,
      });

      setCandidate(response.data);
      setEditMode(null);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating projects:', error);
    }
  };

  const handleProjectDelete = async (id) => {
    try {
      const updatedProjects = candidate.projects.filter(proj => proj.id !== id);
      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        projects: updatedProjects,
      });
      setCandidate(response.data);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Dự án</h5>
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => {
            setEditMode('project');
            setEditingItem(null);
          }}
        >
          <i className="bi bi-plus me-1"></i> Thêm mới
        </button>
      </div>
      <div className="card-body">
        {editMode === 'project' && (
          <Formik
            initialValues={editingItem || {
              name: '',
              description: '',
              startDate: '',
              endDate: '',
              technologies: [],
              responsibilities: [],
              achievements: [],
              projectUrl: ''
            }}
            validationSchema={projectSchema}
            onSubmit={handleProjectSubmit}
          >
            {({ isSubmitting, values }) => (
              <Form className="mb-4">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Tên dự án</label>
                    <Field type="text" name="name" className="form-control" />
                    <ErrorMessage name="name" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">URL dự án</label>
                    <Field type="url" name="projectUrl" className="form-control" />
                    <ErrorMessage name="projectUrl" component="div" className="text-danger" />
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
                  <label className="form-label">Mô tả dự án</label>
                  <Field as="textarea" name="description" className="form-control" rows="3" />
                  <ErrorMessage name="description" component="div" className="text-danger" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Công nghệ sử dụng</label>
                  <FieldArray
                    name="technologies"
                    render={arrayHelpers => (
                      <div>
                        {values.technologies?.map((tech, index) => (
                          <div key={index} className="d-flex mb-2">
                            <Field 
                              name={`technologies.${index}`} 
                              className="form-control me-2" 
                            />
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => arrayHelpers.remove(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => arrayHelpers.push('')}
                        >
                          Thêm công nghệ
                        </button>
                      </div>
                    )}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Trách nhiệm</label>
                  <FieldArray
                    name="responsibilities"
                    render={arrayHelpers => (
                      <div>
                        {values.responsibilities?.map((resp, index) => (
                          <div key={index} className="d-flex mb-2">
                            <Field 
                              name={`responsibilities.${index}`} 
                              className="form-control me-2" 
                            />
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => arrayHelpers.remove(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => arrayHelpers.push('')}
                        >
                          Thêm trách nhiệm
                        </button>
                      </div>
                    )}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Thành tựu</label>
                  <FieldArray
                    name="achievements"
                    render={arrayHelpers => (
                      <div>
                        {values.achievements?.map((achieve, index) => (
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
                              <i className="bi bi-trash"></i>
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
        <div className="projects-list">
          {candidate?.projects?.length > 0 ? (
            candidate.projects.map((proj, index) => (
              <div key={index} className="mb-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{proj.name}</h6>
                    <p className="mb-1 small">
                      {new Date(proj.startDate).toLocaleDateString('vi-VN')} - 
                      {proj.endDate ? new Date(proj.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
                    </p>
                    {proj.projectUrl && (
                      <a 
                        href={proj.projectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="small d-block mb-2"
                      >
                        Xem dự án
                      </a>
                    )}
                  </div>
                  <div>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => {
                        setEditMode('project');
                        setEditingItem(proj);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleProjectDelete(proj.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
                <p className="mb-2">{proj.description}</p>
                {proj.technologies?.length > 0 && (
                  <div className="mb-2">
                    <h6 className="small">Công nghệ sử dụng:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {proj.technologies.map((tech, idx) => (
                        <span key={idx} className="badge bg-secondary">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
                {proj.responsibilities?.length > 0 && (
                  <div className="mb-2">
                    <h6 className="small">Trách nhiệm:</h6>
                    <ul className="mb-0">
                      {proj.responsibilities.map((resp, idx) => (
                        <li key={idx}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {proj.achievements?.length > 0 && (
                  <div>
                    <h6 className="small">Thành tựu:</h6>
                    <ul className="mb-0">
                      {proj.achievements.map((achieve, idx) => (
                        <li key={idx}>{achieve}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted">Chưa có dự án nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsSection; 