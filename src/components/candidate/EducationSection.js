import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const educationSchema = Yup.object({
  school: Yup.string().required('Tên trường là bắt buộc'),
  degree: Yup.string().required('Bằng cấp là bắt buộc'),
  major: Yup.string().required('Chuyên ngành là bắt buộc'),
  startDate: Yup.date().required('Ngày bắt đầu là bắt buộc'),
  endDate: Yup.date().min(Yup.ref('startDate'), 'Ngày kết thúc phải sau ngày bắt đầu'),
  gpa: Yup.number().min(0, 'GPA phải lớn hơn 0').max(4, 'GPA không được vượt quá 4'),
  description: Yup.string(),
});

const EducationSection = ({ candidate, setCandidate }) => {
  const [editMode, setEditMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);



  




  const handleEducationSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      console.log('🔄 Submitting education data:', values);
      
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
      
      // Create new education item with unique ID
      const newEducation = {
        ...values,
        id: editingItem ? editingItem.id : Date.now().toString(),
        startDate: values.startDate,
        endDate: values.endDate || null
      };

      // Update educations array
      let updatedEducations;
      if (editingItem) {
        // Update existing education
        updatedEducations = (currentCandidateData.educations || []).map(edu => 
          edu.id === editingItem.id ? newEducation : edu
        );
      } else {
        // Add new education
        updatedEducations = [...(currentCandidateData.educations || []), newEducation];
      }

      console.log('📚 Updated educations:', updatedEducations);

      // Preserve ALL existing fields, only update educations
      const updatedCandidate = {
        ...currentCandidateData, // Keep all existing data
        educations: updatedEducations,
        updatedAt: new Date().toISOString()
      };

      console.log('📝 Sending updated candidate data');
      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, updatedCandidate);
      console.log('✅ Server response received');

      setCandidate(response.data);
      setEditMode(null);
      setEditingItem(null);
      resetForm();
      console.log('✅ Education saved successfully');
    } catch (error) {
      console.error('❌ Error updating educations:', error);
      alert('Có lỗi xảy ra khi lưu học vấn!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEducationDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa học vấn này?')) return;

    try {
      console.log('🗑️ Deleting education with id:', id);
      
      // SAFETY CHECK: Get current candidate data first
      let currentCandidateData = {};
      try {
        const currentResponse = await axios.get(`http://localhost:5000/candidates/${candidate.id}`);
        currentCandidateData = currentResponse.data;
      } catch (error) {
        console.warn('⚠️ Could not fetch current candidate data, using props:', error);
        currentCandidateData = candidate;
      }
      
      const updatedEducations = (currentCandidateData.educations || []).filter(edu => edu.id !== id);
      
      // Preserve ALL existing fields, only update educations
      const updatedCandidate = {
        ...currentCandidateData, // Keep all existing data
        educations: updatedEducations,
        updatedAt: new Date().toISOString()
      };

      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, updatedCandidate);
      setCandidate(response.data);
      console.log('✅ Education deleted successfully');
      alert('Học vấn đã được xóa thành công!');
    } catch (error) {
      console.error('❌ Error deleting education:', error);
      alert('Có lỗi xảy ra khi xóa học vấn!');
    }
  };

  const handleEdit = (education) => {
    setEditingItem(education);
    setEditMode('education');
  };

  const handleCancel = () => {
    setEditMode(null);
    setEditingItem(null);
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
          <i className="bi bi-plus me-1"></i> Thêm học vấn
        </button>
      </div>
      <div className="card-body">
        {editMode === 'education' && (
          <div className="border p-3 mb-4 rounded">
            <h6 className="mb-3">{editingItem ? 'Chỉnh sửa học vấn' : 'Thêm học vấn mới'}</h6>
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
              enableReinitialize
            >
              {({ isSubmitting, values }) => (
                <Form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Tên trường</label>
                      <Field type="text" name="school" className="form-control" placeholder="VD: Đại học Bách Khoa Hà Nội" />
                      <ErrorMessage name="school" component="div" className="text-danger" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Bằng cấp</label>
                      <Field as="select" name="degree" className="form-select">
                        <option value="">Chọn bằng cấp</option>
                        <option value="Trung học phổ thông">Trung học phổ thông</option>
                        <option value="Cao đẳng">Cao đẳng</option>
                        <option value="Cử nhân">Cử nhân</option>
                        <option value="Thạc sĩ">Thạc sĩ</option>
                        <option value="Tiến sĩ">Tiến sĩ</option>
                      </Field>
                      <ErrorMessage name="degree" component="div" className="text-danger" />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Chuyên ngành</label>
                      <Field type="text" name="major" className="form-control" placeholder="VD: Công nghệ thông tin" />
                      <ErrorMessage name="major" component="div" className="text-danger" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">GPA (tùy chọn)</label>
                      <Field type="number" name="gpa" className="form-control" min="0" max="4" step="0.01" placeholder="VD: 3.5" />
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
                      <label className="form-label">Ngày kết thúc (tùy chọn)</label>
                      <Field type="date" name="endDate" className="form-control" />
                      <ErrorMessage name="endDate" component="div" className="text-danger" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mô tả (tùy chọn)</label>
                    <Field as="textarea" name="description" className="form-control" rows="3" placeholder="Mô tả về quá trình học tập, hoạt động..." />
                    <ErrorMessage name="description" component="div" className="text-danger" />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Đang lưu...' : (editingItem ? 'Cập nhật' : 'Thêm học vấn')}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}

        <div className="education-list">
          {candidate?.educations?.length > 0 ? (
            candidate.educations.map((edu, index) => (
              <div key={edu.id || index} className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h6 className="mb-1 text-primary">{edu.school}</h6>
                    <p className="mb-1"><strong>{edu.degree}</strong> - {edu.major}</p>
                    <p className="mb-1 text-muted small">
                      {edu.startDate ? new Date(edu.startDate).toLocaleDateString('vi-VN') : 'N/A'} - 
                      {edu.endDate ? new Date(edu.endDate).toLocaleDateString('vi-VN') : 'Hiện tại'}
                    </p>
                    {edu.gpa && (
                      <p className="mb-1 small"><strong>GPA:</strong> {edu.gpa}</p>
                    )}
                    {edu.description && (
                      <p className="mb-0 small text-muted">{edu.description}</p>
                    )}
                  </div>
                  <div className="ms-3">
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(edu)}
                      title="Chỉnh sửa"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleEducationDelete(edu.id)}
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
              <i className="bi bi-mortarboard fs-1 d-block mb-2"></i>
              <p>Chưa có thông tin học vấn nào</p>
              <button 
                className="btn btn-outline-primary"
                onClick={() => {
                  setEditMode('education');
                  setEditingItem(null);
                }}
              >
                Thêm học vấn đầu tiên
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationSection; 
