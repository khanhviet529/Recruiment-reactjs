import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Alert, Row, Col, Card, Spinner, Modal, Badge } from 'react-bootstrap';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaClock, FaUsers, FaUserClock } from 'react-icons/fa';
import AgoraRTC from 'agora-rtc-sdk-ng';
import InMeetingWaitingCandidatesPanel from './InMeetingWaitingCandidatesPanel';
import { AGORA_CONFIG } from '../../config/agora';

const SmartMeetingRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [meetingData, setMeetingData] = useState(null);
  const [agoraConfig, setAgoraConfig] = useState(null);
  const [isJoined, setIsJoined] = useState(false);

  // Preview mode state - NEW
  const [isInPreview, setIsInPreview] = useState(true);
  const [previewCameraOn, setPreviewCameraOn] = useState(false);
  const [previewMicOn, setPreviewMicOn] = useState(false);

  // Leave meeting modal state
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Waiting candidates panel state - NEW
  const [showWaitingCandidatesPanel, setShowWaitingCandidatesPanel] = useState(false);
  const [waitingCandidatesCount, setWaitingCandidatesCount] = useState(0);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState({});

  // Real-time participant count tracking
  const [participantCount, setParticipantCount] = useState(0);

  // Video streams for React-managed rendering
  const [localVideoStream, setLocalVideoStream] = useState(null);
  const [remoteVideoStreams, setRemoteVideoStreams] = useState({});

  // User names mapping - NEW
  const [userNames, setUserNames] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Refs for video containers
  const clientRef = useRef(null);
  const localVideoRef = useRef(null);
  const previewVideoRef = useRef(null);

  // Permission status states
  const [cameraPermission, setCameraPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'
  const [micPermission, setMicPermission] = useState('prompt');
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);

  useEffect(() => {
    if (meetingId) {
      loadMeetingData();
    }
    return () => {
      handleCleanup();
    };
  }, [meetingId]);

  // Auto-join effect when agoraConfig becomes available
  useEffect(() => {
    if (agoraConfig && !isJoined && clientRef.current) {
      // Only initialize client for preview mode, do not auto-join
      console.log('✅ Agora client ready for preview mode');
    }
  }, [agoraConfig, isJoined]);

  // Effect to handle local video stream in meeting mode
  useEffect(() => {
    if (localVideoRef.current && localVideoStream && !isInPreview) {
      const videoElement = localVideoRef.current;
      videoElement.srcObject = localVideoStream;
      videoElement.play().catch(e => console.warn('Local video play failed:', e));
      console.log('🎥 Local video stream applied to meeting video element');
    }
  }, [localVideoStream, isInPreview]);

  // Effect to handle remote video streams
  useEffect(() => {
    Object.keys(remoteVideoStreams).forEach(uid => {
      const videoElement = document.getElementById(`remote-video-element-${uid}`);
      const stream = remoteVideoStreams[uid];

      if (videoElement && stream) {
        console.log(`🔄 Setting srcObject for remote user ${uid}`);
        videoElement.srcObject = stream;
        videoElement.play().catch(e => {
          console.warn(`⚠️ Remote video play failed for user ${uid}:`, e);
        });
      }
    });
  }, [remoteVideoStreams, remoteUsers]);

  // Effect to initialize participant count when joining
  useEffect(() => {
    if (isJoined) {
      // Set initial count: 1 (current user) + remote users
      const initialCount = Object.keys(remoteUsers).length + 1;
      setParticipantCount(initialCount);
      console.log(`👥 Joined meeting - Initial participant count: ${initialCount}`);
    } else {
      // Reset count when not joined
      setParticipantCount(0);
    }
  }, [isJoined, remoteUsers]);

  // Effect to handle page unload and ensure complete cleanup
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isJoined) {
        console.log('🚨 Page unloading - performing emergency cleanup');
        // Synchronous cleanup for page unload
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
          if (clientRef.current) {
            clientRef.current.leave();
            clientRef.current.removeAllListeners();
            clientRef.current = null;
          }
        } catch (err) {
          console.warn('⚠️ Emergency cleanup warning:', err);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isJoined, localVideoTrack, localAudioTrack, localVideoStream]);

  // Effect to handle preview video stream  
  useEffect(() => {
    if (previewVideoRef.current && localVideoStream && isInPreview) {
      const videoElement = previewVideoRef.current;
      videoElement.srcObject = localVideoStream;
      videoElement.play().catch(e => console.warn('Preview video play failed:', e));
      console.log('🎥 Local video stream applied to preview video element');
    }
  }, [localVideoStream, isInPreview]);

  // Effect to check meeting expiration in real-time
  useEffect(() => {
    if (!meetingData || !meetingData.endTime) return;

    const checkInterval = setInterval(() => {
      const isExpired = checkMeetingExpiration(meetingData);

      if (isExpired && isJoined) {
        console.log('⏰ Meeting expired during session - auto leaving...');
        setError('Cuộc họp đã kết thúc. Bạn sẽ được tự động đưa ra khỏi phòng.');

        // Auto leave after showing message
        setTimeout(() => {
          handleCleanup().then(() => {
            navigate(-1);
          });
        }, 3000);

        clearInterval(checkInterval);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [meetingData, isJoined, navigate]);

  // Check permissions on component mount
  useEffect(() => {
    checkPermissions();
  }, []);

  // Monitor waiting candidates count in real-time
  useEffect(() => {
    if (!meetingId || !isJoined) return;

    const monitorWaitingCandidates = async () => {
      const API_URL = 'http://localhost:5000';

      try {
        // Try API first
        try {
          const response = await fetch(`${API_URL}/meetings/${meetingId}/waiting-candidates`);
          if (response.ok) {
            const candidates = await response.json();
            const waitingCount = candidates.filter(c => c.status === 'waiting').length;
            setWaitingCandidatesCount(waitingCount);
            console.log('Updated waiting candidates count:', waitingCount);
            return;
          }
        } catch (apiError) {
          console.warn('API not available, using localStorage fallback');
        }

        // Fallback to localStorage
        const storageKey = `waitingCandidates_${meetingId}`;
        const localCandidates = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const waitingCount = localCandidates.filter(c => c.status === 'waiting').length;
        setWaitingCandidatesCount(waitingCount);
        console.log('Updated waiting candidates count from localStorage:', waitingCount);

      } catch (error) {
        console.error('Error monitoring waiting candidates:', error);
      }
    };

    // Initial check
    monitorWaitingCandidates();

    // Poll every 3 seconds
    const interval = setInterval(monitorWaitingCandidates, 3000);

    return () => clearInterval(interval);
  }, [meetingId, isJoined]);

  const checkPermissions = async () => {
    try {
      // Check camera permission
      const cameraResult = await navigator.permissions.query({ name: 'camera' });
      setCameraPermission(cameraResult.state);

      // Check microphone permission
      const micResult = await navigator.permissions.query({ name: 'microphone' });
      setMicPermission(micResult.state);

      // Listen for permission changes
      cameraResult.addEventListener('change', () => {
        setCameraPermission(cameraResult.state);
      });

      micResult.addEventListener('change', () => {
        setMicPermission(micResult.state);
      });

      console.log('📋 Current permissions - Camera:', cameraResult.state, 'Mic:', micResult.state);

    } catch (err) {
      console.warn('⚠️ Permission query not supported:', err);
    }
  };

  const requestPermissionWithGuidance = async (type) => {
    setError('');
    setShowPermissionGuide(true);

    try {
      let stream;
      if (type === 'camera') {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraPermission('granted');
      } else if (type === 'microphone') {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission('granted');
      } else if (type === 'both') {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setCameraPermission('granted');
        setMicPermission('granted');
      }

      // Stop the test stream immediately
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      setShowPermissionGuide(false);
      console.log(`✅ ${type} permission granted successfully`);

      return true;

    } catch (err) {
      console.error(`❌ ${type} permission denied:`, err);

      if (err.name === 'NotAllowedError') {
        if (type === 'camera') setCameraPermission('denied');
        if (type === 'microphone') setMicPermission('denied');
        if (type === 'both') {
          setCameraPermission('denied');
          setMicPermission('denied');
        }

        setError(`Quyền truy cập ${type === 'camera' ? 'camera' : type === 'microphone' ? 'microphone' : 'camera và microphone'} bị từ chối. Vui lòng:
        1. Click vào biểu tượng 🔒 hoặc 🎥 ở thanh địa chỉ
        2. Chọn "Cho phép" cho Camera và Microphone
        3. Refresh trang và thử lại`);
      } else {
        setError(`Lỗi ${type}: ${err.message}`);
      }

      setShowPermissionGuide(false);
      return false;
    }
  };

  // Check if meeting has expired
  const checkMeetingExpiration = (meetingData) => {
    if (!meetingData || !meetingData.endTime) {
      return false;
    }

    const currentTime = new Date();
    const endTime = new Date(meetingData.endTime);

    console.log('🕐 Checking meeting expiration:');
    console.log('📅 Current time:', currentTime.toLocaleString('vi-VN'));
    console.log('⏰ Meeting end time:', endTime.toLocaleString('vi-VN'));

    const isExpired = currentTime > endTime;

    if (isExpired) {
      const timeDiff = Math.round((currentTime - endTime) / 1000 / 60); // minutes
      console.log(`⏰ Meeting expired ${timeDiff} minutes ago`);
    } else {
      const timeLeft = Math.round((endTime - currentTime) / 1000 / 60); // minutes  
      console.log(`✅ Meeting still active, ${timeLeft} minutes left`);
    }

    return isExpired;
  };

  const loadMeetingData = async () => {
    try {
      setIsLoading(true);
      setError('');

      console.log('🔍 Loading meeting data for:', meetingId);

      const response = await fetch(`${AGORA_CONFIG.API_BASE_URL}/public/meetings/${meetingId}/join`);
      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 404) {
          throw new Error('Cuộc họp không tồn tại hoặc bạn không có quyền truy cập. Vui lòng kiểm tra lại link cuộc họp.');
        } else if (response.status === 403) {
          if (data.error === 'MEETING_CANCELLED') {
            throw new Error('Cuộc họp này đã bị hủy bởi nhà tuyển dụng.');
          } else {
            throw new Error('Bạn không có quyền truy cập cuộc họp này.');
          }
        } else if (response.status === 410) {
          if (data.error === 'MEETING_EXPIRED') {
            const endTime = new Date(data.endTime);
            throw new Error(`Cuộc họp này đã kết thúc lúc ${endTime.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}. Bạn không thể tham gia cuộc họp đã hết hạn.`);
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${data.message || response.statusText}`);
        }
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to load meeting data');
      }

      console.log('✅ Meeting data loaded:', data.data);
      console.log('🔐 Meeting access granted - valid meeting ID');

      // Check if meeting has expired (double-check on frontend)
      const meetingInfo = data.data.meeting;
      const isExpired = checkMeetingExpiration(meetingInfo);

      if (isExpired) {
        const endTime = new Date(meetingInfo.endTime);
        throw new Error(`Cuộc họp này đã kết thúc lúc ${endTime.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })}. Bạn không thể tham gia cuộc họp đã hết hạn.`);
      }

      setMeetingData(data.data.meeting);
      setAgoraConfig(data.data.agora);

      localStorage.setItem(`agora_token_${meetingId}`, JSON.stringify({
        token: data.data.agora.token,
        expiresAt: data.data.agora.expiresAt,
        channelName: data.data.agora.channelName,
        uid: data.data.agora.uid,
        appID: data.data.agora.appID
      }));

      initializeAgoraClient();
      setIsLoading(false);

    } catch (err) {
      console.error('❌ Error loading meeting data:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const initializeAgoraClient = () => {
    try {
      if (clientRef.current) {
        console.log('✅ Agora client already initialized');
        return;
      }

      console.log('🔧 Initializing Agora client...');

      const client = AgoraRTC.createClient({
        mode: 'rtc',
        codec: 'vp8'
      });

      // Set up event listeners for remote users
      client.on('user-published', async (user, mediaType) => {
        console.log(`📡 User published ${mediaType}:`, user.uid);

        // Fetch user name when they first join (for any media type)
        if (!userNames[user.uid]) {
          fetchUserName(user.uid);
        }

        try {
          await client.subscribe(user, mediaType);
          console.log(`✅ Subscribed to user ${user.uid} ${mediaType}`);

          if (mediaType === 'video') {
            console.log(`🎥 Playing remote video for user ${user.uid}`);

            const mediaStreamTrack = user.videoTrack.getMediaStreamTrack();
            const remoteStream = new MediaStream([mediaStreamTrack]);

            setRemoteVideoStreams(prev => ({
              ...prev,
              [user.uid]: remoteStream
            }));

            setRemoteUsers(prev => {
              const newUsers = {
                ...prev,
                [user.uid]: { ...prev[user.uid], hasVideo: true, videoTrack: user.videoTrack }
              };

              // Update participant count when new user joins (+1 for current user)
              setParticipantCount(Object.keys(newUsers).length + 1);
              console.log(`👥 Participant count updated: ${Object.keys(newUsers).length + 1}`);
              return newUsers;
            });
          }

          if (mediaType === 'audio') {
            console.log(`🔊 Playing remote audio for user ${user.uid}`);
            user.audioTrack.play();

            setRemoteUsers(prev => {
              const newUsers = {
                ...prev,
                [user.uid]: { ...prev[user.uid], hasAudio: true, audioTrack: user.audioTrack }
              };

              // Update participant count (+1 for current user)
              setParticipantCount(Object.keys(newUsers).length + 1);
              console.log(`👥 Participant count updated: ${Object.keys(newUsers).length + 1}`);
              return newUsers;
            });
          }
        } catch (subscribeError) {
          console.error(`❌ Subscribe failed for user ${user.uid}:`, subscribeError);
        }
      });

      client.on('user-unpublished', (user, mediaType) => {
        console.log(`📡 User unpublished ${mediaType}:`, user.uid);

        if (mediaType === 'video') {
          setRemoteVideoStreams(prev => {
            const newStreams = { ...prev };
            delete newStreams[user.uid];
            return newStreams;
          });

          setRemoteUsers(prev => ({
            ...prev,
            [user.uid]: { ...prev[user.uid], hasVideo: false, videoTrack: null }
          }));
        }

        if (mediaType === 'audio') {
          setRemoteUsers(prev => ({
            ...prev,
            [user.uid]: { ...prev[user.uid], hasAudio: false, audioTrack: null }
          }));
        }
      });

      client.on('user-left', (user) => {
        console.log(`👋 User left:`, user.uid);

        setRemoteVideoStreams(prev => {
          const newStreams = { ...prev };
          delete newStreams[user.uid];
          return newStreams;
        });

        setRemoteUsers(prev => {
          const newUsers = { ...prev };
          delete newUsers[user.uid];

          // Update participant count when user leaves
          const newCount = Math.max(0, Object.keys(newUsers).length + (isJoined ? 1 : 0));
          setParticipantCount(newCount);
          console.log(`👥 User left - Participant count updated: ${newCount}`);

          return newUsers;
        });
      });

      clientRef.current = client;
      console.log('✅ Agora client initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Agora client:', error);
      setError(`Lỗi khởi tạo Agora: ${error.message}`);
    }
  };

  // Synchronized permission handling with meeting join
  const handleJoinMeetingWithPermissions = async () => {
    try {
      setError('');
      setIsLoading(true);

      console.log('🔐 Starting synchronized permission and meeting join process...');

      if (!agoraConfig) {
        throw new Error('❌ Agora configuration not available');
      }

      // Request permissions and create tracks in one synchronized flow
      const { videoTrack, audioTrack } = await createLocalTracksWithPermissions();

      // Join the channel
      console.log(`🚀 Joining channel: ${agoraConfig.channelName} with UID: ${agoraConfig.uid}`);

      await clientRef.current.join(
        agoraConfig.appID,
        agoraConfig.channelName,
        agoraConfig.token,
        agoraConfig.uid
      );

      console.log('✅ Successfully joined Agora channel');

      // Publish tracks
      const tracksToPublish = [];
      if (videoTrack) tracksToPublish.push(videoTrack);
      if (audioTrack) tracksToPublish.push(audioTrack);

      if (tracksToPublish.length > 0) {
        await clientRef.current.publish(tracksToPublish);
        console.log('✅ Published local tracks:', tracksToPublish.map(t => t.kind));
      }

      setIsJoined(true);
      setIsLoading(false);

    } catch (err) {
      console.error('❌ Join meeting failed:', err);
      setError(`Không thể tham gia cuộc họp: ${err.message}`);
      setIsLoading(false);
    }
  };

  // Synchronized permission request and track creation
  const createLocalTracksWithPermissions = async () => {
    try {
      console.log('🎥 Creating local tracks with synchronized permissions...');

      let videoTrack = null;
      let audioTrack = null;

      // Request permissions and create tracks simultaneously
      try {
        videoTrack = await AgoraRTC.createCameraVideoTrack({
          optimizationMode: 'motion',
          encoderConfig: { width: 640, height: 480, frameRate: 15 }
        });

        const mediaStreamTrack = videoTrack.getMediaStreamTrack();
        const mediaStream = new MediaStream([mediaStreamTrack]);
        setLocalVideoStream(mediaStream);
        setLocalVideoTrack(videoTrack);
        setIsCameraOn(true);

        console.log('✅ Video track created successfully');
      } catch (videoError) {
        console.warn('⚠️ Video track creation failed:', videoError);
        if (videoError.code === 'PERMISSION_DENIED') {
          console.log('📹 Camera permission denied - continuing without video');
        }
      }

      try {
        audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: { sampleRate: 48000, stereo: true, bitrate: 128 }
        });

        setLocalAudioTrack(audioTrack);
        setIsMicOn(true);

        console.log('✅ Audio track created successfully');
      } catch (audioError) {
        console.warn('⚠️ Audio track creation failed:', audioError);
        if (audioError.code === 'PERMISSION_DENIED') {
          console.log('🎤 Microphone permission denied - continuing without audio');
        }
      }

      return { videoTrack, audioTrack };

    } catch (err) {
      console.error('❌ Failed to create local tracks:', err);
      throw err;
    }
  };

  const toggleCamera = async () => {
    try {
      if (isCameraOn && localVideoTrack) {
        // Turn OFF camera
        setIsCameraOn(false);
        console.log('📹 Camera disabled - stopping and unpublishing');

        await clientRef.current.unpublish([localVideoTrack]);
        localVideoTrack.stop();
        localVideoTrack.close();
        setLocalVideoTrack(null);
        setLocalVideoStream(null);

        console.log('✅ Camera disabled successfully');
      } else {
        // Turn ON camera
        setIsCameraOn(true);
        console.log('📹 Camera enabled - creating track');

        try {
          const newVideoTrack = await AgoraRTC.createCameraVideoTrack({
            optimizationMode: 'motion',
            encoderConfig: { width: 640, height: 480, frameRate: 15 }
          });

          setLocalVideoTrack(newVideoTrack);

          // Create MediaStream for React video element
          const mediaStreamTrack = newVideoTrack.getMediaStreamTrack();
          const mediaStream = new MediaStream([mediaStreamTrack]);
          setLocalVideoStream(mediaStream);

          await clientRef.current.publish([newVideoTrack]);

          console.log('✅ Camera enabled and published successfully');

        } catch (videoError) {
          console.error('❌ Failed to enable camera:', videoError);
          setIsCameraOn(false);
          setError('Không thể bật camera. Vui lòng kiểm tra quyền truy cập.');
        }
      }
    } catch (err) {
      console.error('❌ Toggle camera failed:', err);
      setError(`Lỗi camera: ${err.message}`);
    }
  };

  const toggleMic = async () => {
    try {
      if (isMicOn && localAudioTrack) {
        // Turn OFF microphone
        setIsMicOn(false);
        console.log('🎤 Microphone disabled - stopping and unpublishing');

        await clientRef.current.unpublish([localAudioTrack]);
        localAudioTrack.stop();
        localAudioTrack.close();
        setLocalAudioTrack(null);

        console.log('✅ Microphone disabled successfully');
      } else {
        // Turn ON microphone
        setIsMicOn(true);
        console.log('🎤 Microphone enabled - creating track');

        try {
          const newAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
            encoderConfig: { sampleRate: 48000, stereo: true, bitrate: 128 }
          });

          setLocalAudioTrack(newAudioTrack);

          await clientRef.current.publish([newAudioTrack]);

          console.log('✅ Microphone enabled and published successfully');

        } catch (audioError) {
          console.error('❌ Failed to enable microphone:', audioError);
          setIsMicOn(false);
          setError('Không thể bật microphone. Vui lòng kiểm tra quyền truy cập.');
        }
      }
    } catch (err) {
      console.error('❌ Toggle microphone failed:', err);
      setError(`Lỗi microphone: ${err.message}`);
    }
  };

  const handleCleanup = async () => {
    try {
      console.log('🧹 Starting complete cleanup...');

      // Step 1: Unpublish all local tracks first
      if (clientRef.current && (localVideoTrack || localAudioTrack)) {
        try {
          const tracksToUnpublish = [];
          if (localVideoTrack) tracksToUnpublish.push(localVideoTrack);
          if (localAudioTrack) tracksToUnpublish.push(localAudioTrack);

          if (tracksToUnpublish.length > 0) {
            console.log('📤 Unpublishing local tracks...');
            await clientRef.current.unpublish(tracksToUnpublish);
          }
        } catch (unpublishError) {
          console.warn('⚠️ Unpublish failed:', unpublishError);
        }
      }

      // Step 2: Stop and close video tracks
      if (localVideoTrack) {
        console.log('📹 Stopping video track...');
        localVideoTrack.stop();
        localVideoTrack.close();
      }

      // Step 3: Stop and close audio tracks  
      if (localAudioTrack) {
        console.log('🎤 Stopping audio track...');
        localAudioTrack.stop();
        localAudioTrack.close();
      }

      // Step 4: Stop MediaStream tracks
      if (localVideoStream) {
        console.log('🎬 Stopping video stream tracks...');
        localVideoStream.getTracks().forEach(track => {
          track.stop();
          console.log(`⏹️ Stopped track: ${track.kind}`);
        });
      }

      // Step 5: Stop remote video streams
      Object.values(remoteVideoStreams).forEach(stream => {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      });

      // Step 6: Leave Agora channel
      if (clientRef.current) {
        console.log('🚪 Leaving Agora channel...');
        await clientRef.current.leave();
        console.log('✅ Left Agora channel successfully');

        // Step 6.5: Dispose client completely to prevent duplicate users
        try {
          console.log('🗑️ Disposing Agora client...');
          clientRef.current.removeAllListeners();
          clientRef.current = null;
          console.log('✅ Agora client disposed successfully');
        } catch (disposeError) {
          console.warn('⚠️ Client disposal warning:', disposeError);
          clientRef.current = null;
        }
      }

      // Step 7: Reset all local states
      setLocalVideoTrack(null);
      setLocalAudioTrack(null);
      setLocalVideoStream(null);
      setRemoteVideoStreams({});
      setRemoteUsers({});

      // Step 8: Clear video element sources
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      // Step 9: Clear all remote video elements
      Object.keys(remoteVideoStreams).forEach(uid => {
        const videoElement = document.getElementById(`remote-video-element-${uid}`);
        if (videoElement) {
          videoElement.srcObject = null;
        }
      });

      console.log('✅ Complete cleanup finished');

    } catch (err) {
      console.error('❌ Cleanup error:', err);
      // Even if cleanup fails, reset states to prevent UI issues
      setLocalVideoTrack(null);
      setLocalAudioTrack(null);
      setLocalVideoStream(null);
      setRemoteVideoStreams({});
      setRemoteUsers({});
    }
  };

  const handleLeaveMeeting = async () => {
    try {
      console.log('👋 Starting leave meeting process...');
      setIsLoading(true);
      setShowLeaveModal(false); // Close modal

      // Step 1: Clean up all tracks and connections
      await handleCleanup();

      // Step 2: Reset all meeting states
      setIsJoined(false);
      setIsCameraOn(false);
      setIsMicOn(false);
      setParticipantCount(0);
      setError('');

      // Step 3: Clear localStorage
      try {
        localStorage.removeItem(`agora_token_${meetingId}`);
        console.log('🧹 Cleared localStorage for meeting');
      } catch (storageError) {
        console.warn('⚠️ Failed to clear localStorage:', storageError);
      }

      console.log('✅ Left meeting successfully');
      setIsLoading(false);

      // Step 4: Navigate back immediately (no success alert needed)
      setTimeout(() => {
        try {
          navigate(-1); // Go back to previous page
        } catch (navError) {
          console.warn('⚠️ Navigation failed, redirecting to home:', navError);
          navigate('/');
        }
      }, 500); // Short delay to ensure cleanup is complete

    } catch (err) {
      console.error('❌ Leave meeting failed:', err);
      setError('Không thể rời khỏi cuộc họp hoàn toàn. Một số tài nguyên có thể chưa được dọn dẹp.');
      setIsLoading(false);
      setShowLeaveModal(false);

      // Force reset states even if cleanup failed
      setIsJoined(false);
      setIsCameraOn(false);
      setIsMicOn(false);
      setParticipantCount(0);
    }
  };

  const confirmLeaveMeeting = () => {
    setShowLeaveModal(true);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get meeting status and time remaining
  const getMeetingStatus = () => {
    if (!meetingData || !meetingData.endTime) {
      return { status: 'unknown', timeLeft: '', color: 'secondary' };
    }

    const currentTime = new Date();
    const endTime = new Date(meetingData.endTime);
    const startTime = new Date(meetingData.startTime);

    if (currentTime < startTime) {
      const timeUntilStart = Math.round((startTime - currentTime) / 1000 / 60);
      return {
        status: 'upcoming',
        timeLeft: `Bắt đầu sau ${timeUntilStart} phút`,
        color: 'warning'
      };
    } else if (currentTime > endTime) {
      const timeAfterEnd = Math.round((currentTime - endTime) / 1000 / 60);
      return {
        status: 'expired',
        timeLeft: `Đã kết thúc ${timeAfterEnd} phút trước`,
        color: 'danger'
      };
    } else {
      const timeLeft = Math.round((endTime - currentTime) / 1000 / 60);
      return {
        status: 'active',
        timeLeft: `Còn lại ${timeLeft} phút`,
        color: 'success'
      };
    }
  };

  // PREVIEW MODE FUNCTIONS - NEW
  const togglePreviewCamera = async () => {
    try {
      if (previewCameraOn && localVideoTrack) {
        // Turn OFF preview camera
        setPreviewCameraOn(false);
        console.log('📹 Preview camera disabled');

        localVideoTrack.stop();
        localVideoTrack.close();
        setLocalVideoTrack(null);
        setLocalVideoStream(null);

        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = null;
        }
      } else {
        // Turn ON preview camera - simplified without complex permission handling
        console.log('📹 Enabling preview camera...');

        try {
          // Create video track directly
          const newVideoTrack = await AgoraRTC.createCameraVideoTrack({
            optimizationMode: 'motion',
            encoderConfig: { width: 640, height: 480, frameRate: 15 }
          });

          setLocalVideoTrack(newVideoTrack);

          // Create MediaStream for preview
          const mediaStreamTrack = newVideoTrack.getMediaStreamTrack();
          const mediaStream = new MediaStream([mediaStreamTrack]);
          setLocalVideoStream(mediaStream);

          setPreviewCameraOn(true);
          console.log('✅ Preview camera enabled successfully');

        } catch (videoError) {
          console.error('❌ Failed to enable preview camera:', videoError);
          setError(`Không thể bật camera: ${videoError.message}`);
        }
      }
    } catch (err) {
      console.error('❌ Preview camera toggle failed:', err);
      setError(`Lỗi camera: ${err.message}`);
    }
  };

  const togglePreviewMic = async () => {
    try {
      if (previewMicOn && localAudioTrack) {
        // Turn OFF preview mic
        setPreviewMicOn(false);
        console.log('🎤 Preview microphone disabled');

        localAudioTrack.stop();
        localAudioTrack.close();
        setLocalAudioTrack(null);
      } else {
        // Turn ON preview mic without page reset
        console.log('🎤 Enabling preview microphone...');

        try {
          // Create audio track directly without permission checks that might cause issues
          const newAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
            encoderConfig: { sampleRate: 48000, stereo: true, bitrate: 128 }
          });

          setLocalAudioTrack(newAudioTrack);
          setPreviewMicOn(true);

          console.log('✅ Preview microphone enabled successfully');

        } catch (audioError) {
          console.error('❌ Failed to enable preview microphone:', audioError);
          setError(`Không thể bật microphone: ${audioError.message}`);
        }
      }
    } catch (err) {
      console.error('❌ Preview microphone toggle failed:', err);
      setError(`Lỗi microphone: ${err.message}`);
    }
  };

  const joinMeetingFromPreview = async () => {
    try {
      console.log('🚀 Joining meeting from preview...');
      setIsLoading(true);
      setError('');

      if (!agoraConfig) {
        throw new Error('Thông tin cuộc họp chưa sẵn sàng');
      }

      // Join the Agora channel first
      await clientRef.current.join(
        agoraConfig.appID,
        agoraConfig.channelName,
        agoraConfig.token,
        agoraConfig.uid
      );

      console.log('✅ Successfully joined Agora channel');

      // Prepare tracks for publishing
      const tracksToPublish = [];

      // Handle video track
      if (localVideoTrack && previewCameraOn) {
        tracksToPublish.push(localVideoTrack);
        setIsCameraOn(true);
        console.log('📹 Video track ready for meeting');
      } else {
        setIsCameraOn(false);
      }

      // Handle audio track  
      if (localAudioTrack && previewMicOn) {
        tracksToPublish.push(localAudioTrack);
        setIsMicOn(true);
        console.log('🎤 Audio track ready for meeting');
      } else {
        setIsMicOn(false);
      }

      // Publish tracks if any exist
      if (tracksToPublish.length > 0) {
        await clientRef.current.publish(tracksToPublish);
        console.log('✅ Published tracks to meeting:', tracksToPublish.map(t => t.kind));
      }

      // Update states - exit preview mode and enter meeting
      setIsInPreview(false);
      setIsJoined(true);
      setIsLoading(false);

      console.log('🎉 Successfully transitioned from preview to meeting mode');
      console.log('📊 Meeting state - Camera:', isCameraOn, 'Mic:', isMicOn);

    } catch (err) {
      console.error('❌ Failed to join meeting from preview:', err);
      setError(`Không thể tham gia cuộc họp: ${err.message}`);
      setIsLoading(false);
    }
  };

  // Get current user on component mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        console.log('✅ Current user loaded:', user.name || user.email);
      }
    } catch (error) {
      console.error('❌ Error loading current user:', error);
    }
  }, []);

  // Function to get display name for a user
  const getDisplayName = (uid) => {
    // If it's current user
    if (currentUser && (uid == currentUser.id || uid == currentUser.uid)) {
      return currentUser.name || currentUser.email || `Bạn (${uid})`;
    }

    // If we have stored name for this uid
    if (userNames[uid]) {
      return userNames[uid];
    }

    // Fallback to uid
    return `Người dùng ${uid}`;
  };

  // Function to fetch user name by uid
  const fetchUserName = async (uid) => {
    try {
      const API_URL = 'http://localhost:5000';
      const response = await fetch(`${API_URL}/users/${uid}`);
      if (response.ok) {
        const userData = await response.json();
        const displayName = userData.name || userData.email || `User ${uid}`;
        setUserNames(prev => ({
          ...prev,
          [uid]: displayName
        }));
        console.log(`✅ Fetched name for user ${uid}: ${displayName}`);
        return displayName;
      }
    } catch (error) {
      console.log(`⚠️ Could not fetch name for user ${uid}:`, error);
    }
    return `Người dùng ${uid}`;
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3">Đang tải thông tin cuộc họp...</p>
        </div>
      </Container>
    );
  }

  if (error && !meetingData) {
    // Check if error is about meeting expiration
    const isExpiredError = error.includes('đã kết thúc') || error.includes('hết hạn');

    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Alert variant={isExpiredError ? "warning" : "danger"} className="text-center" style={{ maxWidth: '500px' }}>
          {isExpiredError ? (
            <>
              <div className="mb-3">
                <FaClock size={48} className="text-warning" />
              </div>
              <h4>⏰ Cuộc họp đã kết thúc</h4>
              <p className="mb-3">{error}</p>
              <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                ← Quay lại
              </Button>
            </>
          ) : (
            <>
              <h4>Không thể tải cuộc họp</h4>
              <p>{error}</p>
              <Button variant="primary" onClick={loadMeetingData}>
                Thử lại
              </Button>
            </>
          )}
        </Alert>
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

      {isInPreview ? (
        // PREVIEW MODE - Simplified
        <Row className="h-100">
          <Col className="d-flex flex-column">
            <div className="meeting-header p-3 border-bottom">
              <h2 style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}>Chuẩn bị tham gia cuộc họp</h2>
              <h4 className="" style={{ color: "white"}}>{meetingData?.title}</h4>

              <div className="d-flex gap-4 text-muted small">
                <span
                  style={{
                    color: "white",
                    width: "200px",  // Đặt chiều rộng thành 50px
                    display: "inline-block",
                    fontSize: "14px",
                    padding: "5px",
                    backgroundColor: "#34495e",  // Nền màu tối cho các thông tin
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)"
                  }}
                >
                  <FaClock className="me-1" /> {formatTime(meetingData?.startTime)} - {formatTime(meetingData?.endTime)}
                </span>
                <span
                  style={{
                    color: "white",
                    width: "200px",
                    display: "inline-block",
                    fontSize: "14px",
                    padding: "5px",
                    backgroundColor: "#34495e",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)"
                  }}
                >
                  <FaClock className="me-1" /> {formatDuration(meetingData?.duration)}
                </span>

                <span
                  style={{
                    color: "white",
                    width: "250px",
                    display: "inline-block",
                    fontSize: "14px",
                    padding: "5px",
                    backgroundColor: "#34495e",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)"
                  }}
                >
                  <FaUsers className="me-1" /> {participantCount} người tham gia
                </span>

                {meetingData && (
                  <span className={`text-${getMeetingStatus().color}`}
                    style={{
                      fontSize: "14px",
                      padding: "5px",
                      fontWeight: "bold",
                      textAlign: "end",
                      // backgroundColor: "#2980b9",
                      borderRadius: "5px",
                      color: "#ecf0f1"
                    }}
                  >
                    ⏰ {getMeetingStatus().timeLeft}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-grow-1 p-4">
              <Row className="h-100 justify-content-center">
                <Col lg={8} xl={6}>
                  <Card className="h-100" style={{ background: '#2a2a2a', border: '2px solid #007bff' }}>
                    <Card.Body className="p-0">
                      <div style={{
                        width: '100%',
                        height: '400px',
                        background: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666',
                        position: 'relative',
                        overflow: 'hidden'
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
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                        ) : (
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            zIndex: 10
                          }}>
                            <div style={{
                              fontSize: '4rem',
                              marginBottom: '1rem'
                            }}>
                              📹
                            </div>
                            <h4>Camera tắt</h4>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>

            <div className="preview-controls p-4 border-top">
              <Row>
                <Col className="text-center">
                  <div className="d-flex justify-content-center gap-3 mb-4">
                    <Button
                      variant={previewMicOn ? "success" : "secondary"}
                      size="lg"
                      onClick={togglePreviewMic}
                      disabled={isLoading}
                    >
                      {previewMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    </Button>

                    <Button
                      variant={previewCameraOn ? "success" : "secondary"}
                      size="lg"
                      onClick={togglePreviewCamera}
                      disabled={isLoading}
                    >
                      {previewCameraOn ? <FaVideo /> : <FaVideoSlash />}
                    </Button>
                  </div>

                  <div className="d-flex justify-content-center gap-3">
                    {meetingData && getMeetingStatus().status === 'expired' ? (
                      <Alert variant="warning" className="text-center w-100">
                        <FaClock className="me-2" />
                        Cuộc họp này đã kết thúc. Bạn không thể tham gia.
                      </Alert>
                    ) : (
                      <>
                        <Button
                          variant="success"
                          size="lg"
                          onClick={joinMeetingFromPreview}
                          disabled={isLoading || (meetingData && getMeetingStatus().status === 'expired')}
                        >
                          {isLoading ? 'Đang tham gia...' : 'Tham gia cuộc họp'}
                        </Button>

                        <Button
                          variant="outline-secondary"
                          size="lg"
                          onClick={() => navigate(-1)}
                        >
                          Hủy
                        </Button>
                      </>
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

      ) : (
        // MEETING MODE - After joining
        <Row className="h-100">
          <Col className="d-flex flex-column">
            {/* <div className="meeting-header p-3 border-bottom">
              <h2>{meetingData?.title}</h2>
              <div className="d-flex gap-4 text-muted">
                <span><FaClock className="me-1" /> {formatTime(meetingData?.startTime)} - {formatTime(meetingData?.endTime)}</span>
                <span><FaClock className="me-1" /> {formatDuration(meetingData?.duration)}</span>
                <span><FaUsers className="me-1" /> {participantCount} người tham gia</span>

                {isJoined && <span className="text-success">✅ Đã tham gia</span>}
                {meetingData && (
                  <span className={`text-${getMeetingStatus().color}`}>
                    ⏰ {getMeetingStatus().timeLeft}
                  </span>
                )}
              </div>
              {meetingData?.description && (
                <p className="mt-2 mb-0 text-muted">{meetingData.description}</p>
              )}
            </div> */}

<div className="meeting-header p-3 border-bottom">
              <h2 style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}>Chuẩn bị tham gia cuộc họp</h2>
              <h4 className="" style={{ color: "white"}}>{meetingData?.title}</h4>

              <div className="d-flex gap-4 text-muted small">
                <span
                  style={{
                    color: "white",
                    width: "200px",  // Đặt chiều rộng thành 50px
                    display: "inline-block",
                    fontSize: "14px",
                    padding: "5px",
                    backgroundColor: "#34495e",  // Nền màu tối cho các thông tin
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)"
                  }}
                >
                  <FaClock className="me-1" /> {formatTime(meetingData?.startTime)} - {formatTime(meetingData?.endTime)}
                </span>
                <span
                  style={{
                    color: "white",
                    width: "200px",
                    display: "inline-block",
                    fontSize: "14px",
                    padding: "5px",
                    backgroundColor: "#34495e",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)"
                  }}
                >
                  <FaClock className="me-1" /> {formatDuration(meetingData?.duration)}
                </span>

                <span
                  style={{
                    color: "white",
                    width: "250px",
                    display: "inline-block",
                    fontSize: "14px",
                    padding: "5px",
                    backgroundColor: "#34495e",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)"
                  }}
                >
                  <FaUsers className="me-1" /> {participantCount} người tham gia
                </span>


                {meetingData && (
                  <span className={`text-${getMeetingStatus().color}`}
                    style={{
                      fontSize: "14px",
                      padding: "5px",
                      fontWeight: "bold",
                      textAlign: "end",
                      // backgroundColor: "#2980b9",
                      borderRadius: "5px",
                      color: "#ecf0f1"
                    }}
                  >
                    ⏰ {getMeetingStatus().timeLeft}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-grow-1 p-3">
              <Row className="h-100">
                <Col md={6} className="mb-3">
                  <Card className="h-100" style={{ background: '#2a2a2a', border: '2px solid #007bff' }}>
                    <Card className="text-center" style={{ background: '#1e3a8a', border: '1px solid #3b82f6' }}>
                      <div className="d-flex flex-column align-items-center">
                        <strong style={{ fontSize: '1.1rem', color: '#ffffff' }}>
                          {currentUser ? (currentUser.name || currentUser.email || 'Người dùng') : 'Người dùng'}
                        </strong>
                        <small style={{ color: '#93c5fd', fontWeight: '500' }}>(Bạn)</small>
                      </div>
                      <div className="mt-2">
                        {isCameraOn && <span className="text-success me-2" title="Camera đang bật">📹</span>}
                        {isMicOn && <span className="text-success me-2" title="Microphone đang bật">🎤</span>}
                        {!isCameraOn && <span className="text-secondary me-2" title="Camera đang tắt">📹</span>}
                        {!isMicOn && <span className="text-secondary me-2" title="Microphone đang tắt">🎤</span>}
                      </div>
                    </Card>
                    <Card.Body className="p-0">
                      <div style={{
                        width: '100%',
                        height: '300px',
                        background: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {isCameraOn && localVideoStream ? (
                          <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                        ) : (
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            zIndex: 10
                          }}>
                            Camera đang tắt
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Remote Videos */}
                {Object.keys(remoteUsers).map((remoteUid) => (
                  <Col md={6} key={remoteUid} className="mb-3">
                    <Card className="h-100" style={{ background: '#2a2a2a', border: '1px solid #333' }}>
                      <Card.Header className="text-center" style={{ background: '#334155', border: '1px solid #64748b' }}>
                        <div className="d-flex flex-column align-items-center">
                          <strong style={{ fontSize: '1.1rem', color: '#ffffff' }}>
                            {getDisplayName(remoteUid)}
                          </strong>
                        </div>
                        <div className="mt-2">
                          {remoteUsers[remoteUid]?.hasVideo && <span className="text-success me-2" title="Camera đang bật">📹</span>}
                          {remoteUsers[remoteUid]?.hasAudio && <span className="text-success me-2" title="Microphone đang bật">🎤</span>}
                          {!remoteUsers[remoteUid]?.hasVideo && <span className="text-secondary me-2" title="Camera đang tắt">📹</span>}
                          {!remoteUsers[remoteUid]?.hasAudio && <span className="text-secondary me-2" title="Microphone đang tắt">🎤</span>}
                        </div>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <div style={{
                          width: '100%',
                          height: '300px',
                          background: '#000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          {remoteUsers[remoteUid]?.hasVideo && remoteVideoStreams[remoteUid] ? (
                            <video
                              id={`remote-video-element-${remoteUid}`}
                              autoPlay
                              playsInline
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                          ) : (
                            <div style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              textAlign: 'center',
                              zIndex: 10
                            }}>
                              Camera đang tắt
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}

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

            <div className="meeting-controls p-3 d-flex justify-content-center gap-3">
              <Button
                variant={isMicOn ? "success" : "secondary"}
                size="lg"
                onClick={toggleMic}
                title={isMicOn ? 'Tắt microphone' : 'Bật microphone'}
              >
                {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </Button>

              <Button
                variant={isCameraOn ? "success" : "secondary"}
                size="lg"
                onClick={toggleCamera}
                title={isCameraOn ? 'Tắt camera' : 'Bật camera'}
              >
                {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
              </Button>

              {/* Waiting Candidates Button - Only for hosts/employers */}
              <Button
                variant={waitingCandidatesCount > 0 ? "warning" : "outline-info"}
                size="lg"
                onClick={() => setShowWaitingCandidatesPanel(true)}
                title="Quản lý ứng viên đang chờ"
                className="position-relative"
              >
                <FaUserClock />
                {waitingCandidatesCount > 0 && (
                  <Badge
                    bg="danger"
                    pill
                    className="position-absolute top-0 start-100 translate-middle"
                    style={{ fontSize: '0.6rem' }}
                  >
                    {waitingCandidatesCount}
                  </Badge>
                )}
              </Button>

              <Button variant="danger" size="lg" onClick={confirmLeaveMeeting}>
                <FaPhoneSlash className="me-2" />
                Rời khỏi
              </Button>
            </div>
          </Col>
        </Row>
      )}

      {/* Leave Meeting Confirmation Modal */}
      <Modal show={showLeaveModal} onHide={() => setShowLeaveModal(false)} centered>
        <Modal.Header closeButton style={{ background: '#2a2a2a', color: 'white', border: 'none' }}>
          <Modal.Title>
            <FaPhoneSlash className="me-2 text-danger" />
            Rời khỏi cuộc họp?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#2a2a2a', color: 'white' }}>
          <div className="text-center">
            <div className="mb-3">
              <FaUsers size={48} className="text-muted" />
            </div>
            <h5 className="mb-3">Bạn có chắc chắn muốn rời khỏi cuộc họp này không?</h5>
            <p className="text-muted mb-0">
              Camera và microphone sẽ bị tắt, và bạn sẽ ngắt kết nối khỏi cuộc họp.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ background: '#2a2a2a', border: 'none' }}>
          <Button
            variant="outline-secondary"
            onClick={() => setShowLeaveModal(false)}
            disabled={isLoading}
          >
            Ở lại
          </Button>
          <Button
            variant="danger"
            onClick={handleLeaveMeeting}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang rời khỏi...
              </>
            ) : (
              <>
                <FaPhoneSlash className="me-2" />
                Rời khỏi
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Waiting Candidates Panel Modal */}
      <InMeetingWaitingCandidatesPanel
        meetingId={meetingId}
        show={showWaitingCandidatesPanel}
        onHide={() => setShowWaitingCandidatesPanel(false)}
        isHost={true} // TODO: determine if user is meeting host
      />
    </Container>
  );
};

export default SmartMeetingRoom; 