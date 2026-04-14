import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login page (avoid infinite loop)
      const isLoginPage = window.location.pathname === '/login';
      if (!isLoginPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Topic APIs
export const topicAPI = {
  getAll: (params) => api.get('/topics', { params }),
  getProgress: () => api.get('/topics/progress'),
  create: (data) => api.post('/topics', data),
  update: (id, data) => api.put(`/topics/${id}`, data),
  toggleComplete: (id) => api.put(`/topics/${id}/complete`),
  delete: (id) => api.delete(`/topics/${id}`),
};

// Interview APIs
export const interviewAPI = {
  getAll: (params) => api.get('/interviews', { params }),
  getOne: (id) => api.get(`/interviews/${id}`),
  create: (data) => api.post('/interviews', data),
  delete: (id) => api.delete(`/interviews/${id}`),
  update: (id, data) => api.put(`/interviews/${id}`, data),
  getReadiness: () => api.get('/interviews/readiness'),
  getHistory: (params) => api.get('/interviews/history', { params }),
  getPredict: () => api.get('/interviews/predict'),
};

// Resume APIs
export const resumeAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  get: () => api.get('/resume'),
};

// Mock Interview APIs
export const mockInterviewAPI = {
  start: (data) => api.post('/mock-interview/start', data),
  submitAnswer: (data) => api.post('/mock-interview/answer', data),
  complete: (sessionId) => api.post('/mock-interview/complete', { sessionId }),
  getReport: (sessionId) => api.get(`/mock-interview/report/${sessionId}`),
  getHistory: (params) => api.get('/mock-interview/history', { params }),
  getAnalytics: (params) => api.get('/mock-interview/analytics', { params }),
  uploadJD: (file) => {
    const formData = new FormData();
    formData.append('jd_file', file);
    return api.post('/mock-interview/upload-jd', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getSkillGaps: (params) => api.get('/mock-interview/skill-gaps', { params }),
};

// Get token helper
const getToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('User not logged in');
  return token;
};

// Create Interview
export const createInterview = async (data) => {
  const token = await getToken();

  const res = await fetch('https://interview-prep-backend-0d28.onrender.com/api/interviews/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

// Get Interviews
export const getInterviews = async () => {
  await getToken();

  const res = await fetch('https://interview-prep-backend-0d28.onrender.com/api/interviews', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  return res.json();
};

// Update Interview
export const updateInterview = async (id, data) => {
  const token = await getToken();

  const res = await fetch(`https://interview-prep-backend-0d28.onrender.com/api/interviews/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

// Delete Interview
export const deleteInterview = async (id) => {
  const token = await getToken();

  await fetch(`https://interview-prep-backend-0d28.onrender.com/api/interviews/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const saveAnswer = async (data) => {
  const token = await getToken();

  const res = await fetch('https://interview-prep-backend-0d28.onrender.com/api/mock/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

export default api;
