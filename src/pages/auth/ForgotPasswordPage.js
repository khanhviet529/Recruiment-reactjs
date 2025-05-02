import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const ForgotPasswordPage = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { loading, error } = useSelector((state) => state.auth);

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Email không hợp lệ')
      .required('Email là bắt buộc'),
  });

  // Handle form submission
  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    // Here you would dispatch a forgotPassword action
    // For demo purposes, we'll just simulate success
    setTimeout(() => {
      setSubmitSuccess(true);
      resetForm();
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="forgot-password-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <Card className="shadow-sm">
              <div className="text-center mb-4">
                <h2 className="fs-4">Quên mật khẩu</h2>
                <p className="text-muted">
                  Nhập email của bạn để nhận liên kết đặt lại mật khẩu
                </p>
              </div>
              
              {error && (
                <Alert variant="danger" className="mb-4" isDismissible>
                  {error}
                </Alert>
              )}
              
              {submitSuccess && (
                <Alert variant="success" className="mb-4" isDismissible>
                  Chúng tôi đã gửi email với hướng dẫn đặt lại mật khẩu cho bạn. Vui lòng kiểm tra hộp thư của bạn.
                </Alert>
              )}

              <Formik
                initialValues={{ email: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
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

                    <div className="d-grid gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSubmitting || loading}
                        fullWidth
                      >
                        Gửi liên kết đặt lại
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>

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

export default ForgotPasswordPage;
