import React from 'react';
import { useForm } from '../hooks/useForm';

const AuthForm = ({ isLogin = true, onSubmit }) => {
  const defaultValues = isLogin
    ? { email: '', password: '' }
    : { name: '', email: '', password: '' };

  const form = useForm(defaultValues, onSubmit);

  return (
    <form onSubmit={form.handleSubmit} className="auth-form">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>

      {!isLogin && (
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.values.name}
            onChange={form.handleChange}
            required
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.values.email}
          onChange={form.handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={form.values.password}
          onChange={form.handleChange}
          required
        />
      </div>

      <button type="submit" className="btn-primary">
        {isLogin ? 'Login' : 'Register'}
      </button>
    </form>
  );
};

export default AuthForm;
