import axios from 'axios';

// In dev without VITE_API_URL, use relative /api so Vite proxy forwards to backend (default backend port 5001)
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:5001/api');
// The ML service runs on its own port (default 5002); never default it to the backend port.
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:5002/api';

// Safely read the persisted auth token without throwing on corrupt storage.
const getStoredToken = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user && user.token ? user.token : null;
  } catch (error) {
    return null;
  }
};

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Set default Content-Type for non-FormData requests
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    const token = getStoredToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    // Log out on any 401 except the login/register attempts themselves
    // (those surface an error message to the form instead of redirecting).
    const isAuthAttempt = url.includes('/login') || url.includes('/register');
    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
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
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { mlApi };
export default api;