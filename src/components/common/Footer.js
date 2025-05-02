import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer bg-light py-5">
      <div className="container">
        <div className="row">
          {/* Company info */}
          <div className="col-lg-4 mb-4 mb-lg-0">
            <h5 className="text-primary fw-bold mb-4">JobConnect</h5>
            <p className="text-muted">
              Connecting talented professionals with the best job opportunities. Find your dream job or the perfect candidate for your company.
            </p>
            <div className="social-media mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="me-3 text-secondary">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="me-3 text-secondary">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="me-3 text-secondary">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-secondary">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-lg-2 col-6 mb-4 mb-lg-0">
            <h6 className="fw-bold mb-4">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-secondary">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/jobs" className="text-decoration-none text-secondary">
                  Find Jobs
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/companies" className="text-decoration-none text-secondary">
                  Companies
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-decoration-none text-secondary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-decoration-none text-secondary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For employers */}
          <div className="col-lg-2 col-6 mb-4 mb-lg-0">
            <h6 className="fw-bold mb-4">For Employers</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/employer/post-job" className="text-decoration-none text-secondary">
                  Post a Job
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/employer/dashboard" className="text-decoration-none text-secondary">
                  Employer Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/pricing" className="text-decoration-none text-secondary">
                  Pricing Plans
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/employer/resources" className="text-decoration-none text-secondary">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/employer/faq" className="text-decoration-none text-secondary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* For candidates */}
          <div className="col-lg-2 col-6 mb-4 mb-lg-0">
            <h6 className="fw-bold mb-4">For Candidates</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/applicant/browse-jobs" className="text-decoration-none text-secondary">
                  Browse Jobs
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/applicant/dashboard" className="text-decoration-none text-secondary">
                  Candidate Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/applicant/resources" className="text-decoration-none text-secondary">
                  Career Resources
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/applicant/profile" className="text-decoration-none text-secondary">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link to="/applicant/faq" className="text-decoration-none text-secondary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="col-lg-2 col-6">
            <h6 className="fw-bold mb-4">Contact</h6>
            <ul className="list-unstyled">
              <li className="mb-2 text-secondary">
                <i className="fas fa-map-marker-alt me-2"></i> 123 Main Street, City
              </li>
              <li className="mb-2 text-secondary">
                <i className="fas fa-phone me-2"></i> (123) 456-7890
              </li>
              <li className="mb-2 text-secondary">
                <i className="fas fa-envelope me-2"></i> info@jobconnect.com
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="row mt-5 pt-4 border-top">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0 text-secondary">
              &copy; {currentYear} JobConnect. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <Link to="/terms" className="text-decoration-none text-secondary small">
                  Terms of Service
                </Link>
              </li>
              <li className="list-inline-item ms-3">
                <Link to="/privacy" className="text-decoration-none text-secondary small">
                  Privacy Policy
                </Link>
              </li>
              <li className="list-inline-item ms-3">
                <Link to="/cookies" className="text-decoration-none text-secondary small">
                  Cookies Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
