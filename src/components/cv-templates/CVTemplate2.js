// // import React from 'react';
// // import { Card, Button } from 'antd';
// // import { DownloadOutlined } from '@ant-design/icons';
// // import './CVTemplate2.scss';

// // const CVTemplate2 = ({ candidate, activeSections = [] }) => {
// //   const handleDownload = () => {
// //     // Thêm class để ẩn các phần không cần thiết khi in
// //     document.body.classList.add('printing');
    
// //     // Đảm bảo CV hiển thị đầy đủ khi in
// //     const cvElement = document.querySelector('.cv-template-2');
// //     if (cvElement) {
// //       cvElement.style.overflow = 'visible';
// //       cvElement.style.height = 'auto';
// //       cvElement.style.display = 'block';
// //       cvElement.style.pageBreakInside = 'avoid';
// //     }
    
// //     // Xử lý từng section để đảm bảo hiển thị đúng
// //     const sections = document.querySelectorAll('.sidebar-section, .main-section, .cv-container');
// //     const items = document.querySelectorAll('.experience-item, .education-item, .project-item, .certification-item, .language-item');
    
// //     sections.forEach(section => {
// //       section.style.overflow = 'visible';
// //       section.style.height = 'auto';
// //       section.style.maxHeight = 'none';
// //       section.style.pageBreakInside = 'avoid';
// //       section.style.breakInside = 'avoid';
// //       section.style.display = 'block';
// //     });
    
// //     items.forEach(item => {
// //       item.style.pageBreakInside = 'avoid';
// //       item.style.breakInside = 'avoid';
// //     });
    
// //     // In CV
// //     setTimeout(() => {
// //       window.print();
      
// //       // Khôi phục style sau khi in
// //       setTimeout(() => {
// //         document.body.classList.remove('printing');
        
// //         // Khôi phục CV
// //         if (cvElement) {
// //           cvElement.style.overflow = '';
// //           cvElement.style.height = '';
// //           cvElement.style.display = '';
// //           cvElement.style.pageBreakInside = '';
// //         }
        
// //         // Khôi phục sections
// //         sections.forEach(section => {
// //           section.style.overflow = '';
// //           section.style.height = '';
// //           section.style.maxHeight = '';
// //           section.style.pageBreakInside = '';
// //           section.style.breakInside = '';
// //           section.style.display = '';
// //         });
        
// //         // Khôi phục items
// //         items.forEach(item => {
// //           item.style.pageBreakInside = '';
// //           item.style.breakInside = '';
// //         });
// //       }, 500);
// //     }, 100);
// //   };

// //   // Helper function to check if section is active
// //   const isSectionActive = (sectionKey) => {
// //     return activeSections.some(section => section.key === sectionKey);
// //   };

// //   // Get the title for a section
// //   const getSectionTitle = (sectionKey) => {
// //     const section = activeSections.find(section => section.key === sectionKey);
// //     return section ? section.title : '';
// //   };

// //   // Helper to safely check if array exists and has items
// //   const hasArrayItems = (arr) => {
// //     return Array.isArray(arr) && arr.length > 0;
// //   };

// //   // Safe rendering for candidate information
// //   const safeCandidate = candidate || {};

// //   return (
// //     <div className="cv-template-2">
// //       <Card className="cv-card">
// //         <div className="cv-container">
// //           {/* Sidebar */}
// //           <div className="cv-sidebar">
// //             {/* Avatar */}
// //             <div className="cv-avatar">
// //               {safeCandidate.avatar ? (
// //                 <img src={safeCandidate.avatar} alt="Avatar" />
// //               ) : (
// //                 <div className="avatar-placeholder">
// //                   {safeCandidate.firstName?.charAt(0) || ''}{safeCandidate.lastName?.charAt(0) || ''}
// //                 </div>
// //               )}
// //             </div>

