import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Badge, Alert, Spinner, ListGroup, Row, Col } from 'react-bootstrap';
import { FaUsers, FaUser, FaClock, FaCheck, FaTimes, FaCheckDouble } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const InMeetingWaitingCandidatesPanel = ({ meetingId, show, onHide, isHost }) => {
  const [waitingCandidates, setWaitingCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingCandidates, setProcessingCandidates] = useState(new Set());
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());

  const loadWaitingCandidates = useCallback(async () => {
    if (!meetingId) return;
    
    try {
      // Try API first
      try {
        const response = await axios.get(`${API_URL}/meetings/${meetingId}/waiting-candidates`);
        setWaitingCandidates(response.data || []);
        setError('');
        console.log('Loaded waiting candidates from API:', response.data);
      } catch (apiError) {
        console.warn('API not available, using localStorage fallback:', apiError);
        
        // Fallback to localStorage
        const storageKey = `waitingCandidates_${meetingId}`;
        const localCandidates = JSON.parse(localStorage.getItem(storageKey) || '[]');
        setWaitingCandidates(localCandidates);
        setError('');
        console.log('Loaded waiting candidates from localStorage:', localCandidates);
      }
    } catch (error) {
      console.error('Error loading waiting candidates:', error);
      setError('Không thể tải danh sách ứng viên đang chờ');
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    if (show && meetingId) {
      loadWaitingCandidates();
      
      // Real-time polling every 2 seconds when modal is open
      const interval = setInterval(loadWaitingCandidates, 2000);
      return () => clearInterval(interval);
    }
  }, [show, meetingId, loadWaitingCandidates]);

  const handleApproveCandidate = async (candidateId) => {
    try {
      setProcessingCandidates(prev => new Set([...prev, candidateId]));
      
      const updateData = {
        status: 'approved',
        approvedAt: new Date().toISOString()
      };

      // Try API first
      try {
        await axios.patch(`${API_URL}/meetings/${meetingId}/waiting-candidates/${candidateId}`, updateData);
        console.log('Approved candidate via API');
      } catch (apiError) {
        console.warn('API not available, using localStorage fallback');
        
        // Fallback to localStorage
        const storageKey = `waitingCandidates_${meetingId}`;
        const existingCandidates = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const candidateIndex = existingCandidates.findIndex(c => c.candidateId === candidateId);
        
        if (candidateIndex !== -1) {
          existingCandidates[candidateIndex] = { ...existingCandidates[candidateIndex], ...updateData };
          localStorage.setItem(storageKey, JSON.stringify(existingCandidates));
          console.log('Approved candidate via localStorage');
        }
      }

      // Update local state
      setWaitingCandidates(prev => 
        prev.map(candidate => 
          candidate.candidateId === candidateId 
            ? { ...candidate, status: 'approved' }
            : candidate
        )
      );

      // Remove from selected candidates
      setSelectedCandidates(prev => {
        const newSet = new Set(prev);
        newSet.delete(candidateId);
        return newSet;
      });

    } catch (error) {
      console.error('Error approving candidate:', error);
      setError('Không thể phê duyệt ứng viên');
    } finally {
      setProcessingCandidates(prev => {
        const newSet = new Set(prev);
        newSet.delete(candidateId);
        return newSet;
      });
    }
  };

  const handleRejectCandidate = async (candidateId) => {
    try {
      setProcessingCandidates(prev => new Set([...prev, candidateId]));
      
      const updateData = {
        status: 'rejected',
        rejectedAt: new Date().toISOString()
      };

      // Try API first
      try {
        await axios.patch(`${API_URL}/meetings/${meetingId}/waiting-candidates/${candidateId}`, updateData);
        console.log('Rejected candidate via API');
      } catch (apiError) {
        console.warn('API not available, using localStorage fallback');
        
        // Fallback to localStorage
        const storageKey = `waitingCandidates_${meetingId}`;
        const existingCandidates = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const candidateIndex = existingCandidates.findIndex(c => c.candidateId === candidateId);
        
        if (candidateIndex !== -1) {
          existingCandidates[candidateIndex] = { ...existingCandidates[candidateIndex], ...updateData };
          localStorage.setItem(storageKey, JSON.stringify(existingCandidates));
          console.log('Rejected candidate via localStorage');
        }
      }

      // Update local state
      setWaitingCandidates(prev => 
        prev.map(candidate => 
          candidate.candidateId === candidateId 
            ? { ...candidate, status: 'rejected' }
            : candidate
        )
      );

      // Remove from selected candidates
      setSelectedCandidates(prev => {
        const newSet = new Set(prev);
        newSet.delete(candidateId);
        return newSet;
      });

    } catch (error) {
      console.error('Error rejecting candidate:', error);
      setError('Không thể từ chối ứng viên');
    } finally {
      setProcessingCandidates(prev => {
        const newSet = new Set(prev);
        newSet.delete(candidateId);
        return newSet;
      });
    }
  };

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateId)) {
        newSet.delete(candidateId);
      } else {
        newSet.add(candidateId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const waitingCandidateIds = waitingCandidates
      .filter(candidate => candidate.status === 'waiting')
      .map(candidate => candidate.candidateId);
    
    if (selectedCandidates.size === waitingCandidateIds.length) {
      // Deselect all
      setSelectedCandidates(new Set());
    } else {
      // Select all
      setSelectedCandidates(new Set(waitingCandidateIds));
    }
  };

  const handleApproveSelected = async () => {
    const selectedArray = Array.from(selectedCandidates);
    for (const candidateId of selectedArray) {
      await handleApproveCandidate(candidateId);
    }
  };

  const getWaitingCount = () => {
    return waitingCandidates.filter(candidate => candidate.status === 'waiting').length;
  };

  const getWaitingCandidates = () => {
    return waitingCandidates.filter(candidate => candidate.status === 'waiting');
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaUsers className="me-2" />
          Ứng viên đang chờ
          {getWaitingCount() > 0 && (
            <Badge bg="warning" className="ms-2">
              {getWaitingCount()}
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" />
            <p className="mt-2 mb-0">Đang tải...</p>
          </div>
        ) : getWaitingCandidates().length === 0 ? (
          <div className="text-center text-muted py-4">
            <FaUsers size={32} className="mb-2 opacity-50" />
            <p className="mb-0">Chưa có ứng viên nào đang chờ</p>
          </div>
        ) : (
          <>
            {/* Bulk Actions */}
            {isHost && getWaitingCount() > 1 && (
              <Row className="mb-3">
                <Col>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={handleSelectAll}
                    className="me-2"
                  >
                    {selectedCandidates.size === getWaitingCount() ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </Button>
                  {selectedCandidates.size > 0 && (
                    <Button 
                      variant="success" 
                      size="sm" 
                      onClick={handleApproveSelected}
                    >
                      <FaCheckDouble className="me-1" />
                      Approve {selectedCandidates.size} ứng viên
                    </Button>
                  )}
                </Col>
              </Row>
            )}

            {/* Candidates List */}
            <ListGroup variant="flush">
              {getWaitingCandidates().map((candidate) => (
                <ListGroup.Item 
                  key={candidate.candidateId} 
                  className="px-0 py-3"
                >
                  <Row className="align-items-center">
                    {/* Checkbox */}
                    {isHost && getWaitingCount() > 1 && (
                      <Col xs="auto">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.has(candidate.candidateId)}
                          onChange={() => handleSelectCandidate(candidate.candidateId)}
                          className="form-check-input"
                        />
                      </Col>
                    )}

                    {/* Avatar */}
                    <Col xs="auto">
                      {candidate.candidateAvatar ? (
                        <img
                          src={candidate.candidateAvatar}
                          alt={candidate.candidateName}
                          className="rounded-circle"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '40px', 
                          height: '40px',
                          display: candidate.candidateAvatar ? 'none' : 'flex'
                        }}
                      >
                        <FaUser className="text-muted" />
                      </div>
                    </Col>

                    {/* Candidate Info */}
                    <Col>
                      <h6 className="mb-1">{candidate.candidateName}</h6>
                      <small className="text-muted">{candidate.candidateEmail}</small>
                      <div className="mt-1">
                        <small className="text-muted">
                          <FaClock className="me-1" />
                          Chờ từ {new Date(candidate.joinedAt).toLocaleTimeString('vi-VN')}
                        </small>
                      </div>
                    </Col>

                    {/* Actions */}
                    {isHost && (
                      <Col xs="auto">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApproveCandidate(candidate.candidateId)}
                          disabled={processingCandidates.has(candidate.candidateId)}
                          className="me-2"
                        >
                          {processingCandidates.has(candidate.candidateId) ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <FaCheck />
                          )}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectCandidate(candidate.candidateId)}
                          disabled={processingCandidates.has(candidate.candidateId)}
                        >
                          {processingCandidates.has(candidate.candidateId) ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <FaTimes />
                          )}
                        </Button>
                      </Col>
                    )}
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InMeetingWaitingCandidatesPanel; 