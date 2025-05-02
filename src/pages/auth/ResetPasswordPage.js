import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const ResetPasswordPage = () => {
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useParams();
  const location = useLocation();
  
  // Extract token from URL if not in path params
  const queryParams = new URLSearchParams(location.search);
  const tokenFromQuery = queryParams.get('token');
  const resetToken = token || tokenFromQuery;
  
  const { loading, error } = useSelector((state) => state.auth);

  // Validation schema
  const validationSchema = Yup.object({
    password: Yup.string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .required('Mật khẩu là bắt buộc'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp')
      .required('Xác nhận mật khẩu là bắt buộc'),
  });

  // Check if token exists
  useEffect(() => {
    if (!resetToken) {
      navigate('/auth/forgot-password');
    }
  }, [resetToken, navigate]);

  // Handle form submission
  const handleSubmit = (values, { setSubmitting }) => {
    // Here you would dispatch a resetPassword action with token and new password
    // For demo purposes, we'll just simulate success
    setTimeout(() => {
      setResetSuccess(true);
      setSubmitting(false);
      
      // Redirect to login page after a delay
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    }, 1000);
  };

  if (!resetToken) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="reset-password-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <Card className="shadow-sm">
              <div className="text-center mb-4">
                <h2 className="fs-4">Đặt lại mật khẩu</h2>
                <p className="text-muted">
                  Nhập mật khẩu mới của bạn bên dưới
                </p>
              </div>
              
              {error && (
                <Alert variant="danger" className="mb-4" isDismissible>
                  {error}
                </Alert>
              )}
              
              {resetSuccess && (
                <Alert variant="success" className="mb-4" isDismissible>
                  Mật khẩu của bạn đã được đặt lại thành công! Bạn sẽ được chuyển hướng đến trang đăng nhập...
                </Alert>
              )}

              {!resetSuccess && (
                <Formik
                  initialValues={{ password: '', confirmPassword: '' }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">Mật khẩu mới</label>
                        <Field
                          type="password"
                          id="password"
                          name="password"
                          className="form-control"
                          placeholder="Nhập mật khẩu mới"
                        />
                        <ErrorMessage name="password" component="div" className="text-danger" />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
                        <Field
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          className="form-control"
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <ErrorMessage name="confirmPassword" component="div" className="text-danger" />
                      </div>

                      <div className="d-grid gap-2">
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={isSubmitting || loading}
                          fullWidth
                        >
                          Đặt lại mật khẩu
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}

              <div className="mt-4 text-center">
                <p>
                  <Link to="/auth/login" className="text-primary">
                    <i className="fas fa-arrow-left me-1"></i> Quay lại đăng nhập
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
