const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  listLevels, createLevel, updateLevel, deleteLevel,
} = require('../controllers/programLevelController');

router.get('/', listLevels);
router.post('/', authenticate, authorize('super_admin', 'admission_officer'), createLevel);
router.put('/:id', authenticate, authorize('super_admin', 'admission_officer'), updateLevel);
router.delete('/:id', authenticate, authorize('super_admin'), deleteLevel);

module.exports = router;
