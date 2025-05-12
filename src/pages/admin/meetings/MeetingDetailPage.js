import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Badge, Table, Tabs, Alert } from 'react-bootstrap';
import { FaVideo, FaCalendarAlt, FaClock, FaUser, FaBuilding, FaEdit, FaTrash, FaHistory } from 'react-icons/fa';
import axios from 'axios';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import './MeetingDetailPage.scss';
import TokenModal from '../../../components/meeting/TokenModal';
import { getAgoraToken, hasValidAgoraToken } from '../../../utils/tokenStorage';

// API URL
const API_URL = 'http://localhost:5000';

const MeetingDetailPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showTokenModal, setShowTokenModal] = useState(false);

  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch meeting data
        const meetingResponse = await axios.get(`${API_URL}/meetings/${meetingId}`);
        const meetingData = meetingResponse.data;
        if (!meetingData) {
          throw new Error('Không tìm thấy cuộc họp');
        }

        // Fetch participants for this meeting
        const participantsResponse = await axios.get(`${API_URL}/meetingParticipants`);
        const meetingParticipants = participantsResponse.data.filter(p => p.meetingId === meetingId);

        // Fetch logs for this meeting
        const logsResponse = await axios.get(`${API_URL}/meetingLogs`);
        const meetingLogs = logsResponse.data.filter(log => log.meetingId === meetingId);

        setMeeting(meetingData);
        setParticipants(meetingParticipants);
        setLogs(meetingLogs);
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

  const renderParticipantStatus = (status) => {
    switch (status) {
      case 'accepted':
        return <Badge bg="success">Đã chấp nhận</Badge>;
      case 'pending':
        return <Badge bg="warning">Đang chờ</Badge>;
      case 'rejected':
        return <Badge bg="danger">Từ chối</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Xử lý khi người dùng nhấn nút tham gia cuộc họp
  const handleJoinMeeting = () => {
    // Kiểm tra xem đã có token hợp lệ chưa
    if (hasValidAgoraToken()) {
      // Nếu có token, chuyển hướng đến trang cuộc họp
      navigate(`/meeting/${meetingId}`);
    } else {
      // Nếu chưa có token, hiển thị modal nhập token
      setShowTokenModal(true);
    }
  };

  // Xử lý khi người dùng đã nhập token
  const handleTokenSubmit = (token) => {
    // Đóng modal
    setShowTokenModal(false);
    
    // Chuyển hướng đến trang cuộc họp
    navigate(`/meeting/${meetingId}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mt-4 mb-4">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải dữ liệu cuộc họp...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container mt-4 mb-4">
          <Alert variant="danger">
            {error}
          </Alert>
          <div className="text-center mt-3">
            <Link to="/admin/meetings">
              <Button variant="primary">Quay lại danh sách cuộc họp</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!meeting) {
    return (
      <>
        <Header />
        <div className="container mt-4 mb-4">
          <Alert variant="warning">
            Không tìm thấy thông tin cuộc họp
          </Alert>
          <div className="text-center mt-3">
            <Link to="/admin/meetings">
              <Button variant="primary">Quay lại danh sách cuộc họp</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mt-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2><FaVideo className="me-2" /> Chi tiết cuộc họp</h2>
          <div>
            <Link to="/admin/meetings">
              <Button variant="outline-secondary" className="me-2">Quay lại</Button>
            </Link>
            <Link to={`/admin/meetings/edit/${meetingId}`}>
              <Button variant="outline-primary">
                <FaEdit className="me-1" /> Chỉnh sửa
              </Button>
            </Link>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tabs.Tab eventKey="details" title="Thông tin chung">
            <Card className="mb-4">
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <h3>{meeting.title}</h3>
                    <div className="meeting-status mb-3">
                      {renderStatusBadge(meeting.status)}
                    </div>
                    <p className="meeting-description">{meeting.description}</p>
                    
                    <div className="meeting-details mt-4">
                      <div className="detail-item">
                        <FaCalendarAlt className="icon" />
                        <span>Bắt đầu: {formatDateTime(meeting.startTime)}</span>
                      </div>
                      <div className="detail-item">
                        <FaCalendarAlt className="icon" />
                        <span>Kết thúc: {formatDateTime(meeting.endTime)}</span>
                      </div>
                      <div className="detail-item">
                        <FaClock className="icon" />
                        <span>Thời lượng: {Math.round((new Date(meeting.endTime) - new Date(meeting.startTime)) / (1000 * 60))} phút</span>
                      </div>
                      {meeting.channelName && (
                        <div className="detail-item">
                          <FaVideo className="icon" />
                          <span>Channel: {meeting.channelName}</span>
                        </div>
                      )}
                      {meeting.jobId && (
                        <div className="detail-item">
                          <FaBuilding className="icon" />
                          <span>Công việc liên quan: {meeting.jobId}</span>
                        </div>
                      )}
                    </div>
                    
                    {meeting.status === 'ongoing' && (
                      <div className="mt-4">
                        <Button variant="success" onClick={handleJoinMeeting}>
                          <FaVideo className="me-2" />
                          Tham gia cuộc họp ngay
                        </Button>
                      </div>
                    )}
                  </Col>
                  <Col md={4}>
                    <Card className="meeting-meta-card">
                      <Card.Body>
                        <h5>Thông tin bổ sung</h5>
                        <div className="meta-item">
                          <strong>Ngày tạo:</strong>
                          <span>{formatDateTime(meeting.createdAt)}</span>
                        </div>
                        <div className="meta-item">
                          <strong>Cập nhật:</strong>
                          <span>{formatDateTime(meeting.updatedAt)}</span>
                        </div>
                        <div className="meta-item">
                          <strong>ID:</strong>
                          <span>{meeting.id}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tabs.Tab>

          <Tabs.Tab eventKey="participants" title="Người tham gia">
            <Card>
              <Card.Body>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>ID người dùng</th>
                      <th>Vai trò</th>
                      <th>Trạng thái</th>
                      <th>Thời gian tham gia</th>
                      <th>Thời gian rời đi</th>
                      <th>Host</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.length > 0 ? (
                      participants.map(participant => (
                        <tr key={participant.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="user-avatar me-2">
                                <div className="avatar-placeholder">
                                  <FaUser />
                                </div>
                              </div>
                              <div>
                                <div className="user-name">{participant.userId}</div>
                                <div className="user-email">{participant.role}</div>
                              </div>
                            </div>
                          </td>
                          <td>{participant.role}</td>
                          <td>{renderParticipantStatus(participant.status)}</td>
                          <td>{participant.joinedAt ? formatDateTime(participant.joinedAt) : 'Chưa tham gia'}</td>
                          <td>{participant.leftAt ? formatDateTime(participant.leftAt) : '-'}</td>
                          <td>{participant.isHost ? 'Có' : 'Không'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">Không có người tham gia nào</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tabs.Tab>

          <Tabs.Tab eventKey="logs" title="Lịch sử hoạt động">
            <Card>
              <Card.Body>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Người dùng</th>
                      <th>Hành động</th>
                      <th>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length > 0 ? (
                      logs.map(log => (
                        <tr key={log.id}>
                          <td>{formatDateTime(log.timestamp)}</td>
                          <td>{log.userId}</td>
                          <td>
                            {log.action === 'joined' && <Badge bg="success">Tham gia</Badge>}
                            {log.action === 'left' && <Badge bg="secondary">Rời đi</Badge>}
                            {log.action === 'created' && <Badge bg="primary">Tạo mới</Badge>}
                            {log.action === 'updated' && <Badge bg="info">Cập nhật</Badge>}
                          </td>
                          <td>
                            {log.details && (
                              <pre className="log-details">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">Không có lịch sử hoạt động nào</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tabs.Tab>
        </Tabs>
      </div>
      <Footer />
      
      {/* Modal nhập token */}
      <TokenModal
        show={showTokenModal}
        onHide={() => setShowTokenModal(false)}
        onTokenSubmit={handleTokenSubmit}
        meeting={meeting}
      />
    </>
  );
};

export default MeetingDetailPage; 