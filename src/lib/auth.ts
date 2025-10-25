import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import connectDB from './database';
import AdminUser, { IAdminUser } from '@/models/AdminUser';
import AdminSession from '@/models/AdminSession';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secure-refresh-secret-change-in-production-2024';
const JWT_EXPIRES_IN = '24h';
const JWT_REFRESH_EXPIRES_IN = '30d';

export interface AuthResult {
  success: boolean;
  message?: string;
  user?: any;
  token?: string;
  refreshToken?: string;
}

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  sessionId: string;
}

export class AuthService {
  // Generate secure tokens
  private static generateTokens(userId: string, username: string, role: string, sessionId: string) {
    const payload: TokenPayload = {
      userId,
      username,
      role,
      sessionId
    };

    const token = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'newshub-admin',
      audience: 'newshub-admin-panel'
    });

    const refreshToken = jwt.sign(
      { userId, sessionId }, 
      JWT_REFRESH_SECRET, 
      { 
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        issuer: 'newshub-admin',
        audience: 'newshub-admin-panel'
      }
    );
    return { token, refreshToken };
  }

  // Login with username and password
  static async login(username: string, password: string, userAgent?: string, ipAddress?: string): Promise<AuthResult> {
    try {
      await connectDB();

      const user = await AdminUser.findOne({ 
        username: username.toLowerCase().trim(),
        isActive: true 
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Check if account is locked
      if (user.isLocked()) {
        return {
          success: false,
          message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
        };
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Generate session ID
      const sessionId = crypto.randomUUID();

      // Generate tokens
      const { token, refreshToken } = this.generateTokens(
        user._id.toString(),
        user.username,
        user.role,
        sessionId
      );

      // Calculate expiration dates
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Create session
      await AdminSession.create({
        userId: user._id,
        token,
        refreshToken,
        expiresAt,
        refreshExpiresAt,
        userAgent,
        ipAddress,
        isActive: true
      });

      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        },
        token,
        refreshToken
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login'
      };
    }
  }

  // Verify token and get user
  static async verifyToken(token: string): Promise<{ success: boolean; user?: any; message?: string }> {
    try {
      await connectDB();

      // Verify JWT
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

      // Check if session exists and is active
      const session = await AdminSession.findOne({
        token,
        isActive: true,
        expiresAt: { $gt: new Date() }
      }).populate('userId');

      if (!session) {
        return {
          success: false,
          message: 'Invalid or expired session'
        };
      }

      const user = session.userId as any;
      
      if (!user || !user.isActive) {
        return {
          success: false,
          message: 'User account is inactive'
        };
      }

      return {
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        }
      };

    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        message: 'Invalid token'
      };
    }
  }

  // Refresh token
  static async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      await connectDB();

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;

      // Check if session exists and is active
      const session = await AdminSession.findOne({
        refreshToken,
        isActive: true,
        refreshExpiresAt: { $gt: new Date() }
      }).populate('userId');

      if (!session) {
        return {
          success: false,
          message: 'Invalid or expired refresh token'
        };
      }

      const user = session.userId as any;
      
      if (!user || !user.isActive) {
        return {
          success: false,
          message: 'User account is inactive'
        };
      }

      // Generate new tokens
      const { token: newToken, refreshToken: newRefreshToken } = this.generateTokens(
        user._id.toString(),
        user.username,
        user.role,
        session._id.toString()
      );

      // Update session with new tokens
      const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const newRefreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await AdminSession.findByIdAndUpdate(session._id, {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
        refreshExpiresAt: newRefreshExpiresAt
      });

      return {
        success: true,
        message: 'Token refreshed successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        },
        token: newToken,
        refreshToken: newRefreshToken
      };

    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        message: 'Invalid refresh token'
      };
    }
  }

  // Logout (deactivate session)
  static async logout(token: string): Promise<{ success: boolean; message?: string }> {
    try {
      await connectDB();

      await AdminSession.findOneAndUpdate(
        { token, isActive: true },
        { isActive: false }
      );

      return {
        success: true,
        message: 'Logout successful'
      };

    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'An error occurred during logout'
      };
    }
  }

  // Logout all sessions for a user
  static async logoutAllSessions(userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      await connectDB();

      await AdminSession.updateMany(
        { userId: new mongoose.Types.ObjectId(userId), isActive: true },
        { isActive: false }
      );

      return {
        success: true,
        message: 'All sessions logged out successfully'
      };

    } catch (error) {
      console.error('Logout all sessions error:', error);
      return {
        success: false,
        message: 'An error occurred during logout'
      };
    }
  }

  // Clean up expired sessions (call this periodically)
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      await connectDB();
      await AdminSession.deleteMany({
        $or: [
          { expiresAt: { $lt: new Date() } },
          { refreshExpiresAt: { $lt: new Date() } }
        ]
      });
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }
}
