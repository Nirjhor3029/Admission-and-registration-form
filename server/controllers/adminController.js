const Application = require('../models/Application');
const Payment = require('../models/Payment');

const getDashboardStats = async (req, res, next) => {
  try {
    const totalLeads = await Application.countDocuments();
    const pendingPayments = await Application.countDocuments({ status: 'payment_under_review' });
    const admittedStudents = await Application.countDocuments({ status: 'admitted' });

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

module.exports = { getDashboardStats };
