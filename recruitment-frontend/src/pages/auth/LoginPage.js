"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { ClipLoader } from "react-spinners"
import { login, reset, loginWithFacebook, loginWithGoogle } from "../../redux/slices/authSlice"
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
import "../../assets/scss/main.scss"
import axios from "axios"
import "../../styles/login-page.css"
import { clearGoogleSession, resetGoogleAuthState } from "../../utils/googleAuthUtils"
const API_URL = "http://localhost:5000"

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { user, isAuthenticated, loading, error, success } = useSelector((state) => state.auth)

  // Determine login type based on URL path
  const isAdminLogin = location.pathname === "/auth/admin-login" || location.pathname === "/admin/login"
  const isEmployerLogin = location.pathname.includes("/employer/login")
  const isCandidateLogin =
    location.pathname.includes("/candidate/login") ||
    location.pathname === "/auth/login" ||
    location.pathname === "/login"

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false)
  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  // Kiểm tra vai trò dự định từ localStorage
  useEffect(() => {
    const intendedRole = localStorage.getItem("intended_role")

    // Nếu vai trò từ Header không khớp với URL hiện tại, điều hướng đến đúng trang
    if (intendedRole && !isAdminLogin) {
      if (intendedRole === "employer" && !isEmployerLogin) {
        navigate("/employer/login")
      } else if (intendedRole === "candidate" && !isCandidateLogin) {
        navigate("/candidate/login")
      }
    }
  }, [location.pathname, navigate, isAdminLogin, isEmployerLogin, isCandidateLogin])

  // Clear Google's stored login state when component mounts
  useEffect(() => {
    console.log('LoginPage mounted - clearing Google session for fresh login');
    
    // Use utility function to properly clear Google session
    clearGoogleSession();
    
    // Cleanup when component unmounts
    return () => {
      console.log('LoginPage unmounting - final session cleanup');
      clearGoogleSession();
    }
  }, [location.pathname])

  // Create separate form state for each login type to ensure no cross-contamination
  const [candidateFormValues] = useState({
    email: "",
    password: "",
    rememberMe: false,
    formType: "candidate", // Helps with form identification
  })

  const [employerFormValues] = useState({
    email: "",
    password: "",
    rememberMe: false,
    formType: "employer", // Helps with form identification
  })

  const [adminFormValues] = useState({
    email: "",
    password: "",
    rememberMe: false,
    formType: "admin", // Helps with form identification
  })

  // Get initial values based on login type
  const getInitialValues = () => {
    if (isAdminLogin) return adminFormValues
    if (isEmployerLogin) return employerFormValues
    return candidateFormValues
  }

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      if (user.role === "employer") {
        navigate("/employer/dashboard")
      } else if (user.role === "applicant") {
        navigate("/candidate/dashboard")
      } else if (user.role === "admin") {
        navigate("/admin/dashboard")
      } else {
        navigate("/")
      }
    }

    // Reset auth state on component unmount
    return () => {
      dispatch(reset())
    }
  }, [isAuthenticated, user, navigate, dispatch])

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
    password: Yup.string().required("Mật khẩu là bắt buộc"),
  })

  // Get form input ID prefix to ensure unique IDs
  const getFormIdPrefix = () => {
    if (isAdminLogin) return "admin"
    if (isEmployerLogin) return "employer"
    return "candidate"
  }

  // Add this state variable for verification
  const [verificationAlert, setVerificationAlert] = useState("")
  const [unverifiedEmail, setUnverifiedEmail] = useState("")

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Check if the email is verified first (optional but recommended)
      const emailCheckResponse = await axios.get(`${API_URL}/users/by-email/${values.email}`)

      if (emailCheckResponse.data && emailCheckResponse.data.success === false) {
        // User doesn't exist, just proceed with normal login flow
        proceedWithLogin()
      } else if (emailCheckResponse.data && emailCheckResponse.data.isVerified === false) {
        // User exists but isn't verified
        setVerificationAlert("Email của bạn chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản.")
        setUnverifiedEmail(values.email)
        setSubmitting(false)
        return
      } else {
        // User exists and is verified, or we couldn't check
        proceedWithLogin()
      }
    } catch (error) {
      // If API call fails, just proceed with regular login flow
      proceedWithLogin()
    }

    function proceedWithLogin() {
      const userData = {
        email: values.email,
        password: values.password,
        isAdmin: isAdminLogin,
        role: isEmployerLogin ? "employer" : isCandidateLogin ? "applicant" : null,
      }

      dispatch(login(userData))
      setSubmitting(false)
    }
  }

  // Add a function to resend verification email
  const handleResendVerification = async () => {
    if (!unverifiedEmail) return

    try {
      const response = await axios.post(`${API_URL}/users/resend-verification-email`, {
        email: unverifiedEmail,
      })

      if (response.data.success) {
        setVerificationAlert("Email xác thực mới đã được gửi. Vui lòng kiểm tra hộp thư của bạn.")
      } else {
        setVerificationAlert("Không thể gửi lại email xác thực. Vui lòng thử lại sau.")
      }
    } catch (error) {
      console.error("Error resending verification email:", error)
      setVerificationAlert("Đã xảy ra lỗi. Vui lòng thử lại sau.")
    }
  }

  // Handle Facebook login
  const responseFacebook = (response) => {
    if (response.accessToken) {
      console.log("Facebook login successful:", response)

      // Facebook luôn sử dụng vai trò 'applicant'
      // Nhưng kiểm tra xem người dùng có đang cố đăng nhập bằng vai trò employer không
      const intendedRole = localStorage.getItem("intended_role")
      if (intendedRole === "employer") {
        console.warn("Facebook không hỗ trợ đăng nhập cho nhà tuyển dụng. Đang sử dụng vai trò ứng viên.")
        alert(
          "Facebook chỉ được sử dụng để đăng nhập tài khoản ứng viên. Vui lòng sử dụng Google hoặc đăng nhập bằng email/mật khẩu cho tài khoản nhà tuyển dụng.",
        )
        return
      }

      const role = "applicant"

      const facebookData = {
        ...response,
        isAdmin: isAdminLogin,
        role: role, // Always applicant for Facebook login
      }

      dispatch(loginWithFacebook(facebookData))
    } else {
      console.error("Facebook login failed")
    }
  }

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      console.log('Google login button clicked - resetting auth state');
      
      // Reset Google auth state before processing
      await resetGoogleAuthState();
      
      const decoded = jwtDecode(credentialResponse.credential)
      console.log("Google login successful:", decoded.email)

      // Kiểm tra vai trò từ URL và localStorage để đảm bảo tính nhất quán
      const intendedRole = localStorage.getItem("intended_role")
      let role

      // Ưu tiên sử dụng vai trò từ URL, nhưng kiểm tra xem có khớp với intended_role không
      if (isEmployerLogin) {
        role = "employer"
        if (intendedRole && intendedRole !== "employer") {
          console.warn("Phát hiện sự không khớp giữa vai trò dự định và URL. Sử dụng vai trò từ URL.")
        }
      } else if (isCandidateLogin) {
        role = "applicant"
        if (intendedRole && intendedRole !== "candidate") {
          console.warn("Phát hiện sự không khớp giữa vai trò dự định và URL. Sử dụng vai trò từ URL.")
        }
      } else {
        // Sử dụng vai trò dự định nếu không xác định rõ từ URL
        role = intendedRole === "employer" ? "employer" : "applicant"
      }

      const googleData = {
        ...decoded,
        isAdmin: isAdminLogin,
        role: role, // Vai trò dựa trên URL và localStorage
      }

      console.log('Dispatching Google login with role:', role);
      dispatch(loginWithGoogle(googleData))
    } catch (error) {
      console.error('Error in handleGoogleLogin:', error);
      clearGoogleSession(); // Clear session on error
    }
  }

  const handleGoogleError = () => {
    console.error("Google login failed")
    clearGoogleSession(); // Clear session on error
  }

  const idPrefix = getFormIdPrefix()

  // Render Candidate Login Form
  const renderCandidateLoginForm = () => {
    return (
      <div className="login-container">
        {/* Form Side */}
        <div className="form-side">
          <div className="form-header">
            <h1 className="welcome-text">Chào mừng bạn đã quay trở lại</h1>
            <p className="welcome-subtext">
              Cùng xây dựng một hồ sơ nổi bật và nhận được các cơ hội sự nghiệp lý tưởng
            </p>
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

          {verificationAlert && (
            <div className="alert alert-warning" role="alert">
              {verificationAlert}
              {unverifiedEmail && (
                <button className="resend-btn" onClick={handleResendVerification}>
                  Gửi lại email xác thực
                </button>
              )}
            </div>
          )}

          <div className="role-switch">
            Bạn là nhà tuyển dụng? <a href="/employer/login">Đăng nhập dành cho nhà tuyển dụng</a>
          </div>

          <Formik initialValues={candidateFormValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting, errors, touched }) => (
              <Form id="candidate-login-form">
                <div className="form-group">
                  <label htmlFor="candidate-email" className="form-label">
                    Email
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </span>
                    <Field
                      type="email"
                      id="candidate-email"
                      name="email"
                      className={`form-input ${errors.email && touched.email ? "error" : ""}`}
                      placeholder="Nhập email của bạn"
                      autoComplete="candidate-email"
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="candidate-password" className="form-label">
                    Mật khẩu
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </span>
                    <Field
                      type={showPassword ? "text" : "password"}
                      id="candidate-password"
                      name="password"
                      className={`form-input ${errors.password && touched.password ? "error" : ""}`}
                      placeholder="Nhập mật khẩu"
                      autoComplete="candidate-password"
                    />
                    <button type="button" className="password-toggle" onClick={togglePasswordVisibility} tabIndex="-1">
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="error-message" />
                  <Link to="/auth/forgot-password" className="forgot-password">
                    Quên mật khẩu
                  </Link>
                </div>

                <div className="remember-me">
                  <Field type="checkbox" id="candidate-rememberMe" name="rememberMe" className="remember-checkbox" />
                  <label htmlFor="candidate-rememberMe">Ghi nhớ đăng nhập</label>
                </div>

                <button type="submit" className="login-btn" disabled={isSubmitting || loading}>
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <ClipLoader color="#ffffff" size={20} />
                      <span className="ml-2">Đang xử lý...</span>
                    </div>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
              </Form>
            )}
          </Formik>

          <div className="social-divider">
            <span>Hoặc đăng nhập bằng</span>
          </div>

          <div className="social-login">
            {/* Google login */}
            <GoogleOAuthProvider
              clientId="633476591135-4b3l5g4uelc0q2adcphtokvd3vv0m7hf.apps.googleusercontent.com"
              skipTokenCache={true}
            >
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={handleGoogleError}
                useOneTap={false}
                render={({ onClick, disabled }) => (
                  <button
                    type="button"
                    className="social-btn google-btn"
                    onClick={onClick}
                    disabled={disabled || loading}
                  >
                    <span className="social-icon">G</span>
                    Google
                  </button>
                )}
              />
            </GoogleOAuthProvider>

            {/* Facebook login */}
            <FacebookLogin
              appId="1618754122147057"
              autoLoad={false}
              fields="name,email,picture.width(1000).height(1000)"
              callback={responseFacebook}
              render={(renderProps) => (
                <button
                  type="button"
                  className="social-btn facebook-btn"
                  onClick={renderProps.onClick}
                  disabled={loading}
                >
                  <span className="social-icon">f</span>
                  Facebook
                </button>
              )}
            />

            {/* LinkedIn button */}
            <button type="button" className="social-btn linkedin-btn" disabled={loading}>
              <span className="social-icon">in</span>
              LinkedIn
            </button>
          </div>

          <div className="register-link">
            Bạn chưa có tài khoản? <Link to="/candidate/register">Đăng ký ngay</Link>
          </div>

          <div className="support-text">
            Bạn gặp khó khăn khi tạo tài khoản?
            <br />
            Vui lòng gọi tới số <a href="tel:(024) 6680 5588">(024) 6680 5588</a> (giờ hành chính).
          </div>

        </div>

        {/* Brand Side */}
        <div
          className="brand-side candidate"
          style={{ '--panel-img': "url('/image/panel-candidate.jpg')" }}
        >
          <div className="brand-logo">
            Pro<span>Hire</span>
          </div>
          <h2 className="brand-tagline">
            Tiếp lợi thế
            <br />
            Nổi thành công
          </h2>
          <p className="brand-description">ProHire - Hệ sinh thái nhân sự tiên phong ứng dụng công nghệ tại Việt Nam</p>
        </div>
      </div>
    )
  }

  // Render Employer Login Form
  const renderEmployerLoginForm = () => {
    return (
      <div className="login-container">
        {/* Form Side */}
        <div className="form-side">
          <div className="form-header">
            <h1 className="welcome-text employer">Chào mừng nhà tuyển dụng quay trở lại</h1>
            <p className="welcome-subtext">
              Cùng xây dựng đội ngũ và tìm kiếm ứng viên phù hợp cho doanh nghiệp của bạn
            </p>
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

          {verificationAlert && (
            <div className="alert alert-warning" role="alert">
              {verificationAlert}
              {unverifiedEmail && (
                <button className="resend-btn" onClick={handleResendVerification}>
                  Gửi lại email xác thực
                </button>
              )}
            </div>
          )}

          <div className="role-switch employer">
            Bạn là ứng viên tìm việc? <a href="/candidate/login">Đăng nhập dành cho ứng viên</a>
          </div>

          <Formik initialValues={employerFormValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting, errors, touched }) => (
              <Form id="employer-login-form">
                <div className="form-group">
                  <label htmlFor="employer-email" className="form-label">
                    Email
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon employer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </span>
                    <Field
                      type="email"
                      id="employer-email"
                      name="email"
                      className={`form-input employer ${errors.email && touched.email ? "error" : ""}`}
                      placeholder="Nhập email của bạn"
                      autoComplete="employer-email"
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="employer-password" className="form-label">
                    Mật khẩu
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon employer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </span>
                    <Field
                      type={showPassword ? "text" : "password"}
                      id="employer-password"
                      name="password"
                      className={`form-input employer ${errors.password && touched.password ? "error" : ""}`}
                      placeholder="Nhập mật khẩu"
                      autoComplete="employer-password"
                    />
                    <button type="button" className="password-toggle" onClick={togglePasswordVisibility} tabIndex="-1">
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="error-message" />
                  <Link to="/auth/forgot-password" className="forgot-password employer">
                    Quên mật khẩu
                  </Link>
                </div>

                <div className="remember-me">
                  <Field type="checkbox" id="employer-rememberMe" name="rememberMe" className="remember-checkbox" />
                  <label htmlFor="employer-rememberMe">Ghi nhớ đăng nhập</label>
                </div>

                <button type="submit" className="login-btn employer" disabled={isSubmitting || loading}>
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <ClipLoader color="#ffffff" size={20} />
                      <span className="ml-2">Đang xử lý...</span>
                    </div>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
              </Form>
            )}
          </Formik>

          <div className="social-divider">
            <span>Hoặc đăng nhập bằng</span>
          </div>

          <div className="social-login">
            {/* Google login */}
            <GoogleOAuthProvider
              clientId="633476591135-4b3l5g4uelc0q2adcphtokvd3vv0m7hf.apps.googleusercontent.com"
              skipTokenCache={true}
            >
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={handleGoogleError}
                useOneTap={false}
                render={({ onClick, disabled }) => (
                  <button
                    type="button"
                    className="social-btn google-btn"
                    onClick={onClick}
                    disabled={disabled || loading}
                  >
                    <span className="social-icon">G</span>
                    Google
                  </button>
                )}
              />
            </GoogleOAuthProvider>

            {/* LinkedIn button */}
            <button type="button" className="social-btn linkedin-btn" disabled={loading}>
              <span className="social-icon">in</span>
              LinkedIn
            </button>
          </div>

          <div className="register-link">
            Bạn chưa có tài khoản?{" "}
            <Link to="/employer/register" className="employer">
              Đăng ký ngay
            </Link>
          </div>

          <div className="support-text">
            Bạn gặp khó khăn khi tạo tài khoản?
            <br />
            Vui lòng gọi tới số{" "}
            <a href="tel:(024) 6680 5588" className="employer">
              (024) 6680 5588
            </a>{" "}
            (giờ hành chính).
          </div>

        </div>

        {/* Brand Side */}
        <div
          className="brand-side employer"
          style={{ '--panel-img': "url('/image/panel-employer.jpg')" }}
        >
          <div className="brand-content">
            <div className="brand-logo employer">
              Pro<span>Hire</span>
            </div>
            <p>Tiếp lợi thế, nổi thành công</p>
          </div>
        </div>
      </div>
    )
  }

  // Render Admin Login Form
  const renderAdminLoginForm = () => {
    return (
      <div className="login-container">
        {/* Form Side */}
        <div className="form-side">
          <div className="form-header">
            <h1 className="welcome-text">Đăng nhập Quản trị viên</h1>
            <p className="welcome-subtext">Đăng nhập để quản lý hệ thống và người dùng</p>
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

          <Formik initialValues={adminFormValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting, errors, touched }) => (
              <Form id="admin-login-form">
                <div className="form-group">
                  <label htmlFor="admin-email" className="form-label">
                    Email
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </span>
                    <Field
                      type="email"
                      id="admin-email"
                      name="email"
                      className={`form-input ${errors.email && touched.email ? "error" : ""}`}
                      placeholder="Nhập email của bạn"
                      autoComplete="admin-email"
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="admin-password" className="form-label">
                    Mật khẩu
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </span>
                    <Field
                      type={showPassword ? "text" : "password"}
                      id="admin-password"
                      name="password"
                      className={`form-input ${errors.password && touched.password ? "error" : ""}`}
                      placeholder="Nhập mật khẩu"
                      autoComplete="admin-password"
                    />
                    <button type="button" className="password-toggle" onClick={togglePasswordVisibility} tabIndex="-1">
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="error-message" />
                </div>

                <div className="remember-me">
                  <Field type="checkbox" id="admin-rememberMe" name="rememberMe" className="remember-checkbox" />
                  <label htmlFor="admin-rememberMe">Ghi nhớ đăng nhập</label>
                </div>

                <button type="submit" className="login-btn" disabled={isSubmitting || loading}>
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <ClipLoader color="#ffffff" size={20} />
                      <span className="ml-2">Đang xử lý...</span>
                    </div>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
              </Form>
            )}
          </Formik>

        </div>

        {/* Brand Side */}
        <div className="brand-side">
          <div className="brand-logo">
            Pro<span>Hire</span>
          </div>
          <h2 className="brand-tagline">
            Quản trị
            <br />
            Hệ thống
          </h2>
          <p className="brand-description">ProHire - Hệ sinh thái nhân sự tiên phong ứng dụng công nghệ tại Việt Nam</p>
        </div>
      </div>
    )
  }

  // Render the appropriate form based on URL path
  if (isAdminLogin) {
    return <div className="login-page">{renderAdminLoginForm()}</div>
  } else if (isEmployerLogin) {
    return <div className="login-page">{renderEmployerLoginForm()}</div>
  } else {
    return <div className="login-page">{renderCandidateLoginForm()}</div>
  }
}

export default LoginPage
