const ProgramLevel = require('../models/ProgramLevel');
const AppError = require('../utils/AppError');

const listLevels = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const levels = await ProgramLevel.find({ course_id: courseId, status: 'active' }).sort('name');
    res.json({ success: true, data: levels });
  } catch (err) {
    next(err);
  }
};

const createLevel = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { name, duration, fee, time_slots } = req.body;
    if (!name || !duration || fee === undefined) {
      return next(new AppError('Name, duration, and fee are required.', 400));
    }
    const level = await ProgramLevel.create({ course_id: courseId, name, duration, fee, time_slots: time_slots || [] });
    res.status(201).json({ success: true, data: level });
  } catch (err) {
    next(err);
  }
};

const updateLevel = async (req, res, next) => {
  try {
    const level = await ProgramLevel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!level) return next(new AppError('Level not found.', 404));
    res.json({ success: true, data: level });
  } catch (err) {
    next(err);
  }
};

const deleteLevel = async (req, res, next) => {
  try {
    const level = await ProgramLevel.findByIdAndDelete(req.params.id);
    if (!level) return next(new AppError('Level not found.', 404));
    res.json({ success: true, message: 'Level deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listLevels, createLevel, updateLevel, deleteLevel };
