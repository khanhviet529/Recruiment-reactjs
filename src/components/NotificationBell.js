import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Badge, Dropdown, List, Avatar, Button, Spin, Empty, Typography } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const { Text } = Typography;

const NotificationBell = () => {
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const notificationPollRef = useRef(null);

  useEffect(() => {
    // Tải thông báo ban đầu
    fetchNotifications();
    
    // Thiết lập polling để kiểm tra thông báo mới mỗi phút
    notificationPollRef.current = setInterval(() => {
      fetchNotifications(false);
    }, 60000); // 60 giây
    
    return () => {
      // Xóa interval khi component unmount
      if (notificationPollRef.current) {
        clearInterval(notificationPollRef.current);
      }
    };
  }, [user]);

  const fetchNotifications = async (showLoading = true) => {
    if (!user || !user.id) return;
    
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      const response = await axios.get(`http://localhost:5000/notifications?recipient=${user.id}&read=false&_sort=createdAt&_order=desc&_limit=5`);
      
      if (response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleVisibleChange = (flag) => {
    setVisible(flag);
    
    // Nếu mở dropdown, tải lại thông báo để đảm bảo dữ liệu mới nhất
    if (flag) {
      fetchNotifications();
    }
  };

  const markAsRead = async (notification) => {
    try {
      const updatedNotification = {
        ...notification,
        read: true,
        readAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await axios.put(`http://localhost:5000/notifications/${notification.id}`, updatedNotification);
      
      // Tải lại thông báo sau khi đánh dấu đã đọc
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Tìm tất cả thông báo chưa đọc
      const updatePromises = notifications.map(notification => {
        const updatedNotification = {
          ...notification,
          read: true,
          readAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return axios.put(`http://localhost:5000/notifications/${notification.id}`, updatedNotification);
      });
      
      await Promise.all(updatePromises);
      
      // Tải lại thông báo sau khi đánh dấu tất cả đã đọc
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Đánh dấu thông báo là đã đọc
    markAsRead(notification);
    
    // Đóng dropdown
    setVisible(false);
    
    // Chuyển hướng đến đường dẫn trong thông báo
    navigate(notification.link);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application_status_changed':
        return <Avatar style={{ backgroundColor: '#1890ff' }} icon={<BellOutlined />} />;
      case 'application_received':
        return <Avatar style={{ backgroundColor: '#52c41a' }} icon={<BellOutlined />} />;
      case 'interview_scheduled':
        return <Avatar style={{ backgroundColor: '#722ed1' }} icon={<BellOutlined />} />;
      case 'new_message':
        return <Avatar style={{ backgroundColor: '#eb2f96' }} icon={<BellOutlined />} />;
      default:
        return <Avatar icon={<BellOutlined />} />;
    }
  };

  const notificationMenu = (
    <div className="notification-dropdown-menu" style={{ width: 360, maxHeight: 500, overflow: 'auto' }}>
      <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
        <Text strong>Thông báo ({notifications.length})</Text>
        {notifications.length > 0 && (
          <Button 
            type="link" 
            size="small" 
            onClick={markAllAsRead}
            icon={<CheckOutlined />}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>
      
      {loading ? (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <Spin />
        </div>
      ) : (
        <>
          {notifications.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item 
                  onClick={() => handleNotificationClick(item)}
                  style={{ 
                    padding: '10px 16px', 
                    cursor: 'pointer',
                    backgroundColor: '#f0f7ff'
                  }}
                  className="notification-item"
                >
                  <List.Item.Meta
                    avatar={getNotificationIcon(item.type)}
                    title={item.title}
                    description={
                      <div>
                        <div style={{ fontSize: '13px' }}>{item.message}</div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: 4 }}>
                          {moment(item.createdAt).fromNow()}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không có thông báo mới"
              style={{ padding: '20px 0' }}
            />
          )}
          
          <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
            <Button 
              type="link" 
              onClick={() => {
                setVisible(false);
                navigate('/notifications');
              }}
            >
              Xem tất cả
            </Button>
          </div>
        </>
      )}
      
      <style jsx>{`
        .notification-item:hover {
          background-color: #e6f7ff !important;
        }
      `}</style>
    </div>
  );

  return (
    <Dropdown
      overlay={notificationMenu}
      trigger={['click']}
      open={visible}
      onOpenChange={handleVisibleChange}
      placement="bottomRight"
    >
      <Badge count={notifications.length} overflowCount={99}>
        <Button 
          type="text"
          icon={<BellOutlined style={{ fontSize: '20px' }} />}
          style={{ color: '#fff' }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell; 