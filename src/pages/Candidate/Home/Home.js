import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../../../services/httpClient';
import './home.scss';

const Home = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    experience: '',
    salary: '',
    education: '',
    employmentType: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sortOption, setSortOption] = useState('latest');
  const [displayedJobs, setDisplayedJobs] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [jobs, filters, searchQuery, locationQuery, sortOption]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all necessary data in parallel
      const [jobsData, categoriesData, locationsData, employersData] = await Promise.all([
        http.get('/jobPosts?status=published'),
        http.get('/categories'),
        http.get('/locations'),
        http.get('/employers')
      ]);
      
      // Fetch saved jobs if user is logged in
      const user = JSON.parse(localStorage.getItem('user'));
      let savedJobsData = [];
      if (user && user.roleProfile) {
        savedJobsData = await http.get(`/savedJobs?candidate_id=${user.roleProfile.id}`);
      }
      
      // Process data for display
      const enhancedJobs = await enhanceJobData(jobsData, employersData);
      
      setJobs(enhancedJobs);
      setCategories(categoriesData);
      setLocations(locationsData);
      setEmployers(employersData);
      setSavedJobs(savedJobsData.map(saved => saved.job_post_id));
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const enhanceJobData = async (jobsData, employersData) => {
    // Add employer details to each job
    const enhancedJobs = await Promise.all(jobsData.map(async (job) => {
      // Find employer for this job
      const employer = employersData.find(emp => emp.id === job.employer_id);
      
      // Get category for this job
      const jobCategoriesData = await http.get(`/jobCategories?job_post_id=${job.id}`);
      let category = null;
      if (jobCategoriesData && jobCategoriesData.length > 0) {
        const categoryData = await http.get(`/categories/${jobCategoriesData[0].category_id}`);
        category = categoryData;
      }
      
      // Get location for this job
      const jobLocationsData = await http.get(`/jobLocations?job_post_id=${job.id}`);
      let location = null;
      if (jobLocationsData && jobLocationsData.length > 0) {
        const locationData = await http.get(`/locations/${jobLocationsData[0].location_id}`);
        location = locationData;
      }
      
      return {
        ...job,
        company_name: employer ? employer.company_name : 'Unknown Company',
        company_logo: employer ? employer.company_logo : null,
        category: category,
        location_name: location ? location.name : job.location
      };
    }));
    
    return enhancedJobs;
  };

  const applyFiltersAndSort = () => {
    if (!jobs.length) return;
    
    let filteredJobs = [...jobs];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(query) || 
        job.company_name.toLowerCase().includes(query) ||
        (job.description && job.description.toLowerCase().includes(query))
      );
    }
    
    // Apply location filter
    if (locationQuery) {
      const query = locationQuery.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.location_name && job.location_name.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (filters.category) {
      filteredJobs = filteredJobs.filter(job => 
        job.category && job.category.id === filters.category
      );
    }
    
    // Apply experience filter
    if (filters.experience) {
      filteredJobs = filteredJobs.filter(job => {
        // Parse experience required to get min years
        const expText = job.experience_required || '';
        
        if (filters.experience === '0') {
          return expText.includes('Không yêu cầu') || expText.includes('Chưa có kinh nghiệm');
        } else if (filters.experience === '1') {
          return expText.includes('Dưới 1 năm');
        } else {
          // Extract years from text like "1-2 years" or "3-5 years"
          const matches = expText.match(/(\d+)-?(\d+)?/);
          if (matches) {
            const minExp = parseInt(matches[1]);
            return minExp <= parseInt(filters.experience);
          }
          return false;
        }
      });
    }
    
    // Apply salary filter
    if (filters.salary) {
      filteredJobs = filteredJobs.filter(job => {
        if (filters.salary === 'negotiable') {
          return job.is_salary_negotiable;
        } else if (filters.salary === 'range1') {
          return job.salary_max && job.salary_max < 10;
        } else if (filters.salary === 'range2') {
          return job.salary_min >= 10 && job.salary_max <= 20;
        } else if (filters.salary === 'range3') {
          return job.salary_min > 20;
        }
        return true;
      });
    }
    
    // Apply education filter
    if (filters.education) {
      filteredJobs = filteredJobs.filter(job => 
        job.education_required && job.education_required.includes(filters.education)
      );
    }
    
    // Apply employment type filter
    if (filters.employmentType) {
      filteredJobs = filteredJobs.filter(job => 
        job.employment_type === filters.employmentType
      );
    }
    
    // Apply sorting
    if (sortOption === 'latest') {
      filteredJobs.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    } else if (sortOption === 'salary-desc') {
      filteredJobs.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
    } else if (sortOption === 'salary-asc') {
      filteredJobs.sort((a, b) => (a.salary_min || 0) - (b.salary_min || 0));
    }
    
    setDisplayedJobs(filteredJobs);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFiltersAndSort();
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSaveJob = async (jobId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.roleProfile) {
        navigate('/login');
        return;
      }
      
      // Check if already saved
      const isSaved = savedJobs.includes(jobId);
      
      if (isSaved) {
        // Find the savedJob entry to delete
        const savedJobsData = await http.get(`/savedJobs?candidate_id=${user.roleProfile.id}&job_post_id=${jobId}`);
        if (savedJobsData && savedJobsData.length > 0) {
          await http.delete(`/savedJobs/${savedJobsData[0].id}`);
          setSavedJobs(prev => prev.filter(id => id !== jobId));
        }
      } else {
        // Add new saved job
        await http.post('/savedJobs', {
          candidate_id: user.roleProfile.id,
          job_post_id: jobId,
          saved_at: new Date().toISOString()
        });
        setSavedJobs(prev => [...prev, jobId]);
      }
    } catch (error) {
      console.error('Error handling saved job:', error);
    }
  };

  const handleViewJobDetails = (jobId) => {
    navigate(`/candidate/jobs/${jobId}`);
  };

  return (
    <div className="home-container">
      {/* Top Banner */}
      <div className="top-banner">
        <div className="banner-content">
          <h1>CareerLink</h1>
          <p>Tìm kiếm công việc phù hợp với bạn</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm việc làm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="location-input">
            <i className="fas fa-map-marker-alt"></i>
            <input
              type="text"
              placeholder="Nhập tỉnh, thành phố"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="search-button">
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-item">
          <i className="fas fa-briefcase"></i>
          <select 
            onChange={(e) => handleFilterChange('category', e.target.value)}
            value={filters.category}
          >
            <option value="">Ngành nghề</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <i className="fas fa-layer-group"></i>
          <select 
            onChange={(e) => handleFilterChange('employmentType', e.target.value)}
            value={filters.employmentType}
          >
            <option value="">Loại công việc</option>
            <option value="full-time">Toàn thời gian</option>
            <option value="part-time">Bán thời gian</option>
            <option value="internship">Thực tập</option>
            <option value="contract">Hợp đồng</option>
          </select>
        </div>

        <div className="filter-item">
          <i className="fas fa-clock"></i>
          <select 
            onChange={(e) => handleFilterChange('experience', e.target.value)}
            value={filters.experience}
          >
            <option value="">Kinh nghiệm</option>
            <option value="0">Chưa có kinh nghiệm</option>
            <option value="1">Dưới 1 năm</option>
            <option value="2">1-2 năm</option>
            <option value="3">3-5 năm</option>
            <option value="5">Trên 5 năm</option>
          </select>
        </div>

        <div className="filter-item">
          <i className="fas fa-money-bill"></i>
          <select 
            onChange={(e) => handleFilterChange('salary', e.target.value)}
            value={filters.salary}
          >
            <option value="">Mức lương</option>
            <option value="negotiable">Thỏa thuận</option>
            <option value="range1">Dưới 10 triệu</option>
            <option value="range2">10-20 triệu</option>
            <option value="range3">Trên 20 triệu</option>
          </select>
        </div>

        <div className="filter-item">
          <i className="fas fa-graduation-cap"></i>
          <select 
            onChange={(e) => handleFilterChange('education', e.target.value)}
            value={filters.education}
          >
            <option value="">Học vấn</option>
            <option value="High School">THPT</option>
            <option value="Associate Degree">Cao đẳng</option>
            <option value="Bachelor's Degree">Đại học</option>
            <option value="Master's Degree">Thạc sĩ</option>
            <option value="Doctorate">Tiến sĩ</option>
          </select>
        </div>
      </div>

      {/* Jobs List Section */}
      <div className="jobs-section">
        <div className="jobs-header">
          <h2>{displayedJobs.length} việc làm</h2>
          <select 
            className="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="latest">Mới cập nhật</option>
            <option value="salary-desc">Lương cao đến thấp</option>
            <option value="salary-asc">Lương thấp đến cao</option>
          </select>
        </div>

        <div className="jobs-list">
          {isLoading ? (
            <div className="loading">Đang tải...</div>
          ) : displayedJobs.length > 0 ? (
            displayedJobs.map(job => (
              <div key={job.id} className="job-card" onClick={() => handleViewJobDetails(job.id)}>
                <div className="job-logo">
                  <img src={job.company_logo || '/default-company-logo.png'} alt="Company logo" />
                </div>
                <div className="job-info">
                  <h3 className="job-title">{job.title}</h3>
                  <div className="company-name">{job.company_name}</div>
                  <div className="job-details">
                    <span className="salary">
                      <i className="fas fa-money-bill"></i> 
                      {job.is_salary_negotiable 
                        ? 'Thỏa thuận' 
                        : `${job.salary_min} - ${job.salary_max} ${job.salary_currency || 'VND'}`
                      }
                    </span>
                    <span className="location">
                      <i className="fas fa-map-marker-alt"></i> {job.location_name || job.location || 'Không xác định'}
                    </span>
                    <span className="experience">
                      <i className="fas fa-clock"></i> {job.experience_required || 'Không yêu cầu'}
                    </span>
                  </div>
                  {job.deadline && (
                    <div className="deadline">
                      <i className="fas fa-calendar-alt"></i> Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>
                <div className="job-actions" onClick={e => e.stopPropagation()}>
                  <button 
                    className={`save-button ${savedJobs.includes(job.id) ? 'saved' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveJob(job.id);
                    }}
                  >
                    <i className={savedJobs.includes(job.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                  </button>
                  <span className="post-time">
                    Cập nhật: {new Date(job.updated_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-jobs">
              <i className="fas fa-search"></i>
              <p>Không tìm thấy việc làm phù hợp với tìm kiếm của bạn.</p>
              <button className="reset-button" onClick={() => {
                setSearchQuery('');
                setLocationQuery('');
                setFilters({
                  category: '',
                  location: '',
                  experience: '',
                  salary: '',
                  education: '',
                  employmentType: ''
                });
              }}>
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 