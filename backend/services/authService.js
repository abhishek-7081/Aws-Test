const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { getDBStatus } = require('../config/db');
const { inMemoryUsers } = require('../middleware/authMiddleware');

// Seed a default demo user for fallback mode if needed
let mockIdCounter = 1000;

class AuthService {
  /**
   * Register a new user
   */
  async register({ name, email, password }) {
    const normalizedEmail = email.toLowerCase().trim();
    const dbStatus = getDBStatus();

    if (dbStatus.isConnected) {
      // Check if user already exists in MongoDB
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        const error = new Error('A user with this email address already exists');
        error.statusCode = 409;
        throw error;
      }

      // Create new user
      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
      });

      const token = generateToken(user._id.toString());

      return {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
        token,
      };
    } else {
      // In-memory fallback
      for (const existingUser of inMemoryUsers.values()) {
        if (existingUser.email === normalizedEmail) {
          const error = new Error('A user with this email address already exists');
          error.statusCode = 409;
          throw error;
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const id = `user_${++mockIdCounter}`;

      const newUser = {
        _id: id,
        id,
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'user',
        avatar: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      inMemoryUsers.set(id, newUser);
      const token = generateToken(id);

      return {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          createdAt: newUser.createdAt,
        },
        token,
      };
    }
  }

  /**
   * Login an existing user
   */
  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();
    const dbStatus = getDBStatus();

    if (dbStatus.isConnected) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
      }

      const token = generateToken(user._id.toString());

      return {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
        token,
      };
    } else {
      // In-memory fallback
      let foundUser = null;
      for (const u of inMemoryUsers.values()) {
        if (u.email === normalizedEmail) {
          foundUser = u;
          break;
        }
      }

      if (!foundUser) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
      }

      const isMatch = await bcrypt.compare(password, foundUser.password);
      if (!isMatch) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
      }

      const token = generateToken(foundUser.id);

      return {
        user: {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          avatar: foundUser.avatar,
          createdAt: foundUser.createdAt,
        },
        token,
      };
    }
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const dbStatus = getDBStatus();

    if (dbStatus.isConnected) {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      };
    } else {
      const user = inMemoryUsers.get(userId);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, { name, password }) {
    const dbStatus = getDBStatus();

    if (dbStatus.isConnected) {
      const user = await User.findById(userId);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      if (name && name.trim().length >= 2) {
        user.name = name.trim();
      }
      if (password && password.length >= 6) {
        user.password = password;
      }

      await user.save();

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        updatedAt: user.updatedAt,
      };
    } else {
      const user = inMemoryUsers.get(userId);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      if (name && name.trim().length >= 2) {
        user.name = name.trim();
      }
      if (password && password.length >= 6) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }
      user.updatedAt = new Date().toISOString();

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        updatedAt: user.updatedAt,
      };
    }
  }
}

module.exports = new AuthService();
