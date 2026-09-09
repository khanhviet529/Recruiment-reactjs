import React from 'react';
import './ModernButton.scss';
import {
  ReloadOutlined,
} from '@ant-design/icons';

const ModernButton = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const classes = [
    'modern-btn',
    `modern-btn--${variant}`,
    `modern-btn--${size}`,
    fullWidth && 'modern-btn--full-width',
    loading && 'modern-btn--loading',
    disabled && 'modern-btn--disabled',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading && (
        <span className="modern-btn__spinner">
          <ReloadOutlined />
        </span>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="modern-btn__icon modern-btn__icon--left">
          {typeof icon === 'string' ? <i className={icon}></i> : icon}
        </span>
      )}
      
      <span className="modern-btn__text">{children}</span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="modern-btn__icon modern-btn__icon--right">
          {typeof icon === 'string' ? <i className={icon}></i> : icon}
        </span>
      )}
    </button>
  );
};

export default ModernButton; 