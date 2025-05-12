import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Badge, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaVideo, FaCalendarAlt, FaClock, FaBuilding, FaMapMarkerAlt, FaBriefcase, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../redux/slices/authSlice';
import './MeetingsPage.scss';
import { 
  categorizeMeetings, 
  formatDateTime, 
  formatTimeRemaining,
  calculateDuration,
  filterMeetingsByUser
} from '../../utils/meetingUtils';

// API URL
const API_URL = 'http://localhost:5000';

const MeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [categorizedMeetings, setCategorizedMeetings] = useState({ upcoming: [], ongoing: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector(selectAuth);
  const location = useLocation();
  
  // Determine which category to show based on the URL path
  const getActiveCategory = () => {
    if (location.pathname.includes('/upcoming')) return 'upcoming';
    if (location.pathname.includes('/ongoing')) return 'ongoing';
    if (location.pathname.includes('/past')) return 'past';
    return 'all'; // Default to show all
  };
  
  const activeCategory = getActiveCategory();

    const fetchMeetings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch meetings
        const response = await axios.get(`${API_URL}/meetings`);
        const meetingsData = response.data;
        
        // Process the data to handle both data formats
        const processedMeetings = meetingsData.map(meeting => {
        // Get candidate participant
        const candidateParticipant = meeting.participants ?
          meeting.participants.find(p => p.userType === 'candidate') : null;
          
        // Get job info from the meeting or default values
        const job = {
          id: meeting.jobId || 'unknown',
          title: meeting.jobTitle || (meeting.title ? meeting.title.split(' - ')[1] : 'Unknown Position')
            };
          
            return {
              ...meeting,
          // Add or update properties
          candidateInfo: candidateParticipant ? {
            id: candidateParticipant.userId,
            name: candidateParticipant.name || 'Unknown Candidate',
            avatar: candidateParticipant.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'
          } : null,
          job,
          // Ensure meeting has company info for display
          company: meeting.company || {
            id: 'company1',
            name: user?.company || 'Your Company',
            logo: 'https://randomuser.me/api/portraits/men/40.jpg',
            location: 'Hồ Chí Minh'
          }
        };
      });
      
      // Filter meetings for this employer
      const filteredMeetings = filterMeetingsByUser(processedMeetings, user);
        
      setMeetings(filteredMeetings);
      setCategorizedMeetings(categorizeMeetings(filteredMeetings));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching meetings:', error);
        setError('Không thể tải dữ liệu cuộc họp.');
        setLoading(false);
      }
    };

  useEffect(() => {
    if (user && user.id) {
    fetchMeetings();
    }
  }, [user]);

  const renderStatusBadge = (status, startTime, endTime) => {
    // Get the current time
    const now = new Date();
    const meetingStartTime = new Date(startTime);
    const meetingEndTime = new Date(endTime);
    
    // Determine the effective status based on time
    let effectiveStatus = status;
    
    // Override status based on time if necessary
    if (meetingStartTime > now && status !== 'cancelled') {
      effectiveStatus = 'scheduled';
    } else if (now >= meetingStartTime && now <= meetingEndTime && status !== 'cancelled') {
      effectiveStatus = 'ongoing';
    } else if (meetingEndTime < now && status !== 'cancelled') {
      effectiveStatus = 'completed';
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
        return <Badge bg="info">{status}</Badge>;
    }
  };

  const getMeetingCreator = (meeting) => {
    if (meeting.createdBy && meeting.createdBy.name) {
      return meeting.createdBy.name;
    }
    
    if (meeting.participants) {
      const host = meeting.participants.find(p => p.role === 'host' || p.isHost);
      if (host) {
        return host.name || host.userId;
      }
    }
    
    return 'Unknown';
  };

  const renderMeetingCards = (meetingsList) => {
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
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      );
    }

    if (meetingsList.length === 0) {
      return (
        <div className="text-center py-5">
          <p className="mb-0">Không có cuộc họp nào trong mục này.</p>
        </div>
      );
    }

    return (
      <Row>
        {meetingsList.map(meeting => {
          // Determine meeting status
          const now = new Date();
          const meetingStartTime = new Date(meeting.startTime);
          const meetingEndTime = new Date(meeting.endTime);
          
          const isUpcoming = meetingStartTime > now && meeting.status !== 'cancelled';
          const isOngoing = now >= meetingStartTime && now <= meetingEndTime && meeting.status !== 'cancelled';
          const isPast = meetingEndTime < now || meeting.status === 'completed' || meeting.status === 'cancelled';
          
          return (
            <Col lg={6} key={meeting.id} className="mb-4">
              <Card className="meeting-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center">
                      <img 
                        src={meeting.company.logo} 
                        alt={meeting.company.name}
                        className="company-logo"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/40';
                        }}
                      />
                      <div className="ms-3">
                        <Card.Title>{meeting.title}</Card.Title>
                        {meeting.job && meeting.job.title && (
                          <div className="job-title">
                            <FaBriefcase className="icon" />
                            <span>{meeting.job.title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {renderStatusBadge(meeting.status, meeting.startTime, meeting.endTime)}
                  </div>

                  {meeting.description && (
                    <div className="meeting-description mt-2 mb-3">
                      <p>{meeting.description}</p>
                    </div>
                  )}

                  <div className="meeting-details">
                    <div className="detail-item">
                      <FaCalendarAlt className="icon" />
                      <span>{formatDateTime(meeting.startTime)}</span>
                    </div>
                    <div className="detail-item">
                      <FaClock className="icon" />
                      <span>
                        {calculateDuration(meeting.startTime, meeting.endTime)} phút
                      </span>
                    </div>
                    <div className="detail-item">
                      <FaMapMarkerAlt className="icon" />
                      <span>{meeting.location || meeting.company.location || 'Online'}</span>
                    </div>
                    <div className="detail-item highlight">
                      <FaClock className="icon" />
                      <span>
                        {isUpcoming 
                          ? formatTimeRemaining(meeting.startTime) 
                          : isOngoing ? 'Đang diễn ra' : 'Đã kết thúc'}
                      </span>
                    </div>
                  </div>

                  {meeting.candidateInfo && (
                    <div className="candidate-info mt-3">
                      <h6>Ứng viên:</h6>
                      <div className="d-flex align-items-center">
                        <img 
                          src={meeting.candidateInfo.avatar} 
                          alt={meeting.candidateInfo.name}
                          className="candidate-avatar"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://randomuser.me/api/portraits/men/1.jpg';
                          }}
                        />
                        <div className="ms-2">
                          <div className="candidate-name">{meeting.candidateInfo.name}</div>
                        </div>
                      </div>
                  </div>
                  )}

                  {isOngoing && (
                    <Alert variant="success" className="mt-3 mb-0">
                      <FaVideo className="me-2" />
                      Cuộc họp đang diễn ra. Bạn có thể tham gia ngay bây giờ!
                    </Alert>
                  )}

                  {isUpcoming && (
                    <Alert variant="info" className="mt-3 mb-0">
                      <FaClock className="me-2" />
                      {formatTimeRemaining(meeting.startTime)}
                    </Alert>
                  )}
                </Card.Body>
                <Card.Footer>
                  <div className="d-flex justify-content-between align-items-center">
                    {meeting.jobId ? (
                      <Link to={`/employer/jobs/${meeting.jobId}`}>
                        <Button variant="outline-primary" size="sm">
                          Xem công việc
                        </Button>
                      </Link>
                    ) : (
                      <span></span>
                    )}

                    {isOngoing && (
                      <div className="d-flex gap-2">
                        <Link to={`/meeting/${meeting.id}`}>
                          <Button variant="success" className="join-button">
                            <FaVideo className="me-2" />
                            Tham gia ngay
                          </Button>
                        </Link>
                        <Link to={`/employer/meetings/${meeting.id}`}>
                          <Button variant="outline-primary">Chi tiết</Button>
                        </Link>
                      </div>
                    )}
                    
                    {isUpcoming && (
                      <Link to={`/employer/meetings/${meeting.id}`}>
                        <Button variant="outline-primary">Chi tiết</Button>
                      </Link>
                    )}
                    
                    {isPast && (
                      <Link to={`/employer/meetings/${meeting.id}`}>
                        <Button variant="outline-secondary">Kết quả</Button>
                      </Link>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  // Determine which meetings to display based on active category
  const getMeetingsToDisplay = () => {
    switch (activeCategory) {
      case 'upcoming':
        return categorizedMeetings.upcoming;
      case 'ongoing':
        return categorizedMeetings.ongoing;
      case 'past':
        return categorizedMeetings.past;
      default:
        return meetings;
    }
  };

  return (
    <>
      {meetings.length === 0 && !loading && !error ? (
        <div className="text-center py-5">
          <h4>Bạn chưa có cuộc họp nào</h4>
          <p className="text-muted mt-3">
            Hãy tạo cuộc họp đầu tiên để bắt đầu phỏng vấn ứng viên
          </p>
            <Link to="/employer/meetings/create">
            <Button variant="primary" className="mt-3">
              <FaPlus className="me-2" />
              Tạo cuộc họp
              </Button>
            </Link>
          </div>
      ) : (
        renderMeetingCards(getMeetingsToDisplay())
      )}
    </>
  );
};

export default MeetingsPage; 