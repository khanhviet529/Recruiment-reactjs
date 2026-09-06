import axios from 'axios';

// Configuration
const API_BASE_URL = 'http://localhost:5000';
const NOTIFICATION_TYPES = {
  APPLICATION_STATUS_CHANGED: 'application_status_changed',
  APPLICATION_RECEIVED: 'application_received',
  MEETING_REMINDER: 'meeting_reminder',
  MEETING_INVITATION: 'meeting_invitation',
  JOB_POSTED: 'job_posted',
  PROFILE_UPDATED: 'profile_updated',
  SYSTEM_NOTIFICATION: 'system_notification'
};

export const notificationService = {
  // Get all notifications for a user
  getNotifications: async (userId, options = {}) => {
    try {
      const {
        read = undefined,
        limit = 50,
        offset = 0,
        type = undefined
      } = options;

      let url = `${API_BASE_URL}/notifications?recipient=${userId}&_sort=createdAt&_order=desc`;
      
      if (read !== undefined) {
        url += `&read=${read}`;
      }
      
      if (type) {
        url += `&type=${type}`;
      }
      
      if (limit) {
        url += `&_limit=${limit}`;
      }
      
      if (offset) {
        url += `&_start=${offset}`;
      }

      const response = await axios.get(url);
      return {
        success: true,
        data: response.data || [],
        total: parseInt(response.headers['x-total-count'] || response.data.length)
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch notifications',
        data: []
      };
    }
  },

  // Get unread notifications count
  getUnreadCount: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications?recipient=${userId}&read=false&_limit=0`);
      return {
        success: true,
        count: parseInt(response.headers['x-total-count'] || 0)
      };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return {
        success: false,
        count: 0,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/notifications/${notificationId}`, {
        read: true,
        readAt: new Date().toISOString()
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Mark multiple notifications as read
  markMultipleAsRead: async (notificationIds) => {
    try {
      const promises = notificationIds.map(id => 
        notificationService.markAsRead(id)
      );
      
      await Promise.all(promises);
      
      return {
        success: true,
        message: `Marked ${notificationIds.length} notifications as read`
      };
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Mark all notifications as read for a user
  markAllAsRead: async (userId) => {
    try {
      // First get all unread notifications
      const unreadResponse = await notificationService.getNotifications(userId, { read: false });
      
      if (!unreadResponse.success || unreadResponse.data.length === 0) {
        return {
          success: true,
          message: 'No unread notifications'
        };
      }

      // Mark all as read
      const notificationIds = unreadResponse.data.map(notification => notification.id);
      return await notificationService.markMultipleAsRead(notificationIds);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Create a new notification
  createNotification: async (notificationData) => {
    try {
      const notification = {
        ...notificationData,
        read: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await axios.post(`${API_BASE_URL}/notifications`, notification);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Helper methods for specific notification types
  createApplicationStatusNotification: async (candidateId, applicationId, jobId, status, jobTitle, companyName) => {
    const statusMessages = {
      'reviewing': 'đã chuyển sang trạng thái "Đang xem xét"',
      'interviewing': 'đã chuyển sang trạng thái "Phỏng vấn"',
      'hired': 'đã được chấp nhận! Chúc mừng bạn',
      'rejected': 'đã bị từ chối'
    };

    const message = statusMessages[status] || `đã chuyển sang trạng thái "${status}"`;

    return await notificationService.createNotification({
      recipient: candidateId,
      type: NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED,
      title: 'Trạng thái ứng tuyển đã thay đổi',
      message: `Đơn ứng tuyển của bạn cho vị trí ${jobTitle} tại ${companyName} ${message}.`,
      data: {
        applicationId,
        jobId,
        status
      },
      link: `/candidate/applications/${applicationId}`
    });
  },

  createApplicationReceivedNotification: async (employerId, applicationId, jobId, candidateName, jobTitle) => {
    return await notificationService.createNotification({
      recipient: employerId,
      type: NOTIFICATION_TYPES.APPLICATION_RECEIVED,
      title: 'Đơn ứng tuyển mới',
      message: `Bạn đã nhận được đơn ứng tuyển mới cho vị trí ${jobTitle} từ ${candidateName}.`,
      data: {
        applicationId,
        jobId,
        candidateName
      },
      link: `/employer/applications/${applicationId}`
    });
  },

  createMeetingReminderNotification: async (userId, meetingId, meetingTitle, startTime) => {
    const timeUntilMeeting = new Date(startTime) - new Date();
    const hoursUntilMeeting = Math.round(timeUntilMeeting / (1000 * 60 * 60));

    return await notificationService.createNotification({
      recipient: userId,
      type: NOTIFICATION_TYPES.MEETING_REMINDER,
      title: 'Nhắc nhở cuộc họp',
      message: `Bạn có cuộc họp "${meetingTitle}" sắp diễn ra trong ${hoursUntilMeeting} giờ nữa.`,
      data: {
        meetingId,
        startTime
      },
      link: `/meetings/${meetingId}`
    });
  },

  createMeetingInvitationNotification: async (userId, meetingId, meetingTitle, organizerName, startTime) => {
    return await notificationService.createNotification({
      recipient: userId,
      type: NOTIFICATION_TYPES.MEETING_INVITATION,
      title: 'Lời mời tham gia cuộc họp',
      message: `${organizerName} đã mời bạn tham gia cuộc họp "${meetingTitle}" vào ${new Date(startTime).toLocaleString('vi-VN')}.`,
      data: {
        meetingId,
        organizerName,
        startTime
      },
      link: `/meetings/${meetingId}`
    });
  },

  createJobPostedNotification: async (candidateId, jobId, jobTitle, companyName) => {
    return await notificationService.createNotification({
      recipient: candidateId,
      type: NOTIFICATION_TYPES.JOB_POSTED,
      title: 'Công việc mới phù hợp',
      message: `Có công việc mới "${jobTitle}" tại ${companyName} có thể phù hợp với bạn.`,
      data: {
        jobId,
        companyName
      },
      link: `/candidate/jobs/${jobId}`
    });
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`);
      return {
        success: true,
        message: 'Notification deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Delete multiple notifications
  deleteMultiple: async (notificationIds) => {
    try {
      const promises = notificationIds.map(id => 
        notificationService.deleteNotification(id)
      );
      
      await Promise.all(promises);
      
      return {
        success: true,
        message: `Deleted ${notificationIds.length} notifications`
      };
    } catch (error) {
      console.error('Error deleting multiple notifications:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get notification preferences for a user (placeholder for future implementation)
  getPreferences: async (userId) => {
    try {
      // This would typically fetch user's notification preferences from the backend
      // For now, returning default preferences
      return {
        success: true,
        data: {
          email: true,
          push: true,
          applicationUpdates: true,
          meetingReminders: true,
          jobRecommendations: true,
          marketingEmails: false
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  },

  // Update notification preferences (placeholder for future implementation)
  updatePreferences: async (userId, preferences) => {
    try {
      // This would typically update user's notification preferences in the backend
      console.log('Updating notification preferences for user:', userId, preferences);
      
      return {
        success: true,
        message: 'Preferences updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Real-time notification polling (simple implementation)
  startPolling: (userId, callback, intervalMs = 30000) => {
    let lastNotificationTime = new Date().toISOString();
    
    const poll = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/notifications?recipient=${userId}&createdAt_gte=${lastNotificationTime}&_sort=createdAt&_order=desc`
        );
        
        const newNotifications = response.data || [];
        
        if (newNotifications.length > 0) {
          lastNotificationTime = new Date().toISOString();
          callback(newNotifications);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Start polling
    const intervalId = setInterval(poll, intervalMs);
    
    // Return cleanup function
    return () => {
      clearInterval(intervalId);
    };
  },

  // Format notification for display
  formatNotification: (notification) => {
    const createdAt = new Date(notification.createdAt);
    const now = new Date();
    const diffInMs = now - createdAt;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    let timeAgo;
    if (diffInMinutes < 1) {
      timeAgo = 'Vừa xong';
    } else if (diffInMinutes < 60) {
      timeAgo = `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      timeAgo = `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      timeAgo = `${diffInDays} ngày trước`;
    } else {
      timeAgo = createdAt.toLocaleDateString('vi-VN');
    }

    return {
      ...notification,
      timeAgo,
      formattedDate: createdAt.toLocaleString('vi-VN')
    };
  }
};

// Export notification types for use in other modules
export { NOTIFICATION_TYPES };

export default notificationService;


