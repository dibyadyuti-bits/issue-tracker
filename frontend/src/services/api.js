// API Service for making HTTP requests
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Services
export const authService = {
  register: (name, email, password) => 
    apiClient.post('/auth/register', { name, email, password }),
  
  login: (email, password) => 
    apiClient.post('/auth/login', { email, password })
};

// Issue Services
export const issueService = {
  getAllIssues: () => apiClient.get('/issues'),
  getIssueById: (id) => apiClient.get(`/issues/${id}`),
  createIssue: (issueData) => apiClient.post('/issues', issueData),
  updateIssue: (id, issueData) => apiClient.put(`/issues/${id}`, issueData),
  deleteIssue: (id) => apiClient.delete(`/issues/${id}`)
};

// Comment Services
export const commentService = {
  getComments: (issueId) => apiClient.get(`/comments/issue/${issueId}`),
  addComment: (issueId, text) => apiClient.post(`/comments/issue/${issueId}`, { text }),
  deleteComment: (id) => apiClient.delete(`/comments/${id}`)
};

export default apiClient;
