import React from 'react';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../common/Badge';

const TaskCard = ({ task, onToggleStatus, onEdit, onDelete }) => {
  const isCompleted = task.status === 'completed';
  const hasDueDate = !!task.dueDate;

  let isOverdue = false;
  let formattedDate = '';
  if (hasDueDate) {
    const d = new Date(task.dueDate);
    isOverdue = !isCompleted && d < new Date();
    formattedDate = d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  }

  const handleCheckboxChange = () => {
    const nextStatus = isCompleted ? 'pending' : 'completed';
    onToggleStatus(task.id || task._id, nextStatus);
  };

  return (
    <div
      className={`task-item priority-${task.priority} ${isCompleted ? 'is-completed' : ''}`}
    >
      <div className="d-flex align-items-start gap-3">
        {/* Quick Complete Checkbox */}
        <div className="pt-1">
          <input
            type="checkbox"
            className="form-check-input"
            checked={isCompleted}
            onChange={handleCheckboxChange}
            style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
          />
        </div>

        {/* Task Content */}
        <div className="flex-grow-1 min-w-0">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
            <h6 className="task-title m-0 fw-semibold text-break">{task.title}</h6>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {task.category && <CategoryBadge category={task.category} />}
          </div>

          {task.description && (
            <p className="small text-muted mb-2 text-break" style={{ whiteSpace: 'pre-line' }}>
              {task.description}
            </p>
          )}

          <div className="d-flex flex-wrap align-items-center gap-3 small text-muted">
            {hasDueDate && (
              <span className={`d-flex align-items-center gap-1 ${isOverdue ? 'text-danger fw-semibold' : ''}`}>
                <span>📅</span>
                <span>{formattedDate}</span>
                {isOverdue && <span className="badge bg-danger-subtle text-danger ms-1">Overdue</span>}
              </span>
            )}
            <span>
              Updated: {new Date(task.updatedAt || task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex align-items-center gap-1 ms-auto">
          {/* Quick status dropdown for in_progress */}
          {!isCompleted && (
            <button
              type="button"
              className="tf-btn tf-btn-secondary tf-btn-sm"
              onClick={() => {
                const next = task.status === 'in_progress' ? 'pending' : 'in_progress';
                onToggleStatus(task.id || task._id, next);
              }}
              title={task.status === 'in_progress' ? 'Set as Pending' : 'Set In Progress'}
            >
              {task.status === 'in_progress' ? '⏸️ Pending' : '▶️ In Progress'}
            </button>
          )}

          <button
            type="button"
            className="tf-btn tf-btn-secondary tf-btn-sm"
            onClick={() => onEdit(task)}
            title="Edit Task"
          >
            ✏️
          </button>
          <button
            type="button"
            className="tf-btn tf-btn-secondary tf-btn-sm text-danger"
            onClick={() => onDelete(task)}
            title="Delete Task"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
