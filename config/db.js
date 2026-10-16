
const dns = require('node:dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed!');
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
