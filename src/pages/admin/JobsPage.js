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
  Tooltip,
  Divider,
  Row,
  Col,
  Statistic,
  Alert
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  BarsOutlined,
  DollarOutlined,
  CalendarOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    paused: 0,
    expired: 0,
    reported: 0
  });

  const [form] = Form.useForm();

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = jobs.filter(job => 
        job.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        job.companyName?.toLowerCase().includes(searchText.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchText, jobs]);

  // Calculate statistics
  useEffect(() => {
    if (jobs.length > 0) {
      const active = jobs.filter(job => job.status === 'active').length;
      const draft = jobs.filter(job => job.status === 'draft').length;
      const paused = jobs.filter(job => job.status === 'paused').length;
      const expired = jobs.filter(job => job.status === 'expired').length;
      const reported = jobs.filter(job => job.reportCount > 0).length;
      
      setStats({
        total: jobs.length,
        active,
        draft,
        paused,
        expired,
        reported
      });
    }
  }, [jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/jobs');
      
      if (response.data) {
        setJobs(response.data);
        setFilteredJobs(response.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      message.error('Không thể tải danh sách tin tuyển dụng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleStatusChange = async (jobId, newStatus, pauseReason = null) => {
    try {
      const payload = { status: newStatus };
      
      // Add pauseReason if provided and status is paused
      if (newStatus === 'paused' && pauseReason) {
        payload.pauseReason = pauseReason;
        payload.pausedAt = new Date().toISOString();
      }
      
      await axios.patch(`http://localhost:5000/jobs/${jobId}/status`, payload);
      
      let statusText = '';
      if (newStatus === 'active') statusText = 'đang hoạt động';
      else if (newStatus === 'draft') statusText = 'bản nháp';
      else if (newStatus === 'paused') statusText = 'tạm dừng';
      else statusText = 'hết hạn';
      
      message.success(`Đã cập nhật trạng thái tin tuyển dụng thành ${statusText}`);
      
      // Update local state
      setJobs(jobs.map(job => 
        job.id === jobId ? { 
          ...job, 
          status: newStatus,
          ...(newStatus === 'paused' && pauseReason ? { 
            pauseReason,
            pausedAt: new Date().toISOString() 
          } : {})
        } : job
      ));
    } catch (error) {
      console.error('Error updating job status:', error);
      message.error('Không thể cập nhật trạng thái tin tuyển dụng');
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await axios.delete(`http://localhost:5000/jobs/${jobId}`);
      message.success('Đã xóa tin tuyển dụng thành công');
      
      // Update local state
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
      message.error('Không thể xóa tin tuyển dụng');
    }
  };

  const handleViewJobDetail = (job) => {
    setCurrentJob(job);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setCurrentJob(null);
  };

  const formatSalary = (min, max, currency = 'VND') => {
    if (!min && !max) return 'Thỏa thuận';
    if (min && !max) return `Từ ${min.toLocaleString()} ${currency}`;
    if (!min && max) return `Đến ${max.toLocaleString()} ${currency}`;
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
  };

  const resolveReportedJob = async (jobId) => {
    try {
      await axios.patch(`http://localhost:5000/jobs/${jobId}/resolve-report`);
      message.success('Đã giải quyết báo cáo tin tuyển dụng');
      
      // Update local state
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, reportCount: 0 } : job
      ));
    } catch (error) {
      console.error('Error resolving reported job:', error);
      message.error('Không thể giải quyết báo cáo tin tuyển dụng');
    }
  };

  const handlePauseJob = (jobId) => {
    Modal.confirm({
      title: 'Tạm dừng tin tuyển dụng',
      content: (
        <div>
          <p>Vui lòng nhập lý do tạm dừng tin tuyển dụng này:</p>
          <Input.TextArea 
            id="pauseReason" 
            rows={3} 
            placeholder="Lý do tạm dừng"
          />
        </div>
      ),
      onOk() {
        const pauseReason = document.getElementById('pauseReason').value;
        if (!pauseReason) {
          message.error('Vui lòng nhập lý do tạm dừng tin tuyển dụng');
          return Promise.reject('Vui lòng nhập lý do tạm dừng tin tuyển dụng');
        }
        handleStatusChange(jobId, 'paused', pauseReason);
        return Promise.resolve();
      },
      okText: 'Xác nhận',
      cancelText: 'Hủy',
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <a onClick={() => handleViewJobDetail(record)}>{text}</a>
          {record.reportCount > 0 && (
            <Badge count={record.reportCount} style={{ marginLeft: 8 }} />
          )}
        </div>
      )
    },
    {
      title: 'Công ty',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        let color = 'default';
        let statusText = 'Unknown';
        
        switch (text) {
          case 'active':
            color = 'success';
            statusText = 'Đang hoạt động';
            break;
          case 'draft':
            color = 'default';
            statusText = 'Bản nháp';
            break;
          case 'paused':
            color = 'warning';
            statusText = 'Tạm dừng';
            break;
          case 'expired':
            color = 'error';
            statusText = 'Hết hạn';
            break;
          default:
            color = 'default';
            statusText = text || 'Unknown';
        }
        
        return <Tag color={color}>{statusText}</Tag>;
      },
      filters: [
        { text: 'Đang hoạt động', value: 'active' },
        { text: 'Bản nháp', value: 'draft' },
        { text: 'Tạm dừng', value: 'paused' },
        { text: 'Hết hạn', value: 'expired' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => text ? new Date(text).toLocaleDateString('vi-VN') : 'N/A'
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      render: (text) => text ? new Date(text).toLocaleDateString('vi-VN') : 'N/A'
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleViewJobDetail(record)} 
            />
          </Tooltip>
          
          {record.status !== 'active' ? (
            <Tooltip title="Phê duyệt">
              <Popconfirm
                title="Bạn có chắc muốn phê duyệt tin tuyển dụng này?"
                onConfirm={() => handleStatusChange(record.id, 'active')}
                okText="Có"
                cancelText="Không"
              >
                <Button type="default" icon={<CheckCircleOutlined />} size="small" />
              </Popconfirm>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Tạm dừng">
                <Button 
                  type="default" 
                  icon={<CloseCircleOutlined />} 
                  size="small"
                  onClick={() => handlePauseJob(record.id)}
                />
              </Tooltip>
            </>
          )}
          
          {record.reportCount > 0 && (
            <Tooltip title="Giải quyết báo cáo">
              <Popconfirm
                title="Đánh dấu báo cáo này đã được giải quyết?"
                onConfirm={() => resolveReportedJob(record.id)}
                okText="Có"
                cancelText="Không"
              >
                <Button 
                  type="default" 
                  danger 
                  icon={<ExclamationCircleOutlined />} 
                  size="small" 
                />
              </Popconfirm>
            </Tooltip>
          )}
          
          <Tooltip title="Xóa tin">
            <Popconfirm
              title="Bạn có chắc muốn xóa tin tuyển dụng này?"
              description="Hành động này không thể hoàn tác!"
              onConfirm={() => handleDeleteJob(record.id)}
              okText="Có"
              cancelText="Không"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<CloseCircleOutlined />} size="small" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-jobs-page">
      <Title level={2}>Quản lý tin tuyển dụng</Title>
      
      {/* Stats Cards */}
      <Row gutter={16} className="mb-4">
        <Col span={4}>
          <Card>
            <Statistic
              title="Tổng số tin"
              value={stats.total}
              prefix={<BarsOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Bản nháp"
              value={stats.draft}
              valueStyle={{ color: '#1890ff' }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Tạm dừng"
              value={stats.paused}
              valueStyle={{ color: '#faad14' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Hết hạn"
              value={stats.expired}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Bị báo cáo"
              value={stats.reported}
              valueStyle={{ color: '#faad14' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space size="large">
            <Input.Search
              placeholder="Tìm kiếm tin tuyển dụng"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredJobs}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Tổng cộng ${total} tin tuyển dụng`
          }}
        />
      </Card>
      
      {/* Job Detail Drawer */}
      <Drawer
        title="Chi tiết tin tuyển dụng"
        width={700}
        onClose={closeDrawer}
        open={drawerVisible && currentJob}
        extra={
          <Space>
            <Button onClick={closeDrawer}>Đóng</Button>
            {currentJob && currentJob.status !== 'active' && (
              <Button 
                type="primary" 
                onClick={() => {
                  handleStatusChange(currentJob.id, 'active');
                  closeDrawer();
                }}
              >
                {currentJob.status === 'paused' ? 'Tiếp tục đăng tin' : 'Phê duyệt tin'}
              </Button>
            )}
          </Space>
        }
      >
        {currentJob && (
          <div className="job-detail-content">
            <Title level={3}>{currentJob.title}</Title>
            
            <Divider />
            
            <Row gutter={16}>
              <Col span={12}>
                <div className="job-meta-item">
                  <EnvironmentOutlined /> <strong>Địa điểm:</strong> {currentJob.location}
                </div>
              </Col>
              <Col span={12}>
                <div className="job-meta-item">
                  <DollarOutlined /> <strong>Mức lương:</strong> {formatSalary(currentJob.salaryMin, currentJob.salaryMax)}
                </div>
              </Col>
            </Row>
            
            <Row gutter={16} className="mt-3">
              <Col span={12}>
                <div className="job-meta-item">
                  <CalendarOutlined /> <strong>Ngày đăng:</strong> {currentJob.createdAt ? new Date(currentJob.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
              </Col>
              <Col span={12}>
                <div className="job-meta-item">
                  <CalendarOutlined /> <strong>Ngày hết hạn:</strong> {currentJob.expirationDate ? new Date(currentJob.expirationDate).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
              </Col>
            </Row>
            
            <Divider />
            
            <div className="job-description mb-4">
              <Title level={4}>Mô tả công việc</Title>
              <Paragraph>
                {currentJob.description || 'Không có mô tả'}
              </Paragraph>
            </div>
            
            <div className="job-requirements mb-4">
              <Title level={4}>Yêu cầu ứng viên</Title>
              <Paragraph>
                {currentJob.requirements || 'Không có yêu cầu cụ thể'}
              </Paragraph>
            </div>
            
            <div className="job-benefits mb-4">
              <Title level={4}>Quyền lợi</Title>
              <Paragraph>
                {currentJob.benefits || 'Không có thông tin quyền lợi'}
              </Paragraph>
            </div>
            
            {currentJob.status === 'paused' && (
              <div className="job-paused-info mb-4">
                <Title level={4} type="warning">Thông tin tạm dừng</Title>
                <Alert
                  message="Tin tuyển dụng đang tạm dừng"
                  description={
                    <>
                      <p><strong>Lý do:</strong> {currentJob.pauseReason}</p>
                      <p><strong>Tạm dừng lúc:</strong> {currentJob.pausedAt ? new Date(currentJob.pausedAt).toLocaleString('vi-VN') : 'N/A'}</p>
                    </>
                  }
                  type="warning"
                  showIcon
                />
              </div>
            )}
            
            {currentJob.reportCount > 0 && (
              <div className="job-reports mb-4">
                <Title level={4} type="danger">Báo cáo vi phạm</Title>
                <Alert
                  message={`Tin tuyển dụng này có ${currentJob.reportCount} báo cáo vi phạm`}
                  description="Hãy xem xét nội dung tin tuyển dụng và quyết định có tiếp tục hiển thị hay không."
                  type="warning"
                  showIcon
                  action={
                    <Button 
                      size="small" 
                      danger
                      onClick={() => {
                        resolveReportedJob(currentJob.id);
                        closeDrawer();
                      }}
                    >
                      Đánh dấu đã giải quyết
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default JobsPage;
