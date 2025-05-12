import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Row, Col, Button, Alert, Badge, ListGroup } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaVideo, FaCalendarAlt, FaClock, FaSave, FaUserPlus, FaUser, FaTimes, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import Select from 'react-select';
import './MeetingsPage.scss';
import { formatDateForInput } from '../../utils/meetingUtils';

// API URL
const API_URL = 'http://localhost:5000';

const EmployerEditMeetingPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('scheduled');
  const [channelName, setChannelName] = useState('');
  const [jobId, setJobId] = useState('');
  const [participants, setParticipants] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);

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

        // Fetch participants for this meeting - if participants not in meeting data
        let meetingParticipants = meetingData.participants || [];
        if (!meetingParticipants || meetingParticipants.length === 0) {
          try {
            const participantsResponse = await axios.get(`${API_URL}/meetingParticipants`);
            meetingParticipants = participantsResponse.data.filter(p => p.meetingId === meetingId);
          } catch (err) {
            console.error("Error fetching participants:", err);
          }
        }

        // Set form data
        setTitle(meetingData.title || '');
        setDescription(meetingData.description || '');
        setStartTime(formatDateForInput(meetingData.startTime));
        setEndTime(formatDateForInput(meetingData.endTime));
        setStatus(meetingData.status || 'scheduled');
        setChannelName(meetingData.channelName || '');
        setJobId(meetingData.jobId || '');
        setParticipants(meetingParticipants || []);

        // Extract candidate participants from meeting data
        const candidateParticipants = meetingParticipants ? 
          meetingParticipants.filter(p => p.userType === 'candidate' || p.role === 'attendee') : [];
        
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
            setJobApplications(jobApps);
            
            // Fetch available candidates for this job
            await fetchAvailableCandidatesForJob(meetingData.jobId, meetingParticipants);
          } catch (err) {
            console.error('Error fetching job applications:', err);
          }
        }
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

  // Fetch available candidates for a specific job
  const fetchAvailableCandidatesForJob = async (jobId, currentParticipants = []) => {
    try {
      if (!jobId) {
        setAvailableCandidates([]);
        return;
      }
      
      // Get all candidates who applied for this job
      const applicationsResponse = await axios.get(`${API_URL}/applications`);
      const jobApplications = applicationsResponse.data.filter(app => 
        app.jobId == jobId || app.jobId === jobId.toString()
      );
      
      if (jobApplications.length === 0) {
        setAvailableCandidates([]);
        return;
      }
      
      // Get candidate IDs from applications
      const appliedCandidateIds = jobApplications.map(app => app.candidateId);
      
      // Get current participant IDs in the meeting
      const currentParticipantIds = currentParticipants
        .filter(p => p.userType === 'candidate' || p.role === 'attendee')
        .map(p => p.userId);
      
      console.log('Current participants:', currentParticipantIds);
      
      // Fetch all candidates
      const candidatesResponse = await axios.get(`${API_URL}/candidates`);
      const allCandidates = candidatesResponse.data;
      
      // Filter candidates who:
      // 1. Have applied to this job
      // 2. Are not already in the meeting
      const availableCandidatesList = allCandidates.filter(candidate => {
        const candidateId = candidate.id || candidate.userId;
        if (!candidateId) return false;
        
        // Check if candidate has applied to this job
        const hasApplied = appliedCandidateIds.some(id => 
          id === candidateId || id === candidateId.toString()
        );
        
        // Check if candidate is already in the meeting
        const isAlreadyInMeeting = currentParticipantIds.some(id => 
          id === candidateId || id === candidateId.toString()
        );
        
        console.log(`Candidate ${candidateId}: applied=${hasApplied}, inMeeting=${isAlreadyInMeeting}`);
        
        return hasApplied && !isAlreadyInMeeting;
      });
      
      console.log('Available candidates:', availableCandidatesList.map(c => c.id || c.userId));
      
      // Format candidates for select component
      const formattedCandidates = availableCandidatesList.map(candidate => ({
        value: candidate.id || candidate.userId,
        label: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || candidate.email || 'Ứng viên',
        data: candidate
      }));
      
      setAvailableCandidates(formattedCandidates);
    } catch (error) {
      console.error('Error fetching available candidates:', error);
      setError('Không thể tải danh sách ứng viên. Vui lòng thử lại sau.');
    }
  };

  useEffect(() => {
    // When jobId changes, fetch candidates who applied to this job
    if (jobId) {
      fetchAvailableCandidatesForJob(jobId, participants);
    } else {
      setAvailableCandidates([]);
    }
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !startTime || !endTime) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get candidate IDs from participants
      const candidateIds = participants
        .filter(p => p.userType === 'candidate' || p.role === 'attendee')
        .map(p => p.userId);

      // Prepare meeting data
      const meetingData = {
        title,
        description,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        status,
        channelName: channelName || `meeting-${meetingId}`,
        jobId: jobId || null,
        participants: participants,
        candidateIds: candidateIds,
        updatedAt: new Date().toISOString()
      };

      // Update meeting
      await axios.patch(`${API_URL}/meetings/${meetingId}`, meetingData);
      
      setSuccess('Cập nhật cuộc họp thành công!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/employer/meetings/${meetingId}`);
      }, 2000);
    } catch (error) {
      console.error('Error updating meeting:', error);
      setError('Không thể cập nhật cuộc họp. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidates = () => {
    if (!selectedCandidates || selectedCandidates.length === 0) return;
    
    // Add new candidates to participants
    const newParticipants = selectedCandidates.map(candidate => ({
      userId: candidate.value,
      name: candidate.label,
      email: candidate.data.email || '',
      avatar: candidate.data.avatar || '',
      userType: 'candidate',
      role: 'attendee',
      status: 'pending'
    }));

    // Add to participants list
    setParticipants([...participants, ...newParticipants]);
    
    // Add to candidates list for display
    const newCandidatesWithDetails = selectedCandidates.map(candidate => ({
      ...candidate.data,
      participantInfo: {
        userId: candidate.value,
        name: candidate.label,
        email: candidate.data.email || '',
        avatar: candidate.data.avatar || '',
      }
    }));
    
    setCandidates([...candidates, ...newCandidatesWithDetails]);
    
    // Reset selection
    setSelectedCandidates([]);
    
    // Update available candidates list
    if (jobId) {
      fetchAvailableCandidatesForJob(jobId, [...participants, ...newParticipants]);
    }
  };

  const handleRemoveParticipant = (userId) => {
    // Don't allow removing the host
    if (participants.find(p => p.userId === userId)?.role === 'host') {
      return;
    }

    // Remove from participants list
    const updatedParticipants = participants.filter(p => p.userId !== userId);
    setParticipants(updatedParticipants);
    
    // Remove from candidates list
    const updatedCandidates = candidates.filter(c => (c.id !== userId && c.userId !== userId));
    setCandidates(updatedCandidates);
    
    // Force update available candidates list with the updated participants list
    // This ensures the removed candidate will reappear in the search results
    if (jobId) {
      // Đảm bảo fetch lại danh sách ứng viên khả dụng ngay sau khi xóa
      setTimeout(() => {
        fetchAvailableCandidatesForJob(jobId, updatedParticipants);
      }, 0);
    }
  };

  // Custom option component for candidate selection
  const CustomOption = ({ innerProps, label, data }) => (
    <div {...innerProps} className="d-flex align-items-center p-2">
      <img 
        src={data.data.avatar || 'https://via.placeholder.com/40'} 
        alt={label}
        className="rounded-circle me-2"
        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://via.placeholder.com/40';
        }}
      />
      <div>
        <div className="fw-bold">{label}</div>
        {data.data.email && (
          <div className="small text-muted">{data.data.email}</div>
        )}
      </div>
    </div>
  );

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
    <Container className="mt-4 mb-4">
      <div className="mb-4">
        <Link to={`/employer/meetings/${meetingId}`}>← Quay lại chi tiết cuộc họp</Link>
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
                  <Form.Label><FaCalendarAlt className="me-2" /> Thời gian kết thúc <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
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
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Channel Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Tên channel"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Định danh duy nhất cho kênh video call
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>ID Công việc liên quan</Form.Label>
              <Form.Control
                type="text"
                placeholder="ID công việc"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
              />
              <Form.Text className="text-muted">
                Liên kết cuộc họp với một công việc cụ thể (không bắt buộc)
              </Form.Text>
            </Form.Group>

            <Card className="mb-4">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Ứng viên tham gia ({candidates.length})</h5>
                  <div>
                    {jobId && (
                      <span className="text-muted me-2">Hiển thị ứng viên của công việc: {jobId}</span>
                    )}
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                {jobId && (
                  <Form.Group className="mb-4">
                    <Form.Label><FaUserPlus className="me-2" /> Thêm ứng viên từ danh sách ứng tuyển</Form.Label>
                    <div className="d-flex">
                      <div className="flex-grow-1 me-2">
                        <Select
                          options={availableCandidates}
                          isMulti
                          onChange={setSelectedCandidates}
                          value={selectedCandidates}
                          placeholder="Chọn ứng viên đã ứng tuyển vào vị trí này"
                          noOptionsMessage={() => "Không còn ứng viên nào khả dụng"}
                          components={{
                            Option: CustomOption
                          }}
                          styles={{
                            option: (base) => ({
                              ...base,
                              padding: 0
                            })
                          }}
                        />
                      </div>
                      <Button 
                        variant="primary" 
                        onClick={handleAddCandidates}
                        disabled={!selectedCandidates || selectedCandidates.length === 0}
                      >
                        <FaUserPlus className="me-1" /> Thêm
                      </Button>
                    </div>
                    {availableCandidates.length === 0 && (
                      <Alert variant="info" className="mt-2 mb-0 py-2">
                        Không còn ứng viên nào đã ứng tuyển vào vị trí này mà chưa được thêm vào cuộc họp.
                      </Alert>
                    )}
                  </Form.Group>
                )}

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
                    {jobId && (
                      <div className="mt-2">
                        Hãy thêm ứng viên từ danh sách ứng tuyển.
                      </div>
                    )}
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
  );
};

export default EmployerEditMeetingPage; 