const mongoose = require('mongoose');

let isConnected = false;

/**
 * Connect to MongoDB with Mongoose ODM
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.warn(`[Database Warning] Unable to connect to MongoDB at ${uri}: ${error.message}`);
    console.warn(`[Database Notice] Application will run with local in-memory fallback data store for testing and preview.`);
    console.warn(`[Database Tip] To persist data permanently, install MongoDB locally or configure MONGODB_URI in backend/.env with a MongoDB Atlas cluster URI.`);
    return null;
  }
};

const getDBStatus = () => {
  return {
    isConnected: mongoose.connection.readyState === 1 || isConnected,
    state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'disconnected',
    host: mongoose.connection.host || 'local-fallback',
  };
};

module.exports = {
  connectDB,
  getDBStatus,
};
