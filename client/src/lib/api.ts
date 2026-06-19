import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh-token`, { refreshToken });
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  profile: () => api.get('/auth/profile'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) => api.post('/auth/reset-password', data),
};

// Tickets
export const ticketsAPI = {
  list: (params?: any) => api.get('/tickets', { params }),
  get: (id: string) => api.get(`/tickets/${id}`),
  create: (data: FormData) => api.post('/tickets', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: any) => api.patch(`/tickets/${id}`, data),
  delete: (id: string) => api.delete(`/tickets/${id}`),
  stats: () => api.get('/tickets/stats'),
  checkDuplicates: (data: { title: string; description: string }) => api.post('/tickets/check-duplicates', data),
  uploadAttachment: (id: string, file: FormData) => api.post(`/tickets/${id}/attachments`, file, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Comments
export const commentsAPI = {
  list: (ticketId: string) => api.get(`/comments/${ticketId}`),
  create: (ticketId: string, data: any) => api.post(`/comments/${ticketId}`, data),
  delete: (ticketId: string, id: string) => api.delete(`/comments/${ticketId}/${id}`),
};

// AI
export const aiAPI = {
  summary: (ticketId: string) => api.get(`/ai/tickets/${ticketId}/summary`),
  generateResponse: (ticketId: string) => api.get(`/ai/tickets/${ticketId}/response`),
  rootCause: (ticketId: string) => api.get(`/ai/tickets/${ticketId}/root-cause`),
  escalation: (ticketId: string) => api.get(`/ai/tickets/${ticketId}/escalation`),
  similar: (ticketId: string) => api.get(`/ai/tickets/${ticketId}/similar`),
  copilot: (data: { action: string; input: string; context?: string }) => api.post('/ai/copilot', data),
  insights: () => api.get('/ai/insights'),
  rag: (question: string) => api.post('/ai/rag', { question }),
};

// Notifications
export const notificationsAPI = {
  list: (params?: any) => api.get('/notifications', { params }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// Knowledge
export const knowledgeAPI = {
  list: (params?: any) => api.get('/knowledge', { params }),
  get: (id: string) => api.get(`/knowledge/${id}`),
  upload: (data: FormData) => api.post('/knowledge/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/knowledge/${id}`),
  reindex: (id: string) => api.post(`/knowledge/${id}/reindex`),
  query: (question: string) => api.post('/knowledge/query', { question }),
};

// Users
export const usersAPI = {
  list: (params?: any) => api.get('/users', { params }),
  get: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  agents: () => api.get('/users/agents'),
};

// Analytics
export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard'),
  auditLogs: (params?: any) => api.get('/analytics/audit-logs', { params }),
};

// Search
export const searchAPI = {
  search: (q: string) => api.get('/search', { params: { q } }),
};
