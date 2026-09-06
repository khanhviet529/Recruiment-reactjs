import React, { useState, useEffect } from 'react';
import { Typography, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Image Viewer component for displaying images with click-to-preview functionality
 * No upload/delete functionality - only for viewing
 */
const ImageViewer = ({
  currentImageUrl = null, // Current image URL to display
  shape = 'circle', // 'circle' or 'square'
  size = 120, // Size in pixels
  placeholder = null // Placeholder text or element
}) => {
  const [imageUrl, setImageUrl] = useState(currentImageUrl);

  // Update imageUrl when currentImageUrl changes
  useEffect(() => {
    setImageUrl(currentImageUrl);
    console.log('ImageViewer useEffect - currentImageUrl:', currentImageUrl);
  }, [currentImageUrl]);

  // View image in new tab when clicked
  const handleImageClick = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  // Get placeholder content
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return <UserOutlined style={{ fontSize: size * 0.4 }} />;
  };

  return (
    <div className="image-viewer">
      <div className="image-display" style={{ textAlign: 'center' }}>
        {imageUrl ? (
          <Avatar
            src={imageUrl}
            size={size}
            shape={shape}
            style={{
              border: '3px solid #fff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onClick={handleImageClick}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          />
        ) : (
          <Avatar
            size={size}
            shape={shape}
            icon={getPlaceholder()}
            style={{
              backgroundColor: '#f0f0f0',
              color: '#bfbfbf',
              border: '2px dashed #d9d9d9'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ImageViewer; 