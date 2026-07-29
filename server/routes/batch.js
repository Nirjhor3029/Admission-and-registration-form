const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { listBatches, createBatch, updateBatch } = require('../controllers/batchController');

router.get('/', listBatches);
router.post('/', authenticate, authorize('super_admin', 'admission_officer'), createBatch);
router.patch('/:id', authenticate, authorize('super_admin', 'admission_officer'), updateBatch);

module.exports = router;
