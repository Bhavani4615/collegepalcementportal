import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Create Axios Instance
const api = axios.create({
  baseURL: API_URL,
});

// Request Interceptor: Attach JWT Token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('placement-user'));
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global Errors (like unauthorized logouts)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized -> logout user
      localStorage.removeItem('placement-user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// 1. Authentication Services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('placement-user', JSON.stringify(response.data));
    }
    return response.data;
  },
  register: async (signUpData) => {
    const response = await api.post('/auth/signup', signUpData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('placement-user');
  },
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('placement-user'));
  }
};

// 2. Profile Services
export const profileService = {
  getStudentProfile: async () => {
    const response = await api.get('/profile/student');
    return response.data;
  },
  updateStudentProfile: async (profileData) => {
    const response = await api.post('/profile/student', profileData);
    return response.data;
  },
  getCompanyProfile: async () => {
    const response = await api.get('/profile/company');
    return response.data;
  },
  updateCompanyProfile: async (profileData) => {
    const response = await api.post('/profile/company', profileData);
    return response.data;
  },
  getAllStudents: async () => {
    const response = await api.get('/profile/students');
    return response.data;
  }
};

// 3. Job Services
export const jobService = {
  getAllJobs: async () => {
    const response = await api.get('/jobs');
    return response.data;
  },
  getApprovedJobs: async () => {
    const response = await api.get('/jobs/approved');
    return response.data;
  },
  getPostedJobs: async () => {
    const response = await api.get('/jobs/posted');
    return response.data;
  },
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },
  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
  approveJob: async (id) => {
    const response = await api.put(`/jobs/${id}/approve`);
    return response.data;
  },
  rejectJob: async (id) => {
    const response = await api.put(`/jobs/${id}/reject`);
    return response.data;
  }
};

// 4. Application Services
export const applicationService = {
  applyForJob: async (jobId) => {
    const response = await api.post(`/applications/apply/${jobId}`);
    return response.data;
  },
  getMyApplications: async () => {
    const response = await api.get('/applications/my');
    return response.data;
  },
  getJobApplications: async (jobId) => {
    const response = await api.get(`/applications/job/${jobId}`);
    return response.data;
  },
  getRecruiterApplications: async () => {
    const response = await api.get('/applications/recruiter');
    return response.data;
  },
  getAllApplications: async () => {
    const response = await api.get('/applications');
    return response.data;
  },
  shortlistApplication: async (id) => {
    const response = await api.put(`/applications/${id}/shortlist`);
    return response.data;
  },
  rejectApplication: async (id) => {
    const response = await api.put(`/applications/${id}/reject`);
    return response.data;
  },
  acceptApplication: async (id) => {
    const response = await api.put(`/applications/${id}/accept`);
    return response.data;
  }
};

// 5. Interview Services
export const interviewService = {
  scheduleInterview: async (interviewData) => {
    const response = await api.post('/interviews', interviewData);
    return response.data;
  },
  getStudentInterviews: async () => {
    const response = await api.get('/interviews/student');
    return response.data;
  },
  getRecruiterInterviews: async () => {
    const response = await api.get('/interviews/recruiter');
    return response.data;
  },
  cancelInterview: async (id) => {
    const response = await api.put(`/interviews/${id}/cancel`);
    return response.data;
  }
};

// 6. Notification Services
export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }
};

// 7. Resume Services
export const resumeService = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // contains download URI
  }
};

// 8. Analytics Services
export const analyticsService = {
  getAnalytics: async () => {
    const response = await api.get('/analytics');
    return response.data;
  }
};

export default api;
