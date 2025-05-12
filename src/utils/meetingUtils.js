/**
 * Meeting utilities for consistent handling of meeting data
 */

/**
 * Categorize meetings by status based on time
 * @param {Array} meetings - Array of meeting objects
 * @returns {Object} Object with categorized meetings
 */
export const categorizeMeetings = (meetings) => {
  // Use current time for comparison
  const now = new Date();
  
  const upcoming = meetings.filter(meeting => {
    const startTime = new Date(meeting.startTime);
    // If startTime is in the future, it should always be upcoming regardless of status
    // unless explicitly cancelled
    return startTime > now && meeting.status !== 'cancelled';
  });
  
  const ongoing = meetings.filter(meeting => {
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(meeting.endTime);
    return now >= startTime && now <= endTime && meeting.status !== 'cancelled';
  });
  
  const past = meetings.filter(meeting => {
    const endTime = new Date(meeting.endTime);
    // A meeting is past if it's endTime is before now or if it's explicitly marked as cancelled
    return endTime < now || meeting.status === 'cancelled' || meeting.status === 'completed';
  });
  
  return { upcoming, ongoing, past };
};

/**
 * Format date and time in Vietnamese locale with Vietnam timezone
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'Không xác định';
  
  try {
    // Chuyển đổi thời gian sang giờ Việt Nam (UTC+7)
    const date = new Date(dateString);
    
    // Tạo options cho định dạng Việt Nam
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh'
    };
    
    // Định dạng ngày giờ theo kiểu Việt Nam
    return new Intl.DateTimeFormat('vi-VN', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Không xác định';
  }
};

/**
 * Format remaining time until meeting starts
 * @param {string} startTimeString - ISO date string
 * @returns {string} Formatted time remaining
 */
export const formatTimeRemaining = (startTimeString) => {
  if (!startTimeString) return 'Không xác định';
  
  try {
    // Use Vietnam time for current time
    const now = new Date();
    const startTime = new Date(startTimeString);
    
    // Tính khoảng thời gian còn lại (ms)
    const timeRemaining = startTime - now;
    
    if (timeRemaining <= 0) {
      return 'Đang diễn ra';
    }
    
    // Chuyển đổi ms sang ngày, giờ, phút
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `Còn ${days} ngày ${hours} giờ`;
    } else if (hours > 0) {
      return `Còn ${hours} giờ ${minutes} phút`;
    } else {
      return `Còn ${minutes} phút`;
    }
  } catch (error) {
    console.error('Error calculating time remaining:', error);
    return 'Không xác định';
  }
};

/**
 * Calculate meeting duration in minutes
 * @param {string} startTimeString - ISO date string
 * @param {string} endTimeString - ISO date string
 * @returns {number} Duration in minutes
 */
export const calculateDuration = (startTimeString, endTimeString) => {
  if (!startTimeString || !endTimeString) return 0;
  
  try {
    const startTime = new Date(startTimeString);
    const endTime = new Date(endTimeString);
    
    // Tính thời lượng (ms) và chuyển sang phút
    const durationMs = endTime - startTime;
    return Math.round(durationMs / (1000 * 60));
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 0;
  }
};

/**
 * Return appropriate status badge for meeting
 * @param {string} status - Meeting status
 * @returns {string} Badge variant name
 */
export const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'scheduled':
      return 'primary';
    case 'ongoing':
      return 'success';
    case 'completed':
      return 'secondary';
    case 'cancelled':
      return 'danger';
    default:
      return 'info';
  }
};

/**
 * Filter meetings based on user role and ID
 * @param {Array} meetings - Array of meeting objects
 * @param {Object} user - User object with role and ID
 * @returns {Array} Filtered meetings
 */
export const filterMeetingsByUser = (meetings, user) => {
  if (!user || !meetings) return [];
  
  return meetings.filter(meeting => {
    // Kiểm tra nếu người dùng là người tạo cuộc họp
    if (meeting.createdBy && (meeting.createdBy.id === user.id || meeting.createdBy.email === user.email)) {
      return true;
    }
    
    // Kiểm tra nếu người dùng là người tham gia
    if (meeting.participants && meeting.participants.length > 0) {
      return meeting.participants.some(participant => 
        participant.userId === user.id || 
        participant.email === user.email ||
        (participant.name && user.name && participant.name.includes(user.name))
      );
    }
    
    // Kiểm tra nếu ID người dùng nằm trong candidateIds
    if (meeting.candidateIds && meeting.candidateIds.includes(user.id)) {
      return true;
    }
    
    // Nếu là nhà tuyển dụng, kiểm tra jobEmployerId
    if (user.role === 'employer' && meeting.jobEmployerId === user.id) {
      return true;
    }
    
    return false;
  });
};

/**
 * Convert date string from UTC to Vietnam time
 * @param {string} dateString - ISO date string
 * @returns {Date} Converted date object
 */
export const convertToVietnamTime = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    
    // Tạo options cho định dạng Việt Nam
    const options = {
      timeZone: 'Asia/Ho_Chi_Minh'
    };
    
    // Trả về đối tượng Date đã được chuyển đổi sang múi giờ Việt Nam
    const vietnamDateString = new Intl.DateTimeFormat('en-US', options).format(date);
    return new Date(vietnamDateString);
  } catch (error) {
    console.error('Error converting to Vietnam time:', error);
    return null;
  }
};

/**
 * Format date for input datetime-local
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date for input
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Chuyển đổi sang múi giờ Việt Nam (UTC+7)
    const vietnamDate = new Date(date.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
    
    // Format: YYYY-MM-DDThh:mm
    return vietnamDate.toISOString().slice(0, 16);
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
}; 