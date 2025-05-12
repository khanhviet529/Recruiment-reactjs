import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Badge, Alert, Table, Tabs, Tab, ListGroup, Modal, Form } from 'react-bootstrap';
import { FaVideo, FaCalendarAlt, FaClock, FaUser, FaArrowLeft, FaEdit, FaTrash, FaUserTie, FaEnvelope, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../redux/slices/authSlice';
import './MeetingsPage.scss';
import { formatDateTime, formatTimeRemaining } from '../../utils/meetingUtils';
import Select from 'react-select';
import TokenModal from '../../components/meeting/TokenModal';
import { getAgoraToken, hasValidAgoraToken } from '../../utils/tokenStorage';

// API URL
const API_URL = 'http://localhost:5000';

const EmployerMeetingDetailPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector(selectAuth);
  const [candidates, setCandidates] = useState([]);
  const [showTokenModal, setShowTokenModal] = useState(false);

  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch meeting data
        const meetingResponse = await axios.get(`${API_URL}/meetings/${meetingId}`);
        const meetingData = meetingResponse.data;
        
        if (!meetingData) {
          throw new Error('Không tìm thấy cuộc họp');
        }

        // Fetch participants for this meeting
        const participantsResponse = await axios.get(`${API_URL}/meetingParticipants`);
        const meetingParticipants = participantsResponse.data.filter(p => p.meetingId === meetingId);

        // Fetch logs for this meeting
        const logsResponse = await axios.get(`${API_URL}/meetingLogs`);
        const meetingLogs = logsResponse.data.filter(log => log.meetingId === meetingId);

        // Extract candidate participants from meeting data
        const candidateParticipants = meetingData.participants ? 
          meetingData.participants.filter(p => p.userType === 'candidate') : [];
        
        // Get unique candidate IDs
        const candidateIds = [...new Set(candidateParticipants.map(p => p.userId))];
        
        // Fetch all candidates to get their details
        const allCandidatesResponse = await axios.get(`${API_URL}/candidates`);
        const allCandidates = allCandidatesResponse.data;
        
        // Match candidate participants with their full details
        const candidatesWithDetails = [];
        for (const candidateId of candidateIds) {
          // Find candidate in all candidates
          const candidateDetails = allCandidates.find(
            c => c.id === candidateId || c.userId === candidateId
          );
          
          if (candidateDetails) {
            // Find participant info
            const participantInfo = candidateParticipants.find(p => p.userId === candidateId);
            
            // Merge data
            candidatesWithDetails.push({
              ...candidateDetails,
              participantInfo
            });
          } else {
            // If candidate details not found, use participant info only
            const participantInfo = candidateParticipants.find(p => p.userId === candidateId);
            candidatesWithDetails.push({
              id: candidateId,
              userId: candidateId,
              firstName: participantInfo?.name?.split(' ').slice(-1)[0] || '',
              lastName: participantInfo?.name?.split(' ').slice(0, -1).join(' ') || 'Ứng viên',
              email: participantInfo?.email || 'candidate@example.com',
              avatar: participantInfo?.avatar || 'https://via.placeholder.com/70',
              participantInfo
            });
          }
        }
        
        setCandidates(candidatesWithDetails);
        
        // If we have a job ID, fetch applications for this job
        if (meetingData.jobId) {
          try {
            const applicationsResponse = await axios.get(`${API_URL}/applications`);
            // Filter applications for this job
            const jobApps = applicationsResponse.data.filter(app => 
              app.jobId == meetingData.jobId || app.jobId === meetingData.jobId.toString()
            );
          } catch (err) {
            console.error('Error fetching job applications:', err);
          }
        }

        setMeeting(meetingData);
        setParticipants(meetingParticipants);
        setLogs(meetingLogs);
      } catch (error) {
        console.error('Error fetching meeting data:', error);
        setError(error.message || 'Không thể tải dữ liệu cuộc họp');
      } finally {
        setLoading(false);
      }
    };

    if (meetingId) {
      fetchMeetingData();
    }
  }, [meetingId]);

  const renderStatusBadge = (status) => {
    const now = new Date();
    const startTime = meeting ? new Date(meeting.startTime) : null;
    const endTime = meeting ? new Date(meeting.endTime) : null;
    
    // Determine the effective status based on time
    let effectiveStatus = status;
    
    // If we have meeting times, override status based on time logic
    if (startTime && endTime) {
      if (startTime > now && status !== 'cancelled') {
        effectiveStatus = 'scheduled';
      } else if (now >= startTime && now <= endTime && status !== 'cancelled') {
        effectiveStatus = 'ongoing';
      } else if (endTime < now && status !== 'cancelled') {
        effectiveStatus = 'completed';
      }
    }
    
    switch (effectiveStatus) {
      case 'scheduled':
        return <Badge bg="primary">Sắp diễn ra</Badge>;
      case 'ongoing':
        return <Badge bg="success">Đang diễn ra</Badge>;
      case 'completed':
        return <Badge bg="secondary">Đã kết thúc</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="info">{effectiveStatus}</Badge>;
    }
  };

  const formatDuration = (startDate, endDate) => {
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

  const renderParticipantStatus = (status) => {
    switch (status) {
      case 'accepted':
        return <Badge bg="success">Đã chấp nhận</Badge>;
      case 'pending':
        return <Badge bg="warning">Đang chờ</Badge>;
      case 'rejected':
        return <Badge bg="danger">Từ chối</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Xử lý khi người dùng nhấn nút tham gia cuộc họp
  const handleJoinMeeting = () => {
    // Kiểm tra xem đã có token hợp lệ chưa
    if (hasValidAgoraToken()) {
      // Nếu có token, chuyển hướng đến trang cuộc họp
      navigate(`/meeting/${meetingId}`);
    } else {
      // Nếu chưa có token, hiển thị modal nhập token
      setShowTokenModal(true);
    }
  };

  // Xử lý khi người dùng đã nhập token
  const handleTokenSubmit = (token) => {
    // Đóng modal
    setShowTokenModal(false);
    
    // Chuyển hướng đến trang cuộc họp
    navigate(`/meeting/${meetingId}`);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-3">Đang tải dữ liệu cuộc họp...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Alert variant="danger">
          {error}
        </Alert>
        <div className="text-center mt-3">
          <Link to="/employer/meetings">
            <Button variant="primary">Quay lại danh sách cuộc họp</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div>
        <Alert variant="warning">
          Không tìm thấy thông tin cuộc họp
        </Alert>
        <div className="text-center mt-3">
          <Link to="/employer/meetings">
            <Button variant="primary">Quay lại danh sách cuộc họp</Button>
          </Link>
        </div>
      </div>
    );
  }

  const now = new Date();
  const startTime = new Date(meeting.startTime);
  const endTime = new Date(meeting.endTime);
  
  const isUpcoming = startTime > now && meeting.status !== 'cancelled';
  const isOngoing = now >= startTime && now <= endTime && meeting.status !== 'cancelled';
  const isPast = endTime < now || meeting.status === 'completed' || meeting.status === 'cancelled';

  return (
    <div className="meeting-detail-page">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <Link to="/employer/meetings" className="back-link">
          <FaArrowLeft className="me-2" />
          Quay lại danh sách cuộc họp
        </Link>
        
        <div>
          {isUpcoming && (
            <Link to={`/employer/meetings/edit/${meetingId}`}>
              <Button variant="outline-primary" className="me-2">
                <FaEdit className="me-2" />
                Chỉnh sửa
              </Button>
            </Link>
          )}
          {isOngoing && (
            <Button variant="success" onClick={handleJoinMeeting} className="join-button">
              <FaVideo className="me-2" />
              Tham gia ngay
            </Button>
          )}
        </div>
      </div>

      <Card className="meeting-detail-card">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Chi tiết cuộc họp</h3>
            {renderStatusBadge(meeting.status)}
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <h4>{meeting.title}</h4>
              {meeting.description && (
                <p className="text-muted mt-2">{meeting.description}</p>
              )}
              
              <div className="meeting-details mt-4">
                <div className="detail-item">
                  <FaCalendarAlt className="icon" />
                  <span>Thời gian bắt đầu: {formatDateTime(meeting.startTime)}</span>
                </div>
                <div className="detail-item">
                  <FaCalendarAlt className="icon" />
                  <span>Thời gian kết thúc: {formatDateTime(meeting.endTime)}</span>
                </div>
                <div className="detail-item">
                  <FaClock className="icon" />
                  <span>Thời lượng: {formatDuration(meeting.startTime, meeting.endTime)}</span>
                </div>
                {isUpcoming && (
                  <div className="detail-item highlight">
                    <FaClock className="icon" />
                    <span>{formatTimeRemaining(meeting.startTime)}</span>
                  </div>
                )}
                {meeting.channelName && (
                  <div className="detail-item">
                    <FaVideo className="icon" />
                    <span>Channel: {meeting.channelName}</span>
                  </div>
                )}
              </div>

              {isOngoing && (
                <Alert variant="success" className="mt-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <FaVideo className="me-2" />
                      Cuộc họp đang diễn ra. Bạn có thể tham gia ngay bây giờ!
                    </div>
                    <Button variant="success" onClick={handleJoinMeeting} className="join-button">
                      <FaVideo className="me-2" />
                      Tham gia ngay
                    </Button>
                  </div>
                </Alert>
              )}

              {isUpcoming && (
                <Alert variant="info" className="mt-4">
                  <FaCalendarAlt className="me-2" />
                  Cuộc họp sẽ diễn ra vào {formatDateTime(meeting.startTime)}
                </Alert>
              )}

              {isPast && (
                <Alert variant="secondary" className="mt-4">
                  <FaCalendarAlt className="me-2" />
                  Cuộc họp đã kết thúc vào {formatDateTime(meeting.endTime)}
                </Alert>
              )}

              <Card className="mt-4">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <FaUsers className="me-2" />
                      Danh sách ứng viên tham gia ({candidates.length})
                    </h5>
                    {/* {isUpcoming && meeting.jobId && (
                      <Link to={`/employer/meetings/edit/${meetingId}`}>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                        >
                          <FaEdit className="me-2" />
                          Chỉnh sửa ứng viên
                        </Button>
                      </Link>
                    )} */}
                  </div>
                </Card.Header>
                <Card.Body>
                  {candidates.length > 0 ? (
                    <ListGroup className="candidates-list">
                      {candidates.map((candidate) => (
                        <ListGroup.Item key={candidate.id || candidate.userId} className="p-3">
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <img 
                                src={candidate.avatar || candidate.participantInfo?.avatar || 'https://via.placeholder.com/70'} 
                                alt={`${candidate.firstName || ''} ${candidate.lastName || ''}`}
                                className="rounded-circle"
                                style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/70';
                                }}
                              />
                            </div>
                            <div className="candidate-info flex-grow-1">
                              <h5 className="mb-1">
                                {candidate.firstName && candidate.lastName 
                                  ? `${candidate.firstName} ${candidate.lastName}`
                                  : candidate.participantInfo?.name || 'Ứng viên'}
                              </h5>
                              <div className="text-muted">{candidate.email || candidate.participantInfo?.email}</div>
                              {candidate.phone && (
                                <div className="text-muted">{candidate.phone}</div>
                              )}
                              {candidate.application && (
                                <Badge bg="info" className="mt-2">
                                  {candidate.application.status === 'pending' && 'Đang chờ xử lý'}
                                  {candidate.application.status === 'reviewing' && 'Đang xem xét'}
                                  {candidate.application.status === 'shortlisted' && 'Vào danh sách ngắn'}
                                  {candidate.application.status === 'interview' && 'Phỏng vấn'}
                                  {candidate.application.status === 'offered' && 'Đã đề nghị'}
                                  {candidate.application.status === 'hired' && 'Đã tuyển'}
                                  {candidate.application.status === 'rejected' && 'Từ chối'}
                                </Badge>
                              )}
                            </div>
                            <div className="ms-3">
                              <Link to={`/employer/applications/${candidate.application?.id || candidate.id || candidate.userId}`}>
                                <Button variant="outline-primary" size="sm">
                                  Xem hồ sơ
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <Alert variant="info">
                      Chưa có ứng viên nào được thêm vào cuộc họp này.
                      {meeting.jobId && (
                        <div className="mt-2">
                          <Link to={`/employer/jobs/${meeting.jobId}`}>
                            <Button variant="outline-primary" size="sm">
                              Xem danh sách ứng tuyển
                            </Button>
                          </Link>
                        </div>
                      )}
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              {meeting.candidateInfo && (
                <Card className="candidate-card mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Thông tin ứng viên</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center mb-3">
                      <img 
                        src={meeting.candidateInfo.avatar} 
                        alt={meeting.candidateInfo.name}
                        className="candidate-avatar-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/70';
                        }}
                      />
                      <h5 className="mt-3">{meeting.candidateInfo.name}</h5>
                      <p className="text-muted">{meeting.candidateInfo.position}</p>
                    </div>
                    
                    <div className="candidate-contact-info">
                      <div className="contact-item">
                        <FaEnvelope className="icon" />
                        <span>{meeting.candidateInfo.email}</span>
                      </div>
                      {meeting.candidateInfo.phone && (
                        <div className="contact-item">
                          <FaUser className="icon" />
                          <span>{meeting.candidateInfo.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="d-grid gap-2 mt-3">
                      <Button variant="outline-primary" size="sm">
                        Xem hồ sơ chi tiết
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}
              
              <Card className="meeting-actions-card">
                <Card.Header>
                  <h5 className="mb-0">Hành động</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-grid gap-2">
                    {isOngoing && (
                      <Link to={`/meeting/${meeting.id}`}>
                        <Button variant="success" className="w-100">
                          <FaVideo className="me-2" />
                          Tham gia cuộc họp
                        </Button>
                      </Link>
                    )}
                    {isUpcoming && (
                      <>
                        <Link to={`/employer/meetings/edit/${meeting.id}`}>
                          <Button variant="outline-primary" className="w-100">
                            <FaEdit className="me-2" />
                            Chỉnh sửa cuộc họp
                          </Button>
                        </Link>
                        <Button variant="outline-danger" className="w-100">
                          <FaTrash className="me-2" />
                          Hủy cuộc họp
                        </Button>
                      </>
                    )}
                    <Button variant="outline-secondary" className="w-100">
                      <FaCalendarAlt className="me-2" />
                      Thêm vào lịch
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Modal nhập token */}
      <TokenModal
        show={showTokenModal}
        onHide={() => setShowTokenModal(false)}
        onTokenSubmit={handleTokenSubmit}
        meeting={meeting}
      />
    </div>
  );
};

export default EmployerMeetingDetailPage; 