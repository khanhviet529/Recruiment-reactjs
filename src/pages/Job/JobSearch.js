import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import JobCard from '../../components/job/JobCard';
import SearchFilters from '../../components/job/SearchFilters';

const JobSearch = () => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    salary: searchParams.get('salary') || '',
    experience: searchParams.get('experience') || '',
  });

  const handleSearch = async (newFilters) => {
    setLoading(true);
    try {
      // TODO: Call API to search jobs
      // const response = await jobService.search(newFilters);
      // setJobs(response.data);
    } catch (error) {
      console.error('Error searching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tìm kiếm việc làm</h1>
        <SearchFilters
          filters={filters}
          onSearch={handleSearch}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tìm kiếm...</p>
          </div>
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-600">Không tìm thấy việc làm phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearch; 