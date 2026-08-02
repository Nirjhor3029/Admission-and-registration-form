const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const { listBatches, createBatch, updateBatch, deleteBatch } = require('../controllers/batchController');

router.get('/', listBatches);
router.post('/', authenticate, authorize('super_admin', 'admission_officer'), createBatch);
router.patch('/:id', authenticate, authorize('super_admin', 'admission_officer'), updateBatch);
router.delete('/:id', authenticate, authorize('super_admin'), deleteBatch);

module.exports = router;
