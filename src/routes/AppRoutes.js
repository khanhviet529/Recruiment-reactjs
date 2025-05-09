import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import EmployerLayout from '../layouts/EmployerLayout';
import CandidateLayout from '../layouts/CandidateLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import NotFoundPage from '../pages/NotFoundPage';
import ErrorPage from '../pages/ErrorPage';
import JobDetail from '../pages/JobDetail';
import SearchPage from '../pages/SearchPage';
import JobsPage from '../pages/JobsPage';
import CompaniesPage from '../pages/CompaniesPage';
import CompanyDetail from '../pages/CompanyDetail';
import NotificationsPage from '../pages/NotificationsPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import AdminLoginPage from '../pages/auth/AdminLoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Employer Pages
import EmployerDashboardPage from '../pages/employer/DashboardPage';
import EmployerProfilePage from '../pages/employer/ProfilePage';
import EmployerJobsPage from '../pages/employer/JobsPage';
import EmployerNewJobPage from '../pages/employer/NewJobPage';
import EmployerEditJobPage from '../pages/employer/EditJobPage';
import EmployerJobDetailPage from '../pages/employer/JobDetailPage';
import EmployerApplicationsPage from '../pages/employer/ApplicationsPage';
import EmployerApplicationDetailPage from '../pages/employer/ApplicationDetailPage';
import EmployerRecruitmentProcessPage from '../pages/employer/RecruitmentProcessPage';

// Candidate Pages
import CandidateDashboardPage from '../pages/candidate/DashboardPage';
import CandidateProfilePage from '../pages/candidate/ProfilePage';
import CandidateJobSearchPage from '../pages/candidate/JobSearchPage';
import CandidateJobDetailPage from '../pages/candidate/JobDetailPage';
import CandidateApplicationFormPage from '../pages/candidate/ApplicationFormPage';
import CandidateApplicationsPage from '../pages/candidate/ApplicationsPage';
import CandidateApplicationDetailPage from '../pages/candidate/ApplicationDetailPage';
import CVTemplatesPage from '../pages/candidate/CVTemplatesPage';
import SavedJobsPage from '../pages/candidate/SavedJobsPage';
import JobSearchPage from '../pages/candidate/JobSearchPage';
// Admin Pages
import AdminDashboardPage from '../pages/admin/DashboardPage';
import AdminUsersPage from '../pages/admin/UsersPage';
import AdminJobsPage from '../pages/admin/JobsPage';
import AdminMessagesPage from '../pages/admin/MessagesPage';
import AdminReportsPage from '../pages/admin/ReportsPage';
import AdminSettingsPage from '../pages/admin/SettingsPage';

// Custom Routes
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import EmployerRoute from './EmployerRoute';
import CandidateRoute from './CandidateRoute';
import AdminRoute from './AdminRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="error" element={<ErrorPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/jobs/search" element={<SearchPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route
          path="login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="admin-login"
          element={
            <PublicRoute>
              <AdminLoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* Role-specific Auth Routes */}
      <Route element={<AuthLayout />}>
        {/* Candidate Auth */}
        <Route path="candidate/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="candidate/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        
        {/* Employer Auth */}
        <Route path="employer/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="employer/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        
        {/* General Use Auth Routes */}
        <Route path="login" element={<Navigate to="/candidate/login" replace />} />
        <Route path="register" element={<Navigate to="/candidate/register" replace />} />
        
        {/* Admin Auth */}
        <Route path="admin/login" element={<PublicRoute><AdminLoginPage /></PublicRoute>} />
      </Route>

      {/* Employer Routes */}
      <Route
        path="/employer"
        element={
          <EmployerRoute>
            <EmployerLayout />
          </EmployerRoute>
        }
      >
        <Route index element={<Navigate to="/employer/dashboard" replace />} />
        <Route path="dashboard" element={<EmployerDashboardPage />} />
        <Route path="profile" element={<EmployerProfilePage />} />
        <Route path="jobs" element={<EmployerJobsPage />} />
        <Route path="jobs/new" element={<EmployerNewJobPage />} />
        <Route path="jobs/edit/:id" element={<EmployerEditJobPage />} />
        <Route path="jobs/:id" element={<EmployerJobDetailPage />} />
        <Route path="applications" element={<EmployerApplicationsPage />} />
        <Route path="applications/:id" element={<EmployerApplicationDetailPage />} />
        <Route path="recruitment-process" element={<EmployerRecruitmentProcessPage />} />
      </Route>

      {/* Candidate Routes */}
      <Route
        path="/candidate"
        element={
          <CandidateRoute>
            <CandidateLayout />
          </CandidateRoute>
        }
      >
        <Route index element={<Navigate to="/candidate/dashboard" replace />} />
        <Route path="dashboard" element={<CandidateDashboardPage />} />
        <Route path="profile" element={<CandidateProfilePage />} />
        <Route path="jobs" element={<JobSearchPage />} />
        <Route path="jobs/:id" element={<CandidateJobDetailPage />} />
        <Route path="apply/:jobId" element={<CandidateApplicationFormPage />} />
        <Route path="applications" element={<CandidateApplicationsPage />} />
        <Route path="applications/:id" element={<CandidateApplicationDetailPage />} />
        <Route path="cv-templates" element={<CVTemplatesPage />} />
        {/* <Route path="jobs" element={<SavedJobsPage />} /> */}
        <Route path="saved-jobs" element={<SavedJobsPage />} />
        <Route path="job-search" element={<JobSearchPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="jobs" element={<AdminJobsPage />} />
        <Route path="messages" element={<AdminMessagesPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Protected Notification Route (accessible for all logged-in users) */}
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<NotificationsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
