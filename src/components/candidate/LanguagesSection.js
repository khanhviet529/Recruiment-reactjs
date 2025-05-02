import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const languageSchema = Yup.object({
  language: Yup.string().required('Ngôn ngữ là bắt buộc'),
  proficiency: Yup.string().required('Trình độ là bắt buộc'),
  certificate: Yup.string(),
  score: Yup.number().min(0).max(990),
});

const LanguagesSection = ({ candidate, setCandidate }) => {
  const [editMode, setEditMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const handleLanguageSubmit = async (values) => {
    try {
      const updatedLanguages = editingItem
        ? candidate.languages.map(lang => lang.id === editingItem.id ? values : lang)
        : [...(candidate.languages || []), { ...values, id: Date.now().toString() }];

      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        languages: updatedLanguages,
      });

      setCandidate(response.data);
      setEditMode(null);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating languages:', error);
    }
  };

  const handleLanguageDelete = async (id) => {
    try {
      const updatedLanguages = candidate.languages.filter(lang => lang.id !== id);
      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, {
        ...candidate,
        languages: updatedLanguages,
      });
      setCandidate(response.data);
    } catch (error) {
      console.error('Error deleting language:', error);
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Ngôn ngữ</h5>
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => {
            setEditMode('language');
            setEditingItem(null);
          }}
        >
          <i className="bi bi-plus me-1"></i> Thêm mới
        </button>
      </div>
      <div className="card-body">
        {editMode === 'language' && (
          <Formik
            initialValues={editingItem || {
              language: '',
              proficiency: '',
              certificate: '',
              score: ''
            }}
            validationSchema={languageSchema}
            onSubmit={handleLanguageSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="mb-4">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Ngôn ngữ</label>
                    <Field type="text" name="language" className="form-control" />
                    <ErrorMessage name="language" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Trình độ</label>
                    <Field as="select" name="proficiency" className="form-select">
                      <option value="">Chọn trình độ</option>
                      <option value="beginner">Sơ cấp</option>
                      <option value="intermediate">Trung cấp</option>
                      <option value="advanced">Cao cấp</option>
                      <option value="native">Bản ngữ</option>
                    </Field>
                    <ErrorMessage name="proficiency" component="div" className="text-danger" />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Chứng chỉ</label>
                    <Field type="text" name="certificate" className="form-control" />
                    <ErrorMessage name="certificate" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Điểm số</label>
                    <Field type="number" name="score" className="form-control" min="0" max="990" />
                    <ErrorMessage name="score" component="div" className="text-danger" />
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
        <div className="languages-list">
          {candidate?.languages?.length > 0 ? (
            candidate.languages.map((lang, index) => (
              <div key={index} className="mb-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{lang.language}</h6>
                    <p className="mb-1 text-muted">
                      Trình độ: {
                        lang.proficiency === 'beginner' ? 'Sơ cấp' :
                        lang.proficiency === 'intermediate' ? 'Trung cấp' :
                        lang.proficiency === 'advanced' ? 'Cao cấp' :
                        'Bản ngữ'
                      }
                    </p>
                    {lang.certificate && (
                      <p className="mb-1 small">Chứng chỉ: {lang.certificate}</p>
                    )}
                    {lang.score && (
                      <p className="mb-0 small">Điểm số: {lang.score}</p>
                    )}
                  </div>
                  <div>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => {
                        setEditMode('language');
                        setEditingItem(lang);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleLanguageDelete(lang.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">Chưa có ngôn ngữ nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LanguagesSection; 