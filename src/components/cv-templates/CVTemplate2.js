// import React from 'react';
// import { Card, Button } from 'antd';
// import { DownloadOutlined } from '@ant-design/icons';
// import './CVTemplate2.scss';

// const CVTemplate2 = ({ candidate, activeSections = [] }) => {
//   const handleDownload = () => {
//     // Thêm class để ẩn các phần không cần thiết khi in
//     document.body.classList.add('printing');
    
//     // Đảm bảo CV hiển thị đầy đủ khi in
//     const cvElement = document.querySelector('.cv-template-2');
//     if (cvElement) {
//       cvElement.style.overflow = 'visible';
//       cvElement.style.height = 'auto';
//       cvElement.style.display = 'block';
//       cvElement.style.pageBreakInside = 'avoid';
//     }
    
//     // Xử lý từng section để đảm bảo hiển thị đúng
//     const sections = document.querySelectorAll('.sidebar-section, .main-section, .cv-container');
//     const items = document.querySelectorAll('.experience-item, .education-item, .project-item, .certification-item, .language-item');
    
//     sections.forEach(section => {
//       section.style.overflow = 'visible';
//       section.style.height = 'auto';
//       section.style.maxHeight = 'none';
//       section.style.pageBreakInside = 'avoid';
//       section.style.breakInside = 'avoid';
//       section.style.display = 'block';
//     });
    
//     items.forEach(item => {
//       item.style.pageBreakInside = 'avoid';
//       item.style.breakInside = 'avoid';
//     });
    
//     // In CV
//     setTimeout(() => {
//       window.print();
      
//       // Khôi phục style sau khi in
//       setTimeout(() => {
//         document.body.classList.remove('printing');
        
//         // Khôi phục CV
//         if (cvElement) {
//           cvElement.style.overflow = '';
//           cvElement.style.height = '';
//           cvElement.style.display = '';
//           cvElement.style.pageBreakInside = '';
//         }
        
//         // Khôi phục sections
//         sections.forEach(section => {
//           section.style.overflow = '';
//           section.style.height = '';
//           section.style.maxHeight = '';
//           section.style.pageBreakInside = '';
//           section.style.breakInside = '';
//           section.style.display = '';
//         });
        
//         // Khôi phục items
//         items.forEach(item => {
//           item.style.pageBreakInside = '';
//           item.style.breakInside = '';
//         });
//       }, 500);
//     }, 100);
//   };

//   // Helper function to check if section is active
//   const isSectionActive = (sectionKey) => {
//     return activeSections.some(section => section.key === sectionKey);
//   };

//   // Get the title for a section
//   const getSectionTitle = (sectionKey) => {
//     const section = activeSections.find(section => section.key === sectionKey);
//     return section ? section.title : '';
//   };

//   // Helper to safely check if array exists and has items
//   const hasArrayItems = (arr) => {
//     return Array.isArray(arr) && arr.length > 0;
//   };

//   // Safe rendering for candidate information
//   const safeCandidate = candidate || {};

//   return (
//     <div className="cv-template-2">
//       <Card className="cv-card">
//         <div className="cv-container">
//           {/* Sidebar */}
//           <div className="cv-sidebar">
//             {/* Avatar */}
//             <div className="cv-avatar">
//               {safeCandidate.avatar ? (
//                 <img src={safeCandidate.avatar} alt="Avatar" />
//               ) : (
//                 <div className="avatar-placeholder">
//                   {safeCandidate.firstName?.charAt(0) || ''}{safeCandidate.lastName?.charAt(0) || ''}
//                 </div>
//               )}
//             </div>

