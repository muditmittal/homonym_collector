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

// Pre-defined pronunciations and definitions
const definitions = {
    'b': '(noun) The second letter of the English alphabet.',
    'be': '(verb) To exist; to have a certain quality or state.',
    'bee': '(noun) A flying insect that collects nectar and pollen.',
    'c': '(noun) The third letter of the English alphabet.',
    'sea': '(noun) A large body of salt water.',
    'see': '(verb) To perceive with the eyes.',
    'i': '(pronoun) Used by a speaker to refer to themselves.',
    'eye': '(noun) The organ of sight.',
    'o': '(interjection) Used to express surprise or address someone.',
    'oh': '(interjection) Used to express surprise or emotion.',
    'p': '(noun) The sixteenth letter of the English alphabet.',
    'pea': '(noun) A small round green seed that is eaten as a vegetable.',
    'pee': '(verb) To urinate.',
    'r': '(noun) The eighteenth letter of the English alphabet.',
    'are': '(verb) Present tense of "be" used with plural subjects.',
    't': '(noun) The twentieth letter of the English alphabet.',
    'tea': '(noun) A hot drink made by infusing dried leaves.',
    'tee': '(noun) A small peg used in golf; the letter T.',
    'u': '(noun) The twenty-first letter of the English alphabet.',
    'you': '(pronoun) Used to refer to the person being addressed.',
    'v': '(noun) The twenty-second letter of the English alphabet.',
    'we': '(pronoun) Used by a speaker to refer to themselves and others.',
    'y': '(noun) The twenty-fifth letter of the English alphabet.',
    'why': '(adverb) For what reason or purpose.',
    'ail': '(verb) To trouble or afflict.',
    'ale': '(noun) A type of beer.',
    'bao': '(noun) A type of steamed bun.',
    'bow': '(noun) A weapon for shooting arrows; (verb) to bend forward.',
    'bail': '(noun) Money paid to release someone from custody.',
    'bale': '(noun) A large bundle of goods.',
    'bare': '(adjective) Not clothed or covered.',
    'bear': '(noun) A large mammal; (verb) to carry or endure.',
    'bean': '(noun) An edible seed that grows in pods.',
    'been': '(verb) Past participle of "be".',
    'beat': '(verb) To strike repeatedly.',
    'beet': '(noun) A root vegetable with red flesh.',
    'berth': '(noun) A bed on a ship or train; a mooring place.',
    'birth': '(noun) The emergence of a baby from the womb.',
    'board': '(noun) A long flat piece of wood; (verb) to get on a vehicle.',
    'bored': '(adjective) Feeling weary and uninterested.',
    'blew': '(verb) Past tense of "blow".',
    'blue': '(adjective) The color of the sky; (noun) the color blue.',
    'by': '(preposition) Near; through the action of.',
    'bye': '(noun) Goodbye; advancement without playing.',
    'buy': '(verb) To purchase.',
    'cale': '(noun) A type of cabbage.',
    'kale': '(noun) A leafy green vegetable.',
    'cease': '(verb) To stop or bring to an end.',
    'seas': '(noun) Plural of sea; large bodies of water.',
    'sees': '(verb) Third person singular of "see".',
    'seize': '(verb) To take hold of suddenly and forcibly.',
    'cent': '(noun) A monetary unit equal to one-hundredth of a dollar.',
    'scent': '(noun) A distinctive smell.',
    'sent': '(verb) Past tense of "send".',
    'chute': '(noun) A sloping channel or slide.',
    'shoot': '(verb) To fire a weapon; to photograph.',
    'dear': '(adjective) Beloved or expensive.',
    'deer': '(noun) A hoofed grazing animal.',
    'doe': '(noun) A female deer.',
    'dough': '(noun) A thick mixture of flour and liquid.',
    'earn': '(verb) To receive money for work.',
    'urn': '(noun) A vase or container.',
    'fair': '(adjective) Just or reasonable; (noun) a gathering.',
    'fare': '(noun) The money paid for a journey.',
    'flea': '(noun) A small jumping insect that feeds on blood.',
    'flee': '(verb) To run away.',
    'flew': '(verb) Past tense of "fly".',
    'flu': '(noun) Influenza; a viral infection.',
    'hair': '(noun) The fine strands growing from the skin.',
    'hare': '(noun) A fast-running mammal like a large rabbit.',
    'hi': '(interjection) Used as a greeting.',
    'high': '(adjective) Of great height; elevated.',
    'heard': '(verb) Past tense of "hear".',
    'herd': '(noun) A group of animals.',
    'hence': '(adverb) As a result; from now.',
    'hens': '(noun) Plural of hen; female chickens.',
    'hour': '(noun) A period of 60 minutes.',
    'our': '(pronoun) Belonging to us.',
    'knight': '(noun) A medieval soldier; a chess piece.',
    'night': '(noun) The period of darkness.',
    'knot': '(noun) A fastening made by tying; a unit of speed.',
    'not': '(adverb) Used to express negation.',
    'know': '(verb) To be aware of or familiar with.',
    'no': '(adverb) Used to give a negative response.',
    'knows': '(verb) Third person singular of "know".',
    'nose': '(noun) The organ of smell.',
    'lead': '(noun) A heavy metal; (verb) to guide.',
    'led': '(verb) Past tense of "lead".',
    'leak': '(noun) A hole that allows liquid to escape; (verb) to escape through a hole.',
    'leek': '(noun) A vegetable related to the onion.',
    'mail': '(noun) Letters and packages sent by post.',
    'male': '(adjective) Of the sex that produces sperm; (noun) a male person.',
    'maid': '(noun) A female domestic servant.',
    'made': '(verb) Past tense of "make".',
    'mat': '(noun) A piece of material placed on a floor.',
    'matte': '(adjective) Having a dull finish.',
    'one': '(number) The number 1.',
    'won': '(verb) Past tense of "win".',
    'oar': '(noun) A pole with a flat blade used for rowing.',
    'or': '(conjunction) Used to link alternatives.',
    'ore': '(noun) A naturally occurring mineral.',
    'pail': '(noun) A bucket.',
    'pale': '(adjective) Light in color or lacking color.',
    'pair': '(noun) Two things used together.',
    'pear': '(noun) A sweet fruit with green or yellow skin.',
    'peace': '(noun) Freedom from disturbance; tranquility.',
    'piece': '(noun) A portion of something.',
    'pi': '(noun) The mathematical constant 3.14159...',
    'pie': '(noun) A baked dish with a pastry crust.',
    'pole': '(noun) A long slender rod.',
    'poll': '(noun) A survey of opinion; voting.',
    'principal': '(adjective) Most important; (noun) head of a school.',
    'principle': '(noun) A fundamental truth or belief.',
    'rain': '(noun) Water falling from clouds.',
    'rein': '(noun) A strap used to control a horse.',
    'reign': '(noun) The period of rule by a monarch; (verb) to rule.',
    'read': '(verb) To look at and understand written words.',
    'reed': '(noun) A tall grass that grows in water.',
    'red': '(adjective) The color of blood.',
    'right': '(adjective) Correct; (noun) a moral entitlement.',
    'rite': '(noun) A religious ceremony.',
    'write': '(verb) To form letters or words.',
    'roll': '(verb) To move by turning; (noun) a small bread.',
    'role': '(noun) A function or position.',
    'scene': '(noun) A place where an event occurs.',
    'seen': '(verb) Past participle of "see".',
    'seam': '(noun) A line where two pieces join.',
    'seem': '(verb) To appear to be.',
    'sail': '(noun) A piece of fabric that catches wind; (verb) to travel by boat.',
    'sale': '(noun) The exchange of goods for money.',
    'so': '(adverb) To such a degree; therefore.',
    'sow': '(verb) To plant seeds; (noun) a female pig.',
    'stationary': '(adjective) Not moving.',
    'stationery': '(noun) Writing materials.',
    'steel': '(noun) A strong metal alloy.',
    'steal': '(verb) To take without permission.',
    'team': '(noun) A group working together.',
    'teem': '(verb) To be full of.',
    'their': '(pronoun) Belonging to them.',
    'there': '(adverb) In that place.',
    'they\'re': '(contraction) They are.',
    'thigh': '(noun) The upper part of the leg.',
    'thai': '(adjective) Relating to Thailand.',
    'to': '(preposition) Expressing direction or position.',
    'too': '(adverb) Also; excessively.',
    'toe': '(noun) One of the digits of the foot.',
    'tow': '(verb) To pull a vehicle.',
    'veil': '(noun) A piece of fabric covering the face.',
    'wail': '(verb) To cry loudly.',
    'whale': '(noun) A very large marine mammal.',
    'vet': '(noun) A veterinarian; (verb) to examine carefully.',
    'wet': '(adjective) Covered with water.',
    'whet': '(verb) To sharpen; to stimulate.',
    'vow': '(noun) A solemn promise; (verb) to promise solemnly.',
    'wow': '(interjection) Used to express surprise.',
    'vile': '(adjective) Extremely unpleasant.',
    'while': '(conjunction) During the time that; (noun) a period of time.',
    'waist': '(noun) The part of the body between ribs and hips.',
    'waste': '(noun) Material that is discarded; (verb) to use carelessly.',
    'wait': '(verb) To stay in expectation.',
    'weight': '(noun) The measure of heaviness.',
    'waive': '(verb) To refrain from enforcing.',
    'wave': '(noun) A moving ridge of water; (verb) to move the hand.',
    'weak': '(adjective) Lacking strength.',
    'week': '(noun) A period of seven days.',
    'weather': '(noun) The state of the atmosphere.',
    'whether': '(conjunction) Expressing a choice between alternatives.',
    'witch': '(noun) A woman believed to have magic powers.',
    'which': '(pronoun) Used to introduce a choice.'
};

