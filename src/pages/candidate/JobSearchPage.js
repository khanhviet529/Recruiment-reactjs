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
  Empty,
  Collapse,
  Tooltip,
  Badge,
  Popover
} from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  DollarOutlined, 
  ClockCircleOutlined,
  BookOutlined,
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  AppstoreOutlined,
  BarsOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';
import '../../styles/JobSearchPage.scss';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { Panel } = Collapse;

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
  const [sortOption, setSortOption] = useState('newest');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showLocationPopover, setShowLocationPopover] = useState(false);
  const [showCategoryPopover, setShowCategoryPopover] = useState(false);
  
  // Mock data for locations and categories
  const locations = [
    { id: 1, name: 'Hồ Chí Minh', count: 845 },
    { id: 2, name: 'Hà Nội', count: 723 },
    { id: 3, name: 'Đà Nẵng', count: 241 },
    { id: 4, name: 'An Giang', count: 38 },
    { id: 5, name: 'Bà Rịa - Vũng Tàu', count: 79 },
    { id: 6, name: 'Bình Dương', count: 156 },
    { id: 7, name: 'Cần Thơ', count: 112 },
  ];
  
  const categories = [
    { id: 1, name: 'Công nghệ thông tin', count: 623 },
    { id: 2, name: 'DevOps', count: 145 },
    { id: 3, name: 'Data Science', count: 98 },
    { id: 4, name: 'Marketing', count: 211 },
    { id: 5, name: 'Ngân hàng đầu tư', count: 76 },
    { id: 6, name: 'Giáo dục / Đào tạo', count: 134 },
  ];
  
  const [locationOptions, setLocationOptions] = useState([
    { value: '1', label: 'Hồ Chí Minh', count: 845 },
    { value: '2', label: 'Hà Nội', count: 723 },
    { value: '3', label: 'Đà Nẵng', count: 241 },
    { value: '4', label: 'An Giang', count: 38 },
    { value: '5', label: 'Bà Rịa - Vũng Tàu', count: 79 },
    { value: '6', label: 'Bình Dương', count: 156 },
    { value: '7', label: 'Cần Thơ', count: 112 },
  ]);
  
  const [categoryOptions, setCategoryOptions] = useState([
    { value: '1', label: 'Công nghệ thông tin', count: 623 },
    { value: '2', label: 'DevOps', count: 145 },
    { value: '3', label: 'Data Science', count: 98 },
    { value: '4', label: 'Marketing', count: 211 },
    { value: '5', label: 'Ngân hàng đầu tư', count: 76 },
    { value: '6', label: 'Giáo dục / Đào tạo', count: 134 },
  ]);
  
  const [selectedLocationValues, setSelectedLocationValues] = useState([]);
  const [selectedCategoryValues, setSelectedCategoryValues] = useState([]);
  
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

  const handleSortChange = (value) => {
    setSortOption(value);
    // You could sort the jobs here or update your API call
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleLocationSelect = (location) => {
    const index = selectedLocations.findIndex(loc => loc.id === location.id);
    
    if (index === -1) {
      // Add location
      setSelectedLocations([...selectedLocations, location]);
    } else {
      // Remove if already selected
      const newLocations = [...selectedLocations];
      newLocations.splice(index, 1);
      setSelectedLocations(newLocations);
    }
    
    // Update filters
    handleFilterChange('location', location.name);
  };
  
  const handleCategorySelect = (category) => {
    const index = selectedCategories.findIndex(cat => cat.id === category.id);
    
    if (index === -1) {
      // Add category
      setSelectedCategories([...selectedCategories, category]);
    } else {
      // Remove if already selected
      const newCategories = [...selectedCategories];
      newCategories.splice(index, 1);
      setSelectedCategories(newCategories);
    }
    
    // Update filters
    handleFilterChange('category', category.name);
  };
  
  const removeSelectedLocation = (locationId) => {
    const newLocations = selectedLocations.filter(loc => loc.id !== locationId);
    setSelectedLocations(newLocations);
    
    // If all locations removed, clear the filter
    if (newLocations.length === 0) {
      handleFilterChange('location', '');
    } else {
      // Otherwise update with remaining locations
      handleFilterChange('location', newLocations[0].name);
    }
  };
  
  const removeSelectedCategory = (categoryId) => {
    const newCategories = selectedCategories.filter(cat => cat.id !== categoryId);
    setSelectedCategories(newCategories);
    
    // If all categories removed, clear the filter
    if (newCategories.length === 0) {
      handleFilterChange('category', '');
    } else {
      // Otherwise update with remaining categories
      handleFilterChange('category', newCategories[0].name);
    }
  };
  
  const locationPopoverContent = (
    <div className="location-popover">
      <div className="location-search">
        <Input placeholder="Chọn địa điểm..." prefix={<SearchOutlined />} />
      </div>
      <div className="location-list">
        {locations.map(location => (
          <div 
            key={location.id} 
            className={`location-item ${selectedLocations.some(loc => loc.id === location.id) ? 'selected' : ''}`}
            onClick={() => handleLocationSelect(location)}
          >
            <div className="location-name">{location.name}</div>
            <div className="location-count">({location.count})</div>
            {selectedLocations.some(loc => loc.id === location.id) && (
              <div className="location-check">✓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  
  const categoryPopoverContent = (
    <div className="category-popover">
      <div className="category-list">
        {categories.map(category => (
          <div 
            key={category.id} 
            className={`category-item ${selectedCategories.some(cat => cat.id === category.id) ? 'selected' : ''}`}
            onClick={() => handleCategorySelect(category)}
          >
            <div className="category-name">{category.name}</div>
            <div className="category-count">({category.count})</div>
            {selectedCategories.some(cat => cat.id === category.id) && (
              <div className="category-check">✓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

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

  const handleLocationChange = (values) => {
    setSelectedLocationValues(values);
    
    // Get the location names from the values
    const selectedLocations = locationOptions
      .filter(option => values.includes(option.value))
      .map(option => option.label);
    
    // Update the filter with the first selected location or empty string if none selected
    handleFilterChange('location', selectedLocations[0] || '');
  };
  
  const handleCategoryChange = (values) => {
    setSelectedCategoryValues(values);
    
    // Get the category names from the values
    const selectedCategories = categoryOptions
      .filter(option => values.includes(option.value))
      .map(option => option.label);
    
    // Update the filter with the first selected category or empty string if none selected
    handleFilterChange('category', selectedCategories[0] || '');
  };

  const locationOptionRender = (option) => (
    <div className="custom-select-option">
      <div className="option-label">{option.label}</div>
      <div className="option-count">({option.count})</div>
    </div>
  );
  
  const categoryOptionRender = (option) => (
    <div className="custom-select-option">
      <div className="option-label">{option.label}</div>
      <div className="option-count">({option.count})</div>
    </div>
  );

  return (
    <div className="job-search-page">
      <Row gutter={[24, 24]}>
        {/* Search header with main search input */}
        <Col xs={24}>
          <Card className="search-header-card">
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <Title level={4} className="text-center mb-4">Tìm kiếm công việc phù hợp</Title>
              <Search
                placeholder="Tìm kiếm theo vị trí, công ty, từ khóa..."
                allowClear
                enterButton={<Button type="primary" icon={<SearchOutlined />}>Tìm kiếm</Button>}
                size="large"
                onSearch={handleSearch}
                className="main-search-input"
              />
            </div>
          </Card>
        </Col>

        {/* Filter sidebar - Desktop */}
        <Col xs={24} lg={6} className="filter-sidebar d-none d-lg-block">
          <Card title="Bộ lọc tìm kiếm" extra={
            <Button type="link" onClick={() => {
              setFilters(defaultFilters);
              setSelectedLocationValues([]);
              setSelectedCategoryValues([]);
            }}>
              Đặt lại
            </Button>
          }>
            <Collapse defaultActiveKey={['1', '2', '3', '4']} bordered={false} expandIconPosition="end">
              <Panel header={<strong>Địa điểm</strong>} key="1">
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder={<span><EnvironmentOutlined /> Chọn địa điểm...</span>}
                  value={selectedLocationValues}
                  onChange={handleLocationChange}
                  optionLabelProp="label"
                  options={locationOptions}
                  optionRender={locationOptionRender}
                  maxTagCount={3}
                  maxTagTextLength={12}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  className="location-select"
                  tagRender={(props) => (
                    <Tag closable={props.closable} onClose={props.onClose} className="custom-select-tag">
                      {props.label}
                    </Tag>
                  )}
                  dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                  dropdownClassName="location-dropdown"
                />
              </Panel>
              
              <Panel header={<strong>Ngành nghề</strong>} key="2">
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder={<span><AppstoreOutlined /> Chọn ngành nghề...</span>}
                  value={selectedCategoryValues}
                  onChange={handleCategoryChange}
                  optionLabelProp="label"
                  options={categoryOptions}
                  optionRender={categoryOptionRender}
                  maxTagCount={3}
                  maxTagTextLength={12}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  className="category-select"
                  tagRender={(props) => (
                    <Tag closable={props.closable} onClose={props.onClose} className="custom-select-tag">
                      {props.label}
                    </Tag>
                  )}
                  dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                  dropdownClassName="category-dropdown"
                />
              </Panel>
              
              <Panel header={<strong>Loại công việc</strong>} key="3">
                <Select
                  placeholder="Chọn loại công việc"
                  style={{ width: '100%' }}
                  allowClear
                  value={filters.jobType}
                  onChange={(value) => handleFilterChange('jobType', value)}
                >
                  <Option value="Full-time">Toàn thời gian</Option>
                  <Option value="Part-time">Bán thời gian</Option>
                  <Option value="Contract">Hợp đồng</Option>
                  <Option value="Freelance">Freelance</Option>
                  <Option value="Internship">Thực tập</Option>
                </Select>
              </Panel>
              
              <Panel header={<strong>Mức lương (triệu đồng)</strong>} key="4">
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
                <div className="salary-range-display mt-2 text-center">
                  <Badge.Ribbon text="Mức lương" color="blue">
                    <Card size="small">
                      {filters.salaryRange[0]} - {filters.salaryRange[1]} triệu đồng
                    </Card>
                  </Badge.Ribbon>
                </div>
              </Panel>
              
              <Panel header={<strong>Kinh nghiệm</strong>} key="5">
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
              </Panel>
            </Collapse>
            
            <Button 
              type="primary"
              onClick={fetchJobs}
              style={{ width: '100%', marginTop: '20px' }}
              icon={<FilterOutlined />}
            >
              Áp dụng bộ lọc
            </Button>
          </Card>
        </Col>
        
        {/* Mobile Filters - Collapsible */}
        <Col xs={24} className="d-block d-lg-none">
          <Card>
            <Collapse bordered={false}>
              <Panel 
                header={<Text strong><FilterOutlined /> Bộ lọc tìm kiếm</Text>} 
                key="mobile-filters"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Text strong>Địa điểm</Text>
                    <Select
                      mode="multiple"
                      style={{ width: '100%', marginTop: '8px' }}
                      placeholder={<span><EnvironmentOutlined /> Chọn địa điểm...</span>}
                      value={selectedLocationValues}
                      onChange={handleLocationChange}
                      optionLabelProp="label"
                      options={locationOptions}
                      optionRender={locationOptionRender}
                      maxTagCount={2}
                      maxTagTextLength={10}
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      className="location-select"
                      tagRender={(props) => (
                        <Tag closable={props.closable} onClose={props.onClose} className="custom-select-tag">
                          {props.label}
                        </Tag>
                      )}
                      dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                      dropdownClassName="location-dropdown"
                    />
                  </Col>
                  
                  <Col xs={24}>
                    <Text strong>Ngành nghề</Text>
                    <Select
                      mode="multiple"
                      style={{ width: '100%', marginTop: '8px' }}
                      placeholder={<span><AppstoreOutlined /> Chọn ngành nghề...</span>}
                      value={selectedCategoryValues}
                      onChange={handleCategoryChange}
                      optionLabelProp="label"
                      options={categoryOptions}
                      optionRender={categoryOptionRender}
                      maxTagCount={2}
                      maxTagTextLength={10}
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      className="category-select"
                      tagRender={(props) => (
                        <Tag closable={props.closable} onClose={props.onClose} className="custom-select-tag">
                          {props.label}
                        </Tag>
                      )}
                      dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                      dropdownClassName="category-dropdown"
                    />
                  </Col>
                  
                  <Col xs={24}>
                    <Text strong>Loại công việc</Text>
                    <Select
                      placeholder="Chọn loại công việc"
                      style={{ width: '100%', marginTop: '8px' }}
                      allowClear
                      value={filters.jobType}
                      onChange={(value) => handleFilterChange('jobType', value)}
                    >
                      <Option value="Full-time">Toàn thời gian</Option>
                      <Option value="Part-time">Bán thời gian</Option>
                      <Option value="Contract">Hợp đồng</Option>
                      <Option value="Freelance">Freelance</Option>
                      <Option value="Internship">Thực tập</Option>
                    </Select>
                  </Col>
                  
                  <Col xs={24}>
                    <Text strong>Mức lương (triệu đồng)</Text>
                    <Slider
                      range
                      min={0}
                      max={100}
                      value={filters.salaryRange}
                      onChange={(value) => handleFilterChange('salaryRange', value)}
                      marks={{
                        0: '0',
                        50: '50',
                        100: '100+'
                      }}
                      style={{ marginTop: '16px' }}
                    />
                  </Col>
                  
                  <Col xs={24}>
                    <Text strong>Kinh nghiệm</Text>
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
                      style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                    />
                  </Col>
                </Row>
                
                <div className="mt-3 d-flex justify-content-between">
                  <Button onClick={() => {
                    setFilters(defaultFilters);
                    setSelectedLocationValues([]);
                    setSelectedCategoryValues([]);
                  }}>
                    Đặt lại
                  </Button>
                  <Button 
                    type="primary"
                    onClick={fetchJobs}
                    icon={<FilterOutlined />}
                  >
                    Áp dụng bộ lọc
                  </Button>
                </div>
              </Panel>
            </Collapse>
          </Card>
        </Col>
        
        {/* Job listings */}
        <Col xs={24} lg={18}>
          <Card>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
              <Title level={4} style={{ margin: 0 }}>
                {pagination.total > 0 ? (
                  <Badge count={pagination.total} overflowCount={9999} style={{ backgroundColor: '#52c41a' }}>
                    <span style={{ marginRight: '10px' }}>Kết quả tìm kiếm</span>
                  </Badge>
                ) : (
                  'Kết quả tìm kiếm'
                )}
              </Title>
              
              <Space className="mb-2 mb-md-0">
                <Select
                  value={sortOption}
                  style={{ width: 180 }}
                  onChange={handleSortChange}
                  suffixIcon={<SortAscendingOutlined />}
                >
                  <Option value="newest">Mới nhất</Option>
                  <Option value="salary-desc">Lương cao đến thấp</Option>
                  <Option value="salary-asc">Lương thấp đến cao</Option>
                  <Option value="relevance">Phù hợp nhất</Option>
                </Select>
                
                <Space className="view-mode-toggle">
                  <Tooltip title="Xem dạng lưới">
                    <Button 
                      type={viewMode === 'card' ? 'primary' : 'default'} 
                      icon={<AppstoreOutlined />}
                      onClick={() => handleViewModeChange('card')}
                    />
                  </Tooltip>
                  <Tooltip title="Xem dạng danh sách">
                    <Button 
                      type={viewMode === 'list' ? 'primary' : 'default'} 
                      icon={<BarsOutlined />}
                      onClick={() => handleViewModeChange('list')}
                    />
                  </Tooltip>
                </Space>
              </Space>
            </div>
            
            <Divider style={{ margin: '12px 0' }} />
            
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
                description={
                  <span>
                    Không tìm thấy công việc nào phù hợp với tiêu chí tìm kiếm
                    <div className="mt-3">
                      <Button type="primary" onClick={() => setFilters(defaultFilters)}>
                        Xóa bộ lọc
                      </Button>
                    </div>
                  </span>
                }
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