//             {/* Contact Information */}
//             {isSectionActive('personalInfo') && (
//               <div className="sidebar-section">
//                 <h2>{getSectionTitle('personalInfo')}</h2>
//                 <div className="contact-info">
//                   {safeCandidate.email && (
//                     <div className="contact-item">
//                       <i className="bi bi-envelope"></i>
//                       <span>{safeCandidate.email}</span>
//                     </div>
//                   )}
//                   {safeCandidate.phone && (
//                     <div className="contact-item">
//                       <i className="bi bi-telephone"></i>
//                       <span>{safeCandidate.phone}</span>
//                     </div>
//                   )}
//                   {(safeCandidate.address || safeCandidate.city || safeCandidate.country) && (
//                     <div className="contact-item">
//                       <i className="bi bi-geo-alt"></i>
//                       <span>
//                         {[
//                           safeCandidate.address,
//                           safeCandidate.city,
//                           safeCandidate.country
//                         ].filter(Boolean).join(', ')}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Skills Section */}
//             {isSectionActive('skills') && hasArrayItems(safeCandidate.skills) && (
//               <div className="sidebar-section">
//                 <h2>{getSectionTitle('skills')}</h2>
//                 <div className="skills">
//                   {safeCandidate.skills.map((skill, index) => (
//                     <div key={index} className="skill-item">
//                       <span className="skill-name">{skill}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Languages Section */}
//             {isSectionActive('languages') && hasArrayItems(safeCandidate.languages) && (
//               <div className="sidebar-section">
//                 <h2>{getSectionTitle('languages')}</h2>
//                 <div className="languages">
//                   {safeCandidate.languages.map((lang, index) => (
//                     <div key={index} className="language-item">
//                       <span className="language-name">{lang.name || 'Ngôn ngữ'}</span>
//                       <span className="language-level">{lang.proficiency || 'Trình độ'}</span>
//                       {lang.description && <p className="description">{lang.description}</p>}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Interests Section */}
//             {isSectionActive('interests') && hasArrayItems(safeCandidate.interests) && (
//               <div className="sidebar-section">
//                 <h2>{getSectionTitle('interests')}</h2>
//                 <div className="interests">
//                   {safeCandidate.interests.map((interest, index) => (
//                     <div key={index} className="interest-item">
//                       <span>{interest}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Certifications Section */}
//             {isSectionActive('certifications') && hasArrayItems(safeCandidate.certifications) && (
//               <div className="sidebar-section">
//                 <h2>{getSectionTitle('certifications')}</h2>
//                 {safeCandidate.certifications.map((cert, index) => (
//                   <div key={index} className="certification-item">
//                     <h3>{cert.name || 'Chứng chỉ'}</h3>
//                     <p className="cert-issuer">{cert.issuer || 'Tổ chức cấp'}</p>
//                     {cert.date && <p className="cert-date">{cert.date}</p>}
//                     {cert.description && <p className="description">{cert.description}</p>}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Main Content */}
//           <div className="cv-main">
//             {/* Header with name and title */}
//             <div className="cv-header">
//               <h1>{safeCandidate.firstName || ''} {safeCandidate.lastName || ''}</h1>
//               <p className="cv-title">{safeCandidate.headline || ''}</p>
//             </div>

//             {/* Summary Section */}
//             {isSectionActive('summary') && safeCandidate.summary && (
//               <div className="main-section">
//                 <h2>{getSectionTitle('summary')}</h2>
//                 <p className="summary-text">{safeCandidate.summary}</p>
//               </div>
//             )}

