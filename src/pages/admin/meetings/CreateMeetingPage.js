import React, { useState } from 'react';
import { Container, Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaVideo, FaCalendarAlt, FaSave } from 'react-icons/fa';
import axios from 'axios';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';

// API URL
const API_URL = 'http://localhost:5000';

const CreateMeetingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !startTime || !endTime) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Validate that start time is not in the past
    const now = new Date();
    const startDateTime = new Date(startTime);
    if (startDateTime < now) {
      setError('Thời gian bắt đầu phải lớn hơn hoặc bằng thời gian hiện tại.');
      return;
    }

    // Validate that end time is after start time
    const endDateTime = new Date(endTime);
    if (endDateTime <= startDateTime) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Generate a simple ID
      const id = Math.random().toString(36).substring(2, 6);

      // Prepare meeting data
      const meetingData = {
        id,
        title,
        description,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        status,
        channelName: channelName || `meeting-${id}`,
        jobId: jobId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create meeting
      await axios.post(`${API_URL}/meetings`, meetingData);
      
      setSuccess('Tạo cuộc họp thành công!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/meetings');
      }, 2000);
    } catch (error) {
      console.error('Error creating meeting:', error);
      setError('Không thể tạo cuộc họp. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container className="mt-4 mb-4">
        <div className="mb-4">
          <Link to="/admin/meetings">← Quay lại danh sách cuộc họp</Link>
        </div>
        
        <Card>
          <Card.Header>
            <h4><FaVideo className="me-2" /> Tạo cuộc họp mới</h4>
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
                      min={new Date().toISOString().slice(0, 16)}
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
                      placeholder="Tên channel (tự động tạo nếu để trống)"
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
                <Link to="/admin/meetings">
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
                  {loading ? 'Đang tạo...' : 'Tạo cuộc họp'}
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

export default CreateMeetingPage; 