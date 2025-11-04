import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 또는 인증 실패
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Meetings API
export const meetingsAPI = {
  getAll: () => api.get('/meetings'),
  getById: (id) => api.get(`/meetings/${id}`),
  create: (data) => api.post('/meetings', data),
  update: (id, data) => api.put(`/meetings/${id}`, data),
  delete: (id) => api.delete(`/meetings/${id}`),
  createTask: (meetingId, data) => api.post(`/meetings/${meetingId}/tasks`, data),
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  createSubtask: (id, data) => api.post(`/tasks/${id}/subtasks`, data),
  getHierarchy: (id) => api.get(`/tasks/${id}/hierarchy`),
  updateProgress: (id, progress) => api.put(`/tasks/${id}/progress`, { progress }),
};

// Activities API
export const activitiesAPI = {
  getByTask: (taskId) => api.get(`/activities/tasks/${taskId}`),
  create: (taskId, data) => api.post(`/activities/tasks/${taskId}`, data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
};

// Organization API
export const organizationAPI = {
  getAll: () => api.get('/organization'),
  getUsers: () => api.get('/organization/users'),
  getUserTasks: (userId) => api.get(`/organization/users/${userId}/tasks`),
  updateUserOrg: (userId, data) => api.post(`/organization/users/${userId}`, data),
};

export default api;

