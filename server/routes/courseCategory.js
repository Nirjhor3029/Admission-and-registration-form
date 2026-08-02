const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  listCategories, createCategory, updateCategory, deleteCategory, assignCoursesToCategory,
} = require('../controllers/courseCategoryController');

router.get('/', listCategories);
router.post('/', authenticate, authorize('super_admin', 'admission_officer'), createCategory);
router.put('/:id', authenticate, authorize('super_admin', 'admission_officer'), updateCategory);
router.put('/:id/courses', authenticate, authorize('super_admin', 'admission_officer'), assignCoursesToCategory);
router.delete('/:id', authenticate, authorize('super_admin'), deleteCategory);

module.exports = router;
