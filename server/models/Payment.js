const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    application_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    method: {
      type: String,
      enum: ['bkash', 'nagad'],
      required: [true, 'Payment method is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    trxid: {
      type: String,
      required: [true, 'Transaction ID is required'],
      unique: true,
      trim: true,
    },
    payment_date: {
      type: Date,
      required: [true, 'Payment date is required'],
    },
    screenshot_url: {
      type: String,
      default: '',
    },
    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    verified_at: {
      type: Date,
    },
    rejection_reason: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'refunded'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

paymentSchema.index({ student_id: 1 });
paymentSchema.index({ application_id: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
