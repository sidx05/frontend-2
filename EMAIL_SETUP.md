# Email Setup for Newsletter Notifications

This guide will help you set up email notifications for newsletter subscriptions.

## Overview

When users subscribe to the newsletter via the "Stay Updated" box in the left sidebar, you will receive:
1. An email notification at `team.newshub@outlook.com` with the subscriber's email
2. A confirmation email is sent to the subscriber

## Setup Instructions

### 1. Create Outlook Account (if needed)
- Go to https://outlook.live.com
- Create an account with email: `team.newshub@outlook.com`
- Set a strong password

### 2. Enable SMTP Access in Outlook
- Sign in to your Outlook account
- Go to Settings > View all Outlook settings > Mail > Sync email
- Enable IMAP or POP access if needed
- **For App Passwords (recommended):**
  - Go to https://account.microsoft.com/security
  - Enable Two-Step Verification if not already enabled
  - Go to "Security" > "Advanced security options" > "App passwords"
  - Generate a new app password for "Mail"
  - Save this password - you'll need it for the next step

### 3. Configure Environment Variables

Add these to your `.env` file (NOT `.env.example`):

```bash
# Email Configuration
EMAIL_USER=team.newshub@outlook.com
EMAIL_PASSWORD=your-app-password-here  # Use the app password generated above
NEXT_PUBLIC_BASE_URL=https://your-domain.com  # Or http://localhost:3000 for local
```

### 4. Update Your .env File

Copy `.env.example` to `.env` if you haven't already:
```bash
cp env.example .env
```

Then edit `.env` and update the email settings with your actual credentials.

## Testing

1. Start your application:
```bash
npm run dev
```

2. Go to the homepage
3. Find the "Stay Updated" box in the left sidebar
4. Enter a test email address
5. Click "Subscribe"
6. Check your inbox at `team.newshub@outlook.com` for the notification

## Production Deployment

### For Vercel/Netlify:
1. Go to your project settings
2. Add environment variables:
   - `EMAIL_USER`: team.newshub@outlook.com
   - `EMAIL_PASSWORD`: your-app-password
   - `NEXT_PUBLIC_BASE_URL`: https://your-domain.com

### For Railway/Render:
1. Go to your service settings
2. Add the same environment variables in the "Environment" section

## Troubleshooting

### Emails not sending?
1. **Check environment variables**: Make sure `EMAIL_USER` and `EMAIL_PASSWORD` are set
2. **Check Outlook settings**: Verify SMTP is enabled
3. **Use App Password**: Don't use your regular password, use the app password
4. **Check console logs**: Look for error messages in the server logs
5. **Firewall/Port blocking**: Ensure port 587 is not blocked

### Common Issues:

**"Authentication failed"**
- You're using your regular password instead of an app password
- Two-factor authentication is not enabled
- App password was not generated correctly

**"Connection timeout"**
- Port 587 might be blocked by your firewall/network
- Check if your hosting provider allows outbound SMTP connections

**Duplicate email subscriptions**
- The system prevents duplicate subscriptions
- Each email can only subscribe once
- User will see "Email already subscribed" error

## Email Templates

### Notification Email (to you)
When someone subscribes, you'll receive:
- Subject: "🔔 New Newsletter Subscription"
- Contains: subscriber's email, timestamp

### Confirmation Email (to subscriber)
The subscriber receives:
- Subject: "Welcome to NewsHub Newsletter! 📰"
- Contains: welcome message, link to visit site, unsubscribe info

## Database

Subscriber emails are stored in MongoDB:
- Collection: `subscribers`
- Fields: `email`, `subscribedAt`, `active`
- Emails are unique (no duplicates)

## Security Notes

1. **Never commit your .env file**: It contains sensitive credentials
2. **Use App Passwords**: More secure than regular passwords
3. **Keep .env.example updated**: But without real credentials
4. **Rotate passwords regularly**: Change app passwords periodically

## Support

If you need help:
- Check server logs for detailed error messages
- Verify all environment variables are set correctly
- Test with a simple email first
- Contact your hosting provider if SMTP is blocked

## Alternative Email Services

If you prefer other email services:

### Gmail:
```javascript
host: 'smtp.gmail.com',
port: 587,
```

### SendGrid:
```javascript
host: 'smtp.sendgrid.net',
port: 587,
auth: {
  user: 'apikey',
  pass: process.env.SENDGRID_API_KEY
}
```

### AWS SES:
```javascript
host: 'email-smtp.us-east-1.amazonaws.com',
port: 587,
```

To switch, update the `transporter` configuration in:
`src/app/api/newsletter/subscribe/route.ts`
