import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import dashboardService from '../services/dashboardService';
import taskService from '../services/taskService';
import categoryService from '../services/categoryService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TaskCard from '../components/tasks/TaskCard';
import TaskFormModal from '../components/tasks/TaskFormModal';
import CategoryModal from '../components/categories/CategoryModal';

const DashboardPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, categoriesRes] = await Promise.all([
        dashboardService.getStats(),
        categoryService.getCategories(),
      ]);
      setStats(statsRes.data);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      error(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleToggleTaskStatus = async (taskId, nextStatus) => {
    try {
      await taskService.toggleTaskStatus(taskId, nextStatus);
      success(`Task updated to ${nextStatus.replace('_', ' ')}`);
      fetchDashboardData();
    } catch (err) {
      error(err.message || 'Could not update task status');
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      setIsSubmitting(true);
      await taskService.createTask(taskData);
      success('Task created successfully');
      setIsTaskModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      error(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCategory = async (catData) => {
    try {
      setIsSubmitting(true);
      await categoryService.createCategory(catData);
      success('Category created successfully');
      setIsCategoryModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      error(err.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !stats) {
    return <LoadingSpinner fullPage message="Loading your dashboard insights..." />;
  }

  const summary = stats?.summary || {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    completionRate: 0,
  };

  const priorities = stats?.priorities || { low: 0, medium: 0, high: 0, urgent: 0 };
  const recentTasks = stats?.recentTasks || [];
  const categoryStats = stats?.categories || [];

  return (
    <div className="container py-4">
      {/* Header & Quick Action Buttons */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Welcome back, {user?.name || 'User'}!</h3>
          <p className="text-muted small m-0">
            Here is an overview of your productivity, pending actions, and active projects.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="tf-btn tf-btn-secondary tf-btn-sm"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            + New Category
          </button>
          <button
            type="button"
            className="tf-btn tf-btn-primary tf-btn-sm"
            onClick={() => {
              setSelectedTask(null);
              setIsTaskModalOpen(true);
            }}
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="small text-muted fw-medium">Total Tasks</div>
              <h3 className="fw-bold my-1">{summary.total}</h3>
              <div className="small text-muted">{summary.completionRate}% completed</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: 'var(--primary)' }}>
              📋
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="small text-muted fw-medium">In Progress</div>
              <h3 className="fw-bold my-1 text-primary">{summary.inProgress}</h3>
              <div className="small text-muted">Currently active</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              ⚡
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="small text-muted fw-medium">Completed</div>
              <h3 className="fw-bold my-1 text-success">{summary.completed}</h3>
              <div className="small text-muted">Finished goals</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: 'var(--success)' }}>
              ✅
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="small text-muted fw-medium">Overdue</div>
              <h3 className="fw-bold my-1 text-danger">{summary.overdue}</h3>
              <div className="small text-muted">Requires attention</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: 'var(--danger)' }}>
              ⏰
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Priority Breakdown */}
      <div className="row g-3 mb-4">
        {/* Completion Progress Bar */}
        <div className="col-12 col-lg-6">
          <div className="tf-card p-3 h-100">
            <h6 className="fw-bold mb-2">Overall Completion Progress</h6>
            <div className="d-flex justify-content-between small text-muted mb-2">
              <span>{summary.completed} of {summary.total} tasks resolved</span>
              <span className="fw-bold text-dark">{summary.completionRate}%</span>
            </div>
            <div className="progress" style={{ height: '10px' }}>
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${summary.completionRate}%` }}
                aria-valuenow={summary.completionRate}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>

            <div className="d-flex justify-content-between mt-3 pt-3 border-top small text-muted">
              <span>Pending: <strong>{summary.pending}</strong></span>
              <span>In Progress: <strong>{summary.inProgress}</strong></span>
              <span>Completed: <strong>{summary.completed}</strong></span>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="col-12 col-lg-6">
          <div className="tf-card p-3 h-100">
            <h6 className="fw-bold mb-3">Tasks by Priority</h6>
            <div className="row g-2 text-center">
              <div className="col-3">
                <div className="p-2 rounded bg-light border">
                  <div className="small text-danger fw-bold">Urgent</div>
                  <h5 className="fw-bold m-0">{priorities.urgent}</h5>
                </div>
              </div>
              <div className="col-3">
                <div className="p-2 rounded bg-light border">
                  <div className="small text-warning fw-bold">High</div>
                  <h5 className="fw-bold m-0">{priorities.high}</h5>
                </div>
              </div>
              <div className="col-3">
                <div className="p-2 rounded bg-light border">
                  <div className="small text-primary fw-bold">Medium</div>
                  <h5 className="fw-bold m-0">{priorities.medium}</h5>
                </div>
              </div>
              <div className="col-3">
                <div className="p-2 rounded bg-light border">
                  <div className="small text-secondary fw-bold">Low</div>
                  <h5 className="fw-bold m-0">{priorities.low}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Tasks & Category Breakdown */}
      <div className="row g-4">
        {/* Recent Tasks */}
        <div className="col-12 col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold m-0">Recent Tasks</h5>
            <Link to="/tasks" className="small text-primary fw-medium text-decoration-none">
              View All Tasks &rarr;
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <div className="tf-card empty-state">
              <div className="empty-state-icon">📝</div>
              <h5>No tasks created yet</h5>
              <p className="small text-muted mb-3">
                Start organizing your work by adding your first task!
              </p>
              <button
                type="button"
                className="tf-btn tf-btn-primary tf-btn-sm"
                onClick={() => {
                  setSelectedTask(null);
                  setIsTaskModalOpen(true);
                }}
              >
                Create Your First Task
              </button>
            </div>
          ) : (
            recentTasks.map((task) => (
              <TaskCard
                key={task.id || task._id}
                task={task}
                onToggleStatus={handleToggleTaskStatus}
                onEdit={(t) => {
                  setSelectedTask(t);
                  setIsTaskModalOpen(true);
                }}
                onDelete={async (t) => {
                  if (window.confirm(`Are you sure you want to delete "${t.title}"?`)) {
                    try {
                      await taskService.deleteTask(t.id || t._id);
                      success('Task deleted successfully');
                      fetchDashboardData();
                    } catch (err) {
                      error(err.message || 'Failed to delete task');
                    }
                  }
                }}
              />
            ))
          )}
        </div>

        {/* Category Breakdown Sidebar */}
        <div className="col-12 col-lg-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold m-0">Projects & Categories</h5>
            <Link to="/categories" className="small text-primary fw-medium text-decoration-none">
              Manage &rarr;
            </Link>
          </div>

          <div className="tf-card p-3">
            {categoryStats.length === 0 ? (
              <div className="text-center py-3 text-muted small">
                <p className="mb-2">No categories defined yet.</p>
                <button
                  type="button"
                  className="tf-btn tf-btn-secondary tf-btn-sm"
                  onClick={() => setIsCategoryModalOpen(true)}
                >
                  + Add Category
                </button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {categoryStats.map((cat) => (
                  <div
                    key={cat.id}
                    className="d-flex align-items-center justify-content-between p-2 rounded hover-bg-light"
                    style={{ backgroundColor: '#f8fafc' }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: cat.color || '#3b82f6',
                        }}
                      />
                      <span className="fw-medium small">{cat.name}</span>
                    </div>
                    <span className="badge bg-white text-secondary border">
                      {cat.taskCount} {cat.taskCount === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={async (taskData) => {
          if (selectedTask) {
            try {
              setIsSubmitting(true);
              await taskService.updateTask(selectedTask.id || selectedTask._id, taskData);
              success('Task updated successfully');
              setIsTaskModalOpen(false);
              fetchDashboardData();
            } catch (err) {
              error(err.message || 'Failed to update task');
            } finally {
              setIsSubmitting(false);
            }
          } else {
            handleCreateTask(taskData);
          }
        }}
        initialTask={selectedTask}
        categories={categories}
        isSubmitting={isSubmitting}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default DashboardPage;

