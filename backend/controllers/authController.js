const authService = require('../services/authService');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.register({ name, email, password });
  return sendSuccess(res, 201, 'User registered successfully', result);
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return sendSuccess(res, 200, 'Login successful', result);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id || req.user._id);
  return sendSuccess(res, 200, 'User profile retrieved successfully', user);
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const user = await authService.updateProfile(req.user.id || req.user._id, { name, password });
  return sendSuccess(res, 200, 'Profile updated successfully', user);
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
