const router = require('express').Router();
const { upload } = require('../services/cloudinaryService');
const { createRegistration, submitPayment, saveDraft, findDraft, getPersonByMobile } = require('../controllers/registrationController');

router.post('/draft', upload.single('student_photo'), saveDraft);
router.get('/draft', findDraft);
router.get('/person', getPersonByMobile);
router.post('/', upload.single('student_photo'), createRegistration);
router.post('/:id/payment', upload.single('screenshot'), submitPayment);

module.exports = router;
