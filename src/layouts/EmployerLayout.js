import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  DashboardOutlined,
  ShopOutlined,
  FileTextOutlined,
  TeamOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';

import Header from '../components/common/Header';
import DashboardSidebar from '../components/common/DashboardSidebar';

const ITEMS = [
  { to: '/employer/dashboard', label: 'Bảng điều khiển', icon: <DashboardOutlined /> },
  { to: '/employer/profile', label: 'Thông tin công ty', icon: <ShopOutlined /> },
  { to: '/employer/jobs', label: 'Tin tuyển dụng', icon: <FileTextOutlined /> },
  { to: '/employer/applications', label: 'Hồ sơ ứng viên', icon: <TeamOutlined /> },
  { to: '/employer/recruitment-process', label: 'Quy trình tuyển dụng', icon: <ApartmentOutlined /> },
];

const EmployerLayout = () => (
  <div className="employer-layout">
    <Header />
    <div className="dash-shell">
      <DashboardSidebar items={ITEMS} title="Nhà tuyển dụng" />
      <main className="dash-main">
        <Outlet />
      </main>
    </div>
  </div>
);

export default EmployerLayout;
