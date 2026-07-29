const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const { generateInvoice, generateAdmissionLetter, generateCertificate } = require('../services/pdfService');
const AppError = require('../utils/AppError');

const getDashboard = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate('course_id', 'name code fee duration')
      .populate('batch_id', 'batch_name start_date class_schedule');

    if (!student) {
      return next(new AppError('Student not found.', 404));
    }

    const payments = await Payment.find({ student_id: student._id }).sort('-createdAt');

    res.json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.student_name,
          mobile: student.mobile,
          email: student.email,
          status: student.status,
          student_id_number: student.student_id_number,
          course: student.course_id,
          batch: student.batch_id,
          certificate_generated: student.certificate_generated,
        },
        payments,
        hasInvoice: payments.some((p) => p.status === 'verified'),
        hasAdmissionLetter: student.status === 'admitted',
      },
    });
  } catch (err) {
    next(err);
  }
};

const downloadInvoice = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user.id).populate('course_id');
    if (!student) return next(new AppError('Student not found.', 404));

    const payment = await Payment.findOne({ student_id: student._id, status: 'verified' }).sort('-createdAt');
    if (!payment) return next(new AppError('No verified payment found.', 404));

    const pdfBytes = await generateInvoice(student, payment, student.course_id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${student._id}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
};

const downloadAdmissionLetter = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate('course_id')
      .populate('batch_id');
    if (!student) return next(new AppError('Student not found.', 404));
    if (student.status !== 'admitted') {
      return next(new AppError('Admission letter is only available for admitted students.', 403));
    }

    const pdfBytes = await generateAdmissionLetter(student, student.course_id, student.batch_id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=admission-letter-${student._id}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
};

const getMaterials = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate('course_id', 'name')
      .populate('batch_id', 'batch_name class_schedule');

    if (!student) return next(new AppError('Student not found.', 404));
    if (student.status !== 'admitted') {
      return next(new AppError('Materials are only available for admitted students.', 403));
    }

    res.json({
      success: true,
      data: {
        class_schedule: student.batch_id?.class_schedule || '',
        course_name: student.course_id?.name || '',
        batch_name: student.batch_id?.batch_name || '',
      },
    });
  } catch (err) {
    next(err);
  }
};

const downloadCertificate = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user.id).populate('course_id');
    if (!student) return next(new AppError('Student not found.', 404));
    if (!student.certificate_generated) {
      return next(new AppError('Certificate not yet available.', 403));
    }

    const pdfBytes = await generateCertificate(student, student.course_id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${student._id}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard, downloadInvoice, downloadAdmissionLetter, getMaterials, downloadCertificate,
};
