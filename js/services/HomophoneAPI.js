/**
 * Homophone API Service
 * Uses external APIs to find homophones dynamically
 */

class HomophoneAPI {
    constructor() {
        this.datamuse = 'https://api.datamuse.com/words';
        this.rhymezone = 'https://api.rhymezone.com/words';
        this.cache = new Map(); // Cache results to avoid repeat calls
        this.timeout = 5000; // 5 second timeout
    }

    /**
     * Find homophones using Datamuse API
     * @param {string} word - Word to find homophones for
     * @returns {Promise<string[]>} Array of homophone words
     */
    async findHomophonesDatamuse(word) {
        const cacheKey = `datamuse_${word.toLowerCase()}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            // Try exact homophones first
            let response = await fetch(`${this.datamuse}?rel_hom=${encodeURIComponent(word)}&max=10`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            let data = await response.json();

            // If no exact homophones, try "sounds like"
            if (!data || data.length === 0) {
                const controller2 = new AbortController();
                const timeoutId2 = setTimeout(() => controller2.abort(), this.timeout);

                response = await fetch(`${this.datamuse}?sl=${encodeURIComponent(word)}&max=10`, {
                    signal: controller2.signal
                });
                
                clearTimeout(timeoutId2);
                data = await response.json();
            }

            // Extract just the words, filter out the original word
            const homophones = data
                .map(item => item.word.toLowerCase())
                .filter(homophone => homophone !== word.toLowerCase())
                .slice(0, 8); // Limit to 8 results

            this.cache.set(cacheKey, homophones);
            return homophones;

        } catch (error) {
            console.warn('Datamuse API error:', error.message);
            return [];
        }
    }

    /**
     * Find homophones using RhymeZone API (fallback)
     * @param {string} word - Word to find homophones for
     * @returns {Promise<string[]>} Array of homophone words
     */
    async findHomophonesRhymeZone(word) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(`${this.rhymezone}?rel_hom=${encodeURIComponent(word)}&max=10`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const data = await response.json();

            return data
                .map(item => item.word.toLowerCase())
                .filter(homophone => homophone !== word.toLowerCase())
                .slice(0, 8);

        } catch (error) {
            console.warn('RhymeZone API error:', error.message);
            return [];
        }
    }

    /**
     * Find homophones with fallback strategy
     * @param {string} word - Word to find homophones for
     * @returns {Promise<string[]>} Array of homophone words
     */
    async findHomophones(word) {
        // Try Datamuse first (more reliable)
        let homophones = await this.findHomophonesDatamuse(word);
        
        // If Datamuse fails or returns nothing, try local database
        if (homophones.length === 0 && window.HomonymDatabase) {
            homophones = window.HomonymDatabase.getHomophones(word);
        }
        
        // If still nothing, try RhymeZone as last resort
        if (homophones.length === 0) {
            homophones = await this.findHomophonesRhymeZone(word);
        }

        return homophones;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
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
window.HomophoneAPI = HomophoneAPI;

