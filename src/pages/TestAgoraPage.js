import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Alert, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useSelector } from 'react-redux';
import { selectAuth } from '../redux/slices/authSlice';

const TestAgoraPage = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [authStatus, setAuthStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(selectAuth);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const isLoggedIn = authService.isLoggedIn();
    
    setAuthStatus({
      currentUser,
      isLoggedIn,
      reduxAuth: isAuthenticated,
      reduxUser: user
    });
  }, [isAuthenticated, user]);

  const handleQuickLogin = async (role) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.quickLogin(role);
      console.log('Quick login result:', result);
      
      setAuthStatus({
        currentUser: result,
        isLoggedIn: authService.isLoggedIn(),
        reduxAuth: isAuthenticated,
        reduxUser: user
      });
      
      alert(`Đăng nhập thành công với role: ${role}`);
    } catch (error) {
      console.error('Quick login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToMeetings = () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      if (currentUser.role === 'candidate' || currentUser.role === 'applicant') {
        navigate('/candidate/meetings');
      } else if (currentUser.role === 'employer') {
        navigate('/employer/meetings');
      } else {
        alert('Role không hỗ trợ meetings');
      }
    } else {
      alert('Chưa đăng nhập!');
    }
  };

  return (
    <Container className="py-4">
      <h1>Authentication Test Page</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Quick Login Test</h5>
            </Card.Header>
            <Card.Body>
              <p>Đăng nhập nhanh với tài khoản có sẵn trong database:</p>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={() => handleQuickLogin('candidate')}
                  disabled={loading}
                >
                  Login as Candidate
                </Button>
                <Button 
                  variant="success" 
                  onClick={() => handleQuickLogin('employer')}
                  disabled={loading}
                >
                  Login as Employer
                </Button>
                <Button 
                  variant="warning" 
                  onClick={() => handleQuickLogin('admin')}
                  disabled={loading}
                >
                  Login as Admin
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Auth Status</h5>
            </Card.Header>
            <Card.Body>
              {authStatus ? (
                <div>
                  <p><strong>AuthService isLoggedIn:</strong> 
                    <Badge bg={authStatus.isLoggedIn ? 'success' : 'danger'}>
                      {authStatus.isLoggedIn ? 'Yes' : 'No'}
                    </Badge>
                  </p>
                  
                  {authStatus.currentUser && (
                    <div>
                      <p><strong>Current User:</strong></p>
                      <ul>
                        <li>Email: {authStatus.currentUser.email}</li>
                        <li>Role: {authStatus.currentUser.role}</li>
                        <li>Name: {authStatus.currentUser.name}</li>
                        <li>ID: {authStatus.currentUser.id}</li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p>Loading auth status...</p>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5>Navigation Test</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="info" onClick={navigateToMeetings}>
                  Go to Meetings Page
                </Button>
                <Button variant="danger" onClick={() => {
                  authService.logout();
                  window.location.reload();
                }}>
                  Logout
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mt-4">
        <Card.Header>
          <h5>Sample Credentials</h5>
        </Card.Header>
        <Card.Body>
          <p>Dữ liệu test có trong database.json:</p>
          <Row>
            <Col md={4}>
              <h6>Candidate</h6>
              <p>Email: candidate1@gmail.com<br />Password: Password123</p>
            </Col>
            <Col md={4}>
              <h6>Employer</h6>
              <p>Email: employer2@techfirm.com<br />Password: Password123</p>
            </Col>
            <Col md={4}>
              <h6>Admin</h6>
              <p>Email: admin@gmail.com<br />Password: 1</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TestAgoraPage; 