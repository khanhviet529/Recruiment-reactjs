import React, { useState, useEffect, useCallback } from 'react';
import { Card, ListGroup, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaUser, FaCheck, FaTimes, FaClock, FaUsers } from 'react-icons/fa';
import axios from 'axios';

const WaitingCandidatesPanel = ({ meetingId, onCandidateUpdate }) => {
  const [waitingCandidates, setWaitingCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingCandidates, setProcessingCandidates] = useState(new Set());

  const API_URL = 'http://localhost:5000';

  const loadWaitingCandidates = useCallback(async () => {
    try {
      // Try API first
      try {
        const response = await axios.get(`${API_URL}/meetings/${meetingId}/waiting-candidates`);
        setWaitingCandidates(response.data || []);
        setError('');
        console.log('Loaded waiting candidates from API');
      } catch (apiError) {
        console.warn('API not available, using localStorage fallback:', apiError);
        
        // Fallback to localStorage
        const storageKey = `waitingCandidates_${meetingId}`;
        const localCandidates = JSON.parse(localStorage.getItem(storageKey) || '[]');
        setWaitingCandidates(localCandidates);
        setError('');
        console.log('Loaded waiting candidates from localStorage');
      }
    } catch (error) {
      console.error('Error loading waiting candidates:', error);
      setError('Không thể tải danh sách ứng viên đang chờ');
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    if (meetingId) {
      loadWaitingCandidates();
      
      // Poll for new candidates every 5 seconds (increased from 3 to reduce load)
      const interval = setInterval(loadWaitingCandidates, 5000);
      return () => clearInterval(interval);
    }
  }, [meetingId, loadWaitingCandidates]);

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

      // Notify parent component
      if (onCandidateUpdate) {
        onCandidateUpdate('approved', candidateId);
      }

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

      // Notify parent component
      if (onCandidateUpdate) {
        onCandidateUpdate('rejected', candidateId);
      }

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

  const handleApproveAll = async () => {
    const waitingCandidateIds = waitingCandidates
      .filter(candidate => candidate.status === 'waiting')
      .map(candidate => candidate.candidateId);

    for (const candidateId of waitingCandidateIds) {
      await handleApproveCandidate(candidateId);
    }
  };

  const getWaitingCount = () => {
    return waitingCandidates.filter(candidate => candidate.status === 'waiting').length;
  };

  const getApprovedCount = () => {
    return waitingCandidates.filter(candidate => candidate.status === 'approved').length;
  };

  if (loading) {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <FaUsers className="me-2" />
            Ứng viên đang chờ
          </h5>
        </Card.Header>
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" />
          <p className="mt-2 mb-0">Đang tải...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <FaUsers className="me-2" />
          Ứng viên đang chờ
          {getWaitingCount() > 0 && (
            <Badge bg="warning" className="ms-2">
              {getWaitingCount()}
            </Badge>
          )}
        </h5>
        {getWaitingCount() > 1 && (
          <Button 
            size="sm" 
            variant="success" 
            onClick={handleApproveAll}
          >
            Cho phép tất cả
          </Button>
        )}
      </Card.Header>
      
      <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {waitingCandidates.length === 0 ? (
          <div className="text-center text-muted py-4">
            <FaUsers size={32} className="mb-2 opacity-50" />
            <p className="mb-0">Chưa có ứng viên nào đang chờ</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {waitingCandidates.map((candidate) => (
              <ListGroup.Item 
                key={candidate.candidateId} 
                className="px-0 py-3"
              >
                <div className="d-flex align-items-center">
                  {/* Avatar */}
                  <div className="me-3">
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
                  </div>

                  {/* Candidate Info */}
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{candidate.candidateName}</h6>
                    <small className="text-muted">{candidate.candidateEmail}</small>
                    <div className="mt-1">
                      <small className="text-muted">
                        <FaClock className="me-1" />
                        Chờ từ {new Date(candidate.joinedAt).toLocaleTimeString('vi-VN')}
                      </small>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="text-end">
                    {candidate.status === 'waiting' && (
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApproveCandidate(candidate.candidateId)}
                          disabled={processingCandidates.has(candidate.candidateId)}
                        >
                          {processingCandidates.has(candidate.candidateId) ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <FaCheck />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRejectCandidate(candidate.candidateId)}
                          disabled={processingCandidates.has(candidate.candidateId)}
                        >
                          {processingCandidates.has(candidate.candidateId) ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <FaTimes />
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {candidate.status === 'approved' && (
                      <Badge bg="success">
                        <FaCheck className="me-1" />
                        Đã cho phép
                      </Badge>
                    )}
                    
                    {candidate.status === 'rejected' && (
                      <Badge bg="danger">
                        <FaTimes className="me-1" />
                        Đã từ chối
                      </Badge>
                    )}
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {/* Summary */}
        {waitingCandidates.length > 0 && (
          <div className="mt-3 pt-3 border-top">
            <small className="text-muted">
              Tổng: {waitingCandidates.length} ứng viên • 
              Đang chờ: {getWaitingCount()} • 
              Đã phê duyệt: {getApprovedCount()}
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default WaitingCandidatesPanel; 