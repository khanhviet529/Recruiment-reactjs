import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/navbar/Navbar';
import Footer from '../components/common/footer/Footer';

const HomeLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default HomeLayout; 