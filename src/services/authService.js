import http from './httpClient';

const authService = {
  // Đăng nhập
  login: async (email, password) => {
    try {
      // Kiểm tra user có tồn tại - sử dụng cú pháp đúng cho json-server
      const response = await http.get(`/users?email=${email}&password=${password}`);
      
      if (response && response.length > 0) {
        const user = response[0];
        // Lưu token vào localStorage (trong thực tế sẽ nhận JWT từ server)
        localStorage.setItem('token', 'dummy_token');
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
      throw new Error('Invalid credentials');
    } catch (error) {
      throw error;
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.replace('/');
  },

  // Đăng ký tài khoản ứng viên
  registerCandidate: async (data) => {
    try {
      // Tạo user
      const user = await http.post('/users', {
        email: data.email,
        password: data.password,
        role: 'candidate',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      });

      // Tạo profile
      await http.post('/userProfiles', {
        user_id: user.id,
        full_name: data.fullName,
        phone: data.phone,
        address: data.address,
        avatar_url: '',
        bio: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Tạo candidate
      await http.post('/candidates', {
        user_id: user.id,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        resume_url: '',
        years_of_experience: data.yearsOfExperience,
        education_level: data.educationLevel,
        title: data.title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      return user;
    } catch (error) {
      throw error;
    }
  },

  // Đăng ký tài khoản nhà tuyển dụng
  registerEmployer: async (data) => {
    try {
      // Tạo user
      const user = await http.post('/users', {
        email: data.email,
        password: data.password,
        role: 'employer',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      });

      // Tạo profile
      await http.post('/userProfiles', {
        user_id: user.id,
        full_name: data.fullName,
        phone: data.phone,
        address: data.address,
        avatar_url: '',
        bio: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Tạo employer
      await http.post('/employers', {
        user_id: user.id,
        company_name: data.companyName,
        company_logo: '',
        company_size: data.companySize,
        industry: data.industry,
        website: data.website,
        company_description: '',
        established_year: data.establishedYear,
        tax_code: data.taxCode,
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      return user;
    } catch (error) {
      throw error;
    }
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Kiểm tra role của người dùng
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.role || null;
  },

  // Redirect sau khi đăng nhập
  redirectAfterLogin: () => {
    const user = authService.getCurrentUser();
    if (!user) {
      console.error('No user found, redirecting to login');
      window.location.href = '/login';
      return;
    }

    // Chuyển về trang chủ sau khi đăng nhập
    window.location.replace('/');
  }
};

export default authService; 