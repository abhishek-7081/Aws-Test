const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');
const { getDBStatus } = require('../config/db');

// In-memory user store reference for fallback mode
const inMemoryUsers = new Map();

/**
 * Authentication middleware to protect private routes
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return sendError(res, 401, 'Authentication token missing. Access denied.');
      }

      const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_taskflow_secure_2026';
      const decoded = jwt.verify(token, secret);

      const dbStatus = getDBStatus();
      if (dbStatus.isConnected) {
        // Query MongoDB with Mongoose
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          return sendError(res, 401, 'User associated with this token no longer exists.');
        }
        req.user = user;
      } else {
        // Fallback store
        const user = inMemoryUsers.get(decoded.id);
        if (!user) {
          return sendError(res, 401, 'User associated with this token no longer exists.');
        }
        req.user = user;
      }

      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Your session has expired. Please log in again.');
      }
      return sendError(res, 401, 'Invalid authentication token. Authorization failed.');
    }
  }

  return sendError(res, 401, 'No authorization token provided. Access denied.');
};

module.exports = {
  protect,
  inMemoryUsers,
};

