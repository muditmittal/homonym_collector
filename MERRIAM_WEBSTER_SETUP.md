# 🔑 SETUP INSTRUCTIONS: Merriam-Webster API Integration

## Step 1: Create Backend .env File

Create a file called `.env` in the `backend/` directory with the following content:

```bash
# Neon Database Connection String
DATABASE_URL=psql 'postgresql://neondb_owner:npg_u4fQFUIKbN3w@ep-falling-king-adjru7d5-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000,https://homonym-collector.vercel.app

# Merriam-Webster School Dictionary API
MERRIAM_WEBSTER_API_KEY=5b652fad-e28b-42ce-9129-d1fc7716d900
MERRIAM_WEBSTER_API_BASE_URL=https://www.dictionaryapi.com/api/v3/references/sd4/json/
```

**Important**: Replace `your_actual_neon_connection_string_here` with your actual Neon database connection string!

## Step 2: Test the Integration Locally

```bash
# 1. Start the backend server
cd backend
npm start

# 2. In a new terminal, open the frontend
cd /path/to/homonyms
python3 -m http.server 8000

# 3. Open browser to http://localhost:8000
# 4. Try searching for a word like "berth" to test the new API
```

## Step 3: Populate Database with Fresh Definitions

Once the backend is running and you've confirmed it works:

```bash
cd backend
npm run populate
```

This will take about 2-3 minutes and will populate all 78 homonym groups with consistent Merriam-Webster definitions.

## Step 4: Deploy to Railway

Add the environment variables to Railway:

1. Go to your Railway dashboard
2. Select your project
3. Go to "Variables" tab
4. Add:
   - `MERRIAM_WEBSTER_API_KEY` = `5b652fad-e28b-42ce-9129-d1fc7716d900`
   - `MERRIAM_WEBSTER_API_BASE_URL` = `https://www.dictionaryapi.com/api/v3/references/sd4/json/`

## What Changed?

✅ **Frontend**: Now uses Merriam-Webster School Dictionary API
✅ **Backend**: Populate script uses same API for consistency
✅ **Better Rate Limits**: 1,000 requests/day (much more reliable)
✅ **Authoritative Definitions**: Clear, student-friendly definitions
✅ **No More 429 Errors**: Professional API with proper rate limiting

## Merriam-Webster Response Format

**Example for "berth":**
```json
[
  {
    "meta": {"id": "berth", "stems": ["berth", "berths"]},
    "hwi": {"hw": "berth", "prs": [{"mw": "ˈbərth"}]},
    "fl": "noun",
    "shortdef": [
      "a place to sit or sleep especially on a ship or vehicle"
    ]
  }
]
```

## Next Steps

After completing the above steps, commit and push the changes:

```bash
git add -A
git commit -m "✨ Integrate Merriam-Webster School Dictionary API

- Switched from Free Dictionary API to Merriam-Webster
- Better reliability and rate limits (1,000/day)
- Consistent definitions across frontend and backend
- Updated DictionaryService and populate script"

git push
```

Railway will automatically redeploy with the new code!

