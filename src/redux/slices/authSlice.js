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
// export const loginWithFacebook = createAsyncThunk(
//   'auth/loginWithFacebook',
//   async (facebookData, { rejectWithValue }) => {
//     try {
//       // Vai trò luôn là 'applicant' cho đăng nhập Facebook theo yêu cầu
//       const attemptedRole = 'applicant';
//       facebookData.role = attemptedRole;
      
//       // Xử lý ảnh đại diện Facebook nếu có
//       let profilePictureUrl = null;
      
//       // Cố gắng lấy ảnh chất lượng cao sử dụng hàm chuyên dụng
//       try {
//         console.log('Đang xử lý ảnh đại diện Facebook');
        
//         // Nếu có fbGraphUrl, sử dụng đó làm nguồn chính
//         let bestPictureUrl = facebookData.fbGraphUrl 
//           ? facebookData.fbGraphUrl.replace('&redirect=false', '') // Đảm bảo nó chuyển hướng
//           : facebookData.picture;
        
//         // Sử dụng hàm chuyên dụng để xử lý ảnh Facebook
//         const uploadResult = await uploadFacebookProfileImage(bestPictureUrl, facebookData.userID);
        
//         if (uploadResult.success) {
//           profilePictureUrl = uploadResult.url;
//           console.log('Tải lên ảnh đại diện Facebook thành công:', profilePictureUrl);
//         } else {
//           console.warn('Không thể tải lên ảnh đại diện, sử dụng URL gốc:', uploadResult.error);
          
//           // Thử URL thay thế nếu có
//           if (facebookData.picture && (!profilePictureUrl || uploadResult.error)) {
//             const alternateUploadResult = await uploadFacebookProfileImage(
//               facebookData.picture, 
//               facebookData.userID
//             );
            
//             if (alternateUploadResult.success) {
//               profilePictureUrl = alternateUploadResult.url;
//               console.log('Tải lên ảnh thay thế thành công:', profilePictureUrl);
//             } else {
//               // Phương án cuối cùng, sử dụng URL gốc
//               profilePictureUrl = facebookData.picture;
//             }
//           }
//         }
//       } catch (uploadError) {
//         console.error('Lỗi xử lý ảnh đại diện:', uploadError);
//         profilePictureUrl = facebookData.picture;
//       }

//       // Kiểm tra xem tài khoản Facebook này đã tồn tại chưa
//       const facebookIdCheck = await axios.get(`${API_URL}/users?facebookId=${facebookData.userID}`);
      
//       // Nếu ID Facebook tồn tại, người dùng đang đăng nhập (không phải đăng ký)
//       if (facebookIdCheck.data.length > 0) {
//         const existingUser = facebookIdCheck.data[0];
        
//         // Nếu đang cố gắng đăng nhập trang admin, kiểm tra quyền
//         if (facebookData.isAdmin && existingUser.role !== 'admin') {
//           return rejectWithValue('Bạn không có quyền truy cập trang quản trị');
//         }
        
//         // Đăng nhập Facebook chỉ dành cho ứng viên, kiểm tra vai trò
//         if (existingUser.role !== 'applicant') {
//           return rejectWithValue('Tài khoản Facebook này đã được đăng ký với vai trò khác. Facebook chỉ có thể dùng để đăng nhập ứng viên.');
//         }
        
//         // Cập nhật thông tin đăng nhập gần nhất
//         await axios.patch(`${API_URL}/users/${existingUser.id}`, {
//           lastLogin: new Date().toISOString(),
//           updatedAt: new Date().toISOString()
//         });
        
//         // Lấy thông tin user đã cập nhật
//         const updatedUserResponse = await axios.get(`${API_URL}/users/${existingUser.id}`);
//         const updatedUser = updatedUserResponse.data;
        
//         // Lấy thêm thông tin profile
//         let userData = { ...updatedUser };
        
//         // Lấy profile ứng viên
//         const candidateResponse = await axios.get(`${API_URL}/candidates?userId=${updatedUser.id}`);
//         if (candidateResponse.data.length > 0) {
//           userData.candidateProfile = candidateResponse.data[0];
//         } else {
//           // Nếu không tìm thấy profile ứng viên, tạo mới
//           const names = facebookData.name ? facebookData.name.split(' ') : ['', ''];
//           const lastName = names.pop() || '';
//           const firstName = names.join(' ') || '';
          
