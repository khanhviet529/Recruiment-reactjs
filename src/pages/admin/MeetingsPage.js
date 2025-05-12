import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaVideo, FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import './MeetingsPage.scss';

// API URL
const API_URL = 'http://localhost:5000';

const MeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch meetings from API
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_URL}/meetings`);
        const meetingsData = response.data;
        
        setMeetings(meetingsData);
        setFilteredMeetings(meetingsData);
      } catch (error) {
        console.error('Error fetching meetings:', error);
        setError('Không thể tải dữ liệu cuộc họp. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = meetings;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        meeting => 
          meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (meeting.description && meeting.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (meeting.createdBy && meeting.createdBy.name && meeting.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(meeting => meeting.status === statusFilter);
    }

    setFilteredMeetings(result);
  }, [searchTerm, statusFilter, meetings]);

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

  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
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

  // Function to count participants for each meeting
  const getParticipantCount = (meeting) => {
    if (meeting.participants && Array.isArray(meeting.participants)) {
      return meeting.participants.length;
    }
    return 0;
  };

  return (
    <>
      <Header />
      <div className="admin-meetings-page">
        <Container fluid>
          <div className="admin-page-title">
            <h2><FaVideo className="me-2" /> Quản lý cuộc họp</h2>
            <Link to="/admin/meetings/create">
              <Button variant="primary">
                <FaPlus className="me-2" /> Tạo cuộc họp mới
              </Button>
            </Link>
          </div>

          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="search-box">
                    <FaSearch className="search-icon" />
                    <Form.Control
                      type="text"
                      placeholder="Tìm kiếm cuộc họp..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </Col>
                <Col md={3}>
                  <div className="filter-dropdown">
                    <FaFilter className="filter-icon" />
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="scheduled">Sắp diễn ra</option>
                      <option value="ongoing">Đang diễn ra</option>
                      <option value="completed">Đã kết thúc</option>
                      <option value="cancelled">Đã hủy</option>
                    </Form.Select>
                  </div>
                </Col>
                <Col md={3} className="d-flex justify-content-end">
                  <div className="meeting-stats">
                    <div className="stat-item">
                      <div className="stat-label">Tổng số:</div>
                      <div className="stat-value">{meetings.length}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Đang diễn ra:</div>
                      <div className="stat-value">{meetings.filter(m => m.status === 'ongoing').length}</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <p className="mt-3">Đang tải dữ liệu cuộc họp...</p>
                </div>
              ) : error ? (
                <div className="text-center py-5">
                  <div className="alert alert-danger">{error}</div>
                </div>
              ) : filteredMeetings.length === 0 ? (
                <div className="text-center py-5">
                  <p className="mb-0">Không tìm thấy cuộc họp nào phù hợp với tiêu chí tìm kiếm.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Tiêu đề</th>
                        <th>Thời gian</th>
                        <th>Thời lượng</th>
                        <th>Trạng thái</th>
                        <th>Channel</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMeetings.map(meeting => (
                        <tr key={meeting.id}>
                          <td>
                            <div className="meeting-title-cell">
                              <div className="meeting-title">{meeting.title}</div>
                              <div className="meeting-description">{meeting.description}</div>
                            </div>
                          </td>
                          <td>
                            <div>{formatDateTime(meeting.startTime)}</div>
                          </td>
                          <td>{formatDuration(meeting.startTime, meeting.endTime)}</td>
                          <td>{renderStatusBadge(meeting.status)}</td>
                          <td>{meeting.channelName || "-"}</td>
                          <td>
                            <div className="action-buttons">
                              <Link to={`/admin/meetings/${meeting.id}`}>
                                <Button variant="outline-primary" size="sm">
                                  Chi tiết
                                </Button>
                              </Link>
                              {meeting.status === 'scheduled' && (
                                <Link to={`/admin/meetings/edit/${meeting.id}`}>
                                  <Button variant="outline-secondary" size="sm" className="ms-2">
                                    Chỉnh sửa
                                  </Button>
                                </Link>
                              )}
                              {meeting.status === 'ongoing' && (
                                <Link to={`/meeting/${meeting.id}`}>
                                  <Button variant="success" size="sm" className="ms-2">
                                    Tham gia
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default MeetingsPage; 