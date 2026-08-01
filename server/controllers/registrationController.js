const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Batch = require('../models/Batch');
const ProgramLevel = require('../models/ProgramLevel');
const AppError = require('../utils/AppError');

const BD_MOBILE_REGEX = /^01[3-9]\d{8}$/;

const generateDraftCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `DRF-${code}`;
};

const pickStudentFields = (body) => {
  const {
    student_name, mobile, email, whatsapp, gender, qualification,
    address, course_id, level_id, batch_id, referral_source,
  } = body;
  return {
    student_name,
    mobile,
    email,
    whatsapp,
    gender,
    qualification,
    address,
    course_id,
    level_id,
    batch_id,
    referral_source,
  };
};

const NULLABLE_ID_FIELDS = ['course_id', 'level_id', 'batch_id'];

const sanitizeStudentFields = (fields) => {
  const clean = {};
  Object.keys(fields).forEach((key) => {
    const value = fields[key];
    if (value === undefined || value === null) return;
    const trimmed = String(value).trim();
    if (trimmed === '') {
      if (NULLABLE_ID_FIELDS.includes(key)) clean[key] = null;
      return;
    }
    clean[key] = trimmed;
  });
  return clean;
};

const saveDraft = async (req, res, next) => {
  try {
    const fields = sanitizeStudentFields(pickStudentFields(req.body));
    const { draft_id } = req.body;

    if (!fields.student_name || !fields.mobile) {
      return next(new AppError('Name and mobile number are required to save a draft.', 400));
    }

    if (!BD_MOBILE_REGEX.test(fields.mobile)) {
      return next(new AppError('Invalid Bangladeshi mobile number format.', 400));
    }

    let draft = null;
    if (draft_id) {
      draft = await Student.findById(draft_id);
      if (!draft || draft.status !== 'draft') {
        return next(new AppError('Draft not found.', 404));
      }
    } else {
      const existing = await Student.findOne({ mobile: fields.mobile, status: 'draft' });
      if (existing) draft = existing;
    }

    const photoUrl = req.file ? req.file.path : undefined;

    if (draft) {
      Object.keys(fields).forEach((key) => {
        if (fields[key] !== undefined) draft[key] = fields[key];
      });
      if (photoUrl) draft.student_photo_url = photoUrl;
      await draft.save();
    } else {
      draft = await Student.create({
        ...fields,
        ...(photoUrl ? { student_photo_url: photoUrl } : {}),
        status: 'draft',
        draft_code: generateDraftCode(),
      });
    }

    res.status(201).json({
      success: true,
      data: {
        student: {
          id: draft._id,
          draft_code: draft.draft_code,
          name: draft.student_name,
          mobile: draft.mobile,
          status: draft.status,
        },
      },
      message: 'Draft saved successfully. You can resume anytime using your mobile number or draft code.',
    });
  } catch (err) {
    next(err);
  }
};

const findDraft = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return next(new AppError('Mobile number or draft code is required.', 400));
    }

    const filter = { status: 'draft' };
    const query = String(q).trim();
    if (/^DRF-/i.test(query)) {
      filter.draft_code = query.toUpperCase();
    } else {
      filter.mobile = query;
    }

    const draft = await Student.findOne(filter)
      .populate('course_id', 'name code fee duration')
      .populate('level_id', 'name fee duration')
      .populate('batch_id', 'batch_name start_date class_schedule')
      .sort('-updatedAt');

    if (!draft) {
      return next(new AppError('Draft not found. Please check your mobile number or draft code.', 404));
    }

    res.json({ success: true, data: { draft } });
  } catch (err) {
    next(err);
  }
};

const createRegistration = async (req, res, next) => {
  try {
    const fields = sanitizeStudentFields(pickStudentFields(req.body));
    const {
      student_name, mobile, email, whatsapp, gender, qualification,
      address, course_id, level_id, batch_id, referral_source,
    } = fields;
    const { draft_id } = req.body;

    if (!student_name || !mobile) {
      return next(new AppError('Student name and mobile number are required.', 400));
    }

    if (!BD_MOBILE_REGEX.test(mobile)) {
      return next(new AppError('Invalid Bangladeshi mobile number format.', 400));
    }

    let student = null;
    if (draft_id) {
      student = await Student.findById(draft_id);
      if (!student || student.status !== 'draft') {
        return next(new AppError('Draft not found.', 404));
      }
    } else {
      const existing = await Student.findOne({ mobile });
      if (existing && existing.status === 'draft') {
        student = existing;
      } else if (existing) {
        return next(new AppError('A student with this mobile number already exists.', 409));
      }
    }

    if (level_id) {
      const level = await ProgramLevel.findById(level_id);
      if (!level) return next(new AppError('Selected program level not found.', 404));
    }

    if (batch_id) {
      const batch = await Batch.findById(batch_id);
      if (!batch) {
        return next(new AppError('Selected batch not found.', 404));
      }
      if (batch.isFull()) {
        return next(new AppError('Selected batch is already full.', 400));
      }
    }

    const photoUrl = req.file ? req.file.path : '';

    if (student) {
      Object.keys(fields).forEach((key) => {
        if (fields[key] !== undefined) student[key] = fields[key];
      });
      if (photoUrl) student.student_photo_url = photoUrl;
      student.referral_source = referral_source || student.referral_source || 'other';
      student.status = 'pending';
      await student.save();
    } else {
      student = await Student.create({
        student_name, mobile, email, whatsapp, gender, qualification,
        student_photo_url: photoUrl, address, course_id, level_id,
        ...(batch_id ? { batch_id } : {}),
        referral_source: referral_source || 'other',
        status: 'pending',
      });
    }

    if (batch_id) {
      await Batch.findByIdAndUpdate(batch_id, { $inc: { seats_filled: 1 } });
    }

    res.status(201).json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.student_name,
          mobile: student.mobile,
          status: student.status,
        },
      },
      message: 'Registration created successfully. Please proceed to payment.',
    });
  } catch (err) {
    next(err);
  }
};

const submitPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { method, amount, trxid, payment_date } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return next(new AppError('Student not found.', 404));
    }

    if (!['pending', 'payment_under_review'].includes(student.status)) {
      return next(new AppError('Payment already submitted for this registration.', 400));
    }

    if (student.level_id) {
      const level = await ProgramLevel.findById(student.level_id);
      if (level && typeof level.fee === 'number' && Number(amount) !== level.fee) {
        return next(new AppError('Payment amount must match the program level fee.', 400));
      }
    }

    if (!method || !amount || !trxid || !payment_date) {
      return next(new AppError('Payment method, amount, transaction ID, and payment date are required.', 400));
    }

    const existingPayment = await Payment.findOne({ trxid: trxid.toUpperCase() });
    if (existingPayment) {
      return next(new AppError('This transaction ID has already been used.', 409));
    }

    let screenshot_url = '';
    if (req.file) {
      screenshot_url = req.file.path;
    }

    const payment = await Payment.create({
      student_id: student._id,
      method,
      amount: Number(amount),
      trxid: trxid.toUpperCase(),
      payment_date: new Date(payment_date),
      screenshot_url,
      status: 'pending',
    });

    student.status = 'payment_under_review';
    await student.save();

    res.status(201).json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.student_name,
          status: student.status,
        },
        payment: {
          id: payment._id,
          method: payment.method,
          amount: payment.amount,
          trxid: payment.trxid,
          status: payment.status,
        },
      },
      message: 'Payment submitted successfully. Your application is under review.',
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('This transaction ID has already been used.', 409));
    }
    next(err);
  }
};

module.exports = { createRegistration, submitPayment, saveDraft, findDraft };
