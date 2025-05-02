import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const Dropdown = ({
  children,
  toggle,
  title,
  placement = 'bottom-start',
  className = '',
  menuClassName = '',
  disabled = false,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle dropdown
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown when Escape key is pressed
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Generate dropdown classes
  const dropdownClasses = ['dropdown', className].filter(Boolean).join(' ');

  // Generate dropdown menu classes
  const menuClasses = [
    'dropdown-menu',
    isOpen ? 'show' : '',
    placement && `dropdown-menu-${placement}`,
    menuClassName
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={dropdownClasses} ref={dropdownRef} {...rest}>
      {toggle ? (
        <div onClick={handleToggle}>{toggle}</div>
      ) : (
        <button
          className="btn btn-secondary dropdown-toggle"
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          aria-expanded={isOpen}
        >
          {title}
        </button>
      )}
      <div className={menuClasses}>{children}</div>
    </div>
  );
};

const DropdownItem = ({ children, onClick, className = '', disabled = false, active = false, ...rest }) => {
  // Generate dropdown item classes
  const itemClasses = [
    'dropdown-item',
    active && 'active',
    disabled && 'disabled',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <a className={itemClasses} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};

const DropdownDivider = ({ className = '', ...rest }) => {
  const dividerClasses = ['dropdown-divider', className].filter(Boolean).join(' ');
  return <div className={dividerClasses} {...rest}></div>;
};

const DropdownHeader = ({ children, className = '', ...rest }) => {
  const headerClasses = ['dropdown-header', className].filter(Boolean).join(' ');
  return (
    <h6 className={headerClasses} {...rest}>
      {children}
    </h6>
  );
};

Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;
Dropdown.Header = DropdownHeader;

Dropdown.propTypes = {
  children: PropTypes.node.isRequired,
  toggle: PropTypes.node,
  title: PropTypes.node,
  placement: PropTypes.oneOf(['top', 'top-start', 'top-end', 'right', 'right-start', 'right-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end']),
  className: PropTypes.string,
  menuClassName: PropTypes.string,
  disabled: PropTypes.bool
};

DropdownItem.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  active: PropTypes.bool
};

DropdownDivider.propTypes = {
  className: PropTypes.string
};

DropdownHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default Dropdown;
