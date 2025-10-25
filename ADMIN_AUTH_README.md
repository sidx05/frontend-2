# 🔐 Admin Authentication System

This document describes the robust, database-backed authentication system for the NewsHub admin panel. This system is designed to be **persistent, secure, and maintenance-free** for years.

## 🚀 Quick Start

### 1. Initialize Admin User
```bash
# Create default admin user
npm run admin:init

# Or with custom credentials
node scripts/init-admin-user.js --username=myadmin --password=mypassword --email=admin@example.com
```

### 2. Login
- Go to: `http://localhost:3000/admin/login`
- Username: `admin`
- Password: `adminpass`

## 🏗️ Architecture

### Database Models

#### AdminUser
- **Persistent storage** in MongoDB
- **Password hashing** with bcrypt (12 rounds)
- **Account locking** after 5 failed attempts (2 hours)
- **Login attempt tracking**
- **Role-based access** (admin, super-admin)

#### AdminSession
- **Session management** with JWT tokens
- **Refresh token support** (30 days)
- **Automatic expiration** with MongoDB TTL
- **User agent and IP tracking**
- **Session invalidation** on logout

### Authentication Flow

1. **Login**: Username/password → Database verification → JWT tokens
2. **Access**: JWT token → Middleware verification → Access granted
3. **Refresh**: Refresh token → New JWT tokens
4. **Logout**: Token invalidation → Session cleanup

## 🔧 Configuration

### Environment Variables
```bash
# Required
MONGODB_URI=mongodb://localhost:27017/newshub
JWT_SECRET=your-super-secure-jwt-secret-change-in-production-2024
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-change-in-production-2024

# Optional
ADMIN_USERNAME=admin
ADMIN_PASSWORD=adminpass
ADMIN_EMAIL=admin@newshub.com
```

### JWT Configuration
- **Access Token**: 24 hours
- **Refresh Token**: 30 days
- **Algorithm**: HS256
- **Issuer**: newshub-admin
- **Audience**: newshub-admin-panel

## 🛠️ Management Commands

### Admin User Management
```bash
# Initialize admin user
npm run admin:init

# Reset admin password
npm run admin:reset

# Custom admin user
node scripts/init-admin-user.js --username=myadmin --password=mypassword --email=admin@example.com
```

### Session Management
```bash
# Clean up expired sessions
npm run sessions:cleanup

# Manual cleanup (if needed)
node scripts/cleanup-sessions.js
```

## 🔒 Security Features

### Password Security
- **bcrypt hashing** with 12 salt rounds
- **Minimum 6 characters** required
- **No password storage** in plain text

### Account Protection
- **Account locking** after 5 failed attempts
- **2-hour lockout** period
- **Login attempt tracking**
- **Automatic unlock** after lockout expires

### Session Security
- **JWT tokens** with expiration
- **Refresh token rotation**
- **Session invalidation** on logout
- **User agent tracking**
- **IP address logging**

### Token Security
- **Secure JWT secrets** (change in production)
- **Token expiration** (24h access, 30d refresh)
- **Session-based tokens** (database validation)
- **Automatic cleanup** of expired tokens

## 📊 Database Schema

### AdminUser Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['admin', 'super-admin']),
  isActive: Boolean (default: true),
  lastLogin: Date,
  loginAttempts: Number (default: 0),
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### AdminSession Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: AdminUser),
  token: String (unique, required),
  refreshToken: String (unique, required),
  expiresAt: Date (TTL index),
  refreshExpiresAt: Date (TTL index),
  userAgent: String,
  ipAddress: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 API Endpoints

### Authentication
- `POST /api/admin/auth/login` - Login with credentials
- `POST /api/admin/auth/refresh` - Refresh access token
- `POST /api/admin/auth/logout` - Logout and invalidate session

### Request/Response Examples

#### Login
```javascript
// Request
POST /api/admin/auth/login
{
  "username": "admin",
  "password": "adminpass"
}

// Response
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "68ea2e050582e9f60368cf3c",
    "username": "admin",
    "email": "admin@newshub.com",
    "role": "admin",
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Token Refresh
```javascript
// Request
POST /api/admin/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

## 🚨 Error Handling

### Common Error Responses
```javascript
// Invalid credentials
{
  "success": false,
  "message": "Invalid username or password"
}

// Account locked
{
  "success": false,
  "message": "Account is temporarily locked due to too many failed login attempts. Please try again later."
}

// Invalid token
{
  "success": false,
  "message": "Invalid or expired session"
}
```

## 🔧 Maintenance

### Regular Tasks
1. **Session Cleanup**: Run `npm run sessions:cleanup` weekly
2. **Password Updates**: Change default passwords in production
3. **Security Updates**: Keep dependencies updated
4. **Log Monitoring**: Monitor authentication logs

### Production Checklist
- [ ] Change default JWT secrets
- [ ] Use strong admin passwords
- [ ] Enable HTTPS
- [ ] Set up session cleanup cron job
- [ ] Monitor failed login attempts
- [ ] Regular security audits

## 🆘 Troubleshooting

### Common Issues

#### "Account is locked"
- Wait 2 hours for automatic unlock
- Or reset password: `npm run admin:reset`

#### "Invalid token"
- Clear browser cookies
- Login again
- Check JWT_SECRET environment variable

#### "Database connection failed"
- Check MONGODB_URI environment variable
- Ensure MongoDB is running
- Verify database permissions

### Debug Mode
Visit `/admin/debug` to see:
- Authentication status
- Cookie information
- Session details
- System information

## 🔮 Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, GitHub)
- [ ] Role-based permissions
- [ ] Audit logging
- [ ] Password complexity requirements
- [ ] Account recovery via email
- [ ] Session management UI

## 📝 Notes

- **Persistent**: Data stored in MongoDB, survives server restarts
- **Secure**: Industry-standard security practices
- **Maintenance-free**: Automated cleanup and expiration
- **Scalable**: Supports multiple admin users
- **Future-proof**: Extensible architecture

This authentication system is designed to work reliably for years without requiring code changes or maintenance.
