import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Container, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPhoneSlash } from 'react-icons/fa';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { AGORA_CONFIG } from '../../config/agora';

const SimpleMeetingRoom = () => {
  const { meetingId } = useParams();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState({});
  
  // Refs
  const clientRef = useRef(null);
  const localVideoRef = useRef(null);
  
  // Get parameters from URL
  const channelName = searchParams.get('channelName');
  const token = searchParams.get('token');
  const originalUid = searchParams.get('uid');
  const appID = searchParams.get('appID');
  const meetingTitle = searchParams.get('meetingTitle');

  // Convert large UID to valid Agora UID (0-10000)
  const uid = originalUid ? (parseInt(originalUid) % 10000) : Math.floor(Math.random() * 10000);

  useEffect(() => {
    console.log('Meeting Room Parameters:', {
      meetingId,
      channelName,
      token,
      uid,
      appID,
      meetingTitle
    });
    
    if (!channelName || !token || !uid || !appID) {
      setError('Thiếu thông tin cần thiết để tham gia cuộc họp');
    } else {
      setError('');
      // Initialize Agora client
      initializeAgoraClient();
    }
    
    setIsLoading(false);

    // Cleanup function
    return () => {
      if (clientRef.current) {
        handleLeaveMeeting();
      }
    };
  }, [meetingId, channelName, token, uid, appID]);

  const initializeAgoraClient = () => {
    try {
      // Create Agora client
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      // Set up event listeners
      client.on('user-published', async (user, mediaType) => {
        console.log('User published:', user.uid, mediaType);
        
        // Subscribe to remote user
        await client.subscribe(user, mediaType);
        
        if (mediaType === 'video') {
          // Get video container and play video
          const remoteVideoContainer = document.getElementById(`remote-video-${user.uid}`);
          if (remoteVideoContainer) {
            user.videoTrack.play(remoteVideoContainer);
          }
        }
        
        if (mediaType === 'audio') {
          user.audioTrack.play();
        }

        // Update remote users state
        setRemoteUsers(prev => ({
          ...prev,
          [user.uid]: {
            ...prev[user.uid],
            uid: user.uid,
            hasVideo: mediaType === 'video' ? true : prev[user.uid]?.hasVideo,
            hasAudio: mediaType === 'audio' ? true : prev[user.uid]?.hasAudio,
          }
        }));
      });

      client.on('user-unpublished', (user, mediaType) => {
        console.log('User unpublished:', user.uid, mediaType);
        
        setRemoteUsers(prev => ({
          ...prev,
          [user.uid]: {
            ...prev[user.uid],
            hasVideo: mediaType === 'video' ? false : prev[user.uid]?.hasVideo,
            hasAudio: mediaType === 'audio' ? false : prev[user.uid]?.hasAudio,
          }
        }));
      });

      client.on('user-left', (user) => {
        console.log('User left:', user.uid);
        setRemoteUsers(prev => {
          const newUsers = { ...prev };
          delete newUsers[user.uid];
          return newUsers;
        });
      });

      console.log('Agora client initialized successfully');
    } catch (err) {
      console.error('Error initializing Agora client:', err);
      setError('Lỗi khởi tạo Agora: ' + err.message);
    }
  };

  const handleJoinMeeting = async () => {
    if (!clientRef.current) {
      setError('Agora client chưa được khởi tạo');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      console.log('Joining channel with:', {
        appID,
        channelName,
        token: token?.substring(0, 20) + '...',
        uid,
        originalUid
      });

      // Validate token format
      if (!token || token.length < 50) {
        throw new Error('Token không hợp lệ hoặc quá ngắn');
      }

      // Try to join with current token first
      try {
        await clientRef.current.join(appID, channelName, token, uid);
        console.log('Successfully joined channel with original token');
      } catch (tokenError) {
        console.warn('Failed with original token, trying to get new token:', tokenError);
        
        // Try to get a new token from backend
        const newToken = await getNewToken();
        if (newToken) {
          await clientRef.current.join(appID, channelName, newToken, uid);
          console.log('Successfully joined channel with new token');
        } else {
          throw tokenError;
        }
      }
      
      setIsJoined(true);
      
      // Create and publish local tracks
      await startLocalTracks();
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error joining meeting:', err);
      setError('Lỗi tham gia cuộc họp: ' + err.message);
      setIsLoading(false);
    }
  };

  const getNewToken = async () => {
    try {
      console.log('Requesting new token for:', { channelName, uid });
      
      const response = await fetch(`${AGORA_CONFIG.API_BASE_URL}/agora/test/meeting/${meetingId}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName,
          uid
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Got new token:', data.token?.substring(0, 20) + '...');
        return data.token;
      } else {
        const errorData = await response.json();
        console.error('Failed to get new token:', errorData);
        setError('Lỗi lấy token: ' + (errorData.message || 'Unknown error'));
        return null;
      }
    } catch (err) {
      console.error('Error getting new token:', err);
      setError('Không thể kết nối backend để lấy token mới');
      return null;
    }
  };

  const startLocalTracks = async () => {
    try {
      // Create video track
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      setLocalVideoTrack(videoTrack);
      setIsCameraOn(true);
      
      // Create audio track
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(audioTrack);
      setIsMicOn(true);

      // Play local video
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      // Publish tracks
      await clientRef.current.publish([videoTrack, audioTrack]);
      console.log('Local tracks published successfully');
      
    } catch (err) {
      console.error('Error creating local tracks:', err);
      setError('Lỗi bật camera/mic: ' + err.message);
    }
  };

  const toggleCamera = async () => {
    if (!localVideoTrack) return;

    try {
      if (isCameraOn) {
        await localVideoTrack.setEnabled(false);
        setIsCameraOn(false);
      } else {
        await localVideoTrack.setEnabled(true);
        setIsCameraOn(true);
      }
    } catch (err) {
      console.error('Error toggling camera:', err);
      setError('Lỗi bật/tắt camera: ' + err.message);
    }
  };

  const toggleMic = async () => {
    if (!localAudioTrack) return;

    try {
      if (isMicOn) {
        await localAudioTrack.setEnabled(false);
        setIsMicOn(false);
      } else {
        await localAudioTrack.setEnabled(true);
        setIsMicOn(true);
      }
    } catch (err) {
      console.error('Error toggling mic:', err);
      setError('Lỗi bật/tắt mic: ' + err.message);
    }
  };

  const handleLeaveMeeting = async () => {
    try {
      // Stop local tracks
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
      }
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
      }

      // Leave channel
      if (clientRef.current) {
        await clientRef.current.leave();
      }

      // Reset states
      setIsJoined(false);
      setIsCameraOn(false);
      setIsMicOn(false);
      setLocalVideoTrack(null);
      setLocalAudioTrack(null);
      setRemoteUsers({});

      // Close window or navigate back
      window.close();
    } catch (err) {
      console.error('Error leaving meeting:', err);
      setError('Lỗi rời cuộc họp: ' + err.message);
    }
  };

  const handleGetNewToken = async () => {
    try {
      console.log('Requesting new token for:', { channelName, uid });
      
      const newToken = await getNewToken();
      if (newToken) {
        console.log('Got new token:', newToken?.substring(0, 20) + '...');
        // Handle the new token
      } else {
        console.error('Failed to get new token');
      }
    } catch (err) {
      console.error('Error getting new token:', err);
      setError('Lỗi lấy token mới: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>{isJoined ? 'Đang bật camera và mic...' : 'Đang tải cuộc họp...'}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="meeting-room-container" style={{ height: '100vh', background: '#1a1a1a', color: 'white' }}>
      {error && (
        <Alert variant="danger" className="m-3">
          {error}
        </Alert>
      )}
      
      <Row className="h-100">
        <Col className="d-flex flex-column">
          {/* Header */}
          <div className="meeting-header p-3 border-bottom">
            <h2>{decodeURIComponent(meetingTitle || 'Cuộc họp')}</h2>
            <p className="mb-0">Meeting ID: {meetingId}</p>
            <p className="mb-0">Channel: {channelName}</p>
            <p className="mb-0">Your UID: {uid} {originalUid && originalUid !== uid.toString() && `(converted from ${originalUid})`}</p>
            {isJoined && (
              <p className="mb-0 text-success">✅ Đã tham gia cuộc họp</p>
            )}
          </div>
          
          {/* Video Area */}
          <div className="flex-grow-1 p-3">
            <Row className="h-100">
              {/* Local Video */}
              <Col md={6} className="mb-3">
                <Card className="h-100" style={{ background: '#2a2a2a', border: '2px solid #007bff' }}>
                  <Card.Header className="text-center">
                    <strong>Bạn</strong>
                    {isCameraOn && <span className="text-success ms-2">📹</span>}
                    {isMicOn && <span className="text-success ms-2">🎤</span>}
                  </Card.Header>
                  <Card.Body className="p-0 position-relative">
                    <div 
                      ref={localVideoRef}
                      style={{ 
                        width: '100%', 
                        height: '300px', 
                        background: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666'
                      }}
                    >
                      {!isCameraOn && 'Camera đang tắt'}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Remote Videos */}
              {Object.keys(remoteUsers).map((remoteUid) => (
                <Col md={6} key={remoteUid} className="mb-3">
                  <Card className="h-100" style={{ background: '#2a2a2a', border: '1px solid #333' }}>
                    <Card.Header className="text-center">
                      <strong>Người dùng {remoteUid}</strong>
                      {remoteUsers[remoteUid]?.hasVideo && <span className="text-success ms-2">📹</span>}
                      {remoteUsers[remoteUid]?.hasAudio && <span className="text-success ms-2">🎤</span>}
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div 
                        id={`remote-video-${remoteUid}`}
                        style={{ 
                          width: '100%', 
                          height: '300px', 
                          background: '#000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666'
                        }}
                      >
                        {!remoteUsers[remoteUid]?.hasVideo && 'Camera đang tắt'}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}

              {/* Placeholder when no remote users */}
              {Object.keys(remoteUsers).length === 0 && isJoined && (
                <Col md={6} className="mb-3">
                  <Card className="h-100" style={{ background: '#2a2a2a', border: '1px solid #333' }}>
                    <Card.Body className="d-flex align-items-center justify-content-center">
                      <div className="text-center text-muted">
                        <h5>Đang chờ người khác tham gia...</h5>
                        <p>Cuộc họp đã sẵn sàng</p>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
          
          {/* Controls */}
          <div className="meeting-controls p-3 d-flex justify-content-center gap-3">
            {!isJoined ? (
              <>
                <Button variant="success" size="lg" onClick={handleJoinMeeting} disabled={isLoading}>
                  <FaVideo className="me-2" />
                  {isLoading ? 'Đang tham gia...' : 'Tham gia cuộc họp'}
                </Button>
                
                <Button variant="warning" size="lg" onClick={handleGetNewToken} disabled={isLoading}>
                  🔄 Token mới
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant={isMicOn ? "success" : "secondary"} 
                  size="lg" 
                  onClick={toggleMic}
                >
                  {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                </Button>
                
                <Button 
                  variant={isCameraOn ? "success" : "secondary"} 
                  size="lg" 
                  onClick={toggleCamera}
                >
                  {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
                </Button>
                
                <Button variant="danger" size="lg" onClick={handleLeaveMeeting}>
                  <FaPhoneSlash className="me-2" />
                  Rời khỏi
                </Button>
              </>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SimpleMeetingRoom; 