const mongoose = require('mongoose');

let gfs;
let gridfsBucket;

// Global cached connection promise for serverless
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Return cached connection if available
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If a connection is in progress, wait for it
  if (cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  try {
    // Optimized connection options for serverless
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,           // Limit connections for serverless
      minPoolSize: 1,            // Keep at least 1 connection warm
      serverSelectionTimeoutMS: 5000,  // Faster timeout
      socketTimeoutMS: 45000,    // Close sockets after 45s
      maxIdleTimeMS: 10000,      // Close idle connections after 10s
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts);
    cached.conn = await cached.promise;

    console.log(`MongoDB Connected: ${cached.conn.connection.host}`);

    // Initialize GridFS bucket after connection
    const db = cached.conn.connection.db;
    gridfsBucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads'
    });

    console.log('GridFS bucket initialized');

    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset on error to allow retry
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

const getGridFSBucket = () => {
  if (!gridfsBucket) {
    throw new Error('GridFS bucket not initialized');
  }
  return gridfsBucket;
};

module.exports = { connectDB, getGridFSBucket };
