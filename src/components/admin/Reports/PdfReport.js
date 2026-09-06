// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';
// import html2canvas from 'html2canvas';
// import moment from 'moment';
// import { message } from 'antd';

// // Cấu hình font tiếng Việt (sử dụng font mặc định hỗ trợ Unicode)
// const setupVietnameseFont = (doc) => {
//   // Sử dụng font Helvetica với encoding UTF-8
//   doc.setFont('helvetica');
  
//   // Kiểm tra xem autoTable có được thêm vào không
//   if (typeof doc.autoTable !== 'function') {
//     console.error('jspdf-autotable not loaded properly');
//     throw new Error('jspdf-autotable not available');
//   }
// };

// // Hàm vẽ header cho báo cáo
// const drawReportHeader = (doc) => {
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const today = moment().format('DD/MM/YYYY HH:mm');
  
//   // Background header
//   doc.setFillColor(41, 128, 185);
//   doc.rect(0, 0, pageWidth, 35, 'F');
  
//   // Logo placeholder (có thể thêm logo sau)
//   doc.setFillColor(255, 255, 255);
//   doc.circle(20, 17.5, 8, 'F');
//   doc.setTextColor(41, 128, 185);
//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'bold');
//   doc.text('HR', 16.5, 21);
  
//   // Tiêu đề chính
//   doc.setTextColor(255, 255, 255);
//   doc.setFontSize(20);
//   doc.setFont('helvetica', 'bold');
//   doc.text('BAO CAO TUYEN DUNG', pageWidth / 2, 15, { align: 'center' });
  
//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'normal');
//   doc.text(`Ngay bao cao: ${today}`, pageWidth / 2, 25, { align: 'center' });
  
//   return 45; // Trả về vị trí Y để tiếp tục vẽ content
// };

// // Hàm vẽ footer
// const drawFooter = (doc, pageNumber, totalPages) => {
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();
  
//   doc.setDrawColor(200, 200, 200);
//   doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);
  
//   doc.setTextColor(100, 100, 100);
//   doc.setFontSize(10);
//   doc.text(`Trang ${pageNumber} / ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
//   doc.text('He thong quan ly tuyen dung', 14, pageHeight - 10);
// };

// // Hàm vẽ section header
// const drawSectionHeader = (doc, title, yPosition, icon = '') => {
//   const pageWidth = doc.internal.pageSize.getWidth();
  
//   // Background cho section
//   doc.setFillColor(245, 245, 245);
//   doc.rect(14, yPosition - 5, pageWidth - 28, 15, 'F');
  
//   // Border trái
//   doc.setFillColor(52, 152, 219);
//   doc.rect(14, yPosition - 5, 3, 15, 'F');
  
//   doc.setTextColor(44, 62, 80);
//   doc.setFontSize(14);
//   doc.setFont('helvetica', 'bold');
//   doc.text(`${icon} ${title}`, 22, yPosition + 4);
  
//   return yPosition + 20;
// };

// // Hàm tạo thống kê tổng quan với card design
// const drawOverviewStats = (doc, statsData, startY) => {
//   const cardWidth = 45;
//   const cardHeight = 35;
//   const spacing = 10;
//   const startX = 14;
  
//   const stats = [
//     {
//       title: 'Tong nguoi dung',
//       value: statsData.users?.total || 0,
//       subtitle: `Tang truong: ${statsData.users?.growth || 0}%`,
//       color: [52, 152, 219],
//       icon: '👥'
//     },
//     {
//       title: 'Nha tuyen dung',
//       value: statsData.users?.employers || 0,
//       subtitle: `${statsData.users?.total > 0 ? Math.round(statsData.users.employers / statsData.users.total * 100) : 0}% tong so`,
//       color: [155, 89, 182],
//       icon: '🏢'
//     },
//     {
//       title: 'Tin tuyen dung',
//       value: statsData.jobs?.total || 0,
//       subtitle: `Hoat dong: ${statsData.jobs?.active || 0}`,
//       color: [46, 204, 113],
//       icon: '📋'
//     },
//     {
//       title: 'don ung tuyen',
//       value: statsData.jobs?.applications || 0,
//       subtitle: `TB: ${statsData.jobs?.total > 0 ? (statsData.jobs.applications / statsData.jobs.total).toFixed(1) : 0}/tin`,
//       color: [231, 76, 60],
//       icon: '📄'
//     }
//   ];
  
