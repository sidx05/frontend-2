import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminSession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSessionSchema = new Schema<IAdminSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  refreshExpiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  userAgent: {
    type: String
  },
  ipAddress: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
AdminSessionSchema.index({ userId: 1, isActive: 1 });
AdminSessionSchema.index({ token: 1 });
AdminSessionSchema.index({ refreshToken: 1 });

// Static method to clean up expired sessions
AdminSessionSchema.statics.cleanupExpiredSessions = async function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { refreshExpiresAt: { $lt: new Date() } }
    ]
  });
};

// Static method to deactivate all sessions for a user
AdminSessionSchema.statics.deactivateUserSessions = async function(userId: mongoose.Types.ObjectId) {
  return this.updateMany(
    { userId, isActive: true },
    { isActive: false }
  );
};

export default mongoose.models.AdminSession || mongoose.model<IAdminSession>('AdminSession', AdminSessionSchema);