// Simplified pronunciations
const pronunciations = {
    'b be bee': '/biː/',
    'c sea see': '/siː/',
    'i eye': '/aɪ/',
    'o oh': '/oʊ/',
    'p pea pee': '/piː/',
    'r are': '/ɑːr/',
    't tea tee': '/tiː/',
    'u you': '/juː/',
    'v we': '/wiː/',
    'y why': '/waɪ/',
    'ail ale': '/eɪl/',
    'bao bow': '/baʊ/',
    'bail bale': '/beɪl/',
    'bare bear': '/bɛər/',
    'bean been': '/biːn/',
    'beat beet': '/biːt/',
    'berth birth': '/bɜːrθ/',
    'board bored': '/bɔːrd/',
    'blew blue': '/bluː/',
    'by bye buy': '/baɪ/',
    'cale kale': '/keɪl/',
    'cease seas sees seize': '/siːz/',
    'cent scent sent': '/sɛnt/',
    'chute shoot': '/ʃuːt/',
    'dear deer': '/dɪər/',
    'doe dough': '/doʊ/',
    'earn urn': '/ɜːrn/',
    'fair fare': '/fɛər/',
    'flea flee': '/fliː/',
    'flew flu': '/fluː/',
    'hair hare': '/hɛər/',
    'hi high': '/haɪ/',
    'heard herd': '/hɜːrd/',
    'hence hens': '/hɛns/',
    'hour our': '/aʊər/',
    'knight night': '/naɪt/',
    'knot not': '/nɑːt/',
    'know no': '/noʊ/',
    'knows nose': '/noʊz/',
    'lead led': '/lɛd/',
    'leak leek': '/liːk/',
    'mail male': '/meɪl/',
    'maid made': '/meɪd/',
    'mat matte': '/mæt/',
    'one won': '/wʌn/',
    'oar or ore': '/ɔːr/',
    'pail pale': '/peɪl/',
    'pair pear': '/pɛər/',
    'peace piece': '/piːs/',
    'pi pie': '/paɪ/',
    'pole poll': '/poʊl/',
    'principal principle': '/ˈprɪnsɪpəl/',
    'rain rein reign': '/reɪn/',
    'read reed': '/riːd/',
    'read red': '/rɛd/',
    'right rite write': '/raɪt/',
    'roll role': '/roʊl/',
    'scene seen': '/siːn/',
    'seam seem': '/siːm/',
    'sail sale': '/seɪl/',
    'so sow': '/soʊ/',
    'stationary stationery': '/ˈsteɪʃənɛri/',
    'steel steal': '/stiːl/',
    'team teem': '/tiːm/',
    'their there they\'re': '/ðɛər/',
    'thigh thai': '/θaɪ/',
    'to too': '/tuː/',
    'toe tow': '/toʊ/',
    'veil wail whale': '/weɪl/',
    'vet wet whet': '/wɛt/',
    'vow wow': '/waʊ/',
    'vile while': '/waɪl/',
    'waist waste': '/weɪst/',
    'wait weight': '/weɪt/',
    'waive wave': '/weɪv/',
    'weak week': '/wiːk/',
    'weather whether': '/ˈwɛðər/',
    'witch which': '/wɪtʃ/'
};

