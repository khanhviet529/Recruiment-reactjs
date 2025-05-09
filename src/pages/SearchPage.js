// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import { 
//   Card, 
//   Row, 
//   Col, 
//   Spin, 
//   Alert, 
//   Typography, 
//   Pagination, 
//   Empty, 
//   Button, 
//   Space,
//   Badge,
//   Select,
//   Tag,
//   Input,
//   Divider,
//   Collapse
// } from 'antd';
// import { 
//   SearchOutlined, 
//   FilterOutlined, 
//   ReloadOutlined,
//   SortAscendingOutlined,
//   EnvironmentOutlined,
//   AppstoreOutlined,
//   DownOutlined
// } from '@ant-design/icons';
// import JobCard from '../components/common/JobCard';
// import '../styles/SearchPage.scss';

// const { Title, Text } = Typography;
// const { Option } = Select;
// const { Search } = Input;
// const { Panel } = Collapse;

// const SearchPage = () => {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(9);
//   const [total, setTotal] = useState(0);
//   const [sortBy, setSortBy] = useState('newest');
  
//   // Location and category data
//   const [locationOptions, setLocationOptions] = useState([
//     { value: '1', label: 'Hồ Chí Minh', count: 845 },
//     { value: '2', label: 'Hà Nội', count: 723 },
//     { value: '3', label: 'Đà Nẵng', count: 241 },
//     { value: '4', label: 'An Giang', count: 38 },
//     { value: '5', label: 'Bà Rịa - Vũng Tàu', count: 79 },
//     { value: '6', label: 'Bình Dương', count: 156 },
//     { value: '7', label: 'Cần Thơ', count: 112 },
//   ]);
  
//   const [categoryOptions, setCategoryOptions] = useState([
//     { value: '1', label: 'Công nghệ thông tin', count: 623 },
//     { value: '2', label: 'DevOps', count: 145 },
//     { value: '3', label: 'Data Science', count: 98 },
//     { value: '4', label: 'Marketing', count: 211 },
//     { value: '5', label: 'Ngân hàng đầu tư', count: 76 },
//     { value: '6', label: 'Giáo dục / Đào tạo', count: 134 },
//   ]);
  
//   const [selectedLocationValues, setSelectedLocationValues] = useState([]);
//   const [selectedCategoryValues, setSelectedCategoryValues] = useState([]);
  
//   // Get search query parameters
//   const query = searchParams.get('q') || '';

//   // Process the search parameters on mount
//   useEffect(() => {
//     const locationsParam = searchParams.get('locations') || '';
//     if (locationsParam) {
//       const locationIds = locationsParam.split(',');
//       setSelectedLocationValues(locationIds);
//     }
    
//     const categoriesParam = searchParams.get('categories') || '';
//     if (categoriesParam) {
//       const categoryIds = categoriesParam.split(',');
//       setSelectedCategoryValues(categoryIds);
//     }
//   }, []);

//   useEffect(() => {
//     const fetchSearchResults = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Get all search parameters
//         const params = {};
//         for (const [key, value] of searchParams.entries()) {
//           params[key] = value;
//         }
        
//         // Add pagination
//         params.page = currentPage;
//         params.limit = pageSize;
//         params.sort = sortBy;

//         // Call search API
//         const response = await axios.get('http://localhost:5000/jobs/search', {
//           params: params
//         });

//         setJobs(response.data.jobs || []);
//         setTotal(response.data.total || 0);
//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching search results:', err);
//         setError('Không thể tải thông tin công việc');
//         setLoading(false);
//       }
//     };

//     fetchSearchResults();
//   }, [searchParams, currentPage, pageSize, sortBy]);

//   const handlePageChange = (page, size) => {
//     setCurrentPage(page);
//     if (size !== pageSize) {
//       setPageSize(size);
//     }
//     window.scrollTo(0, 0);
//   };
  
//   const handleSortChange = (value) => {
//     setSortBy(value);
//   };
  
//   const clearSearch = () => {
//     setSelectedLocationValues([]);
//     setSelectedCategoryValues([]);
//     navigate('/jobs');
//   };
  
//   const updateSearch = (newParams) => {
//     const updatedParams = new URLSearchParams(searchParams);
    
