import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ClipLoader } from 'react-spinners';
import { login, reset, loginWithFacebook, loginWithGoogle } from '../../redux/slices/authSlice';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
// import jwt_decode from 'jwt-decode';
import { jwtDecode } from 'jwt-decode';
import '../../assets/scss/main.scss';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, isAuthenticated, loading, error, success } = useSelector(
    (state) => state.auth
  );

  // Determine login type based on URL path
  const isAdminLogin = location.pathname === '/auth/admin-login' || location.pathname === '/admin/login';
  const isEmployerLogin = location.pathname.includes('/employer/login');
  const isCandidateLogin = location.pathname.includes('/candidate/login') || location.pathname === '/auth/login' || location.pathname === '/login';

  // Kiểm tra vai trò dự định từ localStorage
  useEffect(() => {
    const intendedRole = localStorage.getItem('intended_role');
    
    // Nếu vai trò từ Header không khớp với URL hiện tại, điều hướng đến đúng trang
    if (intendedRole && !isAdminLogin) {
      if (intendedRole === 'employer' && !isEmployerLogin) {
        navigate('/employer/login');
      } else if (intendedRole === 'candidate' && !isCandidateLogin) {
        navigate('/candidate/login');
      }
    }
  }, [location.pathname, navigate, isAdminLogin, isEmployerLogin, isCandidateLogin]);

  // Clear Google's stored login state when component mounts
  useEffect(() => {
    // Clear any Google one-tap cached user data
    document.cookie = "g_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Try to reset Google's stored accounts to prevent auto-selection
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.cancel();
      } catch (e) {
        console.log('Google account reset not applicable');
      }
    }
    
    // Cleanup when component unmounts
    return () => {
      // Clear Google session again when unmounting
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.cancel();
          console.log('Google session cleaned up on unmount');
        } catch (e) {
          // Ignore errors
        }
      }
    };
  }, [location.pathname]);

  // Create separate form state for each login type to ensure no cross-contamination
  const [candidateFormValues] = useState({ 
    email: '', 
    password: '', 
    rememberMe: false,
    formType: 'candidate' // Helps with form identification
  });
  
  const [employerFormValues] = useState({ 
    email: '', 
    password: '', 
    rememberMe: false,
    formType: 'employer' // Helps with form identification
  });
  
  const [adminFormValues] = useState({ 
    email: '', 
    password: '', 
    rememberMe: false,
    formType: 'admin' // Helps with form identification
  });

  // Get initial values based on login type
  const getInitialValues = () => {
    if (isAdminLogin) return adminFormValues;
    if (isEmployerLogin) return employerFormValues;
    return candidateFormValues;
  };

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      if (user.role === 'employer') {
        navigate('/employer/dashboard');
      } else if (user.role === 'applicant') {
        navigate('/candidate/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }

    // Reset auth state on component unmount
    return () => {
      dispatch(reset());
    };
  }, [isAuthenticated, user, navigate, dispatch]);

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Email không hợp lệ')
      .required('Email là bắt buộc'),
    password: Yup.string().required('Mật khẩu là bắt buộc'),
  });

  // Get page title based on login type
  const getPageTitle = () => {
    if (isAdminLogin) return 'Đăng nhập Quản trị viên';
    if (isEmployerLogin) return 'Đăng nhập dành cho Nhà tuyển dụng';
    return 'Đăng nhập dành cho Ứng viên';
  };

  // Get register link based on login type
  const getRegisterLink = () => {
    if (isEmployerLogin) return '/employer/register';
    return '/candidate/register';
  };

  // Get form input ID prefix to ensure unique IDs
  const getFormIdPrefix = () => {
    if (isAdminLogin) return 'admin';
    if (isEmployerLogin) return 'employer';
    return 'candidate';
  };

  // Handle form submission
  const handleSubmit = (values, { setSubmitting }) => {
    const userData = {
      email: values.email,
      password: values.password,
      isAdmin: isAdminLogin,
      role: isEmployerLogin ? 'employer' : isCandidateLogin ? 'applicant' : null
    };

    dispatch(login(userData));
    setSubmitting(false);
  };

  // Handle Facebook login
  const responseFacebook = (response) => {
    if (response.accessToken) {
      console.log('Facebook login successful:', response);
      
      // Facebook luôn sử dụng vai trò 'applicant'
      // Nhưng kiểm tra xem người dùng có đang cố đăng nhập bằng vai trò employer không
      const intendedRole = localStorage.getItem('intended_role');
      if (intendedRole === 'employer') {
        console.warn('Facebook không hỗ trợ đăng nhập cho nhà tuyển dụng. Đang sử dụng vai trò ứng viên.');
        alert('Facebook chỉ được sử dụng để đăng nhập tài khoản ứng viên. Vui lòng sử dụng Google hoặc đăng nhập bằng email/mật khẩu cho tài khoản nhà tuyển dụng.');
        return;
      }
      
      const role = 'applicant';
      
      const facebookData = {
        ...response,
        isAdmin: isAdminLogin,
        role: role // Always applicant for Facebook login
      };
      
      dispatch(loginWithFacebook(facebookData));
    } else {
      console.error('Facebook login failed');
    }
  };

  const handleGoogleLogin = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log('Google login successful:', decoded);
    
    // Kiểm tra vai trò từ URL và localStorage để đảm bảo tính nhất quán
    const intendedRole = localStorage.getItem('intended_role');
    let role;
    
    // Ưu tiên sử dụng vai trò từ URL, nhưng kiểm tra xem có khớp với intended_role không
    if (isEmployerLogin) {
      role = 'employer';
      if (intendedRole && intendedRole !== 'employer') {
        console.warn('Phát hiện sự không khớp giữa vai trò dự định và URL. Sử dụng vai trò từ URL.');
      }
    } else if (isCandidateLogin) {
      role = 'applicant';
      if (intendedRole && intendedRole !== 'candidate') {
        console.warn('Phát hiện sự không khớp giữa vai trò dự định và URL. Sử dụng vai trò từ URL.');
      }
    } else {
      // Sử dụng vai trò dự định nếu không xác định rõ từ URL
      role = intendedRole === 'employer' ? 'employer' : 'applicant';
    }
    
    const googleData = {
      ...decoded,
      isAdmin: isAdminLogin,
      role: role // Vai trò dựa trên URL và localStorage
    };
    
    dispatch(loginWithGoogle(googleData));
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
  };

  const idPrefix = getFormIdPrefix();

  return (
    <div className="login-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="text-center mb-4">
                  {getPageTitle()}
                </h2>

                {/* Hiển thị thông báo vai trò đăng nhập hiện tại */}
                <div className="text-center mb-3">
                  <span className="badge bg-primary p-2">
                    <i className={isEmployerLogin ? "bi bi-building me-1" : "bi bi-person me-1"}></i>
                    {isEmployerLogin ? 'Đăng nhập dành cho Nhà tuyển dụng' : isCandidateLogin ? 'Đăng nhập dành cho Ứng viên' : 'Đăng nhập Quản trị viên'}
                  </span>
                  {isEmployerLogin && (
                    <div className="mt-1 small text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Nếu bạn là ứng viên tìm việc, vui lòng <a href="/candidate/login" className="text-primary">đăng nhập tại đây</a>
                    </div>
                  )}
                  {isCandidateLogin && (
                    <div className="mt-1 small text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Nếu bạn là nhà tuyển dụng, vui lòng <a href="/employer/login" className="text-primary">đăng nhập tại đây</a>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success" role="alert">
                    Đăng nhập thành công! Đang chuyển hướng...
                  </div>
                )}

                <Formik
                  initialValues={getInitialValues()}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize={true} // This ensures form re-initializes when the login type changes
                >
                  {({ isSubmitting }) => (
                    <Form id={`${idPrefix}-login-form`}>
                      <div className="mb-3">
                        <label htmlFor={`${idPrefix}-email`} className="form-label">
                          Email
                        </label>
                        <Field
                          type="email"
                          id={`${idPrefix}-email`}
                          name="email"
                          className="form-control"
                          placeholder="Nhập email của bạn"
                          autoComplete={`${idPrefix}-email`}
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="text-danger"
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor={`${idPrefix}-password`} className="form-label">
                          Mật khẩu
                        </label>
                        <Field
                          type="password"
                          id={`${idPrefix}-password`}
                          name="password"
                          className="form-control"
                          placeholder="Nhập mật khẩu"
                          autoComplete={`${idPrefix}-password`}
                        />
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="text-danger"
                        />
                      </div>

                      <div className="mb-3 form-check">
                        <Field
                          type="checkbox"
                          id={`${idPrefix}-rememberMe`}
                          name="rememberMe"
                          className="form-check-input"
                        />
                        <label htmlFor={`${idPrefix}-rememberMe`} className="form-check-label">
                          Ghi nhớ đăng nhập
                        </label>
                      </div>

                      <div className="d-grid gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSubmitting || loading}
                        >
                          {loading ? (
                            <ClipLoader color="#ffffff" size={20} />
                          ) : (
                            'Đăng nhập'
                          )}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>

                {!isAdminLogin && (
                  <div className="mt-3">
                    <div className="d-flex align-items-center justify-content-center my-3">
                      <hr className="flex-grow-1" />
                      <span className="mx-2">Hoặc</span>
                      <hr className="flex-grow-1" />
                    </div>
                    
                    <div className="d-grid gap-2 mb-3">
                      {/* Google login available for both employer and candidate */}
                      <GoogleOAuthProvider 
                        clientId="633476591135-4b3l5g4uelc0q2adcphtokvd3vv0m7hf.apps.googleusercontent.com"
                        skipTokenCache={true}
                      >
                        <div className="d-grid gap-2">
                          <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={handleGoogleError}
                            size="large"
                            width="100%"
                            text="continue_with"
                            shape="rectangular"
                            locale="vi"
                            useOneTap={false}
                            cookiePolicy={'single_host_origin'}
                            isSignedIn={false}
                            itp_support={true}
                            auto_select={false}
                            prompt_parent_id={isEmployerLogin ? 'employer-login-form' : 'candidate-login-form'}
                            cancel_on_tap_outside={true}
                            ux_mode="popup"
                            context="use"
                            render={({ onClick, disabled }) => (
                              <button
                                type="button"
                                className="btn social-btn"
                                onClick={onClick}
                                disabled={disabled || loading}
                                style={{ 
                                  gap: '10px', 
                                  backgroundColor: '#ffffff', 
                                  color: '#444444',
                                  border: '1px solid #dddddd',
                                  padding: '10px 16px',
                                  fontSize: '16px',
                                  fontWeight: '500',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
                                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                </svg>
                                <span style={{ marginLeft: '10px' }}>Đăng nhập với Google</span>
                              </button>
                            )}
                          />
                        </div>
                      </GoogleOAuthProvider>
                      
                      {/* Facebook login available for candidates only */}
                      {isCandidateLogin && (
                        <FacebookLogin
                          appId="1618754122147057"
                          autoLoad={false}
                          fields="name,email,picture.width(1000).height(1000)"
                          callback={responseFacebook}
                          render={renderProps => (
                            <button
                              type="button"
                              className="btn btn-outline-primary social-btn"
                              onClick={renderProps.onClick}
                              disabled={loading}
                              style={{ 
                                gap: '10px', 
                                backgroundColor: '#1877f2', 
                                color: 'white',
                                border: 'none',
                                padding: '10px 16px',
                                fontSize: '16px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <i className="bi bi-facebook me-2"></i>
                              Đăng nhập với Facebook
                            </button>
                          )}
                        />
                      )}
                    </div>

                    <div className="text-center">
                      <p>
                        Chưa có tài khoản?{' '}
                        <Link to={getRegisterLink()} className="text-primary">
                          Đăng ký ngay
                        </Link>
                      </p>
                      <p>
                        <Link to="/auth/forgot-password" className="text-primary">
                          Quên mật khẩu?
                        </Link>
                      </p>
                    </div>
                  </div>
                )}

                {isAdminLogin && (
                  <div className="mt-3 text-center">
                    <p>
                      <Link to="/candidate/login" className="text-primary">
                        Đăng nhập thông thường
                      </Link>
                    </p>
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

export default LoginPage;

