import React, { useState } from 'react';
import { Container, Row, Col, Tabs, Tab, Card, Alert, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaVideo, FaUsers, FaCog, FaArrowLeft } from 'react-icons/fa';

import MeetingRoomEnhanced from '../../components/meeting/MeetingRoomEnhanced';
import TokenManagementPanel from '../../components/meeting/TokenManagementPanel';

const EnhancedMeetingPage = () => {
  const [activeTab, setActiveTab] = useState('meeting');
  const [showTokenPanel, setShowTokenPanel] = useState(false);
  
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <Container fluid className="enhanced-meeting-page">
      {/* Header */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button 
                variant="outline-secondary" 
                onClick={handleBackToDashboard}
                className="me-3"
              >
                <FaArrowLeft /> Back to Dashboard
              </Button>
              <h2 className="mb-0">Enhanced Meeting Room</h2>
            </div>
            <div>
              <Button
                variant={showTokenPanel ? "primary" : "outline-primary"}
                onClick={() => setShowTokenPanel(!showTokenPanel)}
                className="me-2"
              >
                <FaCog /> Token Management
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Info Alert */}
      <Row className="mb-3">
        <Col>
          <Alert variant="info" className="mb-0">
            <strong>🚀 Enhanced Meeting Experience:</strong> This version uses the new token management system with 
            persistent storage, automatic refresh, and enhanced monitoring capabilities.
          </Alert>
        </Col>
      </Row>

      <Row>
        {/* Main Meeting Area */}
        <Col lg={showTokenPanel ? 8 : 12}>
          <Card>
            <Card.Header>
              <Tabs 
                activeKey={activeTab} 
                onSelect={(k) => setActiveTab(k)}
                className="border-0"
              >
                <Tab eventKey="meeting" title={<><FaVideo /> Meeting</>} />
                <Tab eventKey="participants" title={<><FaUsers /> Participants</>} />
              </Tabs>
            </Card.Header>
            <Card.Body className="p-0">
              {activeTab === 'meeting' && (
                <MeetingRoomEnhanced />
              )}
              {activeTab === 'participants' && (
                <div className="p-4">
                  <h5>Participants Management</h5>
                  <p className="text-muted">
                    Participant management features will be displayed here.
                    This could include participant list, permissions, etc.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Token Management Panel */}
        {showTokenPanel && (
          <Col lg={4}>
            <TokenManagementPanel meetingId={meetingId} />
            
            {/* Additional Debug Info */}
            <Card className="mt-3">
              <Card.Header>
                <h6 className="mb-0">🔧 Debug Information</h6>
              </Card.Header>
              <Card.Body>
                <div className="small">
                  <div className="d-flex justify-content-between">
                    <span>Meeting ID:</span>
                    <code>{meetingId}</code>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Backend API:</span>
                    <code>localhost:3006</code>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>JSON Server:</span>
                    <code>localhost:5000</code>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Agora App ID:</span>
                    <code>4634eb2b...</code>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* API Test Panel */}
            <Card className="mt-3">
              <Card.Header>
                <h6 className="mb-0">🧪 API Test</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => window.open('http://localhost:3006/api/health', '_blank')}
                  >
                    Test Backend Health
                  </Button>
                  <Button 
                    variant="outline-success" 
                    size="sm"
                    onClick={() => window.open(`http://localhost:3006/api/agora/token?channelName=meeting_${meetingId}&uid=test`, '_blank')}
                  >
                    Test Token Generation
                  </Button>
                  <Button 
                    variant="outline-info" 
                    size="sm"
                    onClick={() => window.open('http://localhost:5000/meetingTokens', '_blank')}
                  >
                    View Database Tokens
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <style jsx>{`
        .enhanced-meeting-page {
          padding: 20px;
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        
        .card {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: none;
        }
        
        .card-header {
          background-color: white;
          border-bottom: 1px solid #dee2e6;
        }
      `}</style>
    </Container>
  );
};

export default EnhancedMeetingPage; 