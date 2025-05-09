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
    if (user) {
      fetchSavedJobs();
    }
  }, [user, pagination.current, pagination.pageSize]);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setLoading(false);
        return;
      }
      
      // First get the candidate ID for the current user
      const candidateResponse = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);
      
      if (!candidateResponse.data || candidateResponse.data.length === 0) {
        setSavedJobs([]);
        setPagination({
          ...pagination,
          total: 0
        });
        setLoading(false);
        return;
      }
      
      const candidateId = candidateResponse.data[0].id;
      
      // Get saved jobs for this candidate
      const savedJobsResponse = await axios.get(`http://localhost:5000/savedJobs?candidateId=${candidateId}`);
      const savedJobsData = savedJobsResponse.data || [];
      
      if (savedJobsData.length === 0) {
        setSavedJobs([]);
        setPagination({
          ...pagination,
          total: 0
        });
        setLoading(false);
        return;
      }
      
      // Get job details for each saved job
      const jobDetailsPromises = savedJobsData.map(async (savedJob) => {
        try {
          const jobResponse = await axios.get(`http://localhost:5000/jobs/${savedJob.jobId}`);
          const job = jobResponse.data;
          
          if (!job) {
            return null;
          }
          
          // Get employer details
          let employer = { companyName: 'Unknown Company', logo: 'https://via.placeholder.com/100' };
          try {
            const employerResponse = await axios.get(`http://localhost:5000/employers/${job.employerId}`);
            if (employerResponse.data) {
              employer = employerResponse.data;
            }
          } catch (err) {
            console.error(`Error fetching employer ${job.employerId}:`, err);
          }
          
          return {
            id: job.id,
            savedJobId: savedJob.id, // Add the saved job ID for easier deletion
            title: job.title,
            company: {
              id: employer.id,
              name: employer.companyName,
              logo: employer.logo || 'https://via.placeholder.com/100'
            },
            location: job.location,
            jobType: job.jobType,
            category: job.categories ? job.categories[0] : '',
            experience: job.experienceLevel || job.minExperienceYears + '+ years',
            salary: job.salary,
            postedDate: job.postedAt,
            applicationDeadline: job.applicationDeadline,
            description: job.shortDescription || job.description,
            savedAt: savedJob.createdAt || new Date().toISOString(),
            notes: savedJob.notes
          };
        } catch (error) {
          console.error(`Error fetching job ${savedJob.jobId}:`, error);
          return null;
        }
      });
      
      const jobDetails = await Promise.all(jobDetailsPromises);
      const validJobs = jobDetails.filter(job => job !== null);
      
      // Sort by savedAt date (newest first)
      validJobs.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
      
      // Pagination
      const startIndex = (pagination.current - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginatedJobs = validJobs.slice(startIndex, endIndex);
      
      setSavedJobs(paginatedJobs);
      setPagination({
        ...pagination,
        total: validJobs.length
      });
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      message.error('Không thể tải danh sách công việc đã lưu');
      setSavedJobs([]);
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

  const handleRemoveSavedJob = async (jobId, savedJobId) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa công việc này khỏi danh sách đã lưu?',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn sẽ không thể theo dõi công việc này trong danh sách đã lưu sau khi xóa.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // If we have savedJobId directly, use it
          if (savedJobId) {
            await axios.delete(`http://localhost:5000/savedJobs/${savedJobId}`);
            message.success('Đã xóa công việc khỏi danh sách đã lưu');
            
            // Update UI
            setSavedJobs(savedJobs.filter(job => job.savedJobId !== savedJobId));
            
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
            return;
          }
          
          // If we don't have savedJobId, look it up
          // First get candidateId
          const candidateResponse = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);
          
          if (!candidateResponse.data || candidateResponse.data.length === 0) {
            message.error('Không tìm thấy thông tin ứng viên');
            return;
          }
          
          const candidateId = candidateResponse.data[0].id;
          
          // Look up saved job
          const savedJobResponse = await axios.get(`http://localhost:5000/savedJobs?candidateId=${candidateId}&jobId=${jobId}`);
          
          if (savedJobResponse.data && savedJobResponse.data.length > 0) {
            const savedJobId = savedJobResponse.data[0].id;
            
            // Delete saved job by ID
            await axios.delete(`http://localhost:5000/savedJobs/${savedJobId}`);
            message.success('Đã xóa công việc khỏi danh sách đã lưu');
            
            // Update UI
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
          } else {
            message.error('Không tìm thấy công việc đã lưu');
          }
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
      content: 'Thao tác này sẽ xóa tất cả công việc đã lưu của bạn và không thể hoàn tác.',
      okText: 'Xóa tất cả',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // First get candidateId
          const candidateResponse = await axios.get(`http://localhost:5000/candidates?userId=${user.id}`);
          
          if (!candidateResponse.data || candidateResponse.data.length === 0) {
            message.error('Không tìm thấy thông tin ứng viên');
            return;
          }
          
          const candidateId = candidateResponse.data[0].id;
          
          // Get all saved jobs for this candidate
          const savedJobsResponse = await axios.get(`http://localhost:5000/savedJobs?candidateId=${candidateId}`);
          const savedJobsData = savedJobsResponse.data || [];
          
          if (savedJobsData.length === 0) {
            message.info('Không có công việc đã lưu để xóa');
            return;
          }
          
          // Delete all saved jobs one by one
          await Promise.all(
            savedJobsData.map(job => axios.delete(`http://localhost:5000/savedJobs/${job.id}`))
          );
          
          message.success('Đã xóa tất cả công việc đã lưu');
          
          // Update UI
          setSavedJobs([]);
          setPagination({
            ...pagination,
            current: 1,
            total: 0
          });
        } catch (error) {
          console.error('Error removing all saved jobs:', error);
          message.error('Có lỗi xảy ra khi xóa tất cả công việc đã lưu');
        }
      }
    });
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
            <Link to={`/jobs/${job.id}`}>
              <Title level={4} className="job-title mb-1">{job.title}</Title>
            </Link>
            <Text className="company-name d-block mb-2">{job.company.name}</Text>
            
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
            
            <div className="description mb-2">
              {job.description && job.description.length > 150 
                ? `${job.description.substring(0, 150)}...`
                : job.description}
            </div>
            
            <Space className="job-meta">
              <Text type="secondary">
                <ClockCircleOutlined /> Đăng: {moment(job.postedDate).fromNow()}
              </Text>
              <Text type="secondary">
                Lưu: {moment(job.savedAt).fromNow()}
              </Text>
              {job.applicationDeadline && (
                <Text type={moment().isAfter(job.applicationDeadline) ? "danger" : "secondary"}>
                  Hạn nộp: {moment(job.applicationDeadline).format('DD/MM/YYYY')}
                </Text>
              )}
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
                onClick={() => handleRemoveSavedJob(job.id, job.savedJobId)}
                block
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
      <div className="page-header">
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <Title level={2}>Công việc đã lưu</Title>
          </Col>
          <Col>
            {savedJobs.length > 0 && (
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

      {loading ? (
        <div className="text-center py-5">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {savedJobs.length > 0 ? (
            <>
              <div className="job-cards">
                {savedJobs.map(job => renderJobCard(job))}
              </div>
              
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
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>
                  Bạn chưa lưu công việc nào.
                  <br />
                  <Link to="/jobs">Tìm kiếm công việc ngay</Link>
                </span>
              }
            />
          )}
        </>
      )}
    </div>
  );
};

export default SavedJobsPage; 