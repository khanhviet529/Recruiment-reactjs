import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../redux/slices/authSlice';
import { 
  FaVideo, 
  FaCalendarAlt, 
  FaPlus,
  FaList
} from 'react-icons/fa';

const MeetingsLayout = ({ children }) => {
  const { user } = useSelector(selectAuth);
  const location = useLocation();
  const isEmployer = user?.role === 'employer';
  const isCandidate = user?.role === 'applicant';
  
  const basePath = isEmployer ? '/employer' : isCandidate ? '/candidate' : '';
  
  // Helper function to determine if a tab is active
  const isActive = (path) => {
    if (path === `${basePath}/meetings` && location.pathname === path) {
      return true;
    }
    return location.pathname.includes(path.replace(`${basePath}/meetings`, ''));
  };
  
  return (
    <div className="meetings-content">
      <div className="page-title">
        <h1 className="mb-4">
          <FaVideo className="me-2" />
          Cuộc phỏng vấn
        </h1>
        
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link 
              as={Link} 
              to={`${basePath}/meetings`}
              active={location.pathname === `${basePath}/meetings`}
            >
              Tất cả cuộc họp
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              as={Link} 
              to={`${basePath}/meetings/upcoming`}
              active={location.pathname.includes('/upcoming')}
            >
              Sắp tới
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              as={Link} 
              to={`${basePath}/meetings/ongoing`}
              active={location.pathname.includes('/ongoing')}
            >
              Đang diễn ra
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              as={Link} 
              to={`${basePath}/meetings/past`}
              active={location.pathname.includes('/past')}
            >
              Đã kết thúc
            </Nav.Link>
          </Nav.Item>
          {isEmployer && (
            <Nav.Item className="ms-auto">
              <Nav.Link 
                as={Link} 
                to={`${basePath}/meetings/create`}
                className="create-link"
                active={location.pathname.includes('/create')}
              >
                <FaPlus className="me-1" /> Tạo cuộc họp
              </Nav.Link>
            </Nav.Item>
          )}
        </Nav>
      </div>
      
      <Container fluid>
        {children}
      </Container>
    </div>
  );
};

export default MeetingsLayout; 