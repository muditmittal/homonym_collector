// Vercel Serverless Function that wraps the Express backend
import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

// Database helper function
const getDb = () => {
    return neon(process.env.DATABASE_URL);
};

// Test connection
const testConnection = async () => {
    try {
        const sql = getDb();
        await sql`SELECT 1`;
        return true;
    } catch (error) {
        console.error('Database connection error:', error);
        return false;
    }
};

// Get all collections
const getCollections = async () => {
    const sql = getDb();
    return await sql`
        SELECT id, name, created_at, updated_at
        FROM collections
        ORDER BY created_at DESC
    `;
};

// Get single collection
const getCollection = async (id) => {
    const sql = getDb();
    const result = await sql`
        SELECT id, name, created_at, updated_at
        FROM collections
        WHERE id = ${id}
    `;
    return result[0] || null;
};

// Create collection
const createCollection = async (name) => {
    const sql = getDb();
    const result = await sql`
        INSERT INTO collections (name)
        VALUES (${name})
        RETURNING id, name, created_at, updated_at
    `;
    return result[0];
};

// Update collection
const updateCollection = async (id, name) => {
    const sql = getDb();
    const result = await sql`
        UPDATE collections
        SET name = ${name}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, name, created_at, updated_at
    `;
    return result[0] || null;
};

// Delete collection
const deleteCollection = async (id) => {
    const sql = getDb();
    await sql`DELETE FROM collections WHERE id = ${id}`;
};

// Get homonym groups for a collection
const getHomonymGroups = async (collectionId) => {
    const sql = getDb();
    const groups = await sql`
        SELECT hg.id, hg.pronunciation, hg.created_at
        FROM homonym_groups hg
        WHERE hg.collection_id = ${collectionId}
        ORDER BY hg.created_at DESC
    `;

    for (const group of groups) {
        const words = await sql`
            SELECT id, word, definition, word_order
            FROM words
            WHERE homonym_group_id = ${group.id}
            ORDER BY word_order
        `;
        group.words = words;
    }

    return groups;
};

// Search homonyms
const searchHomonyms = async (collectionId, searchTerm) => {
    const sql = getDb();
    const groups = await sql`
        SELECT DISTINCT hg.id, hg.pronunciation, hg.created_at
        FROM homonym_groups hg
        INNER JOIN words w ON w.homonym_group_id = hg.id
        WHERE hg.collection_id = ${collectionId}
        AND w.word ILIKE ${`%${searchTerm}%`}
        ORDER BY hg.created_at DESC
    `;

    for (const group of groups) {
        const words = await sql`
            SELECT id, word, definition, word_order
            FROM words
            WHERE homonym_group_id = ${group.id}
            ORDER BY word_order
        `;
        group.words = words;
    }

    return groups;
};

// Create homonym group
const createHomonymGroup = async (collectionId, pronunciation, words) => {
    const sql = getDb();
    
    const groupResult = await sql`
        INSERT INTO homonym_groups (collection_id, pronunciation)
        VALUES (${collectionId}, ${pronunciation})
        RETURNING id
    `;
    
    const groupId = groupResult[0].id;

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        await sql`
            INSERT INTO words (homonym_group_id, word, definition, word_order)
            VALUES (${groupId}, ${word.word}, ${word.definition}, ${i})
        `;
    }

    return groupId;
};

// Delete homonym group
const deleteHomonymGroup = async (id) => {
    const sql = getDb();
    await sql`DELETE FROM homonym_groups WHERE id = ${id}`;
};

// ==================== Routes ====================

// Health check
app.get('/api/health', async (req, res) => {
    const dbConnected = await testConnection();
    res.json({
        status: 'ok',
        database: dbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Collections
app.get('/api/collections', async (req, res) => {
    try {
        const collections = await getCollections();
        res.json(collections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ error: 'Failed to fetch collections' });
    }
});

app.get('/api/collections/:id', async (req, res) => {
    try {
        const collection = await getCollection(req.params.id);
        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }
        res.json(collection);
    } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ error: 'Failed to fetch collection' });
    }
});

app.post('/api/collections', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Collection name is required' });
        }
        const collection = await createCollection(name);
        res.status(201).json(collection);
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({ error: 'Failed to create collection' });
    }
});

app.put('/api/collections/:id', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Collection name is required' });
        }
        const collection = await updateCollection(req.params.id, name);
        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }
        res.json(collection);
    } catch (error) {
        console.error('Error updating collection:', error);
        res.status(500).json({ error: 'Failed to update collection' });
    }
});

app.delete('/api/collections/:id', async (req, res) => {
    try {
        await deleteCollection(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ error: 'Failed to delete collection' });
    }
});

// Homonym Groups
app.get('/api/collections/:collectionId/homonyms', async (req, res) => {
    try {
        const homonyms = await getHomonymGroups(req.params.collectionId);
        res.json(homonyms);
    } catch (error) {
        console.error('Error fetching homonyms:', error);
        res.status(500).json({ error: 'Failed to fetch homonyms' });
    }
});

app.get('/api/collections/:collectionId/homonyms/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        const homonyms = await searchHomonyms(req.params.collectionId, q);
        res.json(homonyms);
    } catch (error) {
        console.error('Error searching homonyms:', error);
        res.status(500).json({ error: 'Failed to search homonyms' });
    }
});

app.post('/api/collections/:collectionId/homonyms', async (req, res) => {
    try {
        const { pronunciation, words } = req.body;
        
        if (!pronunciation) {
            return res.status(400).json({ error: 'Pronunciation is required' });
        }
        
        if (!words || !Array.isArray(words) || words.length === 0) {
            return res.status(400).json({ error: 'At least one word is required' });
        }
        
        const groupId = await createHomonymGroup(
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

app.delete('/api/homonyms/:id', async (req, res) => {
    try {
        await deleteHomonymGroup(req.params.id);
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

// Export as Vercel serverless function
export default app;

