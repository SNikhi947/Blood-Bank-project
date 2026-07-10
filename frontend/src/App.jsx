import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Register from './components/Register';
import LoginForm from './components/LoginForm';
import UserDashboard from './components/UserDashboard';
import HospitalDashboard from './components/HospitalDashboard';
import AdminDashboard from './components/AdminDashboard'; 

function App() {
  // Set the default view to 'landing' so it's the first page users see
  const [currentView, setCurrentView] = useState('landing');
  const validViews = ['landing', 'register', 'login', 'user', 'hospital', 'admin'];

  return (
    <div>
      {currentView === 'landing' && (
        <LandingPage 
          onNavigateToLogin={() => setCurrentView('login')}
          onNavigateToRegister={() => setCurrentView('register')}
        />
      )}

      {/* Register Page */}
      {currentView === 'register' && (
        <Register onSwitchToLogin={() => setCurrentView('login')} />
      )}
      
      {/* Login Page */}
      {currentView === 'login' && (
        <LoginForm 
          onSwitchToRegister={() => setCurrentView('register')} 
          onLoginSuccess={(role) => {
            const cleanRole = String(role).toLowerCase().trim();
            setCurrentView(cleanRole);
          }} 
        />
      )}

      {/* Dashboards */}
      {currentView === 'user' && <UserDashboard />}
      {currentView === 'hospital' && <HospitalDashboard />}
      {currentView === 'admin' && <AdminDashboard />}

      {/* Fallback Error Screen */}
      {!validViews.includes(currentView) && (
        <div style={{padding: '50px', textAlign: 'center', color: 'red'}}>
          <h2>⚠️ Navigation Error</h2>
          <p>The app tried to go to a page named: <strong>"{currentView}"</strong>, but it doesn't exist.</p>
          <button 
            onClick={() => setCurrentView('login')}
            style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '20px' }}
          >
            Go back to Login
          </button>
        </div>
      )}
    </div>
  );
}

export default App;