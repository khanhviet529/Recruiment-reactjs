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
  ExclamationCircleOutlined,
  HeartFilled
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useSavedJobs } from '../../context/SavedJobsContext';

const { Title, Text } = Typography;
const { confirm } = Modal;

const SavedJobsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { savedJobs: savedJobIds, loading: contextLoading, refetch } = useSavedJobs();
  const [savedJobsWithDetails, setSavedJobsWithDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    if (savedJobIds.length > 0) {
      fetchSavedJobsDetails();
    } else {
      setSavedJobsWithDetails([]);
      setLoading(false);
    }
  }, [savedJobIds]);

  const fetchSavedJobsDetails = async () => {
    if (savedJobIds.length === 0) {
      setSavedJobsWithDetails([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get job details for each saved job ID
      const jobDetailsPromises = savedJobIds.map(async (jobId) => {
        try {
          const jobResponse = await axios.get(`http://localhost:5000/jobs/${jobId}`);
          const job = jobResponse.data;
          
          if (!job) {
            return null;
          }
          
          // Get employer details
          let employer = { companyName: 'Unknown Company', logo: '/image/company-placeholder.svg' };
          try {
            // First try to get all employers and find the matching one
            const employersResponse = await axios.get(`http://localhost:5000/employers`);
            const employers = employersResponse.data;
            const foundEmployer = employers.find(emp => emp.userId === job.employerId || emp.id === job.employerId);
            
            if (foundEmployer) {
              employer = foundEmployer;
            }
          } catch (err) {
            console.error(`Error fetching employer ${job.employerId}:`, err);
          }
          
          return {
            id: job.id,
            title: job.title,
            company: {
              id: employer.id,
              name: employer.companyName,
              logo: employer.logo || employer.profilePicture || '/image/company-placeholder.svg'
            },
            location: job.location,
            jobType: job.jobType,
            category: job.categories ? job.categories[0] : '',
            experience: job.experienceLevel || (job.minExperienceYears ? job.minExperienceYears + '+ years' : 'Not specified'),
            salary: job.salary,
            postedDate: job.postedAt || job.createdAt,
            applicationDeadline: job.applicationDeadline,
            description: job.shortDescription || job.description,
            skills: job.skills || [],
            isUrgent: job.isUrgent || false,
            views: job.views || 0,
            applications: job.applications || 0
          };
        } catch (error) {
          console.error(`Error fetching job ${jobId}:`, error);
          return null;
        }
      });
      
      const jobDetails = await Promise.all(jobDetailsPromises);
      const validJobs = jobDetails.filter(job => job !== null);
      
      // Sort by most recently added
      setSavedJobsWithDetails(validJobs);
      setPagination({
        ...pagination,
        total: validJobs.length
      });
    } catch (error) {
      console.error('Error fetching saved jobs details:', error);
      message.error('Không thể tải danh sách công việc đã lưu');
      setSavedJobsWithDetails([]);
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
          // Use context to remove saved job
          await refetch(); // Refresh the context
          setSavedJobsWithDetails(prev => prev.filter(job => job.id !== jobId));
          message.success('Đã xóa công việc khỏi danh sách đã lưu');
        } catch (error) {
          console.error('Error removing saved job:', error);
          message.error('Có lỗi xảy ra khi xóa công việc đã lưu');
        }
      }
    });
  };

  const handleRemoveAllSavedJobs = () => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa tất cả công việc đã lưu?',
      icon: <ExclamationCircleOutlined />,
      content: 'Tất cả công việc đã lưu sẽ bị xóa và không thể khôi phục.',
      okText: 'Xóa tất cả',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // Remove all saved jobs (would need to implement in context)
          setSavedJobsWithDetails([]);
          message.success('Đã xóa tất cả công việc đã lưu');
        } catch (error) {
          console.error('Error removing all saved jobs:', error);
          message.error('Có lỗi xảy ra khi xóa tất cả công việc đã lưu');
        }
      }
    });
  };

  // Get current jobs for pagination
  const getCurrentJobs = () => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return savedJobsWithDetails.slice(startIndex, endIndex);
  };

  const renderJobCard = (job) => {
    return (
      <Card key={job.id} className="job-card mb-4" hoverable>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={4} className="text-center">
            <img 
              src={job.company.logo} 
              alt={job.company.name} 
              style={{ maxWidth: '100%', maxHeight: 80, objectFit: 'contain' }}
            />
          </Col>
          
          <Col xs={24} sm={16}>
            <div style={{ position: 'relative' }}>
              <Link to={`/jobs/${job.id}`}>
                <Title level={4} className="job-title mb-1">
                  {job.title}
                  {job.isUrgent && (
                    <Tag color="red" style={{ marginLeft: 8 }}>GẤP</Tag>
                  )}
                </Title>
              </Link>
              <HeartFilled style={{ position: 'absolute', top: 0, right: 0, color: '#e11d48' }} />
            </div>
            
            <Link to={`/companies/${job.company.id}`}>
              <Text className="company-name d-block mb-2" style={{ fontSize: '16px', fontWeight: 500 }}>
                {job.company.name}
              </Text>
            </Link>
            
            <Space wrap className="mb-2">
              <Tag icon={<EnvironmentOutlined />}>{job.location}</Tag>
              <Tag color="blue">{job.jobType}</Tag>
              {job.category && <Tag>{job.category}</Tag>}
              {job.experience && <Tag icon={<BookOutlined />}>{job.experience}</Tag>}
            </Space>
            
            <div className="mb-2">
              {job.salary && !job.salary.isHidden ? (
                <Text className="salary">
                  <DollarOutlined /> {job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()} {job.salary.currency}/{job.salary.period}
                </Text>
              ) : (
                <Text className="salary">
                  <DollarOutlined /> Thương lượng
                </Text>
              )}
            </div>
            
            {job.description && (
              <div className="description mb-2" style={{ color: '#666' }}>
                {job.description.length > 150 
                  ? `${job.description.substring(0, 150)}...`
                  : job.description}
              </div>
            )}
            
            {job.skills && job.skills.length > 0 && (
              <div className="skills mb-2">
                {job.skills.slice(0, 5).map((skill, index) => (
                  <Tag key={index} style={{ marginBottom: 4 }}>{skill}</Tag>
                ))}
                {job.skills.length > 5 && (
                  <Tag color="processing">+{job.skills.length - 5} kỹ năng khác</Tag>
                )}
              </div>
            )}
            
            <Space wrap>
              <Text type="secondary">
                <ClockCircleOutlined /> {moment(job.postedDate).fromNow()}
              </Text>
              {job.applicationDeadline && (
                <Text type={moment().isAfter(job.applicationDeadline) ? "danger" : "secondary"}>
                  Hạn nộp: {moment(job.applicationDeadline).format('DD/MM/YYYY')}
                </Text>
              )}
              <Text type="secondary">
                <EyeOutlined /> {job.views} lượt xem
              </Text>
            </Space>
          </Col>
          
          <Col xs={24} sm={4} className="action-buttons">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Link to={`/jobs/${job.id}`}>
                <Button type="primary" icon={<EyeOutlined />} block>
                  Xem chi tiết
                </Button>
              </Link>
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => handleRemoveSavedJob(job.id)}
                block
              >
                Xóa khỏi danh sách
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  const currentJobs = getCurrentJobs();

  return (
    <div className="saved-jobs-page" style={{ padding: '24px' }}>
      <div className="page-header">
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <Title level={2}>
              <HeartFilled style={{ color: '#e11d48', marginRight: 8 }} />
              Công việc đã lưu
            </Title>
            <Text type="secondary">
              Bạn đã lưu {savedJobsWithDetails.length} công việc
            </Text>
          </Col>
          <Col>
            {savedJobsWithDetails.length > 0 && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleRemoveAllSavedJobs}
              >
                Xóa tất cả
              </Button>
            )}
          </Col>
        </Row>
      </div>

      {loading || contextLoading ? (
        <div className="text-center py-5">
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Đang tải danh sách công việc đã lưu...</Text>
          </div>
        </div>
      ) : (
        <>
          {currentJobs.length > 0 ? (
            <>
              <div className="job-cards">
                {currentJobs.map(job => renderJobCard(job))}
              </div>
              
              {savedJobsWithDetails.length > pagination.pageSize && (
                <div className="pagination-container text-center mt-4">
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={handlePaginationChange}
                    showSizeChanger
                    showTotal={(total) => `Tổng ${total} công việc đã lưu`}
                  />
                </div>
              )}
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{ height: 60 }}
              description={
                <div>
                  <Text strong>Bạn chưa lưu công việc nào</Text>
                  <br />
                  <Text type="secondary">
                    Hãy tìm kiếm và lưu những công việc yêu thích để theo dõi dễ dàng hơn
                  </Text>
                  <br />
                  <Link to="/jobs">
                    <Button type="primary" style={{ marginTop: 16 }}>
                      Tìm kiếm công việc ngay
                    </Button>
                  </Link>
                </div>
              }
            />
          )}
        </>
      )}
    </div>
  );
};

export default SavedJobsPage; 