//   stats.forEach((stat, index) => {
//     const x = startX + (index * (cardWidth + spacing));
//     const y = startY;
    
//     // Card background
//     doc.setFillColor(255, 255, 255);
//     doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');
    
//     // Card border
//     doc.setDrawColor(230, 230, 230);
//     doc.setLineWidth(0.5);
//     doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'S');
    
//     // Icon background
//     doc.setFillColor(...stat.color);
//     doc.circle(x + 8, y + 8, 4, 'F');
    
//     // Icon (sử dụng text thay vì emoji để tương thích)
//     doc.setTextColor(255, 255, 255);
//     doc.setFontSize(8);
//     doc.text('●', x + 6, y + 10);
    
//     // Title
//     doc.setTextColor(100, 100, 100);
//     doc.setFontSize(8);
//     doc.setFont('helvetica', 'normal');
//     doc.text(stat.title, x + 2, y + 18, { maxWidth: cardWidth - 4 });
    
//     // Value
//     doc.setTextColor(44, 62, 80);
//     doc.setFontSize(16);
//     doc.setFont('helvetica', 'bold');
//     doc.text(stat.value.toString(), x + 2, y + 26);
    
//     // Subtitle
//     doc.setTextColor(120, 120, 120);
//     doc.setFontSize(7);
//     doc.setFont('helvetica', 'normal');
//     doc.text(stat.subtitle, x + 2, y + 32, { maxWidth: cardWidth - 4 });
//   });
  
//   return startY + cardHeight + 15;
// };

// // Hàm tạo bảng với thiết kế đẹp
// const createStyledTable = (doc, headers, data, startY, title = '') => {
//   if (title) {
//     doc.setTextColor(44, 62, 80);
//     doc.setFontSize(12);
//     doc.setFont('helvetica', 'bold');
//     doc.text(title, 14, startY);
//     startY += 10;
//   }
  
//   if (!data || data.length === 0) {
//     doc.setTextColor(150, 150, 150);
//     doc.setFontSize(10);
//     doc.text('Khong co du lieu', 14, startY + 10);
//     return startY + 25;
//   }
  
//   const finalY = doc.autoTable(doc, {
//     head: [headers],
//     body: data,
//     startY: startY,
//     theme: 'grid',
//     styles: {
//       fontSize: 9,
//       cellPadding: 4,
//       textColor: [44, 62, 80],
//       lineColor: [220, 220, 220],
//       lineWidth: 0.5
//     },
//     headStyles: {
//       fillColor: [52, 152, 219],
//       textColor: [255, 255, 255],
//       fontSize: 10,
//       fontStyle: 'bold',
//       halign: 'center'
//     },
//     alternateRowStyles: {
//       fillColor: [248, 249, 250]
//     },
//     columnStyles: {
//       0: { cellWidth: 'auto' },
//       1: { halign: 'center' },
//       2: { halign: 'center' }
//     },
//     margin: { left: 14, right: 14 }
//   });
  
//   return finalY + 10;
// };

// // Hàm tạo biểu đồ từ canvas (nếu có)
// const addChartToReport = async (doc, chartRef, title, yPosition) => {
//   if (!chartRef || !chartRef.current) {
//     return yPosition;
//   }
  
//   try {
//     const canvas = await html2canvas(chartRef.current, {
//       backgroundColor: '#ffffff',
//       scale: 2,
//       logging: false
//     });
    
//     const imgData = canvas.toDataURL('image/png');
//     const imgWidth = 180;
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
//     // Kiểm tra xem có đủ chỗ trong trang không
//     const pageHeight = doc.internal.pageSize.getHeight();
//     if (yPosition + imgHeight + 30 > pageHeight - 30) {
//       doc.addPage();
//       yPosition = drawReportHeader(doc);
//     }
    
//     if (title) {
//       yPosition = drawSectionHeader(doc, title, yPosition, '📊');
//     }
    
//     doc.addImage(imgData, 'PNG', 14, yPosition, imgWidth, imgHeight);
//     return yPosition + imgHeight + 15;
//   } catch (error) {
//     console.error('Error adding chart to report:', error);
//     return yPosition;
//   }
// };

