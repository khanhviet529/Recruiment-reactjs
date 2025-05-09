import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  List, 
  Avatar, 
  Badge, 
  Card, 
  Input, 
  Button, 
  Divider, 
  Typography, 
  Space, 
  Tag, 
  Tooltip, 
  Drawer,
  Form,
  Select,
  message as antMessage,
  Empty,
  Alert,
  Spin
} from 'antd';
import { 
  MessageOutlined, 
  UserOutlined, 
  SendOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const MessagesPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [messageStats, setMessageStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    urgent: 0
  });
  
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    // Apply filters and sort
    let filtered = [...messages];
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(msg => msg.status === filterStatus);
    }
    
    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        msg => 
          msg.subject?.toLowerCase().includes(searchText.toLowerCase()) ||
          msg.message?.toLowerCase().includes(searchText.toLowerCase()) ||
          msg.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
          msg.userEmail?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Sort messages
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      return sortOrder === 'newest' 
        ? dateB - dateA 
        : dateA - dateB;
    });
    
    setFilteredMessages(filtered);
  }, [messages, searchText, filterStatus, sortOrder]);

  // Calculate statistics
  useEffect(() => {
    if (messages.length > 0) {
      const pending = messages.filter(msg => msg.status === 'pending').length;
      const resolved = messages.filter(msg => msg.status === 'resolved').length;
      const urgent = messages.filter(msg => msg.priority === 'high').length;
      
      setMessageStats({
        total: messages.length,
        pending,
        resolved,
        urgent
      });
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get support messages from API
      const response = await axios.get('http://localhost:5000/messages');
      
      // Map the API response to our expected format
      let supportMessages = [];
      
      if (response.data && Array.isArray(response.data)) {
        // Process messages from the database
        supportMessages = await Promise.all(response.data.map(async (msg) => {
          // Get user info for both sender and receiver
          const [senderRes, receiverRes] = await Promise.all([
            axios.get(`http://localhost:5000/users/${msg.sender}`),
            axios.get(`http://localhost:5000/users/${msg.receiver}`)
          ]);
          
          const sender = senderRes.data;
          const receiver = receiverRes.data;
          
          // For support messages, we're interested in 'messages' where one party is admin
          // and the subject contains 'support' or 'help'
          if (
            (sender.role === 'admin' || receiver.role === 'admin') &&
            (msg.content.includes('support') || msg.content.includes('help') || 
             msg.content.includes('hỗ trợ') || msg.content.includes('giúp đỡ'))
          ) {
            // Get message replies
            const repliesRes = await axios.get(`http://localhost:5000/messages?conversationId=${msg.conversationId}`);
            const replies = repliesRes.data
              .filter(reply => reply.id !== msg.id) // Exclude the original message
              .map(reply => ({
                id: reply.id,
                staffName: sender.role === 'admin' ? sender.email : 'Admin',
                message: reply.content,
                createdAt: reply.createdAt
              }));
            
            // Determine if user is sender or receiver
            const isUserSender = sender.role !== 'admin';
            const user = isUserSender ? sender : receiver;
            
            return {
              id: msg.id,
              userName: user.fullName || user.email,
              userEmail: user.email,
              userRole: user.role,
              subject: msg.content.substring(0, 30) + (msg.content.length > 30 ? '...' : ''),
              message: msg.content,
              createdAt: msg.createdAt,
              status: msg.read ? 'resolved' : 'pending',
              priority: msg.relatedTo === 'application' ? 'high' : 'medium',
              replies: replies
            };
          }
          return null;
        }));
        
        // Filter out null values
        supportMessages = supportMessages.filter(msg => msg !== null);
      }
      
      // If there are no actual support messages in the database, provide sample data
      // This is just for development/demo purposes
      if (supportMessages.length === 0) {
        // Simulate messages data for development
        supportMessages = [
          {
            id: '1',
            userName: 'Nguyễn Văn A',
            userEmail: 'nguyenvana@example.com',
            userRole: 'applicant',
            subject: 'Không thể nộp đơn ứng tuyển',
            message: 'Tôi không thể nộp đơn ứng tuyển cho vị trí Developer tại Công ty XYZ. Hệ thống báo lỗi khi tôi nhấn nút Nộp đơn.',
            createdAt: '2023-05-15T09:30:00.000Z',
            status: 'pending',
            priority: 'medium',
            replies: []
          },
          {
            id: '2',
            userName: 'Trần Thị B',
            userEmail: 'tranthib@example.com',
            userRole: 'employer',
            subject: 'Cần hỗ trợ đăng tin tuyển dụng',
            message: 'Tôi đã cố gắng đăng tin tuyển dụng mới nhưng không thể tải lên logo công ty. Có thể giúp tôi kiểm tra vấn đề không?',
            createdAt: '2023-05-14T14:22:00.000Z',
            status: 'pending',
            priority: 'high',
            replies: []
          },
          {
            id: '3',
            userName: 'Lê Văn C',
            userEmail: 'levanc@example.com',
            userRole: 'applicant',
            subject: 'Vấn đề với trang hồ sơ',
            message: 'Trang hồ sơ của tôi không hiển thị đúng thông tin học vấn. Tôi đã cập nhật nhiều lần nhưng dữ liệu không được lưu.',
            createdAt: '2023-05-13T10:15:00.000Z',
            status: 'resolved',
            priority: 'medium',
            replies: [
              {
                id: 'r1',
                staffName: 'Admin',
                message: 'Chúng tôi đã kiểm tra và khắc phục lỗi. Vui lòng thử cập nhật lại thông tin hồ sơ của bạn.',
                createdAt: '2023-05-13T14:30:00.000Z'
              }
            ]
          },
          {
            id: '4',
            userName: 'Phạm Thị D',
            userEmail: 'phamthid@example.com',
            userRole: 'employer',
            subject: 'Thanh toán gói dịch vụ đăng tin',
            message: 'Tôi đã thanh toán gói dịch vụ đăng tin cao cấp nhưng tài khoản vẫn chưa được nâng cấp. Mã giao dịch: TX123456789',
            createdAt: '2023-05-12T08:40:00.000Z',
            status: 'pending',
            priority: 'high',
            replies: []
          },
          {
            id: '5',
            userName: 'Hoàng Văn E',
            userEmail: 'hoangvane@example.com',
            userRole: 'applicant',
            subject: 'Không nhận được email thông báo',
            message: 'Tôi không nhận được email thông báo khi có tin tuyển dụng mới phù hợp với kỹ năng của tôi. Đã kiểm tra hòm thư rác nhưng không thấy.',
            createdAt: '2023-05-11T15:20:00.000Z',
            status: 'resolved',
            priority: 'low',
            replies: [
              {
                id: 'r2',
                staffName: 'Admin',
                message: 'Chúng tôi đã kiểm tra cài đặt email của bạn và đã gửi lại thông báo. Vui lòng kiểm tra hòm thư và xác nhận bạn đã nhận được thông báo.',
                createdAt: '2023-05-11T16:45:00.000Z'
              }
            ]
          }
        ];
      }
      
      setMessages(supportMessages);
      setFilteredMessages(supportMessages);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Không thể tải danh sách tin nhắn hỗ trợ. Vui lòng thử lại sau.');
      antMessage.error('Không thể tải danh sách tin nhắn hỗ trợ');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleFilterChange = (value) => {
    setFilterStatus(value);
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
  };

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    
    // Mark as read (only if not already read)
    if (message.status === 'pending') {
      markMessageAsRead(message.id);
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      // In a real app, send to backend
      await axios.patch(`http://localhost:5000/messages/${messageId}`, {
        read: true
      });
      
      // Update local state
      const updatedMessages = messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'resolved' } 
          : msg
      );
      
      setMessages(updatedMessages);
      
    } catch (error) {
      console.error('Error marking message as read:', error);
      // Continue without showing error to user
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    try {
      // Get currently logged in admin user
      const adminId = 1; // Replace with actual admin ID from auth state
      
      // Create new message in the database
      const replyData = {
        sender: adminId,
        receiver: selectedMessage.userId || 3, // Fallback to a default if userId not available
        content: replyText,
        conversationId: selectedMessage.conversationId || `${adminId}_${selectedMessage.userId || 3}`,
        relatedTo: selectedMessage.relatedTo || 'support',
        relatedId: selectedMessage.relatedId || selectedMessage.id,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      const response = await axios.post('http://localhost:5000/messages', replyData);
      
      // Create local reply object for UI update
      const newReply = {
        id: response.data?.id || `r${Date.now()}`,
        staffName: 'Admin',
        message: replyText,
        createdAt: new Date().toISOString()
      };
      
      // Also update the status of the original message to resolved
      if (selectedMessage.status !== 'resolved') {
        await markMessageAsRead(selectedMessage.id);
      }
      
      // Update local state with new reply
      const updatedMessages = messages.map(msg => 
        msg.id === selectedMessage.id 
          ? { 
              ...msg, 
              replies: [...msg.replies, newReply],
              status: 'resolved'
            } 
          : msg
      );
      
      setMessages(updatedMessages);
      setSelectedMessage({
        ...selectedMessage, 
        replies: [...selectedMessage.replies, newReply],
        status: 'resolved'
      });
      
      setReplyText('');
      antMessage.success('Đã gửi phản hồi thành công');
      
    } catch (error) {
      console.error('Error sending reply:', error);
      antMessage.error('Không thể gửi phản hồi. Vui lòng thử lại.');
    }
  };

  const showDrawer = () => {
    setDrawerVisible(true);
    form.resetFields();
  };
  
  const closeDrawer = () => {
    setDrawerVisible(false);
  };
  
  const handleFormSubmit = async (values) => {
    try {
      if (!selectedMessage) return;
      
      // In a real app, send to backend
      await axios.patch(`http://localhost:5000/messages/${selectedMessage.id}`, {
        // Map our status to message's read field
        read: values.status === 'resolved',
        // Store priority in some custom field or metadata if your API supports it
        // priority: values.priority
      });
      
      antMessage.success('Đã cập nhật trạng thái tin nhắn');
      
      // Update local state
      const updatedMessages = messages.map(msg => 
        msg.id === selectedMessage.id 
          ? { ...msg, status: values.status, priority: values.priority } 
          : msg
      );
      
      setMessages(updatedMessages);
      setSelectedMessage({...selectedMessage, status: values.status, priority: values.priority});
      
      closeDrawer();
    } catch (error) {
      console.error('Error updating message status:', error);
      antMessage.error('Không thể cập nhật trạng thái tin nhắn');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <Tag icon={<ClockCircleOutlined />} color="warning">Đang xử lý</Tag>;
      case 'resolved':
        return <Tag icon={<CheckCircleOutlined />} color="success">Đã giải quyết</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };
  
  const getPriorityTag = (priority) => {
    switch (priority) {
      case 'high':
        return <Tag color="error">Cao</Tag>;
      case 'medium':
        return <Tag color="warning">Trung bình</Tag>;
      case 'low':
        return <Tag color="blue">Thấp</Tag>;
      default:
        return <Tag color="default">{priority}</Tag>;
    }
  };

  return (
    <div className="admin-messages-page">
      <Title level={2}>Tin nhắn hỗ trợ</Title>
      
      {/* Statistics summary */}
      <div className="message-stats mb-4">
        <Space size="large">
          <Badge count={messageStats.total} overflowCount={999} style={{ backgroundColor: '#1890ff' }}>
            <Text strong>Tổng tin nhắn</Text>
          </Badge>
          
          <Badge count={messageStats.pending} overflowCount={999} style={{ backgroundColor: '#faad14' }}>
            <Text strong>Đang xử lý</Text>
          </Badge>
          
          <Badge count={messageStats.resolved} overflowCount={999} style={{ backgroundColor: '#52c41a' }}>
            <Text strong>Đã giải quyết</Text>
          </Badge>
          
          <Badge count={messageStats.urgent} overflowCount={999} style={{ backgroundColor: '#f5222d' }}>
            <Text strong>Cần xử lý gấp</Text>
          </Badge>
        </Space>
      </div>
      
      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      
      <div className="message-actions mb-3">
        <Space size="middle">
          <Input.Search
            placeholder="Tìm kiếm tin nhắn"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          
          <Select
            defaultValue="all"
            style={{ width: 160 }}
            onChange={handleFilterChange}
            placeholder="Lọc theo trạng thái"
          >
            <Option value="all">Tất cả</Option>
            <Option value="pending">Đang xử lý</Option>
            <Option value="resolved">Đã giải quyết</Option>
          </Select>
          
          <Select
            defaultValue="newest"
            style={{ width: 160 }}
            onChange={handleSortChange}
            placeholder="Sắp xếp"
          >
            <Option value="newest">Mới nhất</Option>
            <Option value="oldest">Cũ nhất</Option>
          </Select>
          
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchMessages}
          >
            Làm mới
          </Button>
        </Space>
      </div>
      
      <div className="message-container">
        <Card style={{ display: 'flex', flexDirection: 'row', padding: 0, height: 'calc(100vh - 280px)' }}>
          {/* Message list */}
          <div className="message-list" style={{ width: '30%', borderRight: '1px solid #f0f0f0', overflow: 'auto' }}>
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={filteredMessages}
              locale={{
                emptyText: <Empty description="Không có tin nhắn nào" />
              }}
              renderItem={item => (
                <List.Item 
                  onClick={() => handleSelectMessage(item)}
                  style={{ 
                    padding: '12px 16px', 
                    cursor: 'pointer',
                    backgroundColor: selectedMessage?.id === item.id ? '#f0f7ff' : 'transparent',
                    borderLeft: selectedMessage?.id === item.id ? '3px solid #1890ff' : '3px solid transparent'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        dot 
                        color={item.status === 'pending' ? '#faad14' : '#52c41a'}
                        offset={[0, 28]}
                      >
                        <Avatar icon={<UserOutlined />} />
                      </Badge>
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: item.status === 'pending' ? 'bold' : 'normal' }}>
                          {item.subject}
                        </span>
                        {item.priority === 'high' && (
                          <ExclamationCircleOutlined style={{ color: '#f5222d' }} />
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <div>{item.userName} - {formatDate(item.createdAt)}</div>
                        <div>
                          {getStatusTag(item.status)}
                          {' '}
                          {getPriorityTag(item.priority)}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
          
          {/* Message detail */}
          <div className="message-detail" style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
            {selectedMessage ? (
              <>
                <div className="message-detail-header" style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <Title level={4}>{selectedMessage.subject}</Title>
                    <Button 
                      type="primary" 
                      onClick={showDrawer}
                    >
                      Cập nhật trạng thái
                    </Button>
                  </div>
                  <div className="message-meta">
                    <Space size="large">
                      <Text>
                        <UserOutlined style={{ marginRight: 8 }} />
                        {selectedMessage.userName} ({selectedMessage.userEmail})
                      </Text>
                      <Text type="secondary">
                        {formatDate(selectedMessage.createdAt)}
                      </Text>
                      {getStatusTag(selectedMessage.status)}
                      {getPriorityTag(selectedMessage.priority)}
                    </Space>
                  </div>
                </div>
                
                <div className="message-detail-content" style={{ padding: '16px 24px', flex: 1, overflow: 'auto' }}>
                  <Card style={{ marginBottom: 16 }}>
                    <Paragraph>{selectedMessage.message}</Paragraph>
                  </Card>
                  
                  {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                    <div className="message-replies">
                      <Divider orientation="left">Phản hồi</Divider>
                      {selectedMessage.replies.map(reply => (
                        <Card key={reply.id} style={{ marginBottom: 16, backgroundColor: '#f6ffed' }}>
                          <div className="reply-header" style={{ marginBottom: 8 }}>
                            <Space>
                              <Text strong>{reply.staffName}</Text>
                              <Text type="secondary">{formatDate(reply.createdAt)}</Text>
                            </Space>
                          </div>
                          <Paragraph>{reply.message}</Paragraph>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="message-reply-form" style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0' }}>
                  <TextArea
                    rows={4}
                    placeholder="Nhập phản hồi của bạn..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    style={{ marginBottom: 16 }}
                  />
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />}
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                  >
                    Gửi phản hồi
                  </Button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Empty 
                  description="Chọn một tin nhắn để xem chi tiết" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Update status drawer */}
      <Drawer
        title="Cập nhật trạng thái tin nhắn"
        width={400}
        onClose={closeDrawer}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={closeDrawer}>Hủy</Button>
            <Button type="primary" onClick={() => form.submit()}>
              Lưu
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: selectedMessage?.status || 'pending',
            priority: selectedMessage?.priority || 'medium'
          }}
          onFinish={handleFormSubmit}
        >
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              <Option value="pending">Đang xử lý</Option>
              <Option value="resolved">Đã giải quyết</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="priority"
            label="Mức độ ưu tiên"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên!' }]}
          >
            <Select>
              <Option value="low">Thấp</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Ghi chú nội bộ"
          >
            <TextArea rows={4} placeholder="Nhập ghi chú nội bộ (sẽ không hiển thị cho người dùng)" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default MessagesPage;
