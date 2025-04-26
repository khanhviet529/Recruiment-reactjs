import React from 'react';
import { Outlet } from 'react-router-dom';
// import Navbar from '../components/common/Navbar';
import EmployerSidebar from '../components/employer/EmployerSidebar';

const EmployerLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* <Navbar /> */}
      <div className="flex">
        <EmployerSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployerLayout; 