//             {/* Work Experience Section */}
//             {isSectionActive('workExperience') && hasArrayItems(safeCandidate.workExperience) && (
//               <div className="main-section">
//                 <h2>{getSectionTitle('workExperience')}</h2>
//                 {safeCandidate.workExperience.map((exp, index) => (
//                   <div key={index} className="experience-item">
//                     <div className="experience-header">
//                       <h3>{exp.position || 'Chức vụ'}</h3>
//                       <p className="experience-company">{exp.company || 'Công ty'}</p>
//                       <p className="experience-date">
//                         {exp.startDate || 'Ngày bắt đầu'} - {exp.endDate || 'Hiện tại'}
//                       </p>
//                     </div>
//                     <p className="experience-description">{exp.description || ''}</p>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Education Section */}
//             {isSectionActive('education') && hasArrayItems(safeCandidate.education) && (
//               <div className="main-section">
//                 <h2>{getSectionTitle('education')}</h2>
//                 {safeCandidate.education.map((edu, index) => (
//                   <div key={index} className="education-item">
//                     <div className="education-header">
//                       <h3>{edu.degree || 'Bằng cấp'}</h3>
//                       <p className="education-school">{edu.school || 'Trường'}</p>
//                       <p className="education-date">
//                         {edu.startDate || 'Ngày bắt đầu'} - {edu.endDate || 'Hiện tại'}
//                       </p>
//                     </div>
//                     {edu.description && (
//                       <p className="education-description">{edu.description}</p>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Projects Section */}
//             {isSectionActive('projects') && hasArrayItems(safeCandidate.projects) && (
//               <div className="main-section">
//                 <h2>{getSectionTitle('projects')}</h2>
//                 {safeCandidate.projects.map((project, index) => (
//                   <div key={index} className="project-item">
//                     <div className="project-header">
//                       <h3>{project.name || 'Dự án'}</h3>
//                       <p className="project-date">
//                         {project.startDate || 'Ngày bắt đầu'} - {project.endDate || 'Hiện tại'}
//                       </p>
//                     </div>
//                     <p className="project-description">{project.description || ''}</p>
//                     {hasArrayItems(project.technologies) && (
//                       <div className="project-technologies">
//                         <p><strong>Công nghệ:</strong></p>
//                         <div className="tech-tags">
//                           {project.technologies.map((tech, idx) => (
//                             <span key={idx} className="tech-tag">{tech}</span>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* References Section */}
//             {isSectionActive('references') && hasArrayItems(safeCandidate.references) && (
//               <div className="main-section">
//                 <h2>{getSectionTitle('references')}</h2>
//                 <div className="references-container">
//                   {safeCandidate.references.map((ref, index) => (
//                     <div key={index} className="reference-item">
//                       <h3>{ref.name || 'Người tham chiếu'}</h3>
//                       <p className="reference-position">{ref.position || 'Vị trí'} {ref.company ? `tại ${ref.company}` : ''}</p>
//                       {ref.email && <p className="reference-email">{ref.email}</p>}
//                       {ref.phone && <p className="reference-phone">{ref.phone}</p>}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="cv-actions print-hide">
//           <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
//             Tải xuống CV
//           </Button>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default CVTemplate2; 

