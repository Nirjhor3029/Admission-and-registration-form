const Batch = require('../models/Batch');
const Application = require('../models/Application');
const AppError = require('../utils/AppError');

const listBatches = async (req, res, next) => {
  try {
    const { course_id, level_id } = req.query;
    const filter = {};
    if (course_id) filter.course_id = course_id;
    if (level_id) filter.level_id = level_id;
    const batches = await Batch.find(filter).populate('course_id', 'name code').sort({ sort_order: 1, start_date: 1 });
    res.json({ success: true, data: { batches } });
  } catch (err) {
    next(err);
  }
};

const createBatch = async (req, res, next) => {
  try {
    const { course_id, level_id, batch_name, start_date, capacity, class_schedule } = req.body;
    if (!course_id || !batch_name || !start_date || !capacity) {
      return next(new AppError('Course, batch name, start date, and capacity are required.', 400));
    }
    const batch = await Batch.create({
      course_id, level_id, batch_name, start_date, capacity, class_schedule,
    });
    res.status(201).json({ success: true, data: { batch } });
  } catch (err) {
    next(err);
  }
};

const updateBatch = async (req, res, next) => {
  try {
    const updates = req.body;
    if (updates.capacity && updates.capacity < 0) {
      return next(new AppError('Capacity cannot be negative.', 400));
    }
    const batch = await Batch.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true,
    });
    if (!batch) return next(new AppError('Batch not found.', 404));
    res.json({ success: true, data: { batch } });
  } catch (err) {
    next(err);
  }
};

const deleteBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return next(new AppError('Batch not found.', 404));
    const enrolled = await Application.exists({ batch_id: batch._id });
    if (enrolled) {
      return next(new AppError('Cannot delete a batch that has enrolled applications.', 400));
    }
    await Batch.findByIdAndDelete(batch._id);
    res.json({ success: true, message: 'Batch deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listBatches, createBatch, updateBatch, deleteBatch };
