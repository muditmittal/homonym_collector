# Deployment Guide for Homonym Collector

## Backend Deployment (Railway)

### Prerequisites
- GitHub account
- Railway account (sign up at railway.app)
- Your Neon database connection string

### Steps

1. **Sign up for Railway**
   - Go to https://railway.app
   - Click "Login with GitHub"
   - Authorize Railway to access your repositories

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `muditmittal/homonym_collector`

3. **Configure the Service**
   - Railway will auto-detect the Node.js app
   - It will look for `backend/` directory
   - Click on the deployment

4. **Add Environment Variables**
   - Click "Variables" tab
   - Add these variables:
     ```
     DATABASE_URL=postgresql://neondb_owner:npg_u4fQFUIKbN3w@ep-falling-king-adjru7d5-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
     NODE_ENV=production
     PORT=3000
     ALLOWED_ORIGINS=*
     ```

5. **Set Root Directory**
   - Go to "Settings" → "Root Directory"
   - Set to: `backend`
   - This tells Railway where your backend code is

6. **Deploy**
   - Railway will automatically deploy
   - Wait for deployment to complete (~2 minutes)
   - Copy your deployment URL (e.g., `https://homonym-collector-production.up.railway.app`)

7. **Test Your Backend**
   - Visit: `https://your-railway-url.railway.app/api/health`
   - You should see: `{"status":"ok","database":"connected"}`

---

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (sign up at vercel.com)
- Your Railway backend URL from above

### Steps

1. **Update API URL in Frontend**
   - We'll need to update the ApiService.js file with your Railway URL
   - This will be done before deploying

2. **Sign up for Vercel**
   - Go to https://vercel.com
   - Click "Sign Up" → "Continue with GitHub"

3. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose `muditmittal/homonym_collector`

4. **Configure Build Settings**
   - Framework Preset: Other
   - Root Directory: `./` (root)
   - Build Command: (leave empty)
   - Output Directory: `./` (root)

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (~1 minute)
   - Your site will be live at: `https://homonym-collector-*.vercel.app`

6. **Test Your App**
   - Visit your Vercel URL
   - You should see your homonym collection loaded from the database!

---

## Quick Deployment Checklist

- [ ] Railway backend deployed
- [ ] Backend health check working
- [ ] Backend URL copied
- [ ] Frontend updated with production API URL
- [ ] Vercel frontend deployed
- [ ] App works end-to-end at production URL

---

## Production URLs

After deployment, you'll have:

- **Backend API**: `https://your-app.up.railway.app`
- **Frontend App**: `https://homonym-collector.vercel.app`
- **Database**: Already hosted on Neon (no change needed)

---

## Cost

- **Neon Database**: Free tier (3GB storage)
- **Railway Backend**: Free tier ($5/month credit, then usage-based)
- **Vercel Frontend**: Free tier (unlimited for personal projects)

**Total: $0/month for small usage** 🎉

---

## Troubleshooting

### Backend not connecting to database
- Check DATABASE_URL in Railway environment variables
- Ensure Neon database is active
- Check Railway logs for errors

### Frontend showing empty collection
- Verify backend URL in ApiService.js
- Check browser console for CORS errors
- Ensure ALLOWED_ORIGINS includes your Vercel domain

### "Failed to fetch" errors
- Check that backend is running on Railway
- Verify API URL is correct in frontend
- Check network tab in browser dev tools