import React, { useRef } from 'react';
import { Card, Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import './CVTemplate2.scss';

const CVTemplate2 = ({ candidate, activeSections = [] }) => {
  // Tạo ref để tham chiếu đến phần tử CV
  const cvRef = useRef(null);
  
  // Hàm xử lý in CV trực tiếp từ trang hiện tại
  const handlePrint = () => {
    // Tạo một phần tử style ẩn chứa CSS cho in ấn
    const printStyle = document.createElement('style');
    printStyle.id = 'cv-print-styles';
    printStyle.textContent = `
      @page {
        size: A4;
        margin: 10mm;
      }
      
      @media print {
        body * {
          visibility: hidden;
        }
        
        .cv-template-2, .cv-template-2 * {
          visibility: visible;
        }
        
        .cv-template-2 {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 10mm;
          background-color: white;
        }
        
        /* Ẩn nút in và các phần tử không cần in */
        .cv-actions, .print-hide {
          display: none !important;
          visibility: hidden !important;
        }
        
        /* Tiêu đề trang in */
        .cv-print-header {
          position: fixed;
          top: 5mm;
          right: 10mm;
          font-size: 10px;
          text-align: right;
          color: #777;
        }
        
        .cv-print-header .slogan {
          font-style: italic;
          color: #555;
        }
        
        /* Footer trang in */
        .cv-print-footer {
          position: fixed;
          bottom: 5mm;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 10px;
          color: #777;
        }
        
        /* Cấu trúc flex cho container */
        .cv-container {
          display: flex !important;
          flex-direction: row !important;
          gap: 15px !important;
          height: auto !important;
          overflow: visible !important;
        }
        
        /* CV Sidebar */
        .cv-sidebar {
          flex: 1 !important;
          max-width: 30% !important;
          margin-right: 5mm !important;
          background-color: #f5f5f5 !important;
        }
        
        /* CV Main */
        .cv-main {
          flex: 2 !important;
          max-width: 70% !important;
        }
        
        /* Tối ưu khoảng cách */
        .cv-card {
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        .sidebar-section, .main-section {
          margin-bottom: 6mm !important;
          page-break-inside: auto !important;
          break-inside: auto !important;
        }
        
        h1, h2, h3 {
          margin-bottom: 3mm !important;
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
        
        .experience-item, 
        .education-item, 
        .project-item, 
        .certification-item,
        .language-item,
        .reference-item {
          margin-bottom: 4mm !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        /* Giảm khoảng cách giữa các mục */
        p {
          margin: 1.5mm 0 !important;
        }
        
        /* Loại bỏ khoảng trống dư thừa */
        .skills, .interests, .languages, .contact-info {
          margin-top: 2mm !important;
        }
        
        /* Đảm bảo avatar hiển thị đúng */
        .cv-avatar {
          width: 100% !important;
          max-width: 150px !important;
          margin: 0 auto 4mm auto !important;
        }
      }
    `;
    
    // Thêm các phần tử header và footer cho in ấn
    const printHeader = document.createElement('div');
    printHeader.className = 'cv-print-header print-only';
    printHeader.innerHTML = `
      <div class="slogan">NVK - Năng lực, Vững vàng, Kiến tạo tương lai</div>
      CV - ${safeCandidate.firstName || ''} ${safeCandidate.lastName || ''}
    `;
    
    const printFooter = document.createElement('div');
    printFooter.className = 'cv-print-footer print-only';
    printFooter.innerHTML = 'Trang <span class="pageNumber"></span>';
    
    // Thêm các phần tử này vào trang
    document.head.appendChild(printStyle);
    document.body.appendChild(printHeader);
    document.body.appendChild(printFooter);
    
    // Mở cửa sổ in
    window.print();
    
    // Xóa các phần tử tạm thời sau khi in
    setTimeout(() => {
      document.head.removeChild(printStyle);
      document.body.removeChild(printHeader);
      document.body.removeChild(printFooter);
    }, 500);
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
    <div className="cv-template-2" ref={cvRef}>
      <Card className="cv-card">
        <div className="cv-container">
          {/* Sidebar */}
          <div className="cv-sidebar">
            {/* Avatar */}
            <div className="cv-avatar">
              {safeCandidate.avatar ? (
                <img src={safeCandidate.avatar} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {safeCandidate.firstName?.charAt(0) || ''}{safeCandidate.lastName?.charAt(0) || ''}
                </div>
              )}
            </div>

            {/* Contact Information */}
            {isSectionActive('personalInfo') && (
              <div className="sidebar-section">
                <h2>{getSectionTitle('personalInfo')}</h2>
                <div className="contact-info">
                  {safeCandidate.email && (
                    <div className="contact-item">
                      <i className="bi bi-envelope"></i>
                      <span>{safeCandidate.email}</span>
                    </div>
                  )}
                  {safeCandidate.phone && (
                    <div className="contact-item">
                      <i className="bi bi-telephone"></i>
                      <span>{safeCandidate.phone}</span>
                    </div>
                  )}
                  {(safeCandidate.address || safeCandidate.city || safeCandidate.country) && (
                    <div className="contact-item">
                      <i className="bi bi-geo-alt"></i>
                      <span>
                        {[
                          safeCandidate.address,
                          safeCandidate.city,
                          safeCandidate.country
                        ].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {isSectionActive('skills') && hasArrayItems(safeCandidate.skills) && (
              <div className="sidebar-section">
                <h2>{getSectionTitle('skills')}</h2>
                <div className="skills">
                  {safeCandidate.skills.map((skill, index) => (
                    <div key={index} className="skill-item">
                      <span className="skill-name">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages Section */}
            {isSectionActive('languages') && hasArrayItems(safeCandidate.languages) && (
              <div className="sidebar-section">
                <h2>{getSectionTitle('languages')}</h2>
                <div className="languages">
                  {safeCandidate.languages.map((lang, index) => (
                    <div key={index} className="language-item">
                      <span className="language-name">{lang.name || 'Ngôn ngữ'}</span>
                      <span className="language-level">{lang.proficiency || 'Trình độ'}</span>
                      {lang.description && <p className="description">{lang.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interests Section */}
            {isSectionActive('interests') && hasArrayItems(safeCandidate.interests) && (
              <div className="sidebar-section">
                <h2>{getSectionTitle('interests')}</h2>
                <div className="interests">
                  {safeCandidate.interests.map((interest, index) => (
                    <div key={index} className="interest-item">
                      <span>{interest}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications Section */}
            {isSectionActive('certifications') && hasArrayItems(safeCandidate.certifications) && (
              <div className="sidebar-section">
                <h2>{getSectionTitle('certifications')}</h2>
                {safeCandidate.certifications.map((cert, index) => (
                  <div key={index} className="certification-item">
                    <h3>{cert.name || 'Chứng chỉ'}</h3>
                    <p className="cert-issuer">{cert.issuer || 'Tổ chức cấp'}</p>
                    {cert.date && <p className="cert-date">{cert.date}</p>}
                    {cert.description && <p className="description">{cert.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="cv-main">
            {/* Header with name and title */}
            <div className="cv-header">
              <h1>{safeCandidate.firstName || ''} {safeCandidate.lastName || ''}</h1>
              <p className="cv-title">{safeCandidate.headline || ''}</p>
            </div>

            {/* Summary Section */}
            {isSectionActive('summary') && safeCandidate.summary && (
              <div className="main-section">
                <h2>{getSectionTitle('summary')}</h2>
                <p className="summary-text">{safeCandidate.summary}</p>
              </div>
            )}

            {/* Work Experience Section */}
            {isSectionActive('workExperience') && hasArrayItems(safeCandidate.workExperience) && (
              <div className="main-section">
                <h2>{getSectionTitle('workExperience')}</h2>
                {safeCandidate.workExperience.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <div className="experience-header">
                      <h3>{exp.position || 'Chức vụ'}</h3>
                      <p className="experience-company">{exp.company || 'Công ty'}</p>
                      <p className="experience-date">
                        {exp.startDate || 'Ngày bắt đầu'} - {exp.endDate || 'Hiện tại'}
                      </p>
                    </div>
                    <p className="experience-description">{exp.description || ''}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Education Section */}
            {isSectionActive('education') && hasArrayItems(safeCandidate.education) && (
              <div className="main-section">
                <h2>{getSectionTitle('education')}</h2>
                {safeCandidate.education.map((edu, index) => (
                  <div key={index} className="education-item">
                    <div className="education-header">
                      <h3>{edu.degree || 'Bằng cấp'}</h3>
                      <p className="education-school">{edu.school || 'Trường'}</p>
                      <p className="education-date">
                        {edu.startDate || 'Ngày bắt đầu'} - {edu.endDate || 'Hiện tại'}
                      </p>
                    </div>
                    {edu.description && (
                      <p className="education-description">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Projects Section */}
            {isSectionActive('projects') && hasArrayItems(safeCandidate.projects) && (
              <div className="main-section">
                <h2>{getSectionTitle('projects')}</h2>
                {safeCandidate.projects.map((project, index) => (
                  <div key={index} className="project-item">
                    <div className="project-header">
                      <h3>{project.name || 'Dự án'}</h3>
                      <p className="project-date">
                        {project.startDate || 'Ngày bắt đầu'} - {project.endDate || 'Hiện tại'}
                      </p>
                    </div>
                    <p className="project-description">{project.description || ''}</p>
                    {hasArrayItems(project.technologies) && (
                      <div className="project-technologies">
                        <p><strong>Công nghệ:</strong></p>
                        <div className="tech-tags">
                          {project.technologies.map((tech, idx) => (
                            <span key={idx} className="tech-tag">{tech}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* References Section */}
            {isSectionActive('references') && hasArrayItems(safeCandidate.references) && (
              <div className="main-section">
                <h2>{getSectionTitle('references')}</h2>
                <div className="references-container">
                  {safeCandidate.references.map((ref, index) => (
                    <div key={index} className="reference-item">
                      <h3>{ref.name || 'Người tham chiếu'}</h3>
                      <p className="reference-position">{ref.position || 'Vị trí'} {ref.company ? `tại ${ref.company}` : ''}</p>
                      {ref.email && <p className="reference-email">{ref.email}</p>}
                      {ref.phone && <p className="reference-phone">{ref.phone}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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

export default CVTemplate2;