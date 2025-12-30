# Complete Deployment Guide - Homonym Collector

This guide walks you through deploying the Homonym Collector app with:
- **Backend**: Railway (with Neon PostgreSQL)
- **Frontend**: Vercel

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ GitHub account (logged in)
- ✅ Code pushed to GitHub: `https://github.com/muditmittal/homonym_collector`
- ✅ Neon database connection string (already in backend/.env)

---

## Part 1: Deploy Backend to Railway 🚂

### Step 1: Sign Up / Log In to Railway

1. Go to **https://railway.app**
2. Click **"Login with GitHub"**
3. Authorize Railway to access your GitHub repositories

### Step 2: Create New Project

1. Click **"New Project"** (purple button)
2. Select **"Deploy from GitHub repo"**
3. Find and select **`muditmittal/homonym_collector`**
4. Railway will start analyzing your repository

### Step 3: Configure Root Directory

⚠️ **IMPORTANT**: Railway needs to know your backend is in the `backend/` folder.

1. After Railway creates the project, click on your service
2. Go to **"Settings"** tab
3. Scroll to **"Root Directory"**
4. Set it to: `backend`
5. Click **"Save"**

### Step 4: Add Environment Variables

1. Click on the **"Variables"** tab
2. Click **"+ New Variable"**
3. Add each of these variables one by one:

```
DATABASE_URL=postgresql://neondb_owner:npg_u4fQFUIKbN3w@ep-falling-king-adjru7d5-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=*
MERRIAM_WEBSTER_API_KEY=5b652fad-e28b-42ce-9129-d1fc7716d900
```

4. Click **"Add"** after each variable

### Step 5: Deploy & Get Your URL

1. Railway will automatically start deploying (watch the logs)
2. Wait 1-2 minutes for deployment to complete
3. Once complete, click **"Settings"** → **"Networking"**
4. Click **"Generate Domain"**
5. Copy your Railway URL (example: `https://homonym-collector-production.up.railway.app`)

### Step 6: Test Your Backend

1. Open a new browser tab
2. Go to: `https://YOUR-RAILWAY-URL.railway.app/api/health`
3. You should see:
   ```json
   {"status":"ok","database":"connected","timestamp":"..."}
   ```

✅ **Backend is live!** Save your Railway URL - you'll need it for the frontend.

---

## Part 2: Deploy Frontend to Vercel 🔺

### Step 1: Update API Configuration

Before deploying to Vercel, we need to update the frontend to use your Railway backend URL.

**Option A: Use Environment Variable (Recommended)**

1. We'll set this up in Vercel's dashboard in Step 4 below

**Option B: Hardcode the URL (Simpler)**

1. Edit `js/api-config.js`
2. Replace line 8 with:
   ```javascript
   window.API_URL = 'https://YOUR-RAILWAY-URL.railway.app/api';
   ```
3. Commit and push:
   ```bash
   git add js/api-config.js
   git commit -m "Update API URL for production"
   git push origin main
   ```

### Step 2: Sign Up / Log In to Vercel

1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Select **"Continue with GitHub"**
4. Authorize Vercel

### Step 3: Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find **`muditmittal/homonym_collector`** in the list
3. Click **"Import"**

### Step 4: Configure Project Settings

On the configuration screen:

1. **Framework Preset**: Select **"Other"**
2. **Root Directory**: Leave as `./` (default - root)
3. **Build Command**: Leave empty
4. **Output Directory**: Leave as `./` (root)
5. **Install Command**: Leave as default

**Environment Variables** (Optional - for dynamic API URL):
- Click **"Environment Variables"**
- Add:
  ```
  Name: API_URL
  Value: https://YOUR-RAILWAY-URL.railway.app/api
  ```

### Step 5: Deploy!

1. Click **"Deploy"** (blue button)
2. Vercel will build and deploy (1-2 minutes)
3. Watch the build logs
4. When complete, you'll see: **"Congratulations!"** 🎉

### Step 6: Visit Your Live App

