// ===========================================
// DATABASE CONFIGURATION
// ===========================================
// This file handles connecting to MongoDB
// We keep it separate to keep code organized
// ===========================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('❌ Database Connection Error:', error.message);
    process.exit(1); // Stop the server if DB fails
  }
};

module.exports = connectDB;
