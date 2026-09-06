import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const TestAuthPage = () => {
  const [authStatus, setAuthStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const currentUser = authService.getCurrentUser();
    const isLoggedIn = authService.isLoggedIn();
    
    setAuthStatus({
      currentUser,
      isLoggedIn
    });
  };

  const handleQuickLogin = async (role) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Attempting quick login for role: ${role}`);
      const result = await authService.quickLogin(role);
      console.log('Quick login result:', result);
      
      checkAuthStatus();
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

  const handleLogout = () => {
    authService.logout();
    checkAuthStatus();
    alert('Đã đăng xuất!');
  };

  return (
    <Container className="py-4">
      <h1>Test Authentication</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Quick Login</h5>
            </Card.Header>
            <Card.Body>
              <p>Login với tài khoản có sẵn trong database:</p>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={() => handleQuickLogin('candidate')}
                  disabled={loading}
                >
                  {loading ? 'Đang đăng nhập...' : 'Login as Candidate'}
                </Button>
                <Button 
                  variant="success" 
                  onClick={() => handleQuickLogin('employer')}
                  disabled={loading}
                >
                  {loading ? 'Đang đăng nhập...' : 'Login as Employer'}
                </Button>
                <Button 
                  variant="warning" 
                  onClick={() => handleQuickLogin('admin')}
                  disabled={loading}
                >
                  {loading ? 'Đang đăng nhập...' : 'Login as Admin'}
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
                  <p><strong>Trạng thái đăng nhập:</strong> 
                    <Badge bg={authStatus.isLoggedIn ? 'success' : 'danger'} className="ms-2">
                      {authStatus.isLoggedIn ? 'Đã đăng nhập' : 'Chưa đăng nhập'}
                    </Badge>
                  </p>
                  
                  {authStatus.currentUser && (
                    <div>
                      <p><strong>Thông tin user:</strong></p>
                      <ul>
                        <li>Email: {authStatus.currentUser.email}</li>
                        <li>Role: <Badge bg="info">{authStatus.currentUser.role}</Badge></li>
                        <li>Name: {authStatus.currentUser.name}</li>
                        <li>ID: {authStatus.currentUser.id}</li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p>Đang kiểm tra trạng thái...</p>
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
                <Button variant="danger" onClick={handleLogout}>
                  Logout
                </Button>
                <Button variant="secondary" onClick={checkAuthStatus}>
                  Refresh Status
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mt-4">
        <Card.Header>
          <h5>Sample Credentials (từ database.json)</h5>
        </Card.Header>
        <Card.Body>
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

export default TestAuthPage; 