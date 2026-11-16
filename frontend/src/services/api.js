import axios from 'axios';

// Determine the base API URL
// In development, the Vite proxy handles /api, or falls back to VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle centralized error extraction
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Extract formatted message from API response or fall back to generic network error
    let message = 'An unexpected error occurred. Please try again.';
    let validationErrors = null;

    if (error.response) {
      if (error.response.status === 401) {
        // Clear expired or invalid session credentials
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
        // If not already on login/register page, trigger redirect
        if (
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')
        ) {
          window.location.href = '/login?expired=true';
        }
      }

      if (error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }
      if (error.response.data && error.response.data.errors) {
        validationErrors = error.response.data.errors;
      }
    } else if (error.request) {
      message = 'Cannot connect to backend server. Please verify the server is running.';
    }

    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.errors = validationErrors;
    return Promise.reject(enhancedError);
  }
);

export default api;
