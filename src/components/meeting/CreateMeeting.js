import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Badge, ListGroup } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../redux/slices/authSlice';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import axios from 'axios';
import { FaVideo, FaCalendarAlt, FaExclamationTriangle, FaClock, FaSave, FaUserPlus, FaUser, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { registerLocale } from 'react-datepicker';
import vi from 'date-fns/locale/vi';
import "react-datepicker/dist/react-datepicker.css";
import './CreateMeeting.scss';
import { getCandidateAvatar } from '../../utils/avatarUtils';

// API URL
const API_URL = 'http://localhost:5000';

// Register Vietnamese locale
registerLocale('vi', vi);

const CreateMeeting = () => {
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();

  // Form fields  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(new Date(Date.now() + 60 * 60 * 1000)); // Default to 1 hour from now
  const [duration, setDuration] = useState(30); // Default duration: 30 mins
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  
  // Data for selects
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Calculate end time based on start time and duration
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + parseInt(duration));

  // Format date for form display
  const formatDateForForm = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Fetch jobs on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      setJobsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/jobs`);
        // Filter jobs by employer if user is an employer
        let jobsData = response.data;
        if (user && user.role === 'employer') {
          jobsData = jobsData.filter(job => job.employerId === user.id || job.createdBy === user.id);
        }
        
        setJobs(jobsData.map(job => ({
          value: job.id,
          label: job.title,
          data: job
        })));
        setJobsLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobsLoading(false);
      }
    };

    const fetchCandidates = async () => {
      setCandidatesLoading(true);
      try {
        // Fetch candidates
        const candidatesResponse = await axios.get(`${API_URL}/candidates`);
        setCandidates(candidatesResponse.data.map(candidate => ({
          value: candidate.id || candidate.userId,
          label: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || candidate.email,
          data: {
            ...candidate,
            avatar: getCandidateAvatar(candidate)
          }
        })));
        
        setCandidatesLoading(false);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        setCandidatesLoading(false);
      }
    };

    const fetchApplications = async () => {
      try {
        // Fetch job applications to link jobs with candidates
        const applicationsResponse = await axios.get(`${API_URL}/applications`);
        setJobApplications(applicationsResponse.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    fetchJobs();
    fetchCandidates();
    fetchApplications();
  }, [user]);

  // Filter candidates when a job is selected
  useEffect(() => {
    if (selectedJob) {
      console.log('Selected job:', selectedJob);
      console.log('Job applications:', jobApplications);
      
      // Find applications for this job using the applications endpoint
      const jobId = parseInt(selectedJob.value) || selectedJob.value;
      const applicationsForJob = jobApplications.filter(app => 
        app.jobId == jobId || app.jobId === jobId.toString()
      );
      
      console.log('Applications for this job:', applicationsForJob);
      
      // Get candidate IDs from applications
      const candidateIds = applicationsForJob.map(app => app.candidateId);
      console.log('Candidate IDs from applications:', candidateIds);
      
      // Filter candidates by application - check both id and userId fields
      const candidatesForJob = candidates.filter(candidate => {
        const candidateId = candidate.value;
        const candidateUserId = candidate.data.userId;
        
        return candidateIds.some(id => 
          id === candidateId || 
          id === candidateUserId ||
          id.toString() === candidateId.toString() || 
          id.toString() === candidateUserId?.toString()
        );
      });
      
      console.log('Filtered candidates for job:', candidatesForJob);
      setFilteredCandidates(candidatesForJob);
      
      // Reset selected candidates if they don't apply to the new job
      if (selectedCandidates.length > 0) {
        const stillValidCandidates = selectedCandidates.filter(candidate => 
          candidateIds.some(id => 
            id === candidate.value || 
            id === candidate.data.userId ||
            id.toString() === candidate.value.toString() || 
            id.toString() === candidate.data.userId?.toString()
          )
        );
        
        if (stillValidCandidates.length !== selectedCandidates.length) {
          setSelectedCandidates(stillValidCandidates);
        }
      }
    } else {
      setFilteredCandidates(candidates);
    }
  }, [selectedJob, candidates, jobApplications]);

  // Kiểm tra quyền tạo meeting
  const canCreateMeeting = user && (user.role === 'employer' || user.role === 'admin');

  if (!canCreateMeeting) {
    return (
      <Container className="mt-4 mb-4">
        <Card className="permission-denied-card">
          <Card.Body className="text-center">
            <FaExclamationTriangle size={50} className="mb-3 text-warning" />
            <h3>Không có quyền truy cập</h3>
            <p>Bạn không có quyền tạo cuộc họp mới. Chỉ nhà tuyển dụng mới có thể tạo cuộc họp phỏng vấn.</p>
            <Button variant="primary" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Generate Agora Token for the meeting
  const generateMeetingToken = async (meetingId, userId, role = 'host') => {
    try {
      const response = await axios.post(`${API_URL}/meetingTokens`, {
        meetingId, 
        userId,
        role
      });
      
      // Store token in localStorage for later use
      localStorage.setItem(`meeting_token_${meetingId}`, response.data.token);
      
      return response.data.token;
    } catch (error) {
      console.error('Error generating meeting token:', error);
      throw error;
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      
      // Kiểm tra các trường bắt buộc
      if (!title && !selectedJob) {
        setError('Vui lòng nhập tiêu đề cuộc họp hoặc chọn công việc.');
        setLoading(false);
        return;
      }
      
      if (!startTime) {
        setError('Vui lòng chọn thời gian bắt đầu.');
        setLoading(false);
        return;
      }
      
      // Validate that start time is not in the past
      const now = new Date();
      if (startTime < now) {
        setError('Thời gian bắt đầu phải lớn hơn hoặc bằng thời gian hiện tại.');
        setLoading(false);
        return;
      }
      
      if (!duration) {
        setError('Vui lòng chọn thời lượng cuộc họp.');
        setLoading(false);
        return;
      }
      
      if (selectedCandidates.length === 0) {
        setError('Vui lòng chọn ít nhất một ứng viên để phỏng vấn.');
        setLoading(false);
        return;
      }
      
      // Generate a unique channel name for the meeting
      const channelName = `meeting-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const meetingId = `meeting-${Date.now()}`;
      
      // Get selected candidates data with avatar and email
      const participantsData = selectedCandidates.map(candidate => ({
        userId: candidate.value,
        name: candidate.label,
        email: candidate.data.email || '',
        avatar: candidate.data.avatar || '',
        userType: 'candidate',
        role: 'attendee'
      }));
      
      // Add current user as host
      participantsData.push({
        userId: user.id,
        name: user.name,
        email: user.email || '',
        avatar: user.avatar || user.profilePicture || '',
        userType: 'employer',
        role: 'host',
        isHost: true
      });

      // Tạo dữ liệu meeting
      const meetingData = {
        id: meetingId,
        title: selectedJob 
          ? `Phỏng vấn - ${selectedJob.label}` 
          : title,
        description: description || `Cuộc phỏng vấn tuyển dụng`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: parseInt(duration),
        status: 'scheduled',
        channelName,
        // Job information if available
        jobId: selectedJob ? selectedJob.value : null,
        jobTitle: selectedJob ? selectedJob.label : null,
        // Company information if available
        company: user.company ? {
          id: user.companyId || 'unknown',
          name: user.company,
          logo: user.companyLogo || 'https://randomuser.me/api/portraits/men/41.jpg'
        } : null,
        // User who created the meeting
        createdBy: { 
          id: user.id, 
          name: user.name,
          email: user.email,
          role: user.role
        },
        // Employers and candidates in the meeting
        participants: participantsData,
        // Store candidate IDs for filtering purposes
        candidateIds: selectedCandidates.map(c => c.value),
        jobEmployerId: selectedJob ? selectedJob.data.employerId || user.id : user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('Creating meeting with data:', meetingData);

      // Call API to create meeting
      const response = await axios.post(`${API_URL}/meetings`, meetingData);
      
      console.log('Created meeting:', response.data);
      
      // Generate and store token for the host (current user)
      await generateMeetingToken(meetingId, user.id, 'host');
      
      setSuccess(true);
      
      // Redirect based on user role
      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin/meetings');
        } else if (user.role === 'employer') {
          navigate('/employer/meetings');
        } else {
          navigate('/meetings');
        }
      }, 2000);
    } catch (error) {
      console.error('Error creating meeting:', error);
      setError('Có lỗi xảy ra khi tạo cuộc họp. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidates = () => {
    if (!selectedCandidates || selectedCandidates.length === 0) return;
    
    // Add new candidates to the main list
    setSelectedCandidates(prev => [...prev, ...selectedCandidates]);
  };

  const handleRemoveCandidate = (candidateId) => {
    setSelectedCandidates(prev => prev.filter(c => c.value !== candidateId));
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
            <h4><FaVideo className="me-2" />Tạo cuộc họp phỏng vấn mới</h4>
          </Card.Header>
          
          <Card.Body>
            {error && (
              <Alert variant="danger" className="mb-4">
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert variant="success" className="mb-4">
                Cuộc họp đã được tạo thành công! Đang chuyển hướng...
              </Alert>
            )}

            <Form onSubmit={handleCreateMeeting}>
              <Form.Group className="mb-3">
                <Form.Label>Công việc liên quan</Form.Label>
                <Select
                  options={jobs}
                  isLoading={jobsLoading}
                  onChange={setSelectedJob}
                  value={selectedJob}
                  isClearable
                  placeholder="Chọn công việc (không bắt buộc)"
                  noOptionsMessage={() => "Không có công việc nào"}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
                <Form.Text className="text-muted">
                  Chọn công việc sẽ giúp lọc ứng viên đã ứng tuyển cho vị trí này
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tiêu đề cuộc họp <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={selectedJob ? `Phỏng vấn - ${selectedJob.label}` : title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={selectedJob ? `Phỏng vấn - ${selectedJob.label}` : "Nhập tiêu đề cuộc họp"}
                  required
                  disabled={!!selectedJob}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả về nội dung cuộc họp"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><FaCalendarAlt className="me-2" />Thời gian bắt đầu <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={formatDateForForm(startTime)}
                      onChange={(e) => setStartTime(new Date(e.target.value))}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><FaClock className="me-2" />Thời lượng (phút) <span className="text-danger">*</span></Form.Label>
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
                      Thời gian kết thúc: {endTime ? endTime.toLocaleString('vi-VN') : 'Chưa xác định'}
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Thêm ứng viên <span className="text-danger">*</span></Form.Label>
                <Select
                  options={filteredCandidates}
                  isLoading={candidatesLoading}
                  isMulti
                  onChange={setSelectedCandidates}
                  value={selectedCandidates}
                  placeholder={selectedJob 
                    ? "Chọn từ ứng viên đã ứng tuyển vị trí này" 
                    : "Chọn ứng viên để mời tham gia"
                  }
                  noOptionsMessage={() => selectedJob 
                    ? "Không có ứng viên nào đã ứng tuyển vị trí này" 
                    : "Không có ứng viên nào"
                  }
                  className="react-select-container"
                  classNamePrefix="react-select"
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
                {selectedJob && filteredCandidates.length === 0 && !candidatesLoading && (
                  <Alert variant="warning" className="mt-2 p-2 small">
                    Chưa có ứng viên nào ứng tuyển vào vị trí này. Hãy chọn vị trí khác hoặc bỏ chọn vị trí.
                  </Alert>
                )}
              </Form.Group>

              {/* Selected Candidates List */}
              {selectedCandidates.length > 0 && (
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaUser className="me-2" />
                      Ứng viên đã chọn ({selectedCandidates.length})
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      {selectedCandidates.map((candidate) => (
                        <ListGroup.Item key={candidate.value} className="d-flex align-items-center justify-content-between px-0">
                          <div className="d-flex align-items-center">
                            <img
                              src={candidate.data.avatar || 'https://via.placeholder.com/50'}
                              alt={candidate.label}
                              className="rounded-circle me-3"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/50';
                              }}
                            />
                            <div>
                              <div className="fw-bold">{candidate.label}</div>
                              {candidate.data.email && (
                                <small className="text-muted">{candidate.data.email}</small>
                              )}
                            </div>
                          </div>
                          
                          <div className="ms-3">
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleRemoveCandidate(candidate.value)}
                            >
                              <FaTimes className="me-1" /> Xóa
                            </Button>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              )}

              <div className="d-flex justify-content-end mt-4">
                <Link to="/employer/meetings">
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
                  disabled={loading || success}
                >
                  <FaSave className="me-2" />
                  {loading ? 'Đang tạo...' : 'Tạo cuộc họp'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default CreateMeeting; 