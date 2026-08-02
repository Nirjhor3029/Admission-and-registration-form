const Course = require('../models/Course');
const Batch = require('../models/Batch');
const ProgramLevel = require('../models/ProgramLevel');
const Application = require('../models/Application');
const AppError = require('../utils/AppError');

const listCourses = async (req, res, next) => {
  try {
    const { status, category_id } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category_id) filter.category_id = category_id;
    const courses = await Course.find(filter)
      .populate('category_id', 'name sort_order')
      .sort({ sort_order: 1, name: 1 });
    res.json({ success: true, data: { courses } });
  } catch (err) {
    next(err);
  }
};

const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('category_id', 'name sort_order');
    if (!course) return next(new AppError('Course not found.', 404));
    const levels = await ProgramLevel.find({ course_id: course._id, status: 'active' }).sort('name');
    const batches = await Batch.find({ course_id: course._id }).sort('start_date').populate('level_id');
    res.json({ success: true, data: { course, levels, batches } });
  } catch (err) {
    next(err);
  }
};

const generateCodeFromName = (name) => {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  let base = words.map(w => w[0]).join('').toUpperCase().slice(0, 4);
  if (base.length < 2) base = words[0].toUpperCase().slice(0, 3);
  return base;
};

const createCourse = async (req, res, next) => {
  try {
    const { name, code, fee, duration, sort_order, description, category_id } = req.body;
    if (!name) {
      return next(new AppError('Course name is required.', 400));
    }

    const isGenerated = !(code && String(code).trim());
    let finalCode = isGenerated ? generateCodeFromName(name) : String(code).trim().toUpperCase();
    if (isGenerated) {
      const existingCodes = await Course.find({ code: { $regex: `^${finalCode}` } }).select('code');
      const used = new Set(existingCodes.map(c => c.code));
      let candidate = finalCode;
      let i = 1;
      while (used.has(candidate)) {
        candidate = `${finalCode}${i}`;
        i += 1;
      }
      finalCode = candidate;
    }

    let finalSortOrder = sort_order;
    if (finalSortOrder === undefined || finalSortOrder === null || finalSortOrder === '') {
      const last = await Course.findOne().sort({ sort_order: -1 }).select('sort_order');
      finalSortOrder = (last && typeof last.sort_order === 'number' ? last.sort_order : 0) + 1;
    }
    finalSortOrder = Number(finalSortOrder);

    const course = await Course.create({ name, code: finalCode, fee, duration, sort_order: finalSortOrder, description, category_id });
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
    const applicationCount = await Application.countDocuments({ course_id: req.params.id });
    if (applicationCount > 0) {
      return next(new AppError('Cannot delete course with enrolled applications.', 400));
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
