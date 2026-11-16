import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const TaskFormModal = ({ isOpen, onClose, onSubmit, initialTask = null, categories = [], isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    category: '',
    dueDate: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialTask) {
      let formattedDate = '';
      if (initialTask.dueDate) {
        try {
          formattedDate = new Date(initialTask.dueDate).toISOString().split('T')[0];
        } catch {
          formattedDate = '';
        }
      }

      setFormData({
        title: initialTask.title || '',
        description: initialTask.description || '',
        priority: initialTask.priority || 'medium',
        status: initialTask.status || 'pending',
        category: initialTask.category?._id || initialTask.category?.id || initialTask.category || '',
        dueDate: formattedDate,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        category: '',
        dueDate: '',
      });
    }
    setErrors({});
  }, [initialTask, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.title || !formData.title.trim()) {
      errs.title = 'Title is required';
    } else if (formData.title.trim().length < 2) {
      errs.title = 'Title must be at least 2 characters';
    } else if (formData.title.trim().length > 120) {
      errs.title = 'Title cannot exceed 120 characters';
    }

    if (formData.description && formData.description.length > 2000) {
      errs.description = 'Description cannot exceed 2000 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      category: formData.category ? formData.category : null,
      dueDate: formData.dueDate ? formData.dueDate : null,
    };

    onSubmit(payload);
  };

  const isEdit = !!initialTask;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Task' : 'Create New Task'}
      footer={
        <>
          <button
            type="button"
            className="tf-btn tf-btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="tf-btn tf-btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-3">
          <label className="form-label small fw-semibold">Task Title *</label>
          <input
            type="text"
            name="title"
            className={`tf-input ${errors.title ? 'is-invalid' : ''}`}
            placeholder="e.g. Design API endpoints"
            value={formData.title}
            onChange={handleChange}
            maxLength={120}
            autoFocus
          />
          {errors.title && <div className="tf-error-text">{errors.title}</div>}
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label small fw-semibold">Description</label>
          <textarea
            name="description"
            rows={3}
            className={`tf-textarea ${errors.description ? 'is-invalid' : ''}`}
            placeholder="Provide context, acceptance criteria, or notes..."
            value={formData.description}
            onChange={handleChange}
            maxLength={2000}
          />
          {errors.description && <div className="tf-error-text">{errors.description}</div>}
        </div>

        {/* Priority & Status */}
        <div className="row g-3 mb-3">
          <div className="col-sm-6">
            <label className="form-label small fw-semibold">Priority</label>
            <select
              name="priority"
              className="tf-select"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="col-sm-6">
            <label className="form-label small fw-semibold">Status</label>
            <select
              name="status"
              className="tf-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Category & Due Date */}
        <div className="row g-3 mb-2">
          <div className="col-sm-6">
            <label className="form-label small fw-semibold">Category / Project</label>
            <select
              name="category"
              className="tf-select"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">(No Category)</option>
              {categories.map((cat) => (
                <option key={cat.id || cat._id} value={cat.id || cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-sm-6">
            <label className="form-label small fw-semibold">Due Date</label>
            <input
              type="date"
              name="dueDate"
              className="tf-input"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default TaskFormModal;

