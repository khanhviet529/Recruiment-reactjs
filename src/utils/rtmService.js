import AgoraRTM from 'agora-rtm-sdk';

// Agora RTM Service - quản lý kết nối, tham gia kênh và chat
class RTMService {
  constructor() {
    this.client = null;
    this.channel = null;
    this.isLoggedIn = false;
    this.isInChannel = false;
    this.messageListeners = [];
    this.connectionListeners = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimer = null;
  }

  // Khởi tạo client RTM với APP ID
  init(appId) {
    try {
      if (!appId) {
        throw new Error('Agora App ID is required');
      }
      
      console.log("Initializing RTM client with AppID:", appId);
      
      if (this.client) {
        console.log("RTM client already initialized, resetting");
        this.client.removeAllListeners();
      }
      
      this.client = AgoraRTM.createInstance(appId);
      this._setupClientListeners();
      console.log("RTM client initialized successfully");
      return true;
    } catch (error) {
      console.error('Error initializing RTM client:', error);
      return false;
    }
  }

  // Đăng nhập vào hệ thống RTM
  async login(userId, token = null) {
    if (!this.client) {
      console.error("RTM client not initialized before login attempt");
      throw new Error('RTM client not initialized');
    }

    try {
      console.log(`RTM attempting login for user: ${userId}`);
      await this.client.login({ uid: userId.toString(), token });
      console.log(`RTM login successful for user: ${userId}`);
      this.isLoggedIn = true;
      this.userId = userId.toString();
      this.reconnectAttempts = 0;
      return true;
    } catch (error) {
      console.error('Error logging into RTM:', error);
      throw error;
    }
  }

