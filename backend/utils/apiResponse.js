/**
 * Standardized API response utilities
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code (default: 200)
 * @param {String} message - Human-readable success message
 * @param {Any} data - Response payload
 * @param {Object} meta - Optional metadata (e.g. pagination)
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = undefined) => {
  const payload = {
    success: true,
    message,
    data,
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code (default: 500)
 * @param {String} message - Human-readable error message
 * @param {Array|Object} errors - Validation or detailed errors
 */
const sendError = (res, statusCode = 500, message = 'An error occurred', errors = null) => {
  const payload = {
    success: false,
    message,
  };

  if (errors !== null && errors !== undefined) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess,
  sendError,
};
