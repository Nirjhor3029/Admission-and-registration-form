const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const {
  getDashboard, downloadInvoice, downloadAdmissionLetter,
  getMaterials, downloadCertificate,
} = require('../controllers/studentDashboardController');

router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/invoice', downloadInvoice);
router.get('/admission-letter', downloadAdmissionLetter);
router.get('/materials', getMaterials);
router.get('/certificate', downloadCertificate);

module.exports = router;
