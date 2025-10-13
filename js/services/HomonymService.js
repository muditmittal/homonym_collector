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
        console.log('Populating default homonym collection...');
        
        // Curated list of common homophone pairs
        const curatedPairs = [
            ['peace', 'piece'],
            ['there', 'their', "they're"],
            ['to', 'too', 'two'],
            ['your', 'you\'re'],
            ['its', 'it\'s'],
            ['hear', 'here'],
            ['right', 'write', 'rite'],
            ['break', 'brake'],
            ['buy', 'by', 'bye'],
            ['cell', 'sell'],
            ['dear', 'deer'],
            ['fair', 'fare'],
            ['flour', 'flower'],
            ['hair', 'hare'],
            ['hole', 'whole'],
            ['know', 'no'],
            ['mail', 'male'],
            ['meat', 'meet'],
            ['new', 'knew'],
            ['one', 'won'],
            ['pair', 'pear'],
            ['rain', 'rein', 'reign'],
            ['read', 'red'],
            ['sea', 'see'],
            ['son', 'sun'],
            ['tail', 'tale'],
            ['wait', 'weight'],
            ['weak', 'week'],
            ['wear', 'where'],
            ['weather', 'whether']
        ];

        // Add each pair as a homonym group
        for (const words of curatedPairs) {
            try {
                const wordsWithDefinitions = [];
                
                for (const word of words) {
                    const definition = await this.dictionaryService.getDefinition(word);
                    wordsWithDefinitions.push({ word, definition });
                }
                
                const pronunciation = await this.dictionaryService.getPronunciation(words[0]);
                this.addHomonymGroup(wordsWithDefinitions, pronunciation);
                
                // Small delay to avoid overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.warn(`Failed to add homonym group for [${words.join(', ')}]:`, error);
            }
        }
        
        console.log(`Populated ${this.homonyms.length} homonym groups`);
    }
}

// Make service available globally
window.HomonymService = HomonymService;
