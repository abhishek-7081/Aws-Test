import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const COLOR_PRESETS = [
  '#2563eb', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#64748b', // Slate
];

const CategoryModal = ({ isOpen, onClose, onSubmit, initialCategory = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#2563eb',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialCategory) {
      setFormData({
        name: initialCategory.name || '',
        description: initialCategory.description || '',
        color: initialCategory.color || '#2563eb',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#2563eb',
      });
    }
    setErrors({});
  }, [initialCategory, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Category name is required';
    } else if (formData.name.trim().length > 40) {
      errs.name = 'Category name cannot exceed 40 characters';
    }

    if (formData.description && formData.description.length > 200) {
      errs.description = 'Description cannot exceed 200 characters';
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
    onSubmit(formData);
  };

  const isEdit = !!initialCategory;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Category' : 'Create Category'}
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
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Category Name *</label>
          <input
            type="text"
            name="name"
            className={`tf-input ${errors.name ? 'is-invalid' : ''}`}
            placeholder="e.g. Marketing, Backend, Design"
            value={formData.name}
            onChange={handleChange}
            maxLength={40}
            autoFocus
          />
          {errors.name && <div className="tf-error-text">{errors.name}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">Description</label>
          <textarea
            name="description"
            rows={2}
            className={`tf-textarea ${errors.description ? 'is-invalid' : ''}`}
            placeholder="Brief purpose or scope..."
            value={formData.description}
            onChange={handleChange}
            maxLength={200}
          />
          {errors.description && <div className="tf-error-text">{errors.description}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold d-block">Theme Color</label>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, color: c }))}
                style={{
                  backgroundColor: c,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: formData.color === c ? '3px solid #0f172a' : '2px solid transparent',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'transform 0.1s ease',
                }}
                className={formData.color === c ? 'shadow-sm' : ''}
              />
            ))}
          </div>

          <div className="d-flex align-items-center gap-2 mt-2">
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              style={{ width: '38px', height: '38px', padding: '0', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
            />
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="tf-input"
              style={{ maxWidth: '120px' }}
              placeholder="#2563eb"
            />
            <span className="small text-muted">Preview Badge:</span>
            <span
              className="tf-badge"
              style={{
                backgroundColor: `${formData.color}18`,
                color: formData.color,
                border: `1px solid ${formData.color}40`,
              }}
            >
              {formData.name || 'Sample'}
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
