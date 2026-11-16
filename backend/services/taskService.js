const Task = require('../models/Task');
const { getDBStatus } = require('../config/db');
const { inMemoryCategories } = require('./categoryService');

// In-memory tasks store for fallback mode
const inMemoryTasks = new Map();
let mockTaskIdCounter = 3000;

class TaskService {
  /**
   * Get all tasks with filtering, search, sorting, and pagination
   */
  async getTasks(userId, queryParams = {}) {
    const {
      search,
      status,
      priority,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = queryParams;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;
    const dbStatus = getDBStatus();

    if (dbStatus.isConnected) {
      // Build Mongoose query
      const filter = { user: userId };

      if (status && status !== 'all') {
        filter.status = status;
      }

      if (priority && priority !== 'all') {
        filter.priority = priority;
      }

      if (category && category !== 'all') {
        if (category === 'uncategorized') {
          filter.category = null;
        } else {
          filter.category = category;
        }
      }

      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        filter.$or = [{ title: searchRegex }, { description: searchRegex }];
      }

      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      const sortOptions = {};
      sortOptions[sortBy] = sortDirection;

      const [tasks, total] = await Promise.all([
        Task.find(filter)
          .populate('category', 'name color')
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum),
        Task.countDocuments(filter),
      ]);

      return {
        tasks,
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
          hasNextPage: pageNum * limitNum < total,
          hasPrevPage: pageNum > 1,
        },
      };
    } else {
      // In-memory fallback querying
      let items = [];
      for (const t of inMemoryTasks.values()) {
        if (t.user === userId || t.user?.toString() === userId?.toString()) {
          items.push({ ...t });
        }
      }

      if (status && status !== 'all') {
        items = items.filter((item) => item.status === status);
      }

      if (priority && priority !== 'all') {
        items = items.filter((item) => item.priority === priority);
      }

      if (category && category !== 'all') {
        if (category === 'uncategorized') {
          items = items.filter((item) => !item.category);
        } else {
          items = items.filter(
            (item) => item.category === category || item.category?._id === category || item.category?.id === category
          );
        }
      }

      if (search && search.trim()) {
        const query = search.trim().toLowerCase();
        items = items.filter(
          (item) =>
            (item.title && item.title.toLowerCase().includes(query)) ||
            (item.description && item.description.toLowerCase().includes(query))
        );
      }

      // Populate category details
      items = items.map((task) => {
        let catObj = null;
        if (task.category) {
          const catId = typeof task.category === 'object' ? (task.category._id || task.category.id) : task.category;
          const found = inMemoryCategories.get(catId);
          if (found) {
            catObj = { _id: found.id || found._id, name: found.name, color: found.color };
          }
        }
        return { ...task, category: catObj };
      });

      // Sort
      const direction = sortOrder === 'asc' ? 1 : -1;
      items.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === 'dueDate') {
          valA = valA ? new Date(valA).getTime() : Infinity;
          valB = valB ? new Date(valB).getTime() : Infinity;
        } else if (typeof valA === 'string') {
          return direction * valA.localeCompare(valB || '');
        }

        if (valA < valB) return -1 * direction;
        if (valA > valB) return 1 * direction;
        return 0;
      });

      const total = items.length;
      const paginatedTasks = items.slice(skip, skip + limitNum);

      return {
        tasks: paginatedTasks,
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
          hasNextPage: pageNum * limitNum < total,
          hasPrevPage: pageNum > 1,
        },
      };
    }
  }

  /**
   * Get single task by ID
   */
  async getTaskById(userId, taskId) {
    const dbStatus = getDBStatus();

    if (dbStatus.isConnected) {
      const task = await Task.findOne({ _id: taskId, user: userId }).populate('category', 'name color');
      if (!task) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }
      return task;
    } else {
      const task = inMemoryTasks.get(taskId);
      if (!task || (task.user !== userId && task.user?.toString() !== userId?.toString())) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }

      let catObj = null;
      if (task.category) {
        const catId = typeof task.category === 'object' ? (task.category._id || task.category.id) : task.category;
        const found = inMemoryCategories.get(catId);
        if (found) {
          catObj = { _id: found.id || found._id, name: found.name, color: found.color };
        }
      }

      return { ...task, category: catObj };
    }
  }

  /**
   * Create a new task
   */
  async createTask(userId, { title, description = '', status = 'pending', priority = 'medium', dueDate = null, category = null }) {
    const dbStatus = getDBStatus();

    if (dbStatus.isConnected) {
      const task = await Task.create({
        title: title.trim(),
        description: description ? description.trim() : '',
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        category: category || null,
        user: userId,
      });

      return await Task.findById(task._id).populate('category', 'name color');
    } else {
      const id = `task_${++mockTaskIdCounter}`;
      const now = new Date().toISOString();

      let catObj = null;
      if (category) {
        const found = inMemoryCategories.get(category);
        if (found) {
          catObj = { _id: found.id || found._id, name: found.name, color: found.color };
        }
      }

      const newTask = {
        _id: id,
        id,
        title: title.trim(),
        description: description ? description.trim() : '',
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        category: catObj,
        user: userId,
        createdAt: now,
        updatedAt: now,
      };

      inMemoryTasks.set(id, newTask);
      return newTask;
    }
  }

  /**
   * Update existing task
   */
  async updateTask(userId, taskId, updateData) {
    const dbStatus = getDBStatus();

    if (dbStatus.isConnected) {
      const task = await Task.findOne({ _id: taskId, user: userId });
      if (!task) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }

      if (updateData.title !== undefined) task.title = updateData.title.trim();
      if (updateData.description !== undefined) task.description = updateData.description.trim();
      if (updateData.status !== undefined) task.status = updateData.status;
      if (updateData.priority !== undefined) task.priority = updateData.priority;
      if (updateData.dueDate !== undefined) {
        task.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
      }
      if (updateData.category !== undefined) {
        task.category = updateData.category || null;
      }

      await task.save();
      return await Task.findById(taskId).populate('category', 'name color');
    } else {
      const task = inMemoryTasks.get(taskId);
      if (!task || (task.user !== userId && task.user?.toString() !== userId?.toString())) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }

      if (updateData.title !== undefined) task.title = updateData.title.trim();
      if (updateData.description !== undefined) task.description = updateData.description.trim();
      if (updateData.status !== undefined) task.status = updateData.status;
      if (updateData.priority !== undefined) task.priority = updateData.priority;
      if (updateData.dueDate !== undefined) {
        task.dueDate = updateData.dueDate ? new Date(updateData.dueDate).toISOString() : null;
      }
      if (updateData.category !== undefined) {
        let catObj = null;
        if (updateData.category) {
          const found = inMemoryCategories.get(updateData.category);
          if (found) {
            catObj = { _id: found.id || found._id, name: found.name, color: found.color };
          }
        }
        task.category = catObj;
      }
      task.updatedAt = new Date().toISOString();

      return task;
    }
  }

  /**
   * Delete task
   */
  async deleteTask(userId, taskId) {
    const dbStatus = getDBStatus();

    if (dbStatus.isConnected) {
      const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
      if (!task) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }
      return task;
    } else {
      const task = inMemoryTasks.get(taskId);
      if (!task || (task.user !== userId && task.user?.toString() !== userId?.toString())) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }
      inMemoryTasks.delete(taskId);
      return task;
    }
  }

  /**
   * Toggle task status (e.g. pending -> completed)
   */
  async toggleTaskStatus(userId, taskId, newStatus) {
    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (!validStatuses.includes(newStatus)) {
      const error = new Error(`Invalid status: ${newStatus}`);
      error.statusCode = 400;
      throw error;
    }

    return await this.updateTask(userId, taskId, { status: newStatus });
  }
}

module.exports = {
  taskService: new TaskService(),
  inMemoryTasks,
};

