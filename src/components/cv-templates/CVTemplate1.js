

import React, { useRef } from 'react';
import { Card, Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import './CVTemplate1.scss';

const CVTemplate1 = ({ candidate, activeSections = [] }) => {
  const cvRef = useRef(null);

  const handlePrint = () => {
    // Tạo cửa sổ mới để in
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Vui lòng cho phép cửa sổ pop-up để in CV.');
      return;
    }
    
    // Tạo nội dung HTML cho cửa sổ in
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CV - ${safeCandidate.firstName || ''} ${safeCandidate.lastName || ''}</title>
        <meta charset="utf-8">
        <style>
          @page {
            size: A4;
            margin: 20mm 15mm; /* Top/Bottom Left/Right */
          }
          
          html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            font-family: 'Roboto', Arial, sans-serif;
            color: #333;
            line-height: 1.5;
            background-color: white;
          }
          
          * {
            box-sizing: border-box;
          }
          
          /* Phần header trên tất cả các trang */
          .page-header {
            position: running(header);
            text-align: right;
            font-size: 10px;
            color: #777;
            padding-bottom: 5mm;
          }
          
          .page-header .slogan {
            font-style: italic;
            color: #555;
          }
          
          /* Phần footer trên tất cả các trang */
          .page-footer {
            position: running(footer);
            text-align: center;
            font-size: 10px;
            color: #777;
            padding-top: 5mm;
          }
          
          @page {
            @top-right { content: element(header) }
            @bottom-center { content: element(footer) }
          }
          
          .page {
            page-break-after: always;
            padding-top: 0;
            padding-bottom: 10mm;
          }
          
          .page:last-child {
            page-break-after: auto;
          }
          
          .cv-container {
            max-width: 100%;
            margin: 0 auto;
          }
          
          .cv-header {
            display: flex;
            align-items: center;
            margin-bottom: 15mm;
          }
          
          .cv-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin-right: 15px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #3498db;
            color: white;
            font-size: 28px;
            font-weight: bold;
            flex-shrink: 0;
          }
          
          .cv-title {
            flex-grow: 1;
          }
          
          .cv-title h1 {
            margin: 0 0 3px 0;
            font-size: 22px;
            font-weight: 700;
            color: #2c3e50;
          }
          
          .position {
            margin: 0;
            font-size: 16px;
            color: #555;
          }
          
          .cv-section {
            margin-bottom: 12mm;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          h2 {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 8mm 0;
            color: #2c3e50;
            border-bottom: 1.5px solid #eaeaea;
            padding-bottom: 6px;
            break-after: avoid;
            page-break-after: avoid;
          }
          
          h3 {
            margin: 0 0 3px 0;
            font-size: 16px;
            font-weight: 600;
            color: #3498db;
            break-after: avoid;
            page-break-after: avoid;
          }
          
          p {
            margin: 3px 0;
          }
          
          .contact-info p {
            margin: 4px 0;
          }
          
          .experience-item, 
          .education-item, 
          .project-item, 
          .certification-item,
          .language-item,
          .reference-item {
            margin-bottom: 8mm;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .company, .school, .issuer {
            font-weight: 600;
            color: #444;
          }
          
          .duration, .date {
            color: #666;
            font-style: italic;
            font-size: 13px;
          }
          
          .description {
            margin-top: 5px;
            line-height: 1.5;
          }
          
          .skills, .interests, .technologies {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 5px;
          }
          
          .skill-tag, .interest-tag {
            background-color: #f0f0f0;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 13px;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <!-- Header cho tất cả các trang -->
        <div class="page-header">
          <div class="slogan">NVK - Năng lực, Vững vàng, Kiến tạo tương lai</div>
          CV - ${safeCandidate.firstName || ''} ${safeCandidate.lastName || ''}
        </div>
        
        <!-- Footer cho tất cả các trang -->
        <div class="page-footer">
          Trang <span class="pageNumber"></span>
        </div>
        
        <div class="cv-container">
          <!-- TRANG 1 -->
          <div class="page">
            <!-- Header with personal info -->
            <div class="cv-header">
              <div class="cv-avatar">
                ${safeCandidate.firstName?.charAt(0) || ''}${safeCandidate.lastName?.charAt(0) || ''}
              </div>
              <div class="cv-title">
                <h1>${safeCandidate.firstName || ''} ${safeCandidate.lastName || ''}</h1>
                <p class="position">${safeCandidate.headline || ''}</p>
              </div>
            </div>

            <!-- Contact Information -->
            ${isSectionActive('personalInfo') ? `
            <div class="cv-section">
              <h2>${getSectionTitle('personalInfo')}</h2>
              <div class="contact-info">
                ${safeCandidate.email ? `<p><strong>Email:</strong> ${safeCandidate.email}</p>` : ''}
                ${safeCandidate.phone ? `<p><strong>Điện thoại:</strong> ${safeCandidate.phone}</p>` : ''}
                ${(safeCandidate.address || safeCandidate.city || safeCandidate.country) ? `
                <p>
                  <strong>Địa chỉ:</strong> 
                  ${[
                    safeCandidate.address,
                    safeCandidate.city,
                    safeCandidate.country
                  ].filter(Boolean).join(', ')}
                </p>
                ` : ''}
              </div>
            </div>
            ` : ''}

            <!-- Summary Section -->
            ${isSectionActive('summary') && safeCandidate.summary ? `
            <div class="cv-section">
              <h2>${getSectionTitle('summary')}</h2>
              <p class="summary">${safeCandidate.summary}</p>
            </div>
            ` : ''}

            <!-- Work Experience Section - First Part -->
            ${isSectionActive('workExperience') && hasArrayItems(safeCandidate.workExperience) ? `
            <div class="cv-section">
              <h2>${getSectionTitle('workExperience')}</h2>
              ${safeCandidate.workExperience.slice(0, 2).map((exp, index) => `
                <div class="experience-item">
                  <h3>${exp.position || 'Chức vụ'}</h3>
                  <p class="company">${exp.company || 'Công ty'}</p>
                  <p class="duration">
                    ${exp.startDate || 'Ngày bắt đầu'} - ${exp.endDate || 'Hiện tại'}
                  </p>
                  <p class="description">${exp.description || ''}</p>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
          
          <!-- TRANG 2 -->
          <div class="page">
            <!-- Remaining Work Experience Section -->
            ${isSectionActive('workExperience') && 
              hasArrayItems(safeCandidate.workExperience) && 
              safeCandidate.workExperience.length > 2 ? `
              <div class="cv-section">
                <h2>${getSectionTitle('workExperience')} (tiếp)</h2>
                ${safeCandidate.workExperience.slice(2).map((exp, index) => `
                  <div class="experience-item">
                    <h3>${exp.position || 'Chức vụ'}</h3>
                    <p class="company">${exp.company || 'Công ty'}</p>
                    <p class="duration">
                      ${exp.startDate || 'Ngày bắt đầu'} - ${exp.endDate || 'Hiện tại'}
                    </p>
                    <p class="description">${exp.description || ''}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <!-- Education Section -->
            ${isSectionActive('education') && hasArrayItems(safeCandidate.education) ? `
            <div class="cv-section">
              <h2>${getSectionTitle('education')}</h2>
              ${safeCandidate.education.map((edu, index) => `
                <div class="education-item">
                  <h3>${edu.degree || 'Bằng cấp'}</h3>
                  <p class="school">${edu.school || 'Trường'}</p>
                  <p class="duration">
                    ${edu.startDate || 'Ngày bắt đầu'} - ${edu.endDate || 'Hiện tại'}
                  </p>
                  ${edu.description ? `<p class="description">${edu.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}

            <!-- Skills Section -->
            ${isSectionActive('skills') && hasArrayItems(safeCandidate.skills) ? `
            <div class="cv-section">
              <h2>${getSectionTitle('skills')}</h2>
              <div class="skills">
                ${safeCandidate.skills.map((skill, index) => `
                  <span class="skill-tag">${skill}</span>
                `).join('')}
              </div>
            </div>
            ` : ''}
            
            <!-- Projects Section -->
            ${isSectionActive('projects') && hasArrayItems(safeCandidate.projects) ? `
            <div class="cv-section">
              <h2>${getSectionTitle('projects')}</h2>
              ${safeCandidate.projects.map((project, index) => `
                <div class="project-item">
                  <h3>${project.name || 'Dự án'}</h3>
                  <p class="duration">
                    ${project.startDate || 'Ngày bắt đầu'} - ${project.endDate || 'Hiện tại'}
                  </p>
                  <p class="description">${project.description || ''}</p>
                  ${hasArrayItems(project.technologies) ? `
                    <div class="technologies">
                      ${project.technologies.map((tech) => `
                        <span class="skill-tag">${tech}</span>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
          
          <!-- TRANG 3 -->
          ${(isSectionActive('certifications') || isSectionActive('languages') || 
             isSectionActive('interests') || isSectionActive('references')) ? `
          <div class="page">
            <!-- Certifications Section -->
            ${isSectionActive('certifications') && hasArrayItems(safeCandidate.certifications) ? `
            <div class="cv-section">
              <h2>${getSectionTitle('certifications')}</h2>
              ${safeCandidate.certifications.map((cert, index) => `
                <div class="certification-item">
                  <h3>${cert.name || 'Chứng chỉ'}</h3>
                  <p class="issuer">${cert.issuer || 'Tổ chức cấp'}</p>
                  <p class="date">${cert.date || ''}</p>
                  ${cert.description ? `<p class="description">${cert.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}

            <!-- Languages Section -->
            ${isSectionActive('languages') && hasArrayItems(safeCandidate.languages) ? `
            <div class="cv-section">
              <h2>${getSectionTitle('languages')}</h2>
              <div class="languages">
                ${safeCandidate.languages.map((lang, index) => `
                  <div class="language-item">
                    <span class="language">${lang.name || 'Ngôn ngữ'}</span>
                    <span class="proficiency"> - ${lang.proficiency || 'Trình độ'}</span>
                    ${lang.description ? `<p class="description">${lang.description}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- Interests Section -->
            ${isSectionActive('interests') && hasArrayItems(safeCandidate.interests) ? `
            <div class="cv-section">
              <h2>${getSectionTitle('interests')}</h2>
              <div class="interests">
                ${safeCandidate.interests.map((interest, index) => `
                  <span class="interest-tag">${interest}</span>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- References Section -->
            ${isSectionActive('references') && hasArrayItems(safeCandidate.references) ? `
            <div class="cv-section">
              <h2>${getSectionTitle('references')}</h2>
              ${safeCandidate.references.map((ref, index) => `
                <div class="reference-item">
                  <h3>${ref.name || 'Người tham chiếu'}</h3>
                  <p class="position">${ref.position || 'Vị trí'} ${ref.company ? `tại ${ref.company}` : ''}</p>
                  <p class="contact">
                    ${ref.email ? `<span>Email: ${ref.email}</span>` : ''}
                    ${ref.phone ? `<span> | Phone: ${ref.phone}</span>` : ''}
                  </p>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
          ` : ''}
        </div>
        
        <script>
          // Thêm số trang vào các phần tử có class pageNumber
          document.addEventListener('DOMContentLoaded', function() {
            // Đếm số trang
            const pages = document.querySelectorAll('.page');
            const totalPages = pages.length;
            
            // Thêm số trang vào footer
            const pageNumbers = document.querySelectorAll('.pageNumber');
            pageNumbers.forEach(function(element, index) {
              const pageNum = Math.floor(index / totalPages) + 1;
              element.textContent = pageNum + '/' + totalPages;
            });
          });
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Chờ để đảm bảo nội dung được tải
    printWindow.onload = function() {
      // Tự động in khi tải xong
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
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
    <div className="cv-template-1" ref={cvRef}>
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
          <Button 
            type="primary" 
            icon={<PrinterOutlined />} 
            onClick={handlePrint}
          >
            In CV
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CVTemplate1;