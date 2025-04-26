import React, { useState } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';

const SearchFilters = ({ onSearch, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    experience: '',
    salary: '',
    jobType: '',
    industry: ''
  });

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm việc làm..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Địa điểm
            </label>
            <select
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Tất cả địa điểm</option>
              <option value="hanoi">Hà Nội</option>
              <option value="hcm">TP. Hồ Chí Minh</option>
              <option value="danang">Đà Nẵng</option>
              <option value="other">Địa điểm khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Kinh nghiệm
            </label>
            <select
              name="experience"
              value={filters.experience}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Tất cả kinh nghiệm</option>
              <option value="intern">Thực tập sinh</option>
              <option value="fresher">Fresher</option>
              <option value="junior">Junior (1-3 năm)</option>
              <option value="senior">Senior (3-5 năm)</option>
              <option value="expert">Expert (5+ năm)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mức lương
            </label>
            <select
              name="salary"
              value={filters.salary}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Tất cả mức lương</option>
              <option value="0-5">Dưới 5 triệu</option>
              <option value="5-10">5 - 10 triệu</option>
              <option value="10-15">10 - 15 triệu</option>
              <option value="15-20">15 - 20 triệu</option>
              <option value="20+">Trên 20 triệu</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Loại hình công việc
            </label>
            <select
              name="jobType"
              value={filters.jobType}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Tất cả loại hình</option>
              <option value="fulltime">Toàn thời gian</option>
              <option value="parttime">Bán thời gian</option>
              <option value="internship">Thực tập</option>
              <option value="remote">Làm việc từ xa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ngành nghề
            </label>
            <select
              name="industry"
              value={filters.industry}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Tất cả ngành nghề</option>
              <option value="it">Công nghệ thông tin</option>
              <option value="finance">Tài chính - Ngân hàng</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Kinh doanh - Bán hàng</option>
              <option value="hr">Nhân sự</option>
              <option value="design">Thiết kế</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaFilter className="mr-2" />
            Tìm kiếm
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchFilters; 