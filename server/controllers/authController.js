const Admin = require('../models/Admin');
const Student = require('../models/Student');
const { generateToken, generateRefreshToken } = require('../services/authService');
const AppError = require('../utils/AppError');

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError('Email and password are required.', 400));
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const token = generateToken({
      id: admin._id,
      role: admin.role,
      type: 'admin',
    });
    const refreshToken = generateRefreshToken({ id: admin._id, type: 'admin' });

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const studentLogin = async (req, res, next) => {
  try {
    const { mobile, student_id } = req.body;
    if (!mobile && !student_id) {
      return next(new AppError('Mobile number or Student ID is required.', 400));
    }

    const query = student_id ? { student_id_number: student_id } : { mobile };
    const student = await Student.findOne(query);
    if (!student) {
      return next(new AppError('Student not found.', 404));
    }

    const token = generateToken({
      id: student._id,
      type: 'student',
    });
    const refreshToken = generateRefreshToken({ id: student._id, type: 'student' });

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        student: {
          id: student._id,
          name: student.student_name,
          status: student.status,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { adminLogin, studentLogin };
