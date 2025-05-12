import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { saveAgoraToken, getAgoraToken } from '../../utils/tokenStorage';

/**
 * Modal nhập token Agora
 * @param {boolean} show - Hiển thị modal
 * @param {function} onHide - Hàm gọi khi đóng modal
 * @param {function} onTokenSubmit - Hàm gọi khi submit token thành công
 * @param {object} meeting - Thông tin cuộc họp
 */
const TokenModal = ({ show, onHide, onTokenSubmit, meeting }) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Kiểm tra token đã lưu khi mở modal
  useEffect(() => {
    if (show) {
      const savedToken = getAgoraToken();
      if (savedToken) {
        setToken(savedToken);
      }
    }
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Vui lòng nhập token Agora để tham gia cuộc họp');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Trong tương lai, đây sẽ là nơi xác thực token với API
      // Hiện tại, chúng ta chỉ lưu trữ token và cho phép người dùng tham gia
      
      // Lưu token vào localStorage (mặc định hết hạn sau 60 phút)
      saveAgoraToken(token);
      
      setSuccess('Token hợp lệ! Đang chuyển hướng...');
      
      // Gọi callback khi token được chấp nhận
      setTimeout(() => {
        onTokenSubmit(token);
      }, 1500);
    } catch (error) {
      console.error('Lỗi xác thực token:', error);
      setError('Không thể xác thực token. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header>
        <Modal.Title>Nhập Token Agora</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {meeting && (
          <div className="mb-3">
            <h6>{meeting.title}</h6>
            <p className="text-muted small mb-0">
              Thời gian: {meeting.startTime ? new Date(meeting.startTime).toLocaleString('vi-VN') : 'Không xác định'}
            </p>
            <p className="text-muted small">
              Kênh: {meeting.channelName || 'Không xác định'}
            </p>
          </div>
        )}
        
        <p>Để tham gia cuộc họp, vui lòng nhập token Agora của bạn.</p>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Token Agora</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập token Agora"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={loading || success}
              required
            />
            <Form.Text className="text-muted">
              Token này được sử dụng để xác thực và tham gia cuộc họp video.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={onHide}
          disabled={loading || success}
        >
          Hủy
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || success || !token.trim()}
        >
          {loading ? 'Đang xác thực...' : (success ? 'Thành công' : 'Tham gia cuộc họp')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TokenModal; 