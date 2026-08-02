const Student = require('../models/Student');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const { generateInvoice, generateAdmissionLetter, generateCertificate } = require('../services/pdfService');
const AppError = require('../utils/AppError');

const POPULATE_APP = [
  { path: 'course_id', select: 'name code fee duration' },
  { path: 'level_id', select: 'name fee duration' },
  { path: 'batch_id', select: 'batch_name start_date class_schedule' },
];

const getDashboard = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return next(new AppError('Student not found.', 404));
    }

    const applications = await Application.find({ student_id: student._id })
      .populate(POPULATE_APP)
      .sort('-updatedAt');

    const appIds = applications.map((a) => a._id);
    const payments = await Payment.find({ application_id: { $in: appIds } }).sort('-createdAt');
    const byApp = {};
    payments.forEach((p) => {
      const key = String(p.application_id);
      if (!byApp[key]) byApp[key] = [];
      byApp[key].push(p);
    });

    const apps = applications.map((a) => {
      const app = a.toObject();
      app.payments = byApp[String(a._id)] || [];
      const latest = app.payments[0] || null;
      app.hasInvoice = app.payments.some((p) => p.status === 'verified');
      app.hasAdmissionLetter = app.status === 'admitted';
      app.payment = latest ? {
        id: latest._id,
        method: latest.method,
        amount: latest.amount,
        trxid: latest.trxid,
        payment_date: latest.payment_date,
        status: latest.status,
        rejection_reason: latest.rejection_reason || '',
      } : null;
      return app;
    });

    res.json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.student_name,
          mobile: student.mobile,
          email: student.email,
          photo: student.student_photo_url,
          whatsapp: student.whatsapp,
        },
        applications: apps,
        payments,
        hasInvoice: payments.some((p) => p.status === 'verified'),
        hasAdmissionLetter: apps.some((a) => a.status === 'admitted'),
      },
    });
  } catch (err) {
    next(err);
  }
};

const loadApplicationForStudent = async (req, applicationId) => {
  const student = await Student.findById(req.user.id);
  if (!student) return { error: new AppError('Student not found.', 404) };

  const application = await Application.findById(applicationId)
    .populate('course_id')
    .populate('batch_id');
  if (!application) return { error: new AppError('Application not found.', 404) };
  if (String(application.student_id) !== String(student._id)) {
    return { error: new AppError('Access denied.', 403) };
  }
  return { student, application };
};

const downloadInvoice = async (req, res, next) => {
  try {
    const { application_id } = req.query;
    if (!application_id) return next(new AppError('application_id is required.', 400));
    const { student, application, error } = await loadApplicationForStudent(req, application_id);
    if (error) return next(error);

    const payment = await Payment.findOne({ application_id: application._id, status: 'verified' }).sort('-createdAt');
    if (!payment) return next(new AppError('No verified payment found for this application.', 404));

    const pdfBytes = await generateInvoice(
      { ...student.toObject(), student_id_number: application.student_id_number },
      payment,
      application.course_id
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${application._id}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
};

const downloadAdmissionLetter = async (req, res, next) => {
  try {
    const { application_id } = req.query;
    if (!application_id) return next(new AppError('application_id is required.', 400));
    const { student, application, error } = await loadApplicationForStudent(req, application_id);
    if (error) return next(error);

    if (application.status !== 'admitted') {
      return next(new AppError('Admission letter is only available for admitted applications.', 403));
    }

    const pdfBytes = await generateAdmissionLetter(
      { ...student.toObject(), student_id_number: application.student_id_number },
      application.course_id,
      application.batch_id
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=admission-letter-${application._id}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
};

const getMaterials = async (req, res, next) => {
  try {
    const { application_id } = req.query;
    if (!application_id) return next(new AppError('application_id is required.', 400));
    const { application, error } = await loadApplicationForStudent(req, application_id);
    if (error) return next(error);

    if (application.status !== 'admitted') {
      return next(new AppError('Materials are only available for admitted applications.', 403));
    }

    res.json({
      success: true,
      data: {
        class_schedule: application.batch_id?.class_schedule || '',
        course_name: application.course_id?.name || '',
        batch_name: application.batch_id?.batch_name || '',
      },
    });
  } catch (err) {
    next(err);
  }
};

const downloadCertificate = async (req, res, next) => {
  try {
    const { application_id } = req.query;
    if (!application_id) return next(new AppError('application_id is required.', 400));
    const { student, application, error } = await loadApplicationForStudent(req, application_id);
    if (error) return next(error);

    if (!application.certificate_generated) {
      return next(new AppError('Certificate not yet available.', 403));
    }

    const pdfBytes = await generateCertificate(
      { ...student.toObject(), student_id_number: application.student_id_number },
      application.course_id
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${application._id}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard, downloadInvoice, downloadAdmissionLetter, getMaterials, downloadCertificate,
};
