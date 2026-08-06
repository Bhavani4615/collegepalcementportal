// src/components/RecruiterDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import './Dashboards.css';

export default function RecruiterDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('post'); // 'post' | 'applicants'
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [salaryPackage, setSalaryPackage] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [deadline, setDeadline] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchRecruiterData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch jobs posted by this recruiter
      const jobsQuery = query(collection(db, 'jobs'), where('recruiterUid', '==', user.uid));
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobsList = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsList);

      const jobIds = jobsList.map(j => j.id);

      // 2. Fetch all applications
      if (jobIds.length > 0) {
        const appsSnapshot = await getDocs(collection(db, 'applications'));
        const appsList = appsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(app => jobIds.includes(app.jobId));
        setApplicants(appsList);
      } else {
        setApplicants([]);
      }
    } catch (error) {
      console.error("Error fetching recruiter data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'applicants') {
      fetchRecruiterData();
    }
  }, [activeTab, fetchRecruiterData]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!title || !company || !salaryPackage || !description) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setSubmitLoading(true);
    try {
      await addDoc(collection(db, 'jobs'), {
        title,
        company,
        package: salaryPackage,
        description,
        location: location || 'Remote',
        cgpa: cgpa || 'N/A',
        deadline: deadline || 'Open',
        recruiterUid: user.uid,
        recruiterEmail: user.email,
        status: 'pending', // Requires TPO approval
        createdAt: Timestamp.now()
      });

      setSuccessMsg('Job drive posted successfully! Pending TPO approval.');
      // Clear form
      setTitle('');
      setCompany('');
      setSalaryPackage('');
      setDescription('');
      setLocation('');
      setCgpa('');
      setDeadline('');
    } catch (error) {
      console.error("Error posting job:", error);
      setErrorMsg('Failed to post job. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <main className="dashboard-main">
        <section className="welcome-banner">
          <h1>Recruiter Panel</h1>
          <p>Launch hiring drives, track campus applications, and recruit top student talent.</p>
        </section>

        {/* Tab Selection */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'post' ? 'active' : ''}`}
            onClick={() => setActiveTab('post')}
          >
            Create Job Drive
          </button>
          <button
            className={`tab-btn ${activeTab === 'applicants' ? 'active' : ''}`}
            onClick={() => setActiveTab('applicants')}
          >
            Manage Drives & Applicants
          </button>
        </div>

        {activeTab === 'post' ? (
          <div className="create-drive-form">
            <h2>Post a New Placement Drive</h2>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text)' }}>
              Fill out this form to launch a new recruitment drive on campus. Drives are pending review and approval by TPOs.
            </p>

            {successMsg && <div className="alert-banner success" style={{ marginBottom: '1.5rem' }}>{successMsg}</div>}
            {errorMsg && <div className="alert-banner error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}

            <form onSubmit={handlePostJob}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="e.g. Software Engineer Intern"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="e.g. Microsoft"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary Package (LPA) *</label>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="e.g. 15 LPA"
                    value={salaryPackage}
                    onChange={(e) => setSalaryPackage(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Location</label>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="e.g. Bangalore / Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="form-grid" style={{ gridColumn: 'span 2', margin: 0, padding: 0 }}>
                  <div className="form-group">
                    <label className="form-label">Min CGPA Requirement</label>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="e.g. 7.5 or N/A"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Application Deadline</label>
                    <input
                      type="date"
                      className="search-input"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Job Description *</label>
                <textarea
                  className="textarea-input"
                  placeholder="Summarize role responsibilities, benefits, skill requirements, and selection process..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={submitLoading}
              >
                {submitLoading ? 'Posting...' : 'Post Placement Drive'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h2>Active Drives & Applications</h2>
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
                <p>Loading application details...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                <h3>No Placement Drives Posted Yet</h3>
                <p>Switch to the "Create Job Drive" tab to launch your first campus campaign.</p>
              </div>
            ) : (
              <>
                <h3 style={{ marginTop: '2rem' }}>Job Postings Status</h3>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Package</th>
                        <th>Location</th>
                        <th>Min CGPA</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map(job => (
                        <tr key={job.id}>
                          <td><strong>{job.title}</strong></td>
                          <td>{job.package}</td>
                          <td>{job.location}</td>
                          <td>{job.cgpa}</td>
                          <td>
                            <span className={`status-tag ${job.status}`}>
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3 style={{ marginTop: '2.5rem' }}>Student Applicants</h3>
                {applicants.length === 0 ? (
                  <div className="empty-state">
                    <h3>No Applicants Yet</h3>
                    <p>No students have applied to your approved job drives yet.</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Job Position</th>
                          <th>Candidate Name</th>
                          <th>Branch</th>
                          <th>CGPA</th>
                          <th>Resume</th>
                          <th>Applied At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applicants.map(app => (
                          <tr key={app.id}>
                            <td><strong>{app.jobTitle}</strong></td>
                            <td>{app.studentName || app.studentEmail.split('@')[0]}</td>
                            <td>{app.studentBranch || 'N/A'}</td>
                            <td>{app.studentCgpa !== undefined ? app.studentCgpa.toFixed(2) : 'N/A'}</td>
                            <td>
                              {app.studentResume ? (
                                <a
                                  href={app.studentResume}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="forgot-link"
                                >
                                  View Resume
                                </a>
                              ) : (
                                'N/A'
                              )}
                            </td>
                            <td>{app.appliedAt?.toDate ? app.appliedAt.toDate().toLocaleDateString() : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
