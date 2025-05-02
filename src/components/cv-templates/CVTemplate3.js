import React from 'react';
import { Card, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import './CVTemplate3.scss';

const CVTemplate3 = ({ candidate, activeSections = [] }) => {
  const handleDownload = () => {
    // Thêm class để ẩn các phần không cần thiết khi in
    document.body.classList.add('printing');
    
    // Đảm bảo CV hiển thị đầy đủ khi in
    const cvElement = document.querySelector('.cv-template-3');
    if (cvElement) {
      cvElement.style.overflow = 'visible';
      cvElement.style.height = 'auto';
      cvElement.style.display = 'block';
      cvElement.style.pageBreakInside = 'avoid';
    }
    
    // Xử lý từng section để đảm bảo hiển thị đúng
    const sections = document.querySelectorAll('.cv-section, .cv-header, .cv-body, .cv-columns, .cv-column');
    const items = document.querySelectorAll('.experience-item, .education-item, .project-item, .certification-item, .language-item');
    
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
    <div className="cv-template-3">
      <Card className="cv-card">
        {/* Header Section */}
        <div className="cv-header">
          <div className="cv-header-content">
            <h1 className="cv-name">{safeCandidate.firstName || ''} {safeCandidate.lastName || ''}</h1>
            <p className="cv-headline">{safeCandidate.headline || ''}</p>
            
            <div className="cv-contact">
              {safeCandidate.email && (
                <span className="contact-item">
                  <i className="bi bi-envelope"></i> {safeCandidate.email}
                </span>
              )}
              {safeCandidate.phone && (
                <span className="contact-item">
                  <i className="bi bi-telephone"></i> {safeCandidate.phone}
                </span>
              )}
              {(safeCandidate.address || safeCandidate.city || safeCandidate.country) && (
                <span className="contact-item">
                  <i className="bi bi-geo-alt"></i> 
                  {[
                    safeCandidate.address,
                    safeCandidate.city,
                    safeCandidate.country
                  ].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="cv-body">
          {/* Summary Section */}
          {isSectionActive('summary') && safeCandidate.summary && (
            <div className="cv-section summary-section">
              <h2 className="section-title">{getSectionTitle('summary')}</h2>
              <div className="section-content">
                <p>{safeCandidate.summary}</p>
              </div>
            </div>
          )}

          {/* Work Experience Section */}
          {isSectionActive('workExperience') && hasArrayItems(safeCandidate.workExperience) && (
            <div className="cv-section experience-section">
              <h2 className="section-title">{getSectionTitle('workExperience')}</h2>
              <div className="section-content">
                {safeCandidate.workExperience.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <div className="item-header">
                      <h3 className="item-title">{exp.position || 'Chức vụ'}</h3>
                      <p className="item-subtitle">{exp.company || 'Công ty'}</p>
                      <p className="item-date">
                        {exp.startDate || 'Ngày bắt đầu'} - {exp.endDate || 'Hiện tại'}
                      </p>
                    </div>
                    <p className="item-description">{exp.description || ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {isSectionActive('education') && hasArrayItems(safeCandidate.education) && (
            <div className="cv-section education-section">
              <h2 className="section-title">{getSectionTitle('education')}</h2>
              <div className="section-content">
                {safeCandidate.education.map((edu, index) => (
                  <div key={index} className="education-item">
                    <div className="item-header">
                      <h3 className="item-title">{edu.degree || 'Bằng cấp'}</h3>
                      <p className="item-subtitle">{edu.school || 'Trường'}</p>
                      <p className="item-date">
                        {edu.startDate || 'Ngày bắt đầu'} - {edu.endDate || 'Hiện tại'}
                      </p>
                    </div>
                    {edu.description && <p className="item-description">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {isSectionActive('skills') && hasArrayItems(safeCandidate.skills) && (
            <div className="cv-section skills-section">
              <h2 className="section-title">{getSectionTitle('skills')}</h2>
              <div className="section-content">
                <div className="skills-container">
                  {safeCandidate.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Projects Section */}
          {isSectionActive('projects') && hasArrayItems(safeCandidate.projects) && (
            <div className="cv-section projects-section">
              <h2 className="section-title">{getSectionTitle('projects')}</h2>
              <div className="section-content">
                {safeCandidate.projects.map((project, index) => (
                  <div key={index} className="project-item">
                    <div className="item-header">
                      <h3 className="item-title">{project.name || 'Dự án'}</h3>
                      <p className="item-date">
                        {project.startDate || 'Ngày bắt đầu'} - {project.endDate || 'Hiện tại'}
                      </p>
                    </div>
                    <p className="item-description">{project.description || ''}</p>
                    {hasArrayItems(project.technologies) && (
                      <div className="project-technologies">
                        <p><strong>Công nghệ:</strong></p>
                        <div className="tech-container">
                          {project.technologies.map((tech, idx) => (
                            <span key={idx} className="tech-tag">{tech}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="cv-columns">
            <div className="cv-column">
              {/* Certifications Section */}
              {isSectionActive('certifications') && hasArrayItems(safeCandidate.certifications) && (
                <div className="cv-section certifications-section">
                  <h2 className="section-title">{getSectionTitle('certifications')}</h2>
                  <div className="section-content">
                    {safeCandidate.certifications.map((cert, index) => (
                      <div key={index} className="certification-item">
                        <h3 className="item-title">{cert.name || 'Chứng chỉ'}</h3>
                        <p className="item-subtitle">{cert.issuer || 'Tổ chức cấp'}</p>
                        {cert.date && <p className="item-date">{cert.date}</p>}
                        {cert.description && <p className="item-description">{cert.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages Section */}
              {isSectionActive('languages') && hasArrayItems(safeCandidate.languages) && (
                <div className="cv-section languages-section">
                  <h2 className="section-title">{getSectionTitle('languages')}</h2>
                  <div className="section-content">
                    {safeCandidate.languages.map((lang, index) => (
                      <div key={index} className="language-item">
                        <span className="language-name">{lang.name || 'Ngôn ngữ'}</span>
                        <span className="language-level">{lang.proficiency || 'Trình độ'}</span>
                        {lang.description && <p className="language-description">{lang.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="cv-column">
              {/* Interests Section */}
              {isSectionActive('interests') && hasArrayItems(safeCandidate.interests) && (
                <div className="cv-section interests-section">
                  <h2 className="section-title">{getSectionTitle('interests')}</h2>
                  <div className="section-content">
                    <div className="interests-container">
                      {safeCandidate.interests.map((interest, index) => (
                        <span key={index} className="interest-tag">{interest}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* References Section */}
              {isSectionActive('references') && hasArrayItems(safeCandidate.references) && (
                <div className="cv-section references-section">
                  <h2 className="section-title">{getSectionTitle('references')}</h2>
                  <div className="section-content">
                    {safeCandidate.references.map((ref, index) => (
                      <div key={index} className="reference-item">
                        <h3 className="item-title">{ref.name || 'Người tham chiếu'}</h3>
                        <p className="item-subtitle">{ref.position || 'Vị trí'} {ref.company ? `tại ${ref.company}` : ''}</p>
                        {ref.email && <p className="reference-email">{ref.email}</p>}
                        {ref.phone && <p className="reference-phone">{ref.phone}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="cv-actions print-hide">
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
            Tải xuống CV
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CVTemplate3; 