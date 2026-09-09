import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const MainLayout = () => (
  <div className="main-layout">
    <a href="#main-content" className="skip-link">Bỏ qua, tới nội dung chính</a>
    <Header />
    <main id="main-content" className="content-container">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default MainLayout;
