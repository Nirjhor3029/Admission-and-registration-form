const router = require('express').Router();
const { adminLogin, studentLogin } = require('../controllers/authController');

router.post('/admin/login', adminLogin);
router.post('/student/login', studentLogin);

module.exports = router;
