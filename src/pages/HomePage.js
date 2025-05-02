import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Select, Button, Spin, Card, Badge, Tooltip, Row, Col, Pagination, Tag, Space } from 'antd';
import { SearchOutlined, EnvironmentOutlined, DollarOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/homepage.scss';

const { Option } = Select;

const HomePage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 9;

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResponse, locationsResponse] = await Promise.all([
          axios.get('http://localhost:5000/jobs'),
          axios.get('http://localhost:5000/locations')
        ]);

        setJobs(jobsResponse.data);
        setLocations(locationsResponse.data);
        setTotalPages(Math.ceil(jobsResponse.data.length / jobsPerPage));
        setLoading(false);
      } catch (err) {
        setError('Không thể tải dữ liệu');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    
    if (searchQuery) queryParams.append('q', searchQuery);
    
    if (selectedLocations && selectedLocations.length > 0) {
      const locationIds = selectedLocations.join(',');
      queryParams.append('locations', locationIds);
    }

    const searchUrl = `/jobs/search?${queryParams.toString()}`;
    navigate(searchUrl);
  };

  const formatSalary = (salary) => {
    if (salary.isHidden) return 'Thương lượng';
    return `${salary.min} - ${salary.max} ${salary.currency}/${salary.period}`;
  };

  // Calculate current jobs to display
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  // Change page
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo(0, 0);
  };

  return (
    <div className="home-page">
      <div className="hero-section py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8 mx-auto text-center">
              <h1 className="display-5 fw-bold mb-4">Tìm việc làm phù hợp với bạn</h1>
              <p className="lead mb-5">
                Kết nối với hàng nghìn nhà tuyển dụng và tìm cơ hội nghề nghiệp tuyệt vời cho sự nghiệp của bạn.
              </p>
              
              {/* Search Form - Improved with Ant Design */}
              <div className="search-box bg-white p-4 rounded shadow-sm">
                <form onSubmit={handleSearch}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={10}>
                      <Input
                        placeholder="Nhập tên vị trí, công ty, từ khóa..."
                        prefix={<SearchOutlined className="text-muted" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="large"
                      />
                    </Col>
                    
                    <Col xs={24} md={10}>
                      <Select
                        mode="multiple"
                        placeholder={<span><EnvironmentOutlined /> Chọn địa điểm làm việc</span>}
                        style={{ width: '100%' }}
                        value={selectedLocations}
                        onChange={setSelectedLocations}
                        optionFilterProp="children"
                        size="large"
                        maxTagCount={3}
                        maxTagTextLength={10}
                        allowClear
                        showArrow
                        showSearch
                        loading={loading}
                        tagRender={(props) => (
                          <Tag closable={props.closable} onClose={props.onClose} style={{ marginRight: 3 }}>
                            {props.label}
                          </Tag>
                        )}
                        dropdownRender={menu => (
                          <div>
                            {menu}
                            <div style={{ padding: '8px', borderTop: '1px solid #e8e8e8' }}>
                              <span style={{ fontSize: '12px', color: '#999' }}>
                                {selectedLocations.length} địa điểm được chọn
                              </span>
                            </div>
                          </div>
                        )}
                      >
                        {locations.map(location => (
                          <Option key={location.id} value={location.id}>
                            <div className="d-flex justify-content-between align-items-center">
                              <span>{location.name}</span>
                              {location.jobCount && (
                                <small className="text-muted">({location.jobCount})</small>
                              )}
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    
                    <Col xs={24} md={4}>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        size="large" 
                        block
                      >
                        Tìm kiếm
                      </Button>
                    </Col>
                  </Row>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="jobs-section py-5">
        <div className="container">
          <h2 className="section-title mb-4">Việc làm mới nhất</h2>
          {loading ? (
            <div className="text-center">
              <Spin size="large" />
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {currentJobs.map((job) => (
                  <Col xs={24} md={8} key={job.id}>
                    <Card 
                      hoverable 
                      className="h-100"
                      actions={[
                        <Link to={`/jobs/${job.id}`}>
                          <Button type="link">Xem chi tiết</Button>
                        </Link>
                      ]}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Meta
                          title={job.title}
                          description={
                            <Space direction="vertical" size={2} style={{ width: '100%' }}>
                              <span>
                                <EnvironmentOutlined className="me-1" />
                                {job.location} {job.isRemote ? '(Remote)' : ''}
                              </span>
                              <span className="text-truncate d-block">
                                {job.shortDescription}
                              </span>
                              <Space>
                                <span className="text-muted">
                                  <ClockCircleOutlined className="me-1" />
                                  {job.jobType}
                                </span>
                                <span className="text-muted">
                                  <DollarOutlined className="me-1" />
                                  {formatSalary(job.salary)}
                                </span>
                              </Space>
                              <div className="mt-2">
                                {job.skills.slice(0, 3).map((skill, index) => (
                                  <Tag key={index} className="me-1 mb-1">{skill}</Tag>
                                ))}
                                {job.skills.length > 3 && (
                                  <Tooltip title={job.skills.slice(3).join(', ')}>
                                    <Tag>+{job.skills.length - 3}</Tag>
                                  </Tooltip>
                                )}
                              </div>
                            </Space>
                          }
                        />
                        {job.isUrgent && <Badge.Ribbon text="Gấp" color="red" />}
                      </div>
                      <div className="mt-2 text-muted">
                        <EyeOutlined className="me-1" /> {job.views} lượt xem
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination 
                    current={currentPage}
                    total={jobs.length}
                    pageSize={jobsPerPage}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;