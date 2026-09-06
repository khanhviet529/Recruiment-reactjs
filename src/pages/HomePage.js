import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Select, Button, Spin, Card, Badge, Tooltip, Row, Col, Pagination, Tag, Space, Empty } from 'antd';
import { SearchOutlined, EnvironmentOutlined, DollarOutlined, ClockCircleOutlined, EyeOutlined, RightOutlined } from '@ant-design/icons';
import Slider from 'react-slick';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/homepage.scss';
import JobCard from '../components/common/JobCard';

const { Option } = Select;

const HomePage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredJobsLoading, setFeaturedJobsLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [employerLoading, setEmployerLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 9;
  const sliderRef = useRef();
  const categorySliderRef = useRef();
  const employerSliderRef = useRef();
  const [savedJobs, setSavedJobs] = useState([]);

  // Slick Carousel settings
  const slickSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    pauseOnHover: true,
    className: "banner-carousel"
  };

  // Category carousel settings
  const categorySettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    arrows: true,
    className: "category-carousel",
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  // Employer carousel settings
  const employerSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    className: "employer-carousel",
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  // Banner data (typically would come from an API)
  const banners = [
    {
      id: 1,
      image: "/image/mau-thong-bao-tuyen-dung-3.jpg",
      altText: "Banner 1"
    },
    {
      id: 2,
      image: "/image/mau-thong-bao-tuyen-dung-3 copy.jpg",
      altText: "Banner 2"
    },
    {
      id: 3,
      image: "/image/pngtree-blue-tech-theme-globe-poster-background-image_153891.jpg",
      altText: "Banner 3"
    }
    // Add more banners as needed
  ];

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

        // Fetch employer data for each job to get company logo and name
        const jobsWithEmployerData = await Promise.all(
          jobsResponse.data.map(async (job) => {
            try {
              const employerResponse = await axios.get(`http://localhost:5000/employers/${job.employerId}`);
              const employer = employerResponse.data;
              
              return {
                ...job,
                companyLogo: employer?.logo || employer?.profilePicture || `https://via.placeholder.com/100?text=${(employer?.companyName || 'C').charAt(0)}`,
                companyName: employer?.companyName || 'Company Name',
                employerData: employer
              };
            } catch (error) {
              console.error(`Error fetching employer ${job.employerId}:`, error);
              return {
                ...job,
                companyLogo: `https://via.placeholder.com/100?text=${job.title ? job.title.charAt(0) : 'C'}`,
                companyName: 'Company Name',
                employerData: null
              };
            }
          })
        );

        setJobs(jobsWithEmployerData);
        setLocations(locationsResponse.data);
        setTotalPages(Math.ceil(jobsWithEmployerData.length / jobsPerPage));
        setLoading(false);
      } catch (err) {
        setError('Không thể tải dữ liệu');
        setLoading(false);
      }
    };

    fetchData();

    // Fetch featured jobs
    const fetchFeaturedJobs = async () => {
      setFeaturedJobsLoading(true);
      try {
        // In a real scenario, you would have an endpoint for featured jobs
        // Here we are simulating by getting jobs and filtering those marked as featured or urgent
        const response = await axios.get('http://localhost:5000/jobs');
        const featuredJobsData = response.data
          .filter(job => job.isFeatured || job.isUrgent)
          .slice(0, 6); // Take only 6 featured jobs
        
        // Fetch employer data for featured jobs
        const featuredJobsWithEmployerData = await Promise.all(
          featuredJobsData.map(async (job) => {
            try {
              const employerResponse = await axios.get(`http://localhost:5000/employers/${job.employerId}`);
              const employer = employerResponse.data;
              
              return {
                ...job,
                companyLogo: employer?.logo || employer?.profilePicture || `https://via.placeholder.com/100?text=${(employer?.companyName || 'C').charAt(0)}`,
                companyName: employer?.companyName || 'Company Name',
                employerData: employer
              };
            } catch (error) {
              console.error(`Error fetching employer ${job.employerId}:`, error);
              return {
                ...job,
                companyLogo: `https://via.placeholder.com/100?text=${job.title ? job.title.charAt(0) : 'C'}`,
                companyName: 'Company Name',
                employerData: null
              };
            }
          })
        );
        
        setFeaturedJobs(featuredJobsWithEmployerData);
        setFeaturedJobsLoading(false);
      } catch (err) {
        console.error('Error fetching featured jobs:', err);
        setFeaturedJobsLoading(false);
      }
    };
    
    // Fetch categories
    const fetchCategories = async () => {
      setCategoryLoading(true);
      try {
        // Use the new jobFilters endpoint to get industries as categories
        const response = await axios.get('http://localhost:5000/jobFilters');
        
        // Log the jobFilters response for debugging
        console.log('JobFilters API Response:', response.data);
        
        // Extract industries from jobFilters as categories
        const industriesData = response.data.industries || [];
        
        // Process the data and take top categories with highest job counts
        const topCategories = industriesData
          .sort((a, b) => b.count - a.count)
          .slice(0, 20) // Take top 20 categories for the carousel
          .map(industry => ({
            id: industry.id,
            name: industry.name,
            label: industry.label,
            slug: industry.slug,
            jobCount: industry.count,
            displayOrder: industry.displayOrder,
            icon: `/image/categories/${industry.slug}.png` // Default icon path
          }));
        
        setCategories(topCategories);
        setCategoryLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategoryLoading(false);
      }
    };
    
    // Fetch employers
    const fetchEmployers = async () => {
      setEmployerLoading(true);
      try {
        // Use the new employers API endpoint
        const response = await axios.get('http://localhost:5000/employers');
        
        // Log the employers response for debugging
        console.log('Employers API Response:', response.data);
        
        // Process the data to get top employers
        const topEmployers = response.data
          .filter(employer => employer.logo && employer.name) // Ensure employers have logo and name
          .slice(0, 12); // Take top 12 employers for the carousel
        
        setEmployers(topEmployers);
        setEmployerLoading(false);
      } catch (err) {
        console.error('Error fetching employers:', err);
        setEmployerLoading(false);
      }
    };
    
    fetchFeaturedJobs();
    fetchCategories();
    fetchEmployers();
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

  // Save job functionality
  const handleSaveJob = (jobId) => {
    if (!savedJobs.includes(jobId)) {
      setSavedJobs([...savedJobs, jobId]);
    } else {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
    }
  };

  return (
    <div className="home-page">
      {/* Hero Banner Carousel with Search Form Overlay */}
      <div className="hero-banner-container">
        {/* Search Form Overlay */}
        <div className="search-form-overlay">
        <div className="container">
            <div className="row">
              <div className="col-lg-10 mx-auto">
                <div className="search-box bg-white p-4 rounded shadow">
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
                        tagRender={(props) => {
                          // Find the location name by ID to display only the name without job count
                          const location = locations.find(loc => loc.id === props.value);
                          const displayName = location ? location.name : props.label;
                          
                          return (
                            <Tag closable={props.closable} onClose={props.onClose} style={{ marginRight: 3 }}>
                              {displayName}
                            </Tag>
                          );
                        }}
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

        {/* Hero Banner Carousel */}
        <div className="hero-banner">
          <Slider ref={sliderRef} {...slickSettings}>
            {banners.map(banner => (
              <div key={banner.id} className="slide-item">
                <div className="slide-content">
                  <img 
                    src={banner.image} 
                    alt={banner.altText} 
                    style={{ width: '100%', height: '500px' }}
                    className="slide-image"
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* 1. Việc làm hấp dẫn Section */}
      <section className="featured-jobs-section py-5">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Việc làm hấp dẫn</h2>
            {/* <Link to="/jobs/featured" className="see-all-link">
              Xem tất cả <RightOutlined />
            </Link> */}
          </div>

          {featuredJobsLoading ? (
            <div className="text-center py-4">
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {featuredJobs.map((job) => (
                <Col xs={24} sm={12} lg={8} key={job.id}>
                  <JobCard 
                    job={job}
                    savedJobs={savedJobs}
                    onSaveJob={handleSaveJob}
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </section>

      {/* 2. Job Categories Section */}
      {/* <section className="category-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Khám phá ngành nghề</h2>
            <Link to="/jobs" className="see-all-link">
              Xem tất cả <RightOutlined />
            </Link>
          </div>

          {categoryLoading ? (
            <div className="text-center p-5">
              <Spin size="large" />
              <p className="mt-3">Đang tải dữ liệu...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center p-5">
              <Empty description="Không có ngành nghề nào" />
            </div>
          ) : (
            <Slider ref={categorySliderRef} {...categorySettings}>
              {categories.map((category) => (
                <div key={category.id}>
                  <Link 
                    to={`/jobs/search?category=${encodeURIComponent(category.id)}`}
                    className="category-item"
                  >
                    <div className="category-icon">
                      <img 
                        src={category.icon || "/image/default-category-icon.png"} 
                        alt={category.name} 
                      />
                    </div>
                    <h3 className="category-name">{category.name}</h3>
                    <div className="job-count">{category.jobCount || 0} công việc</div>
                  </Link>
                </div>
              ))}
            </Slider>
          )}
        </div>
      </section> */}

      {/* 3. Top Employers Section */}
      <section className="employers-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Nhà tuyển dụng hàng đầu</h2>
            {/* <Link to="/employers" className="see-all-link">
              Xem tất cả <RightOutlined />
            </Link> */}
          </div>
          
          {employerLoading ? (
            <div className="text-center p-5">
              <Spin size="large" />
              <p className="mt-3">Đang tải dữ liệu...</p>
            </div>
          ) : employers.length === 0 ? (
            <div className="text-center p-5">
              <Empty description="Không có nhà tuyển dụng nào" />
            </div>
          ) : (
            <Slider ref={employerSliderRef} {...employerSettings}>
              {employers.map((employer) => (
                <div key={employer.id} className="px-2">
                  <Link to={`/employers/${employer.id}`}>
                    <div className="employer-card">
                      <div 
                        className="employer-logo-container"
                        style={{ backgroundImage: `url(${employer.logo || 'https://via.placeholder.com/100x50?text=Logo'})` }}
                      >
                      </div>
                      <div className="employer-info">
                        <h3 className="employer-name">{employer.name}</h3>
                        <div className="employer-job-count">
                          <Badge count={employer.openJobs || 0} overflowCount={999} style={{ backgroundColor: '#059669' }} />
                          <span className="ml-2">vị trí đang tuyển</span>
                        </div>
                        {employer.industry && (
                          <div className="employer-industry">
                            <span>{employer.industry}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </Slider>
          )}
        </div>
      </section>

      {/* 4. Gợi ý việc làm Section */}
      <div className="jobs-section py-5">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Gợi ý việc làm</h2>
            {/* <Link to="/jobs" className="see-all-link">
              Xem tất cả <RightOutlined />
            </Link> */}
          </div>
          {loading ? (
            <div className="text-center py-4">
              <Spin size="large" />
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {currentJobs.map((job) => (
                  <Col xs={24} sm={12} lg={8} key={job.id}>
                    <JobCard 
                      job={job}
                      savedJobs={savedJobs}
                      onSaveJob={handleSaveJob}
                    />
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