const mongoose = require('mongoose');

const programLevelSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    name: {
      type: String,
      required: [true, 'Level name is required'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
    },
    fee: {
      type: Number,
      required: [true, 'Fee is required'],
      min: 0,
    },
    time_slots: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProgramLevel', programLevelSchema);
