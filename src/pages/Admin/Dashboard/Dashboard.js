import React from 'react';
import AdminHeader from '../../../components/Admin/AdminHeader/AdminHeader';
import './dashboard.scss';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <AdminHeader />
      <main className="admin-dashboard-content">
        <h2>Welcome to Admin Dashboard</h2>
        {/* Add your dashboard content here */}
      </main>
    </div>
  );
};

export default AdminDashboard; 