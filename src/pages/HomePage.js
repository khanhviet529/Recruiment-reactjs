import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import $ from 'jquery';
import 'select2';
import 'select2/dist/css/select2.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';
import '../styles/select2-custom.scss';

const HomePage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 9;

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Refs for Select2 elements
  const locationSelectRef = useRef(null);

  // Object to map filter types to their user-friendly names
  const filterLabels = {
    location: "Địa điểm"
  };

  // Icons for each filter type
  const filterIcons = {
    location: "bi-geo-alt"
  };

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

  // Initialize Location Select2
  useEffect(() => {
    let locationSelect = null;

    if (locations.length > 0 && locationSelectRef.current) {
      locationSelect = $(locationSelectRef.current);
      
      locationSelect.select2({
        placeholder: 'Chọn địa điểm...',
        allowClear: true,
        width: '100%',
        multiple: true,
        closeOnSelect: false,
        dropdownCssClass: 'custom-select2-dropdown',
        templateResult: formatOptionResult,
        templateSelection: (option) => formatMultiLocationSelection(option)
      }).on('change', function() {
        const values = $(this).val() || [];
        if (values.length > 0) {
          const selectedLocations = values.map(value => {
            return locations.find(loc => loc.id === value);
          }).filter(Boolean);
          
          setSelectedLocation(selectedLocations);
        } else {
          setSelectedLocation(null);
        }
      });

      setTimeout(() => {
        const placeholder = locationSelect.next().find('.select2-selection__placeholder');
        if (placeholder.length && !placeholder.find('i').length) {
          placeholder.prepend(`<i class="${filterIcons.location} text-muted me-1"></i>`);
        }
        
        locationSelect.next('.select2-container').addClass('blue-select2-container');
      }, 100);
    }

    return () => {
      try {
        if (locationSelect && locationSelect.data('select2')) {
          locationSelect.select2('destroy');
        }
      } catch (error) {
        console.warn('Error destroying location select2:', error);
      }
    };
  }, [locations]);

  // Format option result for Select2 dropdown
  const formatOptionResult = (option) => {
    if (!option.id) {
      return option.text;
    }
    
    const item = locations.find(loc => loc.id === option.id);
    const count = item?.jobCount || 0;
    
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

  // Format multi location selection
  const formatMultiLocationSelection = (option) => {
    if (!option.id) {
      return option.text;
    }
    
    const select = $(option.element.parentElement);
    const selectedValues = select.val() || [];
    const selectedCount = selectedValues.length;
    
    if (option.id !== selectedValues[0]) {
      return '';
    }
    
    const selectedItems = selectedValues.map(value => {
      const item = locations.find(location => location.id === value);
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
        <i class="${filterIcons.location} me-1"></i>
        ${filterLabels.location}
        ${selectedCount > 0 ? `<span class="selected-count">x${selectedCount}</span>` : ''}
      </span>
    `);
  };

  // Initialize tooltips after Select2 changes
  useEffect(() => {
    if (locations) {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
          html: true,
          placement: 'bottom'
        });
      });
    }
  }, [locations, selectedLocation]);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    
    if (searchQuery) queryParams.append('q', searchQuery);
    
    if (selectedLocation && selectedLocation.length > 0) {
      const locationIds = selectedLocation.map(loc => loc.id).join(',');
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
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
              
              {/* Search Form */}
              <div className="search-box bg-white p-3 rounded shadow-sm">
                <form onSubmit={handleSearch} className="row g-2">
                  <div className="col-12 col-md-5">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Nhập tên vị trí, công ty, từ khóa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="col-12 col-md-5">
                    <div className="custom-select2-wrapper">
                      <select 
                        ref={locationSelectRef}
                        id="location-select"
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
                  
                  <div className="col-12 col-md-2">
                    <button type="submit" className="btn btn-primary w-100">
                      Tìm kiếm
                    </button>
                  </div>
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
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <>
              <div className="row">
                {currentJobs.map((job) => (
                  <div key={job.id} className="col-md-4 mb-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title mb-0">{job.title}</h5>
                          {job.isUrgent && (
                            <span className="badge bg-danger">Gấp</span>
                          )}
                        </div>
                        <h6 className="card-subtitle mb-2 text-muted">
                          {job.location} {job.isRemote ? '(Remote)' : ''}
                        </h6>
                        <p className="card-text text-truncate">{job.shortDescription}</p>
                        <div className="mb-3">
                          <small className="text-muted">
                            <i className="bi bi-briefcase me-1"></i>
                            {job.jobType}
                          </small>
                          <small className="text-muted ms-3">
                            <i className="bi bi-cash me-1"></i>
                            {formatSalary(job.salary)}
                          </small>
                        </div>
                        <div className="mb-3">
                          {job.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="badge bg-light text-dark me-1">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            <i className="bi bi-eye me-1"></i>
                            {job.views} lượt xem
                          </small>
                          <Link to={`/jobs/${job.id}`} className="btn btn-outline-primary btn-sm">
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
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
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => paginate(number)}
                        >
                          {number}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <i className="bi bi-chevron-right"></i>
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

export default HomePage;