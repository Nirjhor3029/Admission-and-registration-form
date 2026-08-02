const ProgramLevel = require('../models/ProgramLevel');
const Batch = require('../models/Batch');
const AppError = require('../utils/AppError');

const listLevels = async (req, res, next) => {
  try {
    const levels = await ProgramLevel.find({ status: 'active' }).sort({ sort_order: 1, name: 1 });
    res.json({ success: true, data: levels });
  } catch (err) {
    next(err);
  }
};

const createLevel = async (req, res, next) => {
  try {
    const { name, duration, fee, time_slots } = req.body;
    if (!name || !duration || fee === undefined) {
      return next(new AppError('Name, duration, and fee are required.', 400));
    }
    const level = await ProgramLevel.create({ name, duration, fee, time_slots: time_slots || [] });
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
    const level = await ProgramLevel.findById(req.params.id);
    if (!level) return next(new AppError('Level not found.', 404));
    const referenced = await Batch.exists({ level_id: level._id });
    if (referenced) {
      return next(new AppError('Cannot delete a program level that is referenced by batches.', 400));
    }
    await ProgramLevel.findByIdAndDelete(level._id);
    res.json({ success: true, message: 'Level deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listLevels, createLevel, updateLevel, deleteLevel };
