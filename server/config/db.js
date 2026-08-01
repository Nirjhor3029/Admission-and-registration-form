const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    if (err.message && err.message.includes('querySrv') && err.code === 'ECONNREFUSED') {
      console.log('SRV DNS lookup failed, retrying with public DNS...');
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected (public DNS): ${conn.connection.host}`);
      } catch (err2) {
        console.error(`MongoDB connection error: ${err2.message}`);
        process.exit(1);
      }
    } else {
      console.error(`MongoDB connection error: ${err.message}`);
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = connectDB;
