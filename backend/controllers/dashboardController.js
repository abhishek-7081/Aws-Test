const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get dashboard metrics, charts, and summary statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getStats = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const stats = await dashboardService.getDashboardStats(userId);
  return sendSuccess(res, 200, 'Dashboard statistics retrieved successfully', stats);
});

module.exports = {
  getStats,
};
