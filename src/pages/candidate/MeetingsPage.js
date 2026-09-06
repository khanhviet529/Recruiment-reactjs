import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Badge, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaVideo, FaCalendarAlt, FaClock, FaBuilding, FaMapMarkerAlt, FaBriefcase, FaUser } from 'react-icons/fa';
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
import axios from 'axios';

const DATABASE_API_BASE = 'http://localhost:5000';

const MeetingsPage = () => {
  const [categorizedMeetings, setCategorizedMeetings] = useState({ upcoming: [], ongoing: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useSelector(selectAuth);
  const location = useLocation();
  
  useEffect(() => {
    if (location.pathname.includes('/upcoming')) setActiveTab('upcoming');
    else if (location.pathname.includes('/ongoing')) setActiveTab('ongoing');
    else if (location.pathname.includes('/past')) setActiveTab('past');
    else setActiveTab('all');
  }, [location.pathname]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${DATABASE_API_BASE}/meetings`);
        const meetings = response.data || [];

        if (meetings.length > 0) {
          const processedMeetings = meetings.map(meeting => {
            const company = meeting.company || {
              id: 'company1',
              name: meeting.title?.split(' - ')[0] || 'Unknown Company',
              logo: 'https://randomuser.me/api/portraits/men/40.jpg',
              location: 'Hồ Chí Minh'
            };
            
            const employer = meeting.participants ? 
              meeting.participants.find(p => p.role === 'host' || p.isHost || p.userType === 'employer') : null;
                
            return {
              ...meeting,
              company,
              employer: employer ? {
                id: employer.userId,
                name: employer.name || 'Nhà tuyển dụng',
                avatar: employer.avatar || 'https://randomuser.me/api/portraits/men/41.jpg'
              } : null,
              jobPosition: meeting.jobTitle || (meeting.title ? meeting.title.split(' - ')[1] : 'Unknown Position'),
              startTime: meeting.scheduledAt || meeting.startTime,
              endTime: meeting.endedAt || meeting.endTime
            };
          });
          
          const filteredMeetings = filterMeetingsByUser(processedMeetings, user);
          setCategorizedMeetings(categorizeMeetings(filteredMeetings));
        } else {
          setCategorizedMeetings({ upcoming: [], ongoing: [], past: [] });
        }
      } catch (error) {
        console.error('Failed to fetch meetings:', error);
        setError('Không thể tải dữ liệu cuộc họp');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMeetings();
    }
  }, [user]);

  const renderStatusBadge = (status, startTime, endTime) => {
    const now = new Date();
    const meetingStartTime = new Date(startTime);
    const meetingEndTime = new Date(endTime);
    
    let effectiveStatus = status;
    
    if (meetingStartTime > now && status !== 'cancelled') {
      effectiveStatus = 'scheduled';
    } else if (now >= meetingStartTime && now <= meetingEndTime && status !== 'cancelled') {
      effectiveStatus = 'active';
    } else if (meetingEndTime < now && status !== 'cancelled') {
      effectiveStatus = 'ended';
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
          <div className="mt-2">
            <Button variant="outline-danger" size="sm" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
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
          const now = new Date();
          const meetingStartTime = new Date(meeting.startTime);
          const meetingEndTime = new Date(meeting.endTime);
          
          const isUpcoming = meetingStartTime > now && meeting.status !== 'cancelled';
          const isOngoing = now >= meetingStartTime && now <= meetingEndTime && meeting.status !== 'cancelled';
          const isPast = meetingEndTime < now || meeting.status === 'completed' || meeting.status === 'cancelled';
          
          return (
            <Col lg={6} key={meeting._id || meeting.id} className="mb-4">
              <Card className="meeting-card h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="meeting-header text-center flex-fill">
                      <Card.Title className="meeting-title mb-0">{meeting.title}</Card.Title>
                    </div>
                    <div className="meeting-status">
                      {renderStatusBadge(meeting.status, meeting.startTime, meeting.endTime)}
                    </div>
                  </div>

                  {meeting.description && (
                    <div className="meeting-description mb-3">
                      <p className="text-muted mb-0">{meeting.description}</p>
                    </div>
                  )}

                  <div className="meeting-details-grid">
                    <div className="detail-row">
                      <div className="detail-item">
                        <FaBuilding className="detail-icon" />
                        <span >Công ty:</span>
                        <span className="detail-value">{meeting.company.name}</span>
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <div className="detail-item">
                        <FaBriefcase className="detail-icon" />
                        <span >Vị trí:</span>
                        <span className="detail-value">{meeting.jobPosition}</span>
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <div className="detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <span >Thời gian:</span>
                        <span className="detail-value">{formatDateTime(meeting.startTime)}</span>
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <div className="detail-item">
                        <FaClock className="detail-icon" />
                        <span >Thời lượng:</span>
                        <span className="detail-value">{calculateDuration(meeting.startTime, meeting.endTime)}</span>
                      </div>
                    </div>
                    
                    {meeting.company.location && (
                      <div className="detail-row">
                        <div className="detail-item">
                          <FaMapMarkerAlt className="detail-icon" />
                          <span >Địa điểm:</span>
                          <span className="detail-value">{meeting.company.location}</span>
                        </div>
                      </div>
                    )}
                    
                    {meeting.employer && (
                      <div className="detail-row">
                        <div className="detail-item">
                          <FaUser className="detail-icon" />
                          <span >Người phỏng vấn:</span>
                          <span className="detail-value">{meeting.employer.name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="meeting-actions mt-4 d-flex gap-2">
                    <Link 
                      to={`/candidate/meetings/${meeting._id || meeting.id}`}
                      className="btn btn-outline-primary flex-fill"
                    >
                      <FaVideo className="me-2" />
                      Chi tiết
                    </Link>
                    
                    {isOngoing && (
                      <Link 
                        to={`/candidate/meetings/${meeting._id || meeting.id}`}
                        className="btn btn-success flex-fill"
                      >
                        <FaVideo className="me-2" />
                        Tham gia ngay
                      </Link>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  const getMeetingsToDisplay = () => {
    switch (activeTab) {
      case 'upcoming':
        return categorizedMeetings.upcoming;
      case 'ongoing':
        return categorizedMeetings.ongoing;
      case 'past':
        return categorizedMeetings.past;
      default:
        return [...categorizedMeetings.upcoming, ...categorizedMeetings.ongoing, ...categorizedMeetings.past];
    }
  };

  return (
    <Container fluid className="meetings-page">
      

      <div className="meetings-content">
        {renderMeetingCards(getMeetingsToDisplay())}
      </div>
    </Container>
  );
};

export default MeetingsPage; 