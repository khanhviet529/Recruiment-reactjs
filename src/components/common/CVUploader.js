import React, { useState } from 'react';
import { Upload, Button, Progress, message, Space, Typography } from 'antd';
import { UploadOutlined, FilePdfOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;

/**
 * CV Uploader component for handling CV uploads to Cloudinary
 */
const CVUploader = ({
  onUploadSuccess,
  onUploadError,
  cloudName = 'dcpqt0gen', // Default cloud name, can be customized
  uploadPreset = 'upload-pdf', // Default upload preset, can be customized
  maxSize = 5, // Maximum file size in MB
  disabled = false
}) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fileUrl, setFileUrl] = useState('');

  // Validate file
  const validateFile = (file) => {
    // Check if file exists
    if (!file) return 'Vui lòng chọn file để tải lên';
    
    // Check file type
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPDF) return 'Chỉ chấp nhận file PDF';
    
    // Check file size (convert MB to bytes)
    if (file.size > maxSize * 1024 * 1024) return `Kích thước file vượt quá ${maxSize}MB`;
    
    return null;
  };

  // Handle file selection
  const handleFileChange = (info) => {
    const fileObj = info.file.originFileObj || info.file;
    setFile(fileObj);
    setFileName(fileObj.name);
    setError('');
    setSuccess(false);
    setFileUrl('');
  };

  // Upload to Cloudinary
  const uploadToCloudinary = async () => {
    setIsUploading(true);
    setProgress(0);
    setError('');
    
    // Validate file before uploading
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setIsUploading(false);
      return;
    }
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    try {
      // Upload to Cloudinary
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );
      
      // If upload successful
      if (response.data && response.data.secure_url) {
        const fileUrl = response.data.secure_url;
        console.log('File uploaded successfully:', fileUrl);
        
        setFileUrl(fileUrl);
        setSuccess(true);
        
        // Notify parent component
        if (onUploadSuccess) {
          onUploadSuccess({
            data: response.data,
            url: fileUrl,
            name: file.name,
            type: file.type,
            size: file.size
          });
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Đã xảy ra lỗi khi tải lên. Vui lòng thử lại sau.');
      
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
    setFileUrl('');
    setSuccess(false);
    setError('');
  };

  // View uploaded file
  const handleViewFile = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="cv-uploader">
      {!success ? (
        <>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Upload.Dragger
              name="file"
              multiple={false}
              showUploadList={false}
              beforeUpload={(file) => {
                handleFileChange({ file });
                return false; // Prevent automatic upload
              }}
              accept=".pdf"
              disabled={isUploading || disabled}
            >
              <p className="ant-upload-drag-icon">
                <FilePdfOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">Kéo thả file PDF CV của bạn vào đây</p>
              <p className="ant-upload-hint">Hoặc nhấp để chọn file</p>
              <p className="ant-upload-hint">Kích thước tối đa: {maxSize}MB</p>
            </Upload.Dragger>
            
            {file && (
              <div style={{ marginTop: 16 }}>
                <Space>
                  <FilePdfOutlined />
                  <Text>{fileName}</Text>
                </Space>
              </div>
            )}
            
            {error && (
              <Text type="danger" style={{ marginTop: 8 }}>{error}</Text>
            )}
            
            {isUploading && (
              <Progress
                percent={progress}
                status="active"
                style={{ marginTop: 8 }}
              />
            )}
            
            <Button
              type="primary"
              onClick={uploadToCloudinary}
              disabled={!file || isUploading || disabled}
              loading={isUploading}
              icon={<UploadOutlined />}
              style={{ marginTop: 16 }}
            >
              {isUploading ? 'Đang tải lên...' : 'Tải lên CV'}
            </Button>
          </Space>
        </>
      ) : (
        <div className="upload-success" style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="file-preview">
              <Space>
                <FilePdfOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                <Text strong>{fileName}</Text>
                <Text type="success">Đã tải lên thành công</Text>
              </Space>
            </div>
            
            <Space>
              <Button 
                icon={<EyeOutlined />}
                onClick={handleViewFile}
              >
                Xem CV
              </Button>
              <Button 
                danger
                icon={<DeleteOutlined />}
                onClick={handleRemoveFile}
              >
                Xóa và tải lại
              </Button>
            </Space>
          </Space>
        </div>
      )}
    </div>
  );
};

export default CVUploader; 