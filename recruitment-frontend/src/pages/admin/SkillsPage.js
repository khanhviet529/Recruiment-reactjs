import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Space, 
  message, 
  Popconfirm, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Tag, 
  Switch,
  InputNumber,
  Select,
  Tooltip,
  Avatar,
  Drawer,
  Typography,
  Divider,
  Alert,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ReloadOutlined,
  ToolOutlined,
  RiseOutlined,
  EyeOutlined,
  StarOutlined,
  BulbOutlined,
  BarsOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    fetchSkills();
    fetchCategories();
  }, []);

  useEffect(() => {
    // Filter skills based on search text
    if (searchText) {
      const filtered = skills.filter(skill =>
        skill.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        skill.category?.toLowerCase().includes(searchText.toLowerCase()) ||
        skill.description?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills(skills);
    }
  }, [skills, searchText]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/skills');
      setSkills(response.data || []);
      setFilteredSkills(response.data || []);
    } catch (error) {
      // If skills endpoint doesn't exist, create initial data
      console.log('Skills endpoint not found, creating initial data');
      const initialSkills = [
        {
          id: "1",
          name: "JavaScript",
          category: "Lập trình",
          description: "Ngôn ngữ lập trình phổ biến cho web development",
          level: "Intermediate",
          isPopular: true,
          jobCount: 1245,
          color: "#f7df1e",
          icon: "💻",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-04-26T00:00:00.000Z"
        },
        {
          id: "2", 
          name: "React",
          category: "Frontend",
          description: "Thư viện JavaScript để xây dựng giao diện người dùng",
          level: "Advanced",
          isPopular: true,
          jobCount: 987,
          color: "#61dafb",
          icon: "⚛️",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-04-26T00:00:00.000Z"
        },
        {
          id: "3",
          name: "Node.js",
          category: "Backend", 
          description: "Môi trường runtime JavaScript cho backend",
          level: "Intermediate",
          isPopular: true,
          jobCount: 756,
          color: "#339933",
          icon: "🚀",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-04-26T00:00:00.000Z"
        }
      ];
      
      try {
        await axios.post('http://localhost:5000/skills', initialSkills[0]);
        await axios.post('http://localhost:5000/skills', initialSkills[1]);
        await axios.post('http://localhost:5000/skills', initialSkills[2]);
        setSkills(initialSkills);
        setFilteredSkills(initialSkills);
      } catch (createError) {
        message.error('Không thể tải danh sách kỹ năng');
        console.error('Error creating initial skills:', createError);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/jobFilters');
      const industriesData = response.data.industries || [];
      setCategories(industriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleAdd = () => {
    setEditingSkill(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSkill(record);
    form.setFieldsValue({
      ...record,
      createdAt: record.createdAt ? new Date(record.createdAt).toISOString().slice(0, 16) : '',
      updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString().slice(0, 16) : ''
    });
    setModalVisible(true);
  };

  const handleViewDetail = (skill) => {
    setCurrentSkill(skill);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setCurrentSkill(null);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa kỹ năng này?',
      content: 'Dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await axios.delete(`http://localhost:5000/skills/${id}`);
          message.success('Đã xóa kỹ năng thành công');
          fetchSkills();
        } catch (error) {
          message.error('Không thể xóa kỹ năng');
          console.error('Error deleting skill:', error);
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      const skillData = {
        ...values,
        createdAt: editingSkill ? editingSkill.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingSkill) {
        await axios.put(`http://localhost:5000/skills/${editingSkill.id}`, skillData);
        message.success('Đã cập nhật kỹ năng thành công');
      } else {
        await axios.post('http://localhost:5000/skills', skillData);
        message.success('Đã thêm kỹ năng thành công');
      }

      setModalVisible(false);
      form.resetFields();
      fetchSkills();
    } catch (error) {
      message.error('Không thể lưu kỹ năng');
      console.error('Error saving skill:', error);
    }
  };

  const skillLevels = [
    { value: 'Beginner', label: 'Mới bắt đầu', color: 'blue' },
    { value: 'Intermediate', label: 'Trung bình', color: 'orange' },
    { value: 'Advanced', label: 'Nâng cao', color: 'red' },
    { value: 'Expert', label: 'Chuyên gia', color: 'purple' }
  ];

  const skillCategories = [
    'Lập trình',
    'Frontend', 
    'Backend',
    'Mobile',
    'DevOps',
    'Database',
    'Design',
    'Marketing',
    'Quản lý',
    'Kỹ năng mềm'
  ];

  const columns = [
    {
      title: 'Kỹ năng',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>
            <a onClick={() => handleViewDetail(record)} style={{ fontWeight: 'bold' }}>
              {text}
            </a>
            {record.description && (
              <div style={{ fontSize: '12px', color: '#999', marginTop: 2 }}>
                {record.description.length > 50 
                  ? `${record.description.substring(0, 50)}...`
                  : record.description
                }
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      filters: skillCategories.map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.category === value,
      render: (category) => category,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
      sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-skills-page">
      <div className="page-header mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Quản lý kỹ năng</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            Thêm kỹ năng
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <div className="filters">
          <Space size="large">
            <Input.Search
              placeholder="Tìm kiếm kỹ năng"
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchSkills}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredSkills}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} kỹ năng`
        }}
      />

      {/* Add/Edit Modal */}
      <Modal
        title={editingSkill ? 'Chỉnh sửa kỹ năng' : 'Thêm kỹ năng mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên kỹ năng"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên kỹ năng' },
                  { max: 50, message: 'Tên kỹ năng không được quá 50 ký tự' }
                ]}
              >
                <Input placeholder="Ví dụ: JavaScript, React, Node.js" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Danh mục"
                rules={[
                  { required: true, message: 'Vui lòng chọn danh mục' }
                ]}
              >
                <Select placeholder="Chọn danh mục kỹ năng">
                  {skillCategories.map(category => (
                    <Option key={category} value={category}>{category}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { max: 200, message: 'Mô tả không được quá 200 ký tự' }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="Mô tả ngắn gọn về kỹ năng này..."
              showCount
              maxLength={200}
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingSkill ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Skill Detail Drawer */}
      <Drawer
        title="Chi tiết kỹ năng"
        width={600}
        onClose={closeDrawer}
        open={drawerVisible && currentSkill}
        extra={
          <Space>
            <Button onClick={closeDrawer}>Đóng</Button>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => {
                handleEdit(currentSkill);
                closeDrawer();
              }}
            >
              Chỉnh sửa
            </Button>
          </Space>
        }
      >
        {currentSkill && (
          <div className="skill-detail-content">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <Title level={3} style={{ margin: 0 }}>{currentSkill.name}</Title>
                <Text type="secondary">{currentSkill.category}</Text>
              </div>
            </div>
            
            <Divider />
            
            {currentSkill.description && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Mô tả:</Text>
                  <Paragraph>{currentSkill.description}</Paragraph>
                </div>
              </>
            )}
            
            <Divider />
            
            <Row gutter={16}>
              <Col span={12}>
                <div className="skill-meta-item">
                  <Text strong>Ngày tạo: </Text>
                  <span>{currentSkill.createdAt ? new Date(currentSkill.createdAt).toLocaleString('vi-VN') : 'N/A'}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className="skill-meta-item">
                  <Text strong>Cập nhật cuối: </Text>
                  <span>{currentSkill.updatedAt ? new Date(currentSkill.updatedAt).toLocaleString('vi-VN') : 'N/A'}</span>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default SkillsPage; 