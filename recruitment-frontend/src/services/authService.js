import axios from 'axios';

const DATABASE_API_BASE = 'http://localhost:5000';

// Token expiration time (24 hours)
const TOKEN_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Create a simple mock login function that works with the database
const mockLogin = async (email, password) => {
  try {
    // Fetch users from the database
    const response = await axios.get(`${DATABASE_API_BASE}/users`);
    const users = response.data || [];
    
    // Find user with matching email and password
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }
    
    if (user.status !== 'active') {
      throw new Error('Tài khoản chưa được kích hoạt');
    }
    
    // Update user's lastLogin
    await axios.patch(`${DATABASE_API_BASE}/users/${user.id}`, {
      lastLogin: new Date().toISOString()
    });
    
    // Generate a simple token (in real app, this would be JWT from backend)
    const token = `mock_jwt_${user.id}_${Date.now()}`;
    
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified,
        status: user.status,
        name: user.email.split('@')[0] // Use email prefix as name for now
      },
      token
    };
  } catch (error) {
    console.error('MockLogin error:', error);
    throw error;
  }
};

// Register user
const register = async (userData) => {
  try {
    // Check if user already exists
    const existingUsers = await axios.get(`${DATABASE_API_BASE}/users`);
    const existingUser = existingUsers.data.find(u => u.email === userData.email);
    
    if (existingUser) {
      throw new Error('Email đã được sử dụng');
    }
    
    // Create new user
    const newUser = {
      id: Math.random().toString(36).substr(2, 4), // Simple ID generation
      email: userData.email,
      password: userData.password,
      phone: userData.phone || '',
      role: userData.role || 'candidate',
      isVerified: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      facebookId: '',
      googleId: ''
    };
    
    const response = await axios.post(`${DATABASE_API_BASE}/users`, newUser);
    
    if (response.data) {
      const userDataWithExpiration = {
        ...response.data,
        token: `mock_jwt_${response.data.id}_${Date.now()}`,
        expirationTime: new Date().getTime() + TOKEN_EXPIRATION_TIME
      };
      localStorage.setItem('user', JSON.stringify(userDataWithExpiration));
      return userDataWithExpiration;
    }
    
    return response.data;
  } catch (error) {
    console.error('AuthService: Registration error:', error);
    throw error;
  }
};

// Login user
const login = async (userData) => {
  try {
    const loginResponse = await mockLogin(userData.email, userData.password);
    
    if (loginResponse && loginResponse.user) {
      const userDataWithExpiration = {
        ...loginResponse.user,
        token: loginResponse.token,
        expirationTime: new Date().getTime() + TOKEN_EXPIRATION_TIME
      };
      localStorage.setItem('user', JSON.stringify(userDataWithExpiration));
      console.log('AuthService: User logged in successfully:', userDataWithExpiration.role);
      return userDataWithExpiration;
    }
    
    return loginResponse;
  } catch (error) {
    console.error('AuthService: Login error:', error);
    throw error;
  }
};

// Logout user
const logout = () => {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('AuthService: User logged out, localStorage cleared');
  } catch (error) {
    console.error('AuthService: Error during logout:', error);
  }
};

// Get current user
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.log('AuthService: No user data in localStorage');
      return null;
    }

    const user = JSON.parse(userStr);
    
    // Check if token is expired
    if (user.expirationTime && new Date().getTime() > user.expirationTime) {
      console.log('AuthService: Token expired, clearing user data');
      logout();
      return null;
    }
    
    console.log('AuthService: Current user retrieved:', user.role, user.name || user.email);
    return user;
  } catch (error) {
    console.error('AuthService: Error getting current user:', error);
    logout(); // Clear corrupted data
    return null;
  }
};

// Check if user is logged in
const isLoggedIn = () => {
  const user = getCurrentUser();
  const loggedIn = !!user;
  console.log('AuthService: Is logged in check:', loggedIn);
  return loggedIn;
};

// Check if user has a specific role
const hasRole = (role) => {
  const user = getCurrentUser();
  const hasRoleResult = user && user.role === role;
  console.log('AuthService: Role check', role, ':', hasRoleResult);
  return hasRoleResult;
};

// Get remaining time until token expiration
const getRemainingTime = () => {
  const user = getCurrentUser();
  if (!user || !user.expirationTime) return 0;
  
  const remainingTime = user.expirationTime - new Date().getTime();
  return remainingTime > 0 ? remainingTime : 0;
};

// Force refresh auth state (useful for debugging)
const refreshAuthState = () => {
  console.log('AuthService: Force refreshing auth state');
  const user = getCurrentUser();
  const isAuthenticated = isLoggedIn();
  console.log('AuthService: Refreshed state', { isAuthenticated, user: user?.role });
  return { user, isAuthenticated };
};

// Validate current session
const validateSession = () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log('AuthService: No valid session found');
      return false;
    }
    
    // Additional validation checks
    if (!user.role || !user.email) {
      console.log('AuthService: Invalid user data, clearing session');
      logout();
      return false;
    }
    
    console.log('AuthService: Session validated for', user.role);
    return true;
  } catch (error) {
    console.error('AuthService: Session validation error:', error);
    logout();
    return false;
  }
};

// Get auth token for API requests
const getAuthToken = () => {
  const user = getCurrentUser();
  return user?.token || null;
};

// Setup axios interceptor for authentication
const setupAxiosInterceptor = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.log('AuthService: Unauthorized request, logging out');
        logout();
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    }
  );
};

// Quick login function for testing (can be removed in production)
const quickLogin = async (role = 'candidate') => {
  try {
    const users = await axios.get(`${DATABASE_API_BASE}/users`);
    const user = users.data.find(u => u.role === role && u.status === 'active');
    
    if (!user) {
      throw new Error(`No active ${role} found in database`);
    }
    
    return await login({ email: user.email, password: user.password });
  } catch (error) {
    console.error('Quick login error:', error);
    throw error;
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isLoggedIn,
  hasRole,
  getRemainingTime,
  refreshAuthState,
  validateSession,
  getAuthToken,
  setupAxiosInterceptor,
  quickLogin // For testing purposes
};

export default authService;
