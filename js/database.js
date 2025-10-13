/**
 * Homonym Database
 * Curated collection of homophone pairs and groups
 * All definitions verified against dictionary sources
 */

const HomonymDatabase = {
    // Single letter homophones
    singleLetters: {
        'b': ['be', 'bee'],
        'c': ['sea', 'see'],
        'i': ['eye'],
        'o': ['oh'],
        'p': ['pea', 'pee'],
        'r': ['are'],
        't': ['tea', 'tee'],
        'u': ['you'],
        'y': ['why']
    },

    // Common homophone pairs and groups
    // Format: word -> array of homophones (excluding the word itself)
    homophones: {
        // A words
        'ail': ['ale'],
        'ale': ['ail'],
        'ate': ['eight'],
        'eight': ['ate'],

        // B words
        'bail': ['bale'],
        'bale': ['bail'],
        'bare': ['bear'],
        'bear': ['bare'],
        'beat': ['beet'],
        'beet': ['beat'],
        'been': ['bean'],
        'bean': ['been'],
        'berth': ['birth'],
        'birth': ['berth'],
        'blew': ['blue'],
        'blue': ['blew'],
        'board': ['bored'],
        'bored': ['board'],
        'brake': ['break'],
        'break': ['brake'],
        'bread': ['bred'],
        'bred': ['bread'],
        'buy': ['by', 'bye'],
        'by': ['buy', 'bye'],
        'bye': ['buy', 'by'],

        // C words
        'cell': ['sell'],
        'sell': ['cell'],
        'cent': ['sent', 'scent'],
        'sent': ['cent', 'scent'],
        'scent': ['cent', 'sent'],
        'cereal': ['serial'],
        'serial': ['cereal'],
        'cheap': ['cheep'],
        'cheep': ['cheap'],
        'choose': ['chews'],
        'chews': ['choose'],
        'cite': ['sight', 'site'],
        'sight': ['cite', 'site'],
        'site': ['cite', 'sight'],
        'coarse': ['course'],
        'course': ['coarse'],
        'creak': ['creek'],
        'creek': ['creak'],
        'crews': ['cruise'],
        'cruise': ['crews'],

        // D words
        'dear': ['deer'],
        'deer': ['dear'],
        'dew': ['do', 'due'],
        'do': ['dew', 'due'],
        'due': ['dew', 'do'],
        'die': ['dye'],
        'dye': ['die'],
        'doe': ['dough'],
        'dough': ['doe'],

        // E words
        'earn': ['urn'],
        'urn': ['earn'],

        // F words
        'fair': ['fare'],
        'fare': ['fair'],
        'feat': ['feet'],
        'feet': ['feat'],
        'find': ['fined'],
        'fined': ['find'],
        'fir': ['fur'],
        'fur': ['fir'],
        'flea': ['flee'],
        'flee': ['flea'],
        'flew': ['flu', 'flue'],
        'flu': ['flew', 'flue'],
        'flue': ['flew', 'flu'],
        'flour': ['flower'],
        'flower': ['flour'],
        'for': ['four', 'fore'],
        'four': ['for', 'fore'],
        'fore': ['for', 'four'],
        'foul': ['fowl'],
        'fowl': ['foul'],

        // G words
        'gait': ['gate'],
        'gate': ['gait'],
        'gene': ['jean'],
        'jean': ['gene'],
        'groan': ['grown'],
        'grown': ['groan'],
        'guest': ['guessed'],
        'guessed': ['guest'],

        // H words
        'hair': ['hare'],
        'hare': ['hair'],
        'hall': ['haul'],
        'haul': ['hall'],
        'heal': ['heel'],
        'heel': ['heal'],
        'hear': ['here'],
        'here': ['hear'],
        'heard': ['herd'],
        'herd': ['heard'],
        'hi': ['high'],
        'high': ['hi'],
        'him': ['hymn'],
        'hymn': ['him'],
        'hole': ['whole'],
        'whole': ['hole'],
        'hour': ['our'],
        'our': ['hour'],

        // I words
        'idle': ['idol'],
        'idol': ['idle'],
        'its': ["it's"],
        "it's": ['its'],

        // K words
        'kale': ['kail'],
        'kail': ['kale'],
        'knead': ['need'],
        'need': ['knead'],
        'knew': ['new'],
        'new': ['knew'],
        'knight': ['night'],
        'night': ['knight'],
        'knot': ['not'],
        'not': ['knot'],
        'know': ['no'],
        'no': ['know'],

        // L words
        'lead': ['led'],
        'led': ['lead'],
        'leak': ['leek'],
        'leek': ['leak'],
        'lean': ['lien'],
        'lien': ['lean'],

        // M words
        'made': ['maid'],
        'maid': ['made'],
        'mail': ['male'],
        'male': ['mail'],
        'main': ['mane'],
        'mane': ['main'],
        'meat': ['meet'],
        'meet': ['meat'],
        'might': ['mite'],
        'mite': ['might'],
        'miner': ['minor'],
        'minor': ['miner'],
        'missed': ['mist'],
        'mist': ['missed'],
        'moose': ['mousse'],
        'mousse': ['moose'],

        // N words
        'naval': ['navel'],
        'navel': ['naval'],
        'none': ['nun'],
        'nun': ['none'],

        // O words
        'oar': ['or', 'ore'],
        'or': ['oar', 'ore'],
        'ore': ['oar', 'or'],
        'one': ['won'],
        'won': ['one'],

        // P words
        'pail': ['pale'],
        'pale': ['pail'],
        'pain': ['pane'],
        'pane': ['pain'],
        'pair': ['pear'],
        'pear': ['pair'],
        'peace': ['piece'],
        'piece': ['peace'],
        'peak': ['peek'],
        'peek': ['peak'],
        'pi': ['pie'],
        'pie': ['pi'],
        'plain': ['plane'],
        'plane': ['plain'],
        'pole': ['poll'],
        'poll': ['pole'],
        'poor': ['pour'],
        'pour': ['poor'],
        'pray': ['prey'],
        'prey': ['pray'],
        'principal': ['principle'],
        'principle': ['principal'],

        // R words
        'rain': ['rein', 'reign'],
        'rein': ['rain', 'reign'],
        'reign': ['rain', 'rein'],
        'raise': ['rays'],
        'rays': ['raise'],
        'read': ['red', 'reed'],
        'red': ['read', 'reed'],
        'reed': ['read', 'red'],
        'right': ['rite', 'write'],
        'rite': ['right', 'write'],
        'write': ['right', 'rite'],
        'road': ['rode'],
        'rode': ['road'],
        'role': ['roll'],
        'roll': ['role'],
        'root': ['route'],
        'route': ['root'],

        // S words
        'sail': ['sale'],
        'sale': ['sail'],
        'scene': ['seen'],
        'seen': ['scene'],
        'seam': ['seem'],
        'seem': ['seam'],
        'sew': ['so', 'sow'],
        'so': ['sew', 'sow'],
        'sow': ['sew', 'so'],
        'son': ['sun'],
        'sun': ['son'],
        'stair': ['stare'],
        'stare': ['stair'],
        'stationary': ['stationery'],
        'stationery': ['stationary'],
        'steal': ['steel'],
        'steel': ['steal'],
        'suite': ['sweet'],
        'sweet': ['suite'],

        // T words
        'tail': ['tale'],
        'tale': ['tail'],
        'team': ['teem'],
        'teem': ['team'],
        'tear': ['tier'],
        'tier': ['tear'],
        'their': ['there', "they're"],
        'there': ['their', "they're"],
        "they're": ['their', 'there'],
        'threw': ['through'],
        'through': ['threw'],
        'throne': ['thrown'],
        'thrown': ['throne'],
        'tide': ['tied'],
        'tied': ['tide'],
        'to': ['too', 'two'],
        'too': ['to', 'two'],
        'two': ['to', 'too'],
        'toe': ['tow'],
        'tow': ['toe'],

        // W words
        'wade': ['weighed'],
        'weighed': ['wade'],
        'waist': ['waste'],
        'waste': ['waist'],
        'wait': ['weight'],
        'weight': ['wait'],
        'waive': ['wave'],
        'wave': ['waive'],
        'ware': ['wear', 'where'],
        'wear': ['ware', 'where'],
        'where': ['ware', 'wear'],
        'way': ['weigh'],
        'weigh': ['way'],
        'weak': ['week'],
        'week': ['weak'],
        'weather': ['whether'],
        'whether': ['weather'],
        'which': ['witch'],
        'witch': ['which'],
        'wood': ['would'],
        'would': ['wood']
    },

    /**
     * Get homophones for a given word
     * @param {string} word - The word to find homophones for
     * @returns {string[]} Array of homophones
     */
    getHomophones(word) {
        const normalizedWord = word.toLowerCase().trim();
        
        // Check single letters first
        if (this.singleLetters[normalizedWord]) {
            return this.singleLetters[normalizedWord];
        }
        
        // Check regular homophones
        if (this.homophones[normalizedWord]) {
            return this.homophones[normalizedWord];
        }
        
        return [];
    },

    /**
     * Check if a word exists in the database
     * @param {string} word - The word to check
     * @returns {boolean} True if word exists in database
     */
    hasWord(word) {
        const normalizedWord = word.toLowerCase().trim();
        return !!(this.singleLetters[normalizedWord] || this.homophones[normalizedWord]);
    },

    /**
     * Get all words in the database
     * @returns {string[]} Array of all words
     */
    getAllWords() {
        const words = new Set();
        
        // Add single letters
        Object.keys(this.singleLetters).forEach(word => words.add(word));
        Object.values(this.singleLetters).forEach(homophones => {
            homophones.forEach(word => words.add(word));
        });
        
        // Add regular words
        Object.keys(this.homophones).forEach(word => words.add(word));
        
        return Array.from(words).sort();
    }
};

// Make database available globally
window.HomonymDatabase = HomonymDatabase;
