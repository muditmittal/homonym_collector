import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Create Neon SQL client
const sql = neon(process.env.DATABASE_URL);

/**
 * Test database connection
 */
export async function testConnection() {
    try {
        const result = await sql`SELECT NOW()`;
        console.log('✅ Database connected successfully:', result[0].now);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

/**
 * Get all collections
 */
export async function getCollections() {
    return await sql`
        SELECT id, name, created_at, updated_at
        FROM collections
        ORDER BY created_at DESC
    `;
}

/**
 * Get a single collection by ID
 */
export async function getCollection(collectionId) {
    const result = await sql`
        SELECT id, name, created_at, updated_at
        FROM collections
        WHERE id = ${collectionId}
    `;
    return result[0];
}

/**
 * Create a new collection
 */
export async function createCollection(name) {
    const result = await sql`
        INSERT INTO collections (name)
        VALUES (${name})
        RETURNING id, name, created_at, updated_at
    `;
    return result[0];
}

/**
 * Update collection name
 */
export async function updateCollection(collectionId, name) {
    const result = await sql`
        UPDATE collections
        SET name = ${name}
        WHERE id = ${collectionId}
        RETURNING id, name, created_at, updated_at
    `;
    return result[0];
}

/**
 * Delete a collection (cascade deletes homonym groups and words)
 */
export async function deleteCollection(collectionId) {
    await sql`
        DELETE FROM collections
        WHERE id = ${collectionId}
    `;
}

/**
 * Get all homonym groups for a collection
 */
export async function getHomonymGroups(collectionId) {
    const groups = await sql`
        SELECT 
            hg.id,
            hg.pronunciation,
            hg.created_at,
            json_agg(
                json_build_object(
                    'id', w.id,
                    'word', w.word,
                    'definition', w.definition,
                    'order', w.word_order
                ) ORDER BY w.word_order, w.word
            ) as words
        FROM homonym_groups hg
        LEFT JOIN words w ON w.homonym_group_id = hg.id
        WHERE hg.collection_id = ${collectionId}
        GROUP BY hg.id, hg.pronunciation, hg.created_at
        ORDER BY hg.created_at ASC
    `;
    
    return groups.map(group => ({
        id: group.id,
        pronunciation: group.pronunciation,
        words: group.words.filter(w => w.id !== null), // Filter out null words (empty groups)
        created_at: group.created_at
    }));
}

/**
 * Create a new homonym group with words
 */
export async function createHomonymGroup(collectionId, pronunciation, words) {
    // Create the homonym group
    const groupResult = await sql`
        INSERT INTO homonym_groups (collection_id, pronunciation)
        VALUES (${collectionId}, ${pronunciation})
        RETURNING id
    `;
    
    const groupId = groupResult[0].id;
    
    // Insert all words
    if (words && words.length > 0) {
        for (let i = 0; i < words.length; i++) {
            await sql`
                INSERT INTO words (homonym_group_id, word, definition, word_order)
                VALUES (${groupId}, ${words[i].word}, ${words[i].definition}, ${i})
            `;
        }
    }
    
    return groupId;
}

/**
 * Delete a homonym group (cascade deletes words)
 */
export async function deleteHomonymGroup(groupId) {
    await sql`
        DELETE FROM homonym_groups
        WHERE id = ${groupId}
    `;
}

/**
 * Search homonym groups by word
 */
export async function searchHomonyms(collectionId, searchTerm) {
    const groups = await sql`
        SELECT DISTINCT
            hg.id,
            hg.pronunciation,
            hg.created_at,
            json_agg(
                json_build_object(
                    'id', w.id,
                    'word', w.word,
                    'definition', w.definition,
                    'order', w.word_order
                ) ORDER BY w.word_order, w.word
            ) as words
        FROM homonym_groups hg
        LEFT JOIN words w ON w.homonym_group_id = hg.id
        WHERE hg.collection_id = ${collectionId}
        AND EXISTS (
            SELECT 1 FROM words
            WHERE homonym_group_id = hg.id
            AND LOWER(word) LIKE ${`%${searchTerm.toLowerCase()}%`}
        )
        GROUP BY hg.id, hg.pronunciation, hg.created_at
        ORDER BY hg.created_at ASC
    `;
    
    return groups.map(group => ({
        id: group.id,
        pronunciation: group.pronunciation,
        words: group.words.filter(w => w.id !== null),
        created_at: group.created_at
    }));
}

export default sql;

