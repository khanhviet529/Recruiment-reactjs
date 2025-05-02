import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import JobCard from '../components/common/JobCard';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 9;

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy tất cả các tham số tìm kiếm
        const params = {};
        for (const [key, value] of searchParams.entries()) {
          params[key] = value;
        }

        // Gọi API tìm kiếm
        const response = await axios.get('http://localhost:5000/jobs/search', {
          params: params
        });

        setJobs(response.data.jobs || []);
        setTotalPages(Math.ceil((response.data.total || 0) / jobsPerPage));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Không thể tải thông tin công việc');
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchParams]);

  // Tính toán jobs hiển thị trên trang hiện tại
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">Kết quả tìm kiếm</h2>
      
      {jobs.length === 0 ? (
        <div className="alert alert-info">
          Không tìm thấy công việc phù hợp với tiêu chí tìm kiếm của bạn.
        </div>
      ) : (
        <>
          <div className="row">
            {currentJobs.map(job => (
              <div key={job.id} className="col-md-4 mb-4">
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
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Trước
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
                    Sau
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage; 