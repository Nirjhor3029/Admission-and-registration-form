const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  listStudents, getStudent, updateStatus, verifyPayment, rejectPayment,
} = require('../controllers/adminController');

router.use(authenticate, authorize('super_admin', 'admission_officer', 'accountant'));

router.get('/', listStudents);
router.get('/:id', getStudent);
router.patch('/:id/status', updateStatus);
router.patch('/:id/payment/verify', verifyPayment);
router.patch('/:id/payment/reject', rejectPayment);

module.exports = router;
