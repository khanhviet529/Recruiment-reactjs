import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaTrash, FaFileAlt, FaCalendarAlt } from 'react-icons/fa';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // TODO: Call API to get applications
        // const response = await candidateService.getApplications({
        //   page: currentPage,
        //   status: statusFilter
        // });
        // setApplications(response.data.applications);
        // setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [currentPage, statusFilter]);

  const handleWithdraw = async (applicationId) => {
    if (window.confirm('Bạn có chắc chắn muốn rút đơn ứng tuyển này?')) {
      try {
        // TODO: Call API to withdraw application
        // await candidateService.withdrawApplication(applicationId);
        setApplications(applications.filter(app => app.id !== applicationId));
      } catch (error) {
        console.error('Error withdrawing application:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Chờ xét duyệt', color: 'bg-yellow-100 text-yellow-800' },
      reviewing: { text: 'Đang xem xét', color: 'bg-blue-100 text-blue-800' },
      accepted: { text: 'Đã chấp nhận', color: 'bg-green-100 text-green-800' },
      rejected: { text: 'Đã từ chối', color: 'bg-red-100 text-red-800' },
      withdrawn: { text: 'Đã rút', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status] || { text: 'Không xác định', color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Đơn ứng tuyển</h1>
        <div className="w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xét duyệt</option>
            <option value="reviewing">Đang xem xét</option>
            <option value="accepted">Đã chấp nhận</option>
            <option value="rejected">Đã từ chối</option>
            <option value="withdrawn">Đã rút</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vị trí ứng tuyển
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Công ty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày nộp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {application.jobTitle}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {application.companyName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(application.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <Link
                        to={`/jobs/${application.jobId}`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Xem tin tuyển dụng"
                      >
                        <FaEye />
                      </Link>
                      {application.status === 'pending' && (
                        <button
                          onClick={() => handleWithdraw(application.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Rút đơn ứng tuyển"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {applications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Chưa có đơn ứng tuyển nào
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Bắt đầu tìm kiếm và ứng tuyển việc làm ngay hôm nay.
            </p>
            <div className="mt-6">
              <Link
                to="/jobs"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Tìm việc làm
              </Link>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === page
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications; 