const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token
 * @param {String} userId - User identifier
 * @returns {String} Signed JWT token
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_taskflow_secure_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id: userId }, secret, {
    expiresIn,
  });
};

module.exports = generateToken;

