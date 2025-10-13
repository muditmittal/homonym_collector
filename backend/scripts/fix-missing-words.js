import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Complete list of homonyms as provided by user
const completeHomonyms = [
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

// Fallback definitions for words not in School Dictionary
const fallbackDefinitions = {
    'are': '(verb) The plural and second person singular of "be"',
    'been': '(verb) Past participle of "be"',
    'blew': '(verb) Past tense of "blow"',
    'flew': '(verb) Past tense of "fly"',
    'led': '(verb) Past tense and past participle of "lead"',
    'made': '(verb) Past tense and past participle of "make"',
    'matte': '(adjective) Having a dull or flat finish without shine',
    'pee': '(verb) To urinate',
    'seen': '(verb) Past participle of "see"',
    'sent': '(verb) Past tense and past participle of "send"',
    'won': '(verb) Past tense and past participle of "win"',
    'bao': '(noun) A type of Chinese steamed bun'
};

/**
 * Fetch definition from Merriam-Webster API
 */
async function fetchDefinition(word) {
    const apiKey = process.env.MERRIAM_WEBSTER_API_KEY;
    const baseUrl = 'https://www.dictionaryapi.com/api/v3/references/sd4/json/';
    
    try {
        const url = `${baseUrl}${encodeURIComponent(word)}?key=${apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !Array.isArray(data) || data.length === 0 || typeof data[0] === 'string') {
            // Use fallback if API doesn't have it
            if (fallbackDefinitions[word.toLowerCase()]) {
                return fallbackDefinitions[word.toLowerCase()];
            }
            throw new Error(`No definition found for "${word}"`);
        }
        
        const firstEntry = data[0];
        const partOfSpeech = firstEntry.fl || 'word';
        const definition = firstEntry.shortdef?.[0];
        
        if (!definition) {
            if (fallbackDefinitions[word.toLowerCase()]) {
                return fallbackDefinitions[word.toLowerCase()];
            }
            throw new Error(`No definition found for "${word}"`);
        }
        
        const capitalizedDef = definition.charAt(0).toUpperCase() + definition.slice(1);
        return `(${partOfSpeech}) ${capitalizedDef}`;
    } catch (error) {
        // Use fallback definition if available
        if (fallbackDefinitions[word.toLowerCase()]) {
            return fallbackDefinitions[word.toLowerCase()];
        }
        throw error;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fix missing words in database
 */
async function fixMissingWords() {
    console.log('🔍 Checking for missing words in database...\n');
    
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found');
        process.exit(1);
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    try {
        // Get all current groups from database
        const dbGroups = await sql`
            SELECT hg.id, hg.pronunciation,
                   array_agg(w.word ORDER BY w.word_order) as words
            FROM homonym_groups hg
            LEFT JOIN words w ON w.homonym_group_id = hg.id
            WHERE hg.collection_id = 1
            GROUP BY hg.id, hg.pronunciation
            ORDER BY hg.id
        `;
        
        console.log(`📊 Found ${dbGroups.length} groups in database\n`);
        
        let fixedCount = 0;
        let addedWords = 0;
        
        // For each expected group, check if all words are present
        for (let i = 0; i < completeHomonyms.length; i++) {
            const expectedWords = completeHomonyms[i].map(w => w.toLowerCase());
            const dbGroup = dbGroups[i];
            
            if (!dbGroup) {
                console.error(`❌ Group ${i + 1} missing entirely: [${expectedWords.join(', ')}]`);
                continue;
            }
            
            const dbWords = dbGroup.words || [];
            const missingWords = expectedWords.filter(w => !dbWords.includes(w));
            
            if (missingWords.length > 0) {
                console.log(`🔧 Group ${i + 1}: Found ${missingWords.length} missing word(s): [${missingWords.join(', ')}]`);
                fixedCount++;
                
                // Add missing words
                for (const word of missingWords) {
                    try {
                        const definition = await fetchDefinition(word);
                        const nextOrder = dbWords.length + (missingWords.indexOf(word));
                        
                        await sql`
                            INSERT INTO words (homonym_group_id, word, definition, word_order)
                            VALUES (${dbGroup.id}, ${word}, ${definition}, ${nextOrder})
                        `;
                        
                        console.log(`   ✅ Added "${word}": ${definition.substring(0, 60)}...`);
                        addedWords++;
                        await delay(200); // Respect rate limits
                    } catch (error) {
                        console.error(`   ❌ Failed to add "${word}": ${error.message}`);
                    }
                }
                console.log('');
            }
        }
        
        console.log('\n🎉 Fixing complete!');
        console.log(`✅ Fixed ${fixedCount} groups`);
        console.log(`✅ Added ${addedWords} missing words`);
        
        // Verify final count
        const finalGroups = await sql`
            SELECT hg.id, array_agg(w.word ORDER BY w.word_order) as words
            FROM homonym_groups hg
            LEFT JOIN words w ON w.homonym_group_id = hg.id
            WHERE hg.collection_id = 1
            GROUP BY hg.id
            ORDER BY hg.id
        `;
        
        console.log(`\n📊 Final database state: ${finalGroups.length} groups`);
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

fixMissingWords();

