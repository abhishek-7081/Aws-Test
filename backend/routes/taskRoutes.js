const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { validateTask } = require('../middleware/validateMiddleware');

// All task routes require authentication
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(validateTask, createTask);

router.route('/:id')
  .get(getTaskById)
  .put(validateTask, updateTask)
  .delete(deleteTask);

router.patch('/:id/status', toggleTaskStatus);

module.exports = router;
