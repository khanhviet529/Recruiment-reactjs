import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ClipLoader } from 'react-spinners';
import { login, reset } from '../../redux/slices/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname || getRedirectPath(user.role);
      navigate(from, { replace: true });
    }
    
    return () => {
      dispatch(reset());
    };
  }, [isAuthenticated, user, navigate, location, dispatch]);

  // Get redirect path based on user role
  const getRedirectPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'employer':
        return '/employer/dashboard';
      case 'applicant':
        return '/candidate/dashboard';
      default:
        return '/';
    }
  };

  // Initial form values
  const initialValues = {
    email: '',
    password: '',
  };

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Email không hợp lệ')
      .required('Email là bắt buộc'),
    password: Yup.string().required('Mật khẩu là bắt buộc'),
  });

  // Handle form submission
  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(login(values));
    setSubmitting(false);
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="text-center mb-4">Đăng nhập</h2>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form className="text-start">
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <Field
                          type="email"
                          id="email"
                          name="email"
                          className="form-control"
                          placeholder="Nhập email của bạn"
                        />
                        <ErrorMessage name="email" component="div" className="text-danger" />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">Mật khẩu</label>
                        <Field
                          type="password"
                          id="password"
                          name="password"
                          className="form-control"
                          placeholder="Nhập mật khẩu"
                        />
                        <ErrorMessage name="password" component="div" className="text-danger" />
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-end">
                          <Link to="/auth/forgot-password" className="text-decoration-none">
                            Quên mật khẩu?
                          </Link>
                        </div>
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

                <div className="mt-3 text-center">
                  <p>
                    Chưa có tài khoản?{' '}
                    <Link to="/auth/register" className="text-primary">
                      Đăng ký ngay
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