// //             {/* Contact Information */}
// //             {isSectionActive('personalInfo') && (
// //               <div className="sidebar-section">
// //                 <h2>{getSectionTitle('personalInfo')}</h2>
// //                 <div className="contact-info">
// //                   {safeCandidate.email && (
// //                     <div className="contact-item">
// //                       <i className="bi bi-envelope"></i>
// //                       <span>{safeCandidate.email}</span>
// //                     </div>
// //                   )}
// //                   {safeCandidate.phone && (
// //                     <div className="contact-item">
// //                       <i className="bi bi-telephone"></i>
// //                       <span>{safeCandidate.phone}</span>
// //                     </div>
// //                   )}
// //                   {(safeCandidate.address || safeCandidate.city || safeCandidate.country) && (
// //                     <div className="contact-item">
// //                       <i className="bi bi-geo-alt"></i>
// //                       <span>
// //                         {[
// //                           safeCandidate.address,
// //                           safeCandidate.city,
// //                           safeCandidate.country
// //                         ].filter(Boolean).join(', ')}
// //                       </span>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>
// //             )}

// //             {/* Skills Section */}
// //             {isSectionActive('skills') && hasArrayItems(safeCandidate.skills) && (
// //               <div className="sidebar-section">
// //                 <h2>{getSectionTitle('skills')}</h2>
// //                 <div className="skills">
// //                   {safeCandidate.skills.map((skill, index) => (
// //                     <div key={index} className="skill-item">
// //                       <span className="skill-name">{skill}</span>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}

// //             {/* Languages Section */}
// //             {isSectionActive('languages') && hasArrayItems(safeCandidate.languages) && (
// //               <div className="sidebar-section">
// //                 <h2>{getSectionTitle('languages')}</h2>
// //                 <div className="languages">
// //                   {safeCandidate.languages.map((lang, index) => (
// //                     <div key={index} className="language-item">
// //                       <span className="language-name">{lang.name || 'Ngôn ngữ'}</span>
// //                       <span className="language-level">{lang.proficiency || 'Trình độ'}</span>
// //                       {lang.description && <p className="description">{lang.description}</p>}
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}

// //             {/* Interests Section */}
// //             {isSectionActive('interests') && hasArrayItems(safeCandidate.interests) && (
// //               <div className="sidebar-section">
// //                 <h2>{getSectionTitle('interests')}</h2>
// //                 <div className="interests">
// //                   {safeCandidate.interests.map((interest, index) => (
// //                     <div key={index} className="interest-item">
// //                       <span>{interest}</span>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}

// //             {/* Certifications Section */}
// //             {isSectionActive('certifications') && hasArrayItems(safeCandidate.certifications) && (
// //               <div className="sidebar-section">
// //                 <h2>{getSectionTitle('certifications')}</h2>
// //                 {safeCandidate.certifications.map((cert, index) => (
// //                   <div key={index} className="certification-item">
// //                     <h3>{cert.name || 'Chứng chỉ'}</h3>
// //                     <p className="cert-issuer">{cert.issuer || 'Tổ chức cấp'}</p>
// //                     {cert.date && <p className="cert-date">{cert.date}</p>}
// //                     {cert.description && <p className="description">{cert.description}</p>}
// //                   </div>
// //                 ))}
// //               </div>
// //             )}
// //           </div>

// //           {/* Main Content */}
// //           <div className="cv-main">
// //             {/* Header with name and title */}
// //             <div className="cv-header">
// //               <h1>{safeCandidate.firstName || ''} {safeCandidate.lastName || ''}</h1>
// //               <p className="cv-title">{safeCandidate.headline || ''}</p>
// //             </div>

// //             {/* Summary Section */}
// //             {isSectionActive('summary') && safeCandidate.summary && (
// //               <div className="main-section">
// //                 <h2>{getSectionTitle('summary')}</h2>
// //                 <p className="summary-text">{safeCandidate.summary}</p>
// //               </div>
// //             )}

// //             {/* Work Experience Section */}
// //             {isSectionActive('workExperience') && hasArrayItems(safeCandidate.workExperience) && (
// //               <div className="main-section">
// //                 <h2>{getSectionTitle('workExperience')}</h2>
// //                 {safeCandidate.workExperience.map((exp, index) => (
// //                   <div key={index} className="experience-item">
// //                     <div className="experience-header">
// //                       <h3>{exp.position || 'Chức vụ'}</h3>
// //                       <p className="experience-company">{exp.company || 'Công ty'}</p>
// //                       <p className="experience-date">
// //                         {exp.startDate || 'Ngày bắt đầu'} - {exp.endDate || 'Hiện tại'}
// //                       </p>
// //                     </div>
// //                     <p className="experience-description">{exp.description || ''}</p>
// //                   </div>
// //                 ))}
// //               </div>
// //             )}

