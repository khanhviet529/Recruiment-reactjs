import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import { message } from 'antd';

const generatePdfReport = (statsData, userChartData, jobChartData, applicationStats, timeToFillData, topEmployers, topJobs) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!statsData || !userChartData || !jobChartData || !applicationStats || !timeToFillData) {
      message.error('Thiếu dữ liệu cần thiết để tạo báo cáo PDF');
      return false;
    }

    // Tạo tài liệu PDF mới
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = moment().format('DD/MM/YYYY');
    
    // Thêm tiêu đề và ngày
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("BÁO CÁO TUYỂN DỤNG", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Ngày báo cáo: ${today}`, pageWidth / 2, 30, { align: "center" });
    
    // Thêm thống kê tổng hợp
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("TỔNG QUAN THỐNG KÊ", 14, 45);
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`1. Tổng số người dùng: ${statsData.users?.total || 0}`, 14, 55);
    doc.text(`   - Ứng viên: ${statsData.users?.candidates || 0}`, 14, 61);
    doc.text(`   - Nhà tuyển dụng: ${statsData.users?.employers || 0}`, 14, 67);
    doc.text(`   - Tỷ lệ tăng trưởng: ${statsData.users?.growth || 0}%`, 14, 73);
    
    doc.text(`2. Tin tuyển dụng:`, 14, 83);
    doc.text(`   - Tổng số tin: ${statsData.jobs?.total || 0}`, 14, 89);
    doc.text(`   - Đang hoạt động: ${statsData.jobs?.active || 0}`, 14, 95);
    doc.text(`   - Đơn ứng tuyển: ${statsData.jobs?.applications || 0}`, 14, 101);
    doc.text(`   - Tỷ lệ tăng trưởng: ${statsData.jobs?.growth || 0}%`, 14, 107);
    
    // Thêm thống kê trạng thái đơn ứng tuyển với bảng
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("TRẠNG THÁI ĐƠN ỨNG TUYỂN", 14, 122);
    
    // Tạo bảng thống kê đơn ứng tuyển
    const appStatsHeaders = [['Trạng thái', 'Số lượng', 'Tỷ lệ (%)']]
    const appStatsData = []
    
    if (applicationStats.labels && applicationStats.datasets && applicationStats.datasets[0] && applicationStats.datasets[0].data) {
      const totalApps = applicationStats.datasets[0].data.reduce((sum, val) => sum + (val || 0), 0) || 1;
      
      applicationStats.labels.forEach((label, idx) => {
        if (label) {
          const count = (applicationStats.datasets[0].data[idx] || 0);
          const percentage = ((count / totalApps) * 100).toFixed(1);
          appStatsData.push([label, count.toString(), percentage]);
        }
      });
    } else {
      appStatsData.push(['Không có dữ liệu', '0', '0']);
    }
    
    let lastTableEndY = 127;
    try {
      doc.autoTable({
        head: appStatsHeaders,
        body: appStatsData,
        startY: lastTableEndY,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [75, 75, 75] }
      });
      lastTableEndY = doc.lastAutoTable.finalY;
    } catch (tableError) {
      console.error("Lỗi tạo bảng:", tableError);
      lastTableEndY = 150;
    }
    
    // Phần nhà tuyển dụng hàng đầu
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("NHÀ TUYỂN DỤNG HÀNG ĐẦU", 14, lastTableEndY + 15);
    
    const employerHeaders = [['Tên công ty', 'Số tin đăng', 'Số đơn ứng tuyển']]
    const employerData = Array.isArray(topEmployers) && topEmployers.length > 0 
      ? topEmployers.slice(0, 5).map(employer => [
          employer.name || 'Không xác định',
          (employer.jobs || 0).toString(),
          (employer.applications || 0).toString()
        ])
      : [['Không có dữ liệu', '0', '0']];
    
    try {
      doc.autoTable({
        head: employerHeaders,
        body: employerData,
        startY: lastTableEndY + 20,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [75, 75, 75] }
      });
      lastTableEndY = doc.lastAutoTable.finalY;
    } catch (tableError) {
      console.error("Lỗi tạo bảng nhà tuyển dụng:", tableError);
      lastTableEndY += 50;
    }
    
    // Phần tin tuyển dụng hàng đầu
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("TIN TUYỂN DỤNG HÀNG ĐẦU", 14, lastTableEndY + 15);
    
    const jobHeaders = [['Tiêu đề', 'Công ty', 'Số đơn ứng tuyển']]
    const jobData = Array.isArray(topJobs) && topJobs.length > 0
      ? topJobs.slice(0, 5).map(job => [
          job.title || 'Không xác định',
          job.company || 'Không xác định',
          (job.applications || 0).toString()
        ])
      : [['Không có dữ liệu', 'Không có dữ liệu', '0']];
    
    try {
      doc.autoTable({
        head: jobHeaders,
        body: jobData,
        startY: lastTableEndY + 20,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [75, 75, 75] }
      });
      lastTableEndY = doc.lastAutoTable.finalY;
    } catch (tableError) {
      console.error("Lỗi tạo bảng tin tuyển dụng:", tableError);
      lastTableEndY += 50;
    }
    
    // Thêm trang mới cho chỉ số hiệu suất
    doc.addPage();
    
    // Chỉ số thời gian tuyển dụng
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("CHỈ SỐ HIỆU SUẤT TUYỂN DỤNG", 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`1. Thời gian tuyển dụng trung bình: ${timeToFillData.average || 0} ngày`, 14, 30);
    
    // Tạo bảng thời gian tuyển dụng theo ngành nếu có dữ liệu
    let ttfStartY = 35;
    if (timeToFillData.byIndustry && Array.isArray(timeToFillData.byIndustry) && timeToFillData.byIndustry.length > 0) {
      const ttfHeaders = [['Ngành nghề', 'Số ngày trung bình']]
      const ttfData = timeToFillData.byIndustry
        .filter(item => item && item.industry && item.averageDays !== undefined)
        .sort((a, b) => a.averageDays - b.averageDays)
        .slice(0, 8)
        .map(item => [
          item.industry,
          item.averageDays.toString()
        ]);
      
      if (ttfData.length > 0) {
        try {
          doc.autoTable({
            head: ttfHeaders,
            body: ttfData,
            startY: ttfStartY,
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [75, 75, 75] }
          });
          ttfStartY = doc.lastAutoTable.finalY;
        } catch (tableError) {
          console.error("Lỗi tạo bảng thời gian tuyển dụng:", tableError);
          ttfStartY = 50;
        }
      } else {
        ttfStartY = 50; // Điều chỉnh nếu không có dữ liệu
      }
    } else {
      ttfStartY = 50;
    }
    
    // Thêm gợi ý dựa trên phân tích dữ liệu
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("GỢI Ý CẢI THIỆN", 14, ttfStartY + 20);
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    
    let recommendationY = ttfStartY + 40;
    
    // Gợi ý tăng trưởng người dùng
    if (!statsData.users?.growth || statsData.users.growth < 5) {
      doc.text("1. Cải thiện tăng trưởng người dùng:", 14, recommendationY);
      doc.text("   - Tăng cường các chiến dịch marketing", 14, recommendationY + 6);
      doc.text("   - Cải thiện trải nghiệm người dùng", 14, recommendationY + 12);
      recommendationY += 18;
    }
    
    // Gợi ý đăng tin tuyển dụng
    if (!statsData.jobs?.growth || statsData.jobs.growth < 10) {
      const numRecommendation = (!statsData.users?.growth || statsData.users.growth < 5) ? "2" : "1";
      doc.text(`${numRecommendation}. Kích thích hoạt động đăng tin tuyển dụng:`, 14, recommendationY);
      doc.text("   - Cung cấp ưu đãi cho nhà tuyển dụng", 14, recommendationY + 6);
      doc.text("   - Đơn giản hóa quy trình đăng tin", 14, recommendationY + 12);
      recommendationY += 18;
    }
    
    // Gợi ý thời gian tuyển dụng
    if (!timeToFillData.average || timeToFillData.average > 25) {
      const userLowGrowth = (!statsData.users?.growth || statsData.users.growth < 5) ? 1 : 0;
      const jobLowGrowth = (!statsData.jobs?.growth || statsData.jobs.growth < 10) ? 1 : 0;
      const numRecommendation = userLowGrowth + jobLowGrowth + 1;
      
      doc.text(`${numRecommendation}. Giảm thời gian tuyển dụng:`, 14, recommendationY);
      doc.text("   - Tối ưu hóa quy trình sàng lọc hồ sơ", 14, recommendationY + 6);
      doc.text("   - Rút ngắn chu trình phỏng vấn", 14, recommendationY + 12);
    }
    
    // Lưu PDF
    doc.save(`bao-cao-tuyen-dung-${moment().format('DD-MM-YYYY')}.pdf`);
    message.success('Báo cáo đã được tạo thành công!');
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    message.error('Có lỗi xảy ra khi tạo báo cáo PDF');
    return false;
  }
};

export default generatePdfReport; 