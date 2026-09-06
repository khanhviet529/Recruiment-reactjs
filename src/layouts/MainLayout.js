import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Header />
      <main className="content-container">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
