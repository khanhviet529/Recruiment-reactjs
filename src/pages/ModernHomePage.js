import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Spin, Empty } from 'antd';
import ModernCard from '../components/common/ModernCard';
import ModernButton from '../components/common/ModernButton';
import axios from 'axios';
import './ModernHomePage.scss';

const ModernHomePage = () => {
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsResponse, categoriesResponse, companiesResponse] = await Promise.all([
        axios.get('http://localhost:5000/jobs'),
        axios.get('http://localhost:5000/categories'),
        axios.get('http://localhost:5000/employers')
      ]);

      // Get featured jobs (limit to 6)
      const featured = jobsResponse.data
        .filter(job => job.isFeatured || job.isUrgent)
        .slice(0, 6);
      setFeaturedJobs(featured);

      // Get top categories (limit to 8)
      const topCategories = categoriesResponse.data
        .sort((a, b) => b.jobCount - a.jobCount)
        .slice(0, 8);
      setCategories(topCategories);

      // Get top companies (limit to 8)
      const topCompanies = companiesResponse.data
        .slice(0, 8);
      setCompanies(topCompanies);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedLocation) params.append('location', selectedLocation);
    navigate(`/jobs?${params.toString()}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <div className="modern-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="modern-homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="hero-text">
                  <h1 className="hero-title">
                    Tìm kiếm công việc <span className="gradient-text">mơ ước</span> của bạn
                  </h1>
                  <p className="hero-subtitle">
                    Khám phá hàng nghìn cơ hội việc làm từ các công ty hàng đầu. 
                    Bắt đầu hành trình sự nghiệp của bạn ngay hôm nay.
                  </p>
                  
                  {/* Search Box */}
                  <div className="hero-search">
                    <div className="search-container">
                      <div className="search-input-group">
                        <Input
                          size="large"
                          placeholder="Nhập từ khóa tìm kiếm..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={handleKeyPress}
                          prefix={<i className="bi bi-search"></i>}
                          className="search-input"
                        />
                        <Input
                          size="large"
                          placeholder="Chọn địa điểm..."
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          onKeyPress={handleKeyPress}
                          prefix={<i className="bi bi-geo-alt"></i>}
                          className="location-input"
                        />
                        <ModernButton
                          variant="primary"
                          size="lg"
                          onClick={handleSearch}
                          icon="bi bi-search"
                          className="search-btn"
                        >
                          Tìm kiếm
                        </ModernButton>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hero-stats">
                    <div className="stat-item">
                      <span className="stat-number">1000+</span>
                      <span className="stat-label">Công việc</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">500+</span>
                      <span className="stat-label">Công ty</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">10000+</span>
                      <span className="stat-label">Ứng viên</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="hero-image">
                  <div className="floating-card card-1">
                    <i className="bi bi-briefcase"></i>
                    <span>UI/UX Designer</span>
                  </div>
                  <div className="floating-card card-2">
                    <i className="bi bi-code-slash"></i>
                    <span>Frontend Developer</span>
                  </div>
                  <div className="floating-card card-3">
                    <i className="bi bi-graph-up"></i>
                    <span>Data Analyst</span>
                  </div>
                  <div className="hero-illustration">
                    <div className="illustration-bg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="featured-jobs-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Việc làm nổi bật</h2>
            <p className="section-subtitle">Khám phá những cơ hội việc làm hấp dẫn nhất</p>
            <Link to="/jobs" className="section-link">
              Xem tất cả <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="row">
            {featuredJobs.length > 0 ? (
              featuredJobs.map(job => (
                <div key={job._id} className="col-lg-4 col-md-6 mb-4">
                  <ModernCard variant="elevated" className="job-card">
                    <ModernCard.Body>
                      <div className="job-header">
                        <div className="company-logo">
                          <img 
                            src={job.employer?.companyLogo || '/default-logo.png'} 
                            alt={job.employer?.companyName}
                          />
                        </div>
                        <div className="job-meta">
                          <ModernCard.Title size="sm">{job.title}</ModernCard.Title>
                          <ModernCard.Text variant="caption">
                            {job.employer?.companyName}
                          </ModernCard.Text>
                        </div>
                        {job.isUrgent && <span className="urgent-badge">Gấp</span>}
                      </div>

                      <div className="job-info">
                        <div className="info-item">
                          <i className="bi bi-geo-alt"></i>
                          <span>{job.location || 'Remote'}</span>
                        </div>
                        <div className="info-item">
                          <i className="bi bi-currency-dollar"></i>
                          <span>{job.salary || 'Thỏa thuận'}</span>
                        </div>
                        <div className="info-item">
                          <i className="bi bi-clock"></i>
                          <span>{job.jobType || 'Full-time'}</span>
                        </div>
                      </div>

                      <div className="job-skills">
                        {job.skills?.slice(0, 3).map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                      </div>

                      <div className="job-actions">
                        <ModernButton
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => navigate(`/jobs/${job._id}`)}
                        >
                          Xem chi tiết
                        </ModernButton>
                      </div>
                    </ModernCard.Body>
                  </ModernCard>
                </div>
              ))
            ) : (
              <div className="col-12">
                <Empty description="Không có việc làm nổi bật" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Danh mục nghề nghiệp</h2>
            <p className="section-subtitle">Tìm kiếm theo lĩnh vực bạn quan tâm</p>
          </div>

          <div className="row">
            {categories.map(category => (
              <div key={category._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                <ModernCard 
                  variant="gradient" 
                  className="category-card"
                  onClick={() => navigate(`/jobs?category=${category._id}`)}
                >
                  <ModernCard.Body>
                    <div className="category-icon">
                      <i className={category.icon || 'bi bi-briefcase'}></i>
                    </div>
                    <ModernCard.Title size="sm">{category.name}</ModernCard.Title>
                    <ModernCard.Text variant="caption">
                      {category.jobCount || 0} việc làm
                    </ModernCard.Text>
                  </ModernCard.Body>
                </ModernCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="companies-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Công ty hàng đầu</h2>
            <p className="section-subtitle">Những nhà tuyển dụng uy tín đang tìm kiếm nhân tài</p>
            <Link to="/companies" className="section-link">
              Xem tất cả <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="row">
            {companies.map(company => (
              <div key={company._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                <ModernCard 
                  className="company-card"
                  onClick={() => navigate(`/companies/${company._id}`)}
                >
                  <ModernCard.Body>
                    <div className="company-logo">
                      <img 
                        src={company.companyLogo || '/default-logo.png'} 
                        alt={company.companyName}
                      />
                    </div>
                    <ModernCard.Title size="sm">{company.companyName}</ModernCard.Title>
                    <ModernCard.Text variant="caption">
                      {company.industry || 'Công nghệ'}
                    </ModernCard.Text>
                    <div className="company-stats">
                      <span className="stat">
                        <i className="bi bi-people"></i>
                        {company.companySize || '100-500'}
                      </span>
                      <span className="stat">
                        <i className="bi bi-briefcase"></i>
                        {company.jobCount || 0} việc làm
                      </span>
                    </div>
                  </ModernCard.Body>
                </ModernCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mb-4">
              <ModernCard variant="gradient" className="cta-card">
                <ModernCard.Body>
                  <div className="cta-icon">
                    <i className="bi bi-person-plus"></i>
                  </div>
                  <ModernCard.Title>Dành cho ứng viên</ModernCard.Title>
                  <ModernCard.Text>
                    Tạo hồ sơ, tìm kiếm việc làm và kết nối với nhà tuyển dụng
                  </ModernCard.Text>
                  <ModernButton
                    variant="primary"
                    onClick={() => navigate('/register?role=candidate')}
                  >
                    Đăng ký ngay
                  </ModernButton>
                </ModernCard.Body>
              </ModernCard>
            </div>
            <div className="col-lg-6 mb-4">
              <ModernCard variant="gradient" className="cta-card">
                <ModernCard.Body>
                  <div className="cta-icon">
                    <i className="bi bi-building"></i>
                  </div>
                  <ModernCard.Title>Dành cho nhà tuyển dụng</ModernCard.Title>
                  <ModernCard.Text>
                    Đăng tin tuyển dụng và tìm kiếm ứng viên phù hợp
                  </ModernCard.Text>
                  <ModernButton
                    variant="secondary"
                    onClick={() => navigate('/register?role=employer')}
                  >
                    Bắt đầu tuyển dụng
                  </ModernButton>
                </ModernCard.Body>
              </ModernCard>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModernHomePage; 