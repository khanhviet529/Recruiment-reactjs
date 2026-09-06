import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from '../redux/slices/authSlice';
import AgoraService from '../services/agoraService';
import { saveAgoraToken, getAgoraToken, hasValidAgoraToken, clearAgoraToken } from '../utils/tokenStorage';

export const useAgora = () => {
  const [agoraConfig, setAgoraConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTokenData, setCurrentTokenData] = useState(null);
  const { user } = useSelector(selectAuth);

  const initializeAgora = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = await AgoraService.getAgoraConfig();
      setAgoraConfig(config);
      
      return config;
    } catch (error) {
      setError(error.message);
      console.error('Failed to initialize Agora:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateToken = useCallback(async (channelName, uid = null, role = 'publisher') => {
    try {
      setLoading(true);
      setError(null);

      if (!agoraConfig) {
        await initializeAgora();
      }

      const tokenData = await AgoraService.generateToken(channelName, uid, role);
      
      if (tokenData && tokenData.token) {
        saveAgoraToken(tokenData);
        setCurrentTokenData(tokenData);
      }

      return tokenData;
    } catch (error) {
      setError(error.message);
      console.error('Failed to generate token:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [agoraConfig, initializeAgora]);

  const generateMeetingToken = useCallback(async (meetingId, uid = null) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      const tokenData = await AgoraService.generateMeetingToken(meetingId, uid);
      
      if (tokenData && tokenData.token) {
        saveAgoraToken(tokenData);
        setCurrentTokenData(tokenData);
      }

      return tokenData;
    } catch (error) {
      setError(error.message);
      console.error('Failed to generate meeting token:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // =====================================================
  // NEW ENHANCED TOKEN MANAGEMENT METHODS
  // =====================================================

  const generateAndSaveToken = useCallback(async (channelName, uid = null, role = 'publisher', meetingId = null) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎯 Generating and saving token via hook:', { channelName, uid, role, meetingId });

      const tokenData = await AgoraService.generateAndSaveToken(
        channelName, 
        uid, 
        role, 
        meetingId, 
        user?.id
      );
      
      if (tokenData && tokenData.token) {
        saveAgoraToken(tokenData);
        setCurrentTokenData(tokenData);
      }

      console.log('✅ Token generated and saved via hook:', tokenData);
      return tokenData;
    } catch (error) {
      setError(error.message);
      console.error('Failed to generate and save token:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const generateMeetingTokenEnhanced = useCallback(async (meetingId, uid = null) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Generating enhanced meeting token:', { meetingId, uid, userId: user?.id });

      const tokenData = await AgoraService.generateMeetingTokenEnhanced(
        meetingId, 
        uid, 
        user?.id
      );
      
      if (tokenData && tokenData.token) {
        saveAgoraToken(tokenData);
        setCurrentTokenData(tokenData);
      }

      console.log('✅ Enhanced meeting token ready:', tokenData);
      return tokenData;
    } catch (error) {
      setError(error.message);
      console.error('Failed to generate enhanced meeting token:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getTokenById = useCallback(async (tokenId) => {
    try {
      setLoading(true);
      setError(null);

      const tokenData = await AgoraService.getTokenById(tokenId);
      return tokenData;
    } catch (error) {
      setError(error.message);
      console.error('Failed to get token by ID:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTokensByMeeting = useCallback(async (meetingId) => {
    try {
      setLoading(true);
      setError(null);

      const tokensData = await AgoraService.getTokensByMeeting(meetingId);
      return tokensData;
    } catch (error) {
      setError(error.message);
      console.error('Failed to get tokens by meeting:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTokensByUser = useCallback(async (userId = null) => {
    try {
      setLoading(true);
      setError(null);

      const currentUserId = userId || user?.id;
      if (!currentUserId) {
        throw new Error('User ID required');
      }

      const tokensData = await AgoraService.getTokensByUser(currentUserId);
      return tokensData;
    } catch (error) {
      setError(error.message);
      console.error('Failed to get tokens by user:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshToken = useCallback(async (tokenId) => {
    try {
      setLoading(true);
      setError(null);

      const tokenData = await AgoraService.refreshToken(tokenId);
      
      if (tokenData && tokenData.token) {
        saveAgoraToken(tokenData);
        setCurrentTokenData(tokenData);
      }

      return tokenData;
    } catch (error) {
      setError(error.message);
      console.error('Failed to refresh token:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const invalidateToken = useCallback(async (tokenId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await AgoraService.invalidateToken(tokenId);
      
      // Clear local storage if this was the current token
      if (currentTokenData && currentTokenData.tokenId === tokenId) {
        clearAgoraToken();
        setCurrentTokenData(null);
      }

      return result;
    } catch (error) {
      setError(error.message);
      console.error('Failed to invalidate token:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentTokenData]);

  const checkTokenValidity = useCallback((tokenData) => {
    return AgoraService.isTokenValid(tokenData);
  }, []);

  // Auto-refresh token when it's about to expire
  const autoRefreshToken = useCallback(async (tokenData, minutesBeforeExpiry = 5) => {
    if (!tokenData || !tokenData.tokenId) {
      return null;
    }

    const expiresAt = new Date(tokenData.expiresAt);
    const now = new Date();
    const minutesUntilExpiry = (expiresAt - now) / (1000 * 60);

    if (minutesUntilExpiry <= minutesBeforeExpiry && minutesUntilExpiry > 0) {
      console.log(`🔄 Auto-refreshing token in ${minutesUntilExpiry.toFixed(1)} minutes`);
      try {
        return await refreshToken(tokenData.tokenId);
      } catch (error) {
        console.warn('Auto-refresh failed:', error.message);
        return null;
      }
    }

    return tokenData;
  }, [refreshToken]);

  const getValidToken = useCallback(() => {
    try {
      if (hasValidAgoraToken()) {
        return getAgoraToken();
      }
      return null;
    } catch (error) {
      console.error('Error getting valid token:', error);
      return null;
    }
  }, []);

  const clearToken = useCallback(() => {
    try {
      clearAgoraToken();
      setCurrentTokenData(null);
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }, []);

  // Initialize when user changes
  useEffect(() => {
    if (user && !agoraConfig) {
      initializeAgora();
    }
  }, [user, agoraConfig, initializeAgora]);

  // Auto-refresh current token
  useEffect(() => {
    if (currentTokenData && currentTokenData.tokenId) {
      const interval = setInterval(async () => {
        const refreshedToken = await autoRefreshToken(currentTokenData);
        if (refreshedToken && refreshedToken.tokenId !== currentTokenData.tokenId) {
          setCurrentTokenData(refreshedToken);
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [currentTokenData, autoRefreshToken]);

  return {
    // Basic configuration
    agoraConfig,
    loading,
    error,
    currentTokenData,

    // Basic methods
    initializeAgora,
    generateToken,
    generateMeetingToken,
    getValidToken,
    clearToken,
    hasValidToken: hasValidAgoraToken,

    // Enhanced token management methods
    generateAndSaveToken,
    generateMeetingTokenEnhanced,
    getTokenById,
    getTokensByMeeting,
    getTokensByUser,
    refreshToken,
    invalidateToken,
    checkTokenValidity,
    autoRefreshToken,

    // Utility methods
    isTokenValid: checkTokenValidity,
  };
};

export const useMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useSelector(selectAuth);

  const fetchMeetings = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await AgoraService.getMeetings(params);
      setMeetings(response.meetings || response.data?.meetings || []);
      
      return response;
    } catch (error) {
      setError(error.message);
      console.error('Failed to fetch meetings:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMeetingById = useCallback(async (meetingId) => {
    try {
      setLoading(true);
      setError(null);

      const meeting = await AgoraService.getMeetingById(meetingId);
      return meeting;
    } catch (error) {
      setError(error.message);
      console.error('Failed to fetch meeting:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMeeting = useCallback(async (meetingData) => {
    try {
      setLoading(true);
      setError(null);

      const meeting = await AgoraService.createMeeting(meetingData);
      
      fetchMeetings();
      
      return meeting;
    } catch (error) {
      setError(error.message);
      console.error('Failed to create meeting:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchMeetings]);

  const updateMeeting = useCallback(async (meetingId, updateData) => {
    try {
      setLoading(true);
      setError(null);

      const meeting = await AgoraService.updateMeeting(meetingId, updateData);
      
      fetchMeetings();
      
      return meeting;
    } catch (error) {
      setError(error.message);
      console.error('Failed to update meeting:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchMeetings]);

  const deleteMeeting = useCallback(async (meetingId) => {
    try {
      setLoading(true);
      setError(null);

      await AgoraService.deleteMeeting(meetingId);
      
      fetchMeetings();
      
      return true;
    } catch (error) {
      setError(error.message);
      console.error('Failed to delete meeting:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchMeetings]);

  const startMeeting = useCallback(async (meetingId) => {
    try {
      setLoading(true);
      setError(null);

      const meeting = await AgoraService.startMeeting(meetingId);
      
      fetchMeetings();
      
      return meeting;
    } catch (error) {
      setError(error.message);
      console.error('Failed to start meeting:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchMeetings]);

  const endMeeting = useCallback(async (meetingId) => {
    try {
      setLoading(true);
      setError(null);

      const meeting = await AgoraService.endMeeting(meetingId);
      
      fetchMeetings();
      
      return meeting;
    } catch (error) {
      setError(error.message);
      console.error('Failed to end meeting:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchMeetings]);

  useEffect(() => {
    if (user) {
      fetchMeetings();
    }
  }, [user, fetchMeetings]);

  return {
    meetings,
    loading,
    error,
    fetchMeetings,
    fetchMeetingById,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    startMeeting,
    endMeeting,
  };
}; 