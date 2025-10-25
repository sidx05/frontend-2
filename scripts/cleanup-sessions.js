#!/usr/bin/env node

/**
 * Session Cleanup Script
 * 
 * This script cleans up expired admin sessions from the database.
 * Run this periodically (e.g., via cron job) to maintain database performance.
 * 
 * Usage:
 *   node scripts/cleanup-sessions.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// AdminSession Schema (simplified for this script)
const AdminSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
  token: { type: String, required: true, unique: true },
  refreshToken: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  refreshExpiresAt: { type: Date, required: true },
  userAgent: { type: String },
  ipAddress: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const AdminSession = mongoose.model('AdminSession', AdminSessionSchema);

async function cleanupSessions() {
  try {
    console.log('🧹 Starting session cleanup...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/newshub';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Count sessions before cleanup
    const totalSessions = await AdminSession.countDocuments();
    const expiredSessions = await AdminSession.countDocuments({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { refreshExpiresAt: { $lt: new Date() } }
      ]
    });

    console.log(`📊 Session Statistics:`);
    console.log(`   Total sessions: ${totalSessions}`);
    console.log(`   Expired sessions: ${expiredSessions}`);

    if (expiredSessions > 0) {
      // Clean up expired sessions
      const result = await AdminSession.deleteMany({
        $or: [
          { expiresAt: { $lt: new Date() } },
          { refreshExpiresAt: { $lt: new Date() } }
        ]
      });

      console.log(`🗑️  Cleaned up ${result.deletedCount} expired sessions`);
    } else {
      console.log('✨ No expired sessions found');
    }

    // Count sessions after cleanup
    const remainingSessions = await AdminSession.countDocuments();
    console.log(`📈 Remaining active sessions: ${remainingSessions}`);

    console.log('✅ Session cleanup completed successfully');

  } catch (error) {
    console.error('❌ Error during session cleanup:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupSessions();
