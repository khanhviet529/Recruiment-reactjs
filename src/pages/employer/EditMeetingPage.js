import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col, ListGroup } from 'react-bootstrap';
import { FaVideo, FaCalendarAlt, FaClock, FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { getCandidateAvatar } from '../../utils/avatarUtils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getStartTime = (meetingData) => {
  return meetingData.startTime || meetingData.scheduledAt || '';
};

const getEndTime = (meetingData) => {
  return meetingData.endTime || meetingData.endedAt || '';
};

const formatDateForForm = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().slice(0, 16);
};

const EmployerEditMeetingPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [status, setStatus] = useState('scheduled');
  const [participants, setParticipants] = useState([]);
  const [candidates, setCandidates] = useState([]);
  
  const calculateEndTime = () => {
    if (!startTime) return '';
    const start = new Date(startTime);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + parseInt(duration));
    return formatDateForForm(end.toISOString());
  };

  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching meeting with ID:', meetingId);
        console.log('API URL:', `${API_URL}/meetings/${meetingId}`);

        const response = await axios.get(`${API_URL}/meetings/${meetingId}`);
        const meetingData = response.data;
        
        console.log('Meeting data received:', meetingData);

        if (!meetingData) {
          throw new Error('Không tìm thấy cuộc họp');
        }

        let meetingParticipants = meetingData.participants || [];
        if (!meetingParticipants || meetingParticipants.length === 0) {
          try {
            const participantsResponse = await axios.get(`${API_URL}/meetingParticipants`);
            meetingParticipants = participantsResponse.data.filter(p => p.meetingId === meetingId);
          } catch (err) {
            console.error("Error fetching participants:", err);
          }
        }

        const startTimeValue = getStartTime(meetingData);
        const endTimeValue = getEndTime(meetingData);
        let calculatedDuration = 30;
        
        if (startTimeValue && endTimeValue) {
          const start = new Date(startTimeValue);
          const end = new Date(endTimeValue);
          calculatedDuration = Math.round((end - start) / (1000 * 60));
        }

        setTitle(meetingData.title || '');
        setDescription(meetingData.description || '');
        setStartTime(formatDateForForm(startTimeValue));
        setDuration(calculatedDuration);
        setStatus(meetingData.status || 'scheduled');
        setParticipants(meetingParticipants || []);

        const candidateParticipants = meetingParticipants ? 
          meetingParticipants.filter(p => p.userType === 'candidate' || p.role === 'attendee') : [];
        
        const candidateIds = [...new Set(candidateParticipants.map(p => p.userId))];
        
        try {
          const allCandidatesResponse = await axios.get(`${API_URL}/candidates`);
          const allCandidates = allCandidatesResponse.data;
          
          const candidatesWithDetails = [];
          for (const candidateId of candidateIds) {
            const candidateDetails = allCandidates.find(
              c => c.id === candidateId || c.userId === candidateId
            );
            
            if (candidateDetails) {
              const participantInfo = candidateParticipants.find(p => p.userId === candidateId);
              candidatesWithDetails.push({
                ...candidateDetails,
                avatar: candidateDetails.avatar || candidateDetails.profilePicture || candidateDetails.picture || 'https://via.placeholder.com/70',
                participantInfo
              });
            } else {
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
        } catch (candidateError) {
          console.error('Error fetching candidates:', candidateError);
          setCandidates([]);
        }
        
      } catch (error) {
        console.error('Error fetching meeting data:', error);
        setError(`Lỗi tải dữ liệu: ${error.response?.status === 404 ? 'Không tìm thấy cuộc họp' : error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (meetingId) {
      fetchMeetingData();
    }
  }, [meetingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !startTime) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const currentMeetingResponse = await axios.get(`${API_URL}/meetings/${meetingId}`);
      const currentMeeting = currentMeetingResponse.data;

      const candidateIds = participants
        .filter(p => p.userType === 'candidate' || p.role === 'attendee')
        .map(p => p.userId);

      const meetingData = {
        title,
        description,
        status,
        duration: parseInt(duration),
        participants: participants,
        candidateIds: candidateIds,
        updatedAt: new Date().toISOString()
      };

      if (currentMeeting.startTime !== undefined) {
        meetingData.startTime = new Date(startTime).toISOString();
        meetingData.endTime = new Date(calculateEndTime()).toISOString();
      } else {
        meetingData.scheduledAt = new Date(startTime).toISOString();
        meetingData.endedAt = new Date(calculateEndTime()).toISOString();
      }

      await axios.patch(`${API_URL}/meetings/${meetingId}`, meetingData);
      
      setSuccess('Cập nhật cuộc họp thành công!');
      
      setTimeout(() => {
        navigate(`/employer/meetings/${meetingId}`);
      }, 2000);
    } catch (error) {
      console.error('Error updating meeting:', error);
      setError(`Lỗi cập nhật: ${error.response?.status === 404 ? 'Không tìm thấy cuộc họp' : error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = (userId) => {
    if (participants.find(p => p.userId === userId)?.role === 'host') {
      return;
    }

    const updatedParticipants = participants.filter(p => p.userId !== userId);
    setParticipants(updatedParticipants);
    
    const updatedCandidates = candidates.filter(c => (c.id !== userId && c.userId !== userId));
    setCandidates(updatedCandidates);
  };

  if (loading && !title) {
    return (
      <Container className="mt-4 mb-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải dữ liệu cuộc họp...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="meeting-detail-page">
      <Container className="mt-4 mb-4">
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <Link to="/employer/meetings" className="back-link">
            <FaArrowLeft className="me-2" />
            Quay lại danh sách cuộc họp
          </Link>
        </div>
      
        <Card className="meeting-edit-card">
          <Card.Header>
            <h4><FaVideo className="me-2" /> Chỉnh sửa cuộc họp</h4>
          </Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Tiêu đề cuộc họp <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập tiêu đề cuộc họp"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Nhập mô tả cuộc họp"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><FaCalendarAlt className="me-2" /> Thời gian bắt đầu <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><FaClock className="me-2" /> Thời lượng (phút) <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    >
                      <option value="30">30 phút</option>
                      <option value="45">45 phút</option>
                      <option value="60">60 phút</option>
                      <option value="90">90 phút</option>
                      <option value="120">120 phút</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Thời gian kết thúc: {calculateEndTime() ? new Date(calculateEndTime()).toLocaleString('vi-VN') : 'Chưa xác định'}
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="scheduled">Sắp diễn ra</option>
                  <option value="ongoing">Đang diễn ra</option>
                  <option value="completed">Đã kết thúc</option>
                  <option value="cancelled">Đã hủy</option>
                </Form.Select>
              </Form.Group>

              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Ứng viên tham gia ({candidates.length})</h5>
                </Card.Header>
                <Card.Body>
                  {candidates.length > 0 ? (
                    <ListGroup className="candidates-list">
                      {candidates.map((candidate) => (
                        <ListGroup.Item key={candidate.id || candidate.userId} className="p-3">
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <img
                                src={getCandidateAvatar(candidate)}
                                alt={candidate.firstName && candidate.lastName 
                                  ? `${candidate.firstName} ${candidate.lastName}`
                                  : candidate.participantInfo?.name || 'Ứng viên'}
                                className="rounded-circle"
                                style={{ width: '70px', height: '70px', objectFit: 'cover', border: '2px solid #f8f9fa' }}
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
                            </div>
                            <div className="ms-3">
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleRemoveParticipant(candidate.id || candidate.userId)}
                              >
                                <FaTimes className="me-1" /> Xóa
                              </Button>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <Alert variant="info">
                      Chưa có ứng viên nào được thêm vào cuộc họp này.
                    </Alert>
                  )}
                </Card.Body>
              </Card>

              <div className="d-flex justify-content-end mt-4">
                <Link to={`/employer/meetings/${meetingId}`}>
                  <Button 
                    variant="secondary" 
                    className="me-2"
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={loading}
                >
                  <FaSave className="me-2" />
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default EmployerEditMeetingPage;