import React from 'react';

export const StatusBadge = ({ status }) => {
  const labels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
  };

  const currentStatus = status || 'pending';
  const label = labels[currentStatus] || currentStatus;

  return (
    <span className={`tf-badge tf-badge-${currentStatus}`}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          display: 'inline-block',
        }}
      />
      {label}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  };

  const currentPriority = priority || 'medium';
  const label = labels[currentPriority] || currentPriority;

  return (
    <span className={`tf-badge tf-badge-${currentPriority}`}>
      {label}
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  if (!category) return null;

  const color = category.color || '#3b82f6';

  return (
    <span
      className="tf-badge"
      style={{
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
        }}
      />
      {category.name}
    </span>
  );
};

export default {
  StatusBadge,
  PriorityBadge,
  CategoryBadge,
};
