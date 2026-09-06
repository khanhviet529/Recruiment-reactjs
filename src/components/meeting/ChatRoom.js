import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { FaPaperPlane, FaUser, FaTimes } from 'react-icons/fa';
import './ChatRoom.scss';

const ChatRoom = ({ rtmClient, channel, user, isConnected, channelName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef(null);
  const messageListenerRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    // Function to add system message
    const addSystemMessage = (text) => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: `system-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          sender: 'system',
          text,
          timestamp: Date.now(),
          isSystem: true
        }
      ]);
    };

    // Function to handle channel messages
    const handleChannelMessage = (messageData, senderId) => {
      try {
        console.log("Received channel message:", messageData, "from:", senderId);
        
        // Get message text based on format
        let text, senderName, timestamp;
        
        if (typeof messageData === 'string') {
          text = messageData;
          senderName = senderId;
          timestamp = Date.now();
        } else {
          text = messageData.text || 'Unknown message';
          senderName = messageData.senderName || senderId;
          timestamp = messageData.timestamp || Date.now();
        }
        
        // Add the message to state
        const newMsg = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          sender: senderId,
          senderName: senderName,
          text: text,
          timestamp: timestamp,
          isMine: senderId === user?.id?.toString()
        };
        
        console.log("Processed incoming message:", newMsg);
        setMessages(prevMessages => [...prevMessages, newMsg]);
      } catch (error) {
        console.error('Error handling channel message:', error);
      }
    };

    // Setup RTM message listener
    const setupRTMListener = () => {
      if (!rtmClient || !channel) {
        console.log("RTM not initialized:", { rtmClient, channel });
        setError('Đang chờ kết nối chat...');
        return false;
      }

      if (!isConnected) {
        console.log("RTM not connected");
        setError('Đang kết nối tới chat...');
        return false;
      }

      console.log("Setting up RTM message listener");

      // Create listener object
      const messageListener = {
        onChannelMessage: handleChannelMessage,
        onMemberJoined: (memberId) => {
          console.log(`Member joined: ${memberId}`);
          addSystemMessage(`${memberId} đã tham gia chat`);
        },
        onMemberLeft: (memberId) => {
          console.log(`Member left: ${memberId}`);
          addSystemMessage(`${memberId} đã rời khỏi chat`);
        }
      };

      // Store listener to allow removal later
      messageListenerRef.current = messageListener;
      
      // Add the listener
      channel.on('ChannelMessage', handleChannelMessage);

      // Add initial system message
      addSystemMessage(`Bạn đã tham gia kênh chat '${channelName || 'cuộc họp'}'`);
      
      // Clear any errors
      setError('');
      return true;
    };

    // Attempt to set up RTM listener with retries
    if (!setupRTMListener() && retryCount < 5) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setupRTMListener();
      }, 2000); // retry after 2 second
      
      return () => clearTimeout(timer);
    }

    // Cleanup function to remove listeners
    return () => {
      if (channel && channel.off && messageListenerRef.current) {
        console.log("Removing RTM message listener");
        channel.off('ChannelMessage', handleChannelMessage);
      }
    };
  }, [rtmClient, channel, isConnected, channelName, user, retryCount]);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    if (!isConnected || !channel) {
      setError('Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối.');
      return;
    }

    try {
      // Create message data object
      const messageData = {
        text: newMessage.trim(),
        senderName: user?.firstName || user?.name || user?.id || 'Bạn',
        timestamp: Date.now()
      };

      console.log("Sending message:", messageData);
      
      // Add to local messages first for immediate feedback
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: messageId,
          sender: user?.id?.toString() || 'local-user',
          senderName: messageData.senderName,
          text: messageData.text,
          timestamp: messageData.timestamp,
          isMine: true
        }
      ]);
      
      // Clear input now for better UX
      setNewMessage('');
      
      // Send message via RTM
      await channel.sendMessage({ text: JSON.stringify(messageData) });
      console.log("Message sent successfully");
    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Không thể gửi tin nhắn: ${error.message || 'Lỗi kết nối'}`);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle close button for chat popup
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h5>Chat</h5>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
        </div>
        <button className="chat-close-btn" onClick={handleClose}>
          <FaTimes />
        </button>
      </div>
      
      {error && <Alert variant="danger" className="chat-error">{error}</Alert>}
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>Chưa có tin nhắn</p>
            <p className="text-muted">Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          messages.map(message => (
            <div 
              key={message.id}
              className={`message ${message.isMine ? 'my-message' : ''} ${message.isSystem ? 'system-message' : ''}`}
            >
              {!message.isSystem && !message.isMine && (
                <div className="message-sender">
                  <FaUser />
                  <span>{message.senderName || message.sender}</span>
                </div>
              )}
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <Form className="message-form" onSubmit={sendMessage}>
        <Form.Group className="message-input-group">
          <Form.Control
            type="text"
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!isConnected}
          />
          <Button 
            variant="primary" 
            type="submit" 
            disabled={!isConnected || !newMessage.trim()}
          >
            <FaPaperPlane />
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default ChatRoom; 