// // Hàm tạo phân tích và gợi ý
// const drawAnalysisSection = (doc, statsData, timeToFillData, conversionData, startY) => {
//   let currentY = drawSectionHeader(doc, 'PHAN TICH & GOI Y', startY, '💡');
  
//   const pageWidth = doc.internal.pageSize.getWidth();
  
//   // Phân tích hiệu suất
//   doc.setTextColor(44, 62, 80);
//   doc.setFontSize(11);
//   doc.setFont('helvetica', 'bold');
//   doc.text('Hieu suat tuyen dung:', 14, currentY);
//   currentY += 8;
  
//   doc.setFont('helvetica', 'normal');
//   doc.setFontSize(9);
//   doc.setTextColor(80, 80, 80);
  
//   const analysisPoints = [];
  
//   // Phân tích tăng trưởng
//   if (statsData.users?.growth > 10) {
//     analysisPoints.push('✓ Tang truong nguoi dung tot (' + statsData.users.growth + '%)');
//   } else if (statsData.users?.growth < 5) {
//     analysisPoints.push('⚠ Tang truong nguoi dung cham (' + statsData.users.growth + '%)');
//   }
  
//   // Phân tích tỷ lệ ứng tuyển
//   const avgApplicationsPerJob = statsData.jobs?.total > 0 ? 
//     (statsData.jobs.applications / statsData.jobs.total).toFixed(1) : 0;
  
//   if (avgApplicationsPerJob > 10) {
//     analysisPoints.push('✓ Ty le ung tuyen cao (' + avgApplicationsPerJob + ' don/tin)');
//   } else if (avgApplicationsPerJob < 5) {
//     analysisPoints.push('⚠ Ty le ung tuyen thap (' + avgApplicationsPerJob + ' don/tin)');
//   }
  
//   // Phân tích thời gian tuyển dụng
//   if (timeToFillData?.average) {
//     if (timeToFillData.average <= 20) {
//       analysisPoints.push('✓ Thoi gian tuyen dung tot (' + timeToFillData.average + ' ngay)');
//     } else if (timeToFillData.average > 30) {
//       analysisPoints.push('⚠ Thoi gian tuyen dung dai (' + timeToFillData.average + ' ngay)');
//     }
//   }
  
//   analysisPoints.forEach(point => {
//     doc.text('• ' + point, 18, currentY);
//     currentY += 6;
//   });
  
//   currentY += 5;
  
//   // Gợi ý cải thiện
//   doc.setTextColor(44, 62, 80);
//   doc.setFontSize(11);
//   doc.setFont('helvetica', 'bold');
//   doc.text('Goi y cai thien:', 14, currentY);
//   currentY += 8;
  
//   doc.setFont('helvetica', 'normal');
//   doc.setFontSize(9);
//   doc.setTextColor(80, 80, 80);
  
//   const suggestions = [];
  
//   if (statsData.users?.growth < 5) {
//     suggestions.push('Tang cuong marketing de thu hut nguoi dung moi');
//   }
  
//   if (avgApplicationsPerJob < 5) {
//     suggestions.push('Cai thien mo ta cong viec de hap dan hon');
//     suggestions.push('Xem xet lai yeu cau cong viec co phu hop');
//   }
  
//   if (timeToFillData?.average > 30) {
//     suggestions.push('Rut ngan quy trinh danh gia ho so');
//     suggestions.push('Tang toc do phan hoi voi ung vien');
//   }
  
//   if (suggestions.length === 0) {
//     suggestions.push('Cac chi so dang o muc tot, tiep tuc duy tri');
//   }
  
//   suggestions.forEach((suggestion, index) => {
//     doc.text(`${index + 1}. ${suggestion}`, 18, currentY);
//     currentY += 6;
//   });
  
//   return currentY + 10;
// };

// // Hàm chính tạo báo cáo PDF
// const generatePdfReport = async (
//   statsData, 
//   userChartData, 
//   jobChartData, 
//   applicationStats, 
//   timeToFillData, 
//   topEmployers, 
//   topJobs,
//   conversionData = null,
//   chartRefs = null
// ) => {
//   try {
//     // Kiểm tra dữ liệu đầu vào
//     if (!statsData) {
//       message.error('Thieu du lieu thong ke de tao bao cao');
//       return false;
//     }

