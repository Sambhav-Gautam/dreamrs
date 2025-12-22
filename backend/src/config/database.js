const mongoose = require('mongoose');

let gfs;
let gridfsBucket;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Initialize GridFS bucket after connection
    const db = conn.connection.db;
    gridfsBucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads'
    });

    console.log('GridFS bucket initialized');

    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const getGridFSBucket = () => {
  if (!gridfsBucket) {
    throw new Error('GridFS bucket not initialized');
  }
  return gridfsBucket;
};

module.exports = { connectDB, getGridFSBucket };
