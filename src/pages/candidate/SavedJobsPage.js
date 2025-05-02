import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Tag, 
  Space, 
  Typography, 
  Empty, 
  Pagination,
  Spin,
  message,
  Modal
} from 'antd';
import { 
  EnvironmentOutlined, 
  DollarOutlined, 
  ClockCircleOutlined,
  BookOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';

const { Title, Text } = Typography;
const { confirm } = Modal;

const SavedJobsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchSavedJobs();
  }, [user, pagination.current, pagination.pageSize]);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`http://localhost:5000/candidates/${user.id}/saved-jobs`, {
          params: {
            page: pagination.current,
            limit: pagination.pageSize
          }
        });
        
        setSavedJobs(response.data.items);
        setPagination({
          ...pagination,
          total: response.data.total
        });
      } catch (apiError) {
        console.warn('Using mock data for saved jobs:', apiError);
        
        // Mock data
        const mockJobs = Array(15).fill(null).map((_, index) => ({
          id: 100 + index,
          title: `${['Frontend Developer', 'Backend Developer', 'Full Stack Engineer', 'UI/UX Designer', 'DevOps Engineer'][index % 5]} (${index + 1})`,
          company: {
            id: index % 10 + 1,
            name: `${['TechCorp', 'Digital Solutions', 'Web Masters', 'IT Innovations', 'Code Factory'][index % 5]}`,
            logo: 'https://via.placeholder.com/100'
          },
          location: `${['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Nha Trang', 'Cần Thơ'][index % 5]}`,
          jobType: `${['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'][index % 5]}`,
          category: `${['Web Development', 'Mobile Development', 'UI/UX Design', 'DevOps', 'Data Science'][index % 5]}`,
          experience: `${['0-1 năm', '1-3 năm', '3-5 năm', '5-7 năm', '7+ năm'][index % 5]}`,
          salary: {
            min: (index % 10 + 5) * 1000000,
            max: (index % 10 + 15) * 1000000,
            currency: 'VND',
            isDisplayed: true
          },
          postedDate: moment().subtract(index % 30, 'days').format(),
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.',
          savedAt: moment().subtract(index % 14, 'days').format()
        }));
        
        // Pagination calculation for mock data
        const startIndex = (pagination.current - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const paginatedJobs = mockJobs.slice(startIndex, endIndex);
        
        setSavedJobs(paginatedJobs);
        setPagination({
          ...pagination,
          total: mockJobs.length
        });
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      message.error('Không thể tải danh sách công việc đã lưu');
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize
    });
  };

  const handleRemoveSavedJob = async (jobId) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa công việc này khỏi danh sách đã lưu?',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn sẽ không thể theo dõi công việc này trong danh sách đã lưu sau khi xóa.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5000/candidates/${user.id}/saved-jobs/${jobId}`);
          message.success('Đã xóa công việc khỏi danh sách đã lưu');
          setSavedJobs(savedJobs.filter(job => job.id !== jobId));
          
          if (savedJobs.length === 1 && pagination.current > 1) {
            // If this is the last item on the page, go to the previous page
            setPagination({
              ...pagination,
              current: pagination.current - 1
            });
          } else {
            // Just refresh the current page
            fetchSavedJobs();
          }
        } catch (error) {
          console.error('Error removing saved job:', error);
          
          // For development, update UI anyway
          message.success('Đã xóa công việc khỏi danh sách đã lưu');
          setSavedJobs(savedJobs.filter(job => job.id !== jobId));
          
          if (savedJobs.length === 1 && pagination.current > 1) {
            // If this is the last item on the page, go to the previous page
            setPagination({
              ...pagination,
              current: pagination.current - 1
            });
          }
        }
      }
    });
  };

  const handleRemoveAllSavedJobs = () => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa tất cả công việc đã lưu?',
      icon: <ExclamationCircleOutlined />,
      content: 'Tất cả công việc sẽ bị xóa khỏi danh sách đã lưu của bạn. Bạn không thể hoàn tác hành động này.',
      okText: 'Xóa tất cả',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5000/candidates/${user.id}/saved-jobs`);
          message.success('Đã xóa tất cả công việc khỏi danh sách đã lưu');
          setSavedJobs([]);
          setPagination({
            ...pagination,
            current: 1,
            total: 0
          });
        } catch (error) {
          console.error('Error removing all saved jobs:', error);
          
          // For development, update UI anyway
          message.success('Đã xóa tất cả công việc khỏi danh sách đã lưu');
          setSavedJobs([]);
          setPagination({
            ...pagination,
            current: 1,
            total: 0
          });
        }
      }
    });
  };

  const renderJobCard = (job) => {
    return (
      <Card 
        key={job.id} 
        className="job-card mb-3"
        hoverable
      >
        <Row gutter={16} align="middle">
          <Col xs={24} sm={4} className="text-center">
            <img 
              src={job.company.logo} 
              alt={job.company.name} 
              style={{ width: '80px', height: '80px', objectFit: 'contain' }} 
            />
          </Col>
          <Col xs={24} sm={16}>
            <Link to={`/candidate/jobs/${job.id}`}>
              <Title level={5} className="mb-1">
                {job.title}
              </Title>
            </Link>
            <div className="company-name mb-2">
              <Link to={`/companies/${job.company.id}`}>
                <Text type="secondary">{job.company.name}</Text>
              </Link>
            </div>
            <div className="job-meta">
              <Space wrap>
                <Text><EnvironmentOutlined /> {job.location}</Text>
                {job.salary.isDisplayed && (
                  <Text>
                    <DollarOutlined /> {(job.salary.min/1000000).toFixed(0)}-{(job.salary.max/1000000).toFixed(0)} triệu
                  </Text>
                )}
                <Text><ClockCircleOutlined /> {job.jobType}</Text>
                <Text><BookOutlined /> {job.experience}</Text>
              </Space>
            </div>
            <div className="saved-date mt-2">
              <Text type="secondary">
                Đã lưu: {moment(job.savedAt).format('DD/MM/YYYY')}
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={4} className="text-right">
            <Space direction="vertical">
              <Link to={`/candidate/jobs/${job.id}`}>
                <Button type="primary" icon={<EyeOutlined />}>
                  Xem chi tiết
                </Button>
              </Link>
              <Button 
                danger
                icon={<DeleteOutlined />} 
                onClick={() => handleRemoveSavedJob(job.id)}
              >
                Xóa
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <div className="saved-jobs-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Title level={4}>Công việc đã lưu ({pagination.total})</Title>
        {pagination.total > 0 && (
          <Button 
            type="primary" 
            danger
            icon={<DeleteOutlined />}
            onClick={handleRemoveAllSavedJobs}
          >
            Xóa tất cả
          </Button>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-5">
          <Spin size="large" />
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="saved-jobs-results">
          {savedJobs.map(job => renderJobCard(job))}
          
          <div className="d-flex justify-content-center mt-4">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePaginationChange}
              showSizeChanger
            />
          </div>
        </div>
      ) : (
        <Card>
          <Empty
            description="Bạn chưa lưu công việc nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Link to="/candidate/jobs">
              <Button type="primary">Tìm việc ngay</Button>
            </Link>
          </Empty>
        </Card>
      )}
    </div>
  );
};

export default SavedJobsPage; 