import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import moment from 'moment';
import { message } from 'antd';

// Hàm chuyển đổi tiếng Việt có dấu sang không dấu
const removeVietnameseTones = (str) => {
  const accentsMap = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A', 'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
    'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
    'Đ': 'D'
  };
  
  return str.replace(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/g, function(match) {
    return accentsMap[match] || match;
  });
};

// Hàm vẽ header cho báo cáo
const drawReportHeader = (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = moment().format('DD/MM/YYYY HH:mm');
  
  // Background header
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Tiêu đề chính
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(removeVietnameseTones('BÁO CÁO TUYỂN DỤNG'), pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(removeVietnameseTones(`Ngày báo cáo: ${today}`), pageWidth / 2, 25, { align: 'center' });
  
  return 45;
};

// Hàm vẽ footer
const drawFooter = (doc, pageNumber, totalPages) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setDrawColor(200, 200, 200);
  doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(`Trang ${pageNumber} / ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
  doc.text(removeVietnameseTones('Hệ thống quản lý tuyển dụng'), 14, pageHeight - 10);
};

// Hàm vẽ section header
const drawSectionHeader = (doc, title, yPosition) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Background cho section
  doc.setFillColor(245, 245, 245);
  doc.rect(14, yPosition - 5, pageWidth - 28, 15, 'F');
  
  // Border trái
  doc.setFillColor(52, 152, 219);
  doc.rect(14, yPosition - 5, 3, 15, 'F');
  
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(removeVietnameseTones(title), 22, yPosition + 4);
  
  return yPosition + 20;
};

// Hàm tạo thống kê tổng quan
const drawOverviewStats = (doc, statsData, startY) => {
  const stats = [
    { label: removeVietnameseTones('Tổng người dùng'), value: statsData.users?.total || 0 },
    { label: removeVietnameseTones('Nhà tuyển dụng'), value: statsData.users?.employers || 0 },
    { label: removeVietnameseTones('Tin tuyển dụng'), value: statsData.jobs?.total || 0 },
    { label: removeVietnameseTones('Đơn ứng tuyển'), value: statsData.jobs?.applications || 0 }
  ];
  
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  let currentY = startY;
  stats.forEach((stat, index) => {
    doc.text(`${stat.label}: ${stat.value}`, 20, currentY);
    currentY += 8;
  });
  
  return currentY + 10;
};

// Hàm tạo bảng đơn giản
const drawSimpleTable = (doc, title, headers, data, startY) => {
  if (!data || data.length === 0) {
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.text(removeVietnameseTones('Không có dữ liệu'), 14, startY + 10);
    return startY + 25;
  }
  
  let currentY = startY;
  
  // Tiêu đề bảng
  if (title) {
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(removeVietnameseTones(title), 14, currentY);
    currentY += 15;
  }
  
  // Headers
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(52, 152, 219);
  doc.rect(14, currentY - 8, 180, 12, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  let xPos = 20;
  // Tạo độ rộng cột linh hoạt cho tên công ty
  const colWidths = headers.length === 3 ? [90, 45, 45] : Array(headers.length).fill(180 / headers.length);
  
  headers.forEach((header, index) => {
    const xPosition = index === 0 ? xPos : xPos + colWidths.slice(0, index).reduce((sum, width) => sum + width, 0);
    doc.text(removeVietnameseTones(header), xPosition, currentY - 2);
  });
  
  currentY += 8;
  
  // Data rows
  doc.setTextColor(44, 62, 80);
  doc.setFont('helvetica', 'normal');
  
  data.slice(0, 10).forEach((row, rowIndex) => {
    // Alternate row background
    if (rowIndex % 2 === 1) {
      doc.setFillColor(248, 249, 250);
      doc.rect(14, currentY - 6, 180, 10, 'F');
    }
    
    row.forEach((cell, colIndex) => {
      // Cột đầu tiên (tên công ty) hiển thị dài hơn
      const maxLength = colIndex === 0 ? 50 : 25;
      const text = removeVietnameseTones(String(cell)).substring(0, maxLength);
      const xPosition = colIndex === 0 ? xPos : xPos + colWidths.slice(0, colIndex).reduce((sum, width) => sum + width, 0);
      doc.text(text, xPosition, currentY);
    });
    
    currentY += 10;
  });
  
  return currentY + 10;
};

// Hàm chính tạo báo cáo PDF
const generatePdfReportSimple = async (
  statsData, 
  userChartData, 
  jobChartData, 
  applicationStats, 
  timeToFillData, 
  topEmployers, 
  topJobs,
  conversionData = null,
  chartRefs = null
) => {
  try {
    if (!statsData) {
      message.error('Thiếu dữ liệu thống kê để tạo báo cáo');
      return false;
    }

    const doc = new jsPDF();
    doc.setFont('helvetica');
    
    let currentY = drawReportHeader(doc);
    
    // Thống kê tổng quan
    currentY = drawSectionHeader(doc, 'TỔNG QUAN THỐNG KÊ', currentY);
    currentY = drawOverviewStats(doc, statsData, currentY);
    
    // Trạng thái đơn ứng tuyển
    if (applicationStats?.labels && applicationStats?.datasets?.[0]?.data) {
      currentY = drawSectionHeader(doc, 'TRẠNG THÁI ĐỚN ỨNG TUYỂN', currentY);
      
      const totalApps = applicationStats.datasets[0].data.reduce((sum, val) => sum + (val || 0), 0) || 1;
      
      // Chuyển đổi tên trạng thái sang tiếng Việt không dấu
      const statusMapping = {
        'Đã nộp': 'Da nop',
        'Đang xem xét': 'Dang xem xet', 
        'Đã phỏng vấn': 'Da phong van',
        'Đã nhận': 'Da nhan',
        'Đã từ chối': 'Da tu choi',
        'Pending': 'Cho xu ly',
        'Reviewing': 'Dang xem xet',
        'Interviewed': 'Da phong van',
        'Accepted': 'Da chap nhan',
        'Rejected': 'Da tu choi'
      };
      
      const appStatsData = applicationStats.labels.map((label, idx) => {
        const count = applicationStats.datasets[0].data[idx] || 0;
        const percentage = ((count / totalApps) * 100).toFixed(1);
        const vietnameseLabel = statusMapping[label] || removeVietnameseTones(label);
        return [vietnameseLabel, count.toString(), percentage + '%'];
      });
      
      currentY = drawSimpleTable(
        doc,
        '',
        ['Trạng thái', 'Số lượng', 'Tỷ lệ'],
        appStatsData,
        currentY
      );
    }
    
    // Kiểm tra xem có cần trang mới không
    const pageHeight = doc.internal.pageSize.getHeight();
    if (currentY > pageHeight - 100) {
      doc.addPage();
      currentY = drawReportHeader(doc);
    }
    
    // Nhà tuyển dụng hàng đầu
    if (topEmployers && topEmployers.length > 0) {
      currentY = drawSectionHeader(doc, 'NHÀ TUYỂN DỤNG HÀNG ĐẦU', currentY);
      
      const employerData = topEmployers.slice(0, 5).map((employer, index) => [
        `${index + 1}. ${removeVietnameseTones(employer.name || 'Không xác định')}`,
        (employer.jobs || 0).toString(),
        (employer.applications || 0).toString()
      ]);
      
      currentY = drawSimpleTable(
        doc,
        '',
        ['Công ty', 'Tin đăng', 'Đơn ứng tuyển'],
        employerData,
        currentY
      );
    }
    
    // Tin tuyển dụng hàng đầu
    if (topJobs && topJobs.length > 0) {
      if (currentY > pageHeight - 80) {
        doc.addPage();
        currentY = drawReportHeader(doc);
      }
      
      currentY = drawSectionHeader(doc, 'TIN TUYỂN DỤNG HÀNG ĐẦU', currentY);
      
      const jobData = topJobs.slice(0, 5).map((job, index) => [
        `${index + 1}. ${removeVietnameseTones(job.title || 'Không xác định')}`,
        removeVietnameseTones(job.company || 'Không xác định'),
        (job.applications || 0).toString()
      ]);
      
      currentY = drawSimpleTable(
        doc,
        '',
        ['Tiêu đề', 'Công ty', 'Đơn ứng tuyển'],
        jobData,
        currentY
      );
    }
    
    // Thêm trang mới cho phân tích
    doc.addPage();
    currentY = drawReportHeader(doc);
    
    // Phân tích và gợi ý
    currentY = drawSectionHeader(doc, 'PHÂN TÍCH & GỢI Ý', currentY);
    
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(removeVietnameseTones('Tình hình hoạt động hệ thống:'), 14, currentY);
    currentY += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    
    // Phân tích tăng trưởng
    if (statsData.users?.growth > 10) {
      doc.text(removeVietnameseTones('+ Hệ thống thu hút người dùng tốt (') + (statsData.users.growth || 0) + removeVietnameseTones('% tăng trưởng)'), 18, currentY);
    } else if (statsData.users?.growth < 5) {
      doc.text(removeVietnameseTones('- Cần tăng cường marketing hệ thống (') + (statsData.users.growth || 0) + removeVietnameseTones('% tăng trưởng)'), 18, currentY);
    } else {
      doc.text(removeVietnameseTones('= Hệ thống phát triển ổn định (') + (statsData.users.growth || 0) + removeVietnameseTones('% tăng trưởng)'), 18, currentY);
    }
    currentY += 8;
    
    // Phân tích tỷ lệ ứng tuyển
    const avgApplicationsPerJob = statsData.jobs?.total > 0 ? 
      (statsData.jobs.applications / statsData.jobs.total).toFixed(1) : 0;
    
    if (avgApplicationsPerJob > 10) {
      doc.text(removeVietnameseTones('+ Hiệu quả kết nối cao (') + avgApplicationsPerJob + removeVietnameseTones(' đơn/tin)'), 18, currentY);
    } else if (avgApplicationsPerJob < 5) {
      doc.text(removeVietnameseTones('- Cần cải thiện chất lượng tin đăng (') + avgApplicationsPerJob + removeVietnameseTones(' đơn/tin)'), 18, currentY);
    } else {
      doc.text(removeVietnameseTones('= Hiệu quả kết nối ổn định (') + avgApplicationsPerJob + removeVietnameseTones(' đơn/tin)'), 18, currentY);
    }
    currentY += 8;
    
    // Phân tích thời gian tuyển dụng
    if (timeToFillData?.average) {
      if (timeToFillData.average <= 20) {
        doc.text(removeVietnameseTones('+ Quy trình tuyển dụng hiệu quả (') + timeToFillData.average + removeVietnameseTones(' ngày)'), 18, currentY);
      } else if (timeToFillData.average > 30) {
        doc.text(removeVietnameseTones('- Quy trình cần tối ưu hóa (') + timeToFillData.average + removeVietnameseTones(' ngày)'), 18, currentY);
      } else {
        doc.text(removeVietnameseTones('= Quy trình hoạt động bình thường (') + timeToFillData.average + removeVietnameseTones(' ngày)'), 18, currentY);
      }
    }
    currentY += 15;
    
    // Gợi ý cải thiện
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(removeVietnameseTones('Khuyến nghị quản lý hệ thống:'), 14, currentY);
    currentY += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    
    if ((statsData.users?.growth || 0) < 5) {
      doc.text(removeVietnameseTones('• Triển khai chiến dịch quảng bá hệ thống'), 18, currentY);
      currentY += 8;
      doc.text(removeVietnameseTones('• Phân tích nguyên nhân tăng trưởng chậm'), 18, currentY);
      currentY += 8;
    }
    
    if (avgApplicationsPerJob < 5) {
      doc.text(removeVietnameseTones('• Tăng cường kiểm duyệt chất lượng tin đăng'), 18, currentY);
      currentY += 8;
      doc.text(removeVietnameseTones('• Hướng dẫn nhà tuyển dụng tối ưu tin đăng'), 18, currentY);
      currentY += 8;
    }
    
    if (timeToFillData?.average > 30) {
      doc.text(removeVietnameseTones('• Tối ưu hóa giao diện và trải nghiệm người dùng'), 18, currentY);
      currentY += 8;
      doc.text(removeVietnameseTones('• Cải thiện thuật toán gợi ý việc làm'), 18, currentY);
      currentY += 8;
    }
    
    doc.text(removeVietnameseTones('• Thiết lập hệ thống cảnh báo và giám sát'), 18, currentY);
    currentY += 8;
    doc.text(removeVietnameseTones('• Phát triển tính năng mới dựa trên phản hồi'), 18, currentY);
    currentY += 8;
    doc.text(removeVietnameseTones('• Tăng cường bảo mật và hiệu suất hệ thống'), 18, currentY);
    
    // Thêm footer cho tất cả các trang
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawFooter(doc, i, totalPages);
    }
    
    // Lưu file
    const fileName = `bao-cao-tuyen-dung-${moment().format('YYYY-MM-DD-HHmm')}.pdf`;
    doc.save(fileName);
    
    message.success('Báo cáo đã được tạo thành công!');
    return true;
    
  } catch (error) {
    console.error('Error generating PDF report:', error);
    message.error('Có lỗi xảy ra khi tạo báo cáo: ' + error.message);
    return false;
  }
};

export default generatePdfReportSimple; 