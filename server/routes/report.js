const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { getAdmissionReport, getPaymentReport, exportReport } = require('../controllers/reportController');

router.use(authenticate, authorize('super_admin', 'admission_officer', 'accountant'));

router.get('/admissions', getAdmissionReport);
router.get('/payments', getPaymentReport);
router.get('/export', exportReport);

module.exports = router;
