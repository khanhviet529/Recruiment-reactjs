import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = '',
  centered = false,
  scrollable = false,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  closeButton = true,
  staticBackdrop = false,
  backdrop = true,
  keyboard = true,
  ...rest
}) => {
  if (!isOpen) return null;

  // Generate modal classes
  const modalClasses = [
    'modal',
    'fade',
    isOpen ? 'show' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  // Generate modal dialog classes
  const dialogClasses = [
    'modal-dialog',
    size && `modal-${size}`,
    centered && 'modal-dialog-centered',
    scrollable && 'modal-dialog-scrollable'
  ]
    .filter(Boolean)
    .join(' ');

  // Generate modal header classes
  const headerClasses = ['modal-header', headerClassName]
    .filter(Boolean)
    .join(' ');

  // Generate modal body classes
  const bodyClasses = ['modal-body', bodyClassName]
    .filter(Boolean)
    .join(' ');

  // Generate modal footer classes
  const footerClasses = ['modal-footer', footerClassName]
    .filter(Boolean)
    .join(' ');

  // Handle backdrop click (if not static)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !staticBackdrop && backdrop) {
      onClose();
    }
  };

  // Handle escape key press (if enabled)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && keyboard) {
      onClose();
    }
  };

  return (
    <>
      <div
        className={modalClasses}
        style={{ display: isOpen ? 'block' : 'none', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <div className={dialogClasses} role="document">
          <div className="modal-content">
            {title && (
              <div className={headerClasses}>
                <h5 className="modal-title">{title}</h5>
                {closeButton && (
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={onClose}
                  ></button>
                )}
              </div>
            )}
            <div className={bodyClasses}>{children}</div>
            {footer && <div className={footerClasses}>{footer}</div>}
          </div>
        </div>
      </div>
      {isOpen && <div className="modal-backdrop fade show"></div>}
    </>
  );
};

// Predefined footer with Cancel and Submit buttons
Modal.Footer = ({ onCancel, onSubmit, cancelText = 'Cancel', submitText = 'Submit', isSubmitting = false }) => (
  <>
    <Button variant="secondary" onClick={onCancel}>
      {cancelText}
    </Button>
    <Button variant="primary" onClick={onSubmit} isLoading={isSubmitting}>
      {submitText}
    </Button>
  </>
);

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['', 'sm', 'lg', 'xl']),
  centered: PropTypes.bool,
  scrollable: PropTypes.bool,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  closeButton: PropTypes.bool,
  staticBackdrop: PropTypes.bool,
  backdrop: PropTypes.bool,
  keyboard: PropTypes.bool
};

Modal.Footer.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  cancelText: PropTypes.string,
  submitText: PropTypes.string,
  isSubmitting: PropTypes.bool
};

export default Modal;
