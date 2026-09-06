import React, { useState, useEffect } from 'react';
import { Upload, Button, Progress, message, Space, Typography, Avatar } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { uploadImage } from '../../services/fileService';
import { CLOUDINARY_CONFIG } from '../../services/configService';
import './ImageUploader.scss';

const { Text } = Typography;

/**
 * Image Uploader component for handling image uploads to Cloudinary
 */
const ImageUploader = ({
  onUploadSuccess,
  onUploadError,
  maxSize = CLOUDINARY_CONFIG.maxFileSizes.image, // Maximum file size in MB
  disabled = false,
  isProfilePicture = true, // Enable profile picture optimizations
  currentImageUrl = null, // Current image URL to display
  shape = 'circle', // 'circle' or 'square'
  size = 120, // Size in pixels
  placeholder = null // Placeholder text or element
}) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [previewUrl, setPreviewUrl] = useState(null); // For immediate preview

  // Update imageUrl when currentImageUrl changes (only if no uploaded image exists)
  useEffect(() => {
    // Only update if we don't have a successfully uploaded image
    if (!imageUrl || imageUrl === currentImageUrl) {
      setImageUrl(currentImageUrl);
    }
    console.log('ImageUploader useEffect - currentImageUrl:', currentImageUrl, 'imageUrl:', imageUrl);
  }, [currentImageUrl]);

  // Validate file
  const validateFile = (file) => {
    if (!file) return 'Vui lòng chọn file để tải lên';
    
    const isImage = file.type.startsWith('image/');
    if (!isImage) return 'Chỉ chấp nhận file hình ảnh (JPG, PNG, GIF, WebP)';
    
    if (file.size > maxSize * 1024 * 1024) return `Kích thước file vượt quá ${maxSize}MB`;
    
    return null;
  };

  // Handle file selection with immediate preview
  const handleFileChange = (info) => {
    const fileObj = info.file.originFileObj || info.file;
    setFile(fileObj);
    setFileName(fileObj.name);
    setError('');
    setSuccess(false);
    
    // Create preview URL immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(fileObj);
    
    // Auto-upload after file selection
    setTimeout(() => {
      uploadToCloudinary(fileObj);
    }, 100);
  };

  // Upload to Cloudinary
  const uploadToCloudinary = async (fileToUpload = file) => {
    setIsUploading(true);
    setProgress(0);
    setError('');
    
    // Validate file before uploading
    const validationError = validateFile(fileToUpload);
    if (validationError) {
      setError(validationError);
      setIsUploading(false);
      return;
    }
    
    try {
      console.log('Uploading image to Cloudinary...');
      
      // Upload using the fileService
      const result = await uploadImage(
        fileToUpload,
        (progressPercent) => {
          setProgress(progressPercent);
        },
        {
          isProfilePicture: isProfilePicture
        }
      );
      
      // Handle upload result
      if (result.success && result.url) {
        console.log('Image uploaded successfully:', result.url);
        
        // Set the uploaded image URL with priority
        setImageUrl(result.url);
        setPreviewUrl(null); // Clear preview, use actual uploaded image
        setSuccess(true);
        message.success('Tải ảnh lên thành công!');
        
        console.log('ImageUploader - Upload success, imageUrl set to:', result.url);
        
        // Notify parent component
        if (onUploadSuccess) {
          onUploadSuccess({
            url: result.url,
            publicId: result.publicId,
            data: result.data,
            name: fileToUpload.name,
            type: fileToUpload.type,
            size: fileToUpload.size
          });
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Đã xảy ra lỗi khi tải lên. Vui lòng thử lại sau.');
      setPreviewUrl(null); // Clear preview on error
      message.error('Tải ảnh lên thất bại!');
      
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setFileName('');
    setImageUrl(null);
    setPreviewUrl(null);
    setSuccess(false);
    setError('');
    setProgress(0);
  };

  // View uploaded image
  const handleViewImage = () => {
    const urlToView = previewUrl || imageUrl;
    if (urlToView) {
      window.open(urlToView, '_blank');
    }
  };

  // Get the image to display (priority: preview > uploaded > current)
  const getDisplayImage = () => {
    const displayUrl = previewUrl || imageUrl || currentImageUrl;
    console.log('ImageUploader getDisplayImage - previewUrl:', previewUrl, 'imageUrl:', imageUrl, 'currentImageUrl:', currentImageUrl, 'final:', displayUrl);
    return displayUrl;
  };

  // Get placeholder content
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return <UserOutlined style={{ fontSize: size * 0.4 }} />;
  };

  return (
    <div className="image-uploader">
      <Space direction="vertical" align="center" style={{ width: '100%' }}>
        {/* Image Display */}
        <div className="image-display" style={{ position: 'relative' }}>
          {getDisplayImage() ? (
            <div style={{ position: 'relative' }}>
              <Avatar
                src={getDisplayImage()}
                size={size}
                shape={shape}
                style={{
                  border: '3px solid #fff',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  opacity: isUploading ? 0.7 : 1,
                  transition: 'opacity 0.3s'
                }}
              />
              {/* Loading overlay */}
              {isUploading && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10
                  }}
                >
                  <div
                    className="spinner-border text-primary"
                    style={{ width: '2rem', height: '2rem' }}
                  >
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              )}
            </div>
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

        {/* Upload Button */}
        <Upload
          name="image"
          multiple={false}
          showUploadList={false}
          beforeUpload={(file) => {
            handleFileChange({ file });
            return false; // Prevent automatic upload
          }}
          accept="image/*"
          disabled={isUploading || disabled}
        >
          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={isUploading}
            disabled={isUploading || disabled}
            size="small"
          >
            {isUploading ? 'Đang tải...' : (previewUrl ? 'Đang xử lý...' : 'Đổi ảnh')}
          </Button>
        </Upload>

        {/* Progress Bar */}
        {isUploading && (
          <Progress
            percent={progress}
            status="active"
            style={{ width: '100%', maxWidth: '200px' }}
            size="small"
          />
        )}

        {/* Status Messages */}
        {previewUrl && !isUploading && (
          <Text type="success" style={{ fontSize: '12px' }}>
            ✓ Ảnh đã chọn, đang tải lên...
          </Text>
        )}

        {error && (
          <Text type="danger" style={{ fontSize: '12px', textAlign: 'center' }}>
            {error}
          </Text>
        )}

        {success && imageUrl && !isUploading && (
          <Text type="success" style={{ fontSize: '12px' }}>
            ✓ Đã tải lên thành công
          </Text>
        )}

        {/* File name display */}
        {fileName && (
          <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {fileName}
          </Text>
        )}

        {/* Action buttons for uploaded image */}
        {imageUrl && !isUploading && (
          <Space size="small">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={handleViewImage}
            >
              Xem
            </Button>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemoveFile}
            >
              Xóa
            </Button>
          </Space>
        )}
      </Space>
    </div>
  );
};

export default ImageUploader; 