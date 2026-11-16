import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import taskService from '../services/taskService';
import categoryService from '../services/categoryService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TaskCard from '../components/tasks/TaskCard';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskFormModal from '../components/tasks/TaskFormModal';
import Modal from '../components/common/Modal';

const TasksPage = () => {
  const { success, error } = useToast();

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  });

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories for filtering and form dropdown
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch tasks according to current filter
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getTasks(filters);
      setTasks(res.data || []);
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [filters, error]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleStatus = async (taskId, newStatus) => {
    try {
      await taskService.toggleTaskStatus(taskId, newStatus);
      success(`Task marked as ${newStatus.replace('_', ' ')}`);
      fetchTasks();
    } catch (err) {
      error(err.message || 'Could not update status');
    }
  };

  const handleFormSubmit = async (taskData) => {
    try {
      setIsSubmitting(true);
      if (editingTask) {
        await taskService.updateTask(editingTask.id || editingTask._id, taskData);
        success('Task updated successfully');
      } else {
        await taskService.createTask(taskData);
        success('Task created successfully');
      }
      setIsFormModalOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      error(err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingTask) return;
    try {
      setIsSubmitting(true);
      await taskService.deleteTask(deletingTask.id || deletingTask._id);
      success('Task deleted successfully');
      setDeletingTask(null);
      fetchTasks();
    } catch (err) {
      error(err.message || 'Failed to delete task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10,
    });
  };

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Tasks Management</h3>
          <p className="text-muted small m-0">
            Track, filter, and organize all your operational tasks in one place.
          </p>
        </div>

        <button
          type="button"
          className="tf-btn tf-btn-primary"
          onClick={() => {
            setEditingTask(null);
            setIsFormModalOpen(true);
          }}
        >
          + Add New Task
        </button>
      </div>

      {/* Filters Toolbar */}
      <TaskFilters
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Tasks List */}
      {loading ? (
        <LoadingSpinner message="Fetching task items..." />
      ) : tasks.length === 0 ? (
        <div className="tf-card empty-state">
          <div className="empty-state-icon">🔍</div>
          <h5>No tasks found</h5>
          <p className="small text-muted mb-3">
            {filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all'
              ? 'No tasks match your selected filter criteria. Try adjusting or resetting filters.'
              : 'You do not have any tasks yet. Create your first task to get started!'}
          </p>
          {filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all' ? (
            <button type="button" className="tf-btn tf-btn-secondary tf-btn-sm" onClick={handleResetFilters}>
              Reset Filters
            </button>
          ) : (
            <button
              type="button"
              className="tf-btn tf-btn-primary tf-btn-sm"
              onClick={() => {
                setEditingTask(null);
                setIsFormModalOpen(true);
              }}
            >
              + Create First Task
            </button>
          )}
        </div>
      ) : (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2 px-1">
            <span className="small text-muted">
              Showing <strong>{tasks.length}</strong> of <strong>{meta.total}</strong> {meta.total === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          <div className="mb-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id || task._id}
                task={task}
                onToggleStatus={handleToggleStatus}
                onEdit={(t) => {
                  setEditingTask(t);
                  setIsFormModalOpen(true);
                }}
                onDelete={(t) => setDeletingTask(t)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center pt-2 border-top">
              <button
                type="button"
                className="tf-btn tf-btn-secondary tf-btn-sm"
                disabled={!meta.hasPrevPage}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                &larr; Previous
              </button>

              <span className="small text-muted">
                Page {meta.page} of {meta.totalPages}
              </span>

              <button
                type="button"
                className="tf-btn tf-btn-secondary tf-btn-sm"
                disabled={!meta.hasNextPage}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Task Create/Edit Modal */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialTask={editingTask}
        categories={categories}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        title="Confirm Task Deletion"
        footer={
          <>
            <button
              type="button"
              className="tf-btn tf-btn-secondary"
              onClick={() => setDeletingTask(null)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="tf-btn tf-btn-danger"
              onClick={confirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Task'}
            </button>
          </>
        }
      >
        <p className="m-0">
          Are you sure you want to permanently delete task <strong>"{deletingTask?.title}"</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default TasksPage;
