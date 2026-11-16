import api from './api';

export const taskService = {
  /**
   * Fetch all tasks with optional query filters and pagination
   */
  async getTasks(params = {}) {
    return await api.get('/tasks', { params });
  },

  /**
   * Fetch a single task by its ID
   */
  async getTaskById(taskId) {
    return await api.get(`/tasks/${taskId}`);
  },

  /**
   * Create a new task
   */
  async createTask(taskData) {
    return await api.post('/tasks', taskData);
  },

  /**
   * Update an existing task
   */
  async updateTask(taskId, taskData) {
    return await api.put(`/tasks/${taskId}`, taskData);
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId) {
    return await api.delete(`/tasks/${taskId}`);
  },

  /**
   * Toggle task status (e.g. pending, in_progress, completed)
   */
  async toggleTaskStatus(taskId, status) {
    return await api.patch(`/tasks/${taskId}/status`, { status });
  },
};

export default taskService;

