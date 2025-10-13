# Backend Setup Guide for Homonym Collector

This guide will help you set up the Neon PostgreSQL backend for your Homonym Collector app.

## Quick Start (5 minutes)

### Step 1: Create Neon Database Account

1. Visit [https://neon.tech](https://neon.tech)
2. Click "Sign Up" (you can use your GitHub account for quick signup)
3. Once logged in, click "Create Project"
4. Name your project: `homonym-collector`
5. Select a region closest to you
6. Click "Create Project"

### Step 2: Get Your Database Connection String

1. In your Neon dashboard, you'll see a "Connection Details" section
2. Copy the connection string - it looks like:
   ```
   postgresql://username:password@host.neon.tech/dbname?sslmode=require
   ```
3. Keep this safe - you'll need it in the next step!

### Step 3: Configure the Backend

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp env.example .env
   ```

4. Edit the `.env` file and paste your Neon connection string:
   ```env
   DATABASE_URL=postgresql://your-connection-string-here
   PORT=3000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
   ```

### Step 4: Setup the Database

Run this command to create all the database tables:

```bash
npm run setup-db
```

You should see output like:
```
🔧 Setting up Neon database...
✅ Executed: CREATE TABLE collections...
✅ Executed: CREATE TABLE homonym_groups...
✅ Executed: CREATE TABLE words...
✅ Database setup complete!
```

### Step 5: Start the Backend Server

```bash
npm start
```

You should see:
```
🚀 Server running on http://localhost:3000
📊 API endpoints:
   - GET    /api/health
   - GET    /api/collections
   ...
```

### Step 6: Test the API

Open your browser and visit: [http://localhost:3000/api/health](http://localhost:3000/api/health)

You should see:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-10-13T..."
}
```

✅ **Success!** Your backend is now running!

---

## What's Next?

Now that your backend is running, you need to update the frontend to use it:

1. The frontend code in `/js/services/` needs to be updated to call the API instead of using localStorage
2. You can run both the frontend and backend locally:
   - Backend: `http://localhost:3000` (already running)
   - Frontend: `python3 -m http.server 8000` (in the main directory)

---

## Troubleshooting

### "Cannot find module" errors

Make sure you've installed dependencies:
```bash
cd backend
npm install
```

### "DATABASE_URL not found"

Make sure:
1. You created a `.env` file in the `backend` directory
2. You added your Neon connection string to it
3. You're running commands from the `backend` directory

### "Connection refused" or database errors

1. Check that your Neon connection string is correct
2. Make sure your Neon project is active (check the dashboard)
3. Try running `npm run setup-db` again

### Port 3000 already in use

Change the PORT in your `.env` file:
```env
PORT=3001
```

---

## Deploying to Production

Once you're happy with the local setup, you can deploy to:

### Option 1: Railway (Recommended - Easiest)
1. Visit [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variables (DATABASE_URL, ALLOWED_ORIGINS)
5. Railway will automatically detect and deploy your Express app

### Option 2: Render
1. Visit [render.com](https://render.com)
2. Click "New Web Service"
3. Connect your GitHub repository
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Add environment variables

---

## Need Help?

If you run into any issues:
1. Check the terminal output for error messages
2. Verify your `.env` file has the correct DATABASE_URL
3. Make sure both Neon and your backend server are running
4. Check the backend README.md for more detailed API documentation

---

## Current Status

✅ Backend code created
✅ Database schema defined  
✅ API endpoints implemented
✅ Setup scripts ready

⏳ Next steps:
- Start backend server (follow steps above)
- Update frontend to use API
- Deploy to production

