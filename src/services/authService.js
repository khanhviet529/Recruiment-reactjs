import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/auth';
const API_URL = 'http://localhost:5000/user';

// Token expiration time (24 hours)
const TOKEN_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Register user
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  
  if (response.data) {
    const userDataWithExpiration = {
      ...response.data,
      expirationTime: new Date().getTime() + TOKEN_EXPIRATION_TIME
    };
    localStorage.setItem('user', JSON.stringify(userDataWithExpiration));
  }
  
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  
  if (response.data) {
    const userDataWithExpiration = {
      ...response.data,
      expirationTime: new Date().getTime() + TOKEN_EXPIRATION_TIME
    };
    localStorage.setItem('user', JSON.stringify(userDataWithExpiration));
  }
  
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get current user
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  const user = JSON.parse(userStr);
  
  // Check if token is expired
  if (user.expirationTime && new Date().getTime() > user.expirationTime) {
    logout();
    return null;
  }
  
  return user;
};

// Check if user is logged in
const isLoggedIn = () => {
  const user = getCurrentUser();
  return !!user;
};

// Check if user has a specific role
const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

// Get remaining time until token expiration
const getRemainingTime = () => {
  const user = getCurrentUser();
  if (!user || !user.expirationTime) return 0;
  
  const remainingTime = user.expirationTime - new Date().getTime();
  return remainingTime > 0 ? remainingTime : 0;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isLoggedIn,
  hasRole,
  getRemainingTime
};

export default authService;
