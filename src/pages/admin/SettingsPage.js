import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  message, 
  Typography, 
  Upload, 
  Divider, 
  Space,
  Avatar,
  Row,
  Col,
  List,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  UploadOutlined, 
  LockOutlined, 
  MailOutlined,
  SaveOutlined,
  GlobalOutlined,
  BellOutlined,
  SafetyCertificateOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [generalSettingsForm] = Form.useForm();
  const [emailSettingsForm] = Form.useForm();
  const { user } = useSelector((state) => state.auth);
  
  const [currentRoles, setCurrentRoles] = useState([
    { id: 'admin', name: 'Quản trị viên', permissions: ['all'] },
    { id: 'moderator', name: 'Điều hành viên', permissions: ['manage_jobs', 'manage_applications'] },
    { id: 'content_editor', name: 'Biên tập viên', permissions: ['manage_content'] },
    { id: 'employer', name: 'Nhà tuyển dụng', permissions: ['post_jobs', 'manage_applications'] },
    { id: 'applicant', name: 'Ứng viên', permissions: ['apply_jobs', 'manage_profile'] },
  ]);

  useEffect(() => {
    // Load user profile data
    if (user) {
      profileForm.setFieldsValue({
        email: user.email,
        fullName: user.fullName || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
    
    // Load settings data (this would be from API in a real app)
    loadSettings();
  }, [user]);

  const loadSettings = () => {
    // Simulate API call to get system settings
    setTimeout(() => {
      // General settings
      generalSettingsForm.setFieldsValue({
        siteName: 'JobPortal',
        siteDescription: 'Nền tảng tuyển dụng hàng đầu',
        contactEmail: 'contact@jobportal.com',
        maxJobPostings: 100,
        maxApplicationsPerJob: 500,
        maintenanceMode: false
      });
      
      // Email settings
      emailSettingsForm.setFieldsValue({
        smtpHost: 'smtp.example.com',
        smtpPort: '587',
        smtpUsername: 'notifications@jobportal.com',
        smtpPassword: '********',
        emailFrom: 'JobPortal <no-reply@jobportal.com>',
        enableEmailNotifications: true
      });
    }, 500);
  };

  const handleProfileUpdate = async (values) => {
    try {
      setLoading(true);
      // In a real app, make API call to update profile
      // await axios.patch('http://localhost:5000/users/profile', values);
      
      console.log('Updated profile values:', values);
      
      // Simulate API call success
      setTimeout(() => {
        message.success('Hồ sơ của bạn đã được cập nhật thành công');
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Không thể cập nhật hồ sơ');
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      setLoading(true);
      // In a real app, make API call to update password
      // await axios.post('http://localhost:5000/users/change-password', values);
      
      console.log('Password change:', values);
      
      // Simulate API call success
      setTimeout(() => {
        message.success('Mật khẩu đã được thay đổi thành công');
        securityForm.resetFields();
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Không thể thay đổi mật khẩu');
      setLoading(false);
    }
  };

  const handleGeneralSettingsUpdate = async (values) => {
    try {
      setLoading(true);
      // In a real app, make API call to update settings
      // await axios.post('http://localhost:5000/settings/general', values);
      
      console.log('Updated general settings:', values);
      
      // Simulate API call success
      setTimeout(() => {
        message.success('Cài đặt chung đã được cập nhật thành công');
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error updating settings:', error);
      message.error('Không thể cập nhật cài đặt');
      setLoading(false);
    }
  };

  const handleEmailSettingsUpdate = async (values) => {
    try {
      setLoading(true);
      // In a real app, make API call to update email settings
      // await axios.post('http://localhost:5000/settings/email', values);
      
      console.log('Updated email settings:', values);
      
      // Simulate API call success
      setTimeout(() => {
        message.success('Cài đặt email đã được cập nhật thành công');
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error updating email settings:', error);
      message.error('Không thể cập nhật cài đặt email');
      setLoading(false);
    }
  };

  const renderPermissionTags = (permissions) => {
    return permissions.map(permission => {
      let color = 'blue';
      if (permission === 'all') color = 'red';
      
      return (
        <Tag color={color} key={permission} style={{ marginBottom: 5 }}>
          {permission}
        </Tag>
      );
    });
  };

  return (
    <div className="admin-settings-page">
      <Title level={2}>Cài đặt hệ thống</Title>
      
      <Tabs defaultActiveKey="1">
        {/* Account Profile */}
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              Hồ sơ cá nhân
            </span>
          } 
          key="1"
        >
          <Row gutter={24}>
            <Col span={8}>
              <Card>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Avatar 
                    size={100} 
                    icon={<UserOutlined />} 
                    style={{ backgroundColor: '#1890ff' }}
                  />
                  <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
                    {user?.fullName || 'Admin User'}
                  </Title>
                  <Text type="secondary">{user?.email || 'admin@jobportal.com'}</Text>
                  
                  <Divider />
                  
                  <Upload
                    name="avatar"
                    listType="picture"
                    maxCount={1}
                    beforeUpload={() => false}
                  >
                    <Button icon={<UploadOutlined />}>Thay đổi ảnh đại diện</Button>
                  </Upload>
                </div>
              </Card>
            </Col>
            
            <Col span={16}>
              <Card title="Thông tin cá nhân">
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleProfileUpdate}
                >
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="Email" disabled />
                  </Form.Item>
                  
                  <Form.Item
                    name="fullName"
                    label="Họ tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Họ tên" />
                  </Form.Item>
                  
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                  >
                    <Input placeholder="Số điện thoại" />
                  </Form.Item>
                  
                  <Form.Item
                    name="bio"
                    label="Giới thiệu"
                  >
                    <TextArea rows={4} placeholder="Giới thiệu ngắn về bạn" />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      Cập nhật hồ sơ
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        {/* Security Settings */}
        <TabPane 
          tab={
            <span>
              <LockOutlined />
              Bảo mật
            </span>
          } 
          key="2"
        >
          <Card title="Thay đổi mật khẩu">
            <Form
              form={securityForm}
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu hiện tại" />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<LockOutlined />}
                >
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </Card>
          
          <Card title="Phiên đăng nhập" style={{ marginTop: 24 }}>
            <p>Phiên đăng nhập gần đây:</p>
            <List
              itemLayout="horizontal"
              dataSource={[
                {
                  ip: '192.168.1.1',
                  location: 'TP Hồ Chí Minh, Việt Nam',
                  browser: 'Chrome on Windows',
                  time: '2023-05-15 10:30:45',
                  current: true
                },
                {
                  ip: '192.168.1.100',
                  location: 'Hà Nội, Việt Nam',
                  browser: 'Firefox on Mac',
                  time: '2023-05-10 15:22:30',
                  current: false
                }
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <span>
                        {item.browser}
                        {item.current && <Tag color="green" style={{ marginLeft: 8 }}>Phiên hiện tại</Tag>}
                      </span>
                    }
                    description={
                      <div>
                        <p>IP: {item.ip} | {item.location}</p>
                        <p>Thời gian: {item.time}</p>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
        
        {/* System Settings */}
        <TabPane 
          tab={
            <span>
              <GlobalOutlined />
              Cài đặt chung
            </span>
          } 
          key="3"
        >
          <Card title="Cài đặt hệ thống">
            <Form
              form={generalSettingsForm}
              layout="vertical"
              onFinish={handleGeneralSettingsUpdate}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="siteName"
                    label="Tên trang web"
                    rules={[{ required: true, message: 'Vui lòng nhập tên trang web!' }]}
                  >
                    <Input placeholder="Tên trang web" />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="contactEmail"
                    label="Email liên hệ"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email liên hệ!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                  >
                    <Input placeholder="Email liên hệ" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="siteDescription"
                label="Mô tả trang web"
              >
                <TextArea rows={3} placeholder="Mô tả ngắn về trang web" />
              </Form.Item>
              
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="maxJobPostings"
                    label="Giới hạn tin đăng tuyển"
                    rules={[{ required: true, message: 'Vui lòng nhập giới hạn tin đăng tuyển!' }]}
                  >
                    <Input type="number" placeholder="Giới hạn tin đăng tuyển" />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="maxApplicationsPerJob"
                    label="Giới hạn đơn ứng tuyển trên mỗi tin"
                    rules={[{ required: true, message: 'Vui lòng nhập giới hạn đơn ứng tuyển!' }]}
                  >
                    <Input type="number" placeholder="Giới hạn đơn ứng tuyển" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="maintenanceMode"
                label="Chế độ bảo trì"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  Lưu cài đặt
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        {/* Email Settings */}
        <TabPane 
          tab={
            <span>
              <MailOutlined />
              Cài đặt email
            </span>
          } 
          key="4"
        >
          <Card title="Cài đặt email">
            <Form
              form={emailSettingsForm}
              layout="vertical"
              onFinish={handleEmailSettingsUpdate}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="smtpHost"
                    label="SMTP Host"
                    rules={[{ required: true, message: 'Vui lòng nhập SMTP host!' }]}
                  >
                    <Input placeholder="SMTP Host" />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="smtpPort"
                    label="SMTP Port"
                    rules={[{ required: true, message: 'Vui lòng nhập SMTP port!' }]}
                  >
                    <Input placeholder="SMTP Port" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="smtpUsername"
                    label="SMTP Username"
                    rules={[{ required: true, message: 'Vui lòng nhập SMTP username!' }]}
                  >
                    <Input placeholder="SMTP Username" />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="smtpPassword"
                    label="SMTP Password"
                    rules={[{ required: true, message: 'Vui lòng nhập SMTP password!' }]}
                  >
                    <Input.Password placeholder="SMTP Password" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="emailFrom"
                label="Địa chỉ email gửi"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ email gửi!' }]}
              >
                <Input placeholder="Example: JobPortal <no-reply@jobportal.com>" />
              </Form.Item>
              
              <Form.Item
                name="enableEmailNotifications"
                label="Bật thông báo email"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  Lưu cài đặt email
                </Button>
                <Button 
                  style={{ marginLeft: 8 }} 
                  onClick={() => message.info('Gửi email thử nghiệm thành công')}
                >
                  Gửi email thử nghiệm
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        {/* Roles Settings */}
        <TabPane 
          tab={
            <span>
              <TeamOutlined />
              Vai trò & Quyền hạn
            </span>
          } 
          key="5"
        >
          <Card title="Vai trò hệ thống">
            <Paragraph>
              Danh sách các vai trò được định nghĩa trong hệ thống và quyền hạn tương ứng.
            </Paragraph>
            
            <List
              itemLayout="horizontal"
              dataSource={currentRoles}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button key="edit">Chỉnh sửa</Button>
                  ]}
                >
                  <List.Item.Meta
                    title={<strong>{item.name}</strong>}
                    description={
                      <div>
                        <div>ID: {item.id}</div>
                        <div>Quyền hạn: {renderPermissionTags(item.permissions)}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SettingsPage; 