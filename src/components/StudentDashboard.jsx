// src/components/StudentDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  jobService, 
  applicationService, 
  profileService, 
  resumeService, 
  interviewService, 
  notificationService 
} from '../api';
import './Dashboards.css';

export default function StudentDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'profile' | 'interviews' | 'notifications'
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Profile states
  const [profileName, setProfileName] = useState('');
  const [profileCgpa, setProfileCgpa] = useState('');
  const [profileBranch, setProfileBranch] = useState('');
  const [profileResume, setProfileResume] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileSkills, setProfileSkills] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // File Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  // Fetch student profile details
  const fetchProfile = useCallback(async () => {
    try {
      const data = await profileService.getStudentProfile();
      setProfileName(data.name || '');
      setProfileCgpa(data.cgpa !== undefined ? data.cgpa.toString() : '');
      setProfileBranch(data.branch || '');
      setProfileResume(data.resumeUrl || '');
      setProfilePhone(data.phoneNumber || '');
      setProfileSkills(data.skills || '');
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch approved jobs
      const jobsList = await jobService.getApprovedJobs();
      setJobs(jobsList);

      // 2. Fetch student's applications
      const appsList = await applicationService.getMyApplications();
      // Store complete application records
      setApplications(appsList);

      // 3. Fetch profile details
      await fetchProfile();

      // 4. Fetch interviews
      const interviewsList = await interviewService.getStudentInterviews();
      setInterviews(interviewsList);

      // 5. Fetch notifications
      const notificationsList = await notificationService.getNotifications();
      setNotifications(notificationsList);
    } catch (error) {
      console.error("Error fetching student dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');

    if (!profileName || !profileCgpa || !profileBranch) {
      setProfileError('Name, CGPA and Branch are required.');
      return;
    }

    const cgpaNum = parseFloat(profileCgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      setProfileError('Please enter a valid CGPA between 0.0 and 10.0');
      return;
    }

    setProfileLoading(true);
    try {
      await profileService.updateStudentProfile({
        name: profileName,
        cgpa: cgpaNum,
        branch: profileBranch,
        resumeUrl: profileResume,
        phoneNumber: profilePhone,
        skills: profileSkills
      });
      setProfileMsg('Profile updated successfully!');
      // Refresh local profile values
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setUploadMsg('');
    if (!selectedFile) {
      window.showToast("Please select a PDF file first.", "error");
      return;
    }
    setUploadLoading(true);
    try {
      const response = await resumeService.uploadResume(selectedFile);
      setProfileResume(response.message); // The backend returns file download url in 'message'
      setUploadMsg("Resume uploaded and parsed successfully!");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      window.showToast(error.response?.data?.message || "Failed to upload resume. Ensure it is a PDF file.", "error");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleApply = async (job) => {
    // 1. Check if profile is complete
    if (!profileName || !profileCgpa || !profileBranch || !profileResume) {
      window.showToast("Please complete your profile details (including uploading a PDF Resume) first before applying!", "error");
      setActiveTab('profile');
      return;
    }

    // 2. Check CGPA eligibility
    const studentCgpaVal = parseFloat(profileCgpa);
    const jobCgpaVal = parseFloat(job.minCgpa);

    if (!isNaN(jobCgpaVal) && studentCgpaVal < jobCgpaVal) {
      window.showToast(`Eligibility Warning: Your CGPA (${studentCgpaVal}) does not meet the minimum requirement of ${jobCgpaVal} for this drive.`, "error");
      return;
    }

    setActionLoadingId(job.id);
    try {
      await applicationService.applyForJob(job.id);
      window.showToast(`Success: Applied to ${job.companyName} successfully!`, "success");
      // Update local state by refetching applications
      const appsList = await applicationService.getMyApplications();
      setApplications(appsList);
    } catch (error) {
      console.error("Error applying to job:", error);
      window.showToast(error.response?.data?.message || "Failed to apply. Please try again.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkRead = async (notifId) => {
    try {
      await notificationService.markAsRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  // Helper to check if student already applied to a job
  const getApplicationForJob = (jobId) => {
    return applications.find(app => app.job.id === jobId);
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) || 
    job.companyName.toLowerCase().includes(search.toLowerCase())
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
          <button
            className={`tab-btn ${activeTab === 'interviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('interviews')}
          >
            Interviews ({interviews.filter(i => i.status === 'SCHEDULED').length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications ({notifications.filter(n => !n.read).length})
          </button>
        </div>

        {activeTab === 'jobs' && (
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
                  const appRecord = getApplicationForJob(job.id);
                  const isApplied = !!appRecord;
                  const appStatus = appRecord ? appRecord.status : null;
                  
                  const cgpaReq = parseFloat(job.minCgpa);
                  const isUnderCgpa = !isNaN(cgpaReq) && parseFloat(profileCgpa) < cgpaReq;
                  
                  return (
                    <div className="job-card" key={job.id}>
                      <div>
                        <div className="job-card-header">
                          <div className="company-logo-placeholder">
                            {job.companyName.charAt(0).toUpperCase()}
                          </div>
                          <span className="package-tag">{job.salaryPackage}</span>
                        </div>

                        <h3 className="job-title">{job.title}</h3>
                        <p className="company-name">{job.companyName}</p>

                        <div className="job-details">
                          <div className="job-detail-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span>{job.location || 'Remote'}</span>
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
                          Required CGPA: <strong>{job.minCgpa || 'N/A'}</strong>
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
                            <span className={`app-status-badge ${appStatus.toLowerCase()}`}>
                              {appStatus}
                            </span>
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
        )}

        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Left side: Profile Meta */}
            <div className="create-drive-form" style={{ margin: 0 }}>
              <h2>Manage Profile Details</h2>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text)' }}>
                Keep your profile up to date. Job applications verify your CGPA eligibility.
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
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="+91-XXXXXXXXXX"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Technical Skills (Comma separated)</label>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Java, Python, React, SQL..."
                    value={profileSkills}
                    onChange={(e) => setProfileSkills(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={profileLoading}
                  style={{ marginTop: '1.5rem' }}
                >
                  {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>

            {/* Right side: Resume Uploading */}
            <div className="create-drive-form" style={{ margin: 0, height: 'fit-content' }}>
              <h2>Upload Resume (PDF)</h2>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text)' }}>
                Upload your latest resume in PDF format. Recruiter application reviews link to this file.
              </p>

              {uploadMsg && <div className="alert-banner success" style={{ marginBottom: '1.5rem' }}>{uploadMsg}</div>}

              <form onSubmit={handleFileUpload}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    style={{ display: 'block', margin: '1rem 0' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={uploadLoading || !selectedFile}
                >
                  {uploadLoading ? 'Uploading...' : 'Upload PDF Resume'}
                </button>
              </form>

              {profileResume && (
                <div style={{ marginTop: '2rem', padding: '1rem', border: '1px dashed var(--border)', borderRadius: '6px' }}>
                  <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>Current Resume Link:</h4>
                  <a href={profileResume} target="_blank" rel="noopener noreferrer" className="forgot-link" style={{ wordBreak: 'break-all' }}>
                    {profileResume}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'interviews' && (
          <div>
            <h2>Scheduled Interview Details</h2>
            {interviews.length === 0 ? (
              <div className="empty-state">
                <h3>No Interviews Scheduled</h3>
                <p>You do not have any interviews scheduled currently.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Job Position</th>
                      <th>Scheduled Date & Time</th>
                      <th>Mode / Venue</th>
                      <th>Notes</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interviews.map(i => (
                      <tr key={i.id}>
                        <td><strong>{i.application.job.companyName}</strong></td>
                        <td>{i.application.job.title}</td>
                        <td>{new Date(i.scheduledTime).toLocaleString()}</td>
                        <td>{i.location}</td>
                        <td style={{ maxWidth: '250px', fontSize: '0.85rem' }}>{i.notes || 'N/A'}</td>
                        <td>
                          <span className={`status-tag ${i.status.toLowerCase()}`}>
                            {i.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Notifications Log</h2>
              {notifications.some(n => !n.read) && (
                <button onClick={handleMarkAllRead} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  Mark All Read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="empty-state">
                <h3>All Clear!</h3>
                <p>You have no notifications at this time.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notifications.map(n => (
                  <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`} style={{
                    padding: '1.25rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: n.read ? 'var(--card-bg)' : 'rgba(99, 102, 241, 0.05)'
                  }}>
                    <div>
                      <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.95rem' }}>{n.message}</p>
                      <small style={{ color: 'gray' }}>{new Date(n.createdAt).toLocaleString()}</small>
                    </div>
                    {!n.read && (
                      <button 
                        onClick={() => handleMarkRead(n.id)} 
                        className="btn-secondary" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
