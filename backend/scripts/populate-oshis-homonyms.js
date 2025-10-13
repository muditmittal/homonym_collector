import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Curated list of homonyms with proper grouping
const homonymGroups = [
    ['b', 'be', 'bee'],
    ['c', 'sea', 'see'],
    ['i', 'eye'],
    ['o', 'oh'],
    ['p', 'pea', 'pee'],
    ['r', 'are'],
    ['t', 'tea', 'tee'],
    ['u', 'you'],
    ['v', 'we'],
    ['y', 'why'],
    ['ail', 'ale'],
    ['bao', 'bow'],
    ['bail', 'bale'],
    ['bare', 'bear'],
    ['bean', 'been'],
    ['beat', 'beet'],
    ['berth', 'birth'],
    ['board', 'bored'],
    ['blew', 'blue'],
    ['by', 'bye', 'buy'],
    ['cale', 'kale'],
    ['cease', 'seas', 'sees', 'seize'],
    ['cent', 'scent', 'sent'],
    ['chute', 'shoot'],
    ['dear', 'deer'],
    ['doe', 'dough'],
    ['earn', 'urn'],
    ['fair', 'fare'],
    ['flea', 'flee'],
    ['flew', 'flu'],
    ['hair', 'hare'],
    ['hi', 'high'],
    ['heard', 'herd'],
    ['hence', 'hens'],
    ['hour', 'our'],
    ['knight', 'night'],
    ['knot', 'not'],
    ['know', 'no'],
    ['knows', 'nose'],
    ['lead', 'led'],
    ['leak', 'leek'],
    ['mail', 'male'],
    ['maid', 'made'],
    ['mat', 'matte'],
    ['one', 'won'],
    ['oar', 'or', 'ore'],
    ['pail', 'pale'],
    ['pair', 'pear'],
    ['peace', 'piece'],
    ['pi', 'pie'],
    ['pole', 'poll'],
    ['principal', 'principle'],
    ['rain', 'rein', 'reign'],
    ['read', 'reed'],
    ['read', 'red'],
    ['right', 'rite', 'write'],
    ['roll', 'role'],
    ['scene', 'seen'],
    ['seam', 'seem'],
    ['sail', 'sale'],
    ['so', 'sow'],
    ['stationary', 'stationery'],
    ['steel', 'steal'],
    ['team', 'teem'],
    ['their', 'there', 'they\'re'],
    ['thigh', 'thai'],
    ['to', 'too'],
    ['toe', 'tow'],
    ['veil', 'wail', 'whale'],
    ['vet', 'wet', 'whet'],
    ['vow', 'wow'],
    ['vile', 'while'],
    ['waist', 'waste'],
    ['wait', 'weight'],
    ['waive', 'wave'],
    ['weak', 'week'],
    ['weather', 'whether'],
    ['witch', 'which']
];

/**
 * Fetch definition from Merriam-Webster School Dictionary API
 * Uses the EXACT same logic as the frontend DictionaryService
 */
async function fetchDefinitionFromAPI(word) {
    const apiKey = process.env.MERRIAM_WEBSTER_API_KEY;
    const baseUrl = process.env.MERRIAM_WEBSTER_API_BASE_URL || 'https://www.dictionaryapi.com/api/v3/references/sd4/json/';
    const normalizedWord = word.toLowerCase().trim();
    
    if (!apiKey) {
        throw new Error('MERRIAM_WEBSTER_API_KEY not found in environment variables');
    }
    
    try {
        const url = `${baseUrl}${encodeURIComponent(normalizedWord)}?key=${apiKey}`;
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Check if response is valid (not a "did you mean" suggestion array)
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error(`No data returned for "${word}"`);
        }

        const firstEntry = data[0];
        if (typeof firstEntry === 'string') {
            throw new Error(`Word "${word}" not found. Suggestions: ${data.slice(0, 3).join(', ')}`);
        }

        // Extract part of speech and definition (matching frontend logic)
        const partOfSpeech = firstEntry.fl || 'word';
        const definition = firstEntry.shortdef?.[0];

        if (!definition) {
            throw new Error(`No definition found for "${word}"`);
        }

        // Capitalize first letter and format
        const capitalizedDef = definition.charAt(0).toUpperCase() + definition.slice(1);
        return `(${partOfSpeech}) ${capitalizedDef}`;
    } catch (error) {
        console.warn(`⚠️  Failed to fetch definition for "${word}":`, error.message);
        throw error;
    }
}

/**
 * Fetch pronunciation from Merriam-Webster School Dictionary API
 */
async function fetchPronunciationFromAPI(word) {
    const apiKey = process.env.MERRIAM_WEBSTER_API_KEY;
    const baseUrl = process.env.MERRIAM_WEBSTER_API_BASE_URL || 'https://www.dictionaryapi.com/api/v3/references/sd4/json/';
    const normalizedWord = word.toLowerCase().trim();
    
    if (!apiKey) {
        throw new Error('MERRIAM_WEBSTER_API_KEY not found in environment variables');
    }
    
    try {
        const url = `${baseUrl}${encodeURIComponent(normalizedWord)}?key=${apiKey}`;
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            return `/${normalizedWord}/`;
        }

        const data = await response.json();
        
        // Check if response is valid
        if (!data || !Array.isArray(data) || data.length === 0 || typeof data[0] === 'string') {
            return `/${normalizedWord}/`;
        }

        const firstEntry = data[0];
        const pronunciation = firstEntry.hwi?.prs?.[0]?.mw || firstEntry.hwi?.prs?.[0]?.ipa;

        if (pronunciation) {
            return `/${pronunciation}/`;
        }
        return `/${normalizedWord}/`;
    } catch (error) {
        console.warn(`⚠️  Failed to fetch pronunciation for "${word}":`, error.message);
        return `/${normalizedWord}/`;
    }
}

