import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, 
  Button, 
  Space, 
  Popconfirm, 
  message, 
  Tag, 
  Input,
  Select,
  Card,
  Drawer,
  Form,
  Typography,
  Badge,
  Tabs,
  Modal,
  Tooltip 
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  SearchOutlined,
  UserAddOutlined,
  FilterOutlined,
  EyeOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [roles, setRoles] = useState([
    { id: 'admin', name: 'Quản trị viên', permissions: ['all'] },
    { id: 'moderator', name: 'Điều hành viên', permissions: ['manage_jobs', 'manage_applications'] },
    { id: 'content_editor', name: 'Biên tập viên', permissions: ['manage_content'] },
    { id: 'employer', name: 'Nhà tuyển dụng', permissions: ['post_jobs', 'manage_applications'] },
    { id: 'applicant', name: 'Ứng viên', permissions: ['apply_jobs', 'manage_profile'] },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        (user.fullName && user.fullName.toLowerCase().includes(searchText.toLowerCase())) ||
        (user.role && user.role.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchText, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/users');
      
      if (response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/users/${userId}/status`, {
        status: newStatus
      });
      
      message.success(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'khóa'} tài khoản người dùng`);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
      message.error('Không thể cập nhật trạng thái người dùng');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`http://localhost:5000/users/${userId}/role`, {
        role: newRole
      });
      
      message.success(`Đã cập nhật vai trò người dùng thành ${newRole}`);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
      message.error('Không thể cập nhật vai trò người dùng');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/users/${userId}`);
      message.success('Đã xóa người dùng thành công');
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Không thể xóa người dùng');
    }
  };

  const showDrawer = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({
        email: user.email,
        fullName: user.fullName || '',
        phone: user.phone || '',
        role: user.role,
        status: user.status
      });
    } else {
      form.resetFields();
    }
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleFormSubmit = async (values) => {
    try {
      if (editingUser) {
        // Update existing user
        await axios.patch(`http://localhost:5000/users/${editingUser.id}`, values);
        message.success('Cập nhật người dùng thành công');
        
        // Update local state
        setUsers(users.map(user => 
          user.id === editingUser.id ? { ...user, ...values } : user
        ));
      } else {
        // Create new user
        const response = await axios.post('http://localhost:5000/users', values);
        message.success('Thêm người dùng mới thành công');
        
        // Update local state
        setUsers([...users, response.data]);
      }
      closeDrawer();
    } catch (error) {
      console.error('Error saving user:', error);
      message.error('Không thể lưu thông tin người dùng');
    }
  };

  const showRoleModal = (role = null) => {
    setCurrentRole(role);
    if (role) {
      roleForm.setFieldsValue({
        name: role.name,
        permissions: role.permissions
      });
    } else {
      roleForm.resetFields();
    }
    setRoleModalVisible(true);
  };

  const handleRoleFormSubmit = (values) => {
    if (currentRole) {
      // Update existing role
      const updatedRoles = roles.map(role => 
        role.id === currentRole.id ? { ...role, ...values } : role
      );
      setRoles(updatedRoles);
      message.success('Cập nhật vai trò thành công');
    } else {
      // Create new role
      const newRole = {
        id: values.name.toLowerCase().replace(/\s+/g, '_'),
        ...values
      };
      setRoles([...roles, newRole]);
      message.success('Thêm vai trò mới thành công');
    }
    setRoleModalVisible(false);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <a>{text}</a>
    },
    {
      title: 'Tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (text, record) => (
        <Select 
          defaultValue={text} 
          style={{ width: 140 }}
          onChange={(value) => handleRoleChange(record.id, value)}
        >
          {roles.map(role => (
            <Option key={role.id} value={role.id}>
              {role.name}
            </Option>
          ))}
        </Select>
      ),
      filters: roles.map(role => ({ text: role.name, value: role.id })),
      onFilter: (value, record) => record.role === value
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <Tag color={text === 'active' ? 'success' : 'error'}>
          {text === 'active' ? 'Hoạt động' : 'Bị khóa'}
        </Tag>
      ),
      filters: [
        { text: 'Hoạt động', value: 'active' },
        { text: 'Bị khóa', value: 'inactive' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Đăng nhập lần cuối',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (text) => text ? new Date(text).toLocaleString('vi-VN') : 'Chưa đăng nhập'
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => showDrawer(record)} 
            />
          </Tooltip>
          
          {record.status === 'active' ? (
            <Tooltip title="Khóa tài khoản">
              <Popconfirm
                title="Bạn có chắc muốn khóa tài khoản này?"
                onConfirm={() => handleStatusChange(record.id, 'inactive')}
                okText="Có"
                cancelText="Không"
              >
                <Button type="default" icon={<LockOutlined />} size="small" />
              </Popconfirm>
            </Tooltip>
          ) : (
            <Tooltip title="Mở khóa tài khoản">
              <Popconfirm
                title="Bạn có chắc muốn mở khóa tài khoản này?"
                onConfirm={() => handleStatusChange(record.id, 'active')}
                okText="Có"
                cancelText="Không"
              >
                <Button type="default" icon={<UnlockOutlined />} size="small" />
              </Popconfirm>
            </Tooltip>
          )}
          
          <Tooltip title="Xóa tài khoản">
            <Popconfirm
              title="Bạn có chắc muốn xóa người dùng này?"
              description="Hành động này không thể hoàn tác!"
              onConfirm={() => handleDeleteUser(record.id)}
              okText="Có"
              cancelText="Không"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Role management tab
  const roleColumns = [
    {
      title: 'Tên vai trò',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Quyền hạn',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions) => (
        <Space size={[0, 4]} wrap>
          {permissions.map(permission => (
            <Tag color="blue" key={permission}>
              {permission}
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => showRoleModal(record)}
            disabled={record.id === 'admin'} // Prevent editing admin role
          />
        </Space>
      ),
    },
  ];

  const permissionOptions = [
    { label: 'Tất cả quyền', value: 'all' },
    { label: 'Quản lý người dùng', value: 'manage_users' },
    { label: 'Quản lý tin tuyển dụng', value: 'manage_jobs' },
    { label: 'Quản lý ứng tuyển', value: 'manage_applications' },
    { label: 'Quản lý nội dung', value: 'manage_content' },
    { label: 'Đăng tin tuyển dụng', value: 'post_jobs' },
    { label: 'Ứng tuyển công việc', value: 'apply_jobs' },
    { label: 'Quản lý hồ sơ', value: 'manage_profile' },
  ];

  return (
    <div className="admin-users-page">
      <Title level={2}>Quản lý người dùng</Title>
      
      <Tabs defaultActiveKey="1">
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              Danh sách người dùng
            </span>
          } 
          key="1"
        >
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Space size="large">
                <Input.Search
                  placeholder="Tìm kiếm người dùng"
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={handleSearch}
                  style={{ width: 300 }}
                />
                
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => showDrawer()}
                >
                  Thêm người dùng
                </Button>
              </Space>
            </div>
            
            <Table
              columns={columns}
              dataSource={filteredUsers}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total) => `Tổng cộng ${total} người dùng`
              }}
            />
          </Card>
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <TeamOutlined />
              Quản lý vai trò
            </span>
          }
          key="2"
        >
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Space size="large">
                <Button 
                  type="primary" 
                  onClick={() => showRoleModal()}
                >
                  Thêm vai trò mới
                </Button>
              </Space>
            </div>
            
            <Table
              columns={roleColumns}
              dataSource={roles}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </TabPane>
      </Tabs>
      
      {/* User Form Drawer */}
      <Drawer
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        width={520}
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
          onFinish={handleFormSubmit}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          
          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password placeholder="Mật khẩu" />
            </Form.Item>
          )}
          
          <Form.Item
            name="fullName"
            label="Họ tên"
          >
            <Input placeholder="Họ tên" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Số điện thoại"
          >
            <Input placeholder="Số điện thoại" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò">
              {roles.map(role => (
                <Option key={role.id} value={role.id}>{role.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Bị khóa</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
      
      {/* Role Form Modal */}
      <Modal
        title={currentRole ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
        open={roleModalVisible}
        onCancel={() => setRoleModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setRoleModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={() => roleForm.submit()}>
            Lưu
          </Button>,
        ]}
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleRoleFormSubmit}
        >
          <Form.Item
            name="name"
            label="Tên vai trò"
            rules={[{ required: true, message: 'Vui lòng nhập tên vai trò!' }]}
          >
            <Input placeholder="Tên vai trò" />
          </Form.Item>
          
          <Form.Item
            name="permissions"
            label="Quyền hạn"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một quyền!' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn quyền hạn"
              style={{ width: '100%' }}
              options={permissionOptions}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;
