const Student = require('../models/Student');
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

const listStudents = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20, search, status,
      course_id, batch_id, referral_source,
      start_date, end_date, sort = '-createdAt',
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { student_name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { application_code: { $regex: search, $options: 'i' } },
        { draft_code: { $regex: search, $options: 'i' } },
        { student_id_number: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;
    if (course_id) filter.course_id = course_id;
    if (batch_id) filter.batch_id = batch_id;
    if (referral_source) filter.referral_source = referral_source;
    if (start_date || end_date) {
      filter.createdAt = {};
      if (start_date) filter.createdAt.$gte = new Date(start_date);
      if (end_date) filter.createdAt.$lte = new Date(end_date);
    }

    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .populate('course_id', 'name code')
      .populate('batch_id', 'batch_name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const ids = students.map((s) => s._id);
    const paidIds = await Payment.distinct('student_id', { student_id: { $in: ids } });
    const paidSet = new Set(paidIds.map((id) => String(id)));
    const rows = students.map((s) => {
      const doc = s.toObject();
      doc.has_payment = paidSet.has(String(s._id));
      return doc;
    });

    res.json({
      success: true,
      data: {
        students: rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('course_id', 'name code fee')
      .populate('batch_id', 'batch_name start_date');

    if (!student) {
      return next(new AppError('Student not found.', 404));
    }

    const payments = await Payment.find({ student_id: student._id }).sort('-createdAt');

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

    const student = await Student.findById(id);
    if (!student) {
      return next(new AppError('Student not found.', 404));
    }

    const allowed = VALID_TRANSITIONS[student.status];
    if (!allowed || !allowed.includes(status)) {
      return next(
        new AppError(`Cannot transition from '${student.status}' to '${status}'.`, 400)
      );
    }

    student.status = status;

    if (status === 'admitted' && !student.student_id_number) {
      const year = new Date().getFullYear();
      const count = await Student.countDocuments({
        student_id_number: { $regex: `^FARS${year}` },
      });
      student.student_id_number = `FARS${year}${String(count + 1).padStart(5, '0')}`;
    }

    await student.save();

    await AuditLog.create({
      admin_id: req.user.id,
      action: `status_changed:${student.status}->${status}`,
      target_type: 'student',
      target_id: student._id,
      details: `Status changed to ${status} by ${req.user.role}`,
    });

    res.json({
      success: true,
      data: { student },
      message: `Student status updated to '${status}'.`,
    });
  } catch (err) {
    next(err);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return next(new AppError('Student not found.', 404));
    }

    const payment = await Payment.findOne({ student_id: student._id, status: 'pending' });
    if (!payment) {
      return next(new AppError('No pending payment found for this student.', 404));
    }

    payment.status = 'verified';
    payment.verified_by = req.user.id;
    payment.verified_at = new Date();
    await payment.save();

    student.status = 'payment_verified';
    await student.save();

    await AuditLog.create({
      admin_id: req.user.id,
      action: 'payment_verified',
      target_type: 'payment',
      target_id: payment._id,
      details: `Payment ${payment.trxid} verified by ${req.user.role}`,
    });

    res.json({
      success: true,
      data: { student, payment },
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

    const student = await Student.findById(id);
    if (!student) {
      return next(new AppError('Student not found.', 404));
    }

    const payment = await Payment.findOne({ student_id: student._id, status: 'pending' });
    if (!payment) {
      return next(new AppError('No pending payment found for this student.', 404));
    }

    payment.status = 'rejected';
    payment.rejection_reason = reason;
    payment.verified_by = req.user.id;
    payment.verified_at = new Date();
    await payment.save();

    student.status = 'rejected';
    await student.save();

    await AuditLog.create({
      admin_id: req.user.id,
      action: 'payment_rejected',
      target_type: 'payment',
      target_id: payment._id,
      details: `Payment ${payment.trxid} rejected. Reason: ${reason}`,
    });

    res.json({
      success: true,
      data: { student, payment },
      message: 'Payment rejected.',
    });
  } catch (err) {
    next(err);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return next(new AppError('Student not found.', 404));
    }
    if (student.status === 'admitted') {
      return next(new AppError('Admitted students cannot be deleted to preserve admission history.', 400));
    }
    const hasPayment = await Payment.exists({ student_id: student._id });
    if (hasPayment) {
      return next(new AppError('Students with payment history cannot be deleted.', 400));
    }

    await Payment.deleteMany({ student_id: student._id });
    await AuditLog.deleteMany({ target_type: 'student', target_id: student._id });
    await Student.findByIdAndDelete(student._id);

    res.json({ success: true, message: 'Student deleted.' });
  } catch (err) {
    next(err);
  }
};

const deleteStudentsBulk = async (req, res, next) => {
  try {
    const {
      search, status, course_id, batch_id, referral_source,
      start_date, end_date,
    } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { student_name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { application_code: { $regex: search, $options: 'i' } },
        { draft_code: { $regex: search, $options: 'i' } },
        { student_id_number: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;
    if (course_id) filter.course_id = course_id;
    if (batch_id) filter.batch_id = batch_id;
    if (referral_source) filter.referral_source = referral_source;
    if (start_date || end_date) {
      filter.createdAt = {};
      if (start_date) filter.createdAt.$gte = new Date(start_date);
      if (end_date) filter.createdAt.$lte = new Date(end_date);
    }

    const matches = await Student.find(filter).select('_id status');
    const matchIds = matches.map(s => s._id);

    const protectedIds = new Set();
    matches.forEach((s) => {
      if (s.status === 'admitted') protectedIds.add(String(s._id));
    });
    const paidStudents = await Payment.distinct('student_id', { student_id: { $in: matchIds } });
    paidStudents.forEach((id) => protectedIds.add(String(id)));

    const deleteIds = matchIds.filter((id) => !protectedIds.has(String(id)));

    if (deleteIds.length > 0) {
      await Payment.deleteMany({ student_id: { $in: deleteIds } });
      await AuditLog.deleteMany({ target_type: 'student', target_id: { $in: deleteIds } });
      await Student.deleteMany({ _id: { $in: deleteIds } });
    }

    res.json({
      success: true,
      data: {
        matched: matchIds.length,
        deleted: deleteIds.length,
        protected: protectedIds.size,
      },
      message: `Deleted ${deleteIds.length} student(s). ${protectedIds.size} protected (admitted or with payment history).`,
    });
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const totalLeads = await Student.countDocuments();
    const pendingPayments = await Student.countDocuments({ status: 'payment_under_review' });
    const admittedStudents = await Student.countDocuments({ status: 'admitted' });

    const revenueResult = await Payment.aggregate([
      { $match: { status: 'verified' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);
    const revenueThisMonth = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      success: true,
      data: {
        totalLeads,
        pendingPayments,
        admittedStudents,
        revenueThisMonth,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listStudents,
  getStudent,
  updateStatus,
  verifyPayment,
  rejectPayment,
  deleteStudent,
  deleteStudentsBulk,
  getDashboardStats,
};