1. Click **"Visit"** or **"Go to Dashboard"**
2. Copy your Vercel URL (e.g., `https://homonym-collector.vercel.app`)
3. Open it in a new tab
4. Your app should be live! 🎊

### Step 7: Update Railway CORS Settings (If Needed)

If you see CORS errors in the browser console:

1. Go back to Railway
2. Open your backend service
3. Go to **"Variables"**
4. Update `ALLOWED_ORIGINS` to:
   ```
   https://YOUR-VERCEL-URL.vercel.app,http://localhost:8000
   ```
5. Railway will automatically redeploy

---

## 🎉 You're Live!

Your app is now deployed at:

- **Frontend**: `https://YOUR-APP.vercel.app`
- **Backend**: `https://YOUR-APP.railway.app`
- **Database**: Already on Neon (no change needed)

---

## 🔧 Testing Your Deployment

1. **Open your Vercel URL**
2. **Check the browser console** (F12) - should see:
   ```
   API Configuration loaded. Current API URL: https://your-railway-url.railway.app/api
   ```
3. **Try adding a homonym** - search for a word and add it
4. **Refresh the page** - your data should persist (from database)
5. **Try all features**:
   - Search existing homonyms
   - Add new homonyms
   - Delete homonyms
   - Create new collections
   - Rename collections

---

## 💰 Cost Breakdown

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Neon Database** | 3GB storage | $19/month for more |
| **Railway Backend** | $5 credit/month | $0.000463/GB-sec after |
| **Vercel Frontend** | Unlimited | N/A for hobby projects |

**Total: FREE** for personal use! 🎉

---

## 🐛 Troubleshooting

### Issue: Frontend shows "Failed to fetch"

**Fix:**
1. Check browser console for the exact error
2. Verify your Railway backend URL is correct
3. Test backend health: `https://YOUR-RAILWAY-URL/api/health`
4. Check CORS settings in Railway (ALLOWED_ORIGINS)

### Issue: CORS Error

**Error:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Fix:**
1. Go to Railway → Variables
2. Update `ALLOWED_ORIGINS` to include your Vercel domain:
   ```
   https://your-app.vercel.app,http://localhost:8000
   ```

### Issue: Backend not connecting to database

**Error:** `"database":"disconnected"` in health check

**Fix:**
1. Check DATABASE_URL in Railway Variables
2. Make sure it includes `?sslmode=require`
3. Verify Neon database is active at neon.tech

### Issue: Railway deployment fails

**Fix:**
1. Check Railway logs for errors
2. Verify Root Directory is set to `backend`
3. Make sure `package.json` and `node_modules` exist in backend folder

### Issue: Vercel shows 404 or blank page

**Fix:**
1. Check that `index.html` is in the root directory
2. Verify Root Directory in Vercel is set to `./` (root)
3. Check Vercel deployment logs for errors

---

## 🔄 Updating Your Deployment

### To update the frontend:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically redeploy! (1-2 minutes)

### To update the backend:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Railway will automatically redeploy! (2-3 minutes)

---

## 📱 Custom Domain (Optional)

### For Vercel (Frontend):

1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain (e.g., `homonyms.yourdomain.com`)
4. Follow Vercel's DNS instructions

### For Railway (Backend):

1. Go to Railway Dashboard → Your Service
2. Click **"Settings"** → **"Networking"**
3. Add custom domain
4. Update DNS records as instructed

---

## 🎯 Next Steps

- [ ] Test all features on production
- [ ] Share your app URL with friends!
- [ ] Add more homonyms to your collection
- [ ] Consider adding a custom domain
- [ ] Monitor Railway usage (free tier)

---

## 📞 Support

If you run into issues:

1. Check this troubleshooting guide first
2. Check Railway logs (Railway Dashboard → Deployments → Logs)
3. Check Vercel deployment logs
4. Check browser console (F12)
5. Verify all environment variables are set correctly

---

**Congratulations! Your app is live! 🚀**

Share it with the world: `https://your-app.vercel.app`

