import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Alert = ({
  children,
  variant = 'primary',
  className = '',
  isDismissible = false,
  icon,
  onClose,
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Generate alert classes
  const alertClasses = [
    'alert',
    `alert-${variant}`,
    isDismissible && 'alert-dismissible fade show',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className={alertClasses} role="alert" {...rest}>
      {icon && <span className="alert-icon me-2">{icon}</span>}
      {children}
      {isDismissible && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={handleClose}
        ></button>
      )}
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  className: PropTypes.string,
  isDismissible: PropTypes.bool,
  icon: PropTypes.node,
  onClose: PropTypes.func
};

export default Alert;