//     const doc = new jsPDF();
//     setupVietnameseFont(doc);
    
//     let currentY = drawReportHeader(doc);
    
//     // Thống kê tổng quan
//     currentY = drawOverviewStats(doc, statsData, currentY);
    
//     // Trạng thái đơn ứng tuyển
//     if (applicationStats?.labels && applicationStats?.datasets?.[0]?.data) {
//       currentY = drawSectionHeader(doc, 'TRANG THAI DON UNG TUYEN', currentY, '📊');
      
//       const totalApps = applicationStats.datasets[0].data.reduce((sum, val) => sum + (val || 0), 0) || 1;
//       const appStatsData = applicationStats.labels.map((label, idx) => {
//         const count = applicationStats.datasets[0].data[idx] || 0;
//         const percentage = ((count / totalApps) * 100).toFixed(1);
//         return [label, count.toString(), percentage + '%'];
//       });
      
//       currentY = createStyledTable(
//         doc,
//         ['Trang thai', 'So luong', 'Ty le'],
//         appStatsData,
//         currentY
//       );
//     }
    
//     // Nhà tuyển dụng hàng đầu
//     if (topEmployers && topEmployers.length > 0) {
//       currentY = drawSectionHeader(doc, 'NHA TUYEN DUNG HANG DAU', currentY, '🏆');
      
//       const employerData = topEmployers.slice(0, 5).map((employer, index) => [
//         `${index + 1}. ${employer.name || 'Khong xac dinh'}`,
//         (employer.jobs || 0).toString(),
//         (employer.applications || 0).toString()
//       ]);
      
//       currentY = createStyledTable(
//         doc,
//         ['Cong ty', 'Tin dang', 'Don ung tuyen'],
//         employerData,
//         currentY
//       );
//     }
    
//     // Tin tuyển dụng hàng đầu
//     if (topJobs && topJobs.length > 0) {
//       // Kiểm tra xem có cần trang mới không
//       const pageHeight = doc.internal.pageSize.getHeight();
//       if (currentY > pageHeight - 80) {
//         doc.addPage();
//         currentY = drawReportHeader(doc);
//       }
      
//       currentY = drawSectionHeader(doc, 'TIN TUYEN DUNG HANG DAU', currentY, '⭐');
      
//       const jobData = topJobs.slice(0, 5).map((job, index) => [
//         `${index + 1}. ${job.title || 'Khong xac dinh'}`,
//         job.company || 'Khong xac dinh',
//         (job.applications || 0).toString()
//       ]);
      
//       currentY = createStyledTable(
//         doc,
//         ['Tieu de', 'Cong ty', 'Don ung tuyen'],
//         jobData,
//         currentY
//       );
//     }
    
//     // Thêm trang mới cho phân tích
//     doc.addPage();
//     currentY = drawReportHeader(doc);
    
//     // Phân tích và gợi ý
//     currentY = drawAnalysisSection(doc, statsData, timeToFillData, conversionData, currentY);
    
//     // Thêm biểu đồ nếu có
//     if (chartRefs) {
//       if (chartRefs.userChart) {
//         doc.addPage();
//         currentY = drawReportHeader(doc);
//         currentY = await addChartToReport(doc, chartRefs.userChart, 'BIEU DO NGUOI DUNG', currentY);
//       }
      
//       if (chartRefs.jobChart) {
//         doc.addPage();
//         currentY = drawReportHeader(doc);
//         currentY = await addChartToReport(doc, chartRefs.jobChart, 'BIEU DO TIN TUYEN DUNG', currentY);
//       }
//     }
    
//     // Thêm footer cho tất cả các trang
//     const totalPages = doc.internal.getNumberOfPages();
//     for (let i = 1; i <= totalPages; i++) {
//       doc.setPage(i);
//       drawFooter(doc, i, totalPages);
//     }
    
//     // Lưu file
//     const fileName = `bao-cao-tuyen-dung-${moment().format('YYYY-MM-DD-HHmm')}.pdf`;
//     doc.save(fileName);
    
//     message.success('Bao cao da duoc tao thanh cong!');
//     return true;
    
//   } catch (error) {
//     console.error('Error generating PDF report:', error);
//     message.error('Co loi xay ra khi tao bao cao: ' + error.message);
//     return false;
//   }
// };

// export default generatePdfReport; 