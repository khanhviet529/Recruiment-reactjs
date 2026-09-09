import React from 'react';
import './ModernCard.scss';

const ModernCard = ({ 
  children, 
  className = '', 
  variant = 'default', 
  hover = true, 
  onClick,
  padding = 'lg',
  ...props 
}) => {
  const classes = [
    'modern-card',
    `modern-card--${variant}`,
    `modern-card--padding-${padding}`,
    hover && 'modern-card--hover',
    onClick && 'modern-card--interactive',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

const ModernCardHeader = ({ children, className = '', ...props }) => (
  <div className={`modern-card__header ${className}`} {...props}>
    {children}
  </div>
);

const ModernCardBody = ({ children, className = '', ...props }) => (
  <div className={`modern-card__body ${className}`} {...props}>
    {children}
  </div>
);

const ModernCardFooter = ({ children, className = '', ...props }) => (
  <div className={`modern-card__footer ${className}`} {...props}>
    {children}
  </div>
);

const ModernCardTitle = ({ children, className = '', size = 'md', ...props }) => (
  <h3 className={`modern-card__title modern-card__title--${size} ${className}`} {...props}>
    {children}
  </h3>
);

const ModernCardText = ({ children, className = '', variant = 'body', ...props }) => (
  <p className={`modern-card__text modern-card__text--${variant} ${className}`} {...props}>
    {children}
  </p>
);

// Export compound component
ModernCard.Header = ModernCardHeader;
ModernCard.Body = ModernCardBody;
ModernCard.Footer = ModernCardFooter;
ModernCard.Title = ModernCardTitle;
ModernCard.Text = ModernCardText;

export default ModernCard; 