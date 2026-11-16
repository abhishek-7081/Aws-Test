const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      trim: true,
      maxlength: [40, 'Category name cannot exceed 40 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
    color: {
      type: String,
      default: '#3b82f6',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Category must belong to a user'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate category names for the same user
categorySchema.index({ name: 1, user: 1 }, { unique: true });

categorySchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
