import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container py-5 text-center">
      <div className="py-5">
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <h3 className="fw-semibold mb-2">Page Not Found</h3>
        <p className="text-muted mb-4">
          The page or resource you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="tf-btn tf-btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
