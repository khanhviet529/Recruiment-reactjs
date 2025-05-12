import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Badge, Alert, Tabs, Tab, ListGroup } from 'react-bootstrap';
import { FaVideo, FaCalendarAlt, FaClock, FaBuilding, FaMapMarkerAlt, FaBriefcase, FaArrowLeft, FaUser, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../redux/slices/authSlice';
import './MeetingsPage.scss';
import { formatDateTime, formatTimeRemaining } from '../../utils/meetingUtils';
import TokenModal from '../../components/meeting/TokenModal';
import { getAgoraToken, hasValidAgoraToken } from '../../utils/tokenStorage';

// API URL
const API_URL = 'http://localhost:5000';

const CandidateMeetingDetailPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [job, setJob] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const { user } = useSelector(selectAuth);
  const [showTokenModal, setShowTokenModal] = useState(false);

  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch meeting data
        const response = await axios.get(`${API_URL}/meetings/${meetingId}`);
        const meetingData = response.data;
        
        if (!meetingData) {
          throw new Error('Không tìm thấy cuộc họp');
        }

        // Format the meeting data
        const formattedMeeting = {
          ...meetingData
        };

        // Check if the meeting has a jobId and fetch job details
        if (meetingData.jobId) {
          try {
            const jobResponse = await axios.get(`${API_URL}/jobs/${meetingData.jobId}`);
            if (jobResponse.data) {
              setJob(jobResponse.data);
              
              // Update meeting with job info if not already present
              if (!formattedMeeting.jobTitle) {
                formattedMeeting.jobTitle = jobResponse.data.title;
              }
              
              // Add company info from job
              formattedMeeting.company = {
                id: jobResponse.data.companyId || 'unknown',
                name: jobResponse.data.company || 'Unknown Company',
                logo: jobResponse.data.companyLogo || 'https://randomuser.me/api/portraits/men/40.jpg',
                location: jobResponse.data.location || 'Chưa cập nhật'
        };
            }
          } catch (jobError) {
            console.error('Error fetching job data:', jobError);
            // Continue even if job fetch fails
          }
        } else if (!formattedMeeting.company) {
          // If no job data and no company info, set default company info
          formattedMeeting.company = {
            id: 'unknown',
            name: 'Công ty không xác định',
            logo: 'https://randomuser.me/api/portraits/men/40.jpg',
            location: 'Chưa cập nhật'
          };
        }

        setMeeting(formattedMeeting);
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

  // Filter participants to show relevant information
  const getParticipantsInfo = () => {
    if (!meeting || !meeting.participants) return [];
    
    return meeting.participants.map(participant => ({
      id: participant.userId,
      name: participant.name,
      role: participant.role,
      userType: participant.userType,
      isHost: participant.role === 'host',
      avatar: participant.avatar
    }));
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
            <Link to="/candidate/meetings">
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
            <Link to="/candidate/meetings">
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
  const participants = getParticipantsInfo();
  
  // Find the employer (host) participant
  const employer = participants.find(p => p.isHost || p.userType === 'employer');

  return (
    <div className="meeting-detail-page">
        <div className="mb-4">
          <Link to="/candidate/meetings" className="back-link">
            <FaArrowLeft className="me-2" />
            Quay lại danh sách cuộc họp
          </Link>
        </div>

        <Card className="meeting-detail-card">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Chi tiết cuộc họp</h3>
            {renderStatusBadge(meeting.status || (isOngoing ? 'ongoing' : isUpcoming ? 'scheduled' : 'completed'))}
            </div>
          </Card.Header>
        
          <Card.Body>
            <Row>
              <Col md={8}>
                <div className="meeting-header mb-4">
                  <div className="d-flex align-items-center">
                    {meeting.company && (
                      <img 
                        src={meeting.company.logo} 
                        alt={meeting.company.name}
                        className="company-logo me-3"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/80';
                      }}
                      style={{ width: '80px', height: '80px' }}
                      />
                    )}
                    <div>
                      <h4>{meeting.title}</h4>
                      {meeting.company && (
                        <div className="company-name">
                        <FaBuilding className="me-2" />
                        {meeting.company.name}
                      </div>
                    )}
                    {(meeting.jobTitle || meeting.jobPosition) && (
                      <div className="job-position">
                        <FaBriefcase className="me-2" />
                        {meeting.jobTitle || meeting.jobPosition}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
                <Tab eventKey="details" title="Thông tin cuộc họp">
                  <Card>
                    <Card.Body>
                      <div className="meeting-time-info">
                        <div className="info-item">
                          <div className="info-label">
                            <FaCalendarAlt className="me-2" />
                            Thời gian:
                          </div>
                          <div className="info-value">
                            {formatDateTime(meeting.startTime)}
                    </div>
                    </div>
                        
                        <div className="info-item">
                          <div className="info-label">
                            <FaClock className="me-2" />
                            Thời lượng:
                  </div>
                          <div className="info-value">
                            {formatDuration(meeting.startTime, meeting.endTime)}
                  </div>
                  </div>
                        
                  {isUpcoming && (
                          <div className="info-item highlight">
                            <div className="info-label">
                              <FaClock className="me-2" />
                              Thời gian còn lại:
                            </div>
                            <div className="info-value">
                              {formatTimeRemaining(meeting.startTime)}
                            </div>
                    </div>
                  )}
                        
                        <div className="info-item">
                          <div className="info-label">
                            <FaMapMarkerAlt className="me-2" />
                            Địa điểm:
                          </div>
                          <div className="info-value">
                            {meeting.location || 'Online'}
                          </div>
                    </div>
                </div>

                {meeting.description && (
                        <div className="mt-4">
                          <h5>Mô tả</h5>
                    <p>{meeting.description}</p>
                  </div>
                )}
                    </Card.Body>
                  </Card>
                </Tab>
                
                <Tab eventKey="participants" title="Người tham gia">
                  <Card>
                    <Card.Body>
                      <h5>
                        <FaUsers className="me-2" />
                        Danh sách người tham gia ({participants.length})
                      </h5>
                      <ListGroup className="mt-3">
                        {participants.map(participant => (
                          <ListGroup.Item key={participant.id + participant.name} className="d-flex align-items-center">
                            <img 
                              src={participant.avatar || 'https://via.placeholder.com/50'}
                              alt={participant.name}
                              className="participant-avatar me-3"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/50';
                              }}
                              style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                            />
                            <div>
                              <div className="fw-bold">{participant.name}</div>
                              <div className="text-muted">
                                {participant.isHost 
                                  ? 'Người phỏng vấn' 
                                  : participant.userType === 'candidate' 
                                    ? 'Ứng viên'
                                    : 'Người tham gia'}
                              </div>
                            </div>
                            {participant.id === user.id && (
                              <Badge bg="primary" className="ms-auto">Bạn</Badge>
                            )}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Tab>
                
                {job && (
                  <Tab eventKey="job" title="Thông tin công việc">
                    <Card>
                      <Card.Body>
                        <h5>{job.title}</h5>
                        <div className="company-name mb-3">
                          <FaBuilding className="me-2" />
                          {job.company || meeting.company?.name}
                        </div>
                        
                        {job.description && (
                          <div className="mb-3">
                            <h6>Mô tả công việc:</h6>
                            <p>{job.description}</p>
                          </div>
                        )}
                        
                        {job.requirements && (
                          <div className="mb-3">
                            <h6>Yêu cầu:</h6>
                            <p>{job.requirements}</p>
                          </div>
                        )}
                        
                        <div className="text-center mt-4">
                          <Link to={`/candidate/jobs/${job.id}`}>
                            <Button variant="outline-primary">
                              Xem chi tiết công việc
                            </Button>
                          </Link>
                        </div>
                      </Card.Body>
                    </Card>
                  </Tab>
                )}
              </Tabs>
            </Col>
            
            <Col md={4}>
              <Card className="mb-4">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Thông tin phỏng vấn</h5>
                </Card.Header>
                <Card.Body>
                  {employer && (
                    <div className="interviewer mb-3">
                      <h6>Người phỏng vấn:</h6>
                      <div className="d-flex align-items-center">
                        <img 
                          src={employer.avatar || 'https://randomuser.me/api/portraits/men/41.jpg'}
                          alt={employer.name}
                          className="interviewer-avatar me-2"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://randomuser.me/api/portraits/men/41.jpg';
                          }}
                          style={{ width: '60px', height: '60px', borderRadius: '50%' }}
                        />
                      <div>
                          <div className="fw-bold">{employer.name}</div>
                          <div className="text-muted">Nhà tuyển dụng</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="meeting-actions">
                    {isOngoing && (
                      <Button variant="success" onClick={handleJoinMeeting} className="join-button">
                        <FaVideo className="me-2" />
                        Tham gia ngay
                      </Button>
                )}

                {isUpcoming && (
                      <Button variant="outline-primary" className="w-100 mb-3">
                    <FaCalendarAlt className="me-2" />
                        Thêm vào lịch
                      </Button>
                )}

                    {job && (
                      <Link to={`/candidate/jobs/${job.id}`} className="w-100">
                        <Button variant="outline-secondary" className="w-100">
                          <FaBriefcase className="me-2" />
                          Xem thông tin công việc
                        </Button>
                      </Link>
                    )}
                      </div>
                  </Card.Body>
                </Card>

              {isUpcoming && (
                <Card className="meeting-tips">
                  <Card.Header className="bg-info text-white">
                    <h5 className="mb-0">Chuẩn bị cho buổi phỏng vấn</h5>
                  </Card.Header>
                  <Card.Body>
                    <ul className="tips-list">
                      <li>Kiểm tra kết nối internet, camera và microphone trước khi phỏng vấn.</li>
                      <li>Chuẩn bị môi trường yên tĩnh, ánh sáng tốt.</li>
                      <li>Tìm hiểu về công ty và vị trí bạn đang ứng tuyển.</li>
                      <li>Chuẩn bị câu trả lời cho những câu hỏi thường gặp.</li>
                      <li>Tham gia phỏng vấn sớm 5-10 phút để kiểm tra kết nối.</li>
                    </ul>
                  </Card.Body>
                </Card>
              )}
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

export default CandidateMeetingDetailPage; 