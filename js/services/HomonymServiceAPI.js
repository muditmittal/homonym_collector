/**
 * Homonym Service (API Version)
 * Handles business logic for homonym operations using the Neon backend
 */

class HomonymService {
    constructor(dictionaryService, apiService) {
        this.dictionaryService = dictionaryService;
        this.apiService = apiService;
        this.homonyms = [];
        this.collectionName = '';
        this.collectionId = null;
        
        this.init();
    }

    /**
     * Initialize the service
     */
    async init() {
        try {
            // Check if API is available
            const isHealthy = await this.apiService.checkHealth();
            if (!isHealthy) {
                console.warn('API not available, falling back to localStorage');
                this.useFallback = true;
                return;
            }

            // Get or create collection
            await this.loadCollection();
            
            // Load homonyms from API
            await this.loadHomonyms();
            
        } catch (error) {
            console.error('Failed to initialize HomonymService:', error);
            this.useFallback = true;
        }
    }

    /**
     * Load or create the collection
     */
    async loadCollection() {
        // Check if we have a stored collection ID
        const storedId = this.apiService.getCurrentCollectionId();
        
        if (storedId) {
            try {
                const collection = await this.apiService.getCollection(storedId);
                this.collectionId = collection.id;
                this.collectionName = collection.name;
                return;
            } catch (error) {
                console.warn('Stored collection not found, creating new one');
            }
        }

        // Get all collections
        const collections = await this.apiService.getCollections();
        
        if (collections.length > 0) {
            // Use the first collection (Oshi's Homonyms)
            this.collectionId = collections[0].id;
            this.collectionName = collections[0].name;
            this.apiService.setCurrentCollection(this.collectionId);
        } else {
            // Create a new collection
            const newCollection = await this.apiService.createCollection("Oshi's Homonyms");
            this.collectionId = newCollection.id;
            this.collectionName = newCollection.name;
            this.apiService.setCurrentCollection(this.collectionId);
            
            // Populate with default homonyms
            await this.populateDefaultCollection();
        }
    }

    /**
     * Load homonyms from API
     */
    async loadHomonyms() {
        if (!this.collectionId) {
            console.warn('No collection ID set');
            return;
        }

        try {
            const homonyms = await this.apiService.getHomonyms(this.collectionId);
            this.homonyms = homonyms;
            console.log(`Loaded ${homonyms.length} homonyms from API`);
        } catch (error) {
            console.error('Failed to load homonyms:', error);
            this.homonyms = [];
        }
    }

    /**
     * Get all homonyms
     */
    getHomonyms() {
        return [...this.homonyms];
    }

    /**
     * Get homonym by ID
     */
    getHomonymById(id) {
        return this.homonyms.find(h => h.id === id) || null;
    }

    /**
     * Add a new homonym group
     */
    async addHomonymGroup(words, pronunciation) {
        if (!this.collectionId) {
            throw new Error('No collection selected');
        }

        try {
            const result = await this.apiService.createHomonymGroup(
                this.collectionId,
                pronunciation,
                words.map(w => ({
                    word: w.word.toLowerCase().trim(),
                    definition: w.definition
                }))
            );

            // Reload homonyms to get the updated list
            await this.loadHomonyms();
            
            return result;
        } catch (error) {
            console.error('Failed to add homonym group:', error);
            throw error;
        }
    }

