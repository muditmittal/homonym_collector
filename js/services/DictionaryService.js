/**
 * Enhanced Dictionary Service with Fallback Database
 * Handles API calls with local fallback for common words
 */

class DictionaryService {
    constructor() {
        this.baseUrl = AppConfig.api.dictionaryBaseUrl;
        this.timeout = AppConfig.api.timeout;
        this.cache = new Map();
        
        // Initialize with pre-loaded definitions for common homophone words
        this.initializeCommonDefinitions();
    }

    /**
     * Initialize cache with common word definitions
     * This provides fallback when API is unavailable
     */
    initializeCommonDefinitions() {
        const commonDefinitions = {
            // Single letters and their homophones
            'b': '(noun) The second letter of the English alphabet.',
            'be': '(verb) To exist; to have a certain quality or state.',
            'bee': '(noun) A flying insect that collects nectar and pollen.',
            'c': '(noun) The third letter of the English alphabet.',
            'sea': '(noun) A large body of salt water.',
            'see': '(verb) To perceive with the eyes.',
            'i': '(pronoun) Used by a speaker to refer to himself or herself.',
            'eye': '(noun) The organ of sight.',
            'o': '(exclamation) Used to express surprise or emotion.',
            'oh': '(exclamation) Used to express surprise, pain, or pleasure.',
            'p': '(noun) The sixteenth letter of the English alphabet.',
            'pea': '(noun) A spherical green seed eaten as a vegetable.',
            'pee': '(verb) To urinate.',
            'r': '(noun) The eighteenth letter of the English alphabet.',
            'are': '(verb) Second person singular and plural of "be".',
            't': '(noun) The twentieth letter of the English alphabet.',
            'tea': '(noun) A hot drink made by infusing dried leaves in boiling water.',
            'tee': '(noun) A stand for holding a golf ball.',
            'u': '(noun) The twenty-first letter of the English alphabet.',
            'you': '(pronoun) Used to refer to the person being addressed.',
            'y': '(noun) The twenty-fifth letter of the English alphabet.',
            'why': '(adverb) For what reason or purpose.',

            // Common homophones
            'ail': '(verb) To trouble or afflict.',
            'ale': '(noun) A type of beer.',
            'ate': '(verb) Past tense of eat.',
            'eight': '(number) The number 8.',
            'bail': '(noun) Money paid as security for release from jail.',
            'bale': '(noun) A large bundle of hay or cotton.',
            'bare': '(adjective) Not clothed or covered.',
            'bear': '(noun) A large, heavy mammal with thick fur.',
            'beat': '(verb) To strike repeatedly.',
            'beet': '(noun) A dark red root vegetable.',
            'been': '(verb) Past participle of be.',
            'bean': '(noun) An edible seed from certain plants.',
            'berth': '(noun) A place to sleep on a ship or train.',
            'birth': '(noun) The emergence of a baby from the womb.',
            'blew': '(verb) Past tense of blow.',
            'blue': '(adjective) Having the color of the sky.',
            'board': '(noun) A flat piece of wood or other material.',
            'bored': '(adjective) Feeling weary from lack of interest.',
            'brake': '(noun) A device for slowing or stopping motion.',
            'break': '(verb) To separate into pieces.',
            'bread': '(noun) Food made from flour, water, and yeast.',
            'bred': '(verb) Past tense of breed.',
            'buy': '(verb) To purchase.',
            'by': '(preposition) Near to; beside.',
            'bye': '(exclamation) Farewell.',
            'cell': '(noun) The smallest unit of life.',
            'sell': '(verb) To exchange for money.',
            'cent': '(noun) A monetary unit equal to one hundredth of a dollar.',
            'sent': '(verb) Past tense of send.',
            'scent': '(noun) A distinctive smell.',
            'cereal': '(noun) A breakfast food made from grains.',
            'serial': '(adjective) Consisting of parts in a series.',
            'cheap': '(adjective) Low in price.',
            'cheep': '(verb) To make a short, high-pitched sound.',
            'choose': '(verb) To select from alternatives.',
            'chews': '(verb) Third person singular of chew.',
            'cite': '(verb) To quote as evidence.',
            'sight': '(noun) The ability to see.',
            'site': '(noun) A particular place.',
            'coarse': '(adjective) Rough or harsh in texture.',
            'course': '(noun) A route or direction taken.',
            'creak': '(verb) To make a harsh, grating sound.',
            'creek': '(noun) A small stream.',
            'crews': '(noun) Plural of crew.',
            'cruise': '(verb) To travel smoothly at a steady speed.',
            'dear': '(adjective) Beloved or precious.',
            'deer': '(noun) A hoofed mammal.',
            'dew': '(noun) Moisture condensed from the atmosphere.',
            'do': '(verb) To perform an action.',
            'due': '(adjective) Expected at a certain time.',
            'die': '(verb) To stop living.',
            'dye': '(noun) A substance used to color materials.',
            'doe': '(noun) A female deer.',
            'dough': '(noun) A mixture of flour and liquid.',
            'earn': '(verb) To receive money in return for work.',
            'urn': '(noun) A vase-shaped container.',
            'fair': '(adjective) Just or reasonable.',
            'fare': '(noun) The price of travel.',
            'feat': '(noun) An achievement requiring skill.',
            'feet': '(noun) Plural of foot.',
            'find': '(verb) To discover.',
            'fined': '(verb) Past tense of fine (penalize).',
            'fir': '(noun) An evergreen tree.',
            'fur': '(noun) The hair of animals.',
            'flea': '(noun) A small jumping insect.',
            'flee': '(verb) To run away.',
            'flew': '(verb) Past tense of fly.',
            'flu': '(noun) Influenza.',
            'flue': '(noun) A duct for smoke.',
            'flour': '(noun) Powder made from ground grain.',
            'flower': '(noun) The reproductive part of a plant.',
            'for': '(preposition) In favor of.',
            'four': '(number) The number 4.',
            'fore': '(adjective) Situated in front.',
            'foul': '(adjective) Offensive to the senses.',
            'fowl': '(noun) A bird kept for eggs or meat.',
            'gait': '(noun) A manner of walking.',
            'gate': '(noun) A movable barrier.',
            'gene': '(noun) A unit of heredity.',
            'jean': '(noun) A type of durable cotton fabric.',
            'groan': '(verb) To make a deep sound of pain.',
            'grown': '(verb) Past participle of grow.',
            'guest': '(noun) A person invited to visit.',
            'guessed': '(verb) Past tense of guess.',
            'hair': '(noun) Strands growing from the skin.',
            'hare': '(noun) A fast-running mammal.',
            'hall': '(noun) A corridor or large room.',
            'haul': '(verb) To pull or drag.',
            'heal': '(verb) To make healthy again.',
            'heel': '(noun) The back part of the foot.',
            'hear': '(verb) To perceive sound.',
            'here': '(adverb) In this place.',
            'heard': '(verb) Past tense of hear.',
            'herd': '(noun) A group of animals.',
            'hi': '(exclamation) Used as a greeting.',
            'high': '(adjective) Extending upward.',
            'him': '(pronoun) Used to refer to a male person.',
            'hymn': '(noun) A religious song.',
            'hole': '(noun) An opening or gap.',
            'whole': '(adjective) Complete; entire.',
            'hour': '(noun) A period of 60 minutes.',
            'our': '(pronoun) Belonging to us.',
            'idle': '(adjective) Not active.',
            'idol': '(noun) An object of worship.',
            'its': '(pronoun) Belonging to it.',
            "it's": '(contraction) It is.',
            'kale': '(noun) A leafy green vegetable.',
            'kail': '(noun) Scottish word for cabbage.',
            'knead': '(verb) To work dough with hands.',
            'need': '(verb) To require.',
            'knew': '(verb) Past tense of know.',
            'new': '(adjective) Recently made or discovered.',
            'knight': '(noun) A medieval warrior.',
            'night': '(noun) The time of darkness.',
            'knot': '(noun) A fastening made by tying.',
            'not': '(adverb) Used to express negation.',
            'know': '(verb) To be aware of.',
            'no': '(determiner) Not any.',
            'lead': '(verb) To guide or direct.',
            'led': '(verb) Past tense of lead.',
            'leak': '(verb) To allow liquid to escape.',
            'leek': '(noun) A vegetable related to onions.',
            'lean': '(verb) To incline from vertical.',
            'lien': '(noun) A legal claim on property.',
            'made': '(verb) Past tense of make.',
            'maid': '(noun) A female domestic servant.',
            'mail': '(noun) Letters and packages.',
            'male': '(adjective) Of the sex that produces sperm.',
            'main': '(adjective) Chief in importance.',
            'mane': '(noun) Long hair on a horse\'s neck.',
            'meat': '(noun) Animal flesh used as food.',
            'meet': '(verb) To encounter.',
            'might': '(verb) Past tense of may.',
            'mite': '(noun) A tiny arachnid.',
            'miner': '(noun) A person who works in mines.',
            'minor': '(adjective) Lesser in importance.',
            'missed': '(verb) Past tense of miss.',
            'mist': '(noun) A cloud of tiny water droplets.',
            'moose': '(noun) A large deer.',
            'mousse': '(noun) A light, fluffy dessert.',
            'naval': '(adjective) Relating to a navy.',
            'navel': '(noun) The belly button.',
            'none': '(pronoun) Not one.',
            'nun': '(noun) A member of a religious community.',
            'oar': '(noun) A pole used to row a boat.',
            'or': '(conjunction) Used to link alternatives.',
            'ore': '(noun) A mineral containing metal.',
            'one': '(number) The number 1.',
            'won': '(verb) Past tense of win.',
            'pail': '(noun) A bucket.',
            'pale': '(adjective) Light in color.',
            'pain': '(noun) Physical suffering.',
            'pane': '(noun) A sheet of glass.',
            'pair': '(noun) Two things used together.',
            'pear': '(noun) A sweet fruit.',
            'peace': '(noun) A state of harmony.',
            'piece': '(noun) A part of something.',
            'peak': '(noun) The pointed top of a mountain.',
            'peek': '(verb) To look quickly.',
            'pi': '(noun) The mathematical constant 3.14159.',
            'pie': '(noun) A baked dish with pastry.',
            'plain': '(adjective) Simple; unadorned.',
            'plane': '(noun) A flat surface; an aircraft.',
            'pole': '(noun) A long, thin piece of wood or metal.',
            'poll': '(noun) A survey of opinion.',
            'poor': '(adjective) Having little money.',
            'pour': '(verb) To flow in a steady stream.',
            'pray': '(verb) To address a deity.',
            'prey': '(noun) An animal hunted by another.',
            'principal': '(adjective) Most important.',
            'principle': '(noun) A fundamental rule.',
            'rain': '(noun) Water falling from clouds.',
            'rein': '(noun) A strap used to control a horse.',
            'reign': '(verb) To rule as monarch.',
            'raise': '(verb) To lift up.',
            'rays': '(noun) Plural of ray.',
            'read': '(verb) To look at and understand text.',
            'red': '(adjective) Having the color of blood.',
            'reed': '(noun) A tall, thin plant.',
            'right': '(adjective) Correct; opposite of left.',
            'rite': '(noun) A ceremonial act.',
            'write': '(verb) To mark letters or words.',
            'road': '(noun) A path for vehicles.',
            'rode': '(verb) Past tense of ride.',
            'role': '(noun) A part played by someone.',
            'roll': '(verb) To move by turning over.',
            'root': '(noun) The part of a plant in soil.',
            'route': '(noun) A way or course taken.',
            'sail': '(noun) A piece of fabric to catch wind.',
            'sale': '(noun) The exchange of goods for money.',
            'scene': '(noun) A place where an event occurs.',
            'seen': '(verb) Past participle of see.',
            'seam': '(noun) A line where pieces join.',
            'seem': '(verb) To appear to be.',
            'sew': '(verb) To join with stitches.',
            'so': '(adverb) To such a degree.',
            'sow': '(verb) To plant seeds.',
            'son': '(noun) A male offspring.',
            'sun': '(noun) The star at the center of our solar system.',
            'stair': '(noun) One of a series of steps.',
            'stare': '(verb) To look fixedly.',
            'stationary': '(adjective) Not moving.',
            'stationery': '(noun) Writing materials.',
            'steal': '(verb) To take without permission.',
            'steel': '(noun) A strong metal alloy.',
            'suite': '(noun) A set of rooms.',
            'sweet': '(adjective) Having a sugary taste.',
            'tail': '(noun) The rear part of an animal.',
            'tale': '(noun) A story.',
            'team': '(noun) A group working together.',
            'teem': '(verb) To be full of.',
            'tear': '(noun) A drop of salty liquid from the eye.',
            'tier': '(noun) A level or rank.',
            'their': '(pronoun) Belonging to them.',
            'there': '(adverb) In that place.',
            "they're": '(contraction) They are.',
            'threw': '(verb) Past tense of throw.',
            'through': '(preposition) From one side to the other.',
            'throne': '(noun) A ceremonial chair for a ruler.',
            'thrown': '(verb) Past participle of throw.',
            'tide': '(noun) The regular rise and fall of sea level.',
            'tied': '(verb) Past tense of tie.',
            'to': '(preposition) Expressing direction.',
            'too': '(adverb) Excessively.',
            'two': '(number) The number 2.',
            'toe': '(noun) A digit of the foot.',
            'tow': '(verb) To pull along.',
            'wade': '(verb) To walk through water.',
            'weighed': '(verb) Past tense of weigh.',
            'waist': '(noun) The part of the body above the hips.',
            'waste': '(verb) To use carelessly.',
            'wait': '(verb) To stay in expectation.',
            'weight': '(noun) The heaviness of something.',
            'waive': '(verb) To give up a right.',
            'wave': '(noun) A moving ridge of water.',
            'ware': '(noun) Manufactured articles.',
            'wear': '(verb) To have on one\'s body.',
            'where': '(adverb) In what place.',
            'way': '(noun) A method or manner.',
            'weigh': '(verb) To measure heaviness.',
            'weak': '(adjective) Lacking strength.',
            'week': '(noun) A period of seven days.',
            'weather': '(noun) Atmospheric conditions.',
            'whether': '(conjunction) Expressing doubt.',
            'which': '(pronoun) What one or ones.',
            'witch': '(noun) A person practicing magic.',
            'wood': '(noun) The hard substance of trees.',
            'would': '(verb) Past tense of will.'
        };

        // Pre-populate cache with common definitions
        Object.entries(commonDefinitions).forEach(([word, definition]) => {
            this.cache.set(`def_${word}`, definition);
        });

        console.log(`Pre-loaded ${Object.keys(commonDefinitions).length} common word definitions`);
    }