// //             {/* Education Section */}
// //             {isSectionActive('education') && hasArrayItems(safeCandidate.education) && (
// //               <div className="main-section">
// //                 <h2>{getSectionTitle('education')}</h2>
// //                 {safeCandidate.education.map((edu, index) => (
// //                   <div key={index} className="education-item">
// //                     <div className="education-header">
// //                       <h3>{edu.degree || 'Bằng cấp'}</h3>
// //                       <p className="education-school">{edu.school || 'Trường'}</p>
// //                       <p className="education-date">
// //                         {edu.startDate || 'Ngày bắt đầu'} - {edu.endDate || 'Hiện tại'}
// //                       </p>
// //                     </div>
// //                     {edu.description && (
// //                       <p className="education-description">{edu.description}</p>
// //                     )}
// //                   </div>
// //                 ))}
// //               </div>
// //             )}

// //             {/* Projects Section */}
// //             {isSectionActive('projects') && hasArrayItems(safeCandidate.projects) && (
// //               <div className="main-section">
// //                 <h2>{getSectionTitle('projects')}</h2>
// //                 {safeCandidate.projects.map((project, index) => (
// //                   <div key={index} className="project-item">
// //                     <div className="project-header">
// //                       <h3>{project.name || 'Dự án'}</h3>
// //                       <p className="project-date">
// //                         {project.startDate || 'Ngày bắt đầu'} - {project.endDate || 'Hiện tại'}
// //                       </p>
// //                     </div>
// //                     <p className="project-description">{project.description || ''}</p>
// //                     {hasArrayItems(project.technologies) && (
// //                       <div className="project-technologies">
// //                         <p><strong>Công nghệ:</strong></p>
// //                         <div className="tech-tags">
// //                           {project.technologies.map((tech, idx) => (
// //                             <span key={idx} className="tech-tag">{tech}</span>
// //                           ))}
// //                         </div>
// //                       </div>
// //                     )}
// //                   </div>
// //                 ))}
// //               </div>
// //             )}

// //             {/* References Section */}
// //             {isSectionActive('references') && hasArrayItems(safeCandidate.references) && (
// //               <div className="main-section">
// //                 <h2>{getSectionTitle('references')}</h2>
// //                 <div className="references-container">
// //                   {safeCandidate.references.map((ref, index) => (
// //                     <div key={index} className="reference-item">
// //                       <h3>{ref.name || 'Người tham chiếu'}</h3>
// //                       <p className="reference-position">{ref.position || 'Vị trí'} {ref.company ? `tại ${ref.company}` : ''}</p>
// //                       {ref.email && <p className="reference-email">{ref.email}</p>}
// //                       {ref.phone && <p className="reference-phone">{ref.phone}</p>}
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         </div>

// //         <div className="cv-actions print-hide">
// //           <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
// //             Tải xuống CV
// //           </Button>
// //         </div>
// //       </Card>
// //     </div>
// //   );
// // };

// // export default CVTemplate2; 

// import React, { useRef } from 'react';
// import { Card, Button } from 'antd';
// import { PrinterOutlined } from '@ant-design/icons';
// import './CVTemplate2.scss';

// const CVTemplate2 = ({ candidate, activeSections = [] }) => {
//   // Tạo ref để tham chiếu đến phần tử CV
//   const cvRef = useRef(null);
  
//   // Hàm xử lý in CV trực tiếp từ trang hiện tại
//   const handlePrint = () => {
//     // Tạo một phần tử style ẩn chứa CSS cho in ấn
//     const printStyle = document.createElement('style');
//     printStyle.id = 'cv-print-styles';
//     printStyle.textContent = `
//       @page {
//         size: A4;
//         margin: 10mm;
//       }
      
//       @media print {
//         body * {
//           visibility: hidden;
//         }
        
//         .cv-template-2, .cv-template-2 * {
//           visibility: visible;
//         }
        
//         .cv-template-2 {
//           position: absolute;
//           left: 0;
//           top: 0;
//           width: 100%;
//           padding: 10mm;
//           background-color: white;
//         }
        
//         /* Ẩn nút in và các phần tử không cần in */
//         .cv-actions, .print-hide {
//           display: none !important;
//           visibility: hidden !important;
//         }
        
