import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import '../../assets/scss/main.scss';

const API_URL = 'http://localhost:5000';

const VerifyEmailPage = () => {
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('applicant'); // Default to candidate
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        // Get token and email from URL parameters
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        const email = queryParams.get('email');

        if (!token || !email) {
          setError('Liên kết xác thực không hợp lệ hoặc thiếu thông tin.');
          setVerifying(false);
          return;
        }

        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
          setError('Email không hợp lệ. Vui lòng kiểm tra lại liên kết xác thực.');
          setVerifying(false);
          return;
        }

        // Call API to verify email
        const response = await axios.post(`${API_URL}/users/verify-email`, {
          token,
          email
        });

        if (response.data.success) {
          setSuccess(true);
          
          // Try to get user role information
          try {
            const userResponse = await axios.get(`${API_URL}/users/by-email/${email}`);
            if (userResponse.data && userResponse.data.role) {
              setUserRole(userResponse.data.role);
            }
          } catch (userError) {
            console.error('Error fetching user role:', userError);
          }
          
          // Auto-redirect after successful verification
          setTimeout(() => {
            const loginPath = userRole === 'employer' ? '/employer/login' : '/candidate/login';
            navigate(loginPath);
          }, 5000);
        } else {
          setError('Xác thực email không thành công. Liên kết có thể đã hết hạn.');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Đã xảy ra lỗi khi xác thực email của bạn.');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmailToken();
  }, [location, navigate, userRole]);

  const getLoginLink = () => {
    return userRole === 'employer' ? '/employer/login' : '/candidate/login';
  };

  return (
    <div className="verify-email-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body p-4 text-center">
                {verifying ? (
                  <div className="my-5 text-center">
                    <ClipLoader color="#007bff" size={50} />
                    <h3 className="mt-3">Đang xác thực email của bạn...</h3>
                  </div>
                ) : success ? (
                  <div className="success-container">
                    <div className="text-success mb-4">
                      <i className="bi bi-check-circle" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h2 className="mb-3">Email đã được xác thực!</h2>
                    <p className="mb-4">
                      Xác thực email của bạn đã thành công. Tài khoản của bạn đã được kích hoạt và
                      bạn có thể đăng nhập ngay bây giờ.
                    </p>
                    <p className="text-muted mb-4">
                      Bạn sẽ được chuyển hướng đến trang đăng nhập trong 5 giây...
                    </p>
                    <Link to={getLoginLink()} className="btn btn-primary">
                      Đăng nhập ngay
                    </Link>
                  </div>
                ) : (
                  <div className="error-container">
                    <div className="text-danger mb-4">
                      <i className="bi bi-x-circle" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h2 className="mb-3">Xác thực không thành công</h2>
                    <p className="mb-4">
                      {error || 'Đã xảy ra lỗi khi xác thực email của bạn.'}
                    </p>
                    <div className="d-grid gap-2">
                      <Link to="/auth/register" className="btn btn-outline-primary">
                        Quay lại trang đăng ký
                      </Link>
                      <Link to="/" className="btn btn-link">
                        Về trang chủ
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage; 