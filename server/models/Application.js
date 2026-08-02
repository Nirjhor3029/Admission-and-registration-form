const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    level_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProgramLevel',
    },
    batch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
    },
    status: {
      type: String,
      enum: [
        'draft',
        'pending',
        'payment_under_review',
        'payment_verified',
        'rejected',
        'admitted',
        'cancelled',
      ],
      default: 'pending',
    },
    draft_code: {
      type: String,
      unique: true,
      sparse: true,
    },
    application_code: {
      type: String,
      unique: true,
      sparse: true,
    },
    student_id_number: {
      type: String,
      unique: true,
      sparse: true,
    },
    certificate_generated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

applicationSchema.index({ student_id: 1 });
applicationSchema.index({ course_id: 1 });
applicationSchema.index({ level_id: 1 });
applicationSchema.index({ batch_id: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ created_at: -1 });

module.exports = mongoose.model('Application', applicationSchema);