//     for (const [key, value] of Object.entries(newParams)) {
//       if (value) {
//         updatedParams.set(key, value);
//       } else {
//         updatedParams.delete(key);
//       }
//     }
    
//     setSearchParams(updatedParams);
//   };

//   const handleLocationChange = (values) => {
//     setSelectedLocationValues(values);
//     updateSearch({ locations: values.join(',') });
//   };
  
//   const handleCategoryChange = (values) => {
//     setSelectedCategoryValues(values);
//     updateSearch({ categories: values.join(',') });
//   };
  
//   // Custom options renderer for locations
//   const locationOptionRender = (option) => (
//     <div className="custom-select-option">
//       <div className="option-label">{option.label}</div>
//       <div className="option-count">({option.count})</div>
//     </div>
//   );
  
//   // Custom options renderer for categories
//   const categoryOptionRender = (option) => (
//     <div className="custom-select-option">
//       <div className="option-label">{option.label}</div>
//       <div className="option-count">({option.count})</div>
//     </div>
//   );

//   const renderSearchSummary = () => {
//     const filters = [];
    
//     if (query) {
//       filters.push(
//         <Tag key="query" closable onClose={() => updateSearch({ q: '' })}>
//           Từ khóa: {query}
//         </Tag>
//       );
//     }
    
//     return filters.length > 0 ? (
//       <div className="search-filters mb-3">
//         <Space size={[0, 8]} wrap>
//           <Text strong>Bộ lọc từ khóa:</Text>
//           {filters}
//           {filters.length > 0 && (
//             <Button 
//               type="link" 
//               size="small" 
//               icon={<ReloadOutlined />} 
//               onClick={() => updateSearch({ q: '' })}
//             >
//               Xóa từ khóa
//             </Button>
//           )}
//         </Space>
//       </div>
//     ) : null;
//   };

//   if (loading && jobs.length === 0) {
//     return (
//       <div className="search-page">
//         <div className="container py-5">
//           <Card className="text-center p-5">
//             <Spin size="large" tip="Đang tìm kiếm..." />
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="search-page">
//         <div className="container py-5">
//           <Alert message="Lỗi" description={error} type="error" showIcon />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="search-page">
//       <div className="container py-5">
//         <Row gutter={24}>
//           {/* Filters sidebar */}
//           <Col xs={24} lg={6}>
//             <Card className="filter-card">
//               <Title level={4} className="mb-3">Bộ lọc tìm kiếm</Title>
              
//               <Collapse 
//                 defaultActiveKey={['1', '2']} 
//                 expandIconPosition="end"
//                 expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
//                 className="filter-collapse"
//               >
//                 <Panel header={<strong>Địa điểm</strong>} key="1">
//                   <Select
//                     mode="multiple"
//                     style={{ width: '100%' }}
//                     placeholder={<span><EnvironmentOutlined /> Chọn địa điểm...</span>}
//                     value={selectedLocationValues}
//                     onChange={handleLocationChange}
//                     optionLabelProp="label"
//                     options={locationOptions}
//                     optionRender={locationOptionRender}
//                     maxTagCount={3}
//                     maxTagTextLength={12}
//                     allowClear
//                     showSearch
//                     filterOption={(input, option) =>
//                       (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
//                     }
//                     className="location-select"
//                     tagRender={(props) => (
//                       <Tag closable={props.closable} onClose={props.onClose} className="custom-select-tag">
//                         {props.label}
//                       </Tag>
//                     )}
//                     dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
//                     dropdownClassName="location-dropdown"
//                   />
//                 </Panel>
                
//                 <Panel header={<strong>Ngành nghề</strong>} key="2">
//                   <Select
//                     mode="multiple"
//                     style={{ width: '100%' }}
//                     placeholder={<span><AppstoreOutlined /> Chọn ngành nghề...</span>}
//                     value={selectedCategoryValues}
//                     onChange={handleCategoryChange}
//                     optionLabelProp="label"
//                     options={categoryOptions}
//                     optionRender={categoryOptionRender}
//                     maxTagCount={3}
//                     maxTagTextLength={12}
//                     allowClear
//                     showSearch
//                     filterOption={(input, option) =>
//                       (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
//                     }
//                     className="category-select"
//                     tagRender={(props) => (
//                       <Tag closable={props.closable} onClose={props.onClose} className="custom-select-tag">
//                         {props.label}
//                       </Tag>
//                     )}
//                     dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
//                     dropdownClassName="category-dropdown"
//                   />
//                 </Panel>
//               </Collapse>

