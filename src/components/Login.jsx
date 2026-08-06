// src/components/Login.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [generalError, setGeneralError] = useState('');

  // Validate form fields
  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const getFriendlyErrorMessage = (code) => {
    switch (code) {
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/email-already-in-use':
        return 'This email address is already registered.';
      case 'auth/weak-password':
        return 'The password is too weak. It must be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setStatus('loading');

    try {
      if (isSignUp) {
        // Sign Up Flow
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Write the profile data to Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: email,
          role: role,
          createdAt: new Date().toISOString()
        });
      } else {
        // Sign In Flow
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      // Store user role locally as backup
      localStorage.setItem('placement-role', role);
      
      setStatus('success');
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess({ email, role });
        }
      }, 1000);
    } catch (error) {
      console.error("Firebase auth/firestore error:", error);
      setStatus('error');
      setGeneralError(getFriendlyErrorMessage(error.code));
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Left Side: Dynamic Stats & Marketing */}
        <div className="login-sidebar">
          <div className="sidebar-header">
            <div className="brand">
              <div className="brand-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                </svg>
              </div>
              <span>PlacementPal</span>
            </div>
          </div>

          <div className="sidebar-content">
            <h1 className="sidebar-title">Launch Your Career Journey</h1>
            <p className="sidebar-subtitle">
              Connect with top companies, access exclusive internship opportunities, and build your professional future with the ultimate placement portal.
            </p>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">96%</span>
                <span className="stat-label">Placement Rate</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">450+</span>
                <span className="stat-label">Recruiters</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">48 LPA</span>
                <span className="stat-label">Max Package</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">12k+</span>
                <span className="stat-label">Alumni Network</span>
              </div>
            </div>
          </div>

          <div className="sidebar-footer">
            <p>© {new Date().getFullYear()} PlacementPal Portal. All rights reserved.</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="login-form-side">
          <div className="login-card">
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem', animation: 'scaleUp 0.3s ease' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <h2 className="form-title">{isSignUp ? 'Registration Successful!' : 'Login Successful!'}</h2>
                <p className="form-subtitle">Redirecting to your dashboard...</p>
              </div>
            ) : (
              <>
                <div className="form-header">
                  <h2 className="form-title">{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
                  <p className="form-subtitle">{isSignUp ? 'Sign up to access placement features' : 'Please enter your details to sign in'}</p>
                </div>

                {/* Role Selector */}
                <div className="role-selector">
                  <button
                    type="button"
                    className={`role-tab ${role === 'student' ? 'active' : ''}`}
                    onClick={() => setRole('student')}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    className={`role-tab ${role === 'recruiter' ? 'active' : ''}`}
                    onClick={() => setRole('recruiter')}
                  >
                    Recruiter
                  </button>
                  <button
                    type="button"
                    className={`role-tab ${role === 'tpo' ? 'active' : ''}`}
                    onClick={() => setRole('tpo')}
                  >
                    TPO / Admin
                  </button>
                </div>

                {generalError && (
                  <div className="alert-banner error">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>{generalError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="form-body" noValidate>
                  {/* Email Input */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email Address</label>
                    <div className="input-container">
                      <span className="input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </span>
                      <input
                        type="email"
                        id="email"
                        className={`login-input ${errors.email ? 'error' : ''}`}
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        disabled={status === 'loading'}
                      />
                    </div>
                    {errors.email && (
                      <span className="error-text">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="password">Password</label>
                    <div className="input-container">
                      <span className="input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        className={`login-input ${errors.password ? 'error' : ''}`}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors({ ...errors, password: '' });
                        }}
                        disabled={status === 'loading'}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={status === 'loading'}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <span className="error-text">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {errors.password}
                      </span>
                    )}
                  </div>

                  {/* Remember me & Forgot Password */}
                  {!isSignUp && (
                    <div className="form-options">
                      <label className="remember-me">
                        <input
                          type="checkbox"
                          className="checkbox-input"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          disabled={status === 'loading'}
                        />
                        Remember me
                      </label>
                      <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); alert('Reset password flow triggered (mocked).'); }}>
                        Forgot Password?
                      </a>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? (
                      <>
                        <svg className="spinner" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {isSignUp ? 'Creating Account...' : 'Signing in...'}
                      </>
                    ) : (
                      isSignUp 
                        ? `Sign Up as ${role.charAt(0).toUpperCase() + role.slice(1)}`
                        : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`
                    )}
                  </button>
                </form>

                <div className="form-footer">
                  <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
                  <a 
                    href="#toggle" 
                    className="signup-link" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      setIsSignUp(!isSignUp);
                      setGeneralError('');
                      setErrors({});
                    }}
                    disabled={status === 'loading'}
                  >
                    {isSignUp ? 'Sign In' : 'Create Account'}
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