//           const candidateData = {
//             userId: updatedUser.id,
//             firstName: firstName,
//             lastName: lastName,
//             headline: '',
//             summary: '',
//             avatar: profilePictureUrl,
//             privacy: {
//               showProfile: true,
//               showContact: false,
//               showEducation: true,
//               showExperience: true
//             },
//             createdAt: new Date().toISOString(),
//             updatedAt: new Date().toISOString()
//           };
          
//           const newCandidateResponse = await axios.post(`${API_URL}/candidates`, candidateData);
//           userData.candidateProfile = newCandidateResponse.data;
//           console.log('Đã tạo hồ sơ ứng viên mới cho người dùng hiện có');
//         }
        
//         // Tạo token giả
//         const token = btoa(JSON.stringify({ id: updatedUser.id, email: updatedUser.email }));
        
//         // Lưu thông tin vào localStorage
//         localStorage.setItem('user', JSON.stringify(userData));
//         localStorage.setItem('token', token);
        
//         return { user: userData, token };
//       }
      
//       // Không tìm thấy ID Facebook hiện có, đây là đăng ký mới
      
//       // Nếu là đăng nhập admin thì không cho phép tạo tài khoản mới
//       if (facebookData.isAdmin) {
//         return rejectWithValue('Tài khoản admin không tồn tại');
//       }
      
//       // Kiểm tra xem email đã được sử dụng với tài khoản Google chưa
//       const emailCheck = await axios.get(`${API_URL}/users?email=${facebookData.email}`);
//       if (emailCheck.data.length > 0) {
//         const existingUser = emailCheck.data[0];
        
//         // Nếu email đã tồn tại với tài khoản Google, ngăn đăng nhập
//         if (existingUser.googleId) {
//           return rejectWithValue('Email này đã được đăng ký với tài khoản Google. Vui lòng sử dụng tài khoản Facebook khác hoặc đăng nhập bằng Google.');
//         }
        
//         // Nếu email tồn tại với tài khoản thông thường, cũng là vấn đề
//         return rejectWithValue('Email này đã được sử dụng để đăng ký một tài khoản khác. Vui lòng sử dụng tài khoản Facebook khác.');
//       }
      
//       // Đối với Facebook, vai trò luôn là 'applicant'
//       const userRole = attemptedRole;
      
//       // Tạo user mới từ thông tin Facebook
//       const names = facebookData.name ? facebookData.name.split(' ') : ['', ''];
//       const lastName = names.pop() || '';
//       const firstName = names.join(' ') || '';
      
//       // Tạo dữ liệu user mới
//       const newUser = {
//         email: facebookData.email,
//         facebookId: facebookData.userID,
//         picture: profilePictureUrl,
//         firstName: firstName, 
//         lastName: lastName,
//         name: facebookData.name,
//         role: userRole,
//         profilePicture: profilePictureUrl,
//         isVerified: true,
//         status: 'active',
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         lastLogin: new Date().toISOString()
//       };
      
//       // Tạo user mới trong DB
//       const userResponse = await axios.post(`${API_URL}/users`, newUser);
//       const user = userResponse.data;
      
//       // Luôn tạo profile ứng viên cho đăng nhập Facebook
//       // Tạo profile ứng viên
//       const candidateData = {
//         userId: user.id,
//         firstName: firstName,
//         lastName: lastName,
//         headline: '',
//         summary: '',
//         avatar: profilePictureUrl,
//         privacy: {
//           showProfile: true,
//           showContact: false,
//           showEducation: true,
//           showExperience: true
//         },
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString()
//       };
      
//       const candidateResponse = await axios.post(`${API_URL}/candidates`, candidateData);
//       user.candidateProfile = candidateResponse.data;
      
//       // Lấy thêm thông tin profile
//       let userData = { ...user };
      
//       // Tạo token giả
//       const token = btoa(JSON.stringify({ id: user.id, email: user.email }));
      
//       // Lưu thông tin vào localStorage
//       localStorage.setItem('user', JSON.stringify(userData));
//       localStorage.setItem('token', token);
      
//       return { user: userData, token };
//     } catch (error) {
//       console.error('Lỗi đăng nhập Facebook:', error);
//       return rejectWithValue(
//         error.response && error.response.data.message
//           ? error.response.data.message
//           : 'Đăng nhập với Facebook thất bại. Vui lòng thử lại sau.'
//       );
//     }
//   }
// );

