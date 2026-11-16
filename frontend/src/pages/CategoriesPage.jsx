import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import categoryService from '../services/categoryService';
import dashboardService from '../services/dashboardService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CategoryModal from '../components/categories/CategoryModal';
import Modal from '../components/common/Modal';

const CategoriesPage = () => {
  const { success, error } = useToast();

  const [categories, setCategories] = useState([]);
  const [statsMap, setStatsMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategoriesData = useCallback(async () => {
    try {
      setLoading(true);
      const [catsRes, statsRes] = await Promise.all([
        categoryService.getCategories(),
        dashboardService.getStats(),
      ]);

      setCategories(catsRes.data || []);

      // Build map of category ID to task count
      const mapping = {};
      if (statsRes.data && statsRes.data.categories) {
        statsRes.data.categories.forEach((item) => {
          mapping[item.id] = item.taskCount;
        });
      }
      setStatsMap(mapping);
    } catch (err) {
      error(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchCategoriesData();
  }, [fetchCategoriesData]);

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id || editingCategory._id, formData);
        success('Category updated successfully');
      } else {
        await categoryService.createCategory(formData);
        success('Category created successfully');
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      fetchCategoriesData();
    } catch (err) {
      error(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      setIsSubmitting(true);
      await categoryService.deleteCategory(deletingCategory.id || deletingCategory._id);
      success('Category deleted successfully');
      setDeletingCategory(null);
      fetchCategoriesData();
    } catch (err) {
      error(err.message || 'Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Categories & Projects</h3>
          <p className="text-muted small m-0">
            Organize tasks into categorized workspaces with custom color tags.
          </p>
        </div>

        <button
          type="button"
          className="tf-btn tf-btn-primary"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
        >
          + Add New Category
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading categories..." />
      ) : categories.length === 0 ? (
        <div className="tf-card empty-state">
          <div className="empty-state-icon">🏷️</div>
          <h5>No categories yet</h5>
          <p className="small text-muted mb-3">
            Group your tasks into logical categories like Development, Marketing, or Personal.
          </p>
          <button
            type="button"
            className="tf-btn tf-btn-primary tf-btn-sm"
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
          >
            + Create First Category
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {categories.map((cat) => {
            const catId = cat.id || cat._id;
            const taskCount = statsMap[catId] || 0;
            const color = cat.color || '#3b82f6';

            return (
              <div key={catId} className="col-12 col-md-6 col-lg-4">
                <div
                  className="tf-card tf-card-hover p-3 h-100 d-flex flex-column justify-content-between"
                  style={{ borderTop: `4px solid ${color}` }}
                >
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: color,
                          }}
                        />
                        <h5 className="m-0 fw-semibold text-truncate">{cat.name}</h5>
                      </div>
                      <span className="badge bg-light text-secondary border">
                        {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>

                    <p className="small text-muted mb-3" style={{ minHeight: '38px' }}>
                      {cat.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                    <button
                      type="button"
                      className="tf-btn tf-btn-secondary tf-btn-sm"
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsModalOpen(true);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="tf-btn tf-btn-secondary tf-btn-sm text-danger"
                      onClick={() => setDeletingCategory(cat)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category Create/Edit Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleFormSubmit}
        initialCategory={editingCategory}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        title="Confirm Category Deletion"
        footer={
          <>
            <button
              type="button"
              className="tf-btn tf-btn-secondary"
              onClick={() => setDeletingCategory(null)}
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
              {isSubmitting ? 'Deleting...' : 'Delete Category'}
            </button>
          </>
        }
      >
        <p className="m-0">
          Are you sure you want to delete category <strong>"{deletingCategory?.name}"</strong>?
          <br />
          <span className="small text-muted mt-1 d-block">
            Note: Any tasks associated with this category will remain, but will become uncategorized.
          </span>
        </p>
      </Modal>
    </div>
  );
};

export default CategoriesPage;

