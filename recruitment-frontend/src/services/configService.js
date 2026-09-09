/**
 * Configuration service for the application
 * Manages global settings and environment variables
 */

// API configuration
const API_CONFIG = {
  baseUrl: 'http://localhost:5000',
  timeout: 30000, // 30 seconds
};

// Cloudinary configuration
const CLOUDINARY_CONFIG = {
  cloudName: 'dcpqt0gen', // Replace with your Cloudinary cloud name
  apiKey: '', // API Key is not needed for unsigned uploads
  uploadPresets: {
    pdf: 'upload-pdf',
    image: 'upload-image',
    video: 'upload-video'
  },
  resourceTypes: {
    pdf: 'raw',
    image: 'image',
    video: 'video'
  },
  maxFileSizes: {
    pdf: 5, // MB
    image: 2, // MB
    video: 10 // MB
  }
};

// Application configuration
const APP_CONFIG = {
  defaultPageSize: 10,
  dateFormat: 'DD/MM/YYYY',
  dateTimeFormat: 'DD/MM/YYYY HH:mm',
  applicationStatuses: {
    pending: 'pending',
    reviewing: 'reviewing',
    interviewing: 'interviewing',
    offered: 'offered',
    hired: 'hired',
    rejected: 'rejected',
    withdrawn: 'withdrawn'
  },
  applicationStatusNames: {
    pending: 'Chờ xử lý',
    reviewing: 'Đang xem xét',
    interviewing: 'Mời phỏng vấn',
    offered: 'Đề nghị việc làm',
    hired: 'Đã tuyển dụng',
    rejected: 'Từ chối',
    withdrawn: 'Đã rút hồ sơ'
  }
};

// Get the Cloudinary upload URL for a specific resource type
const getCloudinaryUploadUrl = (resourceType = 'image') => {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`;
};

// Get the appropriate upload preset for a file type
const getUploadPresetForFileType = (fileType) => {
  if (fileType === 'application/pdf' || fileType.endsWith('.pdf')) {
    return CLOUDINARY_CONFIG.uploadPresets.pdf;
  } else if (fileType.startsWith('image/')) {
    return CLOUDINARY_CONFIG.uploadPresets.image;
  } else if (fileType.startsWith('video/')) {
    return CLOUDINARY_CONFIG.uploadPresets.video;
  }
  return CLOUDINARY_CONFIG.uploadPresets.pdf; // Default to PDF preset
};

// Get the appropriate resource type for a file type
const getResourceTypeForFileType = (fileType) => {
  if (fileType === 'application/pdf' || fileType.endsWith('.pdf')) {
    return CLOUDINARY_CONFIG.resourceTypes.pdf;
  } else if (fileType.startsWith('image/')) {
    return CLOUDINARY_CONFIG.resourceTypes.image;
  } else if (fileType.startsWith('video/')) {
    return CLOUDINARY_CONFIG.resourceTypes.video;
  }
  return CLOUDINARY_CONFIG.resourceTypes.pdf; // Default to raw resource type
};

export {
  API_CONFIG,
  CLOUDINARY_CONFIG,
  APP_CONFIG,
  getCloudinaryUploadUrl,
  getUploadPresetForFileType,
  getResourceTypeForFileType
}; 