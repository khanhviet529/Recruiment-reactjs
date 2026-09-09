import defaultAvatar from '../assets/images/default-avatar.svg';
import defaultCompanyLogo from '../assets/images/default-company-logo.svg';

// Ảnh mặc định.
// Trước đây COVER_IMAGE trỏ tới via.placeholder.com — dịch vụ này đã ngừng
// hoạt động nên mọi ảnh bìa đều bị lỗi. Nay dùng ảnh nằm trong public/image.
export const DEFAULT_IMAGES = {
  AVATAR: defaultAvatar,
  COMPANY_LOGO: defaultCompanyLogo,
  COVER_IMAGE: '/image/default-cover.jpg',
  EMPTY_STATE: '/image/empty-state.jpg',
  NOT_FOUND: '/image/not-found.jpg'
};

// Get default image based on type
export const getDefaultImage = (type) => {
  switch (type) {
    case 'avatar':
      return DEFAULT_IMAGES.AVATAR;
    case 'company-logo':
      return DEFAULT_IMAGES.COMPANY_LOGO;
    case 'cover':
      return DEFAULT_IMAGES.COVER_IMAGE;
    default:
      return DEFAULT_IMAGES.AVATAR;
  }
};

// Check if image URL is a default/placeholder image
export const isDefaultImage = (imageUrl) => {
  if (!imageUrl) return true;
  
  return Object.values(DEFAULT_IMAGES).some(defaultUrl => 
    imageUrl.includes(defaultUrl) || 
    imageUrl.includes('placeholder') ||
    imageUrl.includes('via.placeholder.com')
  );
};

// Get image URL with fallback to default
export const getImageWithFallback = (imageUrl, type = 'avatar') => {
  return imageUrl && !isDefaultImage(imageUrl) ? imageUrl : getDefaultImage(type);
}; 