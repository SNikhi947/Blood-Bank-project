import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onNavigateToLogin, onNavigateToRegister }) => {
  return (
    <div className="landing-container">
      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <span className="logo-icon">🩸</span>
          <span className="logo-text">BloodLink</span>
        </div>
        <div className="nav-actions">
          <button className="nav-btn-outline" onClick={onNavigateToLogin}>Log In</button>
          <button className="nav-btn-primary" onClick={onNavigateToRegister}>Join Network</button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-bg-elements">
            <div className="glow-orb orb-1"></div>
            <div className="glow-orb orb-2"></div>
          </div>
          
          <div className="hero-content">
            <div className="hero-badge">Be the lifeline someone needs</div>
            <h1 className="hero-title">
              Your Blood Can Bring <br />
              <span className="text-gradient">Colors To Someone's Life.</span>
            </h1>
            <p className="hero-quote">
              "Tears of a mother cannot save her child. But your blood can."
            </p>
            <p className="hero-subtitle">
              Join thousands of donors and hospitals in our seamless, real-time blood bridging network. Every drop is a promise of tomorrow.
            </p>
            <div className="hero-buttons">
              <button className="cta-btn primary-cta" onClick={onNavigateToRegister}>
                Become a Donor
              </button>
              <button className="cta-btn secondary-cta" onClick={onNavigateToLogin}>
                Request Blood
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stat-card">
            <h3>100+</h3>
            <p>Registered Donors</p>
          </div>
          <div className="stat-card">
            <h3>50+</h3>
            <p>Partner Hospitals</p>
          </div>
          <div className="stat-card">
            <h3>24/7</h3>
            <p>Emergency Support</p>
          </div>
          <div className="stat-card">
            <h3>5+</h3>
            <p>Lives Saved</p>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>A simple process that creates a monumental impact.</p>
          </div>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">📝</div>
              <h4>1. Register</h4>
              <p>Sign up securely with your blood group and location details in less than 2 minutes.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">🔔</div>
              <h4>2. Get Notified</h4>
              <p>Receive real-time alerts when a hospital or patient in your area needs your specific blood type.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">❤️</div>
              <h4>3. Save a Life</h4>
              <p>Accept the request, visit the partner hospital, donate, and become someone's hero.</p>
            </div>
          </div>
        </section>

        {/* Inspirational Quote Banner */}
        <section className="quote-banner">
          <h2>"The measure of a life, after all, is not its duration, but its donation."</h2>
          <button className="cta-btn primary-cta banner-btn" onClick={onNavigateToRegister}>
            Start Your Journey Today
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">🩸</span>
            <span>BloodLink</span>
          </div>
          <p>© 2026 BloodLink Portal. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;