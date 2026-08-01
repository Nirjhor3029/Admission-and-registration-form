require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'FARS API is running' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/registrations', require('./routes/registration'));
app.use('/api/students', require('./routes/student'));
app.use('/api/courses', require('./routes/course'));
app.use('/api/program-levels', require('./routes/programLevel'));
app.use('/api/batches', require('./routes/batch'));
app.use('/api/reports', require('./routes/report'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/student', require('./routes/studentDashboard'));
app.use('/api/leads', require('./routes/lead'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`FARS server running on port ${PORT}`);
  });
}

module.exports = app;
