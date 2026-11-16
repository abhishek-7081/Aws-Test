const { sendError } = require('../utils/apiResponse');

/**
 * Handle requests to endpoints that do not exist
 */
const notFoundHandler = (req, res, next) => {
  const message = `Route not found: ${req.method} ${req.originalUrl}`;
  return sendError(res, 404, message);
};

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource identifier format: '${err.value}' for field '${err.path}'`;
  }

  // Mongoose duplicate key error (e.g. unique email or category name)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicatedKeys = Object.keys(err.keyValue || {});
    const field = duplicatedKeys[0] || 'field';
    message = `A record with this ${field} already exists: '${err.keyValue[field]}'`;
  }

  // Mongoose schema validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Data validation failed';
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  // Log server errors for debugging
  if (statusCode >= 500) {
    console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err);
  }

  const payload = {
    success: false,
    message,
  };

  if (errors) {
    payload.errors = errors;
  }

  // In development, show error name if relevant
  if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
    payload.stack = err.stack;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
