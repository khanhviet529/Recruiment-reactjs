import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaBriefcase, FaBuilding } from 'react-icons/fa';
import { getAllJobs } from '../../services/jobService';
import { BiBuildings, BiMap, BiMoney } from 'react-icons/bi';

const jobTypes = [
  { id: 'featured', name: 'Việc Làm Nổi Bật' },
  { id: 'vip', name: 'Việc Làm VIP ($1000+)' },
  { id: 'headhunter', name: 'Việc Làm Từ Top Headhunter' }
];

const FeaturedJobs = () => {
  const [activeType, setActiveType] = useState('featured');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getAllJobs();
        setJobs(data.slice(0, 6)); // Get first 6 jobs
        setError(null);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Không thể tải danh sách việc làm');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Job Type Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        {jobTypes.map(type => (
          <button
            key={type.id}
            className={`pb-2 px-4 text-sm font-medium ${
              activeType === type.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveType(type.id)}
          >
            {type.name}
          </button>
        ))}
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {jobs.map(job => (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
          >
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                {job.employer?.company_logo ? (
                  <img
                    src={job.employer.company_logo}
                    alt={job.employer.company_name}
                    className="w-full h-full object-contain rounded"
                  />
                ) : (
                  <FaBuilding className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaBuilding className="w-4 h-4 mr-1" />
                    {job.employer?.company_name || 'N/A'}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                    {job.location || 'N/A'}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaBriefcase className="w-4 h-4 mr-1" />
                    {job.salary_min && job.salary_max 
                      ? `${job.salary_min} - ${job.salary_max} ${job.salary_currency}`
                      : 'Cạnh Tranh'
                    }
                  </div>
                </div>
              </div>
              {job.is_vip && (
                <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded">
                  VIP
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FeaturedJobs; 