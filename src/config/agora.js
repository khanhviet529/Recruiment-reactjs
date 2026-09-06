export const AGORA_CONFIG = {
  API_BASE_URL: process.env.REACT_APP_AGORA_API_URL || 'http://localhost:3001/api',
  APP_ID: process.env.REACT_APP_AGORA_APP_ID || '4634eb2bb9ba449ebd2f54a2d4811689',
  TOKEN_EXPIRY_TIME: 3600,
  RTM_TOKEN_EXPIRY_TIME: 3600
};

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  AGORA_BACKEND_URL: process.env.REACT_APP_AGORA_BACKEND_URL || 'http://localhost:3001/api'
};

export default AGORA_CONFIG; 