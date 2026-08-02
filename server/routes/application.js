const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  listApplications, getApplication, updateStatus, verifyPayment, rejectPayment,
  deleteApplication, deleteApplicationsBulk,
} = require('../controllers/applicationController');

router.use(authenticate, authorize('super_admin', 'admission_officer', 'accountant'));

router.get('/', listApplications);
router.delete('/', authorize('super_admin'), deleteApplicationsBulk);
router.get('/:id', getApplication);
router.patch('/:id/status', updateStatus);
router.patch('/:id/payment/verify', verifyPayment);
router.patch('/:id/payment/reject', rejectPayment);
router.delete('/:id', authorize('super_admin'), deleteApplication);

module.exports = router;