//               {(selectedLocationValues.length > 0 || selectedCategoryValues.length > 0) && (
//                 <div className="mt-3">
//                   <Button 
//                     icon={<ReloadOutlined />}
//                     onClick={() => {
//                       setSelectedLocationValues([]);
//                       setSelectedCategoryValues([]);
//                       updateSearch({ locations: '', categories: '' });
//                     }}
//                     block
//                   >
//                     Xóa tất cả bộ lọc
//                   </Button>
//                 </div>
//               )}
//             </Card>
//           </Col>
          
//           {/* Search results */}
//           <Col xs={24} lg={18}>
//             <Card className="search-results-card">
//               <div className="search-header d-flex justify-content-between align-items-center flex-wrap mb-4">
//                 <div>
//                   <Title level={4}>Kết quả tìm kiếm</Title>
//                   <Badge count={total} showZero overflowCount={9999} style={{ backgroundColor: '#52c41a' }}>
//                     <Text>công việc tìm thấy</Text>
//                   </Badge>
                  
//                   {renderSearchSummary()}
//                 </div>
                
//                 <div className="search-tools">
//                   <Space>
//                     <Button 
//                       icon={<SearchOutlined />} 
//                       onClick={() => navigate('/')}
//                     >
//                       Tìm kiếm mới
//                     </Button>
                    
//                     <Select
//                       value={sortBy}
//                       style={{ width: 170 }}
//                       onChange={handleSortChange}
//                       placeholder="Sắp xếp theo"
//                       suffixIcon={<SortAscendingOutlined />}
//                     >
//                       <Option value="newest">Mới nhất</Option>
//                       <Option value="relevant">Phù hợp nhất</Option>
//                       <Option value="salary-high">Lương cao nhất</Option>
//                       <Option value="salary-low">Lương thấp nhất</Option>
//                     </Select>
//                   </Space>
//                 </div>
//               </div>
              
//               <Divider style={{ margin: '0 0 24px 0' }} />
              
//               {jobs.length === 0 ? (
//                 <Empty 
//                   description={
//                     <span>
//                       Không tìm thấy công việc phù hợp với tiêu chí tìm kiếm của bạn.
//                       <div className="mt-3">
//                         <Button type="primary" onClick={clearSearch}>
//                           Xem tất cả công việc
//                         </Button>
//                       </div>
//                     </span>
//                   }
//                   image={Empty.PRESENTED_IMAGE_SIMPLE}
//                 />
//               ) : (
//                 <>
//                   <Row gutter={[16, 24]}>
//                     {jobs.map(job => (
//                       <Col key={job.id} xs={24} sm={12} lg={8}>
//                         <JobCard job={job} />
//                       </Col>
//                     ))}
//                   </Row>

//                   {/* Pagination */}
//                   {total > pageSize && (
//                     <div className="d-flex justify-content-center mt-4">
//                       <Pagination
//                         current={currentPage}
//                         pageSize={pageSize}
//                         total={total}
//                         onChange={handlePageChange}
//                         showSizeChanger
//                         pageSizeOptions={['9', '12', '24', '36']}
//                       />
//                     </div>
//                   )}
//                 </>
//               )}
//             </Card>
//           </Col>
//         </Row>
//       </div>
//     </div>
//   );
// };

// export default SearchPage; 

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
  Divider,
  Collapse
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ReloadOutlined,
  SortAscendingOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  DownOutlined,
  CheckOutlined
} from '@ant-design/icons';
import JobCard from '../components/common/JobCard';
import '../styles/SearchPage.scss';

