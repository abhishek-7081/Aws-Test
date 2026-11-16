const Task = require('../models/Task');
const Category = require('../models/Category');
const { getDBStatus } = require('../config/db');
const { inMemoryTasks } = require('./taskService');
const { inMemoryCategories } = require('./categoryService');

class DashboardService {
  /**
   * Get analytical overview for the user's dashboard
   */
  async getDashboardStats(userId) {
    const dbStatus = getDBStatus();
    const now = new Date();

    if (dbStatus.isConnected) {
      const [
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        priorityCounts,
        recentTasks,
        categories,
      ] = await Promise.all([
        Task.countDocuments({ user: userId }),
        Task.countDocuments({ user: userId, status: 'pending' }),
        Task.countDocuments({ user: userId, status: 'in_progress' }),
        Task.countDocuments({ user: userId, status: 'completed' }),
        Task.countDocuments({
          user: userId,
          status: { $ne: 'completed' },
          dueDate: { $lt: now, $ne: null },
        }),
        Task.aggregate([
          { $match: { user: userId } },
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]),
        Task.find({ user: userId })
          .populate('category', 'name color')
          .sort({ updatedAt: -1 })
          .limit(5),
        Category.find({ user: userId }),
      ]);

      const priorityMap = { low: 0, medium: 0, high: 0, urgent: 0 };
      priorityCounts.forEach((item) => {
        if (priorityMap[item._id] !== undefined) {
          priorityMap[item._id] = item.count;
        }
      });

      // Category counts
      const categoryStats = await Promise.all(
        categories.map(async (cat) => {
          const count = await Task.countDocuments({ user: userId, category: cat._id });
          return {
            id: cat._id.toString(),
            name: cat.name,
            color: cat.color,
            taskCount: count,
          };
        })
      );

      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        summary: {
          total: totalTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completed: completedTasks,
          overdue: overdueTasks,
          completionRate,
        },
        priorities: priorityMap,
        categories: categoryStats,
        recentTasks,
      };
    } else {
      // In-memory calculation
      const userTasks = [];
      for (const t of inMemoryTasks.values()) {
        if (t.user === userId || t.user?.toString() === userId?.toString()) {
          userTasks.push(t);
        }
      }

      const total = userTasks.length;
      let pending = 0;
      let inProgress = 0;
      let completed = 0;
      let overdue = 0;
      const priorities = { low: 0, medium: 0, high: 0, urgent: 0 };

      userTasks.forEach((t) => {
        if (t.status === 'pending') pending++;
        else if (t.status === 'in_progress') inProgress++;
        else if (t.status === 'completed') completed++;

        if (t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now) {
          overdue++;
        }

        if (priorities[t.priority] !== undefined) {
          priorities[t.priority]++;
        }
      });

      const userCategories = [];
      for (const c of inMemoryCategories.values()) {
        if (c.user === userId || c.user?.toString() === userId?.toString()) {
          userCategories.push(c);
        }
      }

      const categoryStats = userCategories.map((cat) => {
        const catId = cat.id || cat._id;
        const count = userTasks.filter((t) => {
          const tCatId = t.category?._id || t.category?.id || t.category;
          return tCatId === catId;
        }).length;
        return {
          id: catId,
          name: cat.name,
          color: cat.color,
          taskCount: count,
        };
      });

      const recentTasks = [...userTasks]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 5);

      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        summary: {
          total,
          pending,
          inProgress,
          completed,
          overdue,
          completionRate,
        },
        priorities,
        categories: categoryStats,
        recentTasks,
      };
    }
  }
}

module.exports = new DashboardService();
