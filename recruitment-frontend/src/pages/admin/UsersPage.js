import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, 
  Button, 
  Space, 
  message, 
  Tag, 
  Input,
  Select,
  Card,
  Typography,
  Modal,
  Spin
} from 'antd';
import { 
  StopOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import './UsersPage.scss';

const { Title } = Typography;
const { Option } = Select;

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

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
        // Loại bỏ tài khoản admin
        const nonAdminUsers = response.data.filter(user => user.role !== 'admin');
        setUsers(nonAdminUsers);
        setFilteredUsers(nonAdminUsers);
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

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <a>{text}</a>
    },
    {
      title: 'Tên',
      key: 'fullName',
      render: (_, record) => {
        // Ưu tiên: name > firstName + lastName > firstName > lastName > N/A
        if (record.name) return record.name;
        if (record.firstName && record.lastName) return `${record.firstName} ${record.lastName}`;
        if (record.firstName) return record.firstName;
        if (record.lastName) return record.lastName;
        return 'N/A';
      }
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleLabels = {
          'employer': 'Nhà tuyển dụng',
          'candidate': 'Ứng viên',
          'admin': 'Quản trị viên'
        };
        return roleLabels[role] || role;
      },
      filters: [
        { text: 'Nhà tuyển dụng', value: 'employer' },
        { text: 'Ứng viên', value: 'candidate' }
      ],
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
      width: 200,
      render: (_, record) => (
        <Space size="small">
            <Button 
            type="link" 
            icon={record.status === 'active' ? <StopOutlined /> : <PlayCircleOutlined />}
            onClick={() => Modal.confirm({
              title: record.status === 'active' ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản',
              content: `Bạn có chắc chắn muốn ${record.status === 'active' ? 'khóa' : 'mở khóa'} tài khoản này?`,
              okText: record.status === 'active' ? 'Khóa' : 'Mở khóa',
              cancelText: 'Hủy',
              okType: record.status === 'active' ? 'danger' : 'primary',
              onOk: () => handleStatusChange(record.id, record.status === 'active' ? 'locked' : 'active')
            })}
          >
            {record.status === 'active' ? 'Khóa' : 'Mở khóa'}
          </Button>
        </Space>
      )
    },
  ];

  return (
    <div className="admin-users-page">
      <div className="page-header">
        <div className="page-title">
      <Title level={2}>Quản lý người dùng</Title>
        </div>
      </div>

          <Card>
            <div style={{ marginBottom: 16 }}>
              <Space size="large">
                <Input.Search
              placeholder="Tìm kiếm người dùng..."
                  onSearch={handleSearch}
                  style={{ width: 300 }}
                />
              </Space>
            </div>
            
            <Table
              columns={columns}
              dataSource={filteredUsers}
          loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} người dùng`,
                showSizeChanger: true,
              }}
            />
          </Card>
    </div>
  );
};

export default UsersPage;
