import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe } from 'react-icons/fa';
import JobCard from '../../components/job/JobCard';

const EmployerDetail = () => {
  const { id } = useParams();
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployerData = async () => {
      try {
        // TODO: Call API to get employer details and their jobs
        // const [employerResponse, jobsResponse] = await Promise.all([
        //   employerService.getById(id),
        //   jobService.getByEmployer(id)
        // ]);
        // setEmployer(employerResponse.data);
        // setJobs(jobsResponse.data);
      } catch (err) {
        setError('Không thể tải thông tin nhà tuyển dụng');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerData();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-600">Không tìm thấy thông tin nhà tuyển dụng</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-start space-x-6">
          <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <FaBuilding className="text-gray-400 text-6xl" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{employer.name}</h1>
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                <span>{employer.address}</span>
              </div>
              <div className="flex items-center">
                <FaPhone className="mr-2" />
                <span>{employer.phone}</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="mr-2" />
                <span>{employer.email}</span>
              </div>
              <div className="flex items-center">
                <FaGlobe className="mr-2" />
                <a href={employer.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                  {employer.website}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Giới thiệu công ty</h2>
          <div className="prose max-w-none">
            {employer.description}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Việc làm đang tuyển</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">Hiện tại không có việc làm nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDetail; 