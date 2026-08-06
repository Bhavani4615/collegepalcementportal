// src/components/TpoDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { jobService, analyticsService, profileService, applicationService } from '../api';
import './Dashboards.css';

export default function TpoDashboard() {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'pending' | 'drives' | 'students'
  const [jobs, setJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  // Search states
  const [studentSearch, setStudentSearch] = useState('');

  // Pagination states
  const [studentPage, setStudentPage] = useState(1);
  const studentPageSize = 5;

  useEffect(() => {
    setStudentPage(1);
  }, [studentSearch]);

  const fetchTpoData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch all job postings
      const jobsList = await jobService.getAllJobs();
      setJobs(jobsList);

      // 2. Fetch dashboard analytics
      const stats = await analyticsService.getAnalytics();
      setAnalytics(stats);

      // 3. Fetch registered students list
      const studentsList = await profileService.getAllStudents();
      setStudents(studentsList);

      // 4. Fetch all application records for charts calculation
      const appsList = await applicationService.getAllApplications();
      setApplications(appsList);
    } catch (error) {
      console.error("Error fetching TPO administrative statistics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTpoData();
  }, [fetchTpoData]);

  const handleApprove = async (jobId) => {
    setActionLoadingId(jobId);
    try {
      await jobService.approveJob(jobId);
      window.showToast("Job drive approved successfully!", "success");
      fetchTpoData();
    } catch (error) {
      console.error("Error approving job:", error);
      window.showToast("Failed to approve drive.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (jobId) => {
    if (!window.confirm("Are you sure you want to decline this job placement drive?")) return;
    setActionLoadingId(jobId);
    try {
      await jobService.rejectJob(jobId);
      window.showToast("Job drive declined successfully.", "success");
      fetchTpoData();
    } catch (error) {
      console.error("Error declining job:", error);
      window.showToast("Failed to decline drive.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingJobs = jobs.filter(job => job.status === 'PENDING');
  const approvedJobs = jobs.filter(job => job.status === 'APPROVED');
  const rejectedJobsCount = jobs.filter(job => job.status === 'REJECTED').length;

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (student.branch && student.branch.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const paginatedStudents = filteredStudents.slice((studentPage - 1) * studentPageSize, studentPage * studentPageSize);

  // Compute application stats for the outcome chart
  const appliedCount = applications.filter(a => a.status === 'APPLIED').length;
  const shortlistedCount = applications.filter(a => a.status === 'SHORTLISTED').length;
  const rejectedAppsCount = applications.filter(a => a.status === 'REJECTED').length;
  const acceptedCount = applications.filter(a => a.status === 'ACCEPTED').length;
  const totalApps = applications.length;

  // Calculate percentages safely
  const getPercent = (count) => {
    if (totalApps === 0) return 0;
    return Math.round((count / totalApps) * 100);
  };

  return (
    <div className="dashboard-wrapper">
      <main className="dashboard-main">
        <section className="welcome-banner">
          <h1>TPO Administrative Panel</h1>
          <p>Supervise recruiter postings, track campus statistics, and manage corporate relations.</p>
        </section>

        {/* Tab Bar for Admin actions */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Dashboard Analytics
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approvals ({pendingJobs.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'drives' ? 'active' : ''}`}
            onClick={() => setActiveTab('drives')}
          >
            Active Drives ({approvedJobs.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Registered Students ({students.length})
          </button>
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
            <p>Loading administrative dashboard data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'analytics' && analytics && (
              <>
                {/* Stats Metrics Grid */}
                <div className="dashboard-grid">
                  <div className="dashboard-card">
                    <h3>Active Drives</h3>
                    <div className="card-metric">{analytics.approvedJobs}</div>
                    <p className="card-desc">Approved recruitment drives live on the student board</p>
                  </div>

                  <div className="dashboard-card">
                    <h3>Pending Approvals</h3>
                    <div className="card-metric" style={{ color: '#f59e0b' }}>{analytics.pendingJobs}</div>
                    <p className="card-desc">Corporate job drives waiting for administrative review</p>
                  </div>

                  <div className="dashboard-card">
                    <h3>Total Applications</h3>
                    <div className="card-metric">{analytics.totalApplications}</div>
                    <p className="card-desc">Total applications submitted by student candidates</p>
                  </div>

                  <div className="dashboard-card">
                    <h3>Registered Students</h3>
                    <div className="card-metric">{analytics.totalStudents}</div>
                    <p className="card-desc">Total student accounts active on placement board</p>
                  </div>
                </div>

                {/* Dashboard Charts Division */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', marginTop: '2.5rem' }}>
                  
                  {/* Chart 1: Recruitment Drives Distribution */}
                  <div className="create-drive-form" style={{ margin: 0 }}>
                    <h3>Corporate Job Drives Overview</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', marginBottom: '1.5rem' }}>
                      Breakdown of recruiters postings by approval status
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '180px', paddingTop: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      {/* Bar 1: Approved */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '22%' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>{analytics.approvedJobs}</div>
                        <div style={{
                          width: '100%',
                          height: `${Math.max((analytics.approvedJobs / Math.max(jobs.length, 1)) * 120, 10)}px`,
                          backgroundColor: '#10b981',
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.5s ease-out'
                        }}></div>
                        <span style={{ fontSize: '0.75rem', marginTop: '8px', color: 'var(--text)', fontWeight: '600' }}>Active</span>
                      </div>

                      {/* Bar 2: Pending */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '22%' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>{analytics.pendingJobs}</div>
                        <div style={{
                          width: '100%',
                          height: `${Math.max((analytics.pendingJobs / Math.max(jobs.length, 1)) * 120, 10)}px`,
                          backgroundColor: '#f59e0b',
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.5s ease-out'
                        }}></div>
                        <span style={{ fontSize: '0.75rem', marginTop: '8px', color: 'var(--text)', fontWeight: '600' }}>Pending</span>
                      </div>

                      {/* Bar 3: Rejected */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '22%' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>{rejectedJobsCount}</div>
                        <div style={{
                          width: '100%',
                          height: `${Math.max((rejectedJobsCount / Math.max(jobs.length, 1)) * 120, 10)}px`,
                          backgroundColor: '#ef4444',
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.5s ease-out'
                        }}></div>
                        <span style={{ fontSize: '0.75rem', marginTop: '8px', color: 'var(--text)', fontWeight: '600' }}>Declined</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart 2: Student Application Outcomes */}
                  <div className="create-drive-form" style={{ margin: 0 }}>
                    <h3>Candidate Application Outcomes</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', marginBottom: '1.5rem' }}>
                      Distribution of applicant stages ({totalApps} total submissions)
                    </p>
                    
                    {totalApps === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text)' }}>
                        No applications submitted yet to map statistics.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
                        {/* Offered Status */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                            <span><strong>Offers Received</strong></span>
                            <span>{acceptedCount} ({getPercent(acceptedCount)}%)</span>
                          </div>
                          <div style={{ height: '10px', background: 'var(--border)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${getPercent(acceptedCount)}%`, background: '#10b981', transition: 'width 0.5s' }}></div>
                          </div>
                        </div>

                        {/* Shortlisted Status */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                            <span><strong>Shortlisted for Interviews</strong></span>
                            <span>{shortlistedCount} ({getPercent(shortlistedCount)}%)</span>
                          </div>
                          <div style={{ height: '10px', background: 'var(--border)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${getPercent(shortlistedCount)}%`, background: '#6366f1', transition: 'width 0.5s' }}></div>
                          </div>
                        </div>

                        {/* Applied Status */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                            <span><strong>Pending Screening</strong></span>
                            <span>{appliedCount} ({getPercent(appliedCount)}%)</span>
                          </div>
                          <div style={{ height: '10px', background: 'var(--border)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${getPercent(appliedCount)}%`, background: '#f59e0b', transition: 'width 0.5s' }}></div>
                          </div>
                        </div>

                        {/* Rejected Status */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                            <span><strong>Declined / Rejected</strong></span>
                            <span>{rejectedAppsCount} ({getPercent(rejectedAppsCount)}%)</span>
                          </div>
                          <div style={{ height: '10px', background: 'var(--border)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${getPercent(rejectedAppsCount)}%`, background: '#ef4444', transition: 'width 0.5s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Additional Quick Stats Card */}
                <div className="create-drive-form" style={{ marginTop: '2.5rem' }}>
                  <h3>Placement Operations Center Summary</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h4 style={{ margin: 0, color: 'gray' }}>Corporate Partners</h4>
                      <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>{analytics.totalCompanies}</span>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text)' }}>Verified recruiter accounts</p>
                    </div>
                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h4 style={{ margin: 0, color: 'gray' }}>Total Interviews Scheduled</h4>
                      <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>{analytics.totalInterviews}</span>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text)' }}>Recruitment rounds scheduled</p>
                    </div>
                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h4 style={{ margin: 0, color: 'gray' }}>Placement Success Rate (Est.)</h4>
                      <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>
                        {analytics.totalStudents > 0 
                          ? `${Math.round((analytics.totalApplications / analytics.totalStudents) * 100)}%` 
                          : '0%'}
                      </span>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text)' }}>Applications submitted per student</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'pending' && (
              <>
                <h2 style={{ marginBottom: '1.5rem' }}>Pending Drive Approvals</h2>
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
                          <th>Location</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingJobs.map(job => (
                          <tr key={job.id}>
                            <td><strong>{job.companyName}</strong></td>
                            <td>{job.title}</td>
                            <td>{job.salaryPackage}</td>
                            <td>{job.minCgpa}</td>
                            <td>{job.location}</td>
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
              </>
            )}

            {activeTab === 'drives' && (
              <>
                <h2 style={{ marginBottom: '1.5rem' }}>Active System Recruitment Drives</h2>
                {approvedJobs.length === 0 ? (
                  <div className="empty-state">
                    <h3>No Active Drives</h3>
                    <p>No job drives are currently active. Verify pending requests to approve drives.</p>
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
                          <th>Eligibility CGPA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvedJobs.map(job => (
                          <tr key={job.id}>
                            <td><strong>{job.companyName}</strong></td>
                            <td>{job.title}</td>
                            <td>{job.salaryPackage}</td>
                            <td>{job.location}</td>
                            <td>{job.minCgpa}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {activeTab === 'students' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2>Registered Student Profiles Directory</h2>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search students by name or branch..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    style={{ maxWidth: '300px', margin: 0 }}
                  />
                </div>
                {filteredStudents.length === 0 ? (
                  <div className="empty-state">
                    <h3>No Students Registered</h3>
                    <p>No student accounts match the search parameters or are registered in the system database.</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Branch / Major</th>
                          <th>CGPA</th>
                          <th>Contact Details</th>
                          <th>Skills Summary</th>
                          <th>Resume Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedStudents.map((s, index) => (
                          <tr key={index}>
                            <td><strong>{s.name}</strong></td>
                            <td>{s.branch || 'N/A'}</td>
                            <td>{s.cgpa !== undefined ? s.cgpa.toFixed(2) : 'N/A'}</td>
                            <td>{s.phoneNumber || 'N/A'}</td>
                            <td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>{s.skills || 'N/A'}</td>
                            <td>
                              {s.resumeUrl ? (
                                <a
                                  href={s.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="forgot-link"
                                >
                                  Download Resume
                                </a>
                              ) : (
                                'N/A'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Pagination Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                      <button 
                        type="button"
                        onClick={() => setStudentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={studentPage === 1}
                        className="btn-secondary"
                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                      >
                        Previous
                      </button>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: '600' }}>
                        Page {studentPage} of {Math.max(Math.ceil(filteredStudents.length / studentPageSize), 1)}
                      </span>
                      <button 
                        type="button"
                        onClick={() => setStudentPage(prev => Math.min(prev + 1, Math.ceil(filteredStudents.length / studentPageSize)))} 
                        disabled={studentPage * studentPageSize >= filteredStudents.length}
                        className="btn-secondary"
                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
