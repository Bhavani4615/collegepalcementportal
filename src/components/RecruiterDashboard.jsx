// src/components/RecruiterDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  jobService, 
  applicationService, 
  profileService, 
  interviewService 
} from '../api';
import './Dashboards.css';

export default function RecruiterDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('post'); // 'post' | 'applicants' | 'profile' | 'interviews'
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Profile management states
  const [companyName, setCompanyName] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Form states (Job Posting)
  const [title, setTitle] = useState('');
  const [salaryPackage, setSalaryPackage] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [deadline, setDeadline] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Interview Schedule Form states
  const [schedulingAppId, setSchedulingAppId] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await profileService.getCompanyProfile();
      setRecruiterName(data.name || '');
      setCompanyName(data.companyName || '');
      setCompanyDesc(data.description || '');
      setCompanyWebsite(data.website || '');
      setCompanyPhone(data.contactNumber || '');
    } catch (error) {
      console.error("Error fetching company profile:", error);
    }
  }, []);

  const fetchRecruiterData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch jobs posted by this recruiter
      const jobsList = await jobService.getPostedJobs();
      setJobs(jobsList);

      // 2. Fetch all application records for this recruiter's drives
      const appsList = await applicationService.getRecruiterApplications();
      setApplicants(appsList);

      // 3. Fetch interviews scheduled
      const interviewsList = await interviewService.getRecruiterInterviews();
      setInterviews(interviewsList);

      // 4. Fetch company profile details
      await fetchProfile();
    } catch (error) {
      console.error("Error fetching recruiter data:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    fetchRecruiterData();
  }, [fetchRecruiterData]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setProfileLoading(true);
    try {
      await profileService.updateCompanyProfile({
        name: recruiterName,
        companyName,
        description: companyDesc,
        website: companyWebsite,
        contactNumber: companyPhone
      });
      setProfileMsg('Recruiter profile updated successfully!');
      fetchProfile();
    } catch (error) {
      console.error(error);
      setProfileError('Failed to update recruiter profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!title || !companyName || !salaryPackage || !description) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setSubmitLoading(true);
    try {
      await jobService.createJob({
        title,
        companyName,
        salaryPackage,
        description,
        location: location || 'Remote',
        minCgpa: cgpa ? parseFloat(cgpa) : 0.0,
        deadline: deadline || null
      });

      setSuccessMsg('Job drive posted successfully! Pending TPO approval.');
      // Clear form except company name
      setTitle('');
      setSalaryPackage('');
      setDescription('');
      setLocation('');
      setCgpa('');
      setDeadline('');
      
      // Refresh jobs list
      const jobsList = await jobService.getPostedJobs();
      setJobs(jobsList);
    } catch (error) {
      console.error("Error posting job:", error);
      setErrorMsg(error.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleShortlist = async (appId) => {
    try {
      await applicationService.shortlistApplication(appId);
      window.showToast("Candidate shortlisted successfully!", "success");
      fetchRecruiterData();
    } catch (error) {
      console.error("Error shortlisting candidate:", error);
      window.showToast(error.response?.data?.message || "Failed to shortlist candidate.", "error");
    }
  };

  const handleReject = async (appId) => {
    if (!window.confirm("Are you sure you want to decline this candidate's application?")) return;
    try {
      await applicationService.rejectApplication(appId);
      window.showToast("Candidate application rejected.", "info");
      fetchRecruiterData();
    } catch (error) {
      console.error("Error rejecting candidate:", error);
      window.showToast(error.response?.data?.message || "Failed to reject candidate.", "error");
    }
  };

  const handleOffer = async (appId) => {
    if (!window.confirm("Send a formal job offer to this candidate?")) return;
    try {
      await applicationService.acceptApplication(appId);
      window.showToast("Offer sent to candidate!", "success");
      fetchRecruiterData();
    } catch (error) {
      console.error("Error offering job:", error);
      window.showToast(error.response?.data?.message || "Failed to send job offer.", "error");
    }
  };

  const handleScheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (!scheduledTime || !interviewLocation) {
      window.showToast("Please fill in scheduled time and location/medium.", "error");
      return;
    }
    setScheduleLoading(true);
    try {
      await interviewService.scheduleInterview({
        applicationId: schedulingAppId,
        scheduledTime: scheduledTime,
        location: interviewLocation,
        notes: interviewNotes
      });
      window.showToast("Interview round scheduled successfully!", "success");
      setSchedulingAppId(null);
      setScheduledTime('');
      setInterviewLocation('');
      setInterviewNotes('');
      fetchRecruiterData();
    } catch (error) {
      console.error("Error scheduling interview:", error);
      window.showToast(error.response?.data?.message || "Failed to schedule interview.", "error");
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleCancelInterview = async (interviewId) => {
    if (!window.confirm("Are you sure you want to cancel this interview?")) return;
    try {
      await interviewService.cancelInterview(interviewId);
      window.showToast("Interview cancelled successfully.", "info");
      fetchRecruiterData();
    } catch (error) {
      console.error(error);
      window.showToast("Failed to cancel interview.", "error");
    }
  };

  return (
    <div className="dashboard-wrapper">
      <main className="dashboard-main">
        <section className="welcome-banner">
          <h1>Recruiter Panel - {companyName}</h1>
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
            Applicants & Drives ({applicants.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'interviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('interviews')}
          >
            InterviewsScheduled ({interviews.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Company Profile
          </button>
        </div>

        {activeTab === 'post' && (
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
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    disabled
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
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      className="search-input"
                      placeholder="e.g. 7.5 or 0"
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
        )}

        {activeTab === 'applicants' && (
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
                          <td>{job.salaryPackage}</td>
                          <td>{job.location}</td>
                          <td>{job.minCgpa}</td>
                          <td>
                            <span className={`status-tag ${job.status.toLowerCase()}`}>
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
                          <th>Applied Email</th>
                          <th>Applied Resume</th>
                          <th>Application Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applicants.map(app => (
                          <tr key={app.id}>
                            <td><strong>{app.job.title}</strong></td>
                            <td>{app.student.name}</td>
                            <td>{app.student.email}</td>
                            <td>
                              {app.resumeUrl ? (
                                <a
                                  href={app.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="forgot-link"
                                >
                                  View PDF Resume
                                </a>
                              ) : (
                                'N/A'
                              )}
                            </td>
                            <td>
                              <span className={`status-tag ${app.status.toLowerCase()}`}>
                                {app.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {app.status === 'APPLIED' && (
                                  <>
                                    <button 
                                      onClick={() => handleShortlist(app.id)}
                                      className="btn-success"
                                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                    >
                                      Shortlist
                                    </button>
                                    <button 
                                      onClick={() => handleReject(app.id)}
                                      className="btn-danger"
                                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {app.status === 'SHORTLISTED' && (
                                  <>
                                    <button 
                                      onClick={() => setSchedulingAppId(app.id)}
                                      className="btn-primary"
                                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                    >
                                      Schedule Interview
                                    </button>
                                    <button 
                                      onClick={() => handleOffer(app.id)}
                                      className="btn-success"
                                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                    >
                                      Offer Job
                                    </button>
                                    <button 
                                      onClick={() => handleReject(app.id)}
                                      className="btn-danger"
                                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Inline Interview Scheduler Modal / Form */}
                {schedulingAppId && (
                  <div style={{
                    marginTop: '2rem',
                    padding: '2rem',
                    border: '1px solid var(--accent)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--card-bg)'
                  }}>
                    <h3>Schedule Interview for Selected Applicant</h3>
                    <form onSubmit={handleScheduleInterviewSubmit}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Interview Date & Time *</label>
                          <input 
                            type="datetime-local" 
                            className="search-input"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Location / Platform (e.g. Zoom link or Room Number) *</label>
                          <input 
                            type="text" 
                            className="search-input"
                            placeholder="Zoom ID or Campus Building Room 302"
                            value={interviewLocation}
                            onChange={(e) => setInterviewLocation(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label">Recruiter Notes / Instructions</label>
                        <textarea 
                          className="textarea-input"
                          placeholder="Instructions, round details, things to prepare..."
                          value={interviewNotes}
                          onChange={(e) => setInterviewNotes(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" className="btn-primary" disabled={scheduleLoading}>
                          {scheduleLoading ? 'Scheduling...' : 'Save Interview'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => setSchedulingAppId(null)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'interviews' && (
          <div>
            <h2>Scheduled Interview Details</h2>
            {interviews.length === 0 ? (
              <div className="empty-state">
                <h3>No Interviews Scheduled</h3>
                <p>You have not scheduled any candidate interviews yet.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Candidate Name</th>
                      <th>Job Drive Role</th>
                      <th>Interview Time</th>
                      <th>Location / Venue</th>
                      <th>Notes</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interviews.map(i => (
                      <tr key={i.id}>
                        <td><strong>{i.application.student.name}</strong></td>
                        <td>{i.application.job.title}</td>
                        <td>{new Date(i.scheduledTime).toLocaleString()}</td>
                        <td>{i.location}</td>
                        <td style={{ fontSize: '0.85rem' }}>{i.notes || 'N/A'}</td>
                        <td>
                          <span className={`status-tag ${i.status.toLowerCase()}`}>
                            {i.status}
                          </span>
                        </td>
                        <td>
                          {i.status === 'SCHEDULED' && (
                            <button 
                              onClick={() => handleCancelInterview(i.id)} 
                              className="btn-danger"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="create-drive-form">
            <h2>Company Recruiter Profile Management</h2>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text)' }}>
              Configure corporate credentials and contact coordinates for students to view.
            </p>

            {profileMsg && <div className="alert-banner success" style={{ marginBottom: '1.5rem' }}>{profileMsg}</div>}
            {profileError && <div className="alert-banner error" style={{ marginBottom: '1.5rem' }}>{profileError}</div>}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Recruiter Contact Name *</label>
                  <input
                    type="text"
                    className="search-input"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Corporate Group Name *</label>
                  <input
                    type="text"
                    className="search-input"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Official Website</label>
                  <input
                    type="url"
                    className="search-input"
                    placeholder="https://company.com"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Line</label>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="e.g. +1-800-..."
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Corporate Description</label>
                <textarea
                  className="textarea-input"
                  placeholder="Tell students about your company, core focus, and working culture..."
                  value={companyDesc}
                  onChange={(e) => setCompanyDesc(e.target.value)}
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
        )}
      </main>
    </div>
  );
}
