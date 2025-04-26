# API Guidelines

## 1. Cấu trúc API Service

### 1.1. Tổ chức file
- Tất cả các API calls được định nghĩa trong thư mục `src/services`
- Mỗi module API nên có một file riêng (ví dụ: `auth.js`, `jobs.js`, `users.js`)
- File `api.js` chứa các hàm utility và cấu hình chung

### 1.2. Cấu hình cơ bản
```javascript
const API_URL = 'http://localhost:5000';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};
```

## 2. Quy tắc đặt tên

### 2.1. Tên hàm
- Sử dụng camelCase
- Bắt đầu bằng động từ mô tả hành động
- Ví dụ: `getUserProfile`, `updateJobPost`, `deleteApplication`

### 2.2. Tên biến
- Sử dụng camelCase cho biến thông thường
- Sử dụng UPPER_SNAKE_CASE cho hằng số
- Ví dụ: `userData`, `API_ENDPOINT`

## 3. Xử lý Request

### 3.1. Cấu trúc request
```javascript
const makeRequest = async (endpoint, options = {}) => {
  const defaultOptions = {
    method: 'GET',
    headers: DEFAULT_HEADERS,
    credentials: 'include'
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...defaultOptions,
    ...options
  });

  return response;
};
```

### 3.2. Xử lý response
- Luôn kiểm tra status code
- Parse response thành JSON
- Xử lý lỗi một cách nhất quán

```javascript
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};
```

## 4. Error Handling

### 4.1. Cấu trúc lỗi
```javascript
class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}
```

### 4.2. Xử lý lỗi
- Sử dụng try-catch blocks
- Log lỗi ra console trong môi trường development
- Trả về thông báo lỗi thân thiện với người dùng

```javascript
try {
  const response = await makeRequest('/endpoint');
  return await handleResponse(response);
} catch (error) {
  console.error('API Error:', error);
  throw new APIError(
    error.message || 'An error occurred',
    error.status || 500,
    error.data || null
  );
}
```

## 5. Authentication

### 5.1. Token Management
- Lưu token trong localStorage hoặc cookies
- Tự động thêm token vào headers
- Xử lý token hết hạn

```javascript
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` } : DEFAULT_HEADERS;
};
```

## 6. Data Validation

### 6.1. Request Validation
- Validate dữ liệu trước khi gửi request
- Sử dụng schema validation khi cần thiết
- Trả về lỗi rõ ràng khi validation thất bại

### 6.2. Response Validation
- Kiểm tra cấu trúc dữ liệu trả về
- Xử lý các trường hợp dữ liệu không hợp lệ

## 7. Caching

### 7.1. Cache Strategy
- Sử dụng cache cho dữ liệu ít thay đổi
- Implement cache invalidation khi cần thiết
- Clear cache khi user logout

```javascript
const cache = new Map();

const getCachedData = async (key, fetchFn) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = await fetchFn();
  cache.set(key, data);
  return data;
};
```

## 8. Testing

### 8.1. Unit Tests
- Viết test cho mỗi API function
- Mock network requests
- Test error cases

### 8.2. Integration Tests
- Test flow hoàn chỉnh
- Test authentication
- Test error handling

## 9. Documentation

### 9.1. Code Comments
- Document mỗi API function
- Mô tả parameters và return values
- Ghi chú về error cases

```javascript
/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.role - User role (candidate/employer)
 * @returns {Promise<Object>} - Registration result
 * @throws {APIError} - If registration fails
 */
```

## 10. Performance

### 10.1. Request Optimization
- Sử dụng pagination cho large datasets
- Implement request debouncing
- Sử dụng batch requests khi cần thiết

### 10.2. Response Optimization
- Chỉ request những fields cần thiết
- Sử dụng compression khi cần
- Implement response caching

## 11. Security

### 11.1. Data Protection
- Không gửi sensitive data trong URL
- Sử dụng HTTPS
- Sanitize user input

### 11.2. Authentication
- Implement rate limiting
- Xử lý session timeout
- Bảo vệ API endpoints

## 12. Monitoring

### 12.1. Logging
- Log tất cả API requests
- Track response times
- Monitor error rates

### 12.2. Analytics
- Track API usage
- Monitor performance metrics
- Identify bottlenecks 