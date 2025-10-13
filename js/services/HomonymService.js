/**
 * Homonym Service
 * Handles business logic for homonym operations
 */

class HomonymService {
    constructor(dictionaryService, storageService) {
        this.dictionaryService = dictionaryService;
        this.storageService = storageService;
        this.homonyms = [];
        this.collectionName = '';
        
        this.init();
    }

    /**
     * Initialize the service
     */
    init() {
        this.homonyms = this.storageService.loadHomonyms();
        this.collectionName = this.storageService.loadCollectionName();
        
        // If no homonyms exist, populate with curated collection
        if (this.homonyms.length === 0) {
            this.populateDefaultCollection();
        }
    }

    /**
     * Get all homonyms
     * @returns {Array} Array of homonym objects
     */
    getHomonyms() {
        return [...this.homonyms]; // Return copy to prevent mutation
    }

    /**
     * Get homonym by ID
     * @param {number} id - Homonym ID
     * @returns {Object|null} Homonym object or null
     */
    getHomonymById(id) {
        return this.homonyms.find(h => h.id === id) || null;
    }

    /**
     * Add a new homonym group
     * @param {Array} words - Array of words with definitions
     * @param {string} pronunciation - Pronunciation
     * @returns {Object} Created homonym group
     */
    addHomonymGroup(words, pronunciation) {
        const homonymGroup = {
            id: Date.now() + Math.random(), // Ensure uniqueness
            pronunciation: pronunciation || this.generatePronunciation(words[0]?.word),
            words: words.map(w => ({
                word: w.word.toLowerCase().trim(),
                definition: w.definition
            })),
            dateAdded: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        this.homonyms.push(homonymGroup);
        this.save();
        
        return homonymGroup;
    }

    /**
     * Update an existing homonym group
     * @param {number} id - Homonym ID
     * @param {Object} updates - Updates to apply
     * @returns {boolean} Success status
     */
    updateHomonymGroup(id, updates) {
        const index = this.homonyms.findIndex(h => h.id === id);
        if (index === -1) return false;

        this.homonyms[index] = {
            ...this.homonyms[index],
            ...updates,
            lastModified: new Date().toISOString()
        };

        this.save();
        return true;
    }

    /**
     * Delete a homonym group
     * @param {number} id - Homonym ID
     * @returns {boolean} Success status
     */
    deleteHomonymGroup(id) {
        const index = this.homonyms.findIndex(h => h.id === id);
        if (index === -1) return false;

        this.homonyms.splice(index, 1);
        this.save();
        return true;
    }

    /**
     * Search homonyms by word
     * @param {string} searchTerm - Search term
     * @returns {Array} Matching homonym groups
     */
    searchHomonyms(searchTerm) {
        if (!searchTerm || !searchTerm.trim()) {
            return this.getHomonyms();
        }

        const term = searchTerm.toLowerCase().trim();
        return this.homonyms.filter(homonym => 
            homonym.words.some(word => 
                word.word.toLowerCase().includes(term) ||
                word.definition.toLowerCase().includes(term)
            )
        );
    }

    /**
     * Find homonym suggestions for a word
     * @param {string} word - Word to find suggestions for
     * @returns {Promise<Array>} Array of suggestion objects
     */
    async findHomonymSuggestions(word) {
        const normalizedWord = word.toLowerCase().trim();
        
        // First validate the word exists in dictionary
        const isValid = await this.dictionaryService.validateWord(normalizedWord);
        if (!isValid) {
            return [{
                word: normalizedWord,
                pronunciation: 'Invalid word',
                definition: `"${word}" was not found in the dictionary. Please check the spelling.`,
                isError: true,
                isOriginal: true
            }];
        }

        // Get word definition
        const definition = await this.dictionaryService.getDefinition(normalizedWord);
        
        // Get homophones from database
        const homophones = HomonymDatabase.getHomophones(normalizedWord);
        const suggestions = [];

        // Add original word first
        suggestions.push({
            word: normalizedWord,
            pronunciation: 'Loading...',
            definition: definition,
            isOriginal: true
        });

        // Add validated homophones
        for (const homophone of homophones) {
            try {
                const homophoneDefinition = await this.dictionaryService.getDefinition(homophone);
                if (homophoneDefinition && !homophoneDefinition.includes('not available')) {
                    suggestions.push({
                        word: homophone,
                        pronunciation: 'Loading...',
                        definition: homophoneDefinition
                    });
                }
            } catch (error) {
                console.warn(`Skipping invalid homophone: ${homophone}`);
            }
        }

        return suggestions;
    }

    /**
     * Refresh definitions for all homonyms
     * @returns {Promise<boolean>} True if any definitions were updated
     */
    async refreshAllDefinitions() {
        let updated = false;
        
        for (const homonym of this.homonyms) {
            for (const word of homonym.words) {
                try {
                    const newDefinition = await this.dictionaryService.getDefinition(word.word);
                    if (newDefinition !== word.definition) {
                        word.definition = newDefinition;
                        updated = true;
                    }
                } catch (error) {
                    console.warn(`Failed to refresh definition for ${word.word}:`, error);
                }
            }
            
            if (updated) {
                homonym.lastModified = new Date().toISOString();
            }
        }

        if (updated) {
            this.save();
        }

        return updated;
    }

    /**
     * Get collection name
     * @returns {string} Collection name
     */
    getCollectionName() {
        return this.collectionName;
    }

    /**
     * Set collection name
     * @param {string} name - New collection name
     */
    setCollectionName(name) {
        this.collectionName = name;
        this.storageService.saveCollectionName(name);
    }

    /**
     * Get collection statistics
     * @returns {Object} Collection stats
     */
    getCollectionStats() {
        const totalWords = this.homonyms.reduce((sum, h) => sum + h.words.length, 0);
        const averageWordsPerGroup = totalWords / this.homonyms.length || 0;
        
        return {
            totalHomonyms: this.homonyms.length,
            totalWords: totalWords,
            averageWordsPerGroup: Math.round(averageWordsPerGroup * 10) / 10,
            lastModified: this.homonyms.reduce((latest, h) => 
                h.lastModified > latest ? h.lastModified : latest, ''
            )
        };
    }

    /**
     * Duplicate the current collection
     * @param {string} newName - Name for the duplicated collection
     * @returns {Object} Export data for the duplicate
     */
    duplicateCollection(newName) {
        const exportData = {
            homonyms: this.getHomonyms(),
            collectionName: newName,
            exportDate: new Date().toISOString()
        };
        
        return exportData;
    }

    /**
     * Clear all homonyms
     */
    clearCollection() {
        this.homonyms = [];
        this.save();
    }

    /**
     * Save current state to storage
     */
    save() {
        this.storageService.saveHomonyms(this.homonyms);
    }

    /**
     * Generate pronunciation for a word
     * @param {string} word - Word to generate pronunciation for
     * @returns {string} Generated pronunciation
     */
    generatePronunciation(word) {
        if (!word) return '';
        return `/${word.toLowerCase()}/`;
    }

    /**
     * Populate default collection with curated homonyms
     */
    async populateDefaultCollection() {
        console.log('Populating Oshi\'s Homonym collection...');
        
        // Set the collection name to "Oshi's Homonyms"
        this.setCollectionName("Oshi's Homonyms");
        
        // Complete list of homonym groups from your original collection with your daughter
        const curatedHomonyms = [
            // Single letters
            ['b', 'be', 'bee'],
            ['c', 'sea', 'see'],
            ['i', 'eye'],
            ['o', 'oh'],
            ['p', 'pea', 'pee'],
            ['r', 'are'],
            ['t', 'tea', 'tee'],
            ['u', 'you'],
            ['y', 'why'],
            
            // A words
            ['ail', 'ale'],
            ['ate', 'eight'],
            
            // B words
            ['bail', 'bale'],
            ['bare', 'bear'],
            ['beat', 'beet'],
            ['been', 'bean'],
            ['berth', 'birth'],
            ['blew', 'blue'],
            ['board', 'bored'],
            ['brake', 'break'],
            ['bread', 'bred'],
            ['buy', 'by', 'bye'],
            
            // C words
            ['cell', 'sell'],
            ['cent', 'sent', 'scent'],
            ['cereal', 'serial'],
            ['cheap', 'cheep'],
            ['choose', 'chews'],
            ['cite', 'sight', 'site'],
            ['coarse', 'course'],
            ['creak', 'creek'],
            ['crews', 'cruise'],
            
            // D words
            ['dear', 'deer'],
            ['dew', 'do', 'due'],
            ['die', 'dye'],
            ['doe', 'dough'],
            
            // E words
            ['earn', 'urn'],
            
            // F words
            ['fair', 'fare'],
            ['feat', 'feet'],
            ['find', 'fined'],
            ['fir', 'fur'],
            ['flea', 'flee'],
            ['flew', 'flu', 'flue'],
            ['flour', 'flower'],
            ['for', 'four', 'fore'],
            ['foul', 'fowl'],
            
            // G words
            ['gait', 'gate'],
            ['gene', 'jean'],
            ['groan', 'grown'],
            ['guest', 'guessed'],
            
            // H words
            ['hair', 'hare'],
            ['hall', 'haul'],
            ['heal', 'heel'],
            ['hear', 'here'],
            ['heard', 'herd'],
            ['hi', 'high'],
            ['him', 'hymn'],
            ['hole', 'whole'],
            ['hour', 'our'],
            
            // I words
            ['idle', 'idol'],
            ['its', "it's"],
            
            // K words
            ['kale', 'kail'],
            ['knead', 'need'],
            ['knew', 'new'],
            ['knight', 'night'],
            ['knot', 'not'],
            ['know', 'no'],
            
            // L words
            ['lead', 'led'],
            ['leak', 'leek'],
            ['lean', 'lien'],
            
            // M words
            ['made', 'maid'],
            ['mail', 'male'],
            ['main', 'mane'],
            ['meat', 'meet'],
            ['might', 'mite'],
            ['miner', 'minor'],
            ['missed', 'mist'],
            ['moose', 'mousse'],
            
            // N words
            ['naval', 'navel'],
            ['none', 'nun'],
            
            // O words
            ['oar', 'or', 'ore'],
            ['one', 'won'],
            
            // P words
            ['pail', 'pale'],
            ['pain', 'pane'],
            ['pair', 'pear'],
            ['peace', 'piece'],
            ['peak', 'peek'],
            ['pi', 'pie'],
            ['plain', 'plane'],
            ['pole', 'poll'],
            ['poor', 'pour'],
            ['pray', 'prey'],
            ['principal', 'principle'],
            
            // R words
            ['rain', 'rein', 'reign'],
            ['raise', 'rays'],
            ['read', 'red', 'reed'],
            ['right', 'rite', 'write'],
            ['road', 'rode'],
            ['role', 'roll'],
            ['root', 'route'],
            
            // S words
            ['sail', 'sale'],
            ['scene', 'seen'],
            ['seam', 'seem'],
            ['sew', 'so', 'sow'],
            ['son', 'sun'],
            ['stair', 'stare'],
            ['stationary', 'stationery'],
            ['steal', 'steel'],
            ['suite', 'sweet'],
            
            // T words
            ['tail', 'tale'],
            ['team', 'teem'],
            ['tear', 'tier'],
            ['their', 'there', "they're"],
            ['threw', 'through'],
            ['throne', 'thrown'],
            ['tide', 'tied'],
            ['to', 'too', 'two'],
            ['toe', 'tow'],
            
            // W words
            ['wade', 'weighed'],
            ['waist', 'waste'],
            ['wait', 'weight'],
            ['waive', 'wave'],
            ['ware', 'wear', 'where'],
            ['way', 'weigh'],
            ['weak', 'week'],
            ['weather', 'whether'],
            ['which', 'witch'],
            ['wood', 'would']
        ];

        console.log(`Adding ${curatedHomonyms.length} homonym groups...`);
        
        // Add each group as a homonym
        for (let i = 0; i < curatedHomonyms.length; i++) {
            const words = curatedHomonyms[i];
            
            try {
                const wordsWithDefinitions = [];
                
                // Get definitions for all words in the group
                for (const word of words) {
                    const definition = await this.dictionaryService.getDefinition(word);
                    wordsWithDefinitions.push({ word, definition });
                }
                
                // Get pronunciation for the first word
                const pronunciation = await this.dictionaryService.getPronunciation(words[0]);
                
                // Create the homonym group
                this.addHomonymGroup(wordsWithDefinitions, pronunciation);
                
                // Log progress
                if ((i + 1) % 10 === 0 || i === curatedHomonyms.length - 1) {
                    console.log(`Progress: ${i + 1}/${curatedHomonyms.length} homonym groups added`);
                }
                
                // Small delay to avoid overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 150));
                
            } catch (error) {
                console.warn(`Failed to add homonym group for [${words.join(', ')}]:`, error);
            }
        }
        
        console.log(`Successfully populated Oshi's Homonyms with ${this.homonyms.length} groups`);
    }
}

// Make service available globally
window.HomonymService = HomonymService;