//         /* Tiêu đề trang in */
//         .cv-print-header {
//           position: fixed;
//           top: 5mm;
//           right: 10mm;
//           font-size: 10px;
//           text-align: right;
//           color: #777;
//         }
        
//         .cv-print-header .slogan {
//           font-style: italic;
//           color: #555;
//         }
        
//         /* Footer trang in */
//         .cv-print-footer {
//           position: fixed;
//           bottom: 5mm;
//           left: 0;
//           right: 0;
//           text-align: center;
//           font-size: 10px;
//           color: #777;
//         }
        
//         /* Cấu trúc flex cho container */
//         .cv-container {
//           display: flex !important;
//           flex-direction: row !important;
//           gap: 15px !important;
//           height: auto !important;
//           overflow: visible !important;
//         }
        
//         /* CV Sidebar */
//         .cv-sidebar {
//           flex: 1 !important;
//           max-width: 30% !important;
//           margin-right: 5mm !important;
//           background-color: #f5f5f5 !important;
//         }
        
//         /* CV Main */
//         .cv-main {
//           flex: 2 !important;
//           max-width: 70% !important;
//         }
        
//         /* Tối ưu khoảng cách */
//         .cv-card {
//           box-shadow: none !important;
//           border: none !important;
//           padding: 0 !important;
//           margin: 0 !important;
//         }
        
//         .sidebar-section, .main-section {
//           margin-bottom: 6mm !important;
//           page-break-inside: auto !important;
//           break-inside: auto !important;
//         }
        
//         h1, h2, h3 {
//           margin-bottom: 3mm !important;
//           page-break-after: avoid !important;
//           break-after: avoid !important;
//         }
        
//         .experience-item, 
//         .education-item, 
//         .project-item, 
//         .certification-item,
//         .language-item,
//         .reference-item {
//           margin-bottom: 4mm !important;
//           page-break-inside: avoid !important;
//           break-inside: avoid !important;
//         }
        
//         /* Giảm khoảng cách giữa các mục */
//         p {
//           margin: 1.5mm 0 !important;
//         }
        
//         /* Loại bỏ khoảng trống dư thừa */
//         .skills, .interests, .languages, .contact-info {
//           margin-top: 2mm !important;
//         }
        
//         /* Đảm bảo avatar hiển thị đúng */
//         .cv-avatar {
//           width: 100% !important;
//           max-width: 150px !important;
//           margin: 0 auto 4mm auto !important;
//         }
//       }
//     `;
    
//     // Thêm các phần tử header và footer cho in ấn
//     const printHeader = document.createElement('div');
//     printHeader.className = 'cv-print-header print-only';
//     printHeader.innerHTML = `
//       <div class="slogan">NVK - Năng lực, Vững vàng, Kiến tạo tương lai</div>
//       CV - ${safeCandidate.firstName || ''} ${safeCandidate.lastName || ''}
//     `;
    
//     const printFooter = document.createElement('div');
//     printFooter.className = 'cv-print-footer print-only';
//     printFooter.innerHTML = 'Trang <span class="pageNumber"></span>';
    
//     // Thêm các phần tử này vào trang
//     document.head.appendChild(printStyle);
//     document.body.appendChild(printHeader);
//     document.body.appendChild(printFooter);
    
//     // Mở cửa sổ in
//     window.print();
    
