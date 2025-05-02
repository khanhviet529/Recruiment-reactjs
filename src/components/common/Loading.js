import React from 'react';
import PropTypes from 'prop-types';
import { ClipLoader, BeatLoader, BarLoader } from 'react-spinners';

const Loading = ({
  type = 'clip',
  size = 35,
  color = '#4A90E2',
  fullScreen = false,
  text = 'Loading...',
  className = '',
  ...rest
}) => {
  // Select the loader component based on type
  const getLoader = () => {
    switch (type) {
      case 'beat':
        return <BeatLoader size={size / 2.5} color={color} />;
      case 'bar':
        return <BarLoader width={size * 2} height={size / 3} color={color} />;
      case 'clip':
      default:
        return <ClipLoader size={size} color={color} />;
    }
  };

  // If fullScreen is true, render a centered full-screen loader
  if (fullScreen) {
    return (
      <div 
        className="loading-fullscreen"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
        }}
        {...rest}
      >
        {getLoader()}
        {text && <p className="mt-3 text-center">{text}</p>}
      </div>
    );
  }

  // Standard inline loader
  const containerClasses = [
    'loading-container d-flex align-items-center justify-content-center',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} {...rest}>
      {getLoader()}
      {text && <span className="ms-2">{text}</span>}
    </div>
  );
};

Loading.propTypes = {
  type: PropTypes.oneOf(['clip', 'beat', 'bar']),
  size: PropTypes.number,
  color: PropTypes.string,
  fullScreen: PropTypes.bool,
  text: PropTypes.string,
  className: PropTypes.string
};

export default Loading;
