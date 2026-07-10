import React, { useEffect, useRef, useState } from 'react';
import './LandingPage.css';

const DropMark = ({ className = '' }) => (
  <svg className={className} width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0C10 0 0 12.5 0 17C0 20.87 4.03 24 9 24H11C15.97 24 20 20.87 20 17C20 12.5 10 0 10 0Z" fill="currentColor" />
  </svg>
);

const CheckMark = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8.5L6.2 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Chevron = ({ open }) => (
  <svg
    className={`faq-chevron ${open ? 'rotated' : ''}`}
    width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PulseDivider = () => (
  <div className="pulse-divider" aria-hidden="true">
    <svg viewBox="0 0 1200 60" preserveAspectRatio="none">
      <path className="pulse-divider-path" d="M0 30 H420 L450 8 L478 52 L505 30 H1200" fill="none" />
    </svg>
  </div>
);

const Reveal = ({ children, className = '' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}>
      {children}
    </div>
  );
};

const faqData = [
  {
    question: 'Who can register as a donor?',
    answer: 'Anyone aged 18 to 65, weighing at least 50kg, and meeting the standard health checks confirmed at the partner hospital.',
  },
  {
    question: 'How does matching work?',
    answer: 'When a hospital raises a request for a specific blood type, the system checks it against registered donor profiles by type and location and sends alerts to a match.',
  },
  {
    question: 'Is my contact information shared automatically?',
    answer: 'No. Hospitals only see your contact details once you review a specific request and choose to accept it.',
  },
];

