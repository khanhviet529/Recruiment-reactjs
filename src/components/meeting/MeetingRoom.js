import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axios from 'axios';
import './MeetingRoom.scss';
import { Container, Button, Row, Col, Card, Alert, Badge, Modal, Form } from 'react-bootstrap';

// Import icons
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaUserFriends, FaBriefcase, FaUserCircle, FaComments, FaDesktop, FaStopCircle } from 'react-icons/fa';
import { selectAuth } from '../../redux/slices/authSlice';
import { getAgoraToken as getStoredAgoraToken, saveAgoraToken } from '../../utils/tokenStorage';
import rtmService from '../../utils/rtmService';
import ChatRoom from './ChatRoom';

// API URL
const API_URL = 'http://localhost:5000';

// Session-persistent mapping between user IDs and their Agora UIDs
const userIdToAgoraUidMap = new Map();

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
  const [activeParticipants, setActiveParticipants] = useState([]); // Track active participants
  const [currentUser, setCurrentUser] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [rtmConnected, setRtmConnected] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenTrack, setScreenTrack] = useState(null);
  
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
  
  // Track user identities across reconnections
  const trackUserIdentity = (userId, agoraUid) => {
    if (!userId || !agoraUid) return;
    
    console.log(`Tracking user identity mapping: userId ${userId} -> agoraUid ${agoraUid}`);
    userIdToAgoraUidMap.set(userId, agoraUid);
  };

  // Get consistent Agora UID for a user ID if available
  const getConsistentAgoraUid = (userId) => {
    if (!userId) return null;
    return userIdToAgoraUidMap.get(userId);
  };

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
          
          // Initialize active participants with the registered participants
          setActiveParticipants(meetingData.participants);
        
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
        
        // Setup channel name
        const channel = meetingData.channelName || `meeting-${meetingData.id}`;
        setChannelName(channel);
        
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

  // Update active participants when remoteUsers changes
  useEffect(() => {
    const updateActiveParticipants = async () => {
      try {
        console.log("Updating active participants, remote users:", Object.keys(remoteUsers));
        
        // Get current meeting participants from server with better error handling
        let serverParticipants = [];
        try {
          const response = await axios.get(`${API_URL}/meetings/${meetingId}`);
          if (response.data && response.data.participants) {
            // Store participants data globally for access elsewhere
            serverParticipants = response.data.participants;
            // Also update our state
            setParticipants(serverParticipants);
          } else {
            console.warn("Server returned invalid participant data structure:", response.data);
          }
        } catch (error) {
          console.error("Error fetching meeting data:", error);
          // Fall back to current participants in state if available
          serverParticipants = participants;
        }

        console.log("Server participants:", serverParticipants);
        
        // Start with current participants from server
        const currentActiveParticipants = [];
        
        // Create a map of remote users by userId for easier lookup
        const remoteUsersByUserId = {};
        Object.keys(remoteUsers).forEach(agoraUid => {
          const user = remoteUsers[agoraUid];
          // Store by userId, not by Agora uid
          if (user.userId) {
            remoteUsersByUserId[user.userId] = user;
            // Track this mapping for future reference
            trackUserIdentity(user.userId, agoraUid);
          }
        });
        
        console.log("Remote users by userId:", remoteUsersByUserId);
      
        // First, process server participants - this ensures EVERYONE registered shows up
        serverParticipants.forEach(serverParticipant => {
          // Check if this participant is the current user
          const isCurrentUser = serverParticipant.userId === uid.toString() || 
                              serverParticipant.email === user?.email;
          
          // Check if this user is active in our remote users list
          const remoteUserData = remoteUsersByUserId[serverParticipant.userId];
          const isRemoteActive = !!remoteUserData;
          
          // Add to active participants list
          currentActiveParticipants.push({
            ...serverParticipant,
            isLocal: isCurrentUser,
            isActive: isCurrentUser || isRemoteActive,
            // If this user is in remoteUsers (by userId, not Agora uid), use their media state
            isVideoOn: isCurrentUser ? (isCameraOn && localVideoTrack) : 
                     (remoteUserData ? remoteUserData.hasVideo : false),
            isAudioOn: isCurrentUser ? (isMicOn && localAudioTrack) : 
                     (remoteUserData ? remoteUserData.hasAudio : false)
          });
        });
        
        // If current user isn't in the list yet, add them manually
        if (!currentActiveParticipants.some(p => p.isLocal)) {
          currentActiveParticipants.push({ 
            userId: uid.toString(), 
            name: user?.firstName || user?.name || 'Bạn', 
            isLocal: true,
            isActive: true,
            avatar: user?.avatar,
            role: user?.role,
            userType: user?.role, // Add userType based on role
            isVideoOn: isCameraOn && localVideoTrack,
            isAudioOn: isMicOn && localAudioTrack
          });
        }
        
        // Now add any remote users who may not be in server list yet
        Object.keys(remoteUsers).forEach(remoteUid => {
          const remoteUser = remoteUsers[remoteUid];
          // Check if this remote user is already added by userId (not by Agora UID)
          const alreadyAdded = currentActiveParticipants.some(p => p.userId === remoteUser.userId);
          
          if (!alreadyAdded) {
            // Fallback if server doesn't have this participant yet
            currentActiveParticipants.push({
              userId: remoteUser.userId || remoteUid,
              name: remoteUser.name || `Người tham gia ${remoteUid}`,
              isLocal: false,
              isActive: true,
              userType: remoteUser.userType || 'unknown',
              role: remoteUser.role || 'attendee',
              isVideoOn: !!remoteUser.hasVideo,
              isAudioOn: !!remoteUser.hasAudio
            });
          }
        });
        
        console.log("Setting active participants:", currentActiveParticipants);
        setActiveParticipants(currentActiveParticipants);
        
        // Update participants list in state
        if (serverParticipants.length > 0) {
          setParticipants(serverParticipants);
        }

        // Only log active participants locally - endpoint doesn't exist
        console.log("Active participants updated locally:", 
          currentActiveParticipants.map(p => ({
            userId: p.userId,
            name: p.name,
            role: p.role,
            isActive: true,
            hasVideo: p.isVideoOn || false,
            hasAudio: p.isAudioOn || false
          }))
        );
      } catch (error) {
        console.error('Error updating participants:', error);
      }
    };

    // Run immediately when remoteUsers changes
    updateActiveParticipants();

    // Set up polling to keep participants list updated
    const pollInterval = setInterval(updateActiveParticipants, 5000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [remoteUsers, meetingId, uid, user]);

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
      setChannelName(channelName);
      
      // IMPORTANT: Use actual user ID from the server as Agora UID for better identification
      // This ensures consistent identification between server and Agora
      const actualUid = user?.id || uid;
      console.log("Channel:", channelName, "UID:", actualUid);

      // Detect user role for special handling
      const userRole = user?.role || 'unknown';
      console.log(`User role detected: ${userRole}`);
      const isCompanyUser = userRole === 'company' || userRole === 'admin';
      
      // Join the channel
      await client.join(APP_ID, channelName, token || "dummy_token_for_development", actualUid);
      rtcClientRef.current = client;

      // Set client options based on role for better performance
      if (isCompanyUser) {
        console.log("Setting company-specific client options");
        // Companies need to see multiple candidates clearly
        client.setClientRole("host");
        // Set parameters to improve multi-stream performance
        client.setParameters('{"che.video.lowBitRateStreamParameter":{"width":320,"height":180,"frameRate":15,"bitRate":140}}');
      }
      
      // Create and publish tracks
      try {
        // First try only audio in case there's a problem with video
        console.log("Creating audio track");
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        setLocalAudioTrack(audioTrack);
        localAudioTrackRef.current = audioTrack;
        
        // Then try to get video separately
        try {
          console.log("Creating video track");
          const videoTrack = await AgoraRTC.createCameraVideoTrack();
          
          setLocalVideoTrack(videoTrack);
          localVideoTrackRef.current = videoTrack;
          
          // Play local video track
          console.log("Playing local video");
          videoTrack.play('user-1');
          
          // Save user type to help with debugging
          const currentUserType = user?.role || 'unknown';
          console.log(`Current user is ${currentUserType} with ID ${actualUid}`);
          
          // Publish both tracks (only if we have a real connection)
          if (!useTestToken) {
            console.log("Publishing audio and video tracks");
            try {
              // Always publish with high video quality for company users
              if (currentUserType === 'company' || currentUserType === 'admin') {
                console.log("Company/admin user detected - using high quality video");
                await videoTrack.setEncoderConfiguration('high');
              }
              await rtcClientRef.current.publish([audioTrack, videoTrack]);
              console.log("Tracks published successfully");
              
              // Track our own identity for consistent identification
              if (user?.id) {
                trackUserIdentity(user.id.toString(), actualUid);
              }
            } catch (publishError) {
              console.error("Error publishing tracks:", publishError);
              setErrorMessage('Lỗi kết nối: Không thể phát video. ' + publishError.message);
            }
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

    console.log("Setting up event listeners");
    
    // Get user role for custom handling
    const userRole = user?.role || 'unknown';
    const isCompanyUser = userRole === 'company' || userRole === 'admin';
    console.log(`Setting up event listeners for ${userRole} user`);

    // Handle when a new user joins
    rtcClientRef.current.on('user-published', async (remoteUser, mediaType) => {
      try {
        console.log('Remote user published media:', remoteUser.uid, mediaType);
        
        // Always subscribe immediately - critical for companies to see candidates
        await rtcClientRef.current.subscribe(remoteUser, mediaType);
        
        console.log('Remote user subscribed:', remoteUser.uid, mediaType);

        // Get the latest participants list from state to avoid undefined reference
        let participantsData = [];
        try {
          // Fetch fresh participant data directly from API to ensure we have current data
          const response = await axios.get(`${API_URL}/meetings/${meetingId}`);
          participantsData = response.data.participants || [];
        } catch (err) {
          console.warn("Could not fetch latest participants:", err);
          // Use participants from state as fallback
          participantsData = participants;
        }

        // IMPROVED USER IDENTIFICATION: First try to identify the remoteUser by matching with existing participant data
        let matchedParticipant = null;
        
        for (const participant of participantsData) {
          // Try exact match first
          if (participant.userId === remoteUser.uid.toString()) {
            matchedParticipant = participant;
            break;
          }
          
          // Try numeric comparison
          if (parseInt(participant.userId) === parseInt(remoteUser.uid)) {
            matchedParticipant = participant;
            break;
          }
          
          // Try to match by user ID in different formats
          if (typeof remoteUser.uid === 'string' && remoteUser.uid.includes('_')) {
            const extractedId = remoteUser.uid.split('_')[1];
            if (participant.userId === extractedId) {
              matchedParticipant = participant;
              break;
            }
          }
          
          // NEW: Try to match by user type and name if available
          if (remoteUser.uid && participant.name && participant.userType) {
            // For example, match "candidate" users based on their role
            if (participant.userType === 'candidate' && 
                !activeParticipants.some(p => p.userId !== user.id && p.userType === 'candidate' && p.isActive)) {
              console.log("Potential match by user type:", participant);
              matchedParticipant = participant;
              break;
            }
          }
        }

        // Enhanced logging with user roles
        const remoteUserType = matchedParticipant?.userType || 'unknown';
        console.log(`Remote user joined: ${remoteUser.uid}, type: ${remoteUserType}, matched:`, matchedParticipant);

        // Special handling for company users viewing candidate videos
        if (isCompanyUser && remoteUserType === 'candidate') {
          console.log("Company user receiving candidate video - applying special handling");
        }
        
        // For candidates viewing company videos
        if (!isCompanyUser && remoteUserType === 'company') {
          console.log("Candidate receiving company video - applying special handling");
        }

        // Track this user for future reconnections if we found a match
        if (matchedParticipant) {
          trackUserIdentity(matchedParticipant.userId, remoteUser.uid);
        }

        // Check if this user is already in our remoteUsers state by userId (not just by Agora UID)
        let existingUserId = null;
        if (matchedParticipant) {
          // Check if we already have this participant in our remote users list
          Object.keys(remoteUsers).forEach(uid => {
            if (remoteUsers[uid].userId === matchedParticipant.userId) {
              existingUserId = uid;
            }
          });
        }

        // Update remote users state with the new user
        setRemoteUsers(prevUsers => {
          const newUsers = { ...prevUsers };
          
          // If we found an existing user with same userId but different Agora UID, 
          // update that entry instead of creating a new one
          if (existingUserId && existingUserId !== remoteUser.uid) {
            console.log("Found existing user with different Agora UID. Updating instead of creating new:", 
                      existingUserId, "->", remoteUser.uid);
            
            // Remove the old entry
            delete newUsers[existingUserId];
          }
          
          // Create or update user with a copy of the current object
          if (!newUsers[remoteUser.uid]) {
            // Create new user entry with better ID handling
            newUsers[remoteUser.uid] = {
              uid: remoteUser.uid,
              userId: matchedParticipant?.userId || remoteUser.uid.toString(),
              hasVideo: mediaType === 'video',
              hasAudio: mediaType === 'audio',
              name: matchedParticipant?.name || `Người tham gia ${remoteUser.uid}`,
              avatar: matchedParticipant?.avatar || '',
              role: matchedParticipant?.role || 'attendee',
              userType: matchedParticipant?.userType || 'unknown'
            };
          } else {
            // Update existing entry
            newUsers[remoteUser.uid] = {
              ...newUsers[remoteUser.uid],
              hasVideo: mediaType === 'video' ? true : newUsers[remoteUser.uid].hasVideo,
              hasAudio: mediaType === 'audio' ? true : newUsers[remoteUser.uid].hasAudio
            };
          }
          
          return newUsers;
        });

      // If the subscribed media is video
      if (mediaType === 'video' && remoteUser.videoTrack) {
        console.log('Playing remote video for user:', remoteUser.uid);
        
        // Make playback more reliable with increased timeout
        setTimeout(() => {
          try {
            // Use consistent element ID based on userId rather than Agora UID
            const userId = matchedParticipant?.userId || remoteUser.uid.toString();
            const elementId = `user-video-${userId}`;
            console.log('Playing video in element:', elementId);
            
            // Ensure this mapping is tracked for consistent playback
            if (matchedParticipant) {
              trackUserIdentity(matchedParticipant.userId, remoteUser.uid);
            }
            
            // Stop existing track if any
            try {
              remoteUser.videoTrack.stop();
            } catch (e) {}
            
            // Try multiple times to play the video with increasing delays
            const playVideo = () => {
              try {
                const container = document.getElementById(elementId);
                if (container) {
                  // Get user type for better debugging
                  const participantType = matchedParticipant?.userType || 'unknown';
                  console.log(`Playing video for ${participantType} user in element:`, elementId);
                  
                  // Determine if special handling is needed based on user roles
                  const needsSpecialHandling = 
                    (isCompanyUser && participantType === 'candidate') || 
                    (!isCompanyUser && participantType === 'company');
                  
                  // Force video rendering parameters for better compatibility
                  remoteUser.videoTrack.play(elementId, { 
                    fit: needsSpecialHandling ? 'contain' : 'cover', 
                    mirror: false // Disable mirror to avoid left-right flipping
                  });
                  
                  console.log('Successfully played video in element:', elementId);
                  
                  // Update state to reflect video is now playing
                  setRemoteUsers(prev => ({
                    ...prev,
                    [remoteUser.uid]: {
                      ...prev[remoteUser.uid],
                      hasVideo: true,
                      userType: matchedParticipant?.userType || prev[remoteUser.uid]?.userType || 'unknown'
                    }
                  }));
                  
                  // Ensure the video rendering is properly reflected in the UI
                  setTimeout(() => {
                    // Check if video is actually displaying
                    const videoElement = document.querySelector(`#${elementId} video`);
                    if (videoElement) {
                      console.log(`Video element for ${elementId} is present in DOM`);
                      
                      // Apply special classes based on participant type
                      if (participantType === 'company' || participantType === 'admin') {
                        const containerElement = document.getElementById(elementId);
                        if (containerElement) {
                          containerElement.classList.add('company-user-video');
                        }
                      } else if (participantType === 'candidate' && isCompanyUser) {
                        // Apply special class for companies viewing candidates
                        const containerElement = document.getElementById(elementId);
                        if (containerElement) {
                          containerElement.classList.add('candidate-user-video');
                        }
                      }
                    } else {
                      console.warn(`No video element found for ${elementId}, will retry playing`);
                      setTimeout(playVideo, 1000);
                    }
                  }, 1000);
                  
                } else {
                  console.log('Container not ready, retrying in 500ms:', elementId);
                  setTimeout(playVideo, 500);
                }
              } catch (playError) {
                console.error('Error playing remote video:', playError);
                // Retry once more after an error
                setTimeout(playVideo, 1000);
              }
            };
            
            playVideo();
          } catch (playError) {
            console.error('Error setting up video playback:', playError);
          }
        }, 500);
      }
      
      // If the subscribed media is audio
      if (mediaType === 'audio' && remoteUser.audioTrack) {
        console.log('Playing remote audio for user:', remoteUser.uid);
        remoteUser.audioTrack.play();
        
        // Mark in state that this user has audio
        setRemoteUsers(prev => ({
          ...prev,
          [remoteUser.uid]: {
            ...prev[remoteUser.uid],
            hasAudio: true
          }
        }));
      }
      
      // Notify others of new participant
      console.log('New user joined meeting:', remoteUser.uid);
      } catch (error) {
        console.error('Error handling user published:', error);
      }
    });

    // Handle when a user stops publishing media
    rtcClientRef.current.on('user-unpublished', async (remoteUser, mediaType) => {
      console.log('Remote user unpublished:', remoteUser.uid, mediaType);
      
      // Update remote users state to reflect the change
      setRemoteUsers(prevUsers => {
        if (!prevUsers[remoteUser.uid]) return prevUsers;
        
        return {
          ...prevUsers,
          [remoteUser.uid]: {
            ...prevUsers[remoteUser.uid],
            hasVideo: mediaType === 'video' ? false : prevUsers[remoteUser.uid].hasVideo,
            hasAudio: mediaType === 'audio' ? false : prevUsers[remoteUser.uid].hasAudio
          }
        };
      });
    });

    // Handle when a user leaves the channel
    rtcClientRef.current.on('user-left', async (remoteUser) => {
      console.log('Remote user left:', remoteUser.uid);
      
      // Remove from remote users
      setRemoteUsers(prevUsers => {
        const newUsers = { ...prevUsers };
        delete newUsers[remoteUser.uid];
        return newUsers;
      });

      // Log participant leaving - endpoint likely doesn't exist
      console.log('User left meeting:', remoteUser.uid);
    });

    // Additional event for connection state changes
    rtcClientRef.current.on('connection-state-change', (state) => {
      console.log('Connection state changed to:', state);
      
      // If connection is lost, try to reconnect
      if (state === 'DISCONNECTED' || state === 'RECONNECTING') {
        setErrorMessage('Kết nối không ổn định. Đang thử kết nối lại...');
      } else if (state === 'CONNECTED') {
        setErrorMessage('');
      }
    });
  };

  const leaveChannel = async () => {
    try {
      // Cleanup RTM
      try {
        if (rtmConnected) {
          await rtmService.leaveChannel();
          await rtmService.logout();
        }
      } catch (rtmError) {
        console.warn('Error cleaning up RTM:', rtmError);
      }
      
      // Notify server that user is leaving if meeting ID exists
      if (meetingId && user) {
        // Server notification removed as endpoint doesn't exist
      console.log('User leaving meeting:', user.id);
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

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const handleEndCall = async () => {
    await leaveChannel();
    navigate(-1); // Go back to previous page
  };

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

  // Khi component render
  useEffect(() => {
    // This effect runs after the component has rendered
    // We use it to ensure video tracks are correctly played in DOM elements
    
    // Play local video if available
    if (localVideoTrack && isCameraOn) {
      try {
        console.log("Playing local video after render");
        const localElement = document.getElementById('user-1');
        if (localElement) {
          localVideoTrack.play('user-1');
        }
      } catch (e) {
        console.warn("Could not play local video:", e);
      }
    }
    
    // Play screen share if available
    if (screenTrack && isScreenSharing) {
      try {
        console.log("Playing screen share after render");
        const screenElement = document.getElementById('screen-share-container');
        if (screenElement) {
          screenTrack.play('screen-share-container');
        }
      } catch (e) {
        console.warn("Could not play screen share:", e);
      }
    }
    
    // Try to replay all remote videos on component render to fix display issues
    if (rtcClientRef.current && rtcClientRef.current.remoteUsers.length > 0) {
      console.log("Attempting to replay all remote videos");
      rtcClientRef.current.remoteUsers.forEach(remoteUser => {
        try {
          if (remoteUser.videoTrack) {
            const elementId = `user-video-${remoteUser.uid}`;
            console.log(`Replaying video for remote user ${remoteUser.uid} in element ${elementId}`);
            const container = document.getElementById(elementId);
            
            if (container) {
              // Stop first to avoid conflicts
              try {
                remoteUser.videoTrack.stop();
              } catch (e) {}
              
              // Then play again
              setTimeout(() => {
                try {
                  remoteUser.videoTrack.play(elementId);
                  
                  // Update state to show video is playing
                  setRemoteUsers(prev => ({
                    ...prev,
                    [remoteUser.uid]: {
                      ...prev[remoteUser.uid],
                      hasVideo: true
                    }
                  }));
                } catch (e) {
                  console.warn(`Could not replay video for ${remoteUser.uid}:`, e);
                }
              }, 100);
            }
          }
        } catch (e) {
          console.warn(`Error handling remote video replay for ${remoteUser.uid}:`, e);
        }
      });
    }
    
  }, [localVideoTrack, isCameraOn, screenTrack, isScreenSharing]);

  // Fix: cập nhật class cho container khi có screen sharing
  useEffect(() => {
    const container = document.querySelector('.video-grid-container');
    if (container) {
      if (isScreenSharing) {
        container.classList.add('screen-share-active');
      } else {
        container.classList.remove('screen-share-active');
      }
    }
  }, [isScreenSharing]);

  // Thêm: kiểm tra kết nối định kỳ và thử lại nếu không có camera từ user khác
  useEffect(() => {
    if (!meetingId || !rtcClientRef.current || activeParticipants.length <= 1) {
      return;
    }

    // Get user role for custom handling
    const userRole = user?.role || 'unknown';
    const isCompanyUser = userRole === 'company' || userRole === 'admin';

    // Kiểm tra xem có remote users không có video track không
    const checkRemoteVideoTracks = () => {
      console.log(`Checking remote video connections (${userRole} perspective)`);
      
      // Force reconnection for all remote participants periodically
      // This is especially important for company users who need to see candidates
      if (isCompanyUser) {
        console.log("Company user - performing more aggressive video connection checks");
        
        // For company users, check ALL participants, not just those without video
        activeParticipants
          .filter(p => !p.isLocal && p.userType === 'candidate')
          .forEach(participant => {
            const userId = participant.userId;
            console.log(`Company checking candidate connection: ${userId}`);
            
            // Try to find this user in the remote users
            const agoraUid = getConsistentAgoraUid(userId) || 
                          Object.keys(remoteUsers).find(uid => 
                            remoteUsers[uid].userId === userId
                          );
            
            // If found, attempt to verify the video connection
            if (agoraUid) {
              // Find the remote user in the Agora client
              const remoteUser = rtcClientRef.current.remoteUsers.find(
                user => user.uid.toString() === agoraUid
              );
              
              if (remoteUser) {
                console.log(`Found candidate ${userId} in Agora client`);
                
                // For company users, proactively check video connections
                if (remoteUser.hasVideo) {
                  console.log(`Candidate ${userId} has video. Verifying display...`);
                  
                  // Check if the video element exists in the DOM
                  const elementId = `user-video-${userId}`;
                  const container = document.getElementById(elementId);
                  const videoElement = container ? container.querySelector('video') : null;
                  
                  if (!videoElement || !videoElement.srcObject) {
                    console.log(`Video element for candidate ${userId} not properly connected. Reconnecting...`);
                    
                    // Force resubscription and playback
                    rtcClientRef.current.subscribe(remoteUser, 'video')
                      .then(() => {
                        setTimeout(() => {
                          try {
                            // Stop any existing track
                            try { remoteUser.videoTrack.stop(); } catch (e) {}
                            
                            // Play with enhanced settings
                            remoteUser.videoTrack.play(elementId, {
                              fit: 'cover',
                              mirror: false
                            });
                            
                            // Apply special class
                            if (container) {
                              container.classList.add('candidate-user-video');
                            }
                            
                            console.log(`Successfully reconnected video for candidate ${userId}`);
                          } catch (err) {
                            console.error(`Error replaying candidate video:`, err);
                          }
                        }, 300);
                      }).catch(err => {
                        console.error(`Error resubscribing to candidate video:`, err);
                      });
                  }
                } else if (participant.isVideoOn) {
                  // Candidate should have video but doesn't
                  console.log(`Candidate ${userId} should have video but doesn't. Forcing resubscription...`);
                  
                  // Force resubscription
                  rtcClientRef.current.subscribe(remoteUser, 'video')
                    .then(() => console.log(`Resubscribed to candidate ${userId} video`))
                    .catch(err => console.error(`Error resubscribing:`, err));
                }
              } else {
                console.log(`Cannot find remote user object for candidate ${userId}`);
              }
            } else {
              console.log(`Cannot find Agora UID for candidate ${userId}`);
            }
          });
      }

      // Regular reconnection logic for all participants
      activeParticipants
        .filter(p => !p.isLocal)
        .forEach(participant => {
          const userId = participant.userId;
          const agoraUid = getConsistentAgoraUid(userId) || 
                         Object.keys(remoteUsers).find(uid => 
                           remoteUsers[uid].userId === userId
                         );
          
          // Nếu người dùng đã kết nối nhưng không có video track
          if (agoraUid && !remoteUsers[agoraUid].hasVideo && participant.userType) {
            console.log(`Remote user ${userId} (${participant.userType}) has no video. Attempting to fix...`);
            
            // Special handling for company users - these are critical to ensure visibility
            const isCompanyUser = participant.userType === 'company' || participant.userType === 'admin';
            
            // Extra logging for company users
            if (isCompanyUser) {
              console.warn(`Company user ${userId} has no video. Aggressively attempting to reconnect...`);
            }
            
            // Thử lại subscribe
            try {
              // Lấy RemoteUser object từ Agora SDK
              const remoteUser = rtcClientRef.current.remoteUsers.find(
                user => (user.uid.toString() === agoraUid) || 
                       (user.uid.toString() === userId)
              );
              
              if (remoteUser) {
                console.log(`Found remote user in Agora client:`, remoteUser);
                // For company users, try to re-subscribe even if hasVideo is false
                if (remoteUser.hasVideo || isCompanyUser) {
                  // Add a small delay to ensure proper timing
                  setTimeout(() => {
                    // Resubscribe to video
                    rtcClientRef.current.subscribe(remoteUser, 'video').then(() => {
                      console.log(`Re-subscribed to video for user ${userId}`);
                      
                      // Đảm bảo video được phát
                      setTimeout(() => {
                        try {
                          // Use consistent element ID
                          const elementId = `user-video-${userId}`;
                          if (remoteUser.videoTrack) {
                            // Extra handling for company users
                            if (isCompanyUser) {
                              console.log(`Playing company user video with enhanced settings`);
                              remoteUser.videoTrack.play(elementId, {
                                fit: 'contain',
                                mirror: false
                              });
                              
                              // Add special class
                              const container = document.getElementById(elementId);
                              if (container) {
                                container.classList.add('company-user-video');
                              }
                            } else {
                              // For candidate users
                              remoteUser.videoTrack.play(elementId, {
                                fit: 'cover',
                                mirror: false
                              });
                              
                              // Add special class for candidates when viewed by company
                              const viewerIsCompany = user?.role === 'company' || user?.role === 'admin';
                              if (viewerIsCompany && participant.userType === 'candidate') {
                                const container = document.getElementById(elementId);
                                if (container) {
                                  container.classList.add('candidate-user-video');
                                }
                              }
                            }
                            
                            // Cập nhật state
                            setRemoteUsers(prev => ({
                              ...prev,
                              [agoraUid]: {
                                ...prev[agoraUid],
                                hasVideo: true,
                                userType: participant.userType
                              }
                            }));
                          }
                        } catch (err) {
                          console.error(`Error playing video for ${userId}:`, err);
                        }
                      }, 500);
                    }).catch(err => {
                      console.error(`Error re-subscribing to video for ${userId}:`, err);
                    });
                  }, isCompanyUser ? 100 : 500); // Faster retry for company users
                }
              }
            } catch (err) {
              console.error(`Error handling reconnection for ${userId}:`, err);
            }
          }
        });
    };

    // First check immediately
    checkRemoteVideoTracks();

    // Then set up periodic checks every 6 seconds for normal users, 3 seconds for company
    const interval = isCompanyUser ? 3000 : 6000;
    const checkInterval = setInterval(checkRemoteVideoTracks, interval);
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [activeParticipants, remoteUsers, meetingId, uid, user]);

  // Fix cho vấn đề đôi khi không thấy video remote
  const onVideoTileClick = (userId) => {
    // Nếu là local user, không làm gì
    if (!userId || userId === uid.toString()) return;
    
    // Find the participant for more context
    const participant = activeParticipants.find(p => p.userId === userId) || 
                      participants.find(p => p.userId === userId);
    
    const isCompanyUser = participant?.userType === 'company' || participant?.userType === 'admin';
    const viewerIsCompany = user?.role === 'company' || user?.role === 'admin';
    const isCandidateVideo = participant?.userType === 'candidate';
    
    // Tailor message based on viewer and participant types
    let statusMessage;
    if (viewerIsCompany && isCandidateVideo) {
      statusMessage = "Đang kết nối lại với video của ứng viên...";
    } else if (!viewerIsCompany && isCompanyUser) {
      statusMessage = "Đang kết nối lại với video của công ty...";
    } else {
      statusMessage = "Đang kết nối lại với video của người dùng...";
    }
    
    // Thông báo cho người dùng
    setErrorMessage(statusMessage);
    
    // Get Agora UID for this user
    const agoraUid = getConsistentAgoraUid(userId) || 
                   Object.keys(remoteUsers).find(uid => 
                     remoteUsers[uid].userId === userId
                   );
    
    if (!agoraUid) {
      console.error(`Could not find Agora UID for user ${userId}`);
      setErrorMessage("Không thể tìm thấy kết nối của người dùng này");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    
    // Thử kết nối lại
    if (rtcClientRef.current) {
      try {
        console.log(`Manual reconnection attempt for user ${userId} (Agora UID: ${agoraUid})`);
        
        // Lấy RemoteUser object từ Agora SDK
        const remoteUser = rtcClientRef.current.remoteUsers.find(
          user => user.uid.toString() === agoraUid
        );
        
        if (remoteUser) {
          console.log(`Found remote user in client:`, remoteUser);
          
          // Special strategies based on user types
          const specialReconnectionStrategy = (viewerIsCompany && isCandidateVideo) || 
                                           (!viewerIsCompany && isCompanyUser);
          
          if (specialReconnectionStrategy) {
            console.log(`Using special reconnection strategy for ${participant?.userType} video`);
          }
          
          // Force unsubscribe first to clear any issues
          rtcClientRef.current.unsubscribe(remoteUser, 'video')
            .then(() => {
              console.log(`Unsubscribed from video for user ${userId} to reset connection`);
              
              // Then resubscribe after a short delay
              setTimeout(() => {
                rtcClientRef.current.subscribe(remoteUser, 'video')
                  .then(() => {
                    console.log(`Manually re-subscribed to video for user ${userId}`);
                    
                    // Ensure video is played
                    setTimeout(() => {
                      try {
                        const elementId = `user-video-${userId}`;
                        if (remoteUser.videoTrack) {
                          console.log(`Playing video in element ${elementId}`);
                          
                          // Try stop first if already playing
                          try {
                            remoteUser.videoTrack.stop();
                          } catch (e) {}
                          
                          // Determine appropriate video settings based on user types
                          const videoSettings = {
                            fit: (viewerIsCompany && isCandidateVideo) ? 'cover' : 
                                 (isCompanyUser) ? 'contain' : 'cover',
                            mirror: false
                          };
                          
                          console.log(`Using video settings:`, videoSettings);
                          remoteUser.videoTrack.play(elementId, videoSettings);
                          
                          // Apply appropriate CSS classes
                          const container = document.getElementById(elementId);
                          if (container) {
                            // Remove any existing special classes
                            container.classList.remove('company-user-video', 'candidate-user-video');
                            
                            // Apply appropriate class
                            if (isCompanyUser) {
                              container.classList.add('company-user-video');
                            } else if (isCandidateVideo && viewerIsCompany) {
                              container.classList.add('candidate-user-video');
                            }
                          }
                          
                          // Update state
                          setRemoteUsers(prev => ({
                            ...prev,
                            [agoraUid]: {
                              ...prev[agoraUid],
                              hasVideo: true,
                              userType: participant?.userType || prev[agoraUid]?.userType
                            }
                          }));
                          
                          setErrorMessage("Đã kết nối lại thành công!");
                          setTimeout(() => setErrorMessage(""), 1500);
                        } else {
                          console.error(`No video track available for ${userId}`);
                          setErrorMessage("Người dùng chưa bật camera");
                          setTimeout(() => setErrorMessage(""), 3000);
                        }
                      } catch (err) {
                        console.error(`Error playing video for ${userId}:`, err);
                        setErrorMessage("Không thể hiển thị video. Vui lòng thử lại.");
                        setTimeout(() => setErrorMessage(""), 3000);
                      }
                    }, specialReconnectionStrategy ? 300 : 500);
                  }).catch(err => {
                    console.error(`Error manually re-subscribing for ${userId}:`, err);
                    setErrorMessage("Lỗi kết nối: " + err.message);
                    setTimeout(() => setErrorMessage(""), 3000);
                  });
              }, 400);
            })
            .catch(err => {
              // If unsubscribe fails, try direct subscribe
              console.warn(`Error unsubscribing from video for user ${userId}:`, err);
              
              // Attempt direct subscribe
              rtcClientRef.current.subscribe(remoteUser, 'video')
                .then(() => {
                  // Similar play logic as above
                  setTimeout(() => {
                    try {
                      const elementId = `user-video-${userId}`;
                      if (remoteUser.videoTrack) {
                        // Determine video settings based on user types
                        const videoSettings = {
                          fit: (viewerIsCompany && isCandidateVideo) ? 'cover' : 
                               (isCompanyUser) ? 'contain' : 'cover',
                          mirror: false
                        };
                        
                        remoteUser.videoTrack.play(elementId, videoSettings);
                        
                        // Apply appropriate CSS class
                        const container = document.getElementById(elementId);
                        if (container) {
                          // Remove any existing special classes
                          container.classList.remove('company-user-video', 'candidate-user-video');
                          
                          if (isCompanyUser) {
                            container.classList.add('company-user-video');
                          } else if (isCandidateVideo && viewerIsCompany) {
                            container.classList.add('candidate-user-video');
                          }
                        }
                        
                        setRemoteUsers(prev => ({
                          ...prev,
                          [agoraUid]: {
                            ...prev[agoraUid],
                            hasVideo: true,
                            userType: participant?.userType
                          }
                        }));
                        
                        setErrorMessage("Kết nối thành công!");
                        setTimeout(() => setErrorMessage(""), 1500);
                      }
                    } catch (e) {
                      console.error("Error playing video after direct subscribe:", e);
                      setErrorMessage("Lỗi hiển thị video");
                      setTimeout(() => setErrorMessage(""), 3000);
                    }
                  }, 500);
                }).catch(e => {
                  console.error("Direct subscribe failed:", e);
                  setErrorMessage("Không thể kết nối. Vui lòng thử lại sau.");
                  setTimeout(() => setErrorMessage(""), 3000);
                });
            });
        } else {
          console.log(`Could not find remote user ${userId} in client`);
          setErrorMessage("Không tìm thấy kết nối với người dùng này");
          setTimeout(() => setErrorMessage(""), 3000);
        }
      } catch (err) {
        console.error(`Error in manual reconnection for ${userId}:`, err);
        setErrorMessage("Lỗi: " + err.message);
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };

  return (
    <div className="meeting-room">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Đang tải cuộc họp...</p>
        </div>
      )}

      {errorMessage && (
        <Alert variant="danger" className="error-alert">
          {errorMessage}
        </Alert>
      )}

      {/* Meeting Header */}
      <div className="meeting-header">
        <div className="meeting-info">
          <h2>{meetingInfo?.title || `Cuộc họp ${meetingId}`}</h2>
          <p>Kênh: {channelName}</p>
          {meetingInfo?.description && <p>{meetingInfo.description}</p>}
        </div>
        <div className="meeting-stats">
          <Badge bg="primary">{Object.keys(remoteUsers).length + 1} người tham gia</Badge>
        </div>
      </div>

      {/* Video Grid */}
      <div className="video-grid">
        {/* Local Video */}
        <div className="video-tile local-video">
          <div 
            ref={localVideoRef} 
            id="local-video" 
            className="video-container"
          />
          <div className="video-overlay">
            <span className="user-name">Bạn ({user?.name || 'User'})</span>
            <div className="video-controls">
              {!isCameraOn && <FaVideoSlash className="icon-disabled" />}
              {!isMicOn && <FaMicrophoneSlash className="icon-disabled" />}
            </div>
          </div>
        </div>

        {/* Remote Videos */}
        {Object.keys(remoteUsers).map((uid) => {
          const remoteUser = remoteUsers[uid];
          const participant = activeParticipants.find(p => p.userId === remoteUser.userId);
          
          return (
            <div key={uid} className="video-tile remote-video" onClick={() => onVideoTileClick(remoteUser.userId)}>
              <div 
                id={`user-video-${remoteUser.userId}`}
                className="video-container"
              />
              <div className="video-overlay">
                <span className="user-name">
                  {participant?.name || remoteUser.name || `User ${uid}`}
                </span>
                <div className="video-controls">
                  {!remoteUser.hasVideo && <FaVideoSlash className="icon-disabled" />}
                  {!remoteUser.hasAudio && <FaMicrophoneSlash className="icon-disabled" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Meeting Controls */}
      <div className="meeting-controls">
        <Button 
          variant={isCameraOn ? "success" : "danger"}
          onClick={toggleCamera}
          className="control-btn"
        >
          {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
        </Button>

        <Button 
          variant={isMicOn ? "success" : "danger"}
          onClick={toggleMic}
          className="control-btn"
        >
          {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </Button>

        <Button 
          variant="info"
          onClick={toggleChat}
          className="control-btn"
        >
          <FaComments />
          {showChat && " Ẩn Chat"}
          {!showChat && " Hiện Chat"}
        </Button>

        <Button 
          variant="warning"
          onClick={() => setShowTokenModal(true)}
          className="control-btn"
        >
          Token
        </Button>

        <Button 
          variant="danger"
          onClick={handleEndCall}
          className="control-btn end-call"
        >
          <FaPhoneSlash /> Kết thúc
        </Button>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="chat-panel">
          <ChatRoom 
            channelName={channelName}
            currentUser={user}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}

      {/* Token Modal */}
      {showTokenModal && renderTokenModal()}
    </div>
  );
};

export default MeetingRoom;