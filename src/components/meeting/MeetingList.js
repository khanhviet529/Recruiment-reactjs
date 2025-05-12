import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../redux/slices/authSlice';
import { Card, Badge, Button } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaVideo, FaUserTie, FaUser, FaBriefcase, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';
import axios from 'axios';
import './MeetingList.scss';
import { 
  categorizeMeetings, 
  formatDateTime, 
  formatTimeRemaining,
  calculateDuration,
  filterMeetingsByUser
} from '../../utils/meetingUtils';

// API URL
const API_URL = 'http://localhost:5000';

const MeetingList = () => {
  const [meetings, setMeetings] = useState([]);
  const [categorizedMeetings, setCategorizedMeetings] = useState({ upcoming: [], ongoing: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector(selectAuth);

  useEffect(() => {
    // Fetch meetings from API
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        
        // Fetch meetings
        const response = await axios.get(`${API_URL}/meetings`);
        const meetingsData = response.data;
        
        // Process meetings to add job and status information
        const processedMeetings = meetingsData.map(meeting => {
          return {
            ...meeting,
            // Add job title if it doesn't exist
            jobTitle: meeting.jobTitle || (meeting.title ? meeting.title.split(' - ')[1] : null)
          };
        });
        
        // Filter meetings based on user role
        const filteredMeetings = filterMeetingsByUser(processedMeetings, user);
        
        // Update meetings state
        setMeetings(filteredMeetings);
        
        // Categorize meetings
        setCategorizedMeetings(categorizeMeetings(filteredMeetings));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching meetings:', error);
        setError('Không thể tải dữ liệu cuộc họp.');
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [user]);

  // Xác định role của người dùng để hiển thị nút tạo meeting
  const isEmployer = user && user.role === 'employer';
  const isAdmin = user && user.role === 'admin';

  const renderStatusBadge = (status) => {
    switch (status) {
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

  // Get meeting creator name
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

  // Get meeting participants
  const getMeetingParticipants = (meeting) => {
    return meeting.participants || [];
  };

  const renderMeetingCard = (meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(meeting.endTime);
    
    // Determine actual meeting status based on time
    const isUpcoming = startTime > now;
    const isOngoing = now >= startTime && now <= endTime;
    const isPast = endTime < now;
    
    // Determine the effective status (combining database status with time-based logic)
    let effectiveStatus = meeting.status;
    
    // Override status based on time if necessary
    if (isUpcoming && meeting.status !== 'cancelled') {
      effectiveStatus = 'scheduled';
    } else if (isOngoing && meeting.status !== 'cancelled') {
      effectiveStatus = 'ongoing';
    } else if (isPast && meeting.status !== 'cancelled') {
      effectiveStatus = 'completed';
    }
    
    const meetingParticipants = getMeetingParticipants(meeting);

    return (
      <Card key={meeting.id} className="meeting-card mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <Card.Title>{meeting.title}</Card.Title>
              {meeting.jobTitle && (
                <div className="job-title">
                  <FaBriefcase className="icon" />
                  <span>{meeting.jobTitle}</span>
                </div>
              )}
            </div>
            {renderStatusBadge(effectiveStatus)}
          </div>
          
          {meeting.description && (
            <div className="meeting-description mt-2 mb-3">
              <p>{meeting.description}</p>
            </div>
          )}
          
          <div className="meeting-info mt-3">
            <div className="info-item">
              <FaCalendarAlt className="icon" />
              <span>{formatDateTime(meeting.startTime)}</span>
            </div>
            <div className="info-item">
              <FaClock className="icon" />
              <span>
                {calculateDuration(meeting.startTime, meeting.endTime)} phút
              </span>
            </div>
            <div className="info-item">
              <FaUserTie className="icon" />
              <span>Người tạo: {getMeetingCreator(meeting)}</span>
            </div>
            
            {meeting.location && (
              <div className="info-item">
                <FaMapMarkerAlt className="icon" />
                <span>{meeting.location}</span>
              </div>
            )}
            
            {meeting.company && meeting.company.name && (
              <div className="info-item">
                <FaBuilding className="icon" />
                <span>{meeting.company.name}</span>
              </div>
            )}
          </div>

          <div className="mt-3">
            <h6>Người tham gia ({meetingParticipants.length}):</h6>
            <div className="participants-list">
              {meetingParticipants.length > 0 ? (
                meetingParticipants.map((participant, index) => (
                  <div key={participant.userId || index} className="participant">
                    {participant.avatar ? (
                      <img
                        src={participant.avatar}
                        alt={participant.name}
                        className="participant-avatar"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = (participant.role === 'employer' || participant.role === 'host') ? 
                            'https://randomuser.me/api/portraits/men/41.jpg' : 
                            'https://randomuser.me/api/portraits/men/42.jpg';
                        }}
                      />
                    ) : (
                      (participant.role === 'employer' || participant.role === 'host') ? 
                      <FaUserTie className="role-icon" /> : 
                      <FaUser className="role-icon" />
                    )}
                    <span>{participant.name || participant.userId}</span>
                    {(participant.role === 'host' || participant.isHost) && 
                      <Badge bg="info" className="ms-1">Chủ trì</Badge>
                    }
                  </div>
                ))
              ) : (
                <div>Không có người tham gia</div>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-end">
            {isOngoing && (
              <Link to={`/meeting/${meeting.id}`}>
                <Button variant="success" className="join-button">
                  <FaVideo className="me-2" />
                  Tham gia ngay
                </Button>
              </Link>
            )}
            
            {isUpcoming && (
              <Button variant="outline-primary" disabled>
                Sẵn sàng lúc {formatDateTime(meeting.startTime)}
              </Button>
            )}
            
            {isPast && meeting.status !== 'scheduled' && (
              <Button variant="outline-secondary" disabled>
                Đã kết thúc
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu cuộc họp...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="meeting-list-container">
      <div className="meeting-list-header">
        <h2>Cuộc họp</h2>
        {(isEmployer || isAdmin) && (
          <Link to="/employer/meetings/create">
          <Button variant="primary">
            Tạo cuộc họp mới
          </Button>
          </Link>
        )}
      </div>

      {categorizedMeetings.ongoing.length > 0 && (
        <div className="meeting-section">
          <h4>Đang diễn ra</h4>
          {categorizedMeetings.ongoing.map(renderMeetingCard)}
        </div>
      )}

      {categorizedMeetings.upcoming.length > 0 && (
        <div className="meeting-section">
          <h4>Sắp diễn ra</h4>
          {categorizedMeetings.upcoming.map(renderMeetingCard)}
        </div>
      )}

      {categorizedMeetings.past.length > 0 && (
        <div className="meeting-section">
          <h4>Đã kết thúc</h4>
          {categorizedMeetings.past.map(renderMeetingCard)}
        </div>
      )}

      {meetings.length === 0 && (
        <div className="empty-state">
          <p>Không có cuộc họp nào.</p>
          {(isEmployer || isAdmin) && (
            <Link to="/employer/meetings/create">
            <Button variant="primary">Tạo cuộc họp đầu tiên</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default MeetingList; 