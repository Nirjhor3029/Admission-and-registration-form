require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Course = require('../models/Course');
const CourseCategory = require('../models/CourseCategory');
const ProgramLevel = require('../models/ProgramLevel');
const Batch = require('../models/Batch');
const PaymentConfig = require('../models/PaymentConfig');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    await Admin.deleteMany({});
    await Course.deleteMany({});
    await CourseCategory.deleteMany({});
    await ProgramLevel.deleteMany({});
    await Batch.deleteMany({});
    await PaymentConfig.deleteMany({});

    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@fars.com',
      password_hash: 'admin123',
      role: 'super_admin',
    });
    console.log(`Admin created: ${admin.email}`);

    const categories = await CourseCategory.insertMany([
      { name: 'Artificial Intelligence', sort_order: 1 },
      { name: 'Cyber Security', sort_order: 2 },
      { name: 'Software Development', sort_order: 3 },
      { name: 'Cloud & Enterprise', sort_order: 4 },
      { name: 'Networking', sort_order: 5 },
      { name: 'Emerging Technologies', sort_order: 6 },
      { name: 'Professional Certifications', sort_order: 7 },
      { name: 'Corporate Training', sort_order: 8 },
    ]);
    console.log(`${categories.length} categories created`);

    const courses = await Course.insertMany([
      { name: 'B.Sc. Computer Science', code: 'CS-101', fee: 45000, duration: '4 years', sort_order: 1, description: 'Bachelor program in Computer Science' },
      { name: 'Business Administration', code: 'BUS-201', fee: 42000, duration: '4 years', sort_order: 2, description: 'Bachelor program in Business Administration' },
      { name: 'Engineering Preparatory', code: 'ENG-202', fee: 35000, duration: '1 year', sort_order: 3, description: 'Engineering admission preparation' },
      { name: 'Advanced Graphic Design', code: 'DES-305', fee: 25000, duration: '6 months', sort_order: 4, description: 'Professional graphic design course' },
      { name: 'IELTS Preparation', code: 'IEL-101', fee: 15000, duration: '3 months', sort_order: 5, description: 'IELTS exam preparation' },
    ]);
    console.log(`${courses.length} courses created`);

    const levels = await ProgramLevel.insertMany([
      { name: 'Workshop', duration: '1 Day (3 Hours)', fee: 199, sort_order: 1, time_slots: ['07:30 - 10:30 PM'] },
      { name: 'Bootcamp', duration: '3 Days (9 Hours)', fee: 500, sort_order: 2, time_slots: ['07:30 - 10:30 PM'] },
      { name: 'Fundamentals', duration: '1 Month (36 Hours)', fee: 2000, sort_order: 3, time_slots: ['09:00 AM - 12:00 PM'] },
      { name: 'Intermediate', duration: '3 Months (108 Hourse)', fee: 8000, sort_order: 4, time_slots: ['02:00 PM - 05:00 PM'] },
      { name: 'Advanced', duration: '3 Months (108 Hourse)', fee: 8000, sort_order: 5, time_slots: ['05:00 PM - 08:00 PM'] },
      { name: 'Expert', duration: '3 Months (108 Hourse)', fee: 8000, sort_order: 6, time_slots: ['07:30 - 10:30 PM'] },
    ]);
    console.log(`${levels.length} program levels created`);

    const batchData = [
      { course_id: courses[0]._id, level_id: levels[2]._id, batch_name: 'Fall 2024 - A', start_date: new Date('2024-09-01'), capacity: 50, seats_filled: 45, sort_order: 1, status: 'started' },
      { course_id: courses[0]._id, level_id: levels[3]._id, batch_name: 'Spring 2025 - B', start_date: new Date('2025-01-15'), capacity: 50, seats_filled: 12, sort_order: 2, status: 'open' },
      { course_id: courses[1]._id, level_id: levels[0]._id, batch_name: 'Fall 2024', start_date: new Date('2024-09-01'), capacity: 40, seats_filled: 38, sort_order: 1, status: 'started' },
      { course_id: courses[2]._id, level_id: levels[1]._id, batch_name: 'Weekend Morning', start_date: new Date('2025-02-01'), capacity: 30, seats_filled: 30, sort_order: 1, status: 'full' },
      { course_id: courses[4]._id, level_id: levels[2]._id, batch_name: 'Weekend Morning', start_date: new Date('2025-01-10'), capacity: 30, seats_filled: 30, sort_order: 1, status: 'full' },
      { course_id: courses[4]._id, level_id: levels[4]._id, batch_name: 'Weekday Evening', start_date: new Date('2025-02-15'), capacity: 25, seats_filled: 20, sort_order: 2, status: 'open' },
    ];

    const batches = await Batch.insertMany(batchData);
    console.log(`${batches.length} batches created`);

    await PaymentConfig.create({
      bkash_number: '017XX-XXXXXX',
      nagad_number: '017XX-XXXXXX',
    });
    console.log('Payment config created');

    console.log('\nSeed completed successfully!');
    console.log('Admin login: admin@fars.com / admin123');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
