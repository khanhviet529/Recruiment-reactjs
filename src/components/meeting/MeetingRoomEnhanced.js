import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axios from 'axios';
import './MeetingRoom.scss';
import { Container, Button, Row, Col, Card, Alert, Badge, Modal, Form } from 'react-bootstrap';

// Import icons
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaUserFriends, FaBriefcase, FaUserCircle, FaComments, FaDesktop, FaStopCircle, FaSync } from 'react-icons/fa';
import { selectAuth } from '../../redux/slices/authSlice';
import { useAgora } from '../../hooks/useAgora';
import ChatRoom from './ChatRoom';

// API URL
const API_URL = 'http://localhost:5000';

// Initialize Agora client
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

const MeetingRoomEnhanced = () => {
  // State variables
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [activeParticipants, setActiveParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenTrack, setScreenTrack] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [isTokenExpiring, setIsTokenExpiring] = useState(false);
  
  // Refs
  const rtcClientRef = useRef(null);
  const localVideoRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const remoteUsersRef = useRef({});
  const tokenCheckIntervalRef = useRef(null);

  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);

  // Enhanced Agora hook
  const {
    agoraConfig,
    loading: agoraLoading,
    error: agoraError,
    currentTokenData,
    generateMeetingTokenEnhanced,
    refreshToken,
    checkTokenValidity,
    autoRefreshToken
  } = useAgora();

  // Agora configuration
  const APP_ID = agoraConfig?.appID || "4634eb2bb9ba449ebd2f54a2d4811689";
  const uid = user ? user.id : Math.floor(Math.random() * 10000);

  // Enhanced token management
  const initializeTokenAndJoin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      console.log('🚀 Initializing enhanced token system for meeting:', meetingId);

      // Generate enhanced meeting token (with database persistence)
      const tokenResponse = await generateMeetingTokenEnhanced(meetingId, uid);
      
      if (!tokenResponse || !tokenResponse.token) {
        throw new Error('Failed to generate meeting token');
      }

      console.log('✅ Enhanced token generated:', tokenResponse);
      setTokenData(tokenResponse);

      // Initialize Agora with the new token
      await initAgoraEnhanced(tokenResponse);

    } catch (error) {
      console.error('❌ Token initialization failed:', error);
      setErrorMessage(`Token initialization failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Enhanced Agora initialization
  const initAgoraEnhanced = async (tokenResponse) => {
    if (!meetingInfo) {
      console.error("Missing meeting data");
      setErrorMessage("Thiếu thông tin cuộc họp");
      return;
    }

    try {
      console.log("🎯 Initializing enhanced Agora client");
      
      // Channel name from meeting data
      const channel = meetingInfo.channelName || `meeting_${meetingInfo.id}`;
      setChannelName(channel);
      
      // Use token from response
      const token = tokenResponse.token;
      const agoraUid = tokenResponse.agoraUID || tokenResponse.uid || uid;
      
      console.log("Channel:", channel, "UID:", agoraUid, "Token ID:", tokenResponse.tokenId);

      // Join the channel with enhanced token
      await client.join(APP_ID, channel, token, agoraUid);
      rtcClientRef.current = client;

      // Set client role based on user type
      const userRole = user?.role || 'unknown';
      const isCompanyUser = userRole === 'company' || userRole === 'admin';
      
      if (isCompanyUser) {
        client.setClientRole("host");
      }
      
      // Create and publish media tracks
      await setupMediaTracks();
      
      // Set up event listeners
      setupEventListeners();
      
      // Start token monitoring
      startTokenMonitoring(tokenResponse);
      
      console.log("✅ Successfully joined channel with enhanced token:", channel);
    } catch (error) {
      console.error("❌ Error initializing enhanced Agora client:", error);
      setErrorMessage('Lỗi kết nối: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced media tracks setup
  const setupMediaTracks = async () => {
    try {
      console.log("🎥 Setting up media tracks");
      
      // Create audio track
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(audioTrack);
      localAudioTrackRef.current = audioTrack;
      
      // Create video track
      try {
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        setLocalVideoTrack(videoTrack);
        localVideoTrackRef.current = videoTrack;
        
        // Play local video
        videoTrack.play('user-1');
        
        // Publish tracks
        await rtcClientRef.current.publish([audioTrack, videoTrack]);
        console.log("✅ Media tracks published successfully");
        
      } catch (videoError) {
        console.warn("⚠️ Camera not available, using audio only:", videoError);
        setIsCameraOn(false);
        await rtcClientRef.current.publish([audioTrack]);
      }
      
    } catch (mediaError) {
      console.error("❌ Could not access media devices:", mediaError);
      setErrorMessage('Không thể truy cập microphone hoặc camera');
    }
  };

  // Enhanced token monitoring
  const startTokenMonitoring = (tokenResponse) => {
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
    }

    tokenCheckIntervalRef.current = setInterval(async () => {
      try {
        if (!tokenResponse || !tokenResponse.tokenId) return;

        // Check if token is about to expire (5 minutes before)
        const expiresAt = new Date(tokenResponse.expiresAt);
        const now = new Date();
        const minutesUntilExpiry = (expiresAt - now) / (1000 * 60);

        if (minutesUntilExpiry <= 5 && minutesUntilExpiry > 0) {
          console.log(`🔔 Token expiring in ${minutesUntilExpiry.toFixed(1)} minutes`);
          setIsTokenExpiring(true);
          
          // Auto-refresh token
          try {
            const refreshedToken = await refreshToken(tokenResponse.tokenId);
            if (refreshedToken) {
              console.log('🔄 Token auto-refreshed successfully');
              setTokenData(refreshedToken);
              setIsTokenExpiring(false);
              
              // Restart monitoring with new token
              startTokenMonitoring(refreshedToken);
            }
          } catch (refreshError) {
            console.error('❌ Token auto-refresh failed:', refreshError);
            setErrorMessage('Token refresh failed. Please rejoin the meeting.');
          }
        }
      } catch (error) {
        console.error('❌ Token monitoring error:', error);
      }
    }, 60000); // Check every minute
  };

  // Enhanced event listeners setup
  const setupEventListeners = () => {
    if (!rtcClientRef.current) return;

    console.log("🔗 Setting up enhanced event listeners");

    // Handle when a new user joins
    rtcClientRef.current.on('user-published', async (remoteUser, mediaType) => {
      try {
        console.log('👤 Remote user published:', remoteUser.uid, mediaType);
        
        await rtcClientRef.current.subscribe(remoteUser, mediaType);
        console.log('✅ Subscribed to remote user:', remoteUser.uid);

        // Update remote users state
        setRemoteUsers(prev => ({
          ...prev,
          [remoteUser.uid]: remoteUser
        }));

        // Play remote video if it's video track
        if (mediaType === 'video') {
          const videoElement = document.getElementById(`user-${remoteUser.uid}`);
          if (videoElement) {
            remoteUser.videoTrack.play(videoElement);
          }
        }

        // Play remote audio if it's audio track
        if (mediaType === 'audio') {
          remoteUser.audioTrack.play();
        }

      } catch (error) {
        console.error('❌ Error handling remote user:', error);
      }
    });

    // Handle when a user leaves
    rtcClientRef.current.on('user-unpublished', (remoteUser, mediaType) => {
      console.log('👋 Remote user unpublished:', remoteUser.uid, mediaType);
      
      if (mediaType === 'video') {
        const videoElement = document.getElementById(`user-${remoteUser.uid}`);
        if (videoElement) {
          videoElement.innerHTML = '';
        }
      }
    });

    // Handle user left
    rtcClientRef.current.on('user-left', (remoteUser) => {
      console.log('👋 Remote user left:', remoteUser.uid);
      setRemoteUsers(prev => {
        const updated = { ...prev };
        delete updated[remoteUser.uid];
        return updated;
      });
    });

    // Handle connection state changes
    rtcClientRef.current.on('connection-state-change', (curState, revState) => {
      console.log('🔗 Connection state changed:', revState, '->', curState);
      if (curState === 'DISCONNECTED' || curState === 'FAILED') {
        setErrorMessage('Connection lost. Attempting to reconnect...');
        // Could implement auto-reconnect logic here
      }
    });
  };

  // Fetch meeting data
  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        if (!meetingId) return;
        
        setIsLoading(true);
        console.log('📋 Fetching meeting data for:', meetingId);
        
        // Fetch meeting data
        const meetingResponse = await axios.get(`${API_URL}/meetings/${meetingId}`);
        const meetingData = meetingResponse.data;
        
        if (!meetingData) {
          throw new Error('Meeting not found');
        }
        
        setMeetingInfo(meetingData);
        
        // Set participants
        if (meetingData.participants && meetingData.participants.length > 0) {
          setParticipants(meetingData.participants);
          setActiveParticipants(meetingData.participants);
        
          // Check current user authorization
          const currentUserParticipant = meetingData.participants.find(p => 
            p.userId === user.id || p.email === user.email
          );
          
          if (currentUserParticipant) {
            setCurrentUser(currentUserParticipant);
            setIsHost(currentUserParticipant.role === 'host' || currentUserParticipant.isHost);
          }
        }
        
        console.log('✅ Meeting data loaded:', meetingData);
        
      } catch (error) {
        console.error("❌ Error fetching meeting data:", error);
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
      leaveChannelEnhanced();
    };
  }, [meetingId, navigate, user]);

  // Initialize token and join when meeting data is ready
  useEffect(() => {
    if (meetingInfo && !tokenData && !isLoading) {
      initializeTokenAndJoin();
    }
  }, [meetingInfo, tokenData]);

  // Enhanced leave channel
  const leaveChannelEnhanced = async () => {
    try {
      console.log('👋 Leaving channel with enhanced cleanup');
      
      // Stop token monitoring
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
      }

      // Stop local tracks
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
      }
      
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
      }

      if (screenTrack) {
        screenTrack.stop();
        screenTrack.close();
      }

      // Leave channel
      if (rtcClientRef.current) {
        await rtcClientRef.current.leave();
      }

      // Invalidate token if we have tokenId
      if (tokenData && tokenData.tokenId) {
        try {
          // Note: We could invalidate the token here, but since the user might rejoin,
          // we'll let it expire naturally or be cleaned up by the backend
          console.log('🔑 Token will expire naturally:', tokenData.tokenId);
        } catch (error) {
          console.warn('⚠️ Could not invalidate token:', error.message);
        }
      }

      console.log('✅ Successfully left channel');
    } catch (error) {
      console.error('❌ Error leaving channel:', error);
    }
  };

  // Enhanced toggle camera
  const toggleCamera = async () => {
    try {
      if (isCameraOn) {
        await localVideoTrackRef.current.setEnabled(false);
        setIsCameraOn(false);
      } else {
        await localVideoTrackRef.current.setEnabled(true);
        setIsCameraOn(true);
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  };

  // Enhanced toggle microphone
  const toggleMic = async () => {
    try {
      if (isMicOn) {
        await localAudioTrackRef.current.setEnabled(false);
        setIsMicOn(false);
      } else {
        await localAudioTrackRef.current.setEnabled(true);
        setIsMicOn(true);
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  };

  // Manual token refresh
  const handleManualTokenRefresh = async () => {
    if (!tokenData || !tokenData.tokenId) {
      setErrorMessage('No token to refresh');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Manual token refresh requested');
      
      const refreshedToken = await refreshToken(tokenData.tokenId);
      if (refreshedToken) {
        setTokenData(refreshedToken);
        setIsTokenExpiring(false);
        console.log('✅ Token refreshed manually');
        
        // Restart monitoring
        startTokenMonitoring(refreshedToken);
      }
    } catch (error) {
      console.error('❌ Manual token refresh failed:', error);
      setErrorMessage('Failed to refresh token');
    } finally {
      setIsLoading(false);
    }
  };

  // Render token status
  const renderTokenStatus = () => {
    if (!tokenData) return null;

    const expiresAt = new Date(tokenData.expiresAt);
    const now = new Date();
    const minutesUntilExpiry = (expiresAt - now) / (1000 * 60);

    return (
      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>🔑 Token Status</span>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={handleManualTokenRefresh}
            disabled={isLoading}
          >
            <FaSync className={isLoading ? 'fa-spin' : ''} /> Refresh
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-between">
            <span>Token ID:</span>
            <code>{tokenData.tokenId}</code>
          </div>
          <div className="d-flex justify-content-between">
            <span>Expires in:</span>
            <Badge variant={minutesUntilExpiry <= 5 ? 'danger' : 'success'}>
              {minutesUntilExpiry > 0 ? `${minutesUntilExpiry.toFixed(0)} minutes` : 'Expired'}
            </Badge>
          </div>
          {tokenData.isExisting && (
            <div className="mt-2">
              <Badge variant="info">♻️ Reused existing token</Badge>
            </div>
          )}
          {isTokenExpiring && (
            <Alert variant="warning" className="mt-2 mb-0">
              🔔 Token is expiring soon and will be auto-refreshed
            </Alert>
          )}
        </Card.Body>
      </Card>
    );
  };

  // Render loading state
  if (isLoading || agoraLoading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Connecting to meeting...</p>
        </div>
      </Container>
    );
  }

  // Render error state
  if (errorMessage || agoraError) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <h5>Connection Error</h5>
          <p>{errorMessage || agoraError}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="meeting-room">
      <Row className="h-100">
        <Col md={showChat ? 8 : 12} className="video-section">
          {/* Meeting Header */}
          <div className="meeting-header">
            <h4>{meetingInfo?.title || 'Meeting Room'}</h4>
            <div className="meeting-controls">
              <Button
                variant={isCameraOn ? "success" : "danger"}
                onClick={toggleCamera}
                className="me-2"
              >
                {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
              </Button>
              <Button
                variant={isMicOn ? "success" : "danger"}
                onClick={toggleMic}
                className="me-2"
              >
                {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </Button>
              <Button
                variant="info"
                onClick={() => setShowChat(!showChat)}
                className="me-2"
              >
                <FaComments />
              </Button>
              <Button
                variant="danger"
                onClick={leaveChannelEnhanced}
              >
                <FaPhoneSlash />
              </Button>
            </div>
          </div>

          {/* Token Status */}
          {tokenData && renderTokenStatus()}

          {/* Video Grid */}
          <div className="video-grid">
            {/* Local Video */}
            <div className="video-container">
              <div id="user-1" className="video-player"></div>
              <div className="video-overlay">
                <span>You</span>
              </div>
            </div>

            {/* Remote Videos */}
            {Object.keys(remoteUsers).map(uid => (
              <div key={uid} className="video-container">
                <div id={`user-${uid}`} className="video-player"></div>
                <div className="video-overlay">
                  <span>User {uid}</span>
                </div>
              </div>
            ))}
          </div>
        </Col>

        {/* Chat Section */}
        {showChat && (
          <Col md={4} className="chat-section">
            <ChatRoom 
              meetingId={meetingId}
              currentUser={user}
              participants={participants}
            />
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default MeetingRoomEnhanced; 