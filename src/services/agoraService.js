import axios from 'axios';
import { AGORA_CONFIG } from '../config/agora';
import authService from './authService';

const AGORA_API_BASE = AGORA_CONFIG.API_BASE_URL;
const DATABASE_API_BASE = 'http://localhost:5000';

class AgoraService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: AGORA_API_BASE,
      timeout: 10000,
    });

    this.dbClient = axios.create({
      baseURL: DATABASE_API_BASE,
      timeout: 10000,
    });

    this.apiClient.interceptors.request.use(
      (config) => {
        const user = authService.getCurrentUser();
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.dbClient.interceptors.request.use(
      (config) => {
        const user = authService.getCurrentUser();
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.apiClient.interceptors.response.use(
      (response) => {
        if (response.data && response.data.success) {
          return response.data;
        }
        return response.data;
      },
      (error) => {
        console.error('Agora API Error:', error);
        if (error.response?.status === 401) {
          authService.logout();
          window.location.href = '/login';
        }
        
        const message = error.response?.data?.message || error.message;
        throw new Error(message);
      }
    );

    this.dbClient.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error('Database API Error:', error);
        if (error.response?.status === 401) {
          authService.logout();
          window.location.href = '/login';
        }
        
        const message = error.response?.data?.message || error.message;
        throw new Error(message);
      }
    );
  }

  // =====================================================
  // NEW TOKEN MANAGEMENT METHODS
  // =====================================================

  /**
   * Generate and save token to database for persistent storage
   */
  async generateAndSaveToken(channelName, uid = null, role = 'publisher', meetingId = null, userId = null) {
    try {
      console.log('🎯 Generating and saving token:', { channelName, uid, role, meetingId, userId });
      
      const response = await this.apiClient.post('/tokens/generate', {
        channelName,
        uid: uid || Date.now().toString(),
        role,
        meetingId: meetingId || channelName,
        userId: userId || authService.getCurrentUser()?.id || 'anonymous'
      });

      console.log('✅ Token generated and saved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to generate and save token:', error);
      throw new Error(`Failed to generate and save token: ${error.message}`);
    }
  }

  /**
   * Get token by ID from database
   */
  async getTokenById(tokenId) {
    try {
      const response = await this.apiClient.get(`/tokens/${tokenId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get token: ${error.message}`);
    }
  }

  /**
   * Get all tokens for a meeting
   */
  async getTokensByMeeting(meetingId) {
    try {
      const response = await this.apiClient.get(`/tokens/meeting/${meetingId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get meeting tokens: ${error.message}`);
    }
  }

  /**
   * Get all tokens for a user
   */
  async getTokensByUser(userId) {
    try {
      const response = await this.apiClient.get(`/tokens/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user tokens: ${error.message}`);
    }
  }

  /**
   * Refresh a token when it's about to expire
   */
  async refreshToken(tokenId) {
    try {
      const response = await this.apiClient.post(`/tokens/${tokenId}/refresh`);
      console.log('🔄 Token refreshed:', response.data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Invalidate a token
   */
  async invalidateToken(tokenId) {
    try {
      const response = await this.apiClient.patch(`/tokens/${tokenId}/invalidate`);
      console.log('❌ Token invalidated:', response.data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to invalidate token: ${error.message}`);
    }
  }

  /**
   * Check if token is valid and not expired
   */
  isTokenValid(tokenData) {
    if (!tokenData || !tokenData.isValid) {
      return false;
    }

    const expiresAt = new Date(tokenData.expiresAt);
    const now = new Date();
    
    return expiresAt > now;
  }

  /**
   * Enhanced meeting token generation with persistent storage
   */
  async generateMeetingTokenEnhanced(meetingId, uid = null, userId = null) {
    try {
      console.log('🎯 Generating enhanced meeting token:', { meetingId, uid, userId });

      // Try to get existing valid token first
      const currentUserId = userId || authService.getCurrentUser()?.id;
      if (currentUserId) {
        try {
          const existingTokens = await this.getTokensByUser(currentUserId);
          const validToken = existingTokens.find(token => 
            token.meetingId === meetingId && this.isTokenValid(token)
          );
          
          if (validToken) {
            console.log('♻️ Using existing valid token:', validToken);
            return {
              ...validToken,
              isExisting: true
            };
          }
        } catch (error) {
          console.log('ℹ️ No existing tokens found, generating new one');
        }
      }

      // Generate new token and save to database
      const channelName = `meeting_${meetingId}`;
      const tokenData = await this.generateAndSaveToken(
        channelName, 
        uid, 
        'publisher', 
        meetingId, 
        currentUserId
      );

      return {
        ...tokenData,
        isExisting: false
      };
    } catch (error) {
      console.error('❌ Enhanced meeting token generation failed:', error);
      
      // Fallback to simple token generation
      console.log('🔄 Falling back to simple token generation...');
      return this.generateMeetingToken(meetingId, uid);
    }
  }

  // =====================================================
  // EXISTING METHODS (Updated to work with new backend)
  // =====================================================

  async getAgoraConfig() {
    try {
      const response = await this.apiClient.get('/agora/config');
      return response.data;
    } catch (error) {
      console.warn('Using fallback Agora config:', error.message);
      return {
        appID: AGORA_CONFIG.APP_ID,
        tokenExpirationTime: 3600
      };
    }
  }

  async generateToken(channelName, uid = null, role = 'publisher') {
    try {
      const params = new URLSearchParams({
        channelName,
        role
      });
      
      if (uid) {
        params.append('uid', uid);
      }

      const response = await this.apiClient.get(`/agora/token?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to generate token: ${error.message}`);
    }
  }

  async generateMeetingToken(meetingId, uid = null) {
    try {
      // Try the new test endpoint first (no auth required)
      const response = await this.apiClient.post(`/agora/test/meeting/${meetingId}/token`, {
        uid: uid || Date.now().toString()
      });
      return response.data;
    } catch (error) {
      console.warn('Test meeting token failed, trying authenticated endpoint:', error.message);
      
      try {
        // Try authenticated endpoint
        const response = await this.apiClient.post(`/agora/meeting/${meetingId}/token`, {
          uid: uid || Date.now().toString()
        });
        return response.data;
      } catch (authError) {
        console.warn('Authenticated meeting token failed, using fallback:', authError.message);
        
        // Fallback to simple token generation
        const channelName = `meeting_${meetingId}`;
        return this.generateToken(channelName, uid);
      }
    }
  }

  async createMeeting(meetingData) {
    try {
      const response = await this.dbClient.post('/meetings', meetingData);
      return response;
    } catch (error) {
      throw new Error(`Failed to create meeting: ${error.message}`);
    }
  }

  async getMeetings(params = {}) {
    try {
      const response = await this.dbClient.get('/meetings');
      const meetings = Array.isArray(response) ? response : [];
      
      return {
        meetings: meetings,
        success: true
      };
    } catch (error) {
      console.error('Failed to fetch meetings from database:', error);
      throw new Error(`Failed to fetch meetings: ${error.message}`);
    }
  }

  async getMeetingById(meetingId) {
    try {
      const response = await this.dbClient.get(`/meetings/${meetingId}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch meeting from database:', error);
      throw new Error(`Meeting not found: ${error.message}`);
    }
  }

  async updateMeeting(meetingId, updateData) {
    try {
      const response = await this.dbClient.put(`/meetings/${meetingId}`, updateData);
      return response;
    } catch (error) {
      throw new Error(`Failed to update meeting: ${error.message}`);
    }
  }

  async deleteMeeting(meetingId) {
    try {
      const response = await this.dbClient.delete(`/meetings/${meetingId}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to delete meeting: ${error.message}`);
    }
  }

  async startMeeting(meetingId) {
    try {
      const response = await this.dbClient.patch(`/meetings/${meetingId}`, { 
        status: 'active',
        actualStartTime: new Date().toISOString()
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to start meeting: ${error.message}`);
    }
  }

  async endMeeting(meetingId) {
    try {
      const response = await this.dbClient.patch(`/meetings/${meetingId}`, { 
        status: 'ended',
        actualEndTime: new Date().toISOString()
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to end meeting: ${error.message}`);
    }
  }

  validateChannelName(channelName) {
    if (!channelName || typeof channelName !== 'string') {
      throw new Error('Channel name is required and must be a string');
    }
    
    if (channelName.length > 64) {
      throw new Error('Channel name must be less than 64 characters');
    }
    
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(channelName)) {
      throw new Error('Channel name can only contain letters, numbers, underscores, and hyphens');
    }
    
    return true;
  }

  static getInstance() {
    if (!AgoraService.instance) {
      AgoraService.instance = new AgoraService();
    }
    return AgoraService.instance;
  }
}

export default AgoraService.getInstance(); 