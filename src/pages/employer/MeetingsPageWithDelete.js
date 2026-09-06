import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Badge, Alert, Modal } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaVideo, FaCalendarAlt, FaClock, FaBuilding, FaMapMarkerAlt, FaBriefcase, FaPlus, FaUser, FaTrash, FaEdit } from 'react-icons/fa';
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
import { useMeetings } from '../../hooks/useAgora';

const MeetingsPageWithDelete = () => {
  const [categorizedMeetings, setCategorizedMeetings] = useState({ upcoming: [], ongoing: [], past: [] });
  const [activeTab, setActiveTab] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useSelector(selectAuth);
  const location = useLocation();
  
  const { 
    meetings, 
    loading, 
    error, 
    fetchMeetings,
    deleteMeeting 
  } = useMeetings();
  
  useEffect(() => {
    if (location.pathname.includes('/upcoming')) setActiveTab('upcoming');
    else if (location.pathname.includes('/ongoing')) setActiveTab('ongoing');
    else if (location.pathname.includes('/past')) setActiveTab('past');
    else setActiveTab('all');
  }, [location.pathname]);

  useEffect(() => {
    if (meetings && meetings.length > 0) {
      const processedMeetings = meetings.map(meeting => {
        const candidateParticipant = meeting.participants ?
          meeting.participants.find(p => p.userType === 'candidate' || p.role === 'participant') : null;
          
        const job = {
          id: meeting.jobId || 'unknown',
          title: meeting.jobTitle || (meeting.title ? meeting.title.split(' - ')[1] : 'Unknown Position')
        };
          
        return {
          ...meeting,
          candidateInfo: candidateParticipant ? {
            id: candidateParticipant.userId || candidateParticipant.uid,
            name: candidateParticipant.name || 'Unknown Candidate',
            avatar: candidateParticipant.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'
          } : null,
          job,
          company: meeting.company || {
            id: 'company1',
            name: user?.company || meeting.hostName || 'Your Company',
            logo: 'https://randomuser.me/api/portraits/men/40.jpg',
            location: 'Hồ Chí Minh'
          },
          startTime: meeting.scheduledAt || meeting.startTime,
          endTime: meeting.endedAt || meeting.endTime
        };
      });
      
      const filteredMeetings = filterMeetingsByUser(processedMeetings, user);
      setCategorizedMeetings(categorizeMeetings(filteredMeetings));
    }
  }, [meetings, user]);

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
        return <Badge bg="info">{status}</Badge>;
    }
  };

  const getMeetingCreator = (meeting) => {
    if (meeting.hostName) {
      return meeting.hostName;
    }
    
    if (meeting.participants) {
      const host = meeting.participants.find(p => p.role === 'host' || p.isHost);
      if (host) {
        return host.name || host.userId;
      }
    }
    
    return 'Unknown';
  };

  // Delete meeting functions
  const handleDeleteClick = (meeting, event) => {
    event.preventDefault();
    event.stopPropagation();
    setMeetingToDelete(meeting);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!meetingToDelete) return;
    
    try {
      setDeleteLoading(true);
      await deleteMeeting(meetingToDelete._id || meetingToDelete.id);
      setShowDeleteModal(false);
      setMeetingToDelete(null);
      
      // Show success message
      alert('Cuộc họp đã được xóa thành công!');
      
      // Refetch meetings to update the list
      await fetchMeetings();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('Có lỗi xảy ra khi xóa cuộc họp. Vui lòng thử lại.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setMeetingToDelete(null);
  };

  const canDeleteMeeting = (meeting) => {
    const now = new Date();
    const meetingStartTime = new Date(meeting.startTime);
    
    // Can delete if meeting hasn't started yet or is already cancelled/ended
    return meetingStartTime > now || 
           meeting.status === 'cancelled' || 
           meeting.status === 'ended' ||
           meeting.status === 'completed';
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
            <Button variant="outline-danger" size="sm" onClick={() => fetchMeetings()}>
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
          <Link to="/employer/meetings/create" className="btn btn-primary ms-3">
            <FaPlus className="me-2" />
            Tạo cuộc họp mới
          </Link>
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
                        <span className="">Công ty:</span>
                        <span className="detail-value">{meeting.company?.name || getMeetingCreator(meeting)}</span>
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <div className="detail-item">
                        <FaBriefcase className="detail-icon" />
                        <span className="">Vị trí:</span>
                        <span className="detail-value">{meeting.job?.title || 'Unknown Position'}</span>
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <div className="detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <span className="">Thời gian:</span>
                        <span className="detail-value">{formatDateTime(meeting.startTime)}</span>
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <div className="detail-item">
                        <FaClock className="detail-icon" />
                        <span className="">Thời lượng:</span>
                        <span className="detail-value">{calculateDuration(meeting.startTime, meeting.endTime)}</span>
                      </div>
                    </div>
                    
                    {meeting.candidateInfo && (
                      <div className="detail-row">
                        <div className="detail-item">
                          <FaUser className="detail-icon" />
                          <span className="">Ứng viên:</span>
                          <span className="detail-value">{meeting.candidateInfo.name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="meeting-actions mt-4 d-flex gap-2 flex-wrap">
                    <Link 
                      to={`/employer/meetings/${meeting._id || meeting.id}`}
                      className="btn btn-outline-primary flex-fill"
                    >
                      <FaVideo className="me-2" />
                      Chi tiết
                    </Link>
                    
                    {isOngoing && (
                      <Link 
                        to={`/employer/meetings/${meeting._id || meeting.id}`}
                        className="btn btn-success flex-fill"
                      >
                        <FaVideo className="me-2" />
                        Tham gia ngay
                      </Link>
                    )}

                    {(isUpcoming || isOngoing) && (
                      <Link 
                        to={`/employer/meetings/edit/${meeting._id || meeting.id}`}
                        className="btn btn-outline-secondary"
                      >
                        <FaEdit className="me-2" />
                        Chỉnh sửa
                      </Link>
                    )}

                    {canDeleteMeeting(meeting) && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => handleDeleteClick(meeting, e)}
                        title="Xóa cuộc họp"
                      >
                        <FaTrash />
                      </Button>
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa cuộc họp</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa cuộc họp <strong>"{meetingToDelete?.title}"</strong>?</p>
          <p className="text-muted">Hành động này không thể hoàn tác.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleDeleteCancel}
            disabled={deleteLoading}
          >
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang xóa...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Xóa cuộc họp
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MeetingsPageWithDelete; 