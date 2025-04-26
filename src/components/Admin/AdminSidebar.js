import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaUsers,
  FaBriefcase,
  FaBuilding,
  FaChartLine,
  FaCog,
  FaFileAlt,
  FaBell
} from 'react-icons/fa';

const AdminSidebar = () => {
  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: <FaHome className="h-5 w-5" />,
      label: 'Tổng quan'
    },
    {
      path: '/admin/users',
      icon: <FaUsers className="h-5 w-5" />,
      label: 'Quản lý người dùng'
    },
    {
      path: '/admin/jobs',
      icon: <FaBriefcase className="h-5 w-5" />,
      label: 'Quản lý việc làm'
    },
    {
      path: '/admin/companies',
      icon: <FaBuilding className="h-5 w-5" />,
      label: 'Quản lý công ty'
    },
    {
      path: '/admin/reports',
      icon: <FaChartLine className="h-5 w-5" />,
      label: 'Báo cáo'
    },
    {
      path: '/admin/settings',
      icon: <FaCog className="h-5 w-5" />,
      label: 'Cài đặt'
    }
  ];

  return (
    <div className="w-64 bg-white shadow-sm">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Quản trị viên</h2>
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
      </div>
    </div>
  );
};

export default AdminSidebar;