//     // Xóa các phần tử tạm thời sau khi in
//     setTimeout(() => {
//       document.head.removeChild(printStyle);
//       document.body.removeChild(printHeader);
//       document.body.removeChild(printFooter);
//     }, 500);
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
//     <div className="cv-template-2" ref={cvRef}>
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
//           <Button 
//             type="primary" 
//             icon={<PrinterOutlined />} 
//             onClick={handlePrint}
//           >
//             In CV
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
  const cvRef = useRef(null);

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow pop-up windows to print your CV.');
      return;
    }
    
    // Generate HTML content for the print window
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
            font-family: 'Montserrat', Arial, sans-serif;
            color: #333;
            line-height: 1.5;
            background-color: white;
          }
          
          * {
            box-sizing: border-box;
          }
          
          /* Page header for all pages */
          .page-header {
            position: running(header);
            text-align: right;
            font-size: 10px;
            color: #777;
            padding-bottom: 5mm;
          }
          
          /* Page footer for all pages */
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
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin-bottom: 25mm;
            position: relative;
          }
          
          .cv-avatar {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            margin-bottom: 15px;
            overflow: hidden;
            border: 5px solid #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #2980b9;
            color: white;
            font-size: 48px;
            font-weight: bold;
          }
          
          .cv-title h1 {
            margin: 0 0 8px 0;
            font-size: 32px;
            font-weight: 700;
            color: #2c3e50;
            letter-spacing: 1px;
          }
          
          .position {
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #555;
            font-weight: 500;
          }
          
          .contact-quick {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 15px;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            font-size: 14px;
          }
          
          .timeline-container {
            position: relative;
            margin-left: 25px;
          }
          
          .timeline-container::before {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            width: 2px;
            background-color: #3498db;
            transform: translateX(-50%);
          }
          
          .timeline-item {
            position: relative;
            margin-bottom: 20mm;
            padding-left: 40px;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .timeline-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: 5px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: #3498db;
            transform: translateX(-50%);
          }
          
          .timeline-item:last-child {
            margin-bottom: 0;
          }
          
          .cv-section {
            margin-bottom: 25mm;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          h2 {
            font-size: 22px;
            font-weight: 600;
            margin: 0 0 15mm 0;
            color: #2c3e50;
            break-after: avoid;
            page-break-after: avoid;
            position: relative;
            padding-bottom: 10px;
          }
          
          h2::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 80px;
            height: 3px;
            background-color: #3498db;
          }
          
          h3 {
            margin: 0 0 5px 0;
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            break-after: avoid;
            page-break-after: avoid;
          }
          
          p {
            margin: 5px 0;
          }
          
          .contact-info p {
            margin: 7px 0;
          }
          
          .company, .school, .issuer {
            font-weight: 600;
            color: #555;
            font-size: 16px;
          }
          
          .duration, .date {
            color: #3498db;
            font-weight: 500;
            font-size: 14px;
            margin: 5px 0;
          }
          
          .description {
            margin-top: 10px;
            line-height: 1.6;
          }
          
          .non-timeline-section {
            padding-left: 40px;
          }
          
          .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 15px;
          }
          
          .skill-group {
            flex-basis: calc(50% - 10px);
            margin-bottom: 15px;
          }
          
          .skill-name {
            font-weight: 600;
            margin-bottom: 5px;
          }
          
          .skill-bar {
            height: 8px;
            background-color: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;
          }
          
          .skill-progress {
            height: 100%;
            background-color: #3498db;
          }
          
          .skills, .interests, .technologies {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
          }
          
          .skill-tag, .interest-tag {
            background-color: #f0f0f0;
            border-radius: 20px;
            padding: 5px 15px;
            font-size: 14px;
            display: inline-block;
          }
          
          .languages {
            margin-top: 15px;
          }
          
          .language-item {
            margin-bottom: 12px;
          }
          
          .language-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          
          .language {
            font-weight: 600;
          }
          
          .proficiency {
            color: #666;
          }
          
          .language-bar {
            height: 6px;
            background-color: #f0f0f0;
            border-radius: 3px;
            overflow: hidden;
          }
          
          .language-progress {
            height: 100%;
            background-color: #3498db;
          }
        </style>
      </head>
      <body>
        <!-- Header for all pages -->
        <div class="page-header">
          CV - ${safeCandidate.firstName || ''} ${safeCandidate.lastName || ''}
        </div>
        
        <!-- Footer for all pages -->
        <div class="page-footer">
          Page <span class="pageNumber"></span>
        </div>
        
        <div class="cv-container">
          <!-- PAGE 1 -->
          <div class="page">
            <!-- Header with personal info -->
            <div class="cv-header">
              <div class="cv-avatar">
                ${safeCandidate.firstName?.charAt(0) || ''}${safeCandidate.lastName?.charAt(0) || ''}
              </div>
              <div class="cv-title">
                <h1>${safeCandidate.firstName || ''} ${safeCandidate.lastName || ''}</h1>
                <p class="position">${safeCandidate.headline || ''}</p>
                
                ${isSectionActive('personalInfo') ? `
                <div class="contact-quick">
                  ${safeCandidate.email ? `<div class="contact-item">${safeCandidate.email}</div>` : ''}
                  ${safeCandidate.phone ? `<div class="contact-item">${safeCandidate.phone}</div>` : ''}
                  ${(safeCandidate.city && safeCandidate.country) ? 
                    `<div class="contact-item">${safeCandidate.city}, ${safeCandidate.country}</div>` : ''}
                </div>
                ` : ''}
              </div>
            </div>

            <!-- Summary Section -->
            ${isSectionActive('summary') && safeCandidate.summary ? `
            <div class="cv-section">
              <h2>${getSectionTitle('summary')}</h2>
              <div class="non-timeline-section">
                <p class="summary">${safeCandidate.summary}</p>
              </div>
            </div>
            ` : ''}

            <!-- Work Experience Section -->
            ${isSectionActive('workExperience') && hasArrayItems(safeCandidate.workExperience) ? `
            <div class="cv-section">
              <h2>${getSectionTitle('workExperience')}</h2>
              <div class="timeline-container">
                ${safeCandidate.workExperience.slice(0, 3).map((exp, index) => `
                  <div class="timeline-item">
                    <h3>${exp.position || 'Position'}</h3>
                    <p class="company">${exp.company || 'Company'}</p>
                    <p class="duration">${exp.startDate || 'Start Date'} - ${exp.endDate || 'Present'}</p>
                    <p class="description">${exp.description || ''}</p>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}
          </div>
          
          <!-- PAGE 2 -->
          <div class="page">
            <!-- Remaining Work Experience Section -->
            ${isSectionActive('workExperience') && 
              hasArrayItems(safeCandidate.workExperience) && 
              safeCandidate.workExperience.length > 3 ? `
              <div class="cv-section">
                <h2>${getSectionTitle('workExperience')} (continued)</h2>
                <div class="timeline-container">
                  ${safeCandidate.workExperience.slice(3).map((exp, index) => `
                    <div class="timeline-item">
                      <h3>${exp.position || 'Position'}</h3>
                      <p class="company">${exp.company || 'Company'}</p>
                      <p class="duration">${exp.startDate || 'Start Date'} - ${exp.endDate || 'Present'}</p>
                      <p class="description">${exp.description || ''}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Education Section -->
            ${isSectionActive('education') && hasArrayItems(safeCandidate.education) ? `
            <div class="cv-section">
              <h2>${getSectionTitle('education')}</h2>
              <div class="timeline-container">
                ${safeCandidate.education.map((edu, index) => `
                  <div class="timeline-item">
                    <h3>${edu.degree || 'Degree'}</h3>
                    <p class="school">${edu.school || 'School'}</p>
                    <p class="duration">${edu.startDate || 'Start Date'} - ${edu.endDate || 'Present'}</p>
                    ${edu.description ? `<p class="description">${edu.description}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- Skills Section -->
            ${isSectionActive('skills') && hasArrayItems(safeCandidate.skills) ? `
            <div class="cv-section">
              <h2>${getSectionTitle('skills')}</h2>
              <div class="non-timeline-section">
                <div class="skills">
                  ${safeCandidate.skills.map((skill, index) => `
                    <span class="skill-tag">${skill}</span>
                  `).join('')}
                </div>
              </div>
            </div>
            ` : ''}
            
            <!-- Languages Section -->
            ${isSectionActive('languages') && hasArrayItems(safeCandidate.languages) ? `
            <div class="cv-section">
              <h2>${getSectionTitle('languages')}</h2>
              <div class="non-timeline-section">
                <div class="languages">
                  ${safeCandidate.languages.map((lang, index) => `
                    <div class="language-item">
                      <div class="language-header">
                        <span class="language">${lang.name || 'Language'}</span>
                        <span class="proficiency">${lang.proficiency || 'Proficiency'}</span>
                      </div>
                      <div class="language-bar">
                        <div class="language-progress" style="width: ${getLanguageProficiencyPercentage(lang.proficiency)}%;"></div>
                      </div>
                      ${lang.description ? `<p class="description">${lang.description}</p>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
            ` : ''}
          </div>
          
          <!-- PAGE 3 -->
          ${(isSectionActive('projects') || isSectionActive('certifications') || 
             isSectionActive('interests') || isSectionActive('references')) ? `
          <div class="page">
            <!-- Projects Section -->
            ${isSectionActive('projects') && hasArrayItems(safeCandidate.projects) ? `
            <div class="cv-section">
              <h2>${getSectionTitle('projects')}</h2>
              <div class="timeline-container">
                ${safeCandidate.projects.map((project, index) => `
                  <div class="timeline-item">
                    <h3>${project.name || 'Project'}</h3>
                    <p class="duration">${project.startDate || 'Start Date'} - ${project.endDate || 'Present'}</p>
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
            </div>
            ` : ''}

            <!-- Certifications Section -->
            ${isSectionActive('certifications') && hasArrayItems(safeCandidate.certifications) ? `
            <div class="cv-section">
              <h2>${getSectionTitle('certifications')}</h2>
              <div class="timeline-container">
                ${safeCandidate.certifications.map((cert, index) => `
                  <div class="timeline-item">
                    <h3>${cert.name || 'Certification'}</h3>
                    <p class="issuer">${cert.issuer || 'Issuer'}</p>
                    <p class="date">${cert.date || ''}</p>
                    ${cert.description ? `<p class="description">${cert.description}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- Interests Section -->
            ${isSectionActive('interests') && hasArrayItems(safeCandidate.interests) ? `
            <div class="cv-section">
              <h2>${getSectionTitle('interests')}</h2>
              <div class="non-timeline-section">
                <div class="interests">
                  ${safeCandidate.interests.map((interest, index) => `
                    <span class="interest-tag">${interest}</span>
                  `).join('')}
                </div>
              </div>
            </div>
            ` : ''}

            <!-- References Section -->
            ${isSectionActive('references') && hasArrayItems(safeCandidate.references) ? `
            <div class="cv-section">
              <h2>${getSectionTitle('references')}</h2>
              <div class="non-timeline-section">
                ${safeCandidate.references.map((ref, index) => `
                  <div class="reference-item" style="margin-bottom: 20px;">
                    <h3>${ref.name || 'Reference'}</h3>
                    <p class="position">${ref.position || 'Position'} ${ref.company ? `at ${ref.company}` : ''}</p>
                    <p class="contact">
                      ${ref.email ? `<span>Email: ${ref.email}</span>` : ''}
                      ${ref.phone ? `<span> | Phone: ${ref.phone}</span>` : ''}
                    </p>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}
          </div>
          ` : ''}
        </div>
        
        <script>
          // Add page numbers to elements with pageNumber class
          document.addEventListener('DOMContentLoaded', function() {
            // Count pages
            const pages = document.querySelectorAll('.page');
            const totalPages = pages.length;
            
            // Add page numbers to footer
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
    
    // Wait to ensure content is loaded
    printWindow.onload = function() {
      // Automatically print when loaded
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

  // Helper to convert language proficiency to percentage
  const getLanguageProficiencyPercentage = (proficiency) => {
    const levels = {
      'Native': 100,
      'Fluent': 90,
      'Advanced': 80,
      'Upper Intermediate': 70,
      'Intermediate': 60,
      'Lower Intermediate': 50,
      'Elementary': 40,
      'Beginner': 30,
      'Basic': 20
    };
    
    return levels[proficiency] || 50; // Default to 50% if proficiency not found
  };

  // Safe rendering for candidate information
  const safeCandidate = candidate || {};

  return (
    <div className="cv-template-2" ref={cvRef}>
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
            
            {isSectionActive('personalInfo') && (
              <div className="contact-quick">
                {safeCandidate.email && <div className="contact-item">{safeCandidate.email}</div>}
                {safeCandidate.phone && <div className="contact-item">{safeCandidate.phone}</div>}
                {(safeCandidate.city && safeCandidate.country) && 
                  <div className="contact-item">{safeCandidate.city}, {safeCandidate.country}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Summary Section */}
        {isSectionActive('summary') && safeCandidate.summary && (
          <div className="cv-section">
            <h2>{getSectionTitle('summary')}</h2>
            <div className="non-timeline-section">
              <p className="summary">{safeCandidate.summary}</p>
            </div>
          </div>
        )}

        {/* Work Experience Section */}
        {isSectionActive('workExperience') && hasArrayItems(safeCandidate.workExperience) && (
          <div className="cv-section">
            <h2>{getSectionTitle('workExperience')}</h2>
            <div className="timeline-container">
              {safeCandidate.workExperience.map((exp, index) => (
                <div key={index} className="timeline-item">
                  <h3>{exp.position || 'Position'}</h3>
                  <p className="company">{exp.company || 'Company'}</p>
                  <p className="duration">
                    {exp.startDate || 'Start Date'} - {exp.endDate || 'Present'}
                  </p>
                  <p className="description">{exp.description || ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {isSectionActive('education') && hasArrayItems(safeCandidate.education) && (
          <div className="cv-section">
            <h2>{getSectionTitle('education')}</h2>
            <div className="timeline-container">
              {safeCandidate.education.map((edu, index) => (
                <div key={index} className="timeline-item">
                  <h3>{edu.degree || 'Degree'}</h3>
                  <p className="school">{edu.school || 'School'}</p>
                  <p className="duration">
                    {edu.startDate || 'Start Date'} - {edu.endDate || 'Present'}
                  </p>
                  {edu.description && <p className="description">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {isSectionActive('skills') && hasArrayItems(safeCandidate.skills) && (
          <div className="cv-section">
            <h2>{getSectionTitle('skills')}</h2>
            <div className="non-timeline-section">
              <div className="skills">
                {safeCandidate.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Languages Section */}
        {isSectionActive('languages') && hasArrayItems(safeCandidate.languages) && (
          <div className="cv-section">
            <h2>{getSectionTitle('languages')}</h2>
            <div className="non-timeline-section">
              <div className="languages">
                {safeCandidate.languages.map((lang, index) => (
                  <div key={index} className="language-item">
                    <div className="language-header">
                      <span className="language">{lang.name || 'Language'}</span>
                      <span className="proficiency">{lang.proficiency || 'Proficiency'}</span>
                    </div>
                    <div className="language-bar">
                      <div 
                        className="language-progress" 
                        style={{
                          width: `${getLanguageProficiencyPercentage(lang.proficiency)}%`
                        }}
                      ></div>
                    </div>
                    {lang.description && <p className="description">{lang.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Projects Section */}
        {isSectionActive('projects') && hasArrayItems(safeCandidate.projects) && (
          <div className="cv-section">
            <h2>{getSectionTitle('projects')}</h2>
            <div className="timeline-container">
              {safeCandidate.projects.map((project, index) => (
                <div key={index} className="timeline-item">
                  <h3>{project.name || 'Project'}</h3>
                  <p className="duration">
                    {project.startDate || 'Start Date'} - {project.endDate || 'Present'}
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
          </div>
        )}

        {/* Certifications Section */}
        {isSectionActive('certifications') && hasArrayItems(safeCandidate.certifications) && (
          <div className="cv-section">
            <h2>{getSectionTitle('certifications')}</h2>
            <div className="timeline-container">
              {safeCandidate.certifications.map((cert, index) => (
                <div key={index} className="timeline-item">
                  <h3>{cert.name || 'Certification'}</h3>
                  <p className="issuer">{cert.issuer || 'Issuer'}</p>
                  <p className="date">{cert.date || ''}</p>
                  {cert.description && <p className="description">{cert.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests Section */}
        {isSectionActive('interests') && hasArrayItems(safeCandidate.interests) && (
          <div className="cv-section">
            <h2>{getSectionTitle('interests')}</h2>
            <div className="non-timeline-section">
              <div className="interests">
                {safeCandidate.interests.map((interest, index) => (
                  <span key={index} className="interest-tag">{interest}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* References Section */}
        {isSectionActive('references') && hasArrayItems(safeCandidate.references) && (
          <div className="cv-section">
            <h2>{getSectionTitle('references')}</h2>
            <div className="non-timeline-section">
              {safeCandidate.references.map((ref, index) => (
                <div key={index} className="reference-item" style={{marginBottom: '20px'}}>
                  <h3>{ref.name || 'Reference'}</h3>
                  <p className="position">{ref.position || 'Position'} {ref.company ? `at ${ref.company}` : ''}</p>
                  <p className="contact">
                    {ref.email && <span>Email: {ref.email}</span>}
                    {ref.phone && <span> | Phone: {ref.phone}</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="cv-actions print-hide">
          <Button 
            type="primary" 
            icon={<PrinterOutlined />} 
            onClick={handlePrint}
          >
            Print CV
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CVTemplate2;