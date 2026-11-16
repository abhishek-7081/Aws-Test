import api from './api';

export const authService = {
  /**
   * Register a new user
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data && response.data.token) {
      localStorage.setItem('taskflow_token', response.data.token);
      localStorage.setItem('taskflow_user', JSON.stringify(response.data.user));
    }
    return response;
  },

  /**
   * Authenticate user with email and password
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data && response.data.token) {
      localStorage.setItem('taskflow_token', response.data.token);
      localStorage.setItem('taskflow_user', JSON.stringify(response.data.user));
    }
    return response;
  },

  /**
   * Get current authenticated user profile
   */
  async getMe() {
    return await api.get('/auth/me');
  },

  /**
   * Update authenticated user profile
   */
  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    if (response.data) {
      localStorage.setItem('taskflow_user', JSON.stringify(response.data));
    }
    return response;
  },

  /**
   * Log out current user
   */
  logout() {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
  },

  /**
   * Get currently cached user from local storage
   */
  getCurrentUser() {
    try {
      const user = localStorage.getItem('taskflow_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if a token exists in local storage
   */
  getToken() {
    return localStorage.getItem('taskflow_token');
  },
};

export default authService;
