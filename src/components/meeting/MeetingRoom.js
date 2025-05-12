import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axios from 'axios';
import './MeetingRoom.scss';
import { Container, Button, Row, Col, Card, Alert, Badge, Modal, Form } from 'react-bootstrap';

// Import icons
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaUserFriends, FaBriefcase, FaUserCircle } from 'react-icons/fa';
import { selectAuth } from '../../redux/slices/authSlice';
import { getAgoraToken as getStoredAgoraToken, saveAgoraToken } from '../../utils/tokenStorage';

// API URL
const API_URL = 'http://localhost:5000';

// Initialize Agora client
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

const MeetingRoom = () => {
  // State variables
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [agoraToken, setAgoraToken] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  
  // Refs
  const rtcClientRef = useRef(null);
  const localVideoRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const remoteUsersRef = useRef({});

  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);

  // Agora configuration
  const APP_ID = "4634eb2bb9ba449ebd2f54a2d4811689";
  // User ID from auth state or generated
  const uid = user ? user.id : Math.floor(Math.random() * 10000);
  // For testing, if Agora token generation fails
  const [useTestToken, setUseTestToken] = useState(false);

  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        if (!meetingId) return;
        
        setIsLoading(true);
        
        // Fetch meeting data first
        const meetingResponse = await axios.get(`${API_URL}/meetings/${meetingId}`);
        const meetingData = meetingResponse.data;
        
        if (!meetingData) {
          throw new Error('Meeting not found');
        }
        
        setMeetingInfo(meetingData);
        
        // Extract participants from meeting
        if (meetingData.participants && meetingData.participants.length > 0) {
          setParticipants(meetingData.participants);
        
        // Check if current user is a participant
          const currentUserParticipant = meetingData.participants.find(p => 
            p.userId === user.id || 
            p.email === user.email || 
            (p.userType === user.role && (
              p.userId === user.id || 
              p.name?.includes(user.name || '') || 
              p.name?.includes(user.firstName || '') || 
              p.name?.includes(user.lastName || '')
            ))
          );
          
          if (currentUserParticipant) {
            setCurrentUser(currentUserParticipant);
            setIsHost(currentUserParticipant.role === 'host' || currentUserParticipant.isHost);
          } else if (process.env.NODE_ENV === 'production') {
          throw new Error('You are not authorized to join this meeting');
          }
        }
        
        // After getting meeting data, check for token
        const storedToken = getStoredAgoraToken();
        
        if (storedToken) {
          console.log("Using stored Agora token");
          setAgoraToken(storedToken);
          
          // Initialize Agora with the token
          await initAgora(storedToken, meetingData);
        } else {
          console.log("No stored token, showing token modal");
          // Show token input modal
          setShowTokenModal(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching meeting details:", error);
        setErrorMessage(error.message || "Không thể lấy thông tin cuộc họp");
        setIsLoading(false);
      }
    };

    if (meetingId) {
      fetchMeetingData();
    } else {
      navigate('/dashboard');
    }
    
    // Cleanup on unmount
    return () => {
      leaveChannel();
    };
  }, [meetingId, navigate, uid, user]);

  // Handle token submission from modal
  const handleTokenSubmit = async (token) => {
    if (!token.trim()) {
      setErrorMessage('Please enter a valid token');
      return;
    }
    
    try {
      setIsLoading(true);
      setShowTokenModal(false);
      
      // Save token for future use
      saveAgoraToken(token);
      setAgoraToken(token);
      
      // Initialize Agora with the token
      await initAgora(token, meetingInfo);
    } catch (error) {
      console.error("Error initializing with token:", error);
      setErrorMessage("Failed to join with the provided token");
      setIsLoading(false);
    }
  };

  // Initialize Agora client
  const initAgora = async (token, meetingData) => {
    if (!meetingData) {
      console.error("Missing meeting data");
      setErrorMessage("Thiếu thông tin cuộc họp");
      return;
    }

    try {
      console.log("Initializing Agora client");
      
      // Channel name from meeting data
      const channelName = meetingData.channelName || `meeting-${meetingData.id}`;
      console.log("Channel:", channelName, "UID:", uid);
      
      // Join the channel
      await client.join(APP_ID, channelName, token || "dummy_token_for_development", uid);
      rtcClientRef.current = client;
      
      // Create and publish tracks
      try {
        // First try only audio in case there's a problem with video
        console.log("Creating audio track");
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        setLocalAudioTrack(audioTrack);
        
        // Then try to get video separately
        try {
          console.log("Creating video track");
          const videoTrack = await AgoraRTC.createCameraVideoTrack();
          
          setLocalVideoTrack(videoTrack);
          
          // Play local video track
          console.log("Playing local video");
          videoTrack.play('user-1');
          
          // Publish both tracks (only if we have a real connection)
          if (!useTestToken) {
            console.log("Publishing audio and video tracks");
          await rtcClientRef.current.publish([audioTrack, videoTrack]);
          } else {
            console.log("Test mode: Skipping track publishing");
          }
        } catch (videoError) {
          console.warn("Could not access camera, continuing with audio only:", videoError);
          setErrorMessage('Không thể truy cập camera. Đang tiếp tục với chỉ âm thanh.');
          setIsCameraOn(false);
          
          // Continue with just audio (only if we have a real connection)
          if (!useTestToken) {
            console.log("Publishing audio track only");
          await rtcClientRef.current.publish([audioTrack]);
          } else {
            console.log("Test mode: Skipping audio publishing");
          }
        }
      } catch (mediaError) {
        console.error("Could not access any media devices:", mediaError);
        setErrorMessage('Không thể truy cập microphone hoặc camera. Vui lòng kiểm tra quyền truy cập thiết bị của bạn.');
      }
      
      // Set up event listeners (only if we have a real connection)
      if (!useTestToken) {
      setupEventListeners();
      } else {
        // In test mode, simulate a remote user after a delay
        setTimeout(() => {
          console.log("Test mode: Simulating a remote participant");
          
          // Find a remote participant (not the current user)
          const remoteParticipant = participants.find(p => p.userId !== user.id);
          if (remoteParticipant) {
            // Create a fake remote user for UI display
            const fakeRemoteUser = {
              uid: remoteParticipant.userId,
              // No actual tracks in test mode
            };
            
            setRemoteUsers(prev => ({
              ...prev,
              [remoteParticipant.userId]: fakeRemoteUser
            }));
          }
        }, 3000);
      }
      
      console.log("Successfully joined channel:", channelName);
    } catch (error) {
      console.error("Error initializing Agora client:", error);
      setErrorMessage('Lỗi kết nối: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up event listeners for remote users
  const setupEventListeners = () => {
    if (!rtcClientRef.current) return;

    // Handle when a new user joins
    rtcClientRef.current.on('user-published', async (remoteUser, mediaType) => {
      // Subscribe to the remote user
      await rtcClientRef.current.subscribe(remoteUser, mediaType);
      
      console.log('Remote user subscribed:', remoteUser.uid, mediaType);
      
      // If the subscribed media is video
      if (mediaType === 'video') {
        // Store the remote user's video track
        setRemoteUsers(prevUsers => ({
          ...prevUsers,
          [remoteUser.uid]: remoteUser
        }));
        
        // Play the remote video
        setTimeout(() => {
          if (remoteUser.videoTrack) {
            remoteUser.videoTrack.play('user-2');
          }
        }, 1000); // Small delay to ensure DOM is ready
      }
      
      // If the subscribed media is audio
      if (mediaType === 'audio' && remoteUser.audioTrack) {
        remoteUser.audioTrack.play();
      }
    });

    // Handle when a user leaves
    rtcClientRef.current.on('user-unpublished', (remoteUser, mediaType) => {
      console.log('Remote user unpublished:', remoteUser.uid, mediaType);
      
      // If it's video, remove them from our state
      if (mediaType === 'video') {
        setRemoteUsers(prevUsers => {
          const newUsers = { ...prevUsers };
          delete newUsers[remoteUser.uid];
          return newUsers;
        });
      }
    });

    // Handle when a user leaves the channel
    rtcClientRef.current.on('user-left', (remoteUser) => {
      console.log('Remote user left:', remoteUser.uid);
      
      setRemoteUsers(prevUsers => {
        const newUsers = { ...prevUsers };
        delete newUsers[remoteUser.uid];
        return newUsers;
      });
    });
  };

  const leaveChannel = async () => {
    try {
      // Notify server that user is leaving if meeting ID exists
      if (meetingId && user) {
        try {
      await axios.post(`${API_URL}/meetings/${meetingId}/leave`, {
        userId: user.id,
        reason: 'user_initiated'
      });
        } catch (e) {
          console.warn('Could not notify server of leave:', e);
        }
      }
      
      // Clean up Agora resources
      if (localAudioTrack) {
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }
      
      if (localVideoTrack) {
        localVideoTrack.close();
        setLocalVideoTrack(null);
      }
      
      // Leave the Agora channel if client exists
      if (rtcClientRef.current) {
        try {
          await rtcClientRef.current.leave();
        } catch (e) {
          console.warn('Error leaving channel:', e);
        }
      }
      
      setRemoteUsers({});
    } catch (error) {
      console.error('Error leaving meeting:', error);
    }
  };

  const toggleCamera = async () => {
    if (!localVideoTrack && isCameraOn === false) {
      // Try to create a video track if one doesn't exist
      try {
        setIsLoading(true);
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        
        setLocalVideoTrack(videoTrack);
        setIsCameraOn(true);
        
        // Play local video track
        videoTrack.play('user-1');
        
        // Publish video track
        if (rtcClientRef.current) {
          await rtcClientRef.current.publish([videoTrack]);
        }
        
        setErrorMessage('');
      } catch (error) {
        console.error("Could not create video track:", error);
        setErrorMessage('Không thể bật camera. Vui lòng kiểm tra quyền truy cập thiết bị của bạn.');
      } finally {
        setIsLoading(false);
      }
    } else if (localVideoTrack) {
      // Toggle existing track
      const enabled = !localVideoTrack.enabled;
      localVideoTrack.setEnabled(enabled);
      setIsCameraOn(enabled);
    }
  };

  const toggleMic = async () => {
    if (!localAudioTrack && isMicOn === false) {
      // Try to create an audio track if one doesn't exist
      try {
        setIsLoading(true);
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        
        setLocalAudioTrack(audioTrack);
        setIsMicOn(true);
        
        // Publish audio track
        if (rtcClientRef.current) {
          await rtcClientRef.current.publish([audioTrack]);
        }
        
        setErrorMessage('');
      } catch (error) {
        console.error("Could not create audio track:", error);
        setErrorMessage('Không thể bật microphone. Vui lòng kiểm tra quyền truy cập thiết bị của bạn.');
      } finally {
        setIsLoading(false);
      }
    } else if (localAudioTrack) {
      // Toggle existing track
      const enabled = !localAudioTrack.enabled;
      localAudioTrack.setEnabled(enabled);
      setIsMicOn(enabled);
    }
  };

  const handleEndCall = async () => {
    await leaveChannel();
    navigate(-1); // Go back to previous page
  };

  // Get the candidate participant
  const getCandidateParticipant = () => {
    return participants.find(p => p.userType === 'candidate');
  };

  const hasRemoteUsers = Object.keys(remoteUsers).length > 0;

  // Get user avatar from participant info
  const getUserAvatar = (userId) => {
    const participant = participants.find(p => p.userId === userId.toString());
    return participant?.avatar || null;
  };

  // Get user name from participant info
  const getUserName = (userId) => {
    const participant = participants.find(p => p.userId === userId.toString());
    return participant?.name || null;
  };

  // Render token input modal
  const renderTokenModal = () => {
    return (
      <Modal
        show={showTokenModal}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header>
          <Modal.Title>Nhập Token Agora</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {meetingInfo && (
            <div className="mb-3">
              <h6>{meetingInfo.title}</h6>
              <p className="text-muted small mb-0">
                Thời gian: {meetingInfo.startTime ? new Date(meetingInfo.startTime).toLocaleString('vi-VN') : 'Không xác định'}
              </p>
              <p className="text-muted small">
                Kênh: {meetingInfo.channelName || 'Không xác định'}
              </p>
            </div>
          )}
          
          <p>Để tham gia cuộc họp, vui lòng nhập token Agora của bạn.</p>
          
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleTokenSubmit(tokenInput);
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Token Agora</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập token Agora"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
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
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
          <Button
            variant="primary"
            onClick={() => handleTokenSubmit(tokenInput)}
            disabled={!tokenInput.trim()}
          >
            Tham gia cuộc họp
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // Placeholder for code generation during development (remove in production)
  const generateTestToken = () => {
    if (process.env.NODE_ENV === 'production') return;
    
    const testToken = `agora-token-${meetingId}-${uid}-${Date.now()}`;
    setTokenInput(testToken);
  };

  // If meeting data is still loading, show loading state
  if (isLoading && !meetingInfo) {
    return <div className="loading">Đang tải thông tin cuộc họp...</div>;
  }

  return (
    <div className="meeting-container">
      {/* Render the token modal if needed */}
      {showTokenModal && renderTokenModal()}
      
      {/* For development only - button to generate test token */}
      {process.env.NODE_ENV !== 'production' && showTokenModal && (
        <div className="dev-tools">
          <Button variant="outline-secondary" size="sm" onClick={generateTestToken}>
            Generate Test Token
          </Button>
        </div>
      )}

      <div className="meeting-header">
        <div className="meeting-info">
          <h3>{meetingInfo?.title || 'Video Meeting'}</h3>
          {meetingInfo?.jobTitle && (
            <div className="meeting-job-title">
              <FaBriefcase className="me-2" /> {meetingInfo.jobTitle}
            </div>
          )}
          <div className="meeting-participants">
            <FaUserFriends /> {participants.length} người tham gia
          </div>
        </div>
      </div>

      <div className="video-chat-container">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Đang kết nối...</p>
          </div>
        )}
        
        {errorMessage && !showTokenModal && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
        
        {useTestToken && (
          <div className="test-mode-indicator">
            Chế độ thử nghiệm
          </div>
        )}
        
        <div id="videos" className="videos-container">
          <div 
            id="user-1" 
            className={`video-player ${Object.keys(remoteUsers).length > 0 ? 'small-frame' : ''} ${!localVideoTrack || !isCameraOn ? 'no-video' : ''}`} 
          >
            {(!localVideoTrack || !isCameraOn) && (
              <div className="avatar-placeholder">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.firstName || user.name || ''}
                    className="user-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
                    }}
                  />
                ) : (
                  <span>{user ? (user.firstName?.charAt(0) || user.name?.charAt(0)) : uid.toString().substring(0, 1)}</span>
                )}
              </div>
            )}
            <div className="user-name-label">
              {user?.firstName || user?.name || 'Bạn'}
            </div>
          </div>
          
          {Object.keys(remoteUsers).length > 0 && (
            <div 
              id="user-2" 
              className="video-player"
            >
              {Object.values(remoteUsers).map(remoteUser => (
                !remoteUser.videoTrack && (
                  <div key={remoteUser.uid} className="avatar-placeholder">
                    {getUserAvatar(remoteUser.uid) ? (
                      <img 
                        src={getUserAvatar(remoteUser.uid)} 
                        alt={getUserName(remoteUser.uid) || 'Remote User'}
                        className="user-avatar"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
                        }}
                      />
                    ) : (
                      <span>{getUserName(remoteUser.uid)?.charAt(0) || remoteUser.uid.toString().substring(0, 1)}</span>
                    )}
                  </div>
                )
              ))}
              <div className="user-name-label">
                {getUserName(Object.values(remoteUsers)[0]?.uid) || 'Người tham gia'}
              </div>
            </div>
          )}
        </div>

        <div className="controls">
          <button 
            className={`control-btn ${!isCameraOn ? 'disabled' : ''}`} 
            onClick={toggleCamera}
          >
            {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
          </button>

          <button 
            className={`control-btn ${!isMicOn ? 'disabled' : ''}`} 
            onClick={toggleMic}
          >
            {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </button>

          <button 
            className="control-btn leave-btn"
            onClick={handleEndCall}
          >
            <FaPhoneSlash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom; 