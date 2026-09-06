import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const MeetingRoomRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Extract meetingId from query parameters
    const meetingId = searchParams.get('meetingId');
    
    if (meetingId) {
      // Preserve all other query parameters and redirect to correct route
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('meetingId'); // Remove meetingId from params since it will be in the route
      
      const queryString = newParams.toString();
      const redirectUrl = queryString 
        ? `/meeting/${meetingId}?${queryString}`
        : `/meeting/${meetingId}`;
        
      console.log('MeetingRoomRedirect: Redirecting from /meeting-room to', redirectUrl);
      navigate(redirectUrl, { replace: true });
    } else {
      // No meetingId, redirect to meetings page based on user role
      console.log('MeetingRoomRedirect: No meetingId found, redirecting to role-based meetings page');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (currentUser.role === 'employer') {
        navigate('/employer/meetings', { replace: true });
      } else if (currentUser.role === 'candidate' || currentUser.role === 'applicant') {
        navigate('/candidate/meetings', { replace: true });
      } else {
        navigate('/auth/login', { replace: true });
      }
    }
  }, [navigate, searchParams]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang chuyển hướng...</span>
        </div>
        <p className="mt-3">Đang chuyển hướng đến cuộc họp...</p>
      </div>
    </div>
  );
};

export default MeetingRoomRedirect; 