import api from './api';

export const categoryService = {
  /**
   * Fetch all categories for the logged-in user
   */
  async getCategories() {
    return await api.get('/categories');
  },

  /**
   * Fetch a single category by ID
   */
  async getCategoryById(categoryId) {
    return await api.get(`/categories/${categoryId}`);
  },

  /**
   * Create a new category
   */
  async createCategory(categoryData) {
    return await api.post('/categories', categoryData);
  },

  /**
   * Update an existing category
   */
  async updateCategory(categoryId, categoryData) {
    return await api.put(`/categories/${categoryId}`, categoryData);
  },

  /**
   * Delete a category
   */
  async deleteCategory(categoryId) {
    return await api.delete(`/categories/${categoryId}`);
  },
};

export default categoryService;

