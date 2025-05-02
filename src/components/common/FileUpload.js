import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

const FileUpload = ({
  label,
  accept = '',
  multiple = false,
  maxSize = 5242880, // 5MB
  onChange,
  onError,
  className = '',
  buttonText = 'Choose File',
  dragDropText = 'or drop files here',
  showPreview = true,
  disabled = false,
  name,
  id,
  required = false,
  error,
  helpText,
  allowedFileTypes = [],
  ...rest
}) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Generate container classes
  const containerClasses = [
    'file-upload-container mb-3',
    className
  ]
    .filter(Boolean)
    .join(' ');

  // Generate drop area classes
  const dropAreaClasses = [
    'file-upload-drop-area p-4 rounded text-center border',
    isDragging ? 'border-primary bg-light' : 'border-dashed',
    error ? 'border-danger' : 'border-secondary',
    disabled ? 'opacity-50' : ''
  ]
    .filter(Boolean)
    .join(' ');

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    processFiles(selectedFiles);
  };

  // Handle files dropped into drop area
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (disabled) return;
    
    setIsDragging(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files || []);
    processFiles(droppedFiles);
  };

  // Process files, validate and trigger callbacks
  const processFiles = (selectedFiles) => {
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach(file => {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`File "${file.name}" exceeds the maximum size of ${formatFileSize(maxSize)}.`);
        return;
      }

      // Check file type if specified
      if (allowedFileTypes.length > 0) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedFileTypes.includes(fileExtension)) {
          errors.push(`File "${file.name}" has an invalid type. Allowed types: ${allowedFileTypes.join(', ')}.`);
          return;
        }
      }

      validFiles.push(file);
    });

    // Set valid files
    const newFiles = multiple ? [...files, ...validFiles] : validFiles.slice(0, 1);
    setFiles(newFiles);

    // Call onChange with the valid files
    if (onChange && validFiles.length > 0) {
      onChange(multiple ? newFiles : newFiles[0]);
    }

    // Call onError if there were any errors
    if (onError && errors.length > 0) {
      onError(errors);
    }
  };

  // Handle drag events
  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  // Trigger file browser
  const handleBrowseClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove a file from the selection
  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    if (onChange) {
      onChange(multiple ? newFiles : newFiles[0] || null);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={containerClasses} {...rest}>
      {label && (
        <label htmlFor={id || name} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      
      <div
        className={dropAreaClasses}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="d-none"
          disabled={disabled}
          name={name}
          id={id || name}
          required={required}
        />
        
        <div className="mb-3">
          <i className="fas fa-cloud-upload-alt fa-2x text-secondary mb-2"></i>
          <p className="mb-1">{dragDropText}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleBrowseClick}
            disabled={disabled}
          >
            {buttonText}
          </button>
        </div>
        
        {helpText && <div className="text-muted small mb-2">{helpText}</div>}
        
        {error && <div className="text-danger small">{error}</div>}
      </div>
      
      {/* File Preview */}
      {showPreview && files.length > 0 && (
        <div className="file-preview mt-3">
          <h6>Selected Files ({files.length})</h6>
          <ul className="list-group">
            {files.map((file, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size text-muted ms-2 small">({formatFileSize(file.size)})</span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemoveFile(index)}
                  disabled={disabled}
                >
                  <i className="fas fa-times"></i>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

FileUpload.propTypes = {
  label: PropTypes.node,
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  maxSize: PropTypes.number,
  onChange: PropTypes.func,
  onError: PropTypes.func,
  className: PropTypes.string,
  buttonText: PropTypes.string,
  dragDropText: PropTypes.string,
  showPreview: PropTypes.bool,
  disabled: PropTypes.bool,
  name: PropTypes.string,
  id: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  helpText: PropTypes.node,
  allowedFileTypes: PropTypes.arrayOf(PropTypes.string)
};

export default FileUpload;
