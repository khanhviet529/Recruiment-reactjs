import React from 'react';
import { Card, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import './CVTemplate1.scss';

const CVTemplate1 = ({ candidate, activeSections = [] }) => {
  const handleDownload = () => {
    // Thêm class để ẩn các phần không cần thiết khi in
    document.body.classList.add('printing');
    
    // Đảm bảo CV hiển thị đầy đủ khi in
    const cvElement = document.querySelector('.cv-template-1');
    if (cvElement) {
      cvElement.style.overflow = 'visible';
      cvElement.style.height = 'auto';
      cvElement.style.display = 'block';
      cvElement.style.pageBreakInside = 'avoid';
    }
    
    // Xử lý từng section để đảm bảo hiển thị đúng
    const sections = document.querySelectorAll('.cv-section');
    const items = document.querySelectorAll('.experience-item, .education-item, .project-item, .certification-item');
    
    sections.forEach(section => {
      section.style.overflow = 'visible';
      section.style.height = 'auto';
      section.style.maxHeight = 'none';
      section.style.pageBreakInside = 'avoid';
      section.style.breakInside = 'avoid';
      section.style.display = 'block';
    });
    
    items.forEach(item => {
      item.style.pageBreakInside = 'avoid';
      item.style.breakInside = 'avoid';
    });
    
    // In CV
    setTimeout(() => {
      window.print();
      
      // Khôi phục style sau khi in
      setTimeout(() => {
        document.body.classList.remove('printing');
        
        // Khôi phục CV
        if (cvElement) {
          cvElement.style.overflow = '';
          cvElement.style.height = '';
          cvElement.style.display = '';
          cvElement.style.pageBreakInside = '';
        }
        
        // Khôi phục sections
        sections.forEach(section => {
          section.style.overflow = '';
          section.style.height = '';
          section.style.maxHeight = '';
          section.style.pageBreakInside = '';
          section.style.breakInside = '';
          section.style.display = '';
        });
        
        // Khôi phục items
        items.forEach(item => {
          item.style.pageBreakInside = '';
          item.style.breakInside = '';
        });
      }, 500);
    }, 100);
  };

  // Helper function to check if section is active
  const isSectionActive = (sectionKey) => {
    return activeSections.some(section => section.key === sectionKey);
  };

  // Get the title for a section
  const getSectionTitle = (sectionKey) => {
    const section = activeSections.find(section => section.key === sectionKey);
    return section ? section.title : '';
  };

  // Helper to safely check if array exists and has items
  const hasArrayItems = (arr) => {
    return Array.isArray(arr) && arr.length > 0;
  };

  // Safe rendering for candidate information
  const safeCandidate = candidate || {};

  return (
    <div className="cv-template-1">
      <Card className="cv-card">
        {/* Header with personal info - always shown but can be empty */}
        <div className="cv-header">
          <div className="cv-avatar">
            {safeCandidate.avatar ? (
              <img src={safeCandidate.avatar} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {safeCandidate.firstName?.charAt(0) || ''}{safeCandidate.lastName?.charAt(0) || ''}
              </div>
            )}
          </div>
          <div className="cv-title">
            <h1>{safeCandidate.firstName || ''} {safeCandidate.lastName || ''}</h1>
            <p className="position">{safeCandidate.headline || ''}</p>
          </div>
        </div>

        {/* Contact Information - part of personal info */}
        {isSectionActive('personalInfo') && (
          <div className="cv-section">
            <h2>{getSectionTitle('personalInfo')}</h2>
            <div className="contact-info">
              {safeCandidate.email && <p><strong>Email:</strong> {safeCandidate.email}</p>}
              {safeCandidate.phone && <p><strong>Điện thoại:</strong> {safeCandidate.phone}</p>}
              {(safeCandidate.address || safeCandidate.city || safeCandidate.country) && (
                <p>
                  <strong>Địa chỉ:</strong> {' '}
                  {[
                    safeCandidate.address,
                    safeCandidate.city,
                    safeCandidate.country
                  ].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Summary Section */}
        {isSectionActive('summary') && safeCandidate.summary && (
          <div className="cv-section">
            <h2>{getSectionTitle('summary')}</h2>
            <p className="summary">{safeCandidate.summary}</p>
          </div>
        )}

        {/* Work Experience Section */}
        {isSectionActive('workExperience') && hasArrayItems(safeCandidate.workExperience) && (
          <div className="cv-section">
            <h2>{getSectionTitle('workExperience')}</h2>
            {safeCandidate.workExperience.map((exp, index) => (
              <div key={index} className="experience-item">
                <h3>{exp.position || 'Chức vụ'}</h3>
                <p className="company">{exp.company || 'Công ty'}</p>
                <p className="duration">
                  {exp.startDate || 'Ngày bắt đầu'} - {exp.endDate || 'Hiện tại'}
                </p>
                <p className="description">{exp.description || ''}</p>
              </div>
            ))}
          </div>
        )}

        {/* Education Section */}
        {isSectionActive('education') && hasArrayItems(safeCandidate.education) && (
          <div className="cv-section">
            <h2>{getSectionTitle('education')}</h2>
            {safeCandidate.education.map((edu, index) => (
              <div key={index} className="education-item">
                <h3>{edu.degree || 'Bằng cấp'}</h3>
                <p className="school">{edu.school || 'Trường'}</p>
                <p className="duration">
                  {edu.startDate || 'Ngày bắt đầu'} - {edu.endDate || 'Hiện tại'}
                </p>
                {edu.description && <p className="description">{edu.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Skills Section */}
        {isSectionActive('skills') && hasArrayItems(safeCandidate.skills) && (
          <div className="cv-section">
            <h2>{getSectionTitle('skills')}</h2>
            <div className="skills">
              {safeCandidate.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {isSectionActive('projects') && hasArrayItems(safeCandidate.projects) && (
          <div className="cv-section">
            <h2>{getSectionTitle('projects')}</h2>
            {safeCandidate.projects.map((project, index) => (
              <div key={index} className="project-item">
                <h3>{project.name || 'Dự án'}</h3>
                <p className="duration">
                  {project.startDate || 'Ngày bắt đầu'} - {project.endDate || 'Hiện tại'}
                </p>
                <p className="description">{project.description || ''}</p>
                {hasArrayItems(project.technologies) && (
                  <div className="technologies">
                    {project.technologies.map((tech, idx) => (
                      <span key={idx} className="skill-tag">{tech}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications Section */}
        {isSectionActive('certifications') && hasArrayItems(safeCandidate.certifications) && (
          <div className="cv-section">
            <h2>{getSectionTitle('certifications')}</h2>
            {safeCandidate.certifications.map((cert, index) => (
              <div key={index} className="certification-item">
                <h3>{cert.name || 'Chứng chỉ'}</h3>
                <p className="issuer">{cert.issuer || 'Tổ chức cấp'}</p>
                <p className="date">{cert.date || ''}</p>
                {cert.description && <p className="description">{cert.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Languages Section */}
        {isSectionActive('languages') && hasArrayItems(safeCandidate.languages) && (
          <div className="cv-section">
            <h2>{getSectionTitle('languages')}</h2>
            <div className="languages">
              {safeCandidate.languages.map((lang, index) => (
                <div key={index} className="language-item">
                  <span className="language">{lang.name || 'Ngôn ngữ'}</span>
                  <span className="proficiency"> - {lang.proficiency || 'Trình độ'}</span>
                  {lang.description && <p className="description">{lang.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests Section */}
        {isSectionActive('interests') && hasArrayItems(safeCandidate.interests) && (
          <div className="cv-section">
            <h2>{getSectionTitle('interests')}</h2>
            <div className="interests">
              {safeCandidate.interests.map((interest, index) => (
                <span key={index} className="interest-tag">{interest}</span>
              ))}
            </div>
          </div>
        )}

        {/* References Section */}
        {isSectionActive('references') && hasArrayItems(safeCandidate.references) && (
          <div className="cv-section">
            <h2>{getSectionTitle('references')}</h2>
            {safeCandidate.references.map((ref, index) => (
              <div key={index} className="reference-item">
                <h3>{ref.name || 'Người tham chiếu'}</h3>
                <p className="position">{ref.position || 'Vị trí'} {ref.company ? `tại ${ref.company}` : ''}</p>
                <p className="contact">
                  {ref.email && <span>Email: {ref.email}</span>}
                  {ref.phone && <span> | Phone: {ref.phone}</span>}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="cv-actions print-hide">
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
            Tải xuống CV
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CVTemplate1; 