// IMPORTANT: Add these styles to your SearchPage.scss file
/*
// Enhanced Dropdown Styles
.custom-select {
  &.ant-select-multiple .ant-select-selector {
    padding: 4px 8px;
    border-radius: 8px;
    border: 1px solid #d9d9d9;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    
    &:hover {
      border-color: #40a9ff;
    }
  }
  
  &.ant-select-focused .ant-select-selector {
    border-color: #40a9ff !important;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
  }
  
  &.location-select .ant-select-selection-placeholder,
  &.category-select .ant-select-selection-placeholder {
    color: #8c8c8c;
    display: flex;
    align-items: center;
    
    .anticon {
      margin-right: 6px;
      font-size: 14px;
    }
  }
  
  .ant-select-selection-item {
    background: #f0f7ff;
    border-radius: 4px;
    border: 1px solid #d6e4ff;
    color: #2f54eb;
    margin: 2px;
    
    .ant-select-selection-item-content {
      margin-right: 6px;
    }
    
    .ant-select-selection-item-remove {
      color: #2f54eb;
      font-size: 12px;
    }
  }
}

.dropdown-header {
  padding: 10px 12px;
  font-weight: 600;
  color: #262626;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .dropdown-counter {
    font-size: 12px;
    background: #f0f7ff;
    color: #2f54eb;
    padding: 2px 8px;
    border-radius: 12px;
  }
}

.custom-dropdown {
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  padding: 0;
  
  .ant-select-item {
    transition: all 0.2s;
    
    &:hover {
      background-color: #f0f7ff;
    }
    
    &.ant-select-item-option-selected {
      background-color: #e6f7ff;
      font-weight: 500;
    }
  }
  
  .custom-select-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2px 0;
    
    .option-label {
      flex: 1;
    }
    
    .option-count {
      font-size: 12px;
      color: #8c8c8c;
      margin-left: 8px;
    }
  }
  
  .ant-select-item-option-state {
    color: #1890ff;
  }
  
  .dropdown-footer {
    padding: 8px 12px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
  }
}

.custom-select-tag {
  background-color: #f0f7ff;
  border-color: #d6e4ff;
  color: #2f54eb;
  margin-right: 8px;
  border-radius: 4px;
  padding: 0 8px;
  height: 24px;
  line-height: 22px;
  
  .anticon-close {
    color: #2f54eb;
    font-size: 10px;
    
    &:hover {
      color: #1d39c4;
      background-color: #d6e4ff;
    }
  }
}

// Filter collapse panel styles
.filter-collapse {
  background: transparent;
  border: none;
  
  .ant-collapse-header {
    padding: 12px 0;
    align-items: center;
  }
  
  .ant-collapse-content {
    border-top: none;
  }
  
  .ant-collapse-content-box {
    padding: 8px 0 16px 0;
  }
}

.sort-select {
  .ant-select-selector {
    border-radius: 8px;
    padding-right: 30px !important;
  }
  
  .ant-select-selection-item {
    display: flex;
    align-items: center;
  }
  
  .sort-option {
    display: flex;
    align-items: center;
    
    .sort-icon {
      margin-right: 8px;
      font-size: 14px;
    }
  }
}
*/

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { Panel } = Collapse;

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
  
  // Custom dropdown render with header, footer, and improved UI
  const dropdownRender = (menu, type, options) => {
    const count = options.reduce((total, option) => total + option.count, 0);
    const selectedCount = type === 'location' 
      ? selectedLocationValues.length 
      : selectedCategoryValues.length;
      
    const handleClearSelection = () => {
      if (type === 'location') {
        setSelectedLocationValues([]);
        updateSearch({ locations: '' });
      } else {
        setSelectedCategoryValues([]);
        updateSearch({ categories: '' });
      }
    };
    
    const handleSelectAll = () => {
      const allValues = options.map(option => option.value);
      if (type === 'location') {
        setSelectedLocationValues(allValues);
        updateSearch({ locations: allValues.join(',') });
      } else {
        setSelectedCategoryValues(allValues);
        updateSearch({ categories: allValues.join(',') });
      }
    };
    
    return (
      <div className="custom-dropdown">
        <div className="dropdown-header">
          <span>{type === 'location' ? 'Địa điểm' : 'Ngành nghề'}</span>
          <span className="dropdown-counter">{count}</span>
        </div>
        {menu}
        <div className="dropdown-footer">
          <Button 
            type="text" 
            size="small" 
            disabled={selectedCount === 0}
            onClick={handleClearSelection}
          >
            Xóa
          </Button>
          <Button
            type="text"
            size="small"
            disabled={selectedCount === options.length}
            onClick={handleSelectAll}
          >
            Chọn tất cả
          </Button>
        </div>
      </div>
    );
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

  // Sort options with icons
  const sortOptionRender = (option) => (
    <div className="sort-option">
      {option.value === 'newest' && <span className="sort-icon"><SortAscendingOutlined /></span>}
      {option.value === 'relevant' && <span className="sort-icon"><FilterOutlined /></span>}
      {option.value === 'salary-high' && <span className="sort-icon">₫↑</span>}
      {option.value === 'salary-low' && <span className="sort-icon">₫↓</span>}
      {option.label}
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
        <Row gutter={24}>
          {/* Filters sidebar */}
          <Col xs={24} lg={6}>
            <Card className="filter-card">
              <Title level={4} className="mb-3">
                <FilterOutlined style={{ marginRight: 8 }} />
                Bộ lọc tìm kiếm
              </Title>
              
              <Collapse 
                defaultActiveKey={['1', '2']} 
                expandIconPosition="end"
                expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
                className="filter-collapse"
                bordered={false}
              >
                <Panel 
                  header={
                    <div className="d-flex justify-content-between align-items-center" style={{ width: '100%' }}>
                      <strong><EnvironmentOutlined style={{ marginRight: 8 }} /> Địa điểm</strong>
                      {selectedLocationValues.length > 0 && (
                        <Badge count={selectedLocationValues.length} size="small" />
                      )}
                    </div>
                  } 
                  key="1"
                >
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
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
                    showArrow
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    className="custom-select location-select"
                    tagRender={(props) => (
                      <Tag closable={props.closable} onClose={props.onClose} className="custom-select-tag">
                        {props.label}
                      </Tag>
                    )}
                    dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                    dropdownClassName="custom-dropdown location-dropdown"
                    dropdownRender={(menu) => dropdownRender(menu, 'location', locationOptions)}
                    menuItemSelectedIcon={<CheckOutlined />}
                  />
                </Panel>
                
                <Panel 
                  header={
                    <div className="d-flex justify-content-between align-items-center" style={{ width: '100%' }}>
                      <strong><AppstoreOutlined style={{ marginRight: 8 }} /> Ngành nghề</strong>
                      {selectedCategoryValues.length > 0 && (
                        <Badge count={selectedCategoryValues.length} size="small" />
                      )}
                    </div>
                  } 
                  key="2"
                >
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
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
                    showArrow
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    className="custom-select category-select"
                    tagRender={(props) => (
                      <Tag closable={props.closable} onClose={props.onClose} className="custom-select-tag">
                        {props.label}
                      </Tag>
                    )}
                    dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                    dropdownClassName="custom-dropdown category-dropdown"
                    dropdownRender={(menu) => dropdownRender(menu, 'category', categoryOptions)}
                    menuItemSelectedIcon={<CheckOutlined />}
                  />
                </Panel>
              </Collapse>

              {(selectedLocationValues.length > 0 || selectedCategoryValues.length > 0) && (
                <div className="mt-3">
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setSelectedLocationValues([]);
                      setSelectedCategoryValues([]);
                      updateSearch({ locations: '', categories: '' });
                    }}
                    block
                    type="primary"
                    ghost
                  >
                    Xóa tất cả bộ lọc
                  </Button>
                </div>
              )}
            </Card>
          </Col>
          
          {/* Search results */}
          <Col xs={24} lg={18}>
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
                      type="primary"
                    >
                      Tìm kiếm mới
                    </Button>
                    
                    <Select
                      value={sortBy}
                      style={{ width: 170 }}
                      onChange={handleSortChange}
                      placeholder="Sắp xếp theo"
                      suffixIcon={<SortAscendingOutlined />}
                      className="sort-select"
                      optionLabelProp="label"
                      dropdownClassName="custom-dropdown"
                    >
                      <Option value="newest" label="Mới nhất">
                        {sortOptionRender({ value: 'newest', label: 'Mới nhất' })}
                      </Option>
                      <Option value="relevant" label="Phù hợp nhất">
                        {sortOptionRender({ value: 'relevant', label: 'Phù hợp nhất' })}
                      </Option>
                      <Option value="salary-high" label="Lương cao nhất">
                        {sortOptionRender({ value: 'salary-high', label: 'Lương cao nhất' })}
                      </Option>
                      <Option value="salary-low" label="Lương thấp nhất">
                        {sortOptionRender({ value: 'salary-low', label: 'Lương thấp nhất' })}
                      </Option>
                    </Select>
                  </Space>
                </div>
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
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SearchPage;