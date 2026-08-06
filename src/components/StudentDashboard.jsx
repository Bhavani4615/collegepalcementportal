// src/components/StudentDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import './Dashboards.css';

export default function StudentDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'profile'
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Profile states
  const [profileName, setProfileName] = useState('');
  const [profileCgpa, setProfileCgpa] = useState('');
  const [profileBranch, setProfileBranch] = useState('');
  const [profileResume, setProfileResume] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch student profile details
  const fetchProfile = useCallback(async () => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setProfileName(data.name || '');
        setProfileCgpa(data.cgpa !== undefined ? data.cgpa.toString() : '');
        setProfileBranch(data.branch || '');
        setProfileResume(data.resumeUrl || '');
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch approved jobs
      const jobsQuery = query(collection(db, 'jobs'), where('status', '==', 'approved'));
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobsList = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsList);

      // 2. Fetch student's applications
      const appsQuery = query(collection(db, 'applications'), where('studentUid', '==', user.uid));
      const appsSnapshot = await getDocs(appsQuery);
      const appsList = appsSnapshot.docs.map(doc => doc.data().jobId);
      setApplications(appsList);

      // 3. Fetch profile details
      await fetchProfile();
    } catch (error) {
      console.error("Error fetching student dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');

    if (!profileName || !profileCgpa || !profileBranch || !profileResume) {
      setProfileError('All profile fields are required.');
      return;
    }

    const cgpaNum = parseFloat(profileCgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      setProfileError('Please enter a valid CGPA between 0.0 and 10.0');
      return;
    }

    setProfileLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: profileName,
        cgpa: cgpaNum,
        branch: profileBranch,
        resumeUrl: profileResume,
        updatedAt: Timestamp.now()
      });
      setProfileMsg('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileError('Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleApply = async (job) => {
    // 1. Check if profile is complete
    if (!profileName || !profileCgpa || !profileBranch || !profileResume) {
      alert("Please complete your profile details (Name, CGPA, Branch, Resume) first before applying!");
      setActiveTab('profile');
      return;
    }

    // 2. Check CGPA eligibility
    const studentCgpaVal = parseFloat(profileCgpa);
    const jobCgpaVal = parseFloat(job.cgpa);

    if (!isNaN(jobCgpaVal) && studentCgpaVal < jobCgpaVal) {
      alert(`Eligibility Warning: Your CGPA (${studentCgpaVal}) does not meet the minimum requirement of ${jobCgpaVal} for this drive.`);
      return;
    }

    setActionLoadingId(job.id);
    try {
      await addDoc(collection(db, 'applications'), {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        package: job.package,
        studentUid: user.uid,
        studentEmail: user.email,
        studentName: profileName,
        studentCgpa: studentCgpaVal,
        studentBranch: profileBranch,
        studentResume: profileResume,
        appliedAt: Timestamp.now(),
        status: 'applied'
      });
      // Update local state
      setApplications(prev => [...prev, job.id]);
    } catch (error) {
      console.error("Error applying to job:", error);
      alert("Failed to apply. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) || 
    job.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-wrapper">
      <main className="dashboard-main">
        <section className="welcome-banner">
          <h1>Student Placement Board</h1>
          <p>Explore recruitment drives, track eligibility, and manage your placement profile.</p>
        </section>

        {/* Tab Selection */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => { setActiveTab('jobs'); setProfileMsg(''); setProfileError(''); }}
          >
            Placement Drives
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            My Profile & Resume
          </button>
        </div>

        {activeTab === 'jobs' ? (
          <>
            {/* Search Bar */}
            <div className="search-filter-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Search by role or company name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner" style={{
                  border: '4px solid var(--border)',
                  borderTop: '4px solid var(--accent)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  margin: '0 auto 1rem',
                  animation: 'rotate 1s linear infinite'
                }}></div>
                <p>Loading placement drives...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                <h3>No Jobs Found</h3>
                <p>There are no approved recruitment drives matching your search parameters right now.</p>
              </div>
            ) : (
              <div className="jobs-grid">
                {filteredJobs.map(job => {
                  const isApplied = applications.includes(job.id);
                  const cgpaReq = parseFloat(job.cgpa);
                  const isUnderCgpa = !isNaN(cgpaReq) && parseFloat(profileCgpa) < cgpaReq;
                  
                  return (
                    <div className="job-card" key={job.id}>
                      <div>
                        <div className="job-card-header">
                          <div className="company-logo-placeholder">
                            {job.company.charAt(0).toUpperCase()}
                          </div>
                          <span className="package-tag">{job.package}</span>
                        </div>

                        <h3 className="job-title">{job.title}</h3>
                        <p className="company-name">{job.company}</p>

                        <div className="job-details">
                          <div className="job-detail-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span>{job.location || 'Remote / On-site'}</span>
                          </div>
                          <div className="job-detail-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span>Deadline: {job.deadline || 'ASAP'}</span>
                          </div>
                        </div>

                        <p className="job-desc">{job.description}</p>
                      </div>

                      <div className="job-footer">
                        <span style={{ fontSize: '0.85rem', color: isUnderCgpa ? '#ef4444' : 'var(--text)' }}>
                          Required CGPA: <strong>{job.cgpa || 'N/A'}</strong>
                          {isUnderCgpa && " (Ineligible)"}
                        </span>
                        <button
                          type="button"
                          className={isApplied ? "btn-secondary" : isUnderCgpa ? "btn-secondary" : "btn-primary"}
                          disabled={isApplied || actionLoadingId === job.id}
                          onClick={() => handleApply(job)}
                          style={isUnderCgpa && !isApplied ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                          {actionLoadingId === job.id ? (
                            'Applying...'
                          ) : isApplied ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Applied
                            </>
                          ) : isUnderCgpa ? (
                            'Locked'
                          ) : (
                            'Apply Now'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="create-drive-form">
            <h2>Manage Profile Details</h2>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text)' }}>
              Keep your profile up to date. Job applications read from these values to verify your CGPA eligibility.
            </p>

            {profileMsg && <div className="alert-banner success" style={{ marginBottom: '1.5rem' }}>{profileMsg}</div>}
            {profileError && <div className="alert-banner error" style={{ marginBottom: '1.5rem' }}>{profileError}</div>}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="e.g. John Doe"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Branch / Major *</label>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="e.g. Computer Science Engineering"
                    value={profileBranch}
                    onChange={(e) => setProfileBranch(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Cumulative CGPA *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="search-input"
                    placeholder="e.g. 8.45"
                    value={profileCgpa}
                    onChange={(e) => setProfileCgpa(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Resume Link (Google Drive / Dropbox) *</label>
                  <input
                    type="url"
                    className="search-input"
                    placeholder="https://drive.google.com/..."
                    value={profileResume}
                    onChange={(e) => setProfileResume(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={profileLoading}
                style={{ marginTop: '1rem' }}
              >
                {profileLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
