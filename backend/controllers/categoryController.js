const { categoryService } = require('../services/categoryService');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all categories for logged-in user
 * @route   GET /api/categories
 * @access  Private
 */
const getCategories = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const categories = await categoryService.getCategories(userId);
  return sendSuccess(res, 200, 'Categories retrieved successfully', categories);
});

/**
 * @desc    Get category by ID
 * @route   GET /api/categories/:id
 * @access  Private
 */
const getCategoryById = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const category = await categoryService.getCategoryById(userId, req.params.id);
  return sendSuccess(res, 200, 'Category retrieved successfully', category);
});

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private
 */
const createCategory = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const category = await categoryService.createCategory(userId, req.body);
  return sendSuccess(res, 201, 'Category created successfully', category);
});

/**
 * @desc    Update category by ID
 * @route   PUT /api/categories/:id
 * @access  Private
 */
const updateCategory = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const category = await categoryService.updateCategory(userId, req.params.id, req.body);
  return sendSuccess(res, 200, 'Category updated successfully', category);
});

/**
 * @desc    Delete category by ID
 * @route   DELETE /api/categories/:id
 * @access  Private
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  await categoryService.deleteCategory(userId, req.params.id);
  return sendSuccess(res, 200, 'Category deleted successfully', null);
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

