// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Authentication Configuration
export const AUTH_CONFIG = {
  tokenKey: 'auth_token',
  userKey: 'user_data',
  tokenExpiryKey: 'token_expiry'
};

// Job Configuration
export const JOB_CONFIG = {
  itemsPerPage: 10,
  maxSalary: 1000000000, // 1 tỷ
  minSalary: 0,
  salarySteps: [
    { value: 0, label: 'Thỏa thuận' },
    { value: 5000000, label: '5 triệu' },
    { value: 10000000, label: '10 triệu' },
    { value: 15000000, label: '15 triệu' },
    { value: 20000000, label: '20 triệu' },
    { value: 25000000, label: '25 triệu' },
    { value: 30000000, label: '30 triệu' },
    { value: 40000000, label: '40 triệu' },
    { value: 50000000, label: '50 triệu' },
    { value: 100000000, label: '100 triệu' }
  ],
  experienceLevels: [
    { value: 'intern', label: 'Thực tập sinh' },
    { value: 'fresher', label: 'Mới tốt nghiệp' },
    { value: 'junior', label: 'Junior (< 2 năm)' },
    { value: 'middle', label: 'Middle (2-5 năm)' },
    { value: 'senior', label: 'Senior (> 5 năm)' }
  ],
  jobTypes: [
    { value: 'fulltime', label: 'Toàn thời gian' },
    { value: 'parttime', label: 'Bán thời gian' },
    { value: 'internship', label: 'Thực tập' },
    { value: 'freelance', label: 'Tự do' }
  ]
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  maxFiles: 5
};

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
};

// Date Format Configuration
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';

// Currency Configuration
export const CURRENCY_CONFIG = {
  symbol: 'đ',
  format: 'vi-VN',
  options: {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }
}; 