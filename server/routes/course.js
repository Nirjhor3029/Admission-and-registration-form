const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  listCourses, getCourse, createCourse, updateCourse, deleteCourse,
} = require('../controllers/courseController');

router.get('/', listCourses);
router.get('/:id', getCourse);
router.post('/', authenticate, authorize('super_admin', 'admission_officer'), createCourse);
router.patch('/:id', authenticate, authorize('super_admin', 'admission_officer'), updateCourse);
router.delete('/:id', authenticate, authorize('super_admin'), deleteCourse);

module.exports = router;
