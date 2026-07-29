const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Batch = require('../models/Batch');
const AppError = require('../utils/AppError');

const BD_MOBILE_REGEX = /^01[3-9]\d{8}$/;

const createRegistration = async (req, res, next) => {
  try {
    const {
      student_name, mobile, email, whatsapp, gender, qualification,
      address, course_id, batch_id, referral_source,
    } = req.body;

    if (!student_name || !mobile) {
      return next(new AppError('Student name and mobile number are required.', 400));
    }

    if (!BD_MOBILE_REGEX.test(mobile)) {
      return next(new AppError('Invalid Bangladeshi mobile number format.', 400));
    }

    const existing = await Student.findOne({ mobile });
    if (existing) {
      return next(new AppError('A student with this mobile number already exists.', 409));
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

    let student_photo_url = '';
    if (req.file) {
      student_photo_url = req.file.path;
    }

    const student = await Student.create({
      student_name, mobile, email, whatsapp, gender, qualification,
      student_photo_url, address, course_id, batch_id,
      referral_source: referral_source || 'other',
      status: 'pending',
    });

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

module.exports = { createRegistration, submitPayment };
