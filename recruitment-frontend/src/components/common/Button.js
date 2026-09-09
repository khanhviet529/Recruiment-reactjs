import React from 'react';
import PropTypes from 'prop-types';
import { ClipLoader } from 'react-spinners';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = '',
  className = '',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  icon,
  ...rest
}) => {
  // Generate button classes
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    size && `btn-${size}`,
    fullWidth && 'd-grid w-100',
    isLoading && 'btn-loading',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest}
    >
      {isLoading ? (
        <>
          <ClipLoader size={16} color="#fff" className="me-2" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && <span className="me-2">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.string,
  size: PropTypes.oneOf(['', 'sm', 'lg']),
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  icon: PropTypes.node
};

export default Button;
