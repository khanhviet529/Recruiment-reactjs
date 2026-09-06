import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import axios from 'axios';

const CandidateProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [editMode, setEditMode] = useState(null);

  // Load real data
  const handleShowProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/candidates/cc0d');
      setCandidate(response.data);
      setShowProfile(true);
      // message.success('Tải hồ sơ thành công!');
    } catch (error) {
      message.error('Lỗi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update API helper
  const updateCandidate = async (updatedData) => {
    try {
      setLoading(true);
      const response = await axios.put(`http://localhost:5000/candidates/${candidate.id}`, updatedData);
      setCandidate(response.data);
      return true;
    } catch (error) {
      message.error('Lỗi cập nhật: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Personal Info
  const updatePersonalInfo = async (updatedInfo) => {
    const updated = { ...candidate, ...updatedInfo };
    if (await updateCandidate(updated)) {
      setEditMode(null);
      message.success('Cập nhật thông tin thành công!');
    }
  };

  // Education CRUD
  const updateEducation = async (index, updatedEdu) => {
    const educations = [...(candidate.educations || [])];
    educations[index] = updatedEdu;
    const updated = { ...candidate, educations };
    if (await updateCandidate(updated)) {
      setEditMode(null);
      message.success('Cập nhật học vấn thành công!');
    }
  };

  const deleteEducation = async (index) => {
    if (window.confirm('Bạn có chắc muốn xóa học vấn này?')) {
      const educations = [...(candidate.educations || [])];
      educations.splice(index, 1);
      const updated = { ...candidate, educations };
      if (await updateCandidate(updated)) {
        message.success('Xóa học vấn thành công!');
      }
    }
  };

  // Experience CRUD
  const updateExperience = async (index, updatedExp) => {
    const workExperiences = [...(candidate.workExperiences || [])];
    workExperiences[index] = updatedExp;
    const updated = { ...candidate, workExperiences };
    if (await updateCandidate(updated)) {
      setEditMode(null);
      message.success('Cập nhật kinh nghiệm thành công!');
    }
  };

  const deleteExperience = async (index) => {
    if (window.confirm('Bạn có chắc muốn xóa kinh nghiệm này?')) {
      const workExperiences = [...(candidate.workExperiences || [])];
      workExperiences.splice(index, 1);
      const updated = { ...candidate, workExperiences };
      if (await updateCandidate(updated)) {
        message.success('Xóa kinh nghiệm thành công!');
      }
    }
  };

  // Certifications CRUD
  const updateCertification = async (index, updatedCert) => {
    const certifications = [...(candidate.certifications || [])];
    certifications[index] = updatedCert;
    const updated = { ...candidate, certifications };
    if (await updateCandidate(updated)) {
      setEditMode(null);
      message.success('Cập nhật chứng chỉ thành công!');
    }
  };

  const deleteCertification = async (index) => {
    if (window.confirm('Bạn có chắc muốn xóa chứng chỉ này?')) {
      const certifications = [...(candidate.certifications || [])];
      certifications.splice(index, 1);
      const updated = { ...candidate, certifications };
      if (await updateCandidate(updated)) {
        message.success('Xóa chứng chỉ thành công!');
      }
    }
  };

  if (loading) {
    return <div style={{textAlign: 'center', padding: '50px', background: '#f8fafc', minHeight: '100vh'}}>⏳ Đang xử lý...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px', border: '1px solid #e2e8f0'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 style={{color: '#334155', margin: 0}}>🏠 Hồ sơ ứng viên</h2>
          {!showProfile ? (
            <button onClick={handleShowProfile} style={{background: '#64748b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer'}}>
              📄 Tải hồ sơ
            </button>
          ) : (
            <button onClick={() => setShowProfile(false)} style={{background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer'}}>
              👁️ Ẩn hồ sơ
            </button>
          )}
        </div>
      </div>

      {showProfile && candidate && (
        <div>
          {/* Personal Info */}
          <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px', border: '1px solid #e2e8f0'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
              <h3 style={{color: '#334155', margin: 0}}>👤 Thông tin cá nhân</h3>
              <button onClick={() => setEditMode(editMode === 'personal' ? null : 'personal')} style={{background: '#64748b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>
                {editMode === 'personal' ? '💾 Lưu' : '✏️ Sửa'}
              </button>
            </div>
            
            {editMode === 'personal' ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                updatePersonalInfo({
                  firstName: formData.get('firstName'),
                  lastName: formData.get('lastName'),
                  email: formData.get('email'),
                  phone: formData.get('phone'),
                  address: formData.get('address'),
                  headline: formData.get('headline'),
                  summary: formData.get('summary')
                });
              }}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                  <input name='firstName' defaultValue={candidate.firstName} placeholder='Tên' style={{padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px'}} />
                  <input name='lastName' defaultValue={candidate.lastName} placeholder='Họ' style={{padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px'}} />
                  <input name='email' defaultValue={candidate.email} placeholder='Email' style={{padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px'}} />
                  <input name='phone' defaultValue={candidate.phone} placeholder='Điện thoại' style={{padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px'}} />
                </div>
                <input name='address' defaultValue={candidate.address} placeholder='Địa chỉ' style={{width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '15px'}} />
                <input name='headline' defaultValue={candidate.headline} placeholder='Tiêu đề' style={{width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '15px'}} />
                <textarea name='summary' defaultValue={candidate.summary} placeholder='Giới thiệu' style={{width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', minHeight: '80px', marginBottom: '15px'}} />
                <button type='submit' style={{background: '#64748b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', marginRight: '10px', cursor: 'pointer'}}>
                  💾 Lưu thông tin
                </button>
                <button type='button' onClick={() => setEditMode(null)} style={{background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer'}}>
                  ❌ Hủy
                </button>
              </form>
            ) : (
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div><strong>Tên:</strong> {candidate.firstName} {candidate.lastName}</div>
                <div><strong>Email:</strong> {candidate.email}</div>
                <div><strong>Điện thoại:</strong> {candidate.phone || 'Chưa cập nhật'}</div>
                <div><strong>Địa chỉ:</strong> {candidate.address || 'Chưa cập nhật'}</div>
                <div style={{gridColumn: '1 / -1'}}><strong>Tiêu đề:</strong> {candidate.headline || 'Chưa cập nhật'}</div>
                <div style={{gridColumn: '1 / -1'}}><strong>Giới thiệu:</strong> {candidate.summary || 'Chưa cập nhật'}</div>
              </div>
            )}
          </div>

          {/* Education */}
          <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px', border: '1px solid #e2e8f0'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
              <h3 style={{color: '#334155', margin: 0}}>🎓 Học vấn ({(candidate.educations || []).length})</h3>
              <button onClick={() => setEditMode(editMode === 'new-education' ? null : 'new-education')} style={{background: '#64748b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>
                {editMode === 'new-education' ? '❌ Hủy' : '+ Thêm mới'}
              </button>
            </div>
            
            {/* New Education Form */}
            {editMode === 'new-education' && (
              <div style={{background: '#f8fafc', padding: '15px', borderRadius: '6px', marginBottom: '15px', border: '2px dashed #e2e8f0'}}>
                <h4 style={{color: '#334155', marginBottom: '10px'}}>➕ Thêm học vấn mới</h4>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const newEdu = {
                    school: formData.get('school'),
                    degree: formData.get('degree'),
                    major: formData.get('major'),
                    startDate: formData.get('startDate'),
                    endDate: formData.get('endDate'),
                    id: Date.now().toString()
                  };
                  const updated = { ...candidate, educations: [...(candidate.educations || []), newEdu] };
                  updateCandidate(updated).then(success => {
                    if (success) {
                      setEditMode(null);
                      message.success('Thêm học vấn thành công!');
                    }
                  });
                }}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                    <input name='school' placeholder='Tên trường *' required style={{padding: '8px', border: '1px solid #64748b', borderRadius: '4px'}} />
                    <input name='degree' placeholder='Bằng cấp *' required style={{padding: '8px', border: '1px solid #64748b', borderRadius: '4px'}} />
                    <input name='major' placeholder='Chuyên ngành *' required style={{padding: '8px', border: '1px solid #64748b', borderRadius: '4px'}} />
                    <div style={{display: 'flex', gap: '5px'}}>
                      <input name='startDate' type='date' required style={{padding: '8px', border: '1px solid #64748b', borderRadius: '4px', flex: 1}} />
                      <input name='endDate' type='date' style={{padding: '8px', border: '1px solid #64748b', borderRadius: '4px', flex: 1}} />
                    </div>
                  </div>
                  <button type='submit' style={{background: '#64748b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', marginRight: '10px', cursor: 'pointer'}}>
                    💾 Lưu học vấn
                  </button>
                  <button type='button' onClick={() => setEditMode(null)} style={{background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer'}}>
                    ❌ Hủy
                  </button>
                </form>
              </div>
            )}

            {(candidate.educations || []).map((edu, index) => (
              <div key={edu.id || index} style={{background: '#f8fafc', padding: '15px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #e2e8f0'}}>
                {editMode === `education-${index}` ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    updateEducation(index, {
                      ...edu,
                      school: formData.get('school'),
                      degree: formData.get('degree'),
                      major: formData.get('major'),
                      startDate: formData.get('startDate'),
                      endDate: formData.get('endDate')
                    });
                  }}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                      <input name='school' defaultValue={edu.school} placeholder='Trường' style={{padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px'}} />
                      <input name='degree' defaultValue={edu.degree} placeholder='Bằng cấp' style={{padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px'}} />
                      <input name='major' defaultValue={edu.major} placeholder='Chuyên ngành' style={{padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px'}} />
                      <div style={{display: 'flex', gap: '5px'}}>
                        <input name='startDate' type='date' defaultValue={edu.startDate} style={{padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px', flex: 1}} />
                        <input name='endDate' type='date' defaultValue={edu.endDate} style={{padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px', flex: 1}} />
                      </div>
                    </div>
                    <button type='submit' style={{background: '#64748b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer'}}>
                      💾 Lưu
                    </button>
                    <button type='button' onClick={() => setEditMode(null)} style={{background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>
                      ❌ Hủy
                    </button>
                  </form>
                ) : (
                  <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                      <div>
                        <div><strong>{edu.school}</strong></div>
                        <div>{edu.degree} - {edu.major}</div>
                        <div style={{fontSize: '12px', color: '#64748b'}}>{edu.startDate} - {edu.endDate || 'Hiện tại'}</div>
                      </div>
                      <div>
                        <button onClick={() => setEditMode(`education-${index}`)} style={{background: '#64748b', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', marginRight: '5px', fontSize: '12px', cursor: 'pointer'}}>
                          ✏️ Sửa
                        </button>
                        <button onClick={() => deleteEducation(index)} style={{background: '#e11d48', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer'}}>
                          🗑️ Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Work Experience */}
          <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px', border: '1px solid #e2e8f0'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
              <h3 style={{color: '#334155', margin: 0}}>💼 Kinh nghiệm ({(candidate.workExperiences || []).length})</h3>
              <button onClick={() => setEditMode(editMode === 'new-experience' ? null : 'new-experience')} style={{background: '#64748b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>
                {editMode === 'new-experience' ? '❌ Hủy' : '+ Thêm mới'}
              </button>
            </div>
            
            {/* New Experience Form */}
            {editMode === 'new-experience' && (
              <div style={{background: '#f8fafc', padding: '15px', borderRadius: '6px', marginBottom: '15px', border: '2px dashed #e2e8f0'}}>
                <h4 style={{color: '#334155', marginBottom: '10px'}}>💼 Thêm kinh nghiệm mới</h4>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const newExp = {
                    company: formData.get('company'),
                    position: formData.get('position'),
                    startDate: formData.get('startDate'),
                    endDate: formData.get('endDate'),
                    description: formData.get('description'),
                    id: Date.now().toString()
                  };
                  const updated = { ...candidate, workExperiences: [...(candidate.workExperiences || []), newExp] };
                  updateCandidate(updated).then(success => {
                    if (success) {
                      setEditMode(null);
                      message.success('Thêm kinh nghiệm thành công!');
                    }
                  });
                }}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                    <input name='company' placeholder='Tên công ty *' required style={{padding: '8px', border: '1px solid #64748b', borderRadius: '4px'}} />
                    <input name='position' placeholder='Vị trí công việc *' required style={{padding: '8px', border: '1px solid #64748b', borderRadius: '4px'}} />
                    <input name='startDate' type='date' required style={{padding: '8px', border: '1px solid #64748b', borderRadius: '4px'}} />
                    <input name='endDate' type='date' style={{padding: '8px', border: '1px solid #64748b', borderRadius: '4px'}} />
                  </div>
                  <textarea name='description' placeholder='Mô tả công việc và thành tích...' style={{width: '100%', padding: '8px', border: '1px solid #64748b', borderRadius: '4px', minHeight: '60px', marginBottom: '10px'}} />
                  <button type='submit' style={{background: '#64748b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', marginRight: '10px', cursor: 'pointer'}}>
                    💾 Lưu kinh nghiệm
                  </button>
                  <button type='button' onClick={() => setEditMode(null)} style={{background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer'}}>
                    ❌ Hủy
                  </button>
                </form>
              </div>
            )}

            {(candidate.workExperiences || []).map((exp, index) => (
              <div key={exp.id || index} style={{background: '#f8fafc', padding: '15px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #e2e8f0'}}>
                {editMode === `experience-${index}` ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    updateExperience(index, {
                      ...exp,
                      company: formData.get('company'),
                      position: formData.get('position'),
                      startDate: formData.get('startDate'),
                      endDate: formData.get('endDate'),
                      description: formData.get('description')
                    });
                  }}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                      <input name='company' defaultValue={exp.company} placeholder='Công ty' style={{padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px'}} />
                      <input name='position' defaultValue={exp.position} placeholder='Vị trí' style={{padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px'}} />
                      <input name='startDate' type='date' defaultValue={exp.startDate} style={{padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px'}} />
                      <input name='endDate' type='date' defaultValue={exp.endDate} style={{padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px'}} />
                    </div>
                    <textarea name='description' defaultValue={exp.description} placeholder='Mô tả công việc' style={{width: '100%', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px', minHeight: '60px', marginBottom: '10px'}} />
                    <button type='submit' style={{background: '#64748b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer'}}>
                      💾 Lưu
                    </button>
                    <button type='button' onClick={() => setEditMode(null)} style={{background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>
                      ❌ Hủy
                    </button>
                  </form>
                ) : (
                  <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                      <div>
                        <div><strong>{exp.company}</strong></div>
                        <div>{exp.position}</div>
                        <div style={{fontSize: '12px', color: '#64748b'}}>{exp.startDate} - {exp.endDate || 'Hiện tại'}</div>
                        {exp.description && <div style={{marginTop: '5px', fontSize: '14px'}}>{exp.description}</div>}
                      </div>
                      <div>
                        <button onClick={() => setEditMode(`experience-${index}`)} style={{background: '#64748b', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', marginRight: '5px', fontSize: '12px', cursor: 'pointer'}}>
                          ✏️ Sửa
                        </button>
                        <button onClick={() => deleteExperience(index)} style={{background: '#e11d48', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer'}}>
                          🗑️ Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div style={{background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px', border: '1px solid #e2e8f0'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
              <h3 style={{color: '#334155', margin: 0}}>🏆 Chứng chỉ ({(candidate.certifications || []).length})</h3>
              <button onClick={() => setEditMode(editMode === 'new-certification' ? null : 'new-certification')} style={{background: '#64748b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>
                {editMode === 'new-certification' ? '❌ Hủy' : '+ Thêm mới'}
              </button>
            </div>
            
            {/* New Certification Form */}
            {editMode === 'new-certification' && (
              <div style={{background: '#f8fafc', padding: '15px', borderRadius: '6px', marginBottom: '15px', border: '2px dashed #e2e8f0'}}>
                <h4 style={{color: '#334155', marginBottom: '10px'}}>🏆 Thêm chứng chỉ mới</h4>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const newCert = {
                    name: formData.get('name'),
                    organization: formData.get('organization'),
                    issueDate: formData.get('issueDate'),
                    expiryDate: formData.get('expiryDate'),
                    id: Date.now().toString()
                  };
                  const updated = { ...candidate, certifications: [...(candidate.certifications || []), newCert] };
                  updateCandidate(updated).then(success => {
                    if (success) {
                      setEditMode(null);
                      message.success('Thêm chứng chỉ thành công!');
                    }
                  });
                }}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                    <input name='name' placeholder='Tên chứng chỉ *' required style={{padding: '8px', border: '1px solid #64748b', borderRadius: '4px'}} />
                    <input name='organization' placeholder='Tổ chức cấp *' required style={{padding: '8px', border: '1px solid #64748b', borderRadius: '4px'}} />
                    <input name='issueDate' type='date' required style={{padding: '8px', border: '1px solid #64748b', borderRadius: '4px'}} />
                    <input name='expiryDate' type='date' style={{padding: '8px', border: '1px solid #64748b', borderRadius: '4px'}} placeholder='Ngày hết hạn (tùy chọn)' />
                  </div>
                  <button type='submit' style={{background: '#64748b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', marginRight: '10px', cursor: 'pointer'}}>
                    💾 Lưu chứng chỉ
                  </button>
                  <button type='button' onClick={() => setEditMode(null)} style={{background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer'}}>
                    ❌ Hủy
                  </button>
                </form>
              </div>
            )}

            {(candidate.certifications || []).map((cert, index) => (
              <div key={cert.id || index} style={{background: '#f8fafc', padding: '15px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #e2e8f0'}}>
                {editMode === `certification-${index}` ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    updateCertification(index, {
                      ...cert,
                      name: formData.get('name'),
                      organization: formData.get('organization'),
                      issueDate: formData.get('issueDate'),
                      expiryDate: formData.get('expiryDate')
                    });
                  }}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                      <input name='name' defaultValue={cert.name} placeholder='Tên chứng chỉ' style={{padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px'}} />
                      <input name='organization' defaultValue={cert.organization} placeholder='Tổ chức cấp' style={{padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px'}} />
                      <input name='issueDate' type='date' defaultValue={cert.issueDate} style={{padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px'}} />
                      <input name='expiryDate' type='date' defaultValue={cert.expiryDate} placeholder='Ngày hết hạn (tùy chọn)' style={{padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px'}} />
                    </div>
                    <button type='submit' style={{background: '#64748b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer'}}>
                      💾 Lưu
                    </button>
                    <button type='button' onClick={() => setEditMode(null)} style={{background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>
                      ❌ Hủy
                    </button>
                  </form>
                ) : (
                  <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                      <div>
                        <div><strong>{cert.name}</strong></div>
                        <div>{cert.organization}</div>
                        <div style={{fontSize: '12px', color: '#64748b'}}>
                          Cấp: {cert.issueDate} {cert.expiryDate && `- Hết hạn: ${cert.expiryDate}`}
                        </div>
                      </div>
                      <div>
                        <button onClick={() => setEditMode(`certification-${index}`)} style={{background: '#64748b', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', marginRight: '5px', fontSize: '12px', cursor: 'pointer'}}>
                          ✏️ Sửa
                        </button>
                        <button onClick={() => deleteCertification(index)} style={{background: '#e11d48', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer'}}>
                          🗑️ Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          
        </div>
      )}
    </div>
  );
};

export default CandidateProfilePage;
