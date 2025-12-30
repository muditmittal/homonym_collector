# 🚀 Simple Vercel Deployment Guide

Deploy your entire Homonym Collector app (frontend + backend) to Vercel in just a few clicks!

---

## 📋 What You Need

- ✅ GitHub account (logged in)
- ✅ Vercel account (free - sign up with GitHub)
- ✅ Neon database connection string (you already have this)

---

## 🎯 Deployment Steps

### Step 1: Sign Up for Vercel

1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Select **"Continue with GitHub"**
4. Authorize Vercel

### Step 2: Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find `muditmittal/homonym_collector` in the list
3. Click **"Import"**

### Step 3: Configure Environment Variables

This is the **most important step**! 

On the configuration screen:
1. Expand **"Environment Variables"**
2. Add this variable:

```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_u4fQFUIKbN3w@ep-falling-king-adjru7d5-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

3. Optionally add:
```
Name: MERRIAM_WEBSTER_API_KEY
Value: 5b652fad-e28b-42ce-9129-d1fc7716d900
```

### Step 4: Deploy!

1. Leave all other settings as default
2. Click **"Deploy"** (big blue button)
3. Wait 1-2 minutes ⏳
4. When you see **"Congratulations!"** → You're done! 🎉

### Step 5: Visit Your Live App

1. Click **"Visit"** to open your app
2. Your URL will be: `https://homonym-collector-[random].vercel.app`
3. Test all features:
   - ✅ Search homonyms
   - ✅ Add new homonyms
   - ✅ Delete homonyms
   - ✅ Create collections
   - ✅ Rename collections

---

## 🎨 Custom Domain (Optional)

Want a custom URL like `homonyms.yourdomain.com`?

1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** → **"Domains"**
3. Add your domain
4. Follow Vercel's DNS setup instructions

---

## 🔄 How to Update Your App

Anytime you make changes:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Vercel will **automatically redeploy** in 1-2 minutes! No need to do anything else. 🎯

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" or "Database disconnected"

**Fix:**
1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** → **"Environment Variables"**
3. Verify `DATABASE_URL` is correct
4. Make sure it ends with `?sslmode=require&channel_binding=require`
5. Click **"Redeploy"** from the **"Deployments"** tab

### Issue: Vercel shows blank page

**Fix:**
1. Check Vercel deployment logs (Deployments tab → Click latest deployment → View Function Logs)
2. Make sure `index.html` is in the root directory
3. Try redeploying

### Issue: API routes not working

**Fix:**
1. Check that `api/index.js` exists in your repository
2. Verify `vercel.json` is in the root directory
3. Check browser console (F12) for errors
4. Redeploy from Vercel dashboard

---

## 💰 Cost

**$0/month** - Everything is free!

- ✅ Neon Database: Free tier (3GB)
- ✅ Vercel Frontend + Backend: Free (unlimited for hobby projects)

---

## ✨ What Makes This Simple?

Unlike the previous Railway setup:
- ✅ **One deployment** instead of two
- ✅ **No extra configuration** needed
- ✅ **Automatic SSL** (HTTPS)
- ✅ **Automatic deployment** on every git push
- ✅ **No CORS issues** (same domain)
- ✅ **Serverless** (scales automatically)

---

## 📊 Project Structure

```
homonym-collector/
├── api/
│   └── index.js          # Serverless backend (Vercel Function)
├── js/
│   └── ...               # Frontend JavaScript
├── index.html            # Main page
├── styles.css            # Styles
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies
```

When deployed to Vercel:
- **Frontend**: Served as static files (HTML, CSS, JS)
- **Backend**: Runs as serverless functions at `/api/*`
- **Database**: Connects to your Neon PostgreSQL

---

## 🎉 That's It!

Your app is live with just:
1. Push to GitHub ✅
2. Import to Vercel ✅
3. Add database URL ✅
4. Deploy ✅

**Total time: ~5 minutes** ⚡

---

## 🔗 Useful Links

- Your GitHub Repo: https://github.com/muditmittal/homonym_collector
- Vercel Dashboard: https://vercel.com/dashboard
- Neon Console: https://console.neon.tech

---

**Need help?** Check the Vercel deployment logs or the browser console (F12) for error messages.

