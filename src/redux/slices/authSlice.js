import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { uploadImage, uploadFacebookProfileImage } from '../../services/fileService';

// Sửa URL endpoint cho JSON Server
const API_URL = 'http://localhost:5000';

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, phone, role, firstName, lastName, name, website, companySize, industry }, { rejectWithValue }) => {
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
          companyName: name,
          website: website,
          companySize: companySize,
          industry: industry,
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
  async ({ email, password, isAdmin, role }, { rejectWithValue }) => {
    try {
      // JSON Server không có endpoint auth/login
      // Ta cần lọc users theo email và password
      let endpoint = `${API_URL}/users?email=${email}`;
      
      // Check if role is specified for role-specific login
      if (role) {
        endpoint += `&role=${role}`;
      }
      
      // If it's admin login, validate that the user is an admin
      if (isAdmin) {
        endpoint += '&role=admin';
      }
      
      const response = await axios.get(endpoint);
      
      if (response.data.length === 0) {
        return rejectWithValue('Email không tồn tại hoặc không có quyền truy cập');
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
      
      // Kiểm tra vai trò nếu đang cố đăng nhập với vai trò cụ thể
      if (role && user.role !== role) {
        return rejectWithValue(`Tài khoản này không phải là ${role === 'employer' ? 'nhà tuyển dụng' : 'ứng viên'}`);
      }
      
      // Kiểm tra nếu đang cố đăng nhập admin
      if (isAdmin && user.role !== 'admin') {
        return rejectWithValue('Bạn không có quyền truy cập trang quản trị');
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
      } else if (user.role === 'applicant') {
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
  try {
    // Remove localStorage items
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('intended_role'); // Xóa vai trò dự định khi đăng xuất
    
    // Clear Google's session state cookies
    document.cookie = "g_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Try to reset active Google accounts if the API is available
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.cancel();
        console.log('Google account session reset');
      } catch (e) {
        console.log('Google account reset not applicable');
      }
    }
  } catch (error) {
    console.error('Error during logout:', error);
  }
  
  return null;
});

// Login with Facebook
export const loginWithFacebook = createAsyncThunk(
  'auth/loginWithFacebook',
  async (facebookData, { rejectWithValue }) => {
    try {
      // Facebook chỉ dành cho candidate
      const attemptedRole = 'applicant';
      
      // Xử lý ảnh đại diện
      let profilePictureUrl = facebookData.picture;
      try {
        const uploadResult = await uploadFacebookProfileImage(facebookData.picture, facebookData.userID);
        if (uploadResult.success) {
          profilePictureUrl = uploadResult.url;
        }
      } catch (error) {
        console.error('Lỗi upload ảnh:', error);
      }
      
      // Kiểm tra Facebook ID đã tồn tại chưa
      const facebookIdCheck = await axios.get(`${API_URL}/users?facebookId=${facebookData.userID}`);
      
      if (facebookIdCheck.data.length > 0) {
        const existingUser = facebookIdCheck.data[0];
        
        // Facebook chỉ cho phép đăng nhập với role applicant
        if (existingUser.role !== 'applicant') {
          return rejectWithValue('Tài khoản này không phải là ứng viên. Facebook chỉ dành cho ứng viên.');
        }
        
        // Cập nhật lastLogin
        await axios.patch(`${API_URL}/users/${existingUser.id}`, {
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        // Lấy candidate profile
        let userData = { ...existingUser };
        const candidateResponse = await axios.get(`${API_URL}/candidates?userId=${existingUser.id}`);
        if (candidateResponse.data.length > 0) {
          userData.candidateProfile = candidateResponse.data[0];
        }
        
        // Tạo token và lưu
        const token = btoa(JSON.stringify({ id: existingUser.id, email: existingUser.email }));
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        
        return { user: userData, token };
      }
      
      // Tạo tài khoản mới
      
      // Kiểm tra email
      const emailCheck = await axios.get(`${API_URL}/users?email=${facebookData.email}`);
      if (emailCheck.data.length > 0) {
        return rejectWithValue('Email này đã được sử dụng. Vui lòng dùng Facebook khác.');
      }
      
      // Tách tên
      const names = facebookData.name ? facebookData.name.split(' ') : ['', ''];
      const lastName = names.pop() || '';
      const firstName = names.join(' ') || '';
      
      // Tạo user mới
      const newUser = {
        email: facebookData.email,
        facebookId: facebookData.userID,
        "googleId": "",
        firstName: firstName,
        lastName: lastName,
        name: facebookData.name,
        role: attemptedRole,
        profilePicture: profilePictureUrl,
        isVerified: true,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      const userResponse = await axios.post(`${API_URL}/users`, newUser);
      const user = userResponse.data;
      
      // Tạo candidate profile
      const candidateData = {
        userId: user.id,
        firstName: firstName,
        lastName: lastName,
        headline: '',
        summary: '',
        avatar: profilePictureUrl,
        privacy: {
          showProfile: true,
          showContact: false,
          showEducation: true,
          showExperience: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const candidateResponse = await axios.post(`${API_URL}/candidates`, candidateData);
      user.candidateProfile = candidateResponse.data;
      
      // Tạo token và lưu
      const token = btoa(JSON.stringify({ id: user.id, email: user.email }));
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      return { user, token };
      
    } catch (error) {
      console.error('Lỗi đăng nhập Facebook:', error);
      return rejectWithValue(error.message || 'Đăng nhập Facebook thất bại');
    }
  }
);

// Login with Google
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (googleData, { rejectWithValue }) => {
    try {
      // Xác định role dựa trên URL hiện tại
      const currentPath = window.location.pathname;
      let intendedRole = 'applicant'; // mặc định
      
      if (currentPath.includes('/employer/login')) {
        intendedRole = 'employer';
      } else if (currentPath.includes('/candidate/login')) {
        intendedRole = 'applicant';
      }
      
      // Hoặc lấy từ googleData nếu đã truyền vào
      const attemptedRole = googleData.role || intendedRole;
      
      // Kiểm tra tài khoản Google đã tồn tại chưa
      const googleIdCheck = await axios.get(`${API_URL}/users?googleId=${googleData.sub}`);
      
      if (googleIdCheck.data.length > 0) {
        const existingUser = googleIdCheck.data[0];
        
        // Kiểm tra role có khớp không
        if (existingUser.role !== attemptedRole) {
          if (attemptedRole === 'employer') {
            return rejectWithValue('Tài khoản Google này đã được đăng ký là ứng viên. Vui lòng chuyển đến trang đăng nhập ứng viên.');
          } else {
            return rejectWithValue('Tài khoản Google này đã được đăng ký là nhà tuyển dụng. Vui lòng chuyển đến trang đăng nhập nhà tuyển dụng.');
          }
        }
        
        // Cập nhật lastLogin
        await axios.patch(`${API_URL}/users/${existingUser.id}`, {
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        // Lấy profile tương ứng với role
        let userData = { ...existingUser };
        
        if (existingUser.role === 'employer') {
          const employerResponse = await axios.get(`${API_URL}/employers?userId=${existingUser.id}`);
          if (employerResponse.data.length > 0) {
            userData.employerProfile = employerResponse.data[0];
          }
        } else {
          const candidateResponse = await axios.get(`${API_URL}/candidates?userId=${existingUser.id}`);
          if (candidateResponse.data.length > 0) {
            userData.candidateProfile = candidateResponse.data[0];
          }
        }
        
        // Tạo token và lưu vào localStorage
        const token = btoa(JSON.stringify({ id: existingUser.id, email: existingUser.email }));
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        
        return { user: userData, token };
      }
      
      // Tạo tài khoản mới nếu chưa tồn tại
      
      // Kiểm tra email đã được sử dụng chưa
      // const emailCheck = await axios.get(`${API_URL}/users?email=${googleData.email}`);
      // if (emailCheck.data.length > 0) {
      //   return rejectWithValue('Email này đã được sử dụng với tài khoản khác. Vui lòng sử dụng email khác.');
      // }
      
      // Tạo user mới
      const newUser = {
        email: googleData.email,
        googleId: googleData.sub,
        facebookId: "",
        firstName: googleData.given_name || '',
        lastName: googleData.family_name || '',
        name: googleData.name,
        role: attemptedRole,
        profilePicture: googleData.picture,
        isVerified: true,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      const userResponse = await axios.post(`${API_URL}/users`, newUser);
      const user = userResponse.data;
      
      // Tạo profile tương ứng với role
      if (attemptedRole === 'employer') {
        const employerData = {
          userId: user.id,
          companyName: `${user.name}'s Company`,
          logo: user.profilePicture,
          description: '',
          verified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const employerResponse = await axios.post(`${API_URL}/employers`, employerData);
        user.employerProfile = employerResponse.data;
      } else {
        const candidateData = {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          headline: '',
          summary: '',
          avatar: user.profilePicture,
          privacy: {
            showProfile: true,
            showContact: false,
            showEducation: true,
            showExperience: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const candidateResponse = await axios.post(`${API_URL}/candidates`, candidateData);
        user.candidateProfile = candidateResponse.data;
      }
      
      // Tạo token và lưu vào localStorage
      const token = btoa(JSON.stringify({ id: user.id, email: user.email }));
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      return { user, token };
      
    } catch (error) {
      console.error('Lỗi đăng nhập Google:', error);
      return rejectWithValue(error.message || 'Đăng nhập Google thất bại');
    }
  }
);

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
      })
      // Login with Facebook
      .addCase(loginWithFacebook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithFacebook.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.success = true;
      })
      .addCase(loginWithFacebook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Login with Google
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.success = true;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { reset } = authSlice.actions;

// Add selector
export const selectAuth = (state) => state.auth;

export default authSlice.reducer;