  // Tham gia kênh RTM
  async joinChannel(channelName) {
    if (!this.client || !this.isLoggedIn) {
      console.error("Cannot join channel - client not initialized or not logged in");
      throw new Error('RTM client not initialized or not logged in');
    }

    try {
      console.log(`Joining RTM channel: ${channelName}`);
      this.channel = this.client.createChannel(channelName);
      this._setupChannelListeners();
      await this.channel.join();
      console.log(`Successfully joined RTM channel: ${channelName}`);
      this.channelName = channelName;
      this.isInChannel = true;
      
      // Notify listeners that we've joined
      this.connectionListeners.forEach(listener => {
        if (typeof listener.onChannelJoined === 'function') {
          listener.onChannelJoined(channelName);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error joining RTM channel:', error);
      throw error;
    }
  }

  // Gửi tin nhắn tới kênh hiện tại
  async sendChannelMessage(message) {
    if (!this.channel || !this.isInChannel) {
      console.error("Cannot send message - not in RTM channel");
      throw new Error('Not in RTM channel');
    }

    try {
      console.log("Sending channel message:", typeof message === 'string' ? message : JSON.stringify(message));
      
      // Nếu message là object, convert sang JSON string
      const messageToSend = typeof message === 'object' 
        ? JSON.stringify(message) 
        : message;
      
      await this.channel.sendMessage({ text: messageToSend });
      console.log("Channel message sent successfully");
      return true;
    } catch (error) {
      console.error('Error sending channel message:', error);
      
      // Nếu lỗi là do mất kết nối, thử kết nối lại
      if (error.code === 'OPERATION_ABORTED' || error.code === 'TIMEOUT') {
        this._handleConnectionLost();
      }
      
      throw error;
    }
  }

  // Gửi tin nhắn riêng tới một người dùng cụ thể
  async sendPeerMessage(peerId, message) {
    if (!this.client || !this.isLoggedIn) {
      console.error("Cannot send peer message - client not initialized or not logged in");
      throw new Error('RTM client not initialized or not logged in');
    }

    try {
      console.log(`Sending peer message to ${peerId}:`, message);
      
      // Nếu message là object, convert sang JSON string
      const messageToSend = typeof message === 'object' 
        ? JSON.stringify(message) 
        : message;
      
      await this.client.sendMessageToPeer({ text: messageToSend }, peerId.toString());
      console.log(`Peer message sent successfully to ${peerId}`);
      return true;
    } catch (error) {
      console.error('Error sending peer message:', error);
      
      // Nếu lỗi là do mất kết nối, thử kết nối lại
      if (error.code === 'OPERATION_ABORTED' || error.code === 'TIMEOUT') {
        this._handleConnectionLost();
      }
      
      throw error;
    }
  }

  // Rời khỏi kênh RTM
  async leaveChannel() {
    if (!this.channel || !this.isInChannel) {
      return true;
    }

    try {
      console.log("Leaving RTM channel");
      await this.channel.leave();
      console.log("Left RTM channel successfully");
      this.isInChannel = false;
      this.channel = null;
      return true;
    } catch (error) {
      console.error('Error leaving RTM channel:', error);
      throw error;
    }
  }

  // Đăng xuất khỏi hệ thống RTM
  async logout() {
    if (!this.client || !this.isLoggedIn) {
      return true;
    }

    try {
      if (this.isInChannel) {
        await this.leaveChannel();
      }
      
      console.log("Logging out from RTM");
      await this.client.logout();
      console.log("RTM logout successful");
      this.isLoggedIn = false;
      return true;
    } catch (error) {
      console.error('Error logging out from RTM:', error);
      throw error;
    }
  }

  // Thiết lập các sự kiện cho client
  _setupClientListeners() {
    if (!this.client) return;

    this.client.on('ConnectionStateChanged', (state, reason) => {
      console.log('RTM connection state changed:', state, 'reason:', reason);
      
      if (state === 'DISCONNECTED' || state === 'ABORTED') {
        console.warn('RTM disconnected, reason:', reason);
        this._handleConnectionLost();
      } else if (state === 'CONNECTED') {
        console.log('RTM connection restored');
        this.reconnectAttempts = 0;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      }
      
      this.connectionListeners.forEach(listener => {
        if (typeof listener === 'function') {
          listener(state, reason);
        } else if (listener && typeof listener.onConnectionStateChanged === 'function') {
          listener.onConnectionStateChanged(state, reason);
        }
      });
    });

    this.client.on('MessageFromPeer', ({ text }, peerId) => {
      console.log('Message from peer:', peerId, text);
      
      try {
        // Thử parse text thành JSON
        let messageData;
        try {
          messageData = JSON.parse(text);
        } catch (e) {
          messageData = text;
        }
        
        this.messageListeners.forEach(listener => {
          if (typeof listener === 'function') {
            listener(messageData, peerId);
          } else if (typeof listener.onPeerMessage === 'function') {
            listener.onPeerMessage(messageData, peerId);
          }
        });
      } catch (error) {
        console.error('Error processing peer message:', error);
      }
    });
  }

  // Thiết lập các sự kiện cho kênh
  _setupChannelListeners() {
    if (!this.channel) return;

    this.channel.on('ChannelMessage', ({ text }, senderId) => {
      console.log('Channel message from:', senderId, text);
      
      try {
        // Thử parse text thành JSON
        let messageData;
        try {
          messageData = JSON.parse(text);
        } catch (e) {
          messageData = text;
        }
        
        this.messageListeners.forEach(listener => {
          if (typeof listener === 'function') {
            listener(messageData, senderId);
          } else if (typeof listener.onChannelMessage === 'function') {
            listener.onChannelMessage(messageData, senderId);
          }
        });
      } catch (error) {
        console.error('Error processing channel message:', error);
      }
    });

    this.channel.on('MemberJoined', (memberId) => {
      console.log('Member joined:', memberId);
      this.messageListeners.forEach(listener => {
        if (typeof listener.onMemberJoined === 'function') {
          listener.onMemberJoined(memberId);
        }
      });
    });

    this.channel.on('MemberLeft', (memberId) => {
      console.log('Member left:', memberId);
      this.messageListeners.forEach(listener => {
        if (typeof listener.onMemberLeft === 'function') {
          listener.onMemberLeft(memberId);
        }
      });
    });
  }

  // Xử lý khi mất kết nối
  _handleConnectionLost() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnect attempts reached');
      return;
    }
    
    // Tăng số lần thử kết nối
    this.reconnectAttempts++;
    
    console.log(`Attempting to reconnect RTM (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    // Xóa timer cũ nếu có
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    // Thử kết nối lại sau 2 giây
    this.reconnectTimer = setTimeout(async () => {
      try {
        if (!this.isLoggedIn && this.userId) {
          await this.login(this.userId);
        }
        
        if (this.isLoggedIn && !this.isInChannel && this.channelName) {
          await this.joinChannel(this.channelName);
        }
      } catch (error) {
        console.error('Error in reconnection attempt:', error);
        this._handleConnectionLost(); // Thử lại
      }
    }, 2000);
  }

  // Thêm listener cho tin nhắn
  addMessageListener(listener) {
    if (listener && !this.messageListeners.includes(listener)) {
      this.messageListeners.push(listener);
      console.log('Message listener added, total:', this.messageListeners.length);
    }
  }

  // Xóa listener cho tin nhắn
  removeMessageListener(listener) {
    const index = this.messageListeners.indexOf(listener);
    if (index !== -1) {
      this.messageListeners.splice(index, 1);
      console.log('Message listener removed, remaining:', this.messageListeners.length);
    }
  }

  // Thêm listener cho trạng thái kết nối
  addConnectionListener(listener) {
    if (listener && !this.connectionListeners.includes(listener)) {
      this.connectionListeners.push(listener);
    }
  }

  // Xóa listener cho trạng thái kết nối
  removeConnectionListener(listener) {
    const index = this.connectionListeners.indexOf(listener);
    if (index !== -1) {
      this.connectionListeners.splice(index, 1);
    }
  }

  // Lấy client RTM
  getClient() {
    return this.client;
  }

  // Lấy kênh RTM hiện tại
  getChannel() {
    return this.channel;
  }
  
  // Kiểm tra xem đã kết nối tới kênh chưa
  isConnected() {
    return this.isLoggedIn && this.isInChannel;
  }
  
  // Lấy thông tin của kênh hiện tại
  getChannelInfo() {
    return {
      channelName: this.channelName,
      isConnected: this.isConnected()
    };
  }
}

// Tạo singleton instance
const rtmService = new RTMService();
export default rtmService; 