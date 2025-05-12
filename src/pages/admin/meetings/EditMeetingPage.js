import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaVideo, FaCalendarAlt, FaClock, FaSave } from 'react-icons/fa';
import axios from 'axios';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { formatDateForInput } from '../../../utils/meetingUtils';

// API URL
const API_URL = 'http://localhost:5000';

const EditMeetingPage = () => {
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

        // Set form data
        setTitle(meetingData.title || '');
        setDescription(meetingData.description || '');
        setStartTime(formatDateForInput(meetingData.startTime));
        setEndTime(formatDateForInput(meetingData.endTime));
        setStatus(meetingData.status || 'scheduled');
        setChannelName(meetingData.channelName || '');
        setJobId(meetingData.jobId || '');

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !startTime || !endTime) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare meeting data
      const meetingData = {
        title,
        description,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        status,
        channelName: channelName || `meeting-${meetingId}`,
        jobId: jobId || null,
        updatedAt: new Date().toISOString()
      };

      // Update meeting
      await axios.patch(`${API_URL}/meetings/${meetingId}`, meetingData);
      
      setSuccess('Cập nhật cuộc họp thành công!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/meetings/${meetingId}`);
      }, 2000);
    } catch (error) {
      console.error('Error updating meeting:', error);
      setError('Không thể cập nhật cuộc họp. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !title) {
    return (
      <>
        <Header />
        <Container className="mt-4 mb-4">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải dữ liệu cuộc họp...</p>
          </div>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="mt-4 mb-4">
        <div className="mb-4">
          <Link to={`/admin/meetings/${meetingId}`}>← Quay lại chi tiết cuộc họp</Link>
        </div>
        
        <Card>
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

              <div className="d-flex justify-content-end mt-4">
                <Link to={`/admin/meetings/${meetingId}`}>
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
      <Footer />
    </>
  );
};

export default EditMeetingPage; 