const Category = require('../models/Category');
const Task = require('../models/Task');
const { getDBStatus } = require('../config/db');

// In-memory categories store for fallback mode
const inMemoryCategories = new Map();
let mockCategoryIdCounter = 2000;

class CategoryService {
  /**
   * Get all categories for a user
   */
  async getCategories(userId) {
    const dbStatus = getDBStatus();

    if (dbStatus.isConnected) {
      return await Category.find({ user: userId }).sort({ name: 1 });
    } else {
      const results = [];
      for (const cat of inMemoryCategories.values()) {
        if (cat.user === userId || cat.user?.toString() === userId?.toString()) {
          results.push(cat);
        }
      }
      return results.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(userId, categoryId) {
    const dbStatus = getDBStatus();

    if (dbStatus.isConnected) {
      const category = await Category.findOne({ _id: categoryId, user: userId });
      if (!category) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        throw error;
      }
      return category;
    } else {
      const category = inMemoryCategories.get(categoryId);
      if (!category || (category.user !== userId && category.user?.toString() !== userId?.toString())) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        throw error;
      }
      return category;
    }
  }

  /**
   * Create a new category
   */
  async createCategory(userId, { name, description = '', color = '#3b82f6' }) {
    const trimmedName = name.trim();
    const dbStatus = getDBStatus();

    if (dbStatus.isConnected) {
      const existing = await Category.findOne({ user: userId, name: trimmedName });
      if (existing) {
        const error = new Error(`A category with the name "${trimmedName}" already exists`);
        error.statusCode = 409;
        throw error;
      }

      return await Category.create({
        name: trimmedName,
        description: description ? description.trim() : '',
        color: color || '#3b82f6',
        user: userId,
      });
    } else {
      for (const cat of inMemoryCategories.values()) {
        if (
          (cat.user === userId || cat.user?.toString() === userId?.toString()) &&
          cat.name.toLowerCase() === trimmedName.toLowerCase()
        ) {
          const error = new Error(`A category with the name "${trimmedName}" already exists`);
          error.statusCode = 409;
          throw error;
        }
      }

      const id = `cat_${++mockCategoryIdCounter}`;
      const newCategory = {
        _id: id,
        id,
        name: trimmedName,
        description: description ? description.trim() : '',
        color: color || '#3b82f6',
        user: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      inMemoryCategories.set(id, newCategory);
      return newCategory;
    }
  }

  /**
   * Update category
   */
  async updateCategory(userId, categoryId, { name, description, color }) {
    const dbStatus = getDBStatus();

    if (dbStatus.isConnected) {
      const category = await Category.findOne({ _id: categoryId, user: userId });
      if (!category) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        throw error;
      }

      if (name) {
        const trimmedName = name.trim();
        const existing = await Category.findOne({
          user: userId,
          name: trimmedName,
          _id: { $ne: categoryId },
        });
        if (existing) {
          const error = new Error(`A category with the name "${trimmedName}" already exists`);
          error.statusCode = 409;
          throw error;
        }
        category.name = trimmedName;
      }

      if (description !== undefined) {
        category.description = description.trim();
      }
      if (color) {
        category.color = color;
      }

      await category.save();
      return category;
    } else {
      const category = inMemoryCategories.get(categoryId);
      if (!category || (category.user !== userId && category.user?.toString() !== userId?.toString())) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        throw error;
      }

      if (name) {
        const trimmedName = name.trim();
        for (const cat of inMemoryCategories.values()) {
          if (
            cat.id !== categoryId &&
            (cat.user === userId || cat.user?.toString() === userId?.toString()) &&
            cat.name.toLowerCase() === trimmedName.toLowerCase()
          ) {
            const error = new Error(`A category with the name "${trimmedName}" already exists`);
            error.statusCode = 409;
            throw error;
          }
        }
        category.name = trimmedName;
      }

      if (description !== undefined) category.description = description.trim();
      if (color) category.color = color;
      category.updatedAt = new Date().toISOString();

      return category;
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(userId, categoryId) {
    const dbStatus = getDBStatus();

    if (dbStatus.isConnected) {
      const category = await Category.findOneAndDelete({ _id: categoryId, user: userId });
      if (!category) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        throw error;
      }

      // Unassign this category from existing tasks
      await Task.updateMany({ category: categoryId, user: userId }, { $set: { category: null } });

      return category;
    } else {
      const category = inMemoryCategories.get(categoryId);
      if (!category || (category.user !== userId && category.user?.toString() !== userId?.toString())) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        throw error;
      }

      inMemoryCategories.delete(categoryId);
      return category;
    }
  }
}

module.exports = {
  categoryService: new CategoryService(),
  inMemoryCategories,
};

