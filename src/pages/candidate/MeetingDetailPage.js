import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Badge, Alert, Tabs, Tab, ListGroup, Spinner } from 'react-bootstrap';
import { FaVideo, FaCalendarAlt, FaClock, FaBuilding, FaMapMarkerAlt, FaBriefcase, FaArrowLeft, FaUser, FaUsers } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../redux/slices/authSlice';
import './MeetingsPage.scss';
import { formatDateTime, formatTimeRemaining } from '../../utils/meetingUtils';
import { useAgora, useMeetings } from '../../hooks/useAgora';
import { toast } from 'react-toastify';
import axios from 'axios';

const DATABASE_API_BASE = 'http://localhost:5000';

const CandidateMeetingDetailPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [job, setJob] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector(selectAuth);
  
  const { 
    generateMeetingToken, 
    agoraConfig, 
    loading: agoraLoading, 
    error: agoraError 
  } = useAgora();

  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const loadMeetingData = async () => {
      if (!meetingId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch meeting data from database
        const meetingResponse = await axios.get(`${DATABASE_API_BASE}/meetings/${meetingId}`);
        const meetingData = meetingResponse.data;
        
        if (meetingData) {
          setMeeting(meetingData);
          
          // Fetch job data if jobId exists
          if (meetingData.jobId) {
            try {
              const jobResponse = await axios.get(`${DATABASE_API_BASE}/jobs/${meetingData.jobId}`);
              if (jobResponse.data) {
                setJob(jobResponse.data);
              }
            } catch (jobError) {
              console.error('Error fetching job data:', jobError);
            }
          }
        }
      } catch (error) {
        console.error('Error loading meeting data:', error);
        setError('Không thể tải dữ liệu cuộc họp');
        toast.error('Không thể tải dữ liệu cuộc họp');
      } finally {
        setLoading(false);
      }
    };

    loadMeetingData();
  }, [meetingId]);

  const renderStatusBadge = (status) => {
    const now = new Date();
    const startTime = meeting ? new Date(meeting.scheduledAt || meeting.startTime) : null;
    const endTime = meeting ? new Date(meeting.endedAt || meeting.endTime) : null;
    
    let effectiveStatus = status;
    
    if (startTime && endTime) {
      if (startTime > now && status !== 'cancelled') {
        effectiveStatus = 'scheduled';
      } else if (now >= startTime && now <= endTime && status !== 'cancelled') {
        effectiveStatus = 'active';
      } else if (endTime < now && status !== 'cancelled') {
        effectiveStatus = 'ended';
      }
    }
    
    switch (effectiveStatus) {
      case 'scheduled':
        return <Badge bg="primary">Sắp diễn ra</Badge>;
      case 'active':
        return <Badge bg="success">Đang diễn ra</Badge>;
      case 'ended':
      case 'completed':
        return <Badge bg="secondary">Đã kết thúc</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="info">{effectiveStatus}</Badge>;
    }
  };

  const formatDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Chưa xác định';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMinutes = Math.round((end - start) / (1000 * 60));
    
    if (durationMinutes < 60) {
      return `${durationMinutes} phút`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
    }
  };

  const getParticipantsInfo = () => {
    if (!meeting || !meeting.participants) return [];
    
    return meeting.participants.map(participant => ({
      id: participant.uid || participant.userId,
      name: participant.name,
      role: participant.role,
      userType: participant.userType,
      isHost: participant.role === 'host' || participant.isHost,
      avatar: participant.avatar
    }));
  };

  const handleJoinMeeting = async () => {
    if (!meeting || !user) {
      toast.error('Không thể tham gia cuộc họp');
      return;
    }

    try {
      setJoining(true);
      
      // DIRECT JOIN - Navigate directly to meeting room without waiting room
      // This allows candidates to join meetings immediately without employer approval
      navigate(`/meeting/${meeting._id || meeting.id}`);
      
    } catch (error) {
      console.error('Error joining meeting:', error);
      toast.error(`Không thể tham gia cuộc họp: ${error.message}`);
    } finally {
      setJoining(false);
    }
  };

  const canJoinMeeting = () => {
    if (!meeting || !user) return false;
    
    const now = new Date();
    const startTime = new Date(meeting.scheduledAt || meeting.startTime);
    const endTime = new Date(meeting.endedAt || meeting.endTime);
    
    const isScheduled = meeting.status === 'scheduled' && startTime <= now;
    const isActive = meeting.status === 'active';
    const isNotEnded = now <= endTime;
    
    return (isScheduled || isActive) && isNotEnded;
  };

  const combinedLoading = loading || agoraLoading;
  const combinedError = error || agoraError;

  if (combinedLoading) {
    return (
      <Container className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải dữ liệu cuộc họp...</p>
        </div>
      </Container>
    );
  }

  if (combinedError) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {combinedError}
        </Alert>
        <div className="text-center mt-3">
          <Link to="/candidate/meetings">
            <Button variant="primary">Quay lại danh sách cuộc họp</Button>
          </Link>
        </div>
      </Container>
    );
  }

  if (!meeting) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          Không tìm thấy cuộc họp
        </Alert>
        <div className="text-center mt-3">
          <Link to="/candidate/meetings">
            <Button variant="primary">Quay lại danh sách cuộc họp</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-4">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(-1)}
          className="me-3"
        >
          <FaArrowLeft /> Quay lại
        </Button>
      </div>

      <Row>
        <Col lg={8}>
          <Card className="meeting-detail-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h3 className="mb-0">{meeting.title}</h3>
              {renderStatusBadge(meeting.status)}
            </Card.Header>
            <Card.Body>
              <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
                <Tab eventKey="details" title="Chi tiết">
                  <div className="meeting-details">
                    {meeting.description && (
                      <div className="mb-4">
                        <h5>Mô tả</h5>
                        <p>{meeting.description}</p>
                      </div>
                    )}

                    <Row>
                      <Col md={6}>
                        <div className="detail-item mb-3">
                          <FaCalendarAlt className="icon text-primary" />
                          <div>
                            <strong>Thời gian:</strong>
                            <br />
                            {formatDateTime(meeting.scheduledAt || meeting.startTime)}
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="detail-item mb-3">
                          <FaClock className="icon text-primary" />
                          <div>
                            <strong>Thời lượng:</strong>
                            <br />
                            {formatDuration(
                              meeting.scheduledAt || meeting.startTime, 
                              meeting.endedAt || meeting.endTime
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {meeting.hostName && (
                      <div className="detail-item mb-3">
                        <FaUser className="icon text-primary" />
                        <div>
                          <strong>Người tổ chức:</strong>
                          <br />
                          {meeting.hostName}
                        </div>
                      </div>
                    )}

                    {job && (
                      <div className="job-info mt-4 p-3 border rounded">
                        <h5>Thông tin công việc</h5>
                        <div className="detail-item mb-2">
                          <FaBriefcase className="icon text-primary" />
                          <span>{job.title}</span>
                        </div>
                        <div className="detail-item mb-2">
                          <FaBuilding className="icon text-primary" />
                          <span>{job.company}</span>
                        </div>
                        <div className="detail-item">
                          <FaMapMarkerAlt className="icon text-primary" />
                          <span>{job.location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="participants" title="Người tham gia">
                  <ListGroup>
                    {getParticipantsInfo().map((participant, index) => (
                      <ListGroup.Item key={participant.id || index} className="d-flex align-items-center">
                        <div className="avatar-placeholder rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: '#f8f9fa' }}>
                          <FaUser className="text-muted" />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold">{participant.name}</div>
                          <small className="text-muted">
                            {participant.isHost ? 'Người tổ chức' : 'Người tham gia'}
                          </small>
                        </div>
                        {participant.isHost && (
                          <Badge bg="primary">Host</Badge>
                        )}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="action-card">
            <Card.Body className="text-center">
              <FaVideo size={48} className="text-primary mb-3" />
              <h5>Tham gia cuộc họp</h5>
              
              {canJoinMeeting() ? (
                <>
                  <p className="text-muted mb-4">
                    Cuộc họp đã sẵn sàng. Nhấp vào nút bên dưới để tham gia.
                  </p>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-100"
                    onClick={handleJoinMeeting}
                    disabled={joining}
                  >
                    {joining ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Đang kết nối...
                      </>
                    ) : (
                      <>
                        <FaVideo className="me-2" />
                        Tham gia ngay
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted mb-4">
                    {meeting.status === 'cancelled' ? 'Cuộc họp đã bị hủy' :
                     meeting.status === 'ended' || meeting.status === 'completed' ? 'Cuộc họp đã kết thúc' :
                     'Cuộc họp chưa bắt đầu'}
                  </p>
                  <Button variant="secondary" size="lg" className="w-100" disabled>
                    Không thể tham gia
                  </Button>
                </>
              )}

              {agoraConfig && (
                <div className="mt-3">
                  <small className="text-muted">
                    {/* Powered by Agora • App ID: {agoraConfig.appID?.substring(0, 8)}... */}
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CandidateMeetingDetailPage; 