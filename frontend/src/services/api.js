import axios from 'axios';

// In dev without VITE_API_URL, use relative /api so Vite proxy forwards to backend (default backend port 5001)
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:5001/api');
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    try {
      // Set default Content-Type for non-FormData requests
      if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${user.token}`;
          console.log('Token added to request:', user.token.substring(0, 20) + '...');
        }
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on JWT token expiration or invalid token
    if (error.response?.status === 401 && 
        error.config?.url?.includes('/auth/') && 
        !error.config?.url?.includes('/login')) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ML API instance
const mlApi = axios.create({
  baseURL: ML_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to ML API requests
mlApi.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { mlApi };
export default api;