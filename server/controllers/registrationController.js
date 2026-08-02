const Student = require('../models/Student');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const Batch = require('../models/Batch');
const ProgramLevel = require('../models/ProgramLevel');
const Course = require('../models/Course');
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

const generateApplicationCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `APP-${code}`;
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

const getOrCreatePerson = async (fields, photoUrl) => {
  let person = await Student.findOne({ mobile: fields.mobile });

  const personFields = {};
  ['student_name', 'email', 'whatsapp', 'gender', 'qualification', 'address', 'referral_source'].forEach((key) => {
    if (fields[key] !== undefined && fields[key] !== '') personFields[key] = fields[key];
  });
  if (photoUrl) personFields.student_photo_url = photoUrl;

  if (person) {
    Object.keys(personFields).forEach((key) => {
      if (personFields[key] !== undefined) person[key] = personFields[key];
    });
    await person.save();
  } else {
    person = await Student.create({
      student_name: fields.student_name,
      mobile: fields.mobile,
      email: fields.email || '',
      whatsapp: fields.whatsapp || '',
      gender: fields.gender || 'prefer_not_to_say',
      qualification: fields.qualification || '',
      address: fields.address || '',
      referral_source: fields.referral_source || 'other',
      ...(photoUrl ? { student_photo_url: photoUrl } : {}),
    });
  }
  return person;
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

    const photoUrl = req.file ? req.file.path : undefined;
    const person = await getOrCreatePerson(fields, photoUrl);

    let draft = null;
    if (draft_id) {
      draft = await Application.findById(draft_id);
      if (!draft || draft.status !== 'draft') {
        return next(new AppError('Draft not found.', 404));
      }
      if (String(draft.student_id) !== String(person._id)) {
        return next(new AppError('This draft belongs to a different mobile number.', 400));
      }
    }

    if (draft) {
      if (fields.course_id !== undefined) draft.course_id = fields.course_id;
      if (fields.level_id !== undefined) draft.level_id = fields.level_id;
      if (fields.batch_id !== undefined) draft.batch_id = fields.batch_id;
      await draft.save();
    } else {
      draft = await Application.create({
        student_id: person._id,
        course_id: fields.course_id || null,
        level_id: fields.level_id || null,
        batch_id: fields.batch_id || null,
        status: 'draft',
        draft_code: generateDraftCode(),
      });
    }

    res.status(201).json({
      success: true,
      data: {
        student: {
          id: person._id,
          name: person.student_name,
          mobile: person.mobile,
        },
        application: {
          id: draft._id,
          draft_code: draft.draft_code,
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

    const query = String(q).trim();
    let application = null;

    if (/^DRF-/i.test(query)) {
      application = await Application.findOne({ draft_code: query.toUpperCase(), status: 'draft' });
    } else {
      const person = await Student.findOne({ mobile: query });
      if (person) {
        application = await Application.findOne({ student_id: person._id, status: 'draft' }).sort('-updatedAt');
      }
    }

    if (!application) {
      return next(new AppError('Draft not found. Please check your mobile number or draft code.', 404));
    }

    const populated = await Application.findById(application._id)
      .populate('course_id', 'name code fee duration')
      .populate('level_id', 'name fee duration')
      .populate('batch_id', 'batch_name start_date class_schedule');

    const person = await Student.findById(application.student_id);

    const draft = {
      _id: application._id,
      draft_code: application.draft_code,
      course_id: populated.course_id,
      level_id: populated.level_id,
      batch_id: populated.batch_id,
      student_name: person.student_name,
      mobile: person.mobile,
      email: person.email,
      whatsapp: person.whatsapp,
      gender: person.gender,
      address: person.address,
      qualification: person.qualification,
      student_photo_url: person.student_photo_url,
      referral_source: person.referral_source,
    };

    res.json({ success: true, data: { draft } });
  } catch (err) {
    next(err);
  }
};

const getPersonByMobile = async (req, res, next) => {
  try {
    const { mobile } = req.query;
    const m = String(mobile || '').trim();
    if (!BD_MOBILE_REGEX.test(m)) {
      return res.json({ success: true, data: { found: false, student: null } });
    }

    const person = await Student.findOne({ mobile: m });
    if (!person) {
      return res.json({ success: true, data: { found: false, student: null } });
    }

    res.json({
      success: true,
      data: {
        found: true,
        student: {
          id: person._id,
          name: person.student_name,
          mobile: person.mobile,
          email: person.email,
          whatsapp: person.whatsapp,
          gender: person.gender,
          address: person.address,
          qualification: person.qualification,
          referral_source: person.referral_source,
          photo: person.student_photo_url,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const createRegistration = async (req, res, next) => {
  try {
    const fields = sanitizeStudentFields(pickStudentFields(req.body));
    const {
      student_name, mobile, course_id, level_id, batch_id, referral_source,
    } = fields;
    const { draft_id } = req.body;

    if (!student_name || !mobile) {
      return next(new AppError('Student name and mobile number are required.', 400));
    }

    if (!BD_MOBILE_REGEX.test(mobile)) {
      return next(new AppError('Invalid Bangladeshi mobile number format.', 400));
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
    const person = await getOrCreatePerson(fields, photoUrl);

    let application = null;
    if (draft_id) {
      application = await Application.findById(draft_id);
      if (!application || application.status !== 'draft') {
        return next(new AppError('Draft not found.', 404));
      }
      if (String(application.student_id) !== String(person._id)) {
        return next(new AppError('This draft belongs to a different mobile number.', 400));
      }
      application.course_id = course_id;
      application.level_id = level_id;
      application.batch_id = batch_id || null;
      application.referral_source = referral_source || application.referral_source || 'other';
      application.application_code = application.application_code || generateApplicationCode();
      await application.save();
    } else {
      const existing = await Application.findOne({
        student_id: person._id,
        course_id,
        level_id,
        status: { $in: ['pending', 'payment_under_review', 'payment_verified', 'admitted'] },
      });
      if (existing) {
        return next(new AppError('You already applied for this course. Check your application status.', 409));
      }
      application = await Application.create({
        student_id: person._id,
        course_id,
        level_id,
        batch_id: batch_id || null,
        status: 'draft',
        application_code: generateApplicationCode(),
      });
    }

    res.status(201).json({
      success: true,
      data: {
        student: {
          id: person._id,
          name: person.student_name,
          mobile: person.mobile,
        },
        application: {
          id: application._id,
          application_code: application.application_code,
          status: application.status,
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

    const application = await Application.findById(id);
    if (!application) {
      return next(new AppError('Application not found.', 404));
    }

    if (!['draft', 'pending', 'payment_under_review'].includes(application.status)) {
      return next(new AppError('Payment already submitted for this application.', 400));
    }

    if (!application.application_code) {
      application.application_code = generateApplicationCode();
    }

    let level = null;
    if (application.level_id) {
      level = await ProgramLevel.findById(application.level_id);
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

    if (application.batch_id) {
      const batch = await Batch.findOneAndUpdate(
        { _id: application.batch_id, $expr: { $lt: ['$seats_filled', '$capacity'] } },
        { $inc: { seats_filled: 1 } },
        { new: true }
      );
      if (!batch) {
        return next(new AppError('Selected batch is already full.', 400));
      }
    }

    let screenshot_url = '';
    if (req.file) {
      screenshot_url = req.file.path;
    }

    const payment = await Payment.create({
      student_id: application.student_id,
      application_id: application._id,
      method,
      amount: Number(amount),
      trxid: trxid.toUpperCase(),
      payment_date: new Date(payment_date),
      screenshot_url,
      status: 'pending',
    });

    application.status = 'payment_under_review';
    await application.save();

    const person = await Student.findById(application.student_id);
    const course = application.course_id ? await Course.findById(application.course_id).select('name') : null;

    res.status(201).json({
      success: true,
      data: {
        student: {
          id: person._id,
          name: person.student_name,
          mobile: person.mobile,
          application_code: application.application_code,
          status: application.status,
        },
        payment: {
          id: payment._id,
          method: payment.method,
          amount: payment.amount,
          trxid: payment.trxid,
          payment_date: payment.payment_date,
          status: payment.status,
        },
        course: course ? { name: course.name } : null,
        level: level ? { name: level.name, fee: level.fee } : null,
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

module.exports = { createRegistration, submitPayment, saveDraft, findDraft, getPersonByMobile };
