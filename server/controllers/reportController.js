const Student = require('../models/Student');
const Payment = require('../models/Payment');
const AppError = require('../utils/AppError');

const getAdmissionReport = async (req, res, next) => {
  try {
    const { range = 'monthly' } = req.query;

    const groupFormat = range === 'daily'
      ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
      : { $dateToString: { format: '%Y-%m', date: '$createdAt' } };

    const report = await Student.aggregate([
      {
        $group: {
          _id: groupFormat,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          under_review: { $sum: { $cond: [{ $eq: ['$status', 'payment_under_review'] }, 1, 0] } },
          verified: { $sum: { $cond: [{ $eq: ['$status', 'payment_verified'] }, 1, 0] } },
          admitted: { $sum: { $cond: [{ $eq: ['$status', 'admitted'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $in: ['$status', ['rejected', 'cancelled']] }, 1, 0] } },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const courseWise = await Student.aggregate([
      {
        $group: {
          _id: '$course_id',
          count: { $sum: 1 },
          admitted: { $sum: { $cond: [{ $eq: ['$status', 'admitted'] }, 1, 0] } },
        },
      },
      {
        $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' },
      },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      { $project: { course: { name: 1, code: 1 }, count: 1, admitted: 1 } },
    ]);

    res.json({ success: true, data: { report, courseWise } });
  } catch (err) {
    next(err);
  }
};

const getPaymentReport = async (req, res, next) => {
  try {
    const { range = 'monthly' } = req.query;

    const groupFormat = range === 'daily'
      ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
      : { $dateToString: { format: '%Y-%m', date: '$createdAt' } };

    const report = await Payment.aggregate([
      {
        $group: {
          _id: groupFormat,
          totalCollected: { $sum: { $cond: [{ $eq: ['$status', 'verified'] }, '$amount', 0] } },
          totalPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
          count: { $sum: 1 },
          verified: { $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const methodWise = await Payment.aggregate([
      {
        $group: {
          _id: '$method',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ success: true, data: { report, methodWise } });
  } catch (err) {
    next(err);
  }
};

const exportReport = async (req, res, next) => {
  try {
    const { type = 'excel', report: reportType = 'admissions' } = req.query;

    let data;
    if (reportType === 'admissions') {
      data = await Student.find()
        .populate('course_id', 'name')
        .populate('batch_id', 'batch_name')
        .lean();
    } else {
      data = await Payment.find()
        .populate('student_id', 'student_name mobile')
        .lean();
    }

    if (type === 'excel') {
      const XLSX = require('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, reportType);
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.xlsx`);
      res.send(buffer);
    } else if (type === 'pdf') {
      const { PDFDocument, StandardFonts } = require('pdf-lib');
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);

      data.slice(0, 50).forEach((item, index) => {
        const page = doc.addPage([612, 792]);
        const { width, height } = page.getSize();
        page.drawText(`${reportType.toUpperCase()} Report - Page ${index + 1}`, {
          x: 50, y: height - 50, size: 18, font,
        });
        page.drawText(JSON.stringify(item, null, 2), {
          x: 50, y: height - 80, size: 8, font,
        });
      });

      const pdfBytes = await doc.save();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.pdf`);
      res.send(Buffer.from(pdfBytes));
    } else {
      return next(new AppError('Export type must be "excel" or "pdf".', 400));
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { getAdmissionReport, getPaymentReport, exportReport };
