#!/usr/bin/env node

/**
 * Admin User Initialization Script
 * 
 * This script creates the default admin user if it doesn't exist.
 * Run this script once during setup or when you need to reset admin credentials.
 * 
 * Usage:
 *   node scripts/init-admin-user.js
 *   node scripts/init-admin-user.js --username=myadmin --password=mypassword --email=admin@example.com
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Default admin credentials
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'adminpass',
  email: 'admin@newshub.com',
  role: 'admin'
};

// Parse command line arguments
const args = process.argv.slice(2);
const customArgs = {};

args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.substring(2).split('=');
    customArgs[key] = value;
  }
});

const adminCredentials = {
  username: customArgs.username || DEFAULT_ADMIN.username,
  password: customArgs.password || DEFAULT_ADMIN.password,
  email: customArgs.email || DEFAULT_ADMIN.email,
  role: customArgs.role || DEFAULT_ADMIN.role
};

// Admin User Schema (simplified for this script)
const AdminUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'super-admin'], default: 'admin' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
}, {
  timestamps: true
});

// Hash password before saving
AdminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const AdminUser = mongoose.model('AdminUser', AdminUserSchema);

async function initAdminUser() {
  try {
    console.log('🔐 Initializing Admin User...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/newshub';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await AdminUser.findOne({ 
      $or: [
        { username: adminCredentials.username },
        { email: adminCredentials.email }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Active: ${existingAdmin.isActive}`);
      console.log(`   Created: ${existingAdmin.createdAt}`);
      
      // Ask if user wants to update password
      if (process.argv.includes('--update-password')) {
        console.log('🔄 Updating password...');
        existingAdmin.password = adminCredentials.password;
        await existingAdmin.save();
        console.log('✅ Password updated successfully');
      } else {
        console.log('💡 To update password, run: node scripts/init-admin-user.js --update-password');
      }
    } else {
      // Create new admin user
      console.log('👤 Creating new admin user...');
      const adminUser = new AdminUser({
        username: adminCredentials.username,
        email: adminCredentials.email,
        password: adminCredentials.password,
        role: adminCredentials.role,
        isActive: true
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log('📋 Admin Details:');
      console.log(`   Username: ${adminUser.username}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   ID: ${adminUser._id}`);
    }

    // Display login instructions
    console.log('\n🚀 Admin Login Instructions:');
    console.log('   1. Start your application: npm run dev');
    console.log('   2. Go to: http://localhost:3000/admin/login');
    console.log(`   3. Username: ${adminCredentials.username}`);
    console.log(`   4. Password: ${adminCredentials.password}`);
    console.log('\n🔒 Security Notes:');
    console.log('   - Change the default password in production');
    console.log('   - Use environment variables for sensitive data');
    console.log('   - Enable HTTPS in production');
    console.log('   - Consider using 2FA for additional security');

  } catch (error) {
    console.error('❌ Error initializing admin user:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the initialization
initAdminUser();