/**
 * Add delay to avoid API rate limiting
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry fetch with exponential backoff
 */
async function fetchWithRetry(fetchFn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fetchFn();
        } catch (error) {
            if (error.message.includes('429') && attempt < maxRetries) {
                const waitTime = 2000 * attempt; // 2s, 4s, 6s
                console.log(`⏳ Rate limited. Waiting ${waitTime/1000}s before retry ${attempt}/${maxRetries}...`);
                await delay(waitTime);
            } else {
                throw error;
            }
        }
    }
}

/**
 * Main populate function
 */
async function populateOshisHomonyms() {
    console.log('📚 Populating Oshi\'s Homonyms with Merriam-Webster School Dictionary...\n');

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found. Please check your .env file.');
        process.exit(1);
    }

    if (!process.env.MERRIAM_WEBSTER_API_KEY) {
        console.error('❌ MERRIAM_WEBSTER_API_KEY not found. Please add it to your .env file.');
        process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL);

    try {
        // Find Oshi's Homonyms collection
        const collections = await sql`SELECT id FROM collections WHERE name = 'Oshi''s Homonyms'`;
        
        if (collections.length === 0) {
            console.error('❌ Oshi\'s Homonyms collection not found. Run setup-database.js first.');
            process.exit(1);
        }

        const collectionId = collections[0].id;
        console.log(`✅ Found collection ID: ${collectionId}\n`);

        // Clear existing homonyms
        console.log('🗑️  Clearing existing homonyms...');
        await sql`DELETE FROM words WHERE homonym_group_id IN (SELECT id FROM homonym_groups WHERE collection_id = ${collectionId})`;
        await sql`DELETE FROM homonym_groups WHERE collection_id = ${collectionId}`;
        console.log('✅ Cleared\n');

        // Populate with fresh data from Merriam-Webster API
        console.log(`📝 Populating ${homonymGroups.length} homonym groups from Merriam-Webster...\n`);

        let successCount = 0;
        let skipCount = 0;

        for (let i = 0; i < homonymGroups.length; i++) {
            const words = homonymGroups[i];
            const groupNum = i + 1;

            try {
                // Fetch pronunciation from first word with retry
                const pronunciation = await fetchWithRetry(() => fetchPronunciationFromAPI(words[0]));
                await delay(200); // Small delay to respect rate limits

                // Fetch definitions for all words with retry
                const wordsWithDefinitions = [];
                for (const word of words) {
                    try {
                        const definition = await fetchWithRetry(() => fetchDefinitionFromAPI(word));
                        wordsWithDefinitions.push({ word, definition });
                        await delay(200); // Small delay between each word
                    } catch (error) {
                        console.error(`❌ ${groupNum}/${homonymGroups.length}: Failed for "${word}" - ${error.message}`);
                        // Skip this word if definition fails after retries
                    }
                }

                if (wordsWithDefinitions.length === 0) {
                    console.warn(`⚠️  ${groupNum}/${homonymGroups.length}: Skipping [${words.join(', ')}] - No definitions found`);
                    skipCount++;
                    continue;
                }

                // Create homonym group
                const result = await sql`
                    INSERT INTO homonym_groups (collection_id, pronunciation)
                    VALUES (${collectionId}, ${pronunciation})
                    RETURNING id
                `;
                const groupId = result[0].id;

                // Insert words
                for (let j = 0; j < wordsWithDefinitions.length; j++) {
                    const { word, definition } = wordsWithDefinitions[j];
                    await sql`
                        INSERT INTO words (homonym_group_id, word, definition, word_order)
                        VALUES (${groupId}, ${word}, ${definition}, ${j})
                    `;
                }

                successCount++;
                console.log(`✅ ${groupNum}/${homonymGroups.length}: [${wordsWithDefinitions.map(w => w.word).join(', ')}] - ${pronunciation}`);

            } catch (error) {
                skipCount++;
                console.error(`❌ ${groupNum}/${homonymGroups.length}: Failed [${words.join(', ')}] - ${error.message}`);
            }
        }

        console.log(`\n🎉 Population complete!`);
        console.log(`✅ Successfully added: ${successCount} groups`);
        if (skipCount > 0) {
            console.log(`⚠️  Skipped: ${skipCount} groups`);
        }

        // Verify count
        const homonymCount = await sql`
            SELECT COUNT(*) as count 
            FROM homonym_groups 
            WHERE collection_id = ${collectionId}
        `;
        console.log(`\n📊 Total homonym groups in database: ${homonymCount[0].count}`);

    } catch (error) {
        console.error('\n❌ Population failed:', error.message);
        process.exit(1);
    }
}

// Run the populate function
populateOshisHomonyms();
