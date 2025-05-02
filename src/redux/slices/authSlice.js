import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Sửa URL endpoint cho JSON Server
const API_URL = 'http://localhost:5000';

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, phone, role, firstName, lastName }, { rejectWithValue }) => {
    try {
      // Kiểm tra xem email đã tồn tại chưa
      const existingUsers = await axios.get(`${API_URL}/users?email=${email}`);
      if (existingUsers.data.length > 0) {
        return rejectWithValue('Email đã được sử dụng');
      }

      // Tạo user mới (Trong JSON Server không có auth/register)
      const userData = {
        email,
        password,
        phone,
        role,
        isVerified: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Tạo user mới
      const userResponse = await axios.post(`${API_URL}/users`, userData);
      
      // Nếu là employer, tạo thêm record ở bảng employers
      if (role === 'employer') {
        const employerData = {
          userId: userResponse.data.id,
          companyName: '',
          description: '',
          verified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await axios.post(`${API_URL}/employers`, employerData);
      }
      
      // Nếu là candidate, tạo thêm record ở bảng candidates
      if (role === 'applicant') {
        const candidateData = {
          userId: userResponse.data.id,
          firstName: firstName,
          lastName: lastName,
          headline: '',
          summary: '',
          privacy: {
            showProfile: true,
            showContact: false,
            showEducation: true,
            showExperience: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await axios.post(`${API_URL}/candidates`, candidateData);
      }
      
      if (userResponse.data) {
        localStorage.setItem('user', JSON.stringify(userResponse.data));
      }
      
      return userResponse.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // JSON Server không có endpoint auth/login
      // Ta cần lọc users theo email và password
      const response = await axios.get(`${API_URL}/users?email=${email}`);
      
      if (response.data.length === 0) {
        return rejectWithValue('Email không tồn tại');
      }
      
      const user = response.data[0];
      
      // Kiểm tra password
      if (user.password !== password) {
        return rejectWithValue('Mật khẩu không chính xác');
      }

      // Kiểm tra status
      if (user.status !== 'active') {
        return rejectWithValue('Tài khoản chưa được kích hoạt');
      }
      
      // Tạo token giả (thực tế, JSON Server không hỗ trợ authentication)
      const token = btoa(JSON.stringify({ id: user.id, email: user.email }));
      
      // Cập nhật lastLogin
      await axios.patch(`${API_URL}/users/${user.id}`, {
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Lấy thêm thông tin employer hoặc candidate tùy theo role
      let userData = { ...user };
      
      if (user.role === 'employer') {
        const employerResponse = await axios.get(`${API_URL}/employers?userId=${user.id}`);
        if (employerResponse.data.length > 0) {
          userData.employerProfile = employerResponse.data[0];
        }
      } else if (user.role === 'candidate') {
        const candidateResponse = await axios.get(`${API_URL}/candidates?userId=${user.id}`);
        if (candidateResponse.data.length > 0) {
          userData.candidateProfile = candidateResponse.data[0];
        }
      }
      
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
      }
      
      return { user: userData, token };
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Forgot password
// Lưu ý: Trong thực tế, JSON Server không hỗ trợ chức năng này
// Đây chỉ là mô phỏng
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      // Kiểm tra xem email có tồn tại không
      const response = await axios.get(`${API_URL}/users?email=${email}`);
      
      if (response.data.length === 0) {
        return rejectWithValue('Email không tồn tại trong hệ thống');
      }
      
      const user = response.data[0];
      
      // Tạo token reset password giả
      const resetToken = Math.random().toString(36).substring(2, 15);
      const resetExpire = new Date(Date.now() + 3600000).toISOString(); // Token hết hạn sau 1 giờ
      
      // Cập nhật user với token reset password
      await axios.patch(`${API_URL}/users/${user.id}`, {
        resetPasswordToken: resetToken,
        resetPasswordExpire: resetExpire,
        updatedAt: new Date().toISOString()
      });
      
      // Thông báo gửi email reset password (mô phỏng)
      return { message: 'Email reset mật khẩu đã được gửi' };
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Reset password
// Lưu ý: Trong thực tế, JSON Server không hỗ trợ chức năng này
// Đây chỉ là mô phỏng
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      // Tìm user với token reset password
      const response = await axios.get(`${API_URL}/users?resetPasswordToken=${token}`);
      
      if (response.data.length === 0) {
        return rejectWithValue('Token không hợp lệ hoặc đã hết hạn');
      }
      
      const user = response.data[0];
      
      // Kiểm tra token có hết hạn chưa
      const expireDate = new Date(user.resetPasswordExpire);
      if (expireDate < new Date()) {
        return rejectWithValue('Token đã hết hạn');
      }
      
      // Cập nhật mật khẩu mới
      await axios.patch(`${API_URL}/users/${user.id}`, {
        password: password,
        resetPasswordToken: null,
        resetPasswordExpire: null,
        updatedAt: new Date().toISOString()
      });
      
      return { message: 'Mật khẩu đã được cập nhật thành công' };
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Logout user (client-side only)
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  return null;
});

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

const initialState = {
  user: user || null,
  token: token || null,
  isAuthenticated: !!user,
  loading: false,
  error: null,
  success: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.success = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.success = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;