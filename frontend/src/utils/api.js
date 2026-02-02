import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const roadmapAPI = {
  getAll: () => api.get('/roadmaps'),
  create: (data) => api.post('/roadmaps', data),
};

export const roomAPI = {
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

export const labAPI = {
  start: (roomId) => api.post('/labs/start', null, { params: { room_id: roomId } }),
  execute: (sessionId, command) => api.post(`/labs/${sessionId}/execute`, { command }),
  stop: (sessionId) => api.post(`/labs/${sessionId}/stop`),
};

export const flagAPI = {
  submit: (roomId, flag) => api.post('/flags/submit', { flag }, { params: { room_id: roomId } }),
};

export const challengeAPI = {
  getAll: (params) => api.get('/challenges', { params }),
  execute: (data) => api.post('/challenges/execute', data),
};

export const userAPI = {
  getLeaderboard: (limit = 10) => api.get('/leaderboard', { params: { limit } }),
  getProfile: (userId) => api.get(`/profile/${userId}`),
  getProgress: () => api.get('/progress'),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getStats: () => api.get('/admin/stats'),
};

export default api;
