import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CompanyCard from '../components/common/CompanyCard';
import $ from 'jquery';
import 'select2';
import 'select2/dist/css/select2.min.css';
import * as bootstrap from 'bootstrap';
import '../styles/select2-custom.scss';

const CompaniesPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [displayedLocations, setDisplayedLocations] = useState([]);
  const companiesPerPage = 9;

  // Filter states
  const [selectedFilters, setSelectedFilters] = useState({
    search: '',
    locations: [],
    companySizes: []
  });

  const companySizes = [
    { id: '25-99', name: '25 - 99 nhân viên' },
    { id: '100-499', name: '100 - 499 nhân viên' },
    { id: '500-999', name: '500 - 999 nhân viên' },
    { id: '1000-4999', name: '1.000 - 4.999 nhân viên' },
    { id: '5000-9999', name: '5.000 - 9.999 nhân viên' },
    { id: '10000-19999', name: '10.000 - 19.999 nhân viên' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch companies
        const companiesResponse = await axios.get('http://localhost:5000/employers');
        setCompanies(companiesResponse.data);
        setTotalPages(Math.ceil(companiesResponse.data.length / companiesPerPage));

        // Fetch locations
        const locationsResponse = await axios.get('http://localhost:5000/locations');
        setLocations(locationsResponse.data);
        // Set initial displayed locations (first 5)
        setDisplayedLocations(locationsResponse.data.slice(0, 5));

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter companies based on selected filters
  const filterCompanies = (companies) => {
    return companies.filter(company => {
      // Search filter
      if (selectedFilters.search) {
        const searchTerm = selectedFilters.search.toLowerCase();
        const companyName = company?.companyName?.toLowerCase() || '';
        const description = company?.description?.toLowerCase() || '';
        if (!companyName.includes(searchTerm) && !description.includes(searchTerm)) {
          return false;
        }
      }

      // Location filter
      if (selectedFilters.locations.length > 0) {
        const companyCity = company?.location?.city || '';
        const companyState = company?.location?.state || '';
        if (!selectedFilters.locations.some(loc => 
          companyCity.includes(loc.name) || companyState.includes(loc.name)
        )) {
          return false;
        }
      }

      // Company size filter
      if (selectedFilters.companySizes.length > 0) {
        const companySize = company?.companySize || '';
        if (!selectedFilters.companySizes.some(size => companySize === size.id)) {
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

  // Handle checkbox change
  const handleCheckboxChange = (type, item) => {
    setSelectedFilters(prev => {
      const currentItems = prev[type];
      const exists = currentItems.some(i => i.id === item.id);
      
      let newItems;
      if (exists) {
        newItems = currentItems.filter(i => i.id !== item.id);
      } else {
        newItems = [...currentItems, item];
      }

      return {
        ...prev,
        [type]: newItems
      };
    });
    setCurrentPage(1);
  };

  // Handle search form submit
  const handleSearch = (e) => {
    e.preventDefault();
    const filteredCompanies = filterCompanies(companies);
    setTotalPages(Math.ceil(filteredCompanies.length / companiesPerPage));
  };

  // Get current companies for pagination
  const getCurrentCompanies = () => {
    const filteredCompanies = filterCompanies(companies);
    const indexOfLastCompany = currentPage * companiesPerPage;
    const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
    return filteredCompanies.slice(indexOfFirstCompany, indexOfLastCompany);
  };

  // Handle show all locations
  const handleShowAllLocations = (e) => {
    e.preventDefault();
    if (showAllLocations) {
      setDisplayedLocations(locations.slice(0, 5));
    } else {
      setDisplayedLocations(locations);
    }
    setShowAllLocations(!showAllLocations);
  };

  return (
    <div className="container py-5">
      <div className="row">
        {/* Filter Sidebar */}
        <div className="col-md-3">
          <div className="card mb-4">
            <div className="card-body">
              <form onSubmit={handleSearch}>
                <div className="mb-4">
                  <h5 className="card-title mb-3">Nơi làm việc</h5>
                  <div 
                    className={`locations-container ${showAllLocations ? 'show-all' : ''}`}
                    style={{
                      maxHeight: showAllLocations ? '300px' : 'auto',
                      overflowY: showAllLocations ? 'auto' : 'hidden'
                    }}
                  >
                    <div className="d-flex flex-column gap-2">
                      {displayedLocations.map(location => (
                        <div key={location.id} className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`location-${location.id}`}
                            checked={selectedFilters.locations.some(l => l.id === location.id)}
                            onChange={() => handleCheckboxChange('locations', location)}
                          />
                          <label className="form-check-label" htmlFor={`location-${location.id}`}>
                            {location.name}
                            <span className="text-muted ms-2">
                              ({location.jobCount})
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {locations.length > 5 && (
                    <div className="mt-2">
                      <a 
                        href="#" 
                        className="text-primary text-decoration-none d-flex align-items-center"
                        onClick={handleShowAllLocations}
                      >
                        {showAllLocations ? (
                          <>
                            <i className="bi bi-chevron-up me-1"></i>
                            Thu gọn
                          </>
                        ) : (
                          <>
                            <i className="bi bi-chevron-down me-1"></i>
                            Xem tất cả
                          </>
                        )}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h5 className="card-title mb-3">Quy mô</h5>
                  <div className="d-flex flex-column gap-2">
                    {companySizes.map(size => (
                      <div key={size.id} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`size-${size.id}`}
                          checked={selectedFilters.companySizes.some(s => s.id === size.id)}
                          onChange={() => handleCheckboxChange('companySizes', size)}
                        />
                        <label className="form-check-label" htmlFor={`size-${size.id}`}>
                          {size.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Áp dụng bộ lọc
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Companies List */}
        <div className="col-md-9">
          <div className="mb-4">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm công ty..."
                value={selectedFilters.search}
                onChange={handleSearchChange}
              />
              <button className="btn btn-primary" type="button" onClick={handleSearch}>
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : getCurrentCompanies().length === 0 ? (
            <div className="alert alert-info">
              Không tìm thấy công ty phù hợp với tiêu chí tìm kiếm của bạn.
            </div>
          ) : (
            <>
              <div className="row">
                {getCurrentCompanies().map(company => (
                  <div key={company.id} className="col-md-6 col-lg-4 mb-4">
                    <CompanyCard company={company} />
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

export default CompaniesPage; 