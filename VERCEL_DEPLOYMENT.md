# Vercel Frontend Deployment Guide

## Environment Variables Setup

### 1. Vercel Dashboard Setup

Go to your Vercel project → **Settings** → **Environment Variables**

Add the following variable for **Production**, **Preview**, and **Development**:

```env
BACKEND_URL=https://your-render-backend-url.onrender.com
```

**Replace** `your-render-backend-url.onrender.com` with your actual Render backend URL.

---

### 2. Render Backend Setup (CORS Configuration)

Go to your Render backend service → **Environment** tab

Add or update this variable:

```env
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Replace** `your-vercel-app.vercel.app` with your actual Vercel app URL.

**For multiple environments** (production + preview deployments):
```env
FRONTEND_URL=https://your-vercel-app.vercel.app,https://your-preview.vercel.app
```

**Note:** The backend automatically allows all `*.vercel.app` domains, so preview deployments will work automatically.

---

### 3. Redeploy

After adding environment variables:

1. **Vercel**: Redeploy your frontend
   - Go to Deployments → Click "..." → Redeploy

2. **Render**: Your backend will auto-deploy after the latest push
   - Monitor the deployment in Render dashboard

---

## Testing the Connection

1. Open your Vercel app in the browser
2. Open Developer Tools (F12) → Console
3. Check for any CORS or network errors
4. Verify API calls are going to your Render backend URL

---

## Common Issues

### CORS Errors
- **Problem**: `Access to fetch... has been blocked by CORS policy`
- **Solution**: Verify `FRONTEND_URL` is set correctly in Render backend

### API Not Found (404)
- **Problem**: Frontend can't reach backend endpoints
- **Solution**: Verify `BACKEND_URL` in Vercel matches your Render service URL

### Connection Refused
- **Problem**: Backend service is down
- **Solution**: Check Render dashboard for deployment status and logs

---

## Environment Variables Reference

### Frontend (Vercel)
- `BACKEND_URL` - Your Render backend API URL

### Backend (Render) - Already Configured
- `DATABASE_URL` - MongoDB Atlas connection string
- `FRONTEND_URL` - Your Vercel frontend URL(s)
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `NODE_ENV` - Set to `production`
- `PORT` - Automatically set by Render

---

## Quick Links

- [Vercel Environment Variables Docs](https://vercel.com/docs/environment-variables)
- [Render Environment Variables Docs](https://render.com/docs/configure-environment-variables)