// Login with Google
// export const loginWithGoogle = createAsyncThunk(
//   'auth/loginWithGoogle',
//   async (googleData, { rejectWithValue }) => {
//     try {
//       // Lấy URL hình ảnh hồ sơ
//       const profilePictureUrl = googleData.picture;
      
//       // Lấy vai trò dự định từ yêu cầu đăng nhập
//       const attemptedRole = googleData.role || 'applicant';

//       // Kiểm tra xem tài khoản Google này đã tồn tại chưa
//       const googleIdCheck = await axios.get(`${API_URL}/users?googleId=${googleData.sub}`);
      
//       // Nếu tài khoản Google đã tồn tại
//       if (googleIdCheck.data.length > 0) {
//         const existingUser = googleIdCheck.data[0];
        
//         // Nếu đang cố gắng đăng nhập trang admin, kiểm tra quyền
//         if (googleData.isAdmin && existingUser.role !== 'admin') {
//           return rejectWithValue('Bạn không có quyền truy cập trang quản trị');
//         }
        
//         // Kiểm tra nếu tài khoản Google đã tồn tại nhưng với vai trò khác
//         if (existingUser.role !== attemptedRole) {
//           if (attemptedRole === 'employer') {
//             return rejectWithValue('Tài khoản Google này đã được đăng ký với vai trò ứng viên. Vui lòng sử dụng tài khoản Google khác để đăng ký nhà tuyển dụng.');
//           } else if (attemptedRole === 'applicant') {
//             return rejectWithValue('Tài khoản Google này đã được đăng ký với vai trò nhà tuyển dụng. Vui lòng sử dụng tài khoản Google khác để đăng ký ứng viên.');
//           } else {
//             return rejectWithValue(`Tài khoản Google này đã được đăng ký với vai trò ${existingUser.role}. Vui lòng sử dụng tài khoản Google khác.`);
//           }
//         }
        
//         // Cập nhật thông tin đăng nhập gần nhất
//         await axios.patch(`${API_URL}/users/${existingUser.id}`, {
//           lastLogin: new Date().toISOString(),
//           updatedAt: new Date().toISOString()
//         });
        
//         // Lấy thông tin user đã cập nhật
//         const updatedUserResponse = await axios.get(`${API_URL}/users/${existingUser.id}`);
//         const updatedUser = updatedUserResponse.data;
        
//         // Lấy thêm thông tin profile
//         let userData = { ...updatedUser };
        
//         // Lấy profile phù hợp theo vai trò
//         if (updatedUser.role === 'employer') {
//           const employerResponse = await axios.get(`${API_URL}/employers?userId=${updatedUser.id}`);
//           if (employerResponse.data.length > 0) {
//             userData.employerProfile = employerResponse.data[0];
//           } else {
//             // Nếu có tài khoản employer nhưng không có profile, tạo profile mới
//             const companyName = googleData.name || `${googleData.given_name || ''} ${googleData.family_name || ''}'s Company`;
            
//             const employerData = {
//               userId: updatedUser.id,
//               companyName: companyName,
//               logo: profilePictureUrl,
//               description: '',
//               verified: false,
//               createdAt: new Date().toISOString(),
//               updatedAt: new Date().toISOString()
//             };
            
//             const newEmployerResponse = await axios.post(`${API_URL}/employers`, employerData);
//             userData.employerProfile = newEmployerResponse.data;
//           }
//         } else if (updatedUser.role === 'applicant') {
//           const candidateResponse = await axios.get(`${API_URL}/candidates?userId=${updatedUser.id}`);
//           if (candidateResponse.data.length > 0) {
//             userData.candidateProfile = candidateResponse.data[0];
//           } else {
//             // Nếu có tài khoản applicant nhưng không có profile, tạo profile mới
//             const firstName = googleData.given_name || '';
//             const lastName = googleData.family_name || '';
            
//             const candidateData = {
//               userId: updatedUser.id,
//               firstName: firstName,
//               lastName: lastName,
//               headline: '',
//               summary: '',
//               avatar: profilePictureUrl,
//               privacy: {
//                 showProfile: true,
//                 showContact: false,
//                 showEducation: true,
//                 showExperience: true
//               },
//               createdAt: new Date().toISOString(),
//               updatedAt: new Date().toISOString()
//             };
            
//             const newCandidateResponse = await axios.post(`${API_URL}/candidates`, candidateData);
//             userData.candidateProfile = newCandidateResponse.data;
//           }
//         }
        
