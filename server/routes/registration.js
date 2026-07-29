const router = require('express').Router();
const { upload } = require('../services/cloudinaryService');
const { createRegistration, submitPayment } = require('../controllers/registrationController');

router.post('/', upload.single('student_photo'), createRegistration);
router.post('/:id/payment', upload.single('screenshot'), submitPayment);

module.exports = router;
