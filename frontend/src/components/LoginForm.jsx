import React, { useState } from 'react';
import apiClient from '../api/client';
import './LoginForm.css';

const DropMark = ({ className = '' }) => (
  <svg className={className} width="22" height="26" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0C10 0 0 12.5 0 17C0 20.87 4.03 24 9 24H11C15.97 24 20 20.87 20 17C20 12.5 10 0 10 0Z" fill="currentColor" />
  </svg>
);

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.post('/login', { username, password });
      const token = response.data.access_token;
      localStorage.setItem('access_token', token);
      const userRole = response.data.role;
      onLoginSuccess(userRole);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-side">
        <div className="auth-brand">
          <DropMark />
          <span>BloodLink</span>
        </div>
        <div className="auth-side-copy">
          <div className="auth-rings">
            <span className="auth-ring auth-ring-1" />
            <span className="auth-ring auth-ring-2" />
            <span className="auth-ring auth-ring-3" />
            <DropMark className="auth-side-drop" />
          </div>
          <h2>Welcome back to the network.</h2>
          <p>Sign in to track requests, manage your donor profile, or respond to a hospital's call.</p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h1 className="auth-title">Log In</h1>
          <p className="auth-subtitle">Access your BloodLink dashboard.</p>

          {error && <div className="auth-alert">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-field">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Log In'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{' '}
            <span className="auth-link" onClick={onSwitchToRegister}>Join the network</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;