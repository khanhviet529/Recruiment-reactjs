import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Card, 
  List, 
  Typography, 
  Badge, 
  Button, 
  Tabs, 
  Empty, 
  Spin, 
  Tag, 
  Popconfirm, 
  message, 
  Tooltip
} from 'antd';
import { 
  BellOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined, 
  FileTextOutlined, 
  MessageOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined, 
  ClearOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const NotificationsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Lấy thông báo dành cho người dùng hiện tại
      const response = await axios.get(`http://localhost:5000/notifications?recipient=${user.id}`);
      
      if (response.data) {
        // Sắp xếp thông báo theo thời gian tạo (mới nhất trước)
        const sortedNotifications = response.data.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        setNotifications(sortedNotifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Không thể tải thông báo');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notification) => {
    if (notification.read) return; // Đã đọc rồi thì không cần cập nhật
    
    try {
      const updatedNotification = {
        ...notification,
        read: true,
        readAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await axios.put(`http://localhost:5000/notifications/${notification.id}`, updatedNotification);
      
      // Cập nhật danh sách thông báo
      setNotifications(notifications.map(n => 
        n.id === notification.id ? updatedNotification : n
      ));
      
      message.success('Đã đánh dấu đã đọc');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      message.error('Không thể đánh dấu đã đọc');
    }
  };

  const markAllAsRead = async () => {
    try {
      // Tìm tất cả thông báo chưa đọc
      const unreadNotifications = notifications.filter(n => !n.read);
      
      if (unreadNotifications.length === 0) {
        message.info('Không có thông báo chưa đọc');
        return;
      }
      
      // Cập nhật từng thông báo
      const updatePromises = unreadNotifications.map(notification => {
        const updatedNotification = {
          ...notification,
          read: true,
          readAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return axios.put(`http://localhost:5000/notifications/${notification.id}`, updatedNotification);
      });
      
      await Promise.all(updatePromises);
      
      // Cập nhật danh sách thông báo
      setNotifications(notifications.map(n => 
        !n.read ? {...n, read: true, readAt: new Date().toISOString(), updatedAt: new Date().toISOString()} : n
      ));
      
      message.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      message.error('Không thể đánh dấu tất cả thông báo đã đọc');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`http://localhost:5000/notifications/${notificationId}`);
      
      // Cập nhật danh sách thông báo
      setNotifications(notifications.filter(n => n.id !== notificationId));
      
      message.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Error deleting notification:', error);
      message.error('Không thể xóa thông báo');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      // Xóa từng thông báo
      const deletePromises = notifications.map(notification => 
        axios.delete(`http://localhost:5000/notifications/${notification.id}`)
      );
      
      await Promise.all(deletePromises);
      
      // Cập nhật danh sách thông báo
      setNotifications([]);
      
      message.success('Đã xóa tất cả thông báo');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      message.error('Không thể xóa tất cả thông báo');
    }
  };

  const handleNavigate = (notification) => {
    // Đánh dấu thông báo là đã đọc
    if (!notification.read) {
      markAsRead(notification);
    }
    
    // Chuyển hướng đến link
    navigate(notification.link);
  };

  const filterNotifications = () => {
    if (activeTab === 'all') {
      return notifications;
    } else if (activeTab === 'unread') {
      return notifications.filter(n => !n.read);
    } else if (activeTab === 'read') {
      return notifications.filter(n => n.read);
    } else {
      return notifications.filter(n => n.type === activeTab);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application_status_changed':
        return <Badge status="processing" />;
      case 'application_received':
        return <Badge status="success" />;
      case 'interview_scheduled':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'new_message':
        return <MessageOutlined style={{ color: '#722ed1' }} />;
      case 'new_job_posting':
        return <FileTextOutlined style={{ color: '#52c41a' }} />;
      case 'job_recommendation':
        return <CheckCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <BellOutlined />;
    }
  };

  const getNotificationTypeTag = (type) => {
    let color;
    let text;
    
    switch (type) {
      case 'application_status_changed':
        color = 'blue';
        text = 'Cập nhật trạng thái';
        break;
      case 'application_received':
        color = 'green';
        text = 'Đơn ứng tuyển mới';
        break;
      case 'interview_scheduled':
        color = 'purple';
        text = 'Lịch phỏng vấn';
        break;
      case 'new_message':
        color = 'magenta';
        text = 'Tin nhắn mới';
        break;
      case 'new_job_posting':
        color = 'cyan';
        text = 'Tin tuyển dụng mới';
        break;
      case 'job_recommendation':
        color = 'orange';
        text = 'Gợi ý công việc';
        break;
      default:
        color = 'default';
        text = 'Thông báo';
    }
    
    return <Tag color={color}>{text}</Tag>;
  };

  const getNotificationTabs = () => {
    // Lấy các loại thông báo duy nhất
    const types = [...new Set(notifications.map(n => n.type))];
    
    return (
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        tabBarExtraContent={
          <div>
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={markAllAsRead}
              disabled={notifications.filter(n => !n.read).length === 0}
            >
              Đánh dấu tất cả đã đọc
            </Button>
            <Popconfirm
              title="Xóa tất cả thông báo?"
              description="Bạn có chắc chắn muốn xóa tất cả thông báo không?"
              onConfirm={deleteAllNotifications}
              okText="Có"
              cancelText="Không"
              disabled={notifications.length === 0}
            >
              <Button 
                type="text" 
                danger 
                icon={<ClearOutlined />}
                disabled={notifications.length === 0}
              >
                Xóa tất cả
              </Button>
            </Popconfirm>
          </div>
        }
      >
        <TabPane tab="Tất cả" key="all" />
        <TabPane 
          tab={
            <span>
              Chưa đọc 
              {notifications.filter(n => !n.read).length > 0 && 
                <Badge count={notifications.filter(n => !n.read).length} style={{ marginLeft: 8 }} />
              }
            </span>
          } 
          key="unread" 
        />
        <TabPane tab="Đã đọc" key="read" />
        
        {types.map(type => (
          <TabPane 
            tab={
              <span>
                {getNotificationTypeTag(type)}
              </span>
            } 
            key={type} 
          />
        ))}
      </Tabs>
    );
  };

  const renderNotificationList = () => {
    const filteredNotifications = filterNotifications();
    
    return (
      <List
        itemLayout="horizontal"
        dataSource={filteredNotifications}
        renderItem={item => (
          <List.Item
            actions={[
              <Tooltip title="Xóa thông báo">
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                />
              </Tooltip>,
              !item.read ? (
                <Tooltip title="Đánh dấu đã đọc">
                  <Button 
                    type="text" 
                    icon={<EyeOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(item);
                    }}
                  />
                </Tooltip>
              ) : null
            ]}
            onClick={() => handleNavigate(item)}
            className={`notification-item ${!item.read ? 'unread' : ''}`}
            style={{ 
              background: !item.read ? '#f0f7ff' : 'white',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '8px',
              cursor: 'pointer'
            }}
          >
            <List.Item.Meta
              avatar={getNotificationIcon(item.type)}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>{item.title}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {moment(item.createdAt).fromNow()}
                  </Text>
                </div>
              }
              description={
                <div>
                  <div>{item.message}</div>
                  <div style={{ marginTop: '4px' }}>
                    {getNotificationTypeTag(item.type)}
                    {!item.read && <Badge status="processing" text="Chưa đọc" style={{ marginLeft: '8px' }} />}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
        locale={{
          emptyText: 
            <Empty 
              description={
                <span>
                  Không có thông báo nào
                </span>
              }
            />
        }}
      />
    );
  };

  return (
    <div className="notifications-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Title level={4}>
          <BellOutlined /> Thông báo
          {notifications.filter(n => !n.read).length > 0 && (
            <Badge 
              count={notifications.filter(n => !n.read).length} 
              style={{ marginLeft: 8, backgroundColor: '#1890ff' }} 
            />
          )}
        </Title>
      </div>
      
      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {getNotificationTabs()}
            {renderNotificationList()}
          </>
        )}
      </Card>

      <style jsx>{`
        .notification-item:hover {
          background: #f5f5f5 !important;
        }
        .notification-item.unread:hover {
          background: #e6f7ff !important;
        }
      `}</style>
    </div>
  );
};

export default NotificationsPage; 