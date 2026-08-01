const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { getPaymentConfig, updatePaymentConfig } = require('../controllers/paymentConfigController');

router.get('/', getPaymentConfig);
router.put('/', authenticate, authorize('super_admin', 'admission_officer', 'accountant'), updatePaymentConfig);

module.exports = router;
