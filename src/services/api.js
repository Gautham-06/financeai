import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export const documents = {
  upload: (type, file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('metadata', JSON.stringify(metadata));
    
    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getByType: (type) => api.get(`/documents/${type}`),
  getById: (id) => api.get(`/documents/document/${id}`),
  update: (id, data) => api.patch(`/documents/document/${id}`, data),
  delete: (id) => api.delete(`/documents/document/${id}`),
};

export default api; 