import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

const MeetingRedirect = () => {
  const currentUser = authService.getCurrentUser();
  
  useEffect(() => {
    console.log('MeetingRedirect: Current user role:', currentUser?.role);
  }, [currentUser]);

  if (!currentUser) {
    // Not authenticated, will be handled by PrivateRoute
    return null;
  }

  // Redirect based on user role
  if (currentUser.role === 'employer') {
    console.log('MeetingRedirect: Redirecting employer to /employer/meetings');
    return <Navigate to="/employer/meetings" replace />;
  } else if (currentUser.role === 'candidate' || currentUser.role === 'applicant') {
    console.log('MeetingRedirect: Redirecting candidate to /candidate/meetings');
    return <Navigate to="/candidate/meetings" replace />;
  } else if (currentUser.role === 'admin') {
    console.log('MeetingRedirect: Redirecting admin to /admin/meetings');
    return <Navigate to="/admin/meetings" replace />;
  }

  // Default fallback
  console.log('MeetingRedirect: Unknown role, redirecting to home');
  return <Navigate to="/" replace />;
};

export default MeetingRedirect; 