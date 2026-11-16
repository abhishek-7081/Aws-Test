const { sendError } = require('../utils/apiResponse');

/**
 * Validate Registration payload
 */
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed for registration input', errors);
  }

  next();
};

/**
 * Validate Login payload
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed for login credentials', errors);
  }

  next();
};

/**
 * Validate Task creation and update payload
 */
const validateTask = (req, res, next) => {
  const { title, status, priority, dueDate } = req.body;
  const errors = [];

  if (req.method === 'POST') {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push({ field: 'title', message: 'Task title is required' });
    } else if (title.trim().length > 120) {
      errors.push({ field: 'title', message: 'Task title cannot exceed 120 characters' });
    }
  } else if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      errors.push({ field: 'title', message: 'Task title cannot be empty' });
    } else if (title.trim().length > 120) {
      errors.push({ field: 'title', message: 'Task title cannot exceed 120 characters' });
    }
  }

  const validStatuses = ['pending', 'in_progress', 'completed'];
  if (status !== undefined && !validStatuses.includes(status)) {
    errors.push({
      field: 'status',
      message: `Status must be one of: ${validStatuses.join(', ')}`,
    });
  }

  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (priority !== undefined && !validPriorities.includes(priority)) {
    errors.push({
      field: 'priority',
      message: `Priority must be one of: ${validPriorities.join(', ')}`,
    });
  }

  if (dueDate) {
    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push({ field: 'dueDate', message: 'Due date must be a valid date' });
    }
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed for task data', errors);
  }

  next();
};

/**
 * Validate Category creation and update payload
 */
const validateCategory = (req, res, next) => {
  const { name, color } = req.body;
  const errors = [];

  if (req.method === 'POST') {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Category name is required' });
    } else if (name.trim().length > 40) {
      errors.push({ field: 'name', message: 'Category name cannot exceed 40 characters' });
    }
  } else if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Category name cannot be empty' });
    } else if (name.trim().length > 40) {
      errors.push({ field: 'name', message: 'Category name cannot exceed 40 characters' });
    }
  }

  if (color) {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(color)) {
      errors.push({ field: 'color', message: 'Color must be a valid hex color code (e.g. #3b82f6)' });
    }
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed for category data', errors);
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTask,
  validateCategory,
};

