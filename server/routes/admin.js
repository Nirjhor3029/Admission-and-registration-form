const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { getDashboardStats } = require('../controllers/adminController');

router.use(authenticate, authorize('super_admin', 'admission_officer'));

router.get('/stats', getDashboardStats);

module.exports = router;
