import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  HeartOutlined,
  IdcardOutlined,
} from '@ant-design/icons';

import Header from '../components/common/Header';
import DashboardSidebar from '../components/common/DashboardSidebar';

const ITEMS = [
  { to: '/candidate/dashboard', label: 'Bảng điều khiển', icon: <DashboardOutlined /> },
  { to: '/candidate/profile', label: 'Hồ sơ cá nhân', icon: <UserOutlined /> },
  { to: '/candidate/applications', label: 'Hồ sơ đã nộp', icon: <FileTextOutlined /> },
  { to: '/candidate/saved-jobs', label: 'Công việc đã lưu', icon: <HeartOutlined /> },
  { to: '/candidate/cv-templates', label: 'Mẫu CV', icon: <IdcardOutlined /> },
];

const CandidateLayout = () => (
  <div className="candidate-layout">
    <Header />
    <div className="dash-shell">
      <DashboardSidebar items={ITEMS} title="Ứng viên" />
      <main className="dash-main">
        <Outlet />
      </main>
    </div>
  </div>
);

export default CandidateLayout;
