import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomeLayout from '../layouts/HomeLayout';
import AuthLayout from '../layouts/AuthLayout';
import EmployerLayout from '../layouts/EmployerLayout';
import AdminLayout from '../layouts/AdminLayout';
// import Home from '../pages/Home';
import Home from '../pages/Candidate/Home/Home';
import Login from '../pages/Auth/Login/Login';
import Register from '../pages/Auth/Register/Register';
import NotFound from '../pages/Error/NotFound';
import JobSearch from '../pages/Job/JobSearch';
import JobDetail from '../pages/Job/JobDetail';
import EmployerDetail from '../pages/Employer/EmployerDetail';

// Candidate Pages
import CandidateProfile from '../pages/Candidate/Profile/Profile';
import CandidateCV from '../pages/Candidate/CV';
import CandidateApplications from '../pages/Candidate/Applications';
import CandidateSavedJobs from '../pages/Candidate/SavedJobs';
import CandidateSettings from '../pages/Candidate/Settings';

// Employer Pages
import EmployerDashboard from '../pages/Employer/Dashboard';
import EmployerJobs from '../pages/Employer/Jobs';
import EmployerProfile from '../pages/Employer/Profile';

// Admin Pages
import AdminDashboard from '../pages/Admin/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<Home />} />   
        <Route path="jobs" element={<JobSearch />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="employers/:id" element={<EmployerDetail />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Candidate Routes */}
      <Route path="/candidate" element={
        <ProtectedRoute roles={['candidate']}>
          <HomeLayout />
        </ProtectedRoute>
      }>
        <Route path="profile" element={<CandidateProfile />} />
        <Route path="cv" element={<CandidateCV />} />
        <Route path="applications" element={<CandidateApplications />} />
        <Route path="saved-jobs" element={<CandidateSavedJobs />} />
        <Route path="settings" element={<CandidateSettings />} />
      </Route>

      {/* Employer Routes */}
      <Route path="/employer" element={
        <ProtectedRoute roles={['employer']}>
          <EmployerLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<EmployerDashboard />} />
        <Route path="jobs" element={<EmployerJobs />} />
        <Route path="profile" element={<EmployerProfile />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Error Routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;