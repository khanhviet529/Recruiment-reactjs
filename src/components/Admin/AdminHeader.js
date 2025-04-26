import React from 'react';
import { FaBell, FaUser } from 'react-icons/fa';

const AdminHeader = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Bảng điều khiển</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none">
              <FaBell className="h-5 w-5" />
            </button>
            
            <div className="relative">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none">
                <FaUser className="h-5 w-5" />
                <span className="hidden md:block">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 