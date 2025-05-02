import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Card, 
  Row, 
  Col, 
  Input, 
  Select, 
  Button, 
  Table, 
  Tag, 
  Space, 
  Slider, 
  Checkbox,
  Pagination,
  Typography,
  Divider,
  message,
  Empty
} from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  DollarOutlined, 
  ClockCircleOutlined,
  BookOutlined,
  HeartOutlined,
  HeartFilled,
  EyeOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const JobSearchPage = () => {
  const { user } = useSelector((state) => state.auth || {});
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // Ensure filters is properly initialized
  const defaultFilters = {
    keyword: '',
    location: '',
    category: '',
    jobType: '',
    salaryRange: [0, 100],
    experience: []
  };
  
  const [filters, setFilters] = useState(defaultFilters);
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, [
    user, 
    pagination.current, 
    pagination.pageSize, 
    filters.keyword,
    filters.location,
    filters.category,
    filters.jobType,
    // Only include salaryRange if it exists
    filters.salaryRange && filters.salaryRange[0],
    filters.salaryRange && filters.salaryRange[1],
    // Only check experience length if it exists
    filters.experience && filters.experience.length
  ]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        keyword: filters.keyword || '',
        location: filters.location || '',
        category: filters.category || '',
        jobType: filters.jobType || '',
        minSalary: (filters.salaryRange && filters.salaryRange[0]) ? filters.salaryRange[0] * 1000000 : 0,
        maxSalary: (filters.salaryRange && filters.salaryRange[1]) ? filters.salaryRange[1] * 1000000 : 100000000,
        experience: filters.experience && Array.isArray(filters.experience) ? filters.experience.join(',') : ''
      };
      
      try {
        const response = await axios.get('http://localhost:5000/jobs', { params });
        
        setJobs(response.data.items);
        setPagination({
          ...pagination,
          total: response.data.total
        });
      } catch (apiError) {
        console.warn('Using mock data for jobs:', apiError);
        
        // Mock data
        const mockJobs = Array(50).fill(null).map((_, index) => ({
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
          isFeatured: index % 10 === 0
        }));
        
        // Filter mock data
        let filteredJobs = [...mockJobs];
        
        if (filters.keyword) {
          const keyword = filters.keyword.toLowerCase();
          filteredJobs = filteredJobs.filter(job => 
            job.title.toLowerCase().includes(keyword) || 
            job.company.name.toLowerCase().includes(keyword) ||
            job.description.toLowerCase().includes(keyword)
          );
        }
        
        if (filters.location) {
          filteredJobs = filteredJobs.filter(job => job.location === filters.location);
        }
        
        if (filters.category) {
          filteredJobs = filteredJobs.filter(job => job.category === filters.category);
        }
        
        if (filters.jobType) {
          filteredJobs = filteredJobs.filter(job => job.jobType === filters.jobType);
        }
        
        if (filters.salaryRange && (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 100)) {
          filteredJobs = filteredJobs.filter(job => {
            const minSalaryInMillion = filters.salaryRange[0] || 0;
            const maxSalaryInMillion = filters.salaryRange[1] || 100;
            const jobMinSalaryInMillion = job.salary.min / 1000000;
            const jobMaxSalaryInMillion = job.salary.max / 1000000;
            
            return jobMinSalaryInMillion >= minSalaryInMillion && jobMaxSalaryInMillion <= maxSalaryInMillion;
          });
        }
        
        if (filters.experience && Array.isArray(filters.experience) && filters.experience.length > 0) {
          filteredJobs = filteredJobs.filter(job => filters.experience.includes(job.experience));
        }
        
        // Pagination calculation for mock data
        const startIndex = (pagination.current - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
        
        setJobs(paginatedJobs);
        setPagination({
          ...pagination,
          total: filteredJobs.length
        });
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      message.error('Không thể tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      if (!user) {
        setSavedJobs([]);
        return;
      }
      
      try {
        const response = await axios.get(`http://localhost:5000/candidates/${user.id}/saved-jobs`);
        setSavedJobs(response.data.map(job => job.id));
      } catch (error) {
        console.warn('Using mock saved jobs:', error);
        // Mock saved jobs for demonstration
        setSavedJobs([101, 105, 110]);
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      setSavedJobs([]);
    }
  };

  const handleToggleSaveJob = async (jobId) => {
    try {
      if (!user) {
        message.warning('Vui lòng đăng nhập để lưu công việc');
        return;
      }
      
      if (!savedJobs) {
        setSavedJobs([]);
        return;
      }
      
      const isSaved = Array.isArray(savedJobs) ? savedJobs.includes(jobId) : false;
      
      if (isSaved) {
        // Remove from saved jobs
        await axios.delete(`http://localhost:5000/candidates/${user.id}/saved-jobs/${jobId}`);
        message.success('Đã xóa khỏi danh sách công việc đã lưu');
        setSavedJobs(savedJobs.filter(id => id !== jobId));
      } else {
        // Add to saved jobs
        await axios.post(`http://localhost:5000/candidates/${user.id}/saved-jobs`, { jobId });
        message.success('Đã lưu công việc thành công');
        setSavedJobs([...savedJobs, jobId]);
      }
    } catch (error) {
      console.error('Error toggling saved job:', error);
      
      // For development, update UI anyway
      if (!savedJobs) {
        setSavedJobs([jobId]);
        return;
      }
      
      const isSaved = Array.isArray(savedJobs) ? savedJobs.includes(jobId) : false;
      
      if (isSaved) {
        message.success('Đã xóa khỏi danh sách công việc đã lưu');
        setSavedJobs(savedJobs.filter(id => id !== jobId));
      } else {
        message.success('Đã lưu công việc thành công');
        setSavedJobs([...savedJobs, jobId]);
      }
    }
  };

  const handleSearch = (value) => {
    setFilters({
      ...filters,
      keyword: value
    });
    setPagination({
      ...pagination,
      current: 1
    });
  };

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
    setPagination({
      ...pagination,
      current: 1
    });
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize
    });
  };

  const renderJobCard = (job) => {
    // If job is undefined, don't render anything
    if (!job) return null;
    
    const isSaved = savedJobs && Array.isArray(savedJobs) ? savedJobs.includes(job.id) : false;
    
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
                {job.isFeatured && (
                  <Tag color="gold" className="ml-2">Featured</Tag>
                )}
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
          </Col>
          <Col xs={24} sm={4} className="text-right">
            <Space direction="vertical">
              <Button 
                type="text" 
                icon={isSaved ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} 
                onClick={() => handleToggleSaveJob(job.id)}
              >
                {isSaved ? 'Đã lưu' : 'Lưu'}
              </Button>
              <Link to={`/candidate/jobs/${job.id}`}>
                <Button type="primary" icon={<EyeOutlined />}>
                  Xem chi tiết
                </Button>
              </Link>
              <div className="posted-date mt-2">
                <Text type="secondary">
                  {moment(job.postedDate).fromNow()}
                </Text>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <div className="job-search-page">
      <Row gutter={[16, 16]}>
        {/* Search and filters */}
        <Col xs={24}>
          <Card>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <Search
                placeholder="Tìm kiếm theo vị trí, công ty, từ khóa..."
                allowClear
                enterButton={<Button type="primary" icon={<SearchOutlined />}>Tìm kiếm</Button>}
                size="large"
                onSearch={handleSearch}
              />
            </div>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Địa điểm"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={(value) => handleFilterChange('location', value)}
                >
                  <Option value="Hà Nội">Hà Nội</Option>
                  <Option value="Hồ Chí Minh">Hồ Chí Minh</Option>
                  <Option value="Đà Nẵng">Đà Nẵng</Option>
                  <Option value="Nha Trang">Nha Trang</Option>
                  <Option value="Cần Thơ">Cần Thơ</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Ngành nghề"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={(value) => handleFilterChange('category', value)}
                >
                  <Option value="Web Development">Web Development</Option>
                  <Option value="Mobile Development">Mobile Development</Option>
                  <Option value="UI/UX Design">UI/UX Design</Option>
                  <Option value="DevOps">DevOps</Option>
                  <Option value="Data Science">Data Science</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Loại công việc"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={(value) => handleFilterChange('jobType', value)}
                >
                  <Option value="Full-time">Toàn thời gian</Option>
                  <Option value="Part-time">Bán thời gian</Option>
                  <Option value="Contract">Hợp đồng</Option>
                  <Option value="Freelance">Freelance</Option>
                  <Option value="Internship">Thực tập</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button 
                  type="primary"
                  onClick={fetchJobs}
                  style={{ width: '100%' }}
                >
                  Áp dụng bộ lọc
                </Button>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="filter-section">
                  <Title level={5}>Mức lương (triệu đồng)</Title>
                  <Slider
                    range
                    min={0}
                    max={100}
                    value={filters.salaryRange}
                    onChange={(value) => handleFilterChange('salaryRange', value)}
                    marks={{
                      0: '0',
                      25: '25',
                      50: '50',
                      75: '75',
                      100: '100+'
                    }}
                  />
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="filter-section">
                  <Title level={5}>Kinh nghiệm</Title>
                  <Checkbox.Group
                    options={[
                      { label: '0-1 năm', value: '0-1 năm' },
                      { label: '1-3 năm', value: '1-3 năm' },
                      { label: '3-5 năm', value: '3-5 năm' },
                      { label: '5-7 năm', value: '5-7 năm' },
                      { label: '7+ năm', value: '7+ năm' }
                    ]}
                    value={filters.experience}
                    onChange={(values) => handleFilterChange('experience', values)}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        
        {/* Job listings */}
        <Col xs={24}>
          <Card>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Title level={4} style={{ margin: 0 }}>
                Kết quả tìm kiếm ({pagination.total} công việc)
              </Title>
              <Select
                defaultValue="newest"
                style={{ width: 180 }}
              >
                <Option value="newest">Mới nhất</Option>
                <Option value="salary-desc">Lương cao đến thấp</Option>
                <Option value="salary-asc">Lương thấp đến cao</Option>
                <Option value="relevance">Phù hợp nhất</Option>
              </Select>
            </div>
            
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : jobs && jobs.length > 0 ? (
              <div className="job-results">
                {jobs.map(job => job ? renderJobCard(job) : null)}
                
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
              <Empty
                description="Không tìm thấy công việc nào phù hợp với tiêu chí tìm kiếm"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default JobSearchPage;
