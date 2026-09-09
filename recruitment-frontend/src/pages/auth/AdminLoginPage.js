import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { 
  Card, 
  Button, 
  Input, 
  Form as AntForm, 
  Alert, 
  Typography, 
  Divider, 
  Spin, 
  Layout, 
  Space 
} from 'antd';
import { LockOutlined, UserOutlined, SecurityScanOutlined, InfoCircleOutlined, FacebookOutlined } from '@ant-design/icons';
import { login, loginWithFacebook } from '../../redux/slices/authSlice';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

const { Title, Text } = Typography;
const { Content } = Layout;

const AdminLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );
  
  const [loginError, setLoginError] = useState(null);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setLoginError('Bạn không có quyền truy cập trang quản trị.');
      }
    }
  }, [isAuthenticated, user, navigate]);

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
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoginError(null);
      
      // For admin login, set the isAdmin flag
      dispatch(login({
        ...values,
        isAdmin: true
      }));
    } catch (err) {
      setLoginError(
        err.response?.data?.message || 
        'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Facebook login for admin
  const responseFacebook = (response) => {
    console.log('Facebook admin login full response:', response);
    
    if (response.accessToken) {
      // Ensure we get the highest quality profile picture
      const fbGraphUrl = `https://graph.facebook.com/v16.0/${response.userID}/picture?type=large&redirect=false&access_token=${response.accessToken}`;
      
      // First dispatch with the data we have
      dispatch(loginWithFacebook({
        accessToken: response.accessToken,
        userID: response.userID,
        email: response.email,
        name: response.name,
        picture: response.picture?.data?.url || `https://graph.facebook.com/${response.userID}/picture?type=large`,
        fbGraphUrl: fbGraphUrl, // Pass the graph URL to fetch a higher quality image
        isAdmin: true // Special flag to indicate this is admin login attempt
      }));
    } else {
      console.error('Facebook admin login failed - no access token received', response);
    }
  };

  return (
    <Layout className="admin-login-layout">
      <Content className="admin-login-content">
        <div className="admin-login-container">
          <Card 
            className="admin-login-card" 
            bordered={false}
            style={{ 
              maxWidth: 450,
              margin: '0 auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <div className="text-center mb-4">
              <SecurityScanOutlined style={{ fontSize: 48, color: '#1677ff' }} />
              <Title level={2} style={{ marginTop: 16 }}>Đăng nhập Quản trị</Title>
              <Text type="secondary">
                Nhập thông tin đăng nhập để truy cập hệ thống quản trị
              </Text>
            </div>

            <Divider />

            {(error || loginError) && (
              <Alert 
                message="Lỗi đăng nhập" 
                description={error || loginError}
                type="error" 
                showIcon 
                style={{ marginBottom: 24 }}
              />
            )}

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, touched, errors }) => (
                <Form>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <AntForm.Item 
                        validateStatus={touched.email && errors.email ? 'error' : ''}
                        help={touched.email && errors.email ? errors.email : ''}
                      >
                        <Field name="email">
                          {({ field }) => (
                            <Input
                              {...field}
                              prefix={<UserOutlined />}
                              placeholder="Email đăng nhập"
                              size="large"
                            />
                          )}
                        </Field>
                      </AntForm.Item>
                    </div>

                    <div>
                      <AntForm.Item 
                        validateStatus={touched.password && errors.password ? 'error' : ''}
                        help={touched.password && errors.password ? errors.password : ''}
                      >
                        <Field name="password">
                          {({ field }) => (
                            <Input.Password
                              {...field}
                              prefix={<LockOutlined />}
                              placeholder="Mật khẩu"
                              size="large"
                            />
                          )}
                        </Field>
                      </AntForm.Item>
                    </div>

                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      disabled={isSubmitting || loading}
                    >
                      {(isSubmitting || loading) ? <Spin size="small" /> : 'Đăng nhập'}
                    </Button>
                  </Space>
                </Form>
              )}
            </Formik>
            
            <Divider>hoặc</Divider>
            
            <FacebookLogin
              appId="1618754122147057"
              autoLoad={false}
              fields="name,email,picture.width(1000).height(1000)"
              callback={responseFacebook}
              render={renderProps => (
                <Button
                  icon={<FacebookOutlined />}
                  size="large"
                  block
                  onClick={renderProps.onClick}
                  style={{
                    backgroundColor: '#1877f2',
                    color: 'white', 
                    border: 'none',
                    marginBottom: '12px'
                  }}
                  disabled={loading}
                >
                  Đăng nhập với Facebook
                </Button>
              )}
            />
            
            <Alert
              message="Chỉ tài khoản Admin được xác thực mới có thể đăng nhập"
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              style={{ marginTop: '16px' }}
            />
            
            <div className="text-center mt-4">
              <Button type="link" onClick={() => navigate('/')}>
                Quay lại trang chủ
              </Button>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AdminLoginPage; 