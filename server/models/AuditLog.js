const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
    },
    target_type: {
      type: String,
      required: true,
      enum: ['student', 'payment', 'course', 'batch', 'admin', 'application'],
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ admin_id: 1 });
auditLogSchema.index({ target_type: 1, target_id: 1 });
auditLogSchema.index({ created_at: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
