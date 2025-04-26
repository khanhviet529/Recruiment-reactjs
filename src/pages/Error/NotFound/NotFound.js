import React from 'react';
import { Link } from 'react-router-dom';
import './notFound.scss';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Oops! Page Not Found</h2>
        <p className="error-message">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="error-actions">
          <Link to="/" className="home-button">
            Go to Homepage
          </Link>
          <button className="back-button" onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 