async function populateHomonyms() {
    console.log('🔧 Populating Oshi\'s Homonyms...\n');
    
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found');
        process.exit(1);
    }
    
    try {
        const sql = neon(process.env.DATABASE_URL);
        
        // Get or create Oshi's Homonyms collection
        let collections = await sql`SELECT * FROM collections WHERE name = 'Oshi''s Homonyms'`;
        let collectionId;
        
        if (collections.length === 0) {
            const result = await sql`INSERT INTO collections (name) VALUES ('Oshi''s Homonyms') RETURNING id`;
            collectionId = result[0].id;
            console.log('✅ Created Oshi\'s Homonyms collection');
        } else {
            collectionId = collections[0].id;
            console.log('✅ Found existing Oshi\'s Homonyms collection');
            
            // Clear existing homonyms
            await sql`DELETE FROM homonym_groups WHERE collection_id = ${collectionId}`;
            console.log('🗑️  Cleared existing homonyms');
        }
        
        console.log(`\n📚 Adding ${homonymGroups.length} homonym groups...\n`);
        
        let added = 0;
        for (const words of homonymGroups) {
            try {
                // Get pronunciation for this group
                const key = words.join(' ');
                const pronunciation = pronunciations[key] || `/${words[0]}/`;
                
                // Insert homonym group
                const groupResult = await sql`
                    INSERT INTO homonym_groups (collection_id, pronunciation)
                    VALUES (${collectionId}, ${pronunciation})
                    RETURNING id
                `;
                
                const groupId = groupResult[0].id;
                
                // Insert words
                for (let i = 0; i < words.length; i++) {
                    const word = words[i];
                    const definition = definitions[word] || `(word) ${word}`;
                    
                    await sql`
                        INSERT INTO words (homonym_group_id, word, definition, word_order)
                        VALUES (${groupId}, ${word}, ${definition}, ${i})
                    `;
                }
                
                added++;
                if (added % 10 === 0) {
                    console.log(`   Progress: ${added}/${homonymGroups.length} groups added`);
                }
                
            } catch (error) {
                console.warn(`⚠️  Failed to add group [${words.join(', ')}]:`, error.message);
            }
        }
        
        console.log(`\n✅ Successfully populated ${added} homonym groups!`);
        console.log('\nYou can now refresh your app at http://localhost:8000');
        
    } catch (error) {
        console.error('\n❌ Population failed:', error.message);
        process.exit(1);
    }
}

populateHomonyms();

