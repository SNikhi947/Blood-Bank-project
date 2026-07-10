import React, { useState } from 'react';
import apiClient from '../api/client';
import "./Register.css";

const Register = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [agreed, setAgreed] = useState(false);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!agreed) {
      setError("You must agree to the privacy policy to register.");
      return;
    }

    try {
      const response = await apiClient.post('/register', {
        username: username,
        password: password,
        role: role
      });
      
      setMessage(response.data.message || "Registration successful!");
      setUsername('');
      setPassword('');
      setAgreed(false);
      
      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Username might be taken.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Blood Bank Portal</h2>
        <p className="register-subtitle">
          Join our network to manage life-saving blood resources with clinical precision.
        </p>

        <div className="toggle-container">
          <button type="button" className="toggle-btn inactive" onClick={onSwitchToLogin}>Login</button>
          <button type="button" className="toggle-btn active">Register</button>
        </div>

        {error && <div className="alert error-alert">{error}</div>}
        {message && <div className="alert success-alert">{message}</div>}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Full Name or Institutional ID</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder="Enter your full name or ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Secure Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Registration Type</label>
            <div className="role-selection">
              <div 
                className={`role-card ${role === 'user' ? 'selected' : ''}`}
                onClick={() => setRole('user')}
              >
                <span className="role-icon">🩸</span>
                <p>Individual Donor</p>
              </div>
              <div 
                className={`role-card ${role === 'hospital' ? 'selected' : ''}`}
                onClick={() => setRole('hospital')}
              >
                <span className="role-icon">🏥</span>
                <p>Hospital Rep</p>
              </div>
            </div>
          </div>

          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="privacy" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor="privacy">
              I agree to the Donor Privacy Policy and clinical data handling guidelines.
            </label>
          </div>

          <button type="submit" className="submit-btn">
            Complete Registration →
          </button>
        </form>

        <div className="register-footer">
          Already a member? <span onClick={onSwitchToLogin} className="login-link" style={{cursor: 'pointer'}}>Log in</span>
        </div>
      </div>
      
      <p className="bottom-quote">
        "Every drop shared is a life sustained. Your participation strengthens our medical ecosystem."
      </p>
    </div>
  );
};

export default Register;