    /**
     * Create an AbortController for request timeout
     */
    createTimeoutController() {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), this.timeout);
        return controller;
    }

    /**
     * Get word definition with fallback to local cache
     */
    async getDefinition(word) {
        const normalizedWord = word.toLowerCase().trim();
        const cacheKey = `def_${normalizedWord}`;
        
        // Check cache first (includes pre-loaded definitions)
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Try API call with fallback
        try {
            const controller = this.createTimeoutController();
            const response = await fetch(`${this.baseUrl}${normalizedWord}`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const definition = this.extractDefinition(data);
            
            // Cache successful results
            if (definition && !definition.includes('not available')) {
                this.cache.set(cacheKey, definition);
            }
            
            return definition;
        } catch (error) {
            console.warn(`API lookup failed for "${word}":`, error.message);
            
            // Return a generic definition as fallback
            const fallbackDefinition = `(word) ${normalizedWord}`;
            this.cache.set(cacheKey, fallbackDefinition);
            return fallbackDefinition;
        }
    }

    /**
     * Get word pronunciation with fallback
     */
    async getPronunciation(word) {
        const normalizedWord = word.toLowerCase().trim();
        const cacheKey = `pron_${normalizedWord}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const controller = this.createTimeoutController();
            const response = await fetch(`${this.baseUrl}${normalizedWord}`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const pronunciation = this.extractPronunciation(data);
            
            if (pronunciation) {
                this.cache.set(cacheKey, pronunciation);
            }
            
            return pronunciation || `/${normalizedWord}/`;
        } catch (error) {
            console.warn(`Pronunciation lookup failed for "${word}":`, error.message);
            const fallback = `/${normalizedWord}/`;
            this.cache.set(cacheKey, fallback);
            return fallback;
        }
    }

    /**
     * Validate word exists (with fallback to cache)
     */
    async validateWord(word) {
        const normalizedWord = word.toLowerCase().trim();
        
        // If we have a cached definition, word is valid
        if (this.cache.has(`def_${normalizedWord}`)) {
            return true;
        }

        try {
            const controller = this.createTimeoutController();
            const response = await fetch(`${this.baseUrl}${normalizedWord}`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            return response.ok;
        } catch (error) {
            console.warn(`Word validation failed for "${word}":`, error.message);
            // For common words, assume they're valid even if API fails
            return normalizedWord.length > 1 && /^[a-z']+$/.test(normalizedWord);
        }
    }

    /**
     * Extract definition from API response
     */
    extractDefinition(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return 'Definition not available';
        }

        const entry = data[0];
        if (!entry.meanings || entry.meanings.length === 0) {
            return 'Definition not available';
        }

        const meaning = entry.meanings[0];
        if (!meaning.definitions || meaning.definitions.length === 0) {
            return 'Definition not available';
        }

        const definition = meaning.definitions[0];
        const partOfSpeech = meaning.partOfSpeech || '';
        const def = definition.definition || 'Definition not available';

        return partOfSpeech ? `(${partOfSpeech}) ${def}` : def;
    }

    /**
     * Extract pronunciation from API response
     */
    extractPronunciation(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return '';
        }

        const entry = data[0];
        
        if (entry.phonetics && Array.isArray(entry.phonetics)) {
            for (const phonetic of entry.phonetics) {
                if (phonetic.text) {
                    return phonetic.text;
                }
            }
        }

        if (entry.phonetic) {
            return entry.phonetic;
        }

        return '';
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        this.initializeCommonDefinitions();
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Make service available globally
window.DictionaryService = DictionaryService;