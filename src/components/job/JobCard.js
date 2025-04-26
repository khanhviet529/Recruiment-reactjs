import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaClock } from 'react-icons/fa';

const JobCard = ({ job }) => {
  const formatSalary = (min, max) => {
    if (min === max) return `${min} triệu`;
    return `${min} - ${max} triệu`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link to={`/jobs/${job.id}`} className="block">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600">
                {job.title}
              </h3>
            </Link>
            <Link to={`/companies/${job.companyId}`} className="mt-1 text-sm text-indigo-600 hover:text-indigo-500">
              {job.companyName}
            </Link>
          </div>
          <div className="ml-4 flex-shrink-0">
            <img
              className="h-12 w-12 rounded-full object-cover"
              src={job.companyLogo}
              alt={job.companyName}
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <FaMapMarkerAlt className="flex-shrink-0 mr-1.5 h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FaBriefcase className="flex-shrink-0 mr-1.5 h-4 w-4" />
            <span>{job.experience}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FaMoneyBillWave className="flex-shrink-0 mr-1.5 h-4 w-4" />
            <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FaClock className="flex-shrink-0 mr-1.5 h-4 w-4" />
            <span>Hạn nộp: {formatDate(job.deadline)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {skill}
              </span>
            ))}
          </div>
          <Link
            to={`/jobs/${job.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard; 