/**
 * Dictionary Service
 * Fetches word definitions and pronunciations from Merriam-Webster School Dictionary API
 * Uses caching to improve performance and reduce API calls
 */

class DictionaryService {
    constructor() {
        this.baseUrl = AppConfig.api.dictionaryBaseUrl;
        this.apiKey = AppConfig.api.dictionaryApiKey;
        this.timeout = AppConfig.api.timeout;
        this.cache = new Map(); // Runtime cache for API responses
        this.apiCallsInFlight = new Map(); // Prevents duplicate concurrent requests
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
     * Extract the first definition from Merriam-Webster API response
     * Format: (partOfSpeech) definition
     */
    extractDefinition(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return null;
        }

        // Check if response is valid (not a "did you mean" suggestion array)
        const firstEntry = data[0];
        if (typeof firstEntry === 'string') {
            // This means the API returned suggestions, not definitions
            return null;
        }

        // Extract part of speech and definition
        const partOfSpeech = firstEntry.fl || 'word';
        const definition = firstEntry.shortdef?.[0]; // First short definition

        if (!definition) {
            return null;
        }

        // Capitalize first letter of definition
        const capitalizedDef = definition.charAt(0).toUpperCase() + definition.slice(1);
        return `(${partOfSpeech}) ${capitalizedDef}`;
    }

    /**
     * Get word definition from Merriam-Webster API
     * Uses caching to reduce API calls
     */
    async getDefinition(word) {
        const normalizedWord = word.toLowerCase().trim();
        const cacheKey = `def_${normalizedWord}`;
        
        // Check runtime cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Check if request is already in flight (prevents duplicate calls)
        if (this.apiCallsInFlight.has(cacheKey)) {
            return await this.apiCallsInFlight.get(cacheKey);
        }

        // Make API call
        const apiPromise = this._fetchDefinitionFromAPI(normalizedWord);
        this.apiCallsInFlight.set(cacheKey, apiPromise);

        try {
            const definition = await apiPromise;
            this.cache.set(cacheKey, definition);
            return definition;
        } finally {
            this.apiCallsInFlight.delete(cacheKey);
        }
    }

    /**
     * Internal: Fetch definition from Merriam-Webster API
     */
    async _fetchDefinitionFromAPI(word) {
        try {
            const controller = this.createTimeoutController();
            const url = `${this.baseUrl}${encodeURIComponent(word)}?key=${this.apiKey}`;
            
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Word "${word}" not found in dictionary`);
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const definition = this.extractDefinition(data);

            if (!definition) {
                // Check if we got suggestions instead
                if (Array.isArray(data) && typeof data[0] === 'string') {
                    throw new Error(`Word "${word}" not found. Did you mean: ${data.slice(0, 3).join(', ')}?`);
                }
                throw new Error(`No definition found for "${word}"`);
            }

            return definition;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(`Dictionary API timeout for "${word}"`);
            }
            throw error;
        }
    }

    /**
     * Extract pronunciation from Merriam-Webster API response
     */
    extractPronunciation(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return null;
        }

        // Check if response is valid
        const firstEntry = data[0];
        if (typeof firstEntry === 'string') {
            return null;
        }

        // Try to get pronunciation from various possible locations
        const pronunciation = firstEntry.hwi?.prs?.[0]?.mw || // Merriam-Webster pronunciation
                            firstEntry.hwi?.prs?.[0]?.ipa || // IPA pronunciation
                            null;

        return pronunciation;
    }

    /**
     * Get word pronunciation from Merriam-Webster API
     * Uses caching to reduce API calls
     */
    async getPronunciation(word) {
        const normalizedWord = word.toLowerCase().trim();
        const cacheKey = `pron_${normalizedWord}`;
        
        // Check runtime cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Check if request is already in flight
        if (this.apiCallsInFlight.has(cacheKey)) {
            return await this.apiCallsInFlight.get(cacheKey);
        }

        // Make API call
        const apiPromise = this._fetchPronunciationFromAPI(normalizedWord);
        this.apiCallsInFlight.set(cacheKey, apiPromise);

        try {
            const pronunciation = await apiPromise;
            this.cache.set(cacheKey, pronunciation);
            return pronunciation;
        } finally {
            this.apiCallsInFlight.delete(cacheKey);
        }
    }

    /**
     * Internal: Fetch pronunciation from Merriam-Webster API
     */
    async _fetchPronunciationFromAPI(word) {
        try {
            const controller = this.createTimeoutController();
            const url = `${this.baseUrl}${encodeURIComponent(word)}?key=${this.apiKey}`;
            
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                // Fallback to simple phonetic if API fails
                return `/${word}/`;
            }

            const data = await response.json();
            const pronunciation = this.extractPronunciation(data);

            // Return formatted pronunciation or fallback
            if (pronunciation) {
                return `/${pronunciation}/`;
            }
            return `/${word}/`;
        } catch (error) {
            console.warn(`Pronunciation lookup failed for "${word}":`, error.message);
            // Fallback to simple phonetic
            return `/${word}/`;
        }
    }

    /**
     * Validate if a word exists in the dictionary
     */
    async validateWord(word) {
        try {
            await this.getDefinition(word);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Clear the runtime cache (useful for testing or memory management)
     */
    clearCache() {
        this.cache.clear();
        this.apiCallsInFlight.clear();
        console.log('Dictionary cache cleared');
    }
}

window.DictionaryService = DictionaryService;
