import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Spin, 
  Alert, 
  Typography, 
  Pagination, 
  Empty, 
  Button, 
  Space,
  Badge,
  Select,
  Tag,
  Input,
  Divider
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ReloadOutlined,
  SortAscendingOutlined,
  EnvironmentOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import JobCard from '../components/common/JobCard';
import '../styles/SearchPage.scss';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  
  // Location and category data
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
  
  // Get search query parameters
  const query = searchParams.get('q') || '';

  // Process the search parameters on mount
  useEffect(() => {
    const locationsParam = searchParams.get('locations') || '';
    if (locationsParam) {
      const locationIds = locationsParam.split(',');
      setSelectedLocationValues(locationIds);
    }
    
    const categoriesParam = searchParams.get('categories') || '';
    if (categoriesParam) {
      const categoryIds = categoriesParam.split(',');
      setSelectedCategoryValues(categoryIds);
    }
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all search parameters
        const params = {};
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }
        
        // Add pagination
        params.page = currentPage;
        params.limit = pageSize;
        params.sort = sortBy;

        // Call search API
        const response = await axios.get('http://localhost:5000/jobs/search', {
          params: params
        });

        setJobs(response.data.jobs || []);
        setTotal(response.data.total || 0);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Không thể tải thông tin công việc');
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchParams, currentPage, pageSize, sortBy]);

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    if (size !== pageSize) {
      setPageSize(size);
    }
    window.scrollTo(0, 0);
  };
  
  const handleSortChange = (value) => {
    setSortBy(value);
  };
  
  const clearSearch = () => {
    setSelectedLocationValues([]);
    setSelectedCategoryValues([]);
    navigate('/jobs');
  };
  
  const updateSearch = (newParams) => {
    const updatedParams = new URLSearchParams(searchParams);
    
    for (const [key, value] of Object.entries(newParams)) {
      if (value) {
        updatedParams.set(key, value);
      } else {
        updatedParams.delete(key);
      }
    }
    
    setSearchParams(updatedParams);
  };

  const handleLocationChange = (values) => {
    setSelectedLocationValues(values);
    updateSearch({ locations: values.join(',') });
  };
  
  const handleCategoryChange = (values) => {
    setSelectedCategoryValues(values);
    updateSearch({ categories: values.join(',') });
  };
  
  // Custom options renderer for locations
  const locationOptionRender = (option) => (
    <div className="custom-select-option">
      <div className="option-label">{option.label}</div>
      <div className="option-count">({option.count})</div>
    </div>
  );
  
  // Custom options renderer for categories
  const categoryOptionRender = (option) => (
    <div className="custom-select-option">
      <div className="option-label">{option.label}</div>
      <div className="option-count">({option.count})</div>
    </div>
  );

  const renderSearchSummary = () => {
    const filters = [];
    
    if (query) {
      filters.push(
        <Tag key="query" closable onClose={() => updateSearch({ q: '' })}>
          Từ khóa: {query}
        </Tag>
      );
    }
    
    return filters.length > 0 ? (
      <div className="search-filters mb-3">
        <Space size={[0, 8]} wrap>
          <Text strong>Bộ lọc từ khóa:</Text>
          {filters}
          {filters.length > 0 && (
            <Button 
              type="link" 
              size="small" 
              icon={<ReloadOutlined />} 
              onClick={() => updateSearch({ q: '' })}
            >
              Xóa từ khóa
            </Button>
          )}
        </Space>
      </div>
    ) : null;
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="search-page">
        <div className="container py-5">
          <Card className="text-center p-5">
            <Spin size="large" tip="Đang tìm kiếm..." />
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-page">
        <div className="container py-5">
          <Alert message="Lỗi" description={error} type="error" showIcon />
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <div className="container py-5">
        <Card className="search-results-card">
          <div className="search-header d-flex justify-content-between align-items-center flex-wrap mb-4">
            <div>
              <Title level={4}>Kết quả tìm kiếm</Title>
              <Badge count={total} showZero overflowCount={9999} style={{ backgroundColor: '#52c41a' }}>
                <Text>công việc tìm thấy</Text>
              </Badge>
              
              {renderSearchSummary()}
            </div>
            
            <div className="search-tools">
              <Space>
                <Button 
                  icon={<SearchOutlined />} 
                  onClick={() => navigate('/')}
                >
                  Tìm kiếm mới
                </Button>
                
                <Select
                  value={sortBy}
                  style={{ width: 170 }}
                  onChange={handleSortChange}
                  placeholder="Sắp xếp theo"
                  suffixIcon={<SortAscendingOutlined />}
                >
                  <Option value="newest">Mới nhất</Option>
                  <Option value="relevant">Phù hợp nhất</Option>
                  <Option value="salary-high">Lương cao nhất</Option>
                  <Option value="salary-low">Lương thấp nhất</Option>
                </Select>
              </Space>
            </div>
          </div>

          {/* Filter section with Select components */}
          <div className="filter-section mb-4">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder={<span><EnvironmentOutlined /> Địa điểm</span>}
                  value={selectedLocationValues}
                  onChange={handleLocationChange}
                  optionLabelProp="label"
                  options={locationOptions}
                  optionRender={locationOptionRender}
                  maxTagCount={2}
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
              </Col>
              <Col xs={24} sm={12}>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder={<span><AppstoreOutlined /> Ngành nghề</span>}
                  value={selectedCategoryValues}
                  onChange={handleCategoryChange}
                  optionLabelProp="label"
                  options={categoryOptions}
                  optionRender={categoryOptionRender}
                  maxTagCount={2}
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
              </Col>
            </Row>
            
            {(selectedLocationValues.length > 0 || selectedCategoryValues.length > 0) && (
              <div className="d-flex justify-content-end mt-2">
                <Button 
                  type="link" 
                  onClick={() => {
                    setSelectedLocationValues([]);
                    setSelectedCategoryValues([]);
                    updateSearch({ locations: '', categories: '' });
                  }}
                  icon={<ReloadOutlined />}
                >
                  Xóa tất cả bộ lọc
                </Button>
              </div>
            )}
          </div>
          
          <Divider style={{ margin: '0 0 24px 0' }} />
          
          {jobs.length === 0 ? (
            <Empty 
              description={
                <span>
                  Không tìm thấy công việc phù hợp với tiêu chí tìm kiếm của bạn.
                  <div className="mt-3">
                    <Button type="primary" onClick={clearSearch}>
                      Xem tất cả công việc
                    </Button>
                  </div>
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              <Row gutter={[16, 24]}>
                {jobs.map(job => (
                  <Col key={job.id} xs={24} sm={12} lg={8}>
                    <JobCard job={job} />
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {total > pageSize && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={total}
                    onChange={handlePageChange}
                    showSizeChanger
                    pageSizeOptions={['9', '12', '24', '36']}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SearchPage; 