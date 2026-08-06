// src/components/TpoDashboard.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Dashboards.css';

export default function TpoDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchTpoData();
  }, []);

  const fetchTpoData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all job postings
      const jobsSnapshot = await getDocs(collection(db, 'jobs'));
      const jobsList = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsList);

      // 2. Fetch all application records
      const appsSnapshot = await getDocs(collection(db, 'applications'));
      const appsList = appsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(appsList);
    } catch (error) {
      console.error("Error fetching TPO statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId) => {
    setActionLoadingId(jobId);
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        status: 'approved'
      });
      // Update local state
      setJobs(prev => prev.map(job => job.id === jobId ? { ...job, status: 'approved' } : job));
    } catch (error) {
      console.error("Error approving job:", error);
      alert("Failed to approve drive.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (jobId) => {
    if (!window.confirm("Are you sure you want to decline this job placement drive?")) return;
    setActionLoadingId(jobId);
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      // Update local state
      setJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error) {
      console.error("Error declining job:", error);
      alert("Failed to decline drive.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingJobs = jobs.filter(job => job.status === 'pending');
  const approvedJobsCount = jobs.filter(job => job.status === 'approved').length;

  return (
    <div className="dashboard-wrapper">
      <main className="dashboard-main">
        <section className="welcome-banner">
          <h1>TPO Administrative Panel</h1>
          <p>Supervise recruiter postings, track campus statistics, and manage corporate relations.</p>
        </section>

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
            <p>Loading analytics data...</p>
          </div>
        ) : (
          <>
            {/* Stats Metrics Grid */}
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Approved Jobs</h3>
                <div className="card-metric">{approvedJobsCount}</div>
                <p className="card-desc">Recruitment drives currently active on the student board</p>
              </div>

              <div className="dashboard-card">
                <h3>Pending Approvals</h3>
                <div className="card-metric" style={{ color: '#f59e0b' }}>{pendingJobs.length}</div>
                <p className="card-desc">Corporate job drives waiting for administrative review</p>
              </div>

              <div className="dashboard-card">
                <h3>Total Submissions</h3>
                <div className="card-metric">{applications.length}</div>
                <p className="card-desc">Total applications submitted by student candidates</p>
              </div>
            </div>

            {/* Pending Approvals Table */}
            <h2 style={{ marginTop: '3rem', marginBottom: '1rem' }}>Pending Drive Approvals</h2>
            {pendingJobs.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <h3>All Caught Up!</h3>
                <p>There are no pending placement drives requiring administrative approval.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Job Title</th>
                      <th>Salary Package</th>
                      <th>Required CGPA</th>
                      <th>Recruiter</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingJobs.map(job => (
                      <tr key={job.id}>
                        <td><strong>{job.company}</strong></td>
                        <td>{job.title}</td>
                        <td>{job.package}</td>
                        <td>{job.cgpa}</td>
                        <td>{job.recruiterEmail}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              className="btn-success"
                              onClick={() => handleApprove(job.id)}
                              disabled={actionLoadingId === job.id}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn-danger"
                              onClick={() => handleReject(job.id)}
                              disabled={actionLoadingId === job.id}
                            >
                              Decline
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total System Job Drives */}
            <h2 style={{ marginTop: '3rem', marginBottom: '1rem' }}>System Recruitment Drives</h2>
            {jobs.length === 0 ? (
              <div className="empty-state">
                <p>No job drives registered in the system database.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Job Title</th>
                      <th>Salary Package</th>
                      <th>Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(job => (
                      <tr key={job.id}>
                        <td><strong>{job.company}</strong></td>
                        <td>{job.title}</td>
                        <td>{job.package}</td>
                        <td>{job.location}</td>
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
            )}
          </>
        )}
      </main>
    </div>
  );
}
