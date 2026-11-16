import React from 'react';

const TaskFilters = ({ filters, onFilterChange, categories = [], onReset }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value, page: 1 });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category !== 'all';

  return (
    <div className="tf-card p-3 mb-4">
      <div className="row g-2 align-items-center">
        {/* Search */}
        <div className="col-12 col-md-4">
          <div className="position-relative">
            <input
              type="text"
              name="search"
              className="tf-input"
              placeholder="🔍 Search tasks by title or details..."
              value={filters.search || ''}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="col-6 col-sm-4 col-md-2">
          <select
            name="status"
            className="tf-select"
            value={filters.status || 'all'}
            onChange={handleInputChange}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="col-6 col-sm-4 col-md-2">
          <select
            name="priority"
            className="tf-select"
            value={filters.priority || 'all'}
            onChange={handleInputChange}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="col-6 col-sm-4 col-md-2">
          <select
            name="category"
            className="tf-select"
            value={filters.category || 'all'}
            onChange={handleInputChange}
          >
            <option value="all">All Categories</option>
            <option value="uncategorized">(Uncategorized)</option>
            {categories.map((cat) => (
              <option key={cat.id || cat._id} value={cat.id || cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="col-6 col-md-2">
          <select
            name="sortBy"
            className="tf-select"
            value={`${filters.sortBy || 'createdAt'}_${filters.sortOrder || 'desc'}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('_');
              onFilterChange({ ...filters, sortBy, sortOrder, page: 1 });
            }}
          >
            <option value="createdAt_desc">Newest First</option>
            <option value="createdAt_asc">Oldest First</option>
            <option value="dueDate_asc">Due Date (Earliest)</option>
            <option value="priority_desc">Priority</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
          <span className="small text-muted">Active filter criteria applied</span>
          <button
            type="button"
            className="btn btn-link btn-sm text-decoration-none text-danger p-0"
            onClick={onReset}
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
