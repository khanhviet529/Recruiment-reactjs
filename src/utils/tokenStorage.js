/**
 * Lớp quản lý token Agora
 * Lưu trữ và truy xuất token từ localStorage hoặc cookie
 */

// Tên khóa lưu trữ trong localStorage
const AGORA_TOKEN_KEY = 'agora_token';
const AGORA_TOKEN_EXPIRY_KEY = 'agora_token_expiry';

/**
 * Lưu token Agora vào localStorage
 * @param {string} token - Token Agora
 * @param {number} expiryTimeInMinutes - Thời gian hết hạn (phút)
 */
export const saveAgoraToken = (token, expiryTimeInMinutes = 60) => {
  if (!token) return;
  
  try {
    // Lưu token
    localStorage.setItem(AGORA_TOKEN_KEY, token);
    
    // Tính thời gian hết hạn và lưu
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + expiryTimeInMinutes);
    localStorage.setItem(AGORA_TOKEN_EXPIRY_KEY, expiryTime.toISOString());
    
    console.log(`Token Agora đã được lưu, hết hạn sau ${expiryTimeInMinutes} phút`);
  } catch (error) {
    console.error('Lỗi khi lưu token Agora:', error);
  }
};

/**
 * Lấy token Agora từ localStorage
 * @returns {string|null} Token Agora hoặc null nếu không tồn tại hoặc hết hạn
 */
export const getAgoraToken = () => {
  try {
    // Kiểm tra thời gian hết hạn
    const expiryTimeStr = localStorage.getItem(AGORA_TOKEN_EXPIRY_KEY);
    
    if (expiryTimeStr) {
      const expiryTime = new Date(expiryTimeStr);
      const now = new Date();
      
      // Nếu token đã hết hạn
      if (now > expiryTime) {
        console.log('Token Agora đã hết hạn');
        clearAgoraToken();
        return null;
      }
    }
    
    // Lấy token
    return localStorage.getItem(AGORA_TOKEN_KEY);
  } catch (error) {
    console.error('Lỗi khi lấy token Agora:', error);
    return null;
  }
};

/**
 * Xóa token Agora khỏi localStorage
 */
export const clearAgoraToken = () => {
  try {
    localStorage.removeItem(AGORA_TOKEN_KEY);
    localStorage.removeItem(AGORA_TOKEN_EXPIRY_KEY);
    console.log('Token Agora đã được xóa');
  } catch (error) {
    console.error('Lỗi khi xóa token Agora:', error);
  }
};

/**
 * Kiểm tra xem token Agora có tồn tại và còn hiệu lực không
 * @returns {boolean} true nếu token tồn tại và còn hiệu lực
 */
export const hasValidAgoraToken = () => {
  return getAgoraToken() !== null;
}; 