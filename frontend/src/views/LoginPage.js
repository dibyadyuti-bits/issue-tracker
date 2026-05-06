import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import '../styles/login.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values) => {
    setServerError('');
    setIsLoading(true);

    try {
      let response;
      if (isLoginMode) {
        response = await authService.login(values.email, values.password);
      } else {
        response = await authService.register(values.name, values.email, values.password);
      }

      const { user, token } = response.data;
      login(user, token);
      navigate('/issues');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (isLoginMode
          ? 'Invalid email or password. Please try again.'
          : 'Registration failed. Please try again.');
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">IT</div>
            <h1>{isLoginMode ? 'Welcome Back' : 'Create Account'}</h1>
            <p>
              {isLoginMode
                ? 'Sign in to access your issue tracker'
                : 'Get started with your free account'}
            </p>
          </div>

          <AuthForm
            isLogin={isLoginMode}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            serverError={serverError}
          />

          <div className="divider">or</div>

          <div className="login-footer">
            <p>
              {isLoginMode ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    className="toggle-mode-btn"
                    onClick={() => {
                      setIsLoginMode(false);
                      setServerError('');
                    }}
                  >
                    Create one now
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="toggle-mode-btn"
                    onClick={() => {
                      setIsLoginMode(true);
                      setServerError('');
                    }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
