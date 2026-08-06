import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import RecruiterDashboard from './components/RecruiterDashboard';
import TpoDashboard from './components/TpoDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null); // { email, role, uid }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Query Firestore for the user's role
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let role = 'student';
          if (userDocSnap.exists()) {
            role = userDocSnap.data().role;
          } else {
            // Fallback: Check local storage or default to student
            role = localStorage.getItem('placement-role') || 'student';
          }
          
          setUser({
            email: firebaseUser.email,
            role: role,
            uid: firebaseUser.uid
          });
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          // Fallback to local storage role if firestore query fails
          const backupRole = localStorage.getItem('placement-role') || 'student';
          setUser({
            email: firebaseUser.email,
            role: backupRole,
            uid: firebaseUser.uid
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('placement-role'); // Clean up role on logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Render correct dashboard depending on role
  const renderDashboard = () => {
    switch (user.role) {
      case 'student':
        return <StudentDashboard user={user} />;
      case 'recruiter':
        return <RecruiterDashboard user={user} />;
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
          <span className="role-badge">
            {user.role === 'tpo' ? 'TPO ADMIN' : user.role.toUpperCase() + ' PANEL'}
          </span>
          <span className="user-email">{user.email}</span>
          <button onClick={handleLogout} className="logout-btn">
            Log Out
          </button>
        </div>
      </header>

      {/* Render Dynamic Role Dashboard */}
      {renderDashboard()}
    </div>
  );
}

export default App;
