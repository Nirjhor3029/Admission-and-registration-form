const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    student_name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    whatsapp: {
      type: String,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    qualification: {
      type: String,
      default: '',
    },
    student_photo_url: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
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
    referral_source: {
      type: String,
      enum: ['facebook_ad', 'facebook_page', 'website', 'friend', 'youtube', 'other'],
      default: 'other',
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

studentSchema.index({ email: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ referral_source: 1 });
studentSchema.index({ created_at: -1 });

module.exports = mongoose.model('Student', studentSchema);
