const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    code: {
      type: String,
      unique: true,
      trim: true,
    },
    fee: {
      type: Number,
      required: [true, 'Course fee is required'],
      min: 0,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
    },
    sort_order: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
