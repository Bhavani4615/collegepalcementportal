import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import RecruiterDashboard from './components/RecruiterDashboard';
import TpoDashboard from './components/TpoDashboard';
import { authService } from './api';
import './App.css';

function App() {
  const [user, setUser] = useState(null); // { token, role, email, name, id }
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    window.showToast = (message, type = 'info') => {
      setToast({ message, type });
    };

    // Check if user session already exists in localStorage
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  // Render correct dashboard depending on role
  const renderDashboard = () => {
    // Standardize role to lowercase for matching existing react dashboard states
    const userRole = user.role ? user.role.toLowerCase() : 'student';

    switch (userRole) {
      case 'student':
        return <StudentDashboard user={user} />;
      case 'recruiter':
        return <RecruiterDashboard user={user} />;
      case 'admin':
      case 'tpo':
        return <TpoDashboard user={user} />;
      default:
        return <StudentDashboard user={user} />;
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--bg)',
        fontFamily: 'var(--sans)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{
            border: '4px solid var(--border)',
            borderTop: '4px solid var(--accent)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            margin: '0 auto 1rem',
            animation: 'rotate 1s linear infinite'
          }}></div>
          <p style={{ color: 'var(--text)', fontSize: '0.9rem' }}>Loading Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Beautiful Unified Layout with Role-Specific Dashboard Injector
  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
          </svg>
          <span className="dashboard-brand-name">PlacementPal</span>
        </div>
        <div className="dashboard-user-actions">
          <button onClick={toggleTheme} className="theme-toggle-btn" style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text)',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background 0.2s',
            marginRight: '8px'
          }} title="Toggle light/dark theme">
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>
          <span className="role-badge">
            {user.role === 'ADMIN' ? 'TPO ADMIN' : user.role + ' PANEL'}
          </span>
          <span className="user-email">{user.email}</span>
          <button onClick={handleLogout} className="logout-btn">
            Log Out
          </button>
        </div>
      </header>

      {/* Render Dynamic Role Dashboard */}
      {renderDashboard()}

      {/* Global Toast Notifications */}
      {toast && (
        <div className={`toast-message ${toast.type}`} style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow)',
          zIndex: 10000,
          color: '#fff',
          fontWeight: '600',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideIn 0.3s ease-out',
          backgroundColor: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : 'var(--accent)'
        }}>
          {toast.type === 'success' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
          {toast.type === 'error' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
