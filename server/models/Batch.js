const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    level_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProgramLevel',
    },
    batch_name: {
      type: String,
      required: [true, 'Batch name is required'],
      trim: true,
    },
    start_date: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: 1,
    },
    seats_filled: {
      type: Number,
      default: 0,
      min: 0,
    },
    class_schedule: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['upcoming', 'open', 'full', 'started', 'completed'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

batchSchema.methods.isFull = function () {
  return this.seats_filled >= this.capacity;
};

module.exports = mongoose.model('Batch', batchSchema);
