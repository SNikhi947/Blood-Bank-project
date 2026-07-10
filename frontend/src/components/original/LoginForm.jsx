import React, { useState } from 'react';
import apiClient from '../api/client';
import "./LoginForm.css";

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
      const response = await apiClient.post('/login', {
        username: username,
        password: password
      });
      
      const token = response.data.access_token;
      localStorage.setItem('access_token', token);
      
      const userRole = response.data.role;

      onLoginSuccess(userRole);
      
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">
          Log in to manage your blood bank portal access.
        </p>

        <div className="auth-toggle">
          <button type="button" className="auth-toggle-btn active">Login</button>
          <button 
            type="button"
            className="auth-toggle-btn inactive"
            onClick={onSwitchToRegister}
          >
            Register
          </button>
        </div>

        {error && <div className="auth-alert error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="auth-input-group">
            <label>Full Name or Institutional ID</label>
            <div className="auth-input-wrapper">
              <span className="auth-icon">👤</span>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Secure Password</label>
            <div className="auth-input-wrapper">
              <span className="auth-icon">🔒</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Access Dashboard →"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <span onClick={onSwitchToRegister} className="auth-link" style={{cursor: 'pointer'}}>Join the network</span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;