//         // Tạo token giả
//         const token = btoa(JSON.stringify({ id: updatedUser.id, email: updatedUser.email }));
        
//         // Lưu thông tin vào localStorage
//         localStorage.setItem('user', JSON.stringify(userData));
//         localStorage.setItem('token', token);
        
//         return { user: userData, token };
//       }
      
//       // Tài khoản Google chưa tồn tại, đây là đăng ký mới
      
//       // Nếu là đăng nhập admin thì không cho phép tạo tài khoản mới
//       if (googleData.isAdmin) {
//         return rejectWithValue('Tài khoản admin không tồn tại');
//       }
      
//       // Kiểm tra xem email đã được sử dụng với tài khoản Facebook chưa
//       const emailCheck = await axios.get(`${API_URL}/users?email=${googleData.email}`);
//       if (emailCheck.data.length > 0) {
//         const existingUser = emailCheck.data[0];
        
//         // Nếu email đã tồn tại với tài khoản Facebook, ngăn đăng nhập
//         if (existingUser.facebookId) {
//           return rejectWithValue('Email này đã được đăng ký với tài khoản Facebook. Vui lòng sử dụng tài khoản Google khác hoặc đăng nhập bằng Facebook.');
//         }
        
//         // Nếu email tồn tại với tài khoản thông thường, cũng là vấn đề
//         return rejectWithValue('Email này đã được sử dụng để đăng ký một tài khoản khác. Vui lòng sử dụng tài khoản Google khác.');
//       }
      
//       // Lấy vai trò từ dữ liệu Google, mặc định là 'applicant' nếu không có
//       const userRole = attemptedRole;
      
//       // Tạo user mới từ thông tin Google
//       const firstName = googleData.given_name || '';
//       const lastName = googleData.family_name || '';
      
//       // Tạo dữ liệu user mới
//       const newUser = {
//         email: googleData.email,
//         googleId: googleData.sub,
//         picture: profilePictureUrl,
//         firstName: firstName,
//         lastName: lastName,
//         name: googleData.name,
//         role: userRole,
//         profilePicture: profilePictureUrl,
//         isVerified: true,
//         status: 'active',
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         lastLogin: new Date().toISOString()
//       };
      
//       // Tạo user mới trong DB
//       const userResponse = await axios.post(`${API_URL}/users`, newUser);
//       const user = userResponse.data;
      
//       // Tạo profile phù hợp dựa trên vai trò
//       if (userRole === 'applicant') {
//         // Tạo profile ứng viên
//         const candidateData = {
//           userId: user.id,
//           firstName: firstName,
//           lastName: lastName,
//           headline: '',
//           summary: '',
//           avatar: profilePictureUrl,
//           privacy: {
//             showProfile: true,
//             showContact: false,
//             showEducation: true,
//             showExperience: true
//           },
//           createdAt: new Date().toISOString(),
//           updatedAt: new Date().toISOString()
//         };
        
//         const candidateResponse = await axios.post(`${API_URL}/candidates`, candidateData);
//         user.candidateProfile = candidateResponse.data;
//       } else if (userRole === 'employer') {
//         // Tạo profile nhà tuyển dụng
//         const companyName = googleData.name || `${firstName} ${lastName}'s Company`;
        
//         const employerData = {
//           userId: user.id,
//           companyName: companyName,
//           logo: profilePictureUrl,
//           description: '',
//           verified: false,
//           createdAt: new Date().toISOString(),
//           updatedAt: new Date().toISOString()
//         };
        
//         const employerResponse = await axios.post(`${API_URL}/employers`, employerData);
//         user.employerProfile = employerResponse.data;
//       }
      
//       // Lấy thêm thông tin profile
//       let userData = { ...user };
      
//       // Tạo token giả
//       const token = btoa(JSON.stringify({ id: user.id, email: user.email }));
      
//       // Lưu thông tin vào localStorage
//       localStorage.setItem('user', JSON.stringify(userData));
//       localStorage.setItem('token', token);
      
//       return { user: userData, token };
//     } catch (error) {
//       console.error('Lỗi đăng nhập Google:', error);
//       return rejectWithValue(
//         error.response && error.response.data.message
//           ? error.response.data.message
//           : 'Đăng nhập với Google thất bại. Vui lòng thử lại sau.'
//       );
//     }
//   }
// );
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
export default authSlice.reducer;