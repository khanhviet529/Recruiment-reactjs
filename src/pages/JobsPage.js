import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import JobCard from '../components/common/JobCard';
import { 
  Card, 
  Row, 
  Col, 
  Input, 
  Select, 
  Button, 
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
  Space,
  Tag
} from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  DollarOutlined, 
  FilterOutlined,
  SortAscendingOutlined,
  AppstoreOutlined,
  BarsOutlined
} from '@ant-design/icons';
import '../styles/jobPage.scss';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { Panel } = Collapse;

const JobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // Jobs per page
  const [totalJobs, setTotalJobs] = useState(0);
  const [savedJobs, setSavedJobs] = useState([]);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [sortOption, setSortOption] = useState('newest');

  // Filter states
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    search: '',
    location: [],
    industries: [],
    experienceLevels: [],
    jobLevels: [],
    salaries: [0, 100], // In millions
    educationLevels: [],
    jobTypes: [],
    postingDates: []
  });

  // For select components
  const [selectedLocationValues, setSelectedLocationValues] = useState([]);
  const [selectedIndustryValues, setSelectedIndustryValues] = useState([]);
  const [selectedJobTypeValues, setSelectedJobTypeValues] = useState([]);
  const [selectedExpLevelValues, setSelectedExpLevelValues] = useState([]);

  // Location and industry options
  const [locationOptions, setLocationOptions] = useState([]);
  const [industryOptions, setIndustryOptions] = useState([]);
  const [jobTypeOptions, setJobTypeOptions] = useState([]);
  const [expLevelOptions, setExpLevelOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all required data
        const [jobsResponse, locationsResponse, filtersResponse] = await Promise.all([
          axios.get('http://localhost:5000/jobs'),
          axios.get('http://localhost:5000/locations'),
          axios.get('http://localhost:5000/jobFilters')
        ]);

        // Convert jobs data to array if needed
        const jobsArray = Array.isArray(jobsResponse.data) ? jobsResponse.data : [jobsResponse.data];
        
        // Fetch all employers first to avoid multiple API calls
        let employers = [];
        try {
          const employersResponse = await axios.get(`http://localhost:5000/employers`);
          employers = employersResponse.data;
        } catch (error) {
          console.error('Error fetching employers:', error);
        }
        
        // Map jobs with employer data
        const jobsWithEmployerData = jobsArray.map(job => {
          const employer = employers.find(emp => emp.userId === job.employerId);
          
          if (employer) {
            return {
              ...job,
              companyLogo: employer.logo || employer.profilePicture || `https://via.placeholder.com/100?text=${(employer.companyName || 'C').charAt(0)}`,
              companyName: employer.companyName || 'Company Name',
              employerData: employer
            };
          } else {
            return {
              ...job,
              companyLogo: `https://via.placeholder.com/100?text=${job.title ? job.title.charAt(0) : 'C'}`,
              companyName: 'Company Name',
              employerData: null
            };
          }
        });
        
        setJobs(jobsWithEmployerData);
        setLocations(locationsResponse.data);
        setFilters(filtersResponse.data);
        
        // Format location options for Select component
        const formattedLocations = locationsResponse.data.map(location => ({
          value: location.id.toString(),
          label: location.name,
          count: location.jobCount || 0
        }));
        setLocationOptions(formattedLocations);
        
        // Format industry options
        const formattedIndustries = filtersResponse.data.industries.map(industry => ({
          value: industry.id.toString(),
          label: industry.name,
          count: industry.count || 0
        }));
        setIndustryOptions(formattedIndustries);
        
        // Format job type options
        const formattedJobTypes = filtersResponse.data.jobTypes.map(type => ({
          value: type.id.toString(),
          label: type.name,
          count: type.count || 0
        }));
        setJobTypeOptions(formattedJobTypes);
        
        // Format experience level options
        const formattedExpLevels = filtersResponse.data.experienceLevels.map(level => ({
          value: level.id.toString(),
          label: level.name,
          count: level.count || 0
        }));
        setExpLevelOptions(formattedExpLevels);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu');
        setLoading(false);
      }
    };

    fetchData();
    // For demo purposes, set some random saved jobs
    setSavedJobs([101, 105, 110]);
  }, []);

  // Filter jobs based on selected filters
  const filterJobs = (jobsToFilter) => {
    return jobsToFilter.filter(job => {
      // Search filter
      if (selectedFilters.search) {
        const searchTerm = selectedFilters.search.toLowerCase();
        if (!job.title.toLowerCase().includes(searchTerm) && 
            !job.description.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      // Location filter
      if (selectedFilters.location.length > 0) {
        const locationNames = selectedFilters.location.map(loc => loc.name || loc);
        if (!locationNames.includes(job.location)) {
          return false;
        }
      }

      // Industry filter
      if (selectedFilters.industries.length > 0) {
        const industryNames = selectedFilters.industries.map(ind => ind.name || ind);
        if (!industryNames.some(industry => job.categories.includes(industry))) {
          return false;
        }
      }

      // Experience level filter
      if (selectedFilters.experienceLevels.length > 0) {
        const expLevelNames = selectedFilters.experienceLevels.map(exp => exp.name || exp);
        if (!expLevelNames.includes(job.experienceLevel)) {
          return false;
        }
      }

      // Job level filter
      if (selectedFilters.jobLevels.length > 0) {
        const jobLevelNames = selectedFilters.jobLevels.map(level => level.name || level);
        if (!jobLevelNames.includes(job.jobLevel)) {
          return false;
        }
      }

      // Salary filter
      if (selectedFilters.salaries && 
          (selectedFilters.salaries[0] > 0 || selectedFilters.salaries[1] < 100)) {
        const minSalaryInMillion = selectedFilters.salaries[0] || 0;
        const maxSalaryInMillion = selectedFilters.salaries[1] || 100;
        
        if (job.salary.isHidden) {
          return minSalaryInMillion === 0; // Include only if min salary filter is 0
        }
        
        const jobMinSalaryInMillion = job.salary.min / 1000000;
        const jobMaxSalaryInMillion = job.salary.max / 1000000;
        
        if (jobMinSalaryInMillion < minSalaryInMillion || jobMaxSalaryInMillion > maxSalaryInMillion) {
          return false;
        }
      }

      // Education level filter
      if (selectedFilters.educationLevels.length > 0) {
        const eduLevelNames = selectedFilters.educationLevels.map(edu => edu.name || edu);
        if (!eduLevelNames.includes(job.educationLevel)) {
          return false;
        }
      }

      // Job type filter
      if (selectedFilters.jobTypes.length > 0) {
        const jobTypeNames = selectedFilters.jobTypes.map(type => type.name || type);
        if (!jobTypeNames.includes(job.jobType)) {
          return false;
        }
      }

      // Posting date filter
      if (selectedFilters.postingDates.length > 0) {
        const jobDate = new Date(job.createdAt);
        const now = new Date();
        if (!selectedFilters.postingDates.some(date => {
          const daysAgo = Math.floor((now - jobDate) / (1000 * 60 * 60 * 24));
          return daysAgo <= (date.days || parseInt(date));
        })) {
          return false;
        }
      }

      return true;
    });
  };

  // Sort jobs based on selected option
  const sortJobs = (jobsToSort) => {
    switch(sortOption) {
      case 'newest':
        return [...jobsToSort].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      case 'salary-desc':
        return [...jobsToSort].sort((a, b) => {
          if (a.salary.isHidden && b.salary.isHidden) return 0;
          if (a.salary.isHidden) return 1;
          if (b.salary.isHidden) return -1;
          return b.salary.max - a.salary.max;
        });
      case 'salary-asc':
        return [...jobsToSort].sort((a, b) => {
          if (a.salary.isHidden && b.salary.isHidden) return 0;
          if (a.salary.isHidden) return 1;
          if (b.salary.isHidden) return -1;
          return a.salary.min - b.salary.min;
        });
      default:
        return [...jobsToSort];
    }
  };

  // Handle search input
  const handleSearch = (value) => {
    setSelectedFilters(prevFilters => ({
      ...prevFilters,
      search: value
    }));
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setSelectedFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
    setCurrentPage(1);
  };

  // Handle location select
  const handleLocationChange = (values) => {
    setSelectedLocationValues(values);
    
    // Get the location objects from the values
    const selectedLocs = locationOptions
      .filter(option => values.includes(option.value))
      .map(option => option.label);
    
    handleFilterChange('location', selectedLocs);
  };

  // Handle industry select
  const handleIndustryChange = (values) => {
    setSelectedIndustryValues(values);
    
    // Get the industry objects from the values
    const selectedInds = industryOptions
      .filter(option => values.includes(option.value))
      .map(option => option.label);
    
    handleFilterChange('industries', selectedInds);
  };

  // Handle job type select
  const handleJobTypeChange = (values) => {
    setSelectedJobTypeValues(values);
    
    // Get the job type objects from the values
    const selectedTypes = jobTypeOptions
      .filter(option => values.includes(option.value))
      .map(option => option.label);
    
    handleFilterChange('jobTypes', selectedTypes);
  };

  // Handle experience level select
  const handleExpLevelChange = (values) => {
    setSelectedExpLevelValues(values);
    
    // Get the experience level objects from the values
    const selectedLevels = expLevelOptions
      .filter(option => values.includes(option.value))
      .map(option => option.label);
    
    handleFilterChange('experienceLevels', selectedLevels);
  };

  // Handle pagination change
  const handlePaginationChange = (page, pageSizeValue) => {
    setCurrentPage(page);
    setPageSize(pageSizeValue);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Reset all filters
  const clearAllFilters = () => {
    setSelectedFilters({
      search: '',
      location: [],
      industries: [],
      experienceLevels: [],
      jobLevels: [],
      salaries: [0, 100],
      educationLevels: [],
      jobTypes: [],
      postingDates: []
    });
    
    // Reset all select values
    setSelectedLocationValues([]);
    setSelectedIndustryValues([]);
    setSelectedJobTypeValues([]);
    setSelectedExpLevelValues([]);
    
    setCurrentPage(1);
  };

  // Handle toggle save job
  const handleToggleSaveJob = (jobId) => {
    if (!savedJobs) {
      setSavedJobs([jobId]);
      message.success('Đã lưu công việc thành công');
      return;
    }
    
    const isSaved = savedJobs.includes(jobId);
    
    if (isSaved) {
      setSavedJobs(prevSavedJobs => prevSavedJobs.filter(id => id !== jobId));
      message.success('Đã xóa khỏi danh sách công việc đã lưu');
    } else {
      setSavedJobs(prevSavedJobs => [...prevSavedJobs, jobId]);
      message.success('Đã lưu công việc thành công');
    }
  };

  // Use memoization to prevent unnecessary recalculations
  const filteredAndSortedJobs = useMemo(() => {
    const filteredJobs = filterJobs(jobs);
    return sortJobs(filteredJobs);
  }, [jobs, selectedFilters, sortOption]);

  // Update total jobs count whenever filteredAndSortedJobs changes
  useEffect(() => {
    setTotalJobs(filteredAndSortedJobs.length);
  }, [filteredAndSortedJobs]);

  // Get current jobs for display - use memoization to prevent recalculations
  const currentJobs = useMemo(() => {
    const indexOfLastJob = currentPage * pageSize;
    const indexOfFirstJob = indexOfLastJob - pageSize;
    return filteredAndSortedJobs.slice(indexOfFirstJob, indexOfLastJob);
  }, [filteredAndSortedJobs, currentPage, pageSize]);

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    Object.keys(selectedFilters).forEach(key => {
      if (key === 'search' && selectedFilters[key]) {
        count++;
      } else if (key === 'salaries') {
        if (selectedFilters[key][0] > 0 || selectedFilters[key][1] < 100) {
          count++;
        }
      } else if (Array.isArray(selectedFilters[key])) {
        count += selectedFilters[key].length;
      }
    });
    return count;
  };

  // Custom option render for Select components
  const customOptionRender = (option) => (
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
                      value={selectedFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="main-search-input"
                    />
                  </div>
          </Card>
        </Col>

        {/* Filter sidebar - Desktop */}
        <Col xs={24} lg={6} className="filter-sidebar d-none d-lg-block">
          <Card 
            title="Bộ lọc tìm kiếm" 
            extra={
              <Button 
                type="link" 
                onClick={clearAllFilters} 
                disabled={getActiveFilterCount() === 0}
              >
                Đặt lại
              </Button>
            }
          >
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
                  optionRender={customOptionRender}
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
                />
              </Panel>
              
              <Panel header={<strong>Ngành nghề</strong>} key="2">
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder={<span><AppstoreOutlined /> Chọn ngành nghề...</span>}
                  value={selectedIndustryValues}
                  onChange={handleIndustryChange}
                  optionLabelProp="label"
                  options={industryOptions}
                  optionRender={customOptionRender}
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
                />
              </Panel>
              
              <Panel header={<strong>Loại công việc</strong>} key="3">
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Chọn loại công việc"
                  value={selectedJobTypeValues}
                  onChange={handleJobTypeChange}
                  optionLabelProp="label"
                  options={jobTypeOptions}
                  optionRender={customOptionRender}
                  maxTagCount={3}
                  maxTagTextLength={12}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  className="job-type-select"
                />
              </Panel>
              
              <Panel header={<strong>Mức lương (triệu đồng)</strong>} key="4">
                <Slider
                  range
                  min={0}
                  max={100}
                  value={selectedFilters.salaries}
                  onChange={(value) => handleFilterChange('salaries', value)}
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
                      {selectedFilters.salaries[0]} - {selectedFilters.salaries[1]} triệu đồng
                    </Card>
                  </Badge.Ribbon>
                  </div>
              </Panel>
              
              <Panel header={<strong>Kinh nghiệm</strong>} key="5">
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Chọn kinh nghiệm"
                  value={selectedExpLevelValues}
                  onChange={handleExpLevelChange}
                  optionLabelProp="label"
                  options={expLevelOptions}
                  optionRender={customOptionRender}
                  maxTagCount={3}
                  maxTagTextLength={12}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  className="exp-level-select"
                />
              </Panel>
            </Collapse>
            
            <Button 
              type="primary"
              onClick={() => setCurrentPage(1)} // Refresh results
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
                      optionRender={customOptionRender}
                      maxTagCount={2}
                      maxTagTextLength={10}
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      className="location-select"
                    />
                  </Col>
                  
                  <Col xs={24}>
                    <Text strong>Ngành nghề</Text>
                    <Select
                      mode="multiple"
                      style={{ width: '100%', marginTop: '8px' }}
                      placeholder={<span><AppstoreOutlined /> Chọn ngành nghề...</span>}
                      value={selectedIndustryValues}
                      onChange={handleIndustryChange}
                      optionLabelProp="label"
                      options={industryOptions}
                      optionRender={customOptionRender}
                      maxTagCount={2}
                      maxTagTextLength={10}
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      className="category-select"
                    />
                  </Col>
                  
                  <Col xs={24}>
                    <Text strong>Loại công việc</Text>
                    <Select
                      mode="multiple"
                      style={{ width: '100%', marginTop: '8px' }}
                      placeholder="Chọn loại công việc"
                      value={selectedJobTypeValues}
                      onChange={handleJobTypeChange}
                      optionLabelProp="label"
                      options={jobTypeOptions}
                      optionRender={customOptionRender}
                      maxTagCount={2}
                      maxTagTextLength={10}
                      allowClear
                      showSearch
                    />
                  </Col>
                  
                  <Col xs={24}>
                    <Text strong>Mức lương (triệu đồng)</Text>
                    <Slider
                      range
                      min={0}
                      max={100}
                      value={selectedFilters.salaries}
                      onChange={(value) => handleFilterChange('salaries', value)}
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
                    <Select
                      mode="multiple"
                      style={{ width: '100%', marginTop: '8px' }}
                      placeholder="Chọn kinh nghiệm"
                      value={selectedExpLevelValues}
                      onChange={handleExpLevelChange}
                      optionLabelProp="label"
                      options={expLevelOptions}
                      optionRender={customOptionRender}
                      maxTagCount={2}
                      maxTagTextLength={10}
                      allowClear
                      showSearch
                    />
                  </Col>
                </Row>
                
                <div className="mt-3 d-flex justify-content-between">
                  <Button onClick={clearAllFilters} disabled={getActiveFilterCount() === 0}>
                    Đặt lại
                  </Button>
                  <Button 
                    type="primary"
                    onClick={() => setCurrentPage(1)}
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
                {totalJobs > 0 ? (
                  <Badge count={totalJobs} overflowCount={9999} style={{ backgroundColor: '#059669' }}>
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
                  onChange={(value) => setSortOption(value)}
                  suffixIcon={<SortAscendingOutlined />}
                >
                  <Option value="newest">Mới nhất</Option>
                  <Option value="salary-desc">Lương cao đến thấp</Option>
                  <Option value="salary-asc">Lương thấp đến cao</Option>
                </Select>
                
                <Space className="view-mode-toggle">
                  <Tooltip title="Xem dạng lưới">
                    <Button 
                      type={viewMode === 'card' ? 'primary' : 'default'} 
                      icon={<AppstoreOutlined />}
                      onClick={() => setViewMode('card')}
                    />
                  </Tooltip>
                  <Tooltip title="Xem dạng danh sách">
                    <Button 
                      type={viewMode === 'list' ? 'primary' : 'default'} 
                      icon={<BarsOutlined />}
                      onClick={() => setViewMode('list')}
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
              <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
            ) : currentJobs.length === 0 ? (
              <Empty
                description={
                  <span>
                    Không tìm thấy công việc nào phù hợp với tiêu chí tìm kiếm
                    <div className="mt-3">
                      <Button type="primary" onClick={clearAllFilters}>
                Xóa bộ lọc
                      </Button>
            </div>
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
          ) : (
            <>
                <Row gutter={[16, 16]}>
                  {currentJobs.map(job => (
                    <Col xs={24} sm={viewMode === 'card' ? 12 : 24} lg={viewMode === 'card' ? 8 : 24} key={job.id}>
                      <JobCard
                        job={job}
                        savedJobs={savedJobs}
                        onSaveJob={() => handleToggleSaveJob(job.id)}
                      />
                    </Col>
                  ))}
                </Row>

              {/* Pagination */}
                {totalJobs > pageSize && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={totalJobs}
                      onChange={handlePaginationChange}
                      showSizeChanger
                      pageSizeOptions={['9', '18', '36']}
                    />
                  </div>
              )}
            </>
          )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default JobsPage;