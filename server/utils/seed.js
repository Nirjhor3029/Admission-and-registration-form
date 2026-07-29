require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Course = require('../models/Course');
const Batch = require('../models/Batch');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    await Admin.deleteMany({});
    await Course.deleteMany({});
    await Batch.deleteMany({});

    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@fars.com',
      password_hash: 'admin123',
      role: 'super_admin',
    });
    console.log(`Admin created: ${admin.email}`);

    const courses = await Course.insertMany([
      { name: 'B.Sc. Computer Science', code: 'CS-101', fee: 45000, duration: '4 years', description: 'Bachelor program in Computer Science' },
      { name: 'Business Administration', code: 'BUS-201', fee: 42000, duration: '4 years', description: 'Bachelor program in Business Administration' },
      { name: 'Engineering Preparatory', code: 'ENG-202', fee: 35000, duration: '1 year', description: 'Engineering admission preparation' },
      { name: 'Advanced Graphic Design', code: 'DES-305', fee: 25000, duration: '6 months', description: 'Professional graphic design course' },
      { name: 'IELTS Preparation', code: 'IEL-101', fee: 15000, duration: '3 months', description: 'IELTS exam preparation' },
    ]);
    console.log(`${courses.length} courses created`);

    const batchData = [
      { course_id: courses[0]._id, batch_name: 'Fall 2024 - A', start_date: new Date('2024-09-01'), capacity: 50, seats_filled: 45, status: 'started' },
      { course_id: courses[0]._id, batch_name: 'Spring 2025 - B', start_date: new Date('2025-01-15'), capacity: 50, seats_filled: 12, status: 'open' },
      { course_id: courses[1]._id, batch_name: 'Fall 2024', start_date: new Date('2024-09-01'), capacity: 40, seats_filled: 38, status: 'started' },
      { course_id: courses[2]._id, batch_name: 'Weekend Morning', start_date: new Date('2025-02-01'), capacity: 30, seats_filled: 30, status: 'full' },
      { course_id: courses[4]._id, batch_name: 'Weekend Morning', start_date: new Date('2025-01-10'), capacity: 30, seats_filled: 30, status: 'full' },
      { course_id: courses[4]._id, batch_name: 'Weekday Evening', start_date: new Date('2025-02-15'), capacity: 25, seats_filled: 20, status: 'open' },
    ];

    const batches = await Batch.insertMany(batchData);
    console.log(`${batches.length} batches created`);

    console.log('\nSeed completed successfully!');
    console.log('Admin login: admin@fars.com / admin123');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
