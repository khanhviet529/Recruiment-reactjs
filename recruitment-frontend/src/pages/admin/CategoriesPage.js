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
  AppstoreOutlined,
  RiseOutlined,
  EyeOutlined,
  StarOutlined,
  BarsOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    totalJobs: 0,
    avgJobsPerCategory: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Filter categories based on search text
    if (searchText) {
      const filtered = categories.filter(category =>
        category.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        category.slug?.toLowerCase().includes(searchText.toLowerCase()) ||
        category.label?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [categories, searchText]);

  // Calculate statistics
  useEffect(() => {
    if (categories.length > 0) {
      const totalJobs = categories.reduce((sum, cat) => sum + (cat.count || 0), 0);
      const avgJobsPerCategory = Math.round(totalJobs / categories.length);
      
      setStats({
        total: categories.length,
        totalJobs,
        avgJobsPerCategory
      });
    }
  }, [categories]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/jobFilters');
      const industriesData = response.data.industries || [];
      setCategories(industriesData);
      setFilteredCategories(industriesData);
    } catch (error) {
      message.error('Không thể tải danh sách danh mục');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCategory(record);
    form.setFieldsValue({
      ...record,
      createdAt: record.createdAt ? new Date(record.createdAt).toISOString().slice(0, 16) : '',
      updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString().slice(0, 16) : ''
    });
    setModalVisible(true);
  };

  const handleViewDetail = (category) => {
    setCurrentCategory(category);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setCurrentCategory(null);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa danh mục này?',
      content: 'Dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          const response = await axios.get('http://localhost:5000/jobFilters');
          const jobFilters = response.data;
          
          const updatedIndustries = jobFilters.industries.filter(cat => cat.id !== id);
          
          await axios.put('http://localhost:5000/jobFilters', {
            ...jobFilters,
            industries: updatedIndustries
          });
          
          message.success('Đã xóa danh mục thành công');
          fetchCategories();
        } catch (error) {
          message.error('Không thể xóa danh mục');
          console.error('Error deleting category:', error);
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      const response = await axios.get('http://localhost:5000/jobFilters');
      const jobFilters = response.data;
      
      const categoryData = {
        ...values,
        slug: values.name.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .trim('-'),
        createdAt: editingCategory ? editingCategory.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedIndustries;
      
      if (editingCategory) {
        updatedIndustries = jobFilters.industries.map(cat => 
          cat.id === editingCategory.id ? { ...cat, ...categoryData } : cat
        );
        message.success('Đã cập nhật danh mục thành công');
      } else {
        const newId = String(Math.max(...jobFilters.industries.map(cat => parseInt(cat.id))) + 1);
        categoryData.id = newId;
        updatedIndustries = [...jobFilters.industries, categoryData];
        message.success('Đã thêm danh mục thành công');
      }

      await axios.put('http://localhost:5000/jobFilters', {
        ...jobFilters,
        industries: updatedIndustries
      });

      setModalVisible(false);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      message.error('Không thể lưu danh mục');
      console.error('Error saving category:', error);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim('-');
  };

  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <div>
          <a onClick={() => handleViewDetail(record)} style={{ fontWeight: 'bold' }}>
            {text}
          </a>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.label}
          </div>
        </div>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 150,
      render: (text) => (
        <code style={{ 
          backgroundColor: '#f8fafc', 
          padding: '2px 6px', 
          borderRadius: '3px',
          fontSize: '12px'
        }}>
          {text}
        </code>
      ),
    },
    {
      title: 'Số việc làm',
      dataIndex: 'count',
      key: 'count',
      width: 130,
      sorter: (a, b) => (a.count || 0) - (b.count || 0),
      render: (count) => (count || 0).toLocaleString(),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 110,
      sorter: (a, b) => a.displayOrder - b.displayOrder,
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
    <div className="admin-categories-page">
      <div className="page-header mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Quản lý danh mục</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            Thêm danh mục
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <div className="filters">
          <Space size="large">
            <Input.Search
              placeholder="Tìm kiếm danh mục"
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchCategories}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredCategories}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} danh mục`
        }}
      />

      {/* Add/Edit Modal */}
      <Modal
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={550}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            displayOrder: stats.total + 1,
            count: 0
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên danh mục"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên danh mục' },
                  { max: 100, message: 'Tên danh mục không được quá 100 ký tự' }
                ]}
              >
                <Input
                  placeholder="Ví dụ: Công nghệ thông tin"
                  onChange={(e) => {
                    const value = e.target.value;
                    form.setFieldsValue({
                      label: value,
                      slug: generateSlug(value)
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="label"
                label="Nhãn hiển thị"
                rules={[
                  { required: true, message: 'Vui lòng nhập nhãn hiển thị' }
                ]}
              >
                <Input placeholder="Tên hiển thị trên giao diện" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="slug"
            label="Slug (URL thân thiện)"
            rules={[
              { required: true, message: 'Vui lòng nhập slug' },
              { pattern: /^[a-z0-9-]+$/, message: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang' }
            ]}
          >
            <Input placeholder="cong-nghe-thong-tin" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="count"
                label={
                  <span>
                    Số lượng việc làm&nbsp;
                    <Tooltip title="Số lượng này sẽ tự động cập nhật khi có tin tuyển dụng mới">
                      <QuestionCircleOutlined style={{ color: '#999' }} />
                    </Tooltip>
                  </span>
                }
                rules={[
                  { type: 'number', min: 0, message: 'Số lượng không được âm' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="0"
                  disabled
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="displayOrder"
                label="Thứ tự hiển thị"
                rules={[
                  { required: true, message: 'Vui lòng nhập thứ tự hiển thị' },
                  { type: 'number', min: 1, message: 'Thứ tự phải lớn hơn 0' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="1"
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Category Detail Drawer */}
      <Drawer
        title="Chi tiết danh mục"
        width={600}
        onClose={closeDrawer}
        open={drawerVisible && currentCategory}
        extra={
          <Space>
            <Button onClick={closeDrawer}>Đóng</Button>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => {
                handleEdit(currentCategory);
                closeDrawer();
              }}
            >
              Chỉnh sửa
            </Button>
          </Space>
        }
      >
        {currentCategory && (
          <div className="category-detail-content">
            <Title level={3}>{currentCategory.name}</Title>
            <Text type="secondary">{currentCategory.label}</Text>
            
            <Divider />
            
            <Row gutter={16}>
              <Col span={12}>
                <div className="category-meta-item" style={{ marginBottom: 16 }}>
                  <Text strong>Slug: </Text>
                  <code style={{ backgroundColor: '#f8fafc', padding: '2px 4px', borderRadius: '3px' }}>
                    {currentCategory.slug}
                  </code>
                </div>
              </Col>
              <Col span={12}>
                <div className="category-meta-item" style={{ marginBottom: 16 }}>
                  <Text strong>Số việc làm: </Text>
                  <span>{(currentCategory.count || 0).toLocaleString()}</span>
                </div>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <div className="category-meta-item" style={{ marginBottom: 16 }}>
                  <Text strong>Thứ tự hiển thị: </Text>
                  <span>{currentCategory.displayOrder}</span>
                </div>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={16}>
              <Col span={12}>
                <div className="category-meta-item">
                  <Text strong>Ngày tạo: </Text>
                  <span>{currentCategory.createdAt ? new Date(currentCategory.createdAt).toLocaleString('vi-VN') : 'N/A'}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className="category-meta-item">
                  <Text strong>Cập nhật cuối: </Text>
                  <span>{currentCategory.updatedAt ? new Date(currentCategory.updatedAt).toLocaleString('vi-VN') : 'N/A'}</span>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CategoriesPage; 