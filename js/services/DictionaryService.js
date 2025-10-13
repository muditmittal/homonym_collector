/**
 * Dictionary Service
 * Handles all external API calls for word definitions and pronunciations
 */

class DictionaryService {
    constructor() {
        this.baseUrl = AppConfig.api.dictionaryBaseUrl;
        this.timeout = AppConfig.api.timeout;
        this.cache = new Map(); // Simple in-memory cache
    }

    /**
     * Create an AbortController for request timeout
     * @returns {AbortController}
     */
    createTimeoutController() {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), this.timeout);
        return controller;
    }

    /**
     * Get word definition from API
     * @param {string} word - The word to look up
     * @returns {Promise<string>} The definition
     */
    async getDefinition(word) {
        const normalizedWord = word.toLowerCase().trim();
        
        // Check cache first
        const cacheKey = `def_${normalizedWord}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const controller = this.createTimeoutController();
            const response = await fetch(`${this.baseUrl}${normalizedWord}`, {
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const definition = this.extractDefinition(data);
            
            // Cache the result
            this.cache.set(cacheKey, definition);
            
            return definition;
        } catch (error) {
            console.warn(`Definition lookup failed for "${word}":`, error.message);
            return `Definition not available for "${word}"`;
        }
    }

    /**
     * Get word pronunciation from API
     * @param {string} word - The word to get pronunciation for
     * @returns {Promise<string>} The pronunciation
     */
    async getPronunciation(word) {
        const normalizedWord = word.toLowerCase().trim();
        
        // Check cache first
        const cacheKey = `pron_${normalizedWord}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const controller = this.createTimeoutController();
            const response = await fetch(`${this.baseUrl}${normalizedWord}`, {
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const pronunciation = this.extractPronunciation(data);
            
            // Cache the result
            this.cache.set(cacheKey, pronunciation);
            
            return pronunciation;
        } catch (error) {
            console.warn(`Pronunciation lookup failed for "${word}":`, error.message);
            return `/${word}/`; // Fallback pronunciation
        }
    }

    /**
     * Validate if a word exists in the dictionary
     * @param {string} word - The word to validate
     * @returns {Promise<boolean>} True if word exists
     */
    async validateWord(word) {
        const normalizedWord = word.toLowerCase().trim();
        
        try {
            const controller = this.createTimeoutController();
            const response = await fetch(`${this.baseUrl}${normalizedWord}`, {
                signal: controller.signal
            });

            return response.ok;
        } catch (error) {
            console.warn(`Word validation failed for "${word}":`, error.message);
            return false;
        }
    }

    /**
     * Extract definition from API response
     * @param {Object} data - API response data
     * @returns {string} Extracted definition
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

        // Format: (part of speech) definition
        return partOfSpeech ? `(${partOfSpeech}) ${def}` : def;
    }

    /**
     * Extract pronunciation from API response
     * @param {Object} data - API response data
     * @returns {string} Extracted pronunciation
     */
    extractPronunciation(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return '';
        }

        const entry = data[0];
        
        // Try to get phonetic from phonetics array
        if (entry.phonetics && Array.isArray(entry.phonetics)) {
            for (const phonetic of entry.phonetics) {
                if (phonetic.text) {
                    return phonetic.text;
                }
            }
        }

        // Fallback to phonetic field
        if (entry.phonetic) {
            return entry.phonetic;
        }

        return '';
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
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
