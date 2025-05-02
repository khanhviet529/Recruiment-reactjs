import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  title,
  subtitle,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  shadow = '',
  variant = '',
  header,
  footer,
  ...rest
}) => {
  // Generate card classes
  const cardClasses = [
    'card',
    variant && `card-${variant}`,
    shadow && `shadow-${shadow}`,
    className
  ]
    .filter(Boolean)
    .join(' ');

  // Generate card body classes
  const bodyClasses = ['card-body', bodyClassName].filter(Boolean).join(' ');

  // Generate card header classes
  const headerClasses = ['card-header', headerClassName].filter(Boolean).join(' ');

  // Generate card footer classes
  const footerClasses = ['card-footer', footerClassName].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...rest}>
      {(header || title) && (
        <div className={headerClasses}>
          {header || (
            <>
              {title && <h5 className="card-title">{title}</h5>}
              {subtitle && <h6 className="card-subtitle text-muted">{subtitle}</h6>}
            </>
          )}
        </div>
      )}
      <div className={bodyClasses}>
        {(!header && title) && <h5 className="card-title">{title}</h5>}
        {(!header && subtitle) && <h6 className="card-subtitle mb-2 text-muted">{subtitle}</h6>}
        {children}
      </div>
      {footer && <div className={footerClasses}>{footer}</div>}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  shadow: PropTypes.oneOf(['', 'sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['', 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  header: PropTypes.node,
  footer: PropTypes.node
};

export default Card;
