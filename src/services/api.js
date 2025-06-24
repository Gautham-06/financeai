import axios from "axios";

const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getCurrentUser: () => api.get("/auth/me"),
};

export const documents = {
  upload: async (type, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_type", type);

      const response = await api.post("/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.error(`Error uploading ${type} file:`, error);
      throw error;
    }
  },
  link: async () => {
    try {
      const response = await api.post("/link/");
      return response;
    } catch (error) {
      console.error("Error linking records:", error);
      throw error;
    }
  },
  search: async (params) => {
    try {
      const response = await api.get("/search/", { params });
      return response;
    } catch (error) {
      console.error("Error searching records:", error);
      throw error;
    }
  },
  getByType: (type) => api.get(`/documents/${type}`),
  getById: (id) => api.get(`/documents/document/${id}`),
  update: (id, data) => api.patch(`/documents/document/${id}`, data),
  delete: (id) => api.delete(`/documents/document/${id}`),
};

export default api;
