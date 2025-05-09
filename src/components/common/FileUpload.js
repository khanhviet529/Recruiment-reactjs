import React, { useState } from 'react';
import { Upload, Button, message, Progress, Modal } from 'antd';
import { UploadOutlined, FileOutlined, PaperClipOutlined, FilePdfOutlined } from '@ant-design/icons';
import { 
  uploadToCloudinary, 
  uploadPDF, 
  uploadImage 
} from '../../services/fileService';
import { 
  CLOUDINARY_CONFIG, 
  getUploadPresetForFileType, 
  getResourceTypeForFileType 
} from '../../services/configService';

/**
 * A reusable file upload component for Cloudinary
 */
const FileUpload = ({
  accept = '*', // File types to accept (.pdf, .jpg, etc.)
  maxSize = 5, // Maximum file size in MB
  multiple = false, // Allow multiple file uploads
  buttonText = 'Upload File', // Text to display on the button
  uploadPreset, // Cloudinary upload preset (optional, auto-detected if not provided)
  resourceType, // Cloudinary resource type (optional, auto-detected if not provided)
  onUploadSuccess = () => {}, // Callback when upload is successful
  onUploadError = () => {}, // Callback when upload fails
  fileIcon = <FileOutlined />, // Icon to display for the file type
  disabled = false, // Whether the upload button is disabled
  showProgressBar = true, // Whether to show the progress bar
  showPreviewIcon = true, // Whether to show the preview icon
  showRemoveIcon = true, // Whether to show the remove icon
  cloudName = CLOUDINARY_CONFIG.cloudName // Cloudinary cloud name
}) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const handlePreview = file => {
    setPreviewFile(file);
    setPreviewVisible(true);
  };

  const closePreview = () => {
    setPreviewVisible(false);
    setPreviewFile(null);
  };

  // Handle progress updates
  const handleProgress = (percentCompleted) => {
    if (showProgressBar) {
      setProgress(percentCompleted);
    }
  };

  // Custom upload with progress indicator
  const customUpload = async ({ file, onSuccess, onError, onProgress }) => {
    setUploading(true);
    setProgress(0);
    
    try {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        message.error(`Kích thước file vượt quá ${maxSize}MB`);
        onError(new Error(`Kích thước file vượt quá ${maxSize}MB`));
        setUploading(false);
        setProgress(0);
        return;
      }

      // Determine the best upload function based on file type
      let result;
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        result = await uploadPDF(file, handleProgress);
      } else if (file.type.startsWith('image/')) {
        result = await uploadImage(file, handleProgress);
      } else {
        // For other file types, use the provided preset or detect automatically
        const finalUploadPreset = uploadPreset || getUploadPresetForFileType(file.type || file.name);
        const finalResourceType = resourceType || getResourceTypeForFileType(file.type || file.name);
        result = await uploadToCloudinary(file, finalUploadPreset, finalResourceType, handleProgress);
      }
      
      if (result.success) {
        setProgress(100);
        console.log('Cloudinary upload result:', result);
        
        // Add file with URL to the file list
        const newFile = {
          uid: file.uid,
          name: file.name,
          status: 'done',
          url: result.data.url || result.url,
          thumbUrl: result.data.resource_type === 'image' ? (result.data.url || result.url) : null,
          response: result,
          publicId: result.data.public_id
        };
        
        // Update file list
        setFileList(prev => {
          if (!multiple) {
            return [newFile];
          }
          return [...prev, newFile];
        });
        
        onSuccess(result, file);
        onUploadSuccess(result, file);
        message.success(`${file.name} đã tải lên thành công`);
      } else {
        onError(new Error(result.error));
        onUploadError(result.error, file);
        message.error(`${file.name} tải lên thất bại: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      onError(error);
      onUploadError(error.message, file);
      message.error(`${file.name} tải lên thất bại: ${error.message}`);
    } finally {
      setUploading(false);
      // Reset progress after a delay to show 100% completion
      if (progress === 100) {
        setTimeout(() => setProgress(0), 1000);
      }
    }
  };

  // Handle file list changes
  const handleChange = info => {
    let newFileList = [...info.fileList];
    
    // Limit to the most recent file if not multiple
    if (!multiple) {
      newFileList = newFileList.slice(-1);
    }
    
    // Update file list status
    setFileList(newFileList);
  };

  // Check if file type is valid
  const beforeUpload = file => {
    // If accept is set, check file type matches
    if (accept !== '*') {
      const acceptTypes = accept.split(',').map(type => type.trim());
      const isValid = acceptTypes.some(type => {
        if (type.startsWith('.')) {
          // Check file extension
          const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
          return extension === type.toLowerCase();
        } else {
          // Check MIME type
          return file.type.match(type);
        }
      });

      if (!isValid) {
        message.error(`${file.name} không phải là định dạng file hợp lệ`);
        return Upload.LIST_IGNORE;
      }
    }
    return true;
  };

  // Get appropriate icon based on file type
  const getFileIcon = (file) => {
    if (file.type === 'application/pdf' || (file.name && file.name.toLowerCase().endsWith('.pdf'))) {
      return <FilePdfOutlined />;
    }
    return fileIcon;
  };

  return (
    <div className="file-upload-component">
      <Upload
        fileList={fileList}
        customRequest={customUpload}
        onChange={handleChange}
        beforeUpload={beforeUpload}
        accept={accept}
        multiple={multiple}
        disabled={disabled || uploading}
        showUploadList={{
          showDownloadIcon: true,
          showPreviewIcon: showPreviewIcon,
          showRemoveIcon: showRemoveIcon,
        }}
        onPreview={handlePreview}
        iconRender={getFileIcon}
      >
        <Button 
          icon={<UploadOutlined />} 
          loading={uploading}
          disabled={disabled || (fileList.length > 0 && !multiple)}
        >
          {buttonText}
        </Button>
      </Upload>
      
      {showProgressBar && progress > 0 && (
        <Progress 
          percent={progress} 
          size="small" 
          status={progress === 100 ? "success" : "active"} 
          style={{ marginTop: 8 }}
        />
      )}
      
      {previewFile && (
        <Modal
          visible={previewVisible}
          title={previewFile.name}
          footer={null}
          onCancel={closePreview}
        >
          {previewFile.type === 'application/pdf' || (previewFile.name && previewFile.name.toLowerCase().endsWith('.pdf')) ? (
            <div style={{ height: '500px' }}>
              <iframe 
                src={previewFile.url} 
                style={{ width: '100%', height: '100%' }} 
                title="PDF Preview"
              />
            </div>
          ) : previewFile.type && previewFile.type.startsWith('image/') ? (
            <img 
              alt="preview" 
              style={{ width: '100%' }} 
              src={previewFile.url} 
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p><FileOutlined style={{ fontSize: '48px' }} /></p>
              <p>Không thể xem trước file trên trình duyệt</p>
              <Button type="primary" href={previewFile.url} target="_blank">
                Tải xuống để xem
              </Button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default FileUpload;
