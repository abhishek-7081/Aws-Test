const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { validateCategory } = require('../middleware/validateMiddleware');

// All category routes require authentication
router.use(protect);

router.route('/')
  .get(getCategories)
  .post(validateCategory, createCategory);

router.route('/:id')
  .get(getCategoryById)
  .put(validateCategory, updateCategory)
  .delete(deleteCategory);

module.exports = router;

