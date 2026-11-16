const { taskService } = require('../services/taskService');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all tasks for logged-in user with filters & pagination
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const result = await taskService.getTasks(userId, req.query);
  return sendSuccess(res, 200, 'Tasks retrieved successfully', result.tasks, result.meta);
});

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTaskById = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const task = await taskService.getTaskById(userId, req.params.id);
  return sendSuccess(res, 200, 'Task retrieved successfully', task);
});

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const task = await taskService.createTask(userId, req.body);
  return sendSuccess(res, 201, 'Task created successfully', task);
});

/**
 * @desc    Update task by ID
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const task = await taskService.updateTask(userId, req.params.id, req.body);
  return sendSuccess(res, 200, 'Task updated successfully', task);
});

/**
 * @desc    Delete task by ID
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  await taskService.deleteTask(userId, req.params.id);
  return sendSuccess(res, 200, 'Task deleted successfully', null);
});

/**
 * @desc    Toggle task status
 * @route   PATCH /api/tasks/:id/status
 * @access  Private
 */
const toggleTaskStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { status } = req.body;
  const task = await taskService.toggleTaskStatus(userId, req.params.id, status);
  return sendSuccess(res, 200, 'Task status updated successfully', task);
});

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
};
