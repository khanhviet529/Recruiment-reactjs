import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaFacebook, FaGoogle } from 'react-icons/fa';
import authService from '../../../services/authService';
import './login.scss';

const Login = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    try {
      const response = await authService.login(data.email, data.password);
      if (response.role === 'candidate') {
        navigate('/candidate/profile');
      } else if (response.role === 'employer') {
        navigate('/employer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="login">
      <div className="login__container">
        <div className="login__header">
          <h2>Đăng nhập tài khoản</h2>
          <p>
            Hoặc{' '}
            <Link to="/register">đăng ký tài khoản mới</Link>
          </p>
        </div>

        <form className="login__form" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="error">{error}</div>
          )}

          <div className="login__form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              {...register('email', { required: true })}
            />
            {errors.email && <span className="error">Email là bắt buộc</span>}
          </div>

          <div className="login__form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              placeholder="Mật khẩu"
              {...register('password', { required: true })}
            />
            {errors.password && <span className="error">Mật khẩu là bắt buộc</span>}
          </div>

          <div className="login__remember">
            <div className="login__remember-checkbox">
              <input type="checkbox" id="remember-me" />
              <label htmlFor="remember-me">Ghi nhớ đăng nhập</label>
            </div>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <button type="submit" className="login__button">
            Đăng nhập
          </button>
        </form>

        <div className="login__divider">
          <span>Hoặc đăng nhập bằng</span>
        </div>

        <div className="login__social">
          <button type="button" className="facebook">
            <FaFacebook />
            <span>Facebook</span>
          </button>
          <button type="button" className="google">
            <FaGoogle />
            <span>Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;