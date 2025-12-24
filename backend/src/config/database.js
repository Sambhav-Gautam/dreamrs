const mongoose = require('mongoose');

let gfs;
let gridfsBucket;
let cachedConnection = null;

const connectDB = async () => {
  // Return cached connection if available (for serverless)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false, // Disable buffering for serverless
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Initialize GridFS bucket after connection
    const db = conn.connection.db;
    gridfsBucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads'
    });

    console.log('GridFS bucket initialized');

    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error; // Don't exit in serverless, just throw
  }
};

const getGridFSBucket = () => {
  if (!gridfsBucket) {
    throw new Error('GridFS bucket not initialized');
  }
  return gridfsBucket;
};

module.exports = { connectDB, getGridFSBucket };
