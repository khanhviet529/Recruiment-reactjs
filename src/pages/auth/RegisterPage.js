import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../../redux/slices/authSlice';
import { ClipLoader } from 'react-spinners';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../../assets/scss/main.scss';

const RegisterPage = () => {
  const [activeTab, setActiveTab] = useState('candidate');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated, loading, error, success } = useSelector(
    (state) => state.auth
  );

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

  // Validation schema for candidate registration
  const candidateValidationSchema = Yup.object({
    firstName: Yup.string().required('Họ là bắt buộc'),
    lastName: Yup.string().required('Tên là bắt buộc'),
    email: Yup.string()
      .email('Email không hợp lệ')
      .required('Email là bắt buộc'),
    password: Yup.string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .required('Mật khẩu là bắt buộc'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp')
      .required('Xác nhận mật khẩu là bắt buộc'),
    phone: Yup.string().required('Số điện thoại là bắt buộc'),
  });

  // Validation schema for employer registration
  const employerValidationSchema = Yup.object({
    name: Yup.string().required('Tên công ty là bắt buộc'),
    email: Yup.string()
      .email('Email không hợp lệ')
      .required('Email là bắt buộc'),
    password: Yup.string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .required('Mật khẩu là bắt buộc'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp')
      .required('Xác nhận mật khẩu là bắt buộc'),
    phone: Yup.string().required('Số điện thoại là bắt buộc'),
    website: Yup.string().url('URL website không hợp lệ'),
    companySize: Yup.string().required('Quy mô công ty là bắt buộc'),
    industry: Yup.string().required('Ngành nghề là bắt buộc'),
  });

  // Handle form submission
  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const { confirmPassword, ...userData } = values;

    // Add role based on active tab
    userData.role = activeTab === 'candidate' ? 'applicant' : 'employer';

    dispatch(register(userData));
    setSubmitting(false);
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="text-center mb-4">Đăng ký tài khoản</h2>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success" role="alert">
                    Đăng ký thành công! Đang chuyển hướng...
                  </div>
                )}

                {/* Registration Type Tabs */}
                <ul className="nav nav-tabs mb-4">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'candidate' ? 'active' : ''}`}
                      onClick={() => setActiveTab('candidate')}
                    >
                      Ứng viên
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'employer' ? 'active' : ''}`}
                      onClick={() => setActiveTab('employer')}
                    >
                      Nhà tuyển dụng
                    </button>
                  </li>
                </ul>

                {/* Candidate Registration Form */}
                {activeTab === 'candidate' && (
                  <Formik
                    initialValues={{
                      firstName: '',
                      lastName: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                      phone: '',
                    }}
                    validationSchema={candidateValidationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isSubmitting }) => (
                      <Form className="text-start">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="firstName" className="form-label">Họ</label>
                            <Field
                              type="text"
                              id="firstName"
                              name="firstName"
                              className="form-control"
                              placeholder="Nhập họ của bạn"
                            />
                            <ErrorMessage name="firstName" component="div" className="text-danger" />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="lastName" className="form-label">Tên</label>
                            <Field
                              type="text"
                              id="lastName"
                              name="lastName"
                              className="form-control"
                              placeholder="Nhập tên của bạn"
                            />
                            <ErrorMessage name="lastName" component="div" className="text-danger" />
                          </div>
                        </div>

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
                          <label htmlFor="phone" className="form-label">Số điện thoại</label>
                          <Field
                            type="text"
                            id="phone"
                            name="phone"
                            className="form-control"
                            placeholder="Nhập số điện thoại của bạn"
                          />
                          <ErrorMessage name="phone" component="div" className="text-danger" />
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
                          <label htmlFor="confirmPassword" className="form-label">
                            Xác nhận mật khẩu
                          </label>
                          <Field
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className="form-control"
                            placeholder="Nhập lại mật khẩu"
                          />
                          <ErrorMessage
                            name="confirmPassword"
                            component="div"
                            className="text-danger"
                          />
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
                              'Đăng ký'
                            )}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                )}

                {/* Employer Registration Form */}
                {activeTab === 'employer' && (
                  <Formik
                    initialValues={{
                      name: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                      phone: '',
                      website: '',
                      companySize: '',
                      industry: '',
                    }}
                    validationSchema={employerValidationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isSubmitting }) => (
                      <Form className="text-start">
                        <div className="mb-3">
                          <label htmlFor="name" className="form-label">Tên công ty</label>
                          <Field
                            type="text"
                            id="name"
                            name="name"
                            className="form-control"
                            placeholder="Nhập tên công ty"
                          />
                          <ErrorMessage name="name" component="div" className="text-danger" />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">Email công ty</label>
                          <Field
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            placeholder="Nhập email công ty"
                          />
                          <ErrorMessage name="email" component="div" className="text-danger" />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="phone" className="form-label">Số điện thoại</label>
                          <Field
                            type="text"
                            id="phone"
                            name="phone"
                            className="form-control"
                            placeholder="Nhập số điện thoại liên hệ"
                          />
                          <ErrorMessage name="phone" component="div" className="text-danger" />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="website" className="form-label">Website</label>
                          <Field
                            type="text"
                            id="website"
                            name="website"
                            className="form-control"
                            placeholder="Nhập website công ty"
                          />
                          <ErrorMessage name="website" component="div" className="text-danger" />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="companySize" className="form-label">Quy mô công ty</label>
                          <Field
                            as="select"
                            id="companySize"
                            name="companySize"
                            className="form-select"
                          >
                            <option value="">Chọn quy mô</option>
                            <option value="25-99">25 - 99 nhân viên</option>
                            <option value="100-499">100 - 499 nhân viên</option>
                            <option value="500-999">500 - 999 nhân viên</option>
                            <option value="1000-4999">1.000 - 4.999 nhân viên</option>
                            <option value="5000-9999">5.000 - 9.999 nhân viên</option>
                            <option value="10000-19999">10.000 - 19.999 nhân viên</option>
                          </Field>
                          <ErrorMessage name="companySize" component="div" className="text-danger" />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="industry" className="form-label">Ngành nghề</label>
                          <Field
                            as="select"
                            id="industry"
                            name="industry"
                            className="form-select"
                          >
                            <option value="">Chọn ngành nghề</option>
                            <option value="IT">Công nghệ thông tin</option>
                            <option value="Finance">Tài chính / Ngân hàng</option>
                            <option value="Education">Giáo dục / Đào tạo</option>
                            <option value="Healthcare">Y tế / Sức khỏe</option>
                            <option value="Manufacturing">Sản xuất</option>
                            <option value="Retail">Bán lẻ</option>
                            <option value="Construction">Xây dựng</option>
                            <option value="Other">Khác</option>
                          </Field>
                          <ErrorMessage name="industry" component="div" className="text-danger" />
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
                          <label htmlFor="confirmPassword" className="form-label">
                            Xác nhận mật khẩu
                          </label>
                          <Field
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className="form-control"
                            placeholder="Nhập lại mật khẩu"
                          />
                          <ErrorMessage
                            name="confirmPassword"
                            component="div"
                            className="text-danger"
                          />
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
                              'Đăng ký'
                            )}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                )}

                <div className="mt-3 text-center">
                  <p>
                    Đã có tài khoản?{' '}
                    <Link to="/auth/login" className="text-primary">
                      Đăng nhập
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

export default RegisterPage;
