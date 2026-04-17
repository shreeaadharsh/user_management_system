const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { User } = require('../models/User'); // For seeding

const seedUsers = [
  { name: 'Super Admin', email: 'admin@example.com', password: 'Admin@123', role: 'admin', status: 'active' },
  { name: 'Jane Manager', email: 'manager@example.com', password: 'Manager@123', role: 'manager', status: 'active' },
  { name: 'Alice User', email: 'alice@example.com', password: 'User@1234', role: 'user', status: 'active' },
  { name: 'Bob User', email: 'bob@example.com', password: 'User@1234', role: 'user', status: 'inactive' },
];

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    
    try {
      // Fast timeout for local check
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
        console.warn(`⚠️ Local MongoDB not found. Spinning up in-memory MongoDB...`);
        const mongoServer = await MongoMemoryServer.create();
        uri = mongoServer.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
        
        // Auto-seed for in-memory DB since it's empty
        for (const data of seedUsers) {
          const exists = await User.findOne({ email: data.email });
          if (!exists) {
            await User.create(data);
          }
        }
        console.log(`🌱 In-Memory DB auto-seeded with default users.`);
        return;
      }
      throw err;
    }
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
