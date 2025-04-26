import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaBriefcase,
  FaUsers,
  FaChartLine,
  FaCog,
  FaBuilding,
  FaFileAlt,
  FaBell
} from 'react-icons/fa';

const EmployerSidebar = () => {
  const menuItems = [
    {
      path: '/employer/dashboard',
      icon: <FaHome className="h-5 w-5" />,
      label: 'Tổng quan'
    },
    {
      path: '/employer/jobs',
      icon: <FaBriefcase className="h-5 w-5" />,
      label: 'Quản lý tin tuyển dụng'
    },
    {
      path: '/employer/applications',
      icon: <FaFileAlt className="h-5 w-5" />,
      label: 'Quản lý hồ sơ ứng tuyển'
    },
    {
      path: '/employer/candidates',
      icon: <FaUsers className="h-5 w-5" />,
      label: 'Quản lý ứng viên'
    },
    {
      path: '/employer/company',
      icon: <FaBuilding className="h-5 w-5" />,
      label: 'Thông tin công ty'
    },
    {
      path: '/employer/notifications',
      icon: <FaBell className="h-5 w-5" />,
      label: 'Thông báo'
    },
    {
      path: '/employer/analytics',
      icon: <FaChartLine className="h-5 w-5" />,
      label: 'Báo cáo & Thống kê'
    },
    {
      path: '/employer/settings',
      icon: <FaCog className="h-5 w-5" />,
      label: 'Cài đặt'
    }
  ];

  return (
    <div className="h-full w-64 bg-white shadow-sm">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Nhà tuyển dụng</h2>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center">
            <img
              className="h-10 w-10 rounded-full"
              src="https://via.placeholder.com/40"
              alt="Company logo"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Công ty ABC</p>
              <p className="text-xs text-gray-500">admin@company.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerSidebar; 