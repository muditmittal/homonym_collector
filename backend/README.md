# Homonym Collector Backend

Backend API for the Homonym Collector application using Neon PostgreSQL.

## Setup Instructions

### 1. Create a Neon Database

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project called "homonym-collector"
4. Copy your connection string from the Neon dashboard

### 2. Configure Environment Variables

1. Create a `.env` file in the `backend` directory:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your Neon connection string:
   ```env
   DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
   PORT=3000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup Database Schema

```bash
npm run setup-db
```

This will create all necessary tables and indexes in your Neon database.

### 5. Start the Server

```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Collections

- `GET /api/collections` - Get all collections
- `GET /api/collections/:id` - Get a specific collection
- `POST /api/collections` - Create a new collection
  - Body: `{ "name": "Collection Name" }`
- `PUT /api/collections/:id` - Update a collection
  - Body: `{ "name": "New Name" }`
- `DELETE /api/collections/:id` - Delete a collection

### Homonym Groups

- `GET /api/collections/:collectionId/homonyms` - Get all homonym groups in a collection
- `GET /api/collections/:collectionId/homonyms/search?q=word` - Search homonyms
- `POST /api/collections/:collectionId/homonyms` - Create a new homonym group
  - Body:
    ```json
    {
      "pronunciation": "/piːs/",
      "words": [
        { "word": "peace", "definition": "(noun) Freedom from disturbance" },
        { "word": "piece", "definition": "(noun) A portion of an object" }
      ]
    }
    ```
- `DELETE /api/homonyms/:id` - Delete a homonym group

### Health Check

- `GET /api/health` - Check if the API and database are running

## Database Schema

### Collections Table
- `id` - Primary key
- `name` - Collection name
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Homonym Groups Table
- `id` - Primary key
- `collection_id` - Foreign key to collections
- `pronunciation` - IPA pronunciation notation
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Words Table
- `id` - Primary key
- `homonym_group_id` - Foreign key to homonym_groups
- `word` - The word itself
- `definition` - Word definition
- `word_order` - Order within the group
- `created_at` - Timestamp

## Development

To run the server with auto-reload during development:

```bash
npm run dev
```

## Deployment

This backend can be deployed to:
- **Railway** (recommended) - Easy deployment, free tier available
- **Render** - Free tier available
- **Vercel** (as serverless functions)
- **Fly.io** - Free tier available

The Neon database works seamlessly with all of these platforms.

## Environment Variables for Production

Make sure to set these environment variables in your hosting platform:
- `DATABASE_URL` - Your Neon connection string
- `PORT` - Port number (usually set automatically by the host)
- `NODE_ENV` - Set to `production`
- `ALLOWED_ORIGINS` - Your frontend URL(s), comma-separated

