import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as db from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
    const dbConnected = await db.testConnection();
    res.json({
        status: 'ok',
        database: dbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// ==================== Collections Routes ====================

// Get all collections
app.get('/api/collections', async (req, res) => {
    try {
        const collections = await db.getCollections();
        res.json(collections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ error: 'Failed to fetch collections' });
    }
});

// Get a single collection
app.get('/api/collections/:id', async (req, res) => {
    try {
        const collection = await db.getCollection(req.params.id);
        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }
        res.json(collection);
    } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ error: 'Failed to fetch collection' });
    }
});

// Create a new collection
app.post('/api/collections', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Collection name is required' });
        }
        const collection = await db.createCollection(name);
        res.status(201).json(collection);
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({ error: 'Failed to create collection' });
    }
});

// Update a collection
app.put('/api/collections/:id', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Collection name is required' });
        }
        const collection = await db.updateCollection(req.params.id, name);
        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }
        res.json(collection);
    } catch (error) {
        console.error('Error updating collection:', error);
        res.status(500).json({ error: 'Failed to update collection' });
    }
});

// Delete a collection
app.delete('/api/collections/:id', async (req, res) => {
    try {
        await db.deleteCollection(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ error: 'Failed to delete collection' });
    }
});

// ==================== Homonym Groups Routes ====================

// Get all homonym groups for a collection
app.get('/api/collections/:collectionId/homonyms', async (req, res) => {
    try {
        const homonyms = await db.getHomonymGroups(req.params.collectionId);
        res.json(homonyms);
    } catch (error) {
        console.error('Error fetching homonyms:', error);
        res.status(500).json({ error: 'Failed to fetch homonyms' });
    }
});

// Search homonym groups
app.get('/api/collections/:collectionId/homonyms/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        const homonyms = await db.searchHomonyms(req.params.collectionId, q);
        res.json(homonyms);
    } catch (error) {
        console.error('Error searching homonyms:', error);
        res.status(500).json({ error: 'Failed to search homonyms' });
    }
});

// Create a new homonym group
app.post('/api/collections/:collectionId/homonyms', async (req, res) => {
    try {
        const { pronunciation, words } = req.body;
        
        if (!pronunciation) {
            return res.status(400).json({ error: 'Pronunciation is required' });
        }
        
        if (!words || !Array.isArray(words) || words.length === 0) {
            return res.status(400).json({ error: 'At least one word is required' });
        }
        
        const groupId = await db.createHomonymGroup(
            req.params.collectionId,
            pronunciation,
            words
        );
        
        res.status(201).json({ id: groupId });
    } catch (error) {
        console.error('Error creating homonym group:', error);
        res.status(500).json({ error: 'Failed to create homonym group' });
    }
});

// Delete a homonym group
app.delete('/api/homonyms/:id', async (req, res) => {
    try {
        await db.deleteHomonymGroup(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting homonym group:', error);
        res.status(500).json({ error: 'Failed to delete homonym group' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`   - GET    /api/health`);
    console.log(`   - GET    /api/collections`);
    console.log(`   - POST   /api/collections`);
    console.log(`   - GET    /api/collections/:id/homonyms`);
    console.log(`   - POST   /api/collections/:id/homonyms`);
    console.log(`   - DELETE /api/homonyms/:id`);
});

export default app;

