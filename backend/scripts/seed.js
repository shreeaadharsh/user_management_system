require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../src/models/User');
const connectDB = require('../src/config/db');

const seedUsers = [
  {
    name: 'Super Admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin',
    status: 'active',
  },
  {
    name: 'Jane Manager',
    email: 'manager@example.com',
    password: 'Manager@123',
    role: 'manager',
    status: 'active',
  },
  {
    name: 'Alice User',
    email: 'alice@example.com',
    password: 'User@1234',
    role: 'user',
    status: 'active',
  },
  {
    name: 'Bob User',
    email: 'bob@example.com',
    password: 'User@1234',
    role: 'user',
    status: 'inactive',
  },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seed...');

    // Find or create admin first
    let adminUser = await User.findOne({ email: 'admin@example.com' });

    for (const userData of seedUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (exists) {
        console.log(`⏭️  User ${userData.email} already exists, skipping.`);
        continue;
      }

      const newUser = new User({
        ...userData,
        createdBy: adminUser ? adminUser._id : null,
      });

      await newUser.save();
      if (userData.email === 'admin@example.com') {
        adminUser = newUser;
      }
      console.log(`✅ Created ${userData.role}: ${userData.email} (${userData.password})`);
    }

    console.log('\n🎉 Seed completed!');
    console.log('\n📋 Default credentials:');
    console.log('   Admin:   admin@example.com    / Admin@123');
    console.log('   Manager: manager@example.com  / Manager@123');
    console.log('   User:    alice@example.com    / User@1234');
    console.log('   User:    bob@example.com      / User@1234 (inactive)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
