const Course = require('../models/Course');
const Batch = require('../models/Batch');
const ProgramLevel = require('../models/ProgramLevel');
const Student = require('../models/Student');
const AppError = require('../utils/AppError');

const listCourses = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const courses = await Course.find(filter).sort({ sort_order: 1, name: 1 });
    res.json({ success: true, data: { courses } });
  } catch (err) {
    next(err);
  }
};

const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(new AppError('Course not found.', 404));
    const levels = await ProgramLevel.find({ course_id: course._id, status: 'active' }).sort('name');
    const batches = await Batch.find({ course_id: course._id }).sort('start_date').populate('level_id');
    res.json({ success: true, data: { course, levels, batches } });
  } catch (err) {
    next(err);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { name, code, fee, duration, description } = req.body;
    if (!name) {
      return next(new AppError('Course name is required.', 400));
    }
    const course = await Course.create({ name, code, fee, duration, description });
    res.status(201).json({ success: true, data: { course } });
  } catch (err) {
    if (err.code === 11000) return next(new AppError('Course code already exists.', 409));
    next(err);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!course) return next(new AppError('Course not found.', 404));
    res.json({ success: true, data: { course } });
  } catch (err) {
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const studentCount = await Student.countDocuments({ course_id: req.params.id });
    if (studentCount > 0) {
      return next(new AppError('Cannot delete course with enrolled students.', 400));
    }
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return next(new AppError('Course not found.', 404));
    await Batch.deleteMany({ course_id: course._id });
    await ProgramLevel.deleteMany({ course_id: course._id });
    res.json({ success: true, message: 'Course deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listCourses, getCourse, createCourse, updateCourse, deleteCourse };
