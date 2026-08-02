const CourseCategory = require('../models/CourseCategory');
const Course = require('../models/Course');
const AppError = require('../utils/AppError');

const listCategories = async (req, res, next) => {
  try {
    const categories = await CourseCategory.find({ status: 'active' }).sort({ sort_order: 1, name: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, sort_order } = req.body;
    if (!name) {
      return next(new AppError('Category name is required.', 400));
    }
    const category = await CourseCategory.create({
      name,
      sort_order: sort_order || 0,
    });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await CourseCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return next(new AppError('Category not found.', 404));
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await CourseCategory.findByIdAndDelete(req.params.id);
    if (!category) return next(new AppError('Category not found.', 404));
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    next(err);
  }
};

const assignCoursesToCategory = async (req, res, next) => {
  try {
    const { course_ids } = req.body;
    const category = await CourseCategory.findById(req.params.id);
    if (!category) return next(new AppError('Category not found.', 404));
    const ids = Array.isArray(course_ids) ? course_ids.filter(Boolean) : [];
    const result = await Course.updateMany(
      { _id: { $in: ids } },
      { $set: { category_id: category._id } }
    );
    res.json({ success: true, data: { matched: result.matchedCount, modified: result.modifiedCount } });
  } catch (err) {
    next(err);
  }
};

module.exports = { listCategories, createCategory, updateCategory, deleteCategory, assignCoursesToCategory };
