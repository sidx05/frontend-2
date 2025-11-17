# How to Update Environment Variables in Vercel and Render

## 📌 Environment Variables to Add

You need to add these email-related environment variables to both Vercel (frontend) and Render (backend if needed):

```bash
EMAIL_USER=team.newshub@outlook.com
EMAIL_PASSWORD=your-outlook-app-password-here
NEXT_PUBLIC_BASE_URL=https://your-actual-domain.com
```

---

## 🚀 Vercel (Frontend Deployment)

### Method 1: Via Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your project (frontend-2)

2. **Access Settings**
   - Click on the "Settings" tab at the top

3. **Navigate to Environment Variables**
   - In the left sidebar, click "Environment Variables"

4. **Add Variables**
   For each variable:
   - Click "Add New" button
   - **Name**: `EMAIL_USER`
   - **Value**: `team.newshub@outlook.com`
   - **Environment**: Select all (Production, Preview, Development)
   - Click "Save"
   
   Repeat for:
   - **Name**: `EMAIL_PASSWORD`
     - **Value**: Your Outlook app password
     - **Environment**: Production only (for security)
   
   - **Name**: `NEXT_PUBLIC_BASE_URL`
     - **Value**: `https://your-domain.vercel.app` (or your custom domain)
     - **Environment**: All environments

5. **Redeploy** (Important!)
   - Go to "Deployments" tab
   - Click the three dots (...) on the latest deployment
   - Select "Redeploy"
   - Or push a new commit to trigger auto-deployment

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login
vercel login

# Add environment variables
vercel env add EMAIL_USER
# Enter: team.newshub@outlook.com
# Select: Production, Preview, Development

vercel env add EMAIL_PASSWORD
# Enter: your-app-password
# Select: Production

vercel env add NEXT_PUBLIC_BASE_URL
# Enter: https://your-domain.vercel.app
# Select: Production, Preview, Development

# Redeploy
vercel --prod
```

---

## 🔧 Render (Backend Deployment)

### Via Dashboard

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Select your backend service

2. **Access Environment**
   - Click on your service name
   - In the left sidebar, click "Environment"

3. **Add Environment Variables**
   - Click "Add Environment Variable" button
   
   Add these:
   
   | Key | Value |
   |-----|-------|
   | `EMAIL_USER` | `team.newshub@outlook.com` |
   | `EMAIL_PASSWORD` | Your Outlook app password |
   | `NEXT_PUBLIC_BASE_URL` | `https://your-frontend-domain.com` |

4. **Save Changes**
   - Click "Save Changes" button
   - Render will automatically redeploy your service

### Important Notes for Render:

- **MongoDB URI**: Make sure `MONGODB_URI` is already set
- **Other Required Variables**: Ensure these are also set:
  ```
  NODE_ENV=production
  JWT_SECRET=your-jwt-secret
  BACKEND_ADMIN_TOKEN=your-admin-token
  ```

---

## 🔐 Getting Your Outlook App Password

### Step-by-Step:

1. **Enable Two-Factor Authentication**
   - Go to https://account.microsoft.com/security
   - Click "Two-step verification"
   - Follow the setup process

2. **Generate App Password**
   - After 2FA is enabled, go back to https://account.microsoft.com/security
   - Click "Advanced security options"
   - Scroll to "App passwords"
   - Click "Create a new app password"
   - Name it "NewsHub Newsletter" or similar
   - Copy the generated password (you won't see it again!)

3. **Use This Password**
   - This is what you'll use for `EMAIL_PASSWORD`
   - NOT your regular Outlook password

---

## ✅ Verification Steps

### After Adding Variables:

1. **Check Vercel Build Logs**
   ```
   Go to Vercel → Deployments → Latest → View Details
   Look for any build errors
   ```

2. **Test Newsletter Subscription**
   - Go to your live site
   - Find "Stay Updated" box in sidebar
   - Enter a test email
   - Click Subscribe
   - Check if you receive notification at team.newshub@outlook.com

3. **Check Render Logs**
   ```
   Go to Render → Your Service → Logs
   Look for "New newsletter subscription" messages
   ```

---

## 🐛 Troubleshooting

### Vercel

**Variables not working?**
- Make sure you selected the right environments (Production/Preview/Development)
- Redeploy after adding variables
- For `NEXT_PUBLIC_*` variables, they must be set before build time

**Check if variables are loaded:**
```javascript
// Add this temporarily to a page to debug
console.log('Email User:', process.env.EMAIL_USER);
console.log('Base URL:', process.env.NEXT_PUBLIC_BASE_URL);
```

### Render

**Service not restarting?**
- Click "Manual Deploy" → "Clear build cache & deploy"
- Check if service is in "Suspended" state

**Email not sending?**
- Check Render logs for authentication errors
- Verify app password is correct
- Ensure SMTP port 587 is not blocked

---

## 📱 Quick Reference Commands

### View Current Vercel Variables:
```bash
vercel env ls
```

### Pull Vercel Environment to Local:
```bash
vercel env pull .env.local
```

### Remove a Variable:
```bash
vercel env rm EMAIL_PASSWORD production
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** to git
2. **Use different passwords** for production vs development
3. **Rotate app passwords** every 3-6 months
4. **Use secret management** for sensitive data in production
5. **Limit environment access** to Production only when possible

---

## 📞 Need Help?

If you encounter issues:

1. **Vercel Support**: https://vercel.com/help
2. **Render Support**: https://render.com/docs
3. **Check Deployment Logs**: Always check logs first
4. **Test Locally First**: Verify email works locally before deploying

---

## Summary Checklist

- [ ] Created Outlook app password
- [ ] Added `EMAIL_USER` to Vercel
- [ ] Added `EMAIL_PASSWORD` to Vercel  
- [ ] Added `NEXT_PUBLIC_BASE_URL` to Vercel
- [ ] Redeployed Vercel
- [ ] Added same variables to Render (if backend sends emails)
- [ ] Tested newsletter subscription on live site
- [ ] Received email notification
- [ ] Checked deployment logs for errors
