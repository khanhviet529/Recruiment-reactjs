import html2canvas from 'html2canvas';
import { message } from 'antd';
import moment from 'moment';

/**
 * Exports a chart to an image file
 * @param {HTMLElement} chartRef - Reference to the chart DOM element
 * @param {string} filename - Name of the file to save (without extension)
 * @returns {Promise<boolean>} - True if export was successful
 */
const exportChartToImage = async (chartRef, filename) => {
  try {
    if (!chartRef) {
      message.error('Không thể tìm thấy biểu đồ để xuất');
      return false;
    }
    
    // Show loading message
    const loadingMessage = message.loading('Đang tạo hình ảnh...', 0);
    
    // Use html2canvas to capture the chart
    const canvas = await html2canvas(chartRef, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher scale for better quality
      logging: false,
      useCORS: true
    });
    
    // Convert canvas to PNG image
    const imgData = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = `${filename}-${moment().format('DD-MM-YYYY')}.png`;
    link.href = imgData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Close loading message and show success
    setTimeout(() => {
      loadingMessage();
      message.success('Xuất biểu đồ thành công!');
    }, 500);
    
    return true;
  } catch (error) {
    console.error('Error exporting chart:', error);
    message.error('Có lỗi xảy ra khi xuất biểu đồ');
    return false;
  }
};

/**
 * Creates a reference to a chart DOM element for later export
 * @param {React.RefObject} ref - React ref object to attach to chart
 * @param {HTMLElement} element - DOM element of the chart
 */
const setChartRef = (ref, element) => {
  if (ref) {
    ref.current = element;
  }
};

export { exportChartToImage, setChartRef }; 