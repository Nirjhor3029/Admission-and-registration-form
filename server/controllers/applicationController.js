const Student = require('../models/Student');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const AppError = require('../utils/AppError');

const VALID_TRANSITIONS = {
  draft: ['pending', 'cancelled'],
  pending: ['payment_under_review', 'rejected', 'cancelled'],
  payment_under_review: ['payment_verified', 'rejected', 'cancelled'],
  payment_verified: ['admitted', 'cancelled'],
  admitted: ['cancelled'],
  rejected: [],
  cancelled: [],
};

const buildApplicationFilter = async (reqQuery) => {
  const {
    search, status, course_id, level_id, batch_id, referral_source,
    start_date, end_date,
  } = reqQuery;

  const filter = {};

  if (status) filter.status = status;
  if (course_id) filter.course_id = course_id;
  if (level_id) filter.level_id = level_id;
  if (batch_id) filter.batch_id = batch_id;

  if (start_date || end_date) {
    filter.createdAt = {};
    if (start_date) filter.createdAt.$gte = new Date(start_date);
    if (end_date) filter.createdAt.$lte = new Date(end_date);
  }

  if (search) {
    const rx = { $regex: search, $options: 'i' };
    const persons = await Student.find({
      $or: [
        { student_name: rx },
        { mobile: rx },
        { email: rx },
        { referral_source: rx },
      ],
    }).select('_id');
    const personIds = persons.map((p) => p._id);
    const payIds = await Payment.distinct('student_id', { trxid: rx });

    filter.$or = [
      { student_id: { $in: personIds } },
      { application_code: rx },
      { draft_code: rx },
      { student_id_number: rx },
      { student_id: { $in: payIds } },
    ];
  }

  if (referral_source) {
    const personIds = await Student.find({ referral_source }).select('_id');
    filter.student_id = { $in: personIds.map((p) => p._id) };
  }

  return filter;
};

const flattenApplication = (application, payments) => {
  const app = application.toObject();
  const person = application.student_id || {};
  const latest = payments && payments.length ? payments[0] : null;
  app.student_name = person.student_name || '';
  app.mobile = person.mobile || '';
  app.email = person.email || '';
  app.student_photo_url = person.student_photo_url || '';
  app.referral_source = person.referral_source || '';
  app.has_payment = payments && payments.length > 0;
  app.payment_amount = latest ? latest.amount : null;
  app.payment_trxid = latest ? latest.trxid : '';
  app.payment_status = latest ? latest.status : '';
  app.payment_method = latest ? latest.method : '';
  app.payment_date = latest ? latest.payment_date : null;
  return app;
};

const listApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const filter = await buildApplicationFilter(req.query);

    const total = await Application.countDocuments(filter);
    const applications = await Application.find(filter)
      .populate('student_id', 'student_name mobile email student_photo_url referral_source')
      .populate('course_id', 'name code')
      .populate('level_id', 'name')
      .populate('batch_id', 'batch_name')
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const ids = applications.map((a) => a._id);
    const payments = await Payment.find({ application_id: { $in: ids } })
      .sort('-createdAt')
      .select('application_id amount trxid status method payment_date');

    const byApp = {};
    payments.forEach((p) => {
      const key = String(p.application_id);
      if (!byApp[key]) byApp[key] = [];
      byApp[key].push(p);
    });

    const rows = applications.map((a) => flattenApplication(a, byApp[String(a._id)] || []));

    res.json({
      success: true,
      data: {
        students: rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student_id')
      .populate('course_id', 'name code fee')
      .populate('level_id', 'name fee')
      .populate('batch_id', 'batch_name start_date');

    if (!application) {
      return next(new AppError('Application not found.', 404));
    }

    const payments = await Payment.find({ application_id: application._id }).sort('-createdAt');
    const student = flattenApplication(application, payments);

    res.json({
      success: true,
      data: { student, payments },
    });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findById(id)
      .populate('student_id')
      .populate('course_id', 'name code fee')
      .populate('level_id', 'name fee')
      .populate('batch_id', 'batch_name start_date');
    if (!application) {
      return next(new AppError('Application not found.', 404));
    }

    const allowed = VALID_TRANSITIONS[application.status];
    if (!allowed || !allowed.includes(status)) {
      return next(
        new AppError(`Cannot transition from '${application.status}' to '${status}'.`, 400)
      );
    }

    application.status = status;

    if (status === 'admitted' && !application.student_id_number) {
      const year = new Date().getFullYear();
      const count = await Application.countDocuments({
        student_id_number: { $regex: `^FARS${year}` },
      });
      application.student_id_number = `FARS${year}${String(count + 1).padStart(5, '0')}`;
    }

    await application.save();

    const payments = await Payment.find({ application_id: application._id }).sort('-createdAt');

    await AuditLog.create({
      admin_id: req.user.id,
      action: `status_changed:${application.status}->${status}`,
      target_type: 'application',
      target_id: application._id,
      details: `Application ${application.application_code || ''} status changed to ${status} by ${req.user.role}`,
    });

    res.json({
      success: true,
      data: { student: flattenApplication(application, payments) },
      message: `Application status updated to '${status}'.`,
    });
  } catch (err) {
    next(err);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate('student_id')
      .populate('course_id', 'name code fee')
      .populate('level_id', 'name fee')
      .populate('batch_id', 'batch_name start_date');
    if (!application) {
      return next(new AppError('Application not found.', 404));
    }

    const payment = await Payment.findOne({ application_id: application._id, status: 'pending' });
    if (!payment) {
      return next(new AppError('No pending payment found for this application.', 404));
    }

    payment.status = 'verified';
    payment.verified_by = req.user.id;
    payment.verified_at = new Date();
    await payment.save();

    application.status = 'payment_verified';
    await application.save();

    await AuditLog.create({
      admin_id: req.user.id,
      action: 'payment_verified',
      target_type: 'payment',
      target_id: payment._id,
      details: `Payment ${payment.trxid} verified by ${req.user.role}`,
    });

    const payments = await Payment.find({ application_id: application._id }).sort('-createdAt');

    res.json({
      success: true,
      data: { student: flattenApplication(application, payments), payment },
      message: 'Payment verified successfully.',
    });
  } catch (err) {
    next(err);
  }
};

const rejectPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return next(new AppError('Rejection reason is required.', 400));
    }

    const application = await Application.findById(id)
      .populate('student_id')
      .populate('course_id', 'name code fee')
      .populate('level_id', 'name fee')
      .populate('batch_id', 'batch_name start_date');
    if (!application) {
      return next(new AppError('Application not found.', 404));
    }

    const payment = await Payment.findOne({ application_id: application._id, status: 'pending' });
    if (!payment) {
      return next(new AppError('No pending payment found for this application.', 404));
    }

    payment.status = 'rejected';
    payment.rejection_reason = reason;
    payment.verified_by = req.user.id;
    payment.verified_at = new Date();
    await payment.save();

    application.status = 'rejected';
    await application.save();

    await AuditLog.create({
      admin_id: req.user.id,
      action: 'payment_rejected',
      target_type: 'payment',
      target_id: payment._id,
      details: `Payment ${payment.trxid} rejected. Reason: ${reason}`,
    });

    const payments = await Payment.find({ application_id: application._id }).sort('-createdAt');

    res.json({
      success: true,
      data: { student: flattenApplication(application, payments), payment },
      message: 'Payment rejected.',
    });
  } catch (err) {
    next(err);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return next(new AppError('Application not found.', 404));
    }
    if (application.status === 'admitted') {
      return next(new AppError('Admitted applications cannot be deleted to preserve admission history.', 400));
    }
    const hasPayment = await Payment.exists({ application_id: application._id });
    if (hasPayment) {
      return next(new AppError('Applications with payment history cannot be deleted.', 400));
    }

    await AuditLog.deleteMany({ target_type: 'application', target_id: application._id });
    await Application.findByIdAndDelete(application._id);

    const remaining = await Application.countDocuments({ student_id: application.student_id });
    if (remaining === 0) {
      await Student.findByIdAndDelete(application.student_id);
    }

    res.json({ success: true, message: 'Application deleted.' });
  } catch (err) {
    next(err);
  }
};

const deleteApplicationsBulk = async (req, res, next) => {
  try {
    const filter = await buildApplicationFilter(req.query);

    const matches = await Application.find(filter).select('_id status');
    const matchIds = matches.map((a) => a._id);

    const protectedIds = new Set();
    matches.forEach((a) => {
      if (a.status === 'admitted') protectedIds.add(String(a._id));
    });
    const paidApps = await Payment.distinct('application_id', { application_id: { $in: matchIds } });
    paidApps.forEach((id) => protectedIds.add(String(id)));

    const deleteIds = matchIds.filter((id) => !protectedIds.has(String(id)));

    if (deleteIds.length > 0) {
      const apps = await Application.find({ _id: { $in: deleteIds } }).select('student_id');
      const studentIds = [...new Set(apps.map((a) => String(a.student_id)))];
      await AuditLog.deleteMany({ target_type: 'application', target_id: { $in: deleteIds } });
      await Application.deleteMany({ _id: { $in: deleteIds } });

      for (const sid of studentIds) {
        const remaining = await Application.countDocuments({ student_id: sid });
        if (remaining === 0) {
          await Student.findByIdAndDelete(sid);
        }
      }
    }

    res.json({
      success: true,
      data: {
        matched: matchIds.length,
        deleted: deleteIds.length,
        protected: protectedIds.size,
      },
      message: `Deleted ${deleteIds.length} application(s). ${protectedIds.size} protected (admitted or with payment history).`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listApplications,
  getApplication,
  updateStatus,
  verifyPayment,
  rejectPayment,
  deleteApplication,
  deleteApplicationsBulk,
};
