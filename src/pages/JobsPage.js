import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import JobCard from '../components/common/JobCard';
import $ from 'jquery';
import 'select2';
import 'select2/dist/css/select2.min.css';
import * as bootstrap from 'bootstrap';
import '../styles/select2-custom.scss';

const JobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 9;

  // Filter states
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    search: '',
    location: [],
    industries: [],
    experienceLevels: [],
    jobLevels: [],
    salaries: [],
    educationLevels: [],
    jobTypes: [],
    postingDates: []
  });

  // Refs for Select2 elements
  const locationSelectRef = useRef(null);
  const industriesSelectRef = useRef(null);
  const experienceLevelsSelectRef = useRef(null);
  const jobLevelsSelectRef = useRef(null);
  const salariesSelectRef = useRef(null);
  const educationLevelsSelectRef = useRef(null);
  const jobTypesSelectRef = useRef(null);
  const postingDatesSelectRef = useRef(null);

  // Filter labels and icons
  const filterLabels = {
    location: "Địa điểm",
    industries: "Ngành nghề",
    experienceLevels: "Kinh nghiệm",
    jobLevels: "Cấp bậc",
    salaries: "Mức lương",
    educationLevels: "Học vấn",
    jobTypes: "Loại công việc",
    postingDates: "Đăng trong"
  };

  const filterIcons = {
    location: "bi-geo-alt",
    industries: "bi-briefcase",
    experienceLevels: "bi-clock-history",
    jobLevels: "bi-bar-chart",
    salaries: "bi-cash",
    educationLevels: "bi-mortarboard",
    jobTypes: "bi-list-task",
    postingDates: "bi-calendar-check"
  };

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
        setJobs(jobsArray);
        setLocations(locationsResponse.data);
        setFilters(filtersResponse.data);
        setTotalPages(Math.ceil(jobsArray.length / jobsPerPage));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize Select2 for all filters
  useEffect(() => {
    if (!filters || !locations) return;

    const select2Instances = [];
    const selectConfigs = [
      { ref: locationSelectRef, data: locations, type: 'location' },
      { ref: industriesSelectRef, data: filters.industries, type: 'industries' },
      { ref: experienceLevelsSelectRef, data: filters.experienceLevels, type: 'experienceLevels' },
      { ref: jobLevelsSelectRef, data: filters.jobLevels, type: 'jobLevels' },
      { ref: salariesSelectRef, data: filters.salaries, type: 'salaries' },
      { ref: educationLevelsSelectRef, data: filters.educationLevels, type: 'educationLevels' },
      { ref: jobTypesSelectRef, data: filters.jobTypes, type: 'jobTypes' },
      { ref: postingDatesSelectRef, data: filters.postingDates, type: 'postingDates' }
    ];

    selectConfigs.forEach(({ ref, data, type }) => {
      if (ref.current) {
        const $select = $(ref.current);
        select2Instances.push($select);

        $select.select2({
          placeholder: filterLabels[type],
          allowClear: true,
          multiple: true,
          width: '100%',
          closeOnSelect: false,
          dropdownCssClass: 'custom-select2-dropdown',
          templateResult: (option) => formatOptionResult(option, type, data),
          templateSelection: (option) => formatFilterSelection(option, type, data)
        }).on('change', function() {
          const values = $(this).val() || [];
          const selected = values.map(value => {
            const item = data.find(item => item.id === value);
            return item;
          }).filter(Boolean);
          
          setSelectedFilters(prev => ({
            ...prev,
            [type]: selected
          }));
        });

        $select.next('.select2-container').addClass('blue-select2-container');
      }
    });

    // Add icons to select2 dropdowns
    setTimeout(() => {
      selectConfigs.forEach(({ ref, type }) => {
        if (ref.current) {
          const placeholder = $(ref.current).next().find('.select2-selection__placeholder');
          if (placeholder.length && !placeholder.find('i').length) {
            placeholder.prepend(`<i class="${filterIcons[type]} text-muted me-1"></i>`);
          }
        }
      });
    }, 100);

    return () => {
      select2Instances.forEach($select => {
        try {
          if ($select.data('select2')) {
            $select.select2('destroy');
          }
        } catch (error) {
          console.warn('Error destroying select2:', error);
        }
      });
    };
  }, [filters, locations]);

  // Format option result for Select2 dropdown
  const formatOptionResult = (option, type, data) => {
    if (!option.id) return option.text;
    
    const item = data.find(item => item.id === option.id);
    const count = item?.count || item?.jobCount || 0;
    
    const isSelected = $(option.element).is(':selected');
    const selectedClass = isSelected ? 'selected' : '';
    
    return $(`
      <div class="d-flex justify-content-between align-items-center w-100 option-item ${selectedClass}">
        <span>${option.text}</span>
        <small class="text-muted">(${count})</small>
        ${isSelected ? '<span class="selected-indicator ms-2"><i class="bi bi-check-lg text-primary"></i></span>' : ''}
      </div>
    `);
  };

  // Format filter selection
  const formatFilterSelection = (option, type, data) => {
    if (!option.id) return option.text;
    
    const select = $(option.element.parentElement);
    const selectedValues = select.val() || [];
    const selectedCount = selectedValues.length;
    
    if (option.id !== selectedValues[0]) return '';
    
    const selectedItems = selectedValues.map(value => {
      const item = data.find(item => item.id === value);
      return item ? item.name : '';
    }).filter(Boolean);
    
    const tooltipContent = selectedItems.join('<br>');
    
    return $(`
      <span 
        class="selected-filter" 
        data-bs-toggle="tooltip" 
        data-bs-html="true" 
        title="${tooltipContent}"
      >
        <i class="${filterIcons[type]} me-1"></i>
        ${filterLabels[type]}
        ${selectedCount > 0 ? `<span class="selected-count">x${selectedCount}</span>` : ''}
      </span>
    `);
  };

  // Initialize tooltips
  useEffect(() => {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl, {
        html: true,
        placement: 'bottom'
      });
    });
  }, [selectedFilters]);

  // Filter jobs based on selected filters
  const filterJobs = (jobs) => {
    return jobs.filter(job => {
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
        if (!selectedFilters.location.some(loc => loc.name === job.location)) {
          return false;
        }
      }

      // Industry filter
      if (selectedFilters.industries.length > 0) {
        if (!selectedFilters.industries.some(ind => job.categories.includes(ind.name))) {
          return false;
        }
      }

      // Experience level filter
      if (selectedFilters.experienceLevels.length > 0) {
        if (!selectedFilters.experienceLevels.some(exp => exp.name === job.experienceLevel)) {
          return false;
        }
      }

      // Job level filter
      if (selectedFilters.jobLevels.length > 0) {
        if (!selectedFilters.jobLevels.some(level => level.name === job.jobLevel)) {
          return false;
        }
      }

      // Salary filter
      if (selectedFilters.salaries.length > 0) {
        const jobSalary = job.salary.isHidden ? null : job.salary.min;
        if (!selectedFilters.salaries.some(salary => {
          if (salary.minValue === null) return job.salary.isHidden;
          if (job.salary.isHidden) return false;
          return jobSalary >= salary.minValue && 
                 (salary.maxValue === null || jobSalary <= salary.maxValue);
        })) {
          return false;
        }
      }

      // Education level filter
      if (selectedFilters.educationLevels.length > 0) {
        if (!selectedFilters.educationLevels.some(edu => edu.name === job.educationLevel)) {
          return false;
        }
      }

      // Job type filter
      if (selectedFilters.jobTypes.length > 0) {
        if (!selectedFilters.jobTypes.some(type => type.name === job.jobType)) {
          return false;
        }
      }

      // Posting date filter
      if (selectedFilters.postingDates.length > 0) {
        const jobDate = new Date(job.createdAt);
        const now = new Date();
        if (!selectedFilters.postingDates.some(date => {
          const daysAgo = Math.floor((now - jobDate) / (1000 * 60 * 60 * 24));
          return daysAgo <= date.days;
        })) {
          return false;
        }
      }

      return true;
    });
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSelectedFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
    setCurrentPage(1);
  };

  // Handle search form submit
  const handleSearch = (e) => {
    e.preventDefault();
    const filteredJobs = filterJobs(jobs);
    setTotalPages(Math.ceil(filteredJobs.length / jobsPerPage));
  };

  // Get current jobs for pagination
  const getCurrentJobs = () => {
    const filteredJobs = filterJobs(jobs);
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    return filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  };

  return (
    <div className="container py-5">
      <div className="row">
        {/* Filter Sidebar */}
        <div className="col-md-3">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-4">Bộ lọc</h5>
              
              <form onSubmit={handleSearch}>
                <div className="mb-3">
                  <label className="form-label">Từ khóa</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      name="search"
                      value={selectedFilters.search}
                      onChange={handleSearchChange}
                      placeholder="Nhập từ khóa..."
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Địa điểm</label>
                  <div className="custom-select2-wrapper">
                    <select
                      ref={locationSelectRef}
                      className="form-select custom-select2"
                      multiple
                      data-placeholder="Chọn địa điểm..."
                    >
                      <option value=""></option>
                      {locations.map(location => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Ngành nghề</label>
                  <div className="custom-select2-wrapper">
                    <select
                      ref={industriesSelectRef}
                      className="form-select custom-select2"
                      multiple
                      data-placeholder="Chọn ngành nghề..."
                    >
                      <option value=""></option>
                      {filters?.industries?.map(industry => (
                        <option key={industry.id} value={industry.id}>
                          {industry.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Kinh nghiệm</label>
                  <div className="custom-select2-wrapper">
                    <select
                      ref={experienceLevelsSelectRef}
                      className="form-select custom-select2"
                      multiple
                      data-placeholder="Chọn kinh nghiệm..."
                    >
                      <option value=""></option>
                      {filters?.experienceLevels?.map(level => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Cấp bậc</label>
                  <div className="custom-select2-wrapper">
                    <select
                      ref={jobLevelsSelectRef}
                      className="form-select custom-select2"
                      multiple
                      data-placeholder="Chọn cấp bậc..."
                    >
                      <option value=""></option>
                      {filters?.jobLevels?.map(level => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Mức lương</label>
                  <div className="custom-select2-wrapper">
                    <select
                      ref={salariesSelectRef}
                      className="form-select custom-select2"
                      multiple
                      data-placeholder="Chọn mức lương..."
                    >
                      <option value=""></option>
                      {filters?.salaries?.map(salary => (
                        <option key={salary.id} value={salary.id}>
                          {salary.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Học vấn</label>
                  <div className="custom-select2-wrapper">
                    <select
                      ref={educationLevelsSelectRef}
                      className="form-select custom-select2"
                      multiple
                      data-placeholder="Chọn học vấn..."
                    >
                      <option value=""></option>
                      {filters?.educationLevels?.map(level => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Loại công việc</label>
                  <div className="custom-select2-wrapper">
                    <select
                      ref={jobTypesSelectRef}
                      className="form-select custom-select2"
                      multiple
                      data-placeholder="Chọn loại công việc..."
                    >
                      <option value=""></option>
                      {filters?.jobTypes?.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Thời gian đăng</label>
                  <div className="custom-select2-wrapper">
                    <select
                      ref={postingDatesSelectRef}
                      className="form-select custom-select2"
                      multiple
                      data-placeholder="Chọn thời gian..."
                    >
                      <option value=""></option>
                      {filters?.postingDates?.map(date => (
                        <option key={date.id} value={date.id}>
                          {date.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Áp dụng bộ lọc
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Danh sách công việc</h2>
            <span className="text-muted">
              Hiển thị {getCurrentJobs().length} công việc
            </span>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : getCurrentJobs().length === 0 ? (
            <div className="alert alert-info">
              Không tìm thấy công việc phù hợp với tiêu chí tìm kiếm của bạn.
            </div>
          ) : (
            <>
              <div className="row">
                {getCurrentJobs().map(job => (
                  <div key={job.id} className="col-md-6 col-lg-4 mb-4">
                    <JobCard job={job} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Trước
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(number)}
                        >
                          {number}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Sau
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsPage; 