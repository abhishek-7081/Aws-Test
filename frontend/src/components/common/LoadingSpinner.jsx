import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 'default', fullPage = false }) => {
  const spinnerClass = size === 'small' ? 'spinner-border-sm' : '';

  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div className={`spinner-border text-primary ${spinnerClass}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <div className="mt-2 text-muted small">{message}</div>}
    </div>
  );

  if (fullPage) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '60vh' }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
