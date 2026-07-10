import React, { useState } from 'react';
import apiClient from '../api/client';
import './Register.css';

const DropMark = ({ className = '' }) => (
  <svg className={className} width="22" height="26" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0C10 0 0 12.5 0 17C0 20.87 4.03 24 9 24H11C15.97 24 20 20.87 20 17C20 12.5 10 0 10 0Z" fill="currentColor" />
  </svg>
);

const Register = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!agreed) {
      setError('You must agree to the privacy policy to register.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/register', { username, password, role });
      setMessage(response.data.message || 'Registration successful!');
      setUsername('');
      setPassword('');
      setAgreed(false);
      setTimeout(() => onSwitchToLogin(), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Username might be taken.');
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
          <h2>Two minutes to join the network.</h2>
          <p>Register as an individual donor or a hospital, and get matched the moment it matters.</p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card auth-card-wide">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join as a donor or register your hospital.</p>

          {error && <div className="auth-alert">{error}</div>}
          {message && <div className="auth-alert auth-alert-success">{message}</div>}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="auth-field">
              <label>Username</label>
              <input
                type="text"
                placeholder="Choose a unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label>Register As</label>
              <div className="role-grid">
                <button
                  type="button"
                  className={`role-card ${role === 'user' ? 'selected' : ''}`}
                  onClick={() => setRole('user')}
                >
                  <span className="role-index">01</span>
                  <h4>Individual Donor</h4>
                  <p>Get matched to nearby requests by your blood type.</p>
                </button>
                <button
                  type="button"
                  className={`role-card ${role === 'hospital' ? 'selected' : ''}`}
                  onClick={() => setRole('hospital')}
                >
                  <span className="role-index">02</span>
                  <h4>Hospital</h4>
                  <p>Raise requests and reach verified donors directly.</p>
                </button>
              </div>
            </div>

            <label className="auth-checkbox">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span className="auth-checkbox-box" />
              <span className="auth-checkbox-text">
                I agree to the donor privacy policy and data handling guidelines.
              </span>
            </label>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Complete Registration'}
            </button>
          </form>

          <div className="auth-footer">
            Already a member?{' '}
            <span className="auth-link" onClick={onSwitchToLogin}>Log in</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;