const LandingPage = ({ onNavigateToLogin, onNavigateToRegister }) => {
  const panelRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [openFaq, setOpenFaq] = useState(null);

  const handleMouseMove = (e) => {
    const node = panelRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: y * -8, ry: x * 12 });
  };
  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="nav-logo">
          <DropMark />
          <span className="logo-text">BloodLink</span>
        </div>
        <div className="nav-actions">
          <button className="nav-btn-outline" onClick={onNavigateToLogin}>Log In</button>
          <button className="nav-btn-primary" onClick={onNavigateToRegister}>Join Network</button>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="hero-section">
          <Reveal className="hero-copy">
            <div className="hero-eyebrow">
              <span className="live-dot" /> REAL-TIME DONOR NETWORK
            </div>
            <h1 className="hero-title">
              Your blood is someone's
              <span className="hero-title-em"> next heartbeat.</span>
            </h1>
            <p className="hero-subtitle">
              BloodLink connects donors and hospitals the moment a request comes in —
              matched by blood type, notified instantly, no wasted hours.
            </p>
            <div className="hero-buttons">
              <button className="cta-btn primary-cta" onClick={onNavigateToRegister}>Become a Donor</button>
              <button className="cta-btn secondary-cta" onClick={onNavigateToLogin}>Request Blood</button>
            </div>
          </Reveal>

          <Reveal className="signal-wrap">
            <div
              className="signal-card"
              ref={panelRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={resetTilt}
              style={{ transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
            >
              <div className="signal-rings">
                <span className="ring ring-1" />
                <span className="ring ring-2" />
                <span className="ring ring-3" />
                <DropMark className="signal-drop" />
              </div>
              <h3 className="signal-title">Know Your Type</h3>
              <div className="signal-facts">
                <div className="signal-fact">
                  <span className="fact-label">O&minus;</span>
                  <span className="fact-text">Universal donor</span>
                </div>
                <div className="signal-fact">
                  <span className="fact-label">AB+</span>
                  <span className="fact-text">Universal recipient</span>
                </div>
                <div className="signal-fact">
                  <span className="fact-label">MATCHING</span>
                  <span className="fact-text">Type &amp; location aware</span>
                </div>
                <div className="signal-fact">
                  <span className="fact-label">ALERTS</span>
                  <span className="fact-text">Sent the moment a request opens</span>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <PulseDivider />

        {/* Features */}
        <section className="features-section">
          <Reveal className="section-header">
            <span className="section-eyebrow">HOW IT'S BUILT</span>
            <h2>Made for fast, accountable emergency response.</h2>
          </Reveal>
          <div className="features-grid">
            <Reveal className="feature-card">
              <span className="feature-index">01</span>
              <h4>Real-Time Matching</h4>
              <p>A hospital's request is checked against donor blood type and location the moment it's raised.</p>
            </Reveal>
            <Reveal className="feature-card">
              <span className="feature-index">02</span>
              <h4>Verified Hospitals</h4>
              <p>Partner hospital accounts go through admin verification before they can raise requests.</p>
            </Reveal>
            <Reveal className="feature-card">
              <span className="feature-index">03</span>
              <h4>Recovery-Aware</h4>
              <p>Donor eligibility windows are tracked so no one is prompted to donate during a recovery period.</p>
            </Reveal>
          </div>
        </section>

        <PulseDivider />

        {/* How It Works */}
        <section className="how-it-works">
          <Reveal className="section-header">
            <span className="section-eyebrow">THE PROCESS</span>
            <h2>Three steps between you and a life saved.</h2>
          </Reveal>
          <div className="steps-grid">
            <Reveal className="step-card">
              <span className="step-index">STEP 01</span>
              <h4>Register</h4>
              <p>Sign up with your blood group and location in under two minutes.</p>
            </Reveal>
            <Reveal className="step-card">
              <span className="step-index">STEP 02</span>
              <h4>Get Notified</h4>
              <p>Real-time alerts when a hospital nearby needs your exact blood type.</p>
            </Reveal>
            <Reveal className="step-card">
              <span className="step-index">STEP 03</span>
              <h4>Save a Life</h4>
              <p>Accept the request, visit the partner hospital, and donate.</p>
            </Reveal>
          </div>
        </section>

        <PulseDivider />

        {/* Compatibility Table */}
        <section className="compat-section">
          <Reveal className="section-header">
            <span className="section-eyebrow">REFERENCE</span>
            <h2>Blood type compatibility.</h2>
          </Reveal>
          <Reveal>
            <div className="compat-table-wrap">
              <table className="compat-table">
                <thead>
                  <tr><th>Type</th><th>Can Give To</th><th>Can Receive From</th></tr>
                </thead>
                <tbody>
                  <tr><td>O&minus;</td><td>Everyone</td><td>O&minus; only</td></tr>
                  <tr><td>O+</td><td>O+, A+, B+, AB+</td><td>O+, O&minus;</td></tr>
                  <tr><td>A&minus;</td><td>A&minus;, A+, AB&minus;, AB+</td><td>A&minus;, O&minus;</td></tr>
                  <tr><td>A+</td><td>A+, AB+</td><td>A+, A&minus;, O+, O&minus;</td></tr>
                  <tr><td>AB+</td><td>AB+ only</td><td>Everyone</td></tr>
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>

        <PulseDivider />

        {/* FAQ */}
        <section className="faq-section">
          <Reveal className="section-header">
            <span className="section-eyebrow">QUESTIONS</span>
            <h2>Frequently asked.</h2>
          </Reveal>
          <div className="faq-list">
            {faqData.map((faq, idx) => (
              <Reveal key={idx} className="faq-item">
                <button className="faq-trigger" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                  <span>{faq.question}</span>
                  <Chevron open={openFaq === idx} />
                </button>
                <div className={`faq-answer ${openFaq === idx ? 'open' : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Quote Banner */}
        <Reveal>
          <section className="quote-banner">
            <p className="quote-mark">&ldquo;</p>
            <h2>The measure of a life, after all, is not its duration, but its donation.</h2>
            <button className="cta-btn banner-btn" onClick={onNavigateToRegister}>Start Your Journey Today</button>
          </section>
        </Reveal>
      </main>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <DropMark />
            <span>BloodLink</span>
          </div>
          <p>A student project demonstrating a real-time blood donor matching workflow.</p>
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