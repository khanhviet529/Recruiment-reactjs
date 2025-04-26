import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Tạo instance axios với cấu hình mặc định
const httpClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor để thêm token vào mỗi request
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
httpClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Xử lý các lỗi HTTP
      switch (error.response.status) {
        case 401:
          // Token hết hạn hoặc không hợp lệ
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Không có quyền truy cập
          console.error('Access denied');
          break;
        case 404:
          // Không tìm thấy resource
          console.error('Resource not found');
          break;
        case 500:
          // Lỗi server
          console.error('Server error');
          break;
        default:
          console.error('An error occurred');
      }
    }
    return Promise.reject(error);
  }
);

// Các phương thức HTTP cơ bản
const http = {
  // GET request
  get: async (url, params = {}) => {
    try {
      const response = await httpClient.get(url, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async (url, data = {}) => {
    try {
      const response = await httpClient.post(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (url, data = {}) => {
    try {
      const response = await httpClient.put(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  patch: async (url, data = {}) => {
    try {
      const response = await httpClient.patch(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (url) => {
    try {
      const response = await httpClient.delete(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Upload file
  upload: async (url, file, onProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await httpClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Download file
  download: async (url, filename) => {
    try {
      const response = await httpClient.get(url, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      throw error;
    }
  }
};

export default http; 