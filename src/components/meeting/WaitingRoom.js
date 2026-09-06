import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaClock, FaUsers } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../redux/slices/authSlice';
import axios from 'axios';
import AgoraRTC from 'agora-rtc-sdk-ng';

const WaitingRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);
  
  const [meetingData, setMeetingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [waitingStatus, setWaitingStatus] = useState('waiting'); // waiting, approved, rejected
  const [waitingMessage, setWaitingMessage] = useState('Đang chờ nhà tuyển dụng cho phép vào...');
  
  // Preview states
  const [previewCameraOn, setPreviewCameraOn] = useState(false);
  const [previewMicOn, setPreviewMicOn] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoStream, setLocalVideoStream] = useState(null);
  
  const previewVideoRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    if (meetingId && user) {
      loadMeetingData();
      startPollingForApproval();
    }
    
    return () => {
      cleanup();
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [meetingId, user]);

  const loadMeetingData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/meetings/${meetingId}`);
      setMeetingData(response.data);
      
      // Register candidate as waiting
      await registerWaitingCandidate();
      
    } catch (error) {
      console.error('Error loading meeting:', error);
      setError('Không thể tải thông tin cuộc họp');
    } finally {
      setLoading(false);
    }
  };

  const registerWaitingCandidate = async () => {
    try {
      const candidateData = {
        candidateId: user.id,
        candidateName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        candidateEmail: user.email,
        candidateAvatar: user.avatar || user.profilePicture,
        joinedAt: new Date().toISOString(),
        status: 'waiting'
      };

      // Try API first
      try {
        await axios.post(`${API_URL}/meetings/${meetingId}/waiting-candidates`, candidateData);
        console.log('Registered as waiting candidate via API');
      } catch (apiError) {
        console.warn('API not available, using localStorage fallback:', apiError);
        
        // Fallback to localStorage
        const storageKey = `waitingCandidates_${meetingId}`;
        const existingCandidates = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // Check if candidate already exists
        const existingIndex = existingCandidates.findIndex(c => c.candidateId === user.id);
        if (existingIndex !== -1) {
          existingCandidates[existingIndex] = { ...existingCandidates[existingIndex], ...candidateData };
        } else {
          existingCandidates.push({ ...candidateData, id: Date.now().toString() });
        }
        
        localStorage.setItem(storageKey, JSON.stringify(existingCandidates));
        console.log('Registered as waiting candidate via localStorage');
      }
    } catch (error) {
      console.error('Error registering waiting candidate:', error);
    }
  };

  const startPollingForApproval = () => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        // Try API first
        try {
          const response = await axios.get(`${API_URL}/meetings/${meetingId}/waiting-candidates/${user.id}`);
          const candidateStatus = response.data;
          
          if (candidateStatus.status === 'approved') {
            setWaitingStatus('approved');
            setWaitingMessage('Bạn đã được cho phép vào cuộc họp!');
            clearInterval(pollIntervalRef.current);
            
            setTimeout(() => {
              joinMeeting();
            }, 2000);
            
          } else if (candidateStatus.status === 'rejected') {
            setWaitingStatus('rejected');
            setWaitingMessage('Nhà tuyển dụng đã từ chối yêu cầu tham gia của bạn.');
            clearInterval(pollIntervalRef.current);
          }
        } catch (apiError) {
          // Fallback to localStorage
          const storageKey = `waitingCandidates_${meetingId}`;
          const existingCandidates = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const candidateStatus = existingCandidates.find(c => c.candidateId === user.id);
          
          if (candidateStatus) {
            if (candidateStatus.status === 'approved') {
              setWaitingStatus('approved');
              setWaitingMessage('Bạn đã được cho phép vào cuộc họp!');
              clearInterval(pollIntervalRef.current);
              
              setTimeout(() => {
                joinMeeting();
              }, 2000);
              
            } else if (candidateStatus.status === 'rejected') {
              setWaitingStatus('rejected');
              setWaitingMessage('Nhà tuyển dụng đã từ chối yêu cầu tham gia của bạn.');
              clearInterval(pollIntervalRef.current);
            }
          }
        }
      } catch (error) {
        console.error('Error checking approval status:', error);
      }
    }, 3000);
  };

  const joinMeeting = async () => {
    try {
      // Generate token and redirect to meeting room
      const response = await axios.post(`${API_URL}/agora/generate-token`, {
        meetingId,
        uid: user.id,
        role: 'attendee'
      });

      if (response.data.token) {
        const meetingParams = new URLSearchParams({
          channelName: response.data.channelName,
          token: response.data.token,
          uid: response.data.uid.toString(),
          appID: response.data.appID,
          meetingTitle: meetingData.title
        });

        navigate(`/meeting/${meetingId}?${meetingParams}`);
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
      setError('Không thể tham gia cuộc họp');
    }
  };

  const togglePreviewCamera = async () => {
    try {
      if (previewCameraOn) {
        // Turn off camera
        if (localVideoTrack) {
          localVideoTrack.stop();
          localVideoTrack.close();
          setLocalVideoTrack(null);
        }
        if (localVideoStream) {
          localVideoStream.getTracks().forEach(track => track.stop());
          setLocalVideoStream(null);
        }
        setPreviewCameraOn(false);
      } else {
        // Turn on camera
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        setLocalVideoTrack(videoTrack);
        
        // Create MediaStream for preview
        const stream = new MediaStream([videoTrack.getMediaStreamTrack()]);
        setLocalVideoStream(stream);
        setPreviewCameraOn(true);
        
        // Apply to video element
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
        }
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
      setError('Không thể bật camera');
    }
  };

  const togglePreviewMic = async () => {
    try {
      if (previewMicOn) {
        // Turn off mic
        if (localAudioTrack) {
          localAudioTrack.stop();
          localAudioTrack.close();
          setLocalAudioTrack(null);
        }
        setPreviewMicOn(false);
      } else {
        // Turn on mic
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        setLocalAudioTrack(audioTrack);
        setPreviewMicOn(true);
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
      setError('Không thể bật microphone');
    }
  };

  const cleanup = async () => {
    try {
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
      }
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
      }
      if (localVideoStream) {
        localVideoStream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  const leaveWaitingRoom = async () => {
    try {
      await axios.delete(`${API_URL}/meetings/${meetingId}/waiting-candidates/${user.id}`);
    } catch (error) {
      console.error('Error leaving waiting room:', error);
    }
    navigate(-1);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3">Đang tải thông tin cuộc họp...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Alert variant="danger" className="text-center">
          <h4>Có lỗi xảy ra</h4>
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid style={{ height: '100vh', background: '#f8f9fa' }}>
      <Row className="h-100">
        <Col className="d-flex flex-column">
          {/* Header */}
          <div className="bg-white p-3 border-bottom">
            <h3 className="mb-1">Phòng chờ - {meetingData?.title}</h3>
            <div className="text-muted">
              <FaClock className="me-1" />
              {new Date(meetingData?.startTime || meetingData?.scheduledAt).toLocaleString('vi-VN')}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow-1 p-4">
            <Row className="h-100">
              {/* Video Preview */}
              <Col lg={8}>
                <Card className="h-100">
                  <Card.Header>
                    <h5 className="mb-0">Kiểm tra thiết bị của bạn</h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div style={{ 
                      width: '100%', 
                      height: '400px', 
                      background: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      {previewCameraOn && localVideoStream ? (
                        <video
                          ref={previewVideoRef}
                          autoPlay
                          muted
                          playsInline
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div className="text-center text-white">
                          <FaVideoSlash size={48} className="mb-3" />
                          <h5>Camera đã tắt</h5>
                        </div>
                      )}
                    </div>
                    
                    {/* Controls */}
                    <div className="p-3 bg-light border-top">
                      <div className="d-flex justify-content-center gap-3">
                        <Button 
                          variant={previewCameraOn ? "success" : "secondary"} 
                          onClick={togglePreviewCamera}
                          size="lg"
                        >
                          {previewCameraOn ? <FaVideo /> : <FaVideoSlash />}
                        </Button>
                        <Button 
                          variant={previewMicOn ? "success" : "secondary"} 
                          onClick={togglePreviewMic}
                          size="lg"
                        >
                          {previewMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Waiting Status */}
              <Col lg={4}>
                <Card className="h-100">
                  <Card.Header>
                    <h5 className="mb-0">Trạng thái</h5>
                  </Card.Header>
                  <Card.Body className="d-flex flex-column justify-content-center text-center">
                    {waitingStatus === 'waiting' && (
                      <>
                        <Spinner animation="border" variant="primary" className="mb-3" />
                        <h5>Đang chờ phê duyệt</h5>
                        <p className="text-muted">{waitingMessage}</p>
                        <small className="text-muted">
                          Nhà tuyển dụng sẽ xem danh sách ứng viên đang chờ và cho phép bạn vào cuộc họp
                        </small>
                      </>
                    )}
                    
                    {waitingStatus === 'approved' && (
                      <>
                        <div className="text-success mb-3">
                          <FaUsers size={48} />
                        </div>
                        <h5 className="text-success">Đã được phê duyệt!</h5>
                        <p>{waitingMessage}</p>
                        <p className="text-muted">Đang chuyển vào cuộc họp...</p>
                      </>
                    )}
                    
                    {waitingStatus === 'rejected' && (
                      <>
                        <div className="text-danger mb-3">
                          <FaVideoSlash size={48} />
                        </div>
                        <h5 className="text-danger">Yêu cầu bị từ chối</h5>
                        <p>{waitingMessage}</p>
                        <Button variant="primary" onClick={leaveWaitingRoom}>
                          Quay lại
                        </Button>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Footer */}
          <div className="bg-white p-3 border-top">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted">
                <small>Cuộc họp: {meetingData?.title}</small>
              </div>
              <Button variant="outline-secondary" onClick={leaveWaitingRoom}>
                Rời phòng chờ
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default WaitingRoom; 