    /**
     * Delete a homonym group
     */
    async deleteHomonymGroup(id) {
        try {
            await this.apiService.deleteHomonymGroup(id);
            
            // Remove from local cache
            const index = this.homonyms.findIndex(h => h.id === id);
            if (index !== -1) {
                this.homonyms.splice(index, 1);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to delete homonym group:', error);
            return false;
        }
    }

    /**
     * Search homonyms by word
     */
    async searchHomonyms(searchTerm) {
        if (!searchTerm || !searchTerm.trim()) {
            return this.getHomonyms();
        }

        if (!this.collectionId) {
            return [];
        }

        try {
            const results = await this.apiService.searchHomonyms(this.collectionId, searchTerm);
            return results;
        } catch (error) {
            console.error('Search failed:', error);
            // Fallback to local search
            const term = searchTerm.toLowerCase().trim();
            return this.homonyms.filter(homonym => 
                homonym.words.some(word => 
                    word.word.toLowerCase().includes(term) ||
                    word.definition.toLowerCase().includes(term)
                )
            );
        }
    }

    /**
     * Find homonym suggestions for a word
     */
    async findHomonymSuggestions(word) {
        const normalizedWord = word.toLowerCase().trim();
        
        // Validate word
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

        // Get word definition and pronunciation
        const [definition, pronunciation] = await Promise.all([
            this.dictionaryService.getDefinition(normalizedWord),
            this.dictionaryService.getPronunciation(normalizedWord)
        ]);
        
        // Get homophones from database
        const homophones = HomonymDatabase.getHomophones(normalizedWord);
        const suggestions = [];

        // Add original word first
        suggestions.push({
            word: normalizedWord,
            definition,
            pronunciation,
            isOriginal: true
        });

        // Add homophone suggestions
        if (homophones && homophones.length > 0) {
            for (const homophone of homophones) {
                const def = await this.dictionaryService.getDefinition(homophone);
                suggestions.push({
                    word: homophone,
                    definition: def,
                    pronunciation,
                    isOriginal: false
                });
            }
        }

        // Sort alphabetically
        suggestions.sort((a, b) => a.word.localeCompare(b.word));

        return suggestions;
    }

    /**
     * Get collection name
     */
    getCollectionName() {
        return this.collectionName;
    }

    /**
     * Set collection name
     */
    async setCollectionName(name) {
        if (!this.collectionId) {
            throw new Error('No collection selected');
        }

        try {
            await this.apiService.updateCollection(this.collectionId, name);
            this.collectionName = name;
        } catch (error) {
            console.error('Failed to update collection name:', error);
            throw error;
        }
    }

    /**
     * Get collection statistics
     */
    getCollectionStats() {
        const totalHomonyms = this.homonyms.length;
        const totalWords = this.homonyms.reduce((sum, h) => sum + h.words.length, 0);
        
        return {
            totalHomonyms,
            totalWords,
            collectionName: this.collectionName
        };
    }

    /**
     * Populate default collection with curated homonyms
     */
    async populateDefaultCollection() {
        console.log('Populating default collection...');
        
        const curatedHomonyms = [
            ['ail', 'ale'],
            ['ate', 'eight'],
            ['bail', 'bale'],
            ['bare', 'bear'],
            ['be', 'bee'],
            ['beat', 'beet'],
            ['blew', 'blue'],
            ['brake', 'break'],
            ['buy', 'by', 'bye'],
            ['cell', 'sell'],
            ['cent', 'scent', 'sent'],
            ['cereal', 'serial'],
            ['cheap', 'cheep'],
            ['choose', 'chews'],
            ['cite', 'sight', 'site'],
            ['coarse', 'course'],
            ['creak', 'creek'],
            ['dear', 'deer'],
            ['dew', 'do', 'due'],
            ['die', 'dye'],
            ['fair', 'fare'],
            ['feat', 'feet'],
            ['find', 'fined'],
            ['fir', 'fur'],
            ['flea', 'flee'],
            ['flour', 'flower'],
            ['for', 'four'],
            ['gait', 'gate'],
            ['groan', 'grown'],
            ['hair', 'hare'],
            ['heal', 'heel'],
            ['hear', 'here'],
            ['hour', 'our'],
            ['know', 'no'],
            ['knight', 'night'],
            ['knot', 'not'],
            ['mail', 'male'],
            ['main', 'mane'],
            ['meat', 'meet'],
            ['one', 'won'],
            ['pail', 'pale'],
            ['pain', 'pane'],
            ['pair', 'pear'],
            ['peace', 'piece'],
            ['plain', 'plane'],
            ['rain', 'reign', 'rein'],
            ['read', 'red'],
            ['right', 'write'],
            ['road', 'rode'],
            ['role', 'roll'],
            ['sail', 'sale'],
            ['sea', 'see'],
            ['seam', 'seem'],
            ['sew', 'so', 'sow'],
            ['some', 'sum'],
            ['son', 'sun'],
            ['stair', 'stare'],
            ['stake', 'steak'],
            ['stationary', 'stationery'],
            ['steal', 'steel'],
            ['tail', 'tale'],
            ['tea', 'tee'],
            ['their', 'there', 'they\'re'],
            ['threw', 'through'],
            ['throne', 'thrown'],
            ['to', 'too', 'two'],
            ['toad', 'towed'],
            ['toe', 'tow'],
            ['waist', 'waste'],
            ['wait', 'weight'],
            ['ware', 'wear', 'where'],
            ['way', 'weigh'],
            ['weak', 'week'],
            ['weather', 'whether'],
            ['which', 'witch'],
            ['wood', 'would'],
            ['you', 'ewe'],
            ['your', 'you\'re']
        ];

        let added = 0;
        for (const words of curatedHomonyms) {
            try {
                const wordsWithDefinitions = [];
                let pronunciation = '';

                for (const word of words) {
                    const definition = await this.dictionaryService.getDefinition(word);
                    wordsWithDefinitions.push({ word, definition });
                }

                pronunciation = await this.dictionaryService.getPronunciation(words[0]);

                await this.addHomonymGroup(wordsWithDefinitions, pronunciation);
                added++;

                // Add small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.warn(`Failed to add homonym group for [${words.join(', ')}]:`, error);
            }
        }

        console.log(`Added ${added} homonym groups to collection`);
    }
}

// Make service available globally
window.HomonymService = HomonymService;

