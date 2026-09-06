import React, { useState, useEffect } from 'react';
import { Upload, Button, Progress, message, Space, Typography, Image, Avatar } from 'antd';
import { UploadOutlined, DeleteOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import { uploadImage } from '../../services/fileService';
import { CLOUDINARY_CONFIG } from '../../services/configService';
import './ImageUploader.scss';

const { Text } = Typography;

/**
 * Image Uploader component for handling image uploads to Cloudinary
 * Without "View" button - only Upload and Delete
 * 
 * PREVIEW MASK PATTERN (for future reference):
 * - Background: rgba(0, 0, 0, 0.5)
 * - Layout: Flexbox column, center aligned
 * - Icon: EyeOutlined, 24px, margin-bottom 8px
 * - Text: "Preview", 14px, font-weight 500
 * - Color: white
 * - Full height coverage
 */
const ImageUploaderNoView = ({
  onUploadSuccess,
  onUploadError,
  onDeleteSuccess,
  maxSize = CLOUDINARY_CONFIG.maxFileSizes.image, // Maximum file size in MB
  disabled = false,
  isProfilePicture = true, // Enable profile picture optimizations
  currentImageUrl = null, // Current image URL to display
  shape = 'square', // 'circle' or 'square'
  size = 120, // Size in pixels
  placeholder = null, // Placeholder text or element
  displayStyle = 'avatar' // 'avatar' or 'image'
}) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [previewUrl, setPreviewUrl] = useState(null); // For immediate preview
  const [previewVisible, setPreviewVisible] = useState(false); // Control preview modal

  // Update imageUrl when currentImageUrl changes (only if no uploaded image exists)
  useEffect(() => {
    // Only update if we don't have a successfully uploaded image
    if (!imageUrl || imageUrl === currentImageUrl) {
      setImageUrl(currentImageUrl);
    }
    console.log('ImageUploaderNoView useEffect - currentImageUrl:', currentImageUrl, 'imageUrl:', imageUrl);
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
        
        console.log('ImageUploaderNoView - Upload success, imageUrl set to:', result.url);
        
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
    
    // Notify parent component about deletion
    if (onDeleteSuccess) {
      onDeleteSuccess();
    }
  };

  // Get the image to display (priority: preview > uploaded > current)
  const getDisplayImage = () => {
    const displayUrl = previewUrl || imageUrl || currentImageUrl;
    console.log('ImageUploaderNoView getDisplayImage - previewUrl:', previewUrl, 'imageUrl:', imageUrl, 'currentImageUrl:', currentImageUrl, 'final:', displayUrl);
    return displayUrl;
  };

  // Get placeholder content
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return <UserOutlined style={{ fontSize: size * 0.4 }} />;
  };

  // Render image display based on displayStyle
  const renderImageDisplay = () => {
    const displayUrl = getDisplayImage();
    
    if (displayStyle === 'image') {
      // Image style like cover/logo in employer profile
      return (
        <div style={{ 
          width: '100%', 
          height: `${size}px`, 
          overflow: 'hidden',
          borderRadius: '8px',
          position: 'relative'
        }}>
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="Preview"
              style={{ 
                width: '100%', 
                height: `${size}px`,
                objectFit: 'cover',
                objectPosition: 'center',
                opacity: isUploading ? 0.7 : 1,
                transition: 'opacity 0.3s, transform 0.2s'
              }}
              fallback={`https://via.placeholder.com/${size}x${size}?text=No+Image`}
              preview={{
                mask: (
                  <div className="custom-preview-mask">
                    <EyeOutlined style={{ fontSize: '17px', marginRight: '3px' }} />
                    <span>Preview</span>
                  </div>
                )
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            />
          ) : (
            <div 
              style={{ 
                width: '100%', 
                height: `${size}px`, 
                background: '#f0f2f5', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: '8px'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>📷</div>
                <Text type="secondary">Chưa có ảnh</Text>
              </div>
            </div>
          )}
          
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
      );
    } else {
      // Avatar style (default)
      return (
        <div className="image-display" style={{ position: 'relative' }}>
          {displayUrl ? (
            <Image.PreviewGroup>
              <div style={{ position: 'relative' }}>
                <Avatar
                  src={displayUrl}
                  size={size}
                  shape={shape}
                  style={{
                    border: '3px solid #fff',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    opacity: isUploading ? 0.7 : 1,
                    transition: 'opacity 0.3s, transform 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => setPreviewVisible(true)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                />
                
                {/* Hidden Image for preview functionality */}
                <Image
                  src={displayUrl}
                  style={{ display: 'none' }}
                  preview={{
                    visible: previewVisible,
                    onVisibleChange: (visible) => setPreviewVisible(visible),
                    mask: null
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
            </Image.PreviewGroup>
          ) : (
            <Avatar
              size={size}
              shape={shape}
              icon={getPlaceholder()}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#94a3b8',
                border: '2px dashed #cbd5e1'
              }}
            />
          )}
        </div>
      );
    }
  };

  return (
    <div className="image-uploader">
      <Space direction="vertical" align="center" style={{ width: '100%' }}>
        {/* Image Display */}
        {renderImageDisplay()}

        {/* Buttons Row - Upload and Delete on same row */}
        <Space size="small">
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

          {/* Delete button - only show when there's an image */}
          {imageUrl && !isUploading && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemoveFile}
            >
              Xóa
            </Button>
          )}
        </Space>

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
          <Text style={{ fontSize: '12px', color: '#64748b' }}>
            {fileName}
          </Text>
        )}
      </Space>
    </div>
  );
};

export default ImageUploaderNoView; 