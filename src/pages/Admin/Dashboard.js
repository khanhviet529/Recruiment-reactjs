import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaBriefcase,
  FaBuilding,
  FaChartLine,
  FaUserCheck,
  FaUserTimes
} from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalEmployers: 0,
    activeJobs: 0,
    newCandidates: 0,
    newEmployers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: Call API to get dashboard statistics
        // const response = await adminService.getDashboardStats();
        // setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng số người dùng',
      value: stats.totalUsers,
      icon: <FaUsers className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Tổng số việc làm',
      value: stats.totalJobs,
      icon: <FaBriefcase className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Tổng số nhà tuyển dụng',
      value: stats.totalEmployers,
      icon: <FaBuilding className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Việc làm đang hoạt động',
      value: stats.activeJobs,
      icon: <FaChartLine className="w-6 h-6" />,
      color: 'bg-yellow-500'
    },
    {
      title: 'Ứng viên mới',
      value: stats.newCandidates,
      icon: <FaUserCheck className="w-6 h-6" />,
      color: 'bg-pink-500'
    },
    {
      title: 'Nhà tuyển dụng mới',
      value: stats.newEmployers,
      icon: <FaUserTimes className="w-6 h-6" />,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div className={`${card.color} rounded-full p-3 text-white`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Việc làm mới nhất
          </h2>
          {/* TODO: Add recent jobs list */}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Người dùng mới nhất
          </h2>
          {/* TODO: Add recent users list */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;