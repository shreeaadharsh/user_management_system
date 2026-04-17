const mongoose = require('mongoose');
const { User } = require('../models/User');

const seedUsers = [
  { name: 'Super Admin', email: 'admin@example.com', password: 'Admin@123', role: 'admin', status: 'active' },
  { name: 'Jane Manager', email: 'manager@example.com', password: 'Manager@123', role: 'manager', status: 'active' },
  { name: 'Alice User', email: 'alice@example.com', password: 'User@1234', role: 'user', status: 'active' },
  { name: 'Bob User', email: 'bob@example.com', password: 'User@1234', role: 'user', status: 'inactive' },
];

const seedDefaultUsersIfEmpty = async () => {
  const userCount = await User.estimatedDocumentCount();
  if (userCount > 0) {
    return;
  }

  for (const data of seedUsers) {
    const exists = await User.findOne({ email: data.email });
    if (!exists) {
      await User.create(data);
    }
  }

  console.log('🌱 Database seeded with default users.');
};

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (!uri) {
      if (isProduction) {
        throw new Error('MONGO_URI is required in production.');
      }

      console.warn('⚠️ MONGO_URI is not set. Spinning up in-memory MongoDB for local development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
      await seedDefaultUsersIfEmpty();
      return;
    }

    try {
      // Fast timeout for local connection checks.
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      if (process.env.SEED_DEFAULT_USERS === 'true') {
        await seedDefaultUsersIfEmpty();
      }
    } catch (err) {
      if (!isProduction && (uri.includes('127.0.0.1') || uri.includes('localhost'))) {
        console.warn(`⚠️ Local MongoDB not found. Spinning up in-memory MongoDB...`);
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        uri = mongoServer.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
        
        await seedDefaultUsersIfEmpty();
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
