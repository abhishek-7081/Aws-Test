import api from './api';

export const dashboardService = {
  /**
   * Fetch analytical statistics, counts, priorities, and recent tasks
   */
  async getStats() {
    return await api.get('/dashboard/stats');
  },
};

export default dashboardService;

