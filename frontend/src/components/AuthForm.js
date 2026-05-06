import React, { useState } from 'react';
import { useForm } from '../hooks/useForm';

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const AuthForm = ({ isLogin = true, onSubmit, isLoading = false, serverError = '' }) => {
  const defaultValues = isLogin
    ? { email: '', password: '', rememberMe: false }
    : { name: '', email: '', password: '' };

  const [showPassword, setShowPassword] = useState(false);
  const [clientErrors, setClientErrors] = useState({});

  const form = useForm(defaultValues, (values) => {
    const errors = {};

    if (!values.email || !validateEmail(values.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!values.password || !validatePassword(values.password)) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!isLogin && (!values.name || values.name.trim().length < 2)) {
      errors.name = 'Name must be at least 2 characters.';
    }

    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }

    setClientErrors({});
    onSubmit(values);
  });

  const handleBlur = (e) => {
    form.handleBlur(e);
    const { name, value } = e.target;

    if (name === 'email' && value && !validateEmail(value)) {
      setClientErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
    } else if (name === 'email' && value && validateEmail(value)) {
      setClientErrors((prev) => { const { email, ...rest } = prev; return rest; });
    }

    if (name === 'password' && value && !validatePassword(value)) {
      setClientErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters.' }));
    } else if (name === 'password' && value && validatePassword(value)) {
      setClientErrors((prev) => { const { password, ...rest } = prev; return rest; });
    }
  };

  const getInputError = (fieldName) => {
    return clientErrors[fieldName] || '';
  };

  return (
    <form onSubmit={form.handleSubmit} className="auth-form" noValidate>
      {serverError && (
        <div className="error-message" role="alert">
          <span className="error-icon">&#9888;</span>
          {serverError}
        </div>
      )}

      {!isLogin && (
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <div className="input-wrapper">
            <span className="input-icon">&#128100;</span>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="John Doe"
              value={form.values.name}
              onChange={form.handleChange}
              onBlur={handleBlur}
              className={getInputError('name') ? 'input-error' : ''}
              required
              autoComplete="name"
            />
          </div>
          {getInputError('name') && (
            <span className="validation-error">{getInputError('name')}</span>
          )}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <div className="input-wrapper">
          <span className="input-icon">&#9993;</span>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            value={form.values.email}
            onChange={form.handleChange}
            onBlur={handleBlur}
            className={getInputError('email') ? 'input-error' : ''}
            required
            autoComplete="email"
            disabled={isLoading}
          />
        </div>
        {getInputError('email') && (
          <span className="validation-error">{getInputError('email')}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="input-wrapper">
          <span className="input-icon">&#128274;</span>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            placeholder="Enter your password"
            value={form.values.password}
            onChange={form.handleChange}
            onBlur={handleBlur}
            className={getInputError('password') ? 'input-error' : ''}
            required
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            disabled={isLoading}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {getInputError('password') && (
          <span className="validation-error">{getInputError('password')}</span>
        )}
      </div>

      {isLogin && (
        <div className="form-options">
          <label className="remember-me">
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.values.rememberMe}
              onChange={form.handleChange}
            />
            Remember me
          </label>
          <a href="#" className="forgot-password">
            Forgot password?
          </a>
        </div>
      )}

      <button
        type="submit"
        className="btn-login"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            {isLogin ? 'Signing in...' : 'Creating account...'}
          </>
        ) : (
          isLogin ? 'Sign In' : 'Create Account'
        )}
      </button>
    </form>
  );
};

export default AuthForm;
