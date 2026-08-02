const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  listStudents, getStudent, updateStatus, verifyPayment, rejectPayment,
  deleteStudent, deleteStudentsBulk,
} = require('../controllers/adminController');

router.use(authenticate, authorize('super_admin', 'admission_officer', 'accountant'));

router.get('/', listStudents);
router.delete('/', authorize('super_admin'), deleteStudentsBulk);
router.get('/:id', getStudent);
router.patch('/:id/status', updateStatus);
router.patch('/:id/payment/verify', verifyPayment);
router.patch('/:id/payment/reject', rejectPayment);
router.delete('/:id', authorize('super_admin'), deleteStudent);

module.exports = router;
