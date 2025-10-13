/**
 * API Service
 * Handles all API communication with the Neon backend
 */

class ApiService {
    constructor() {
        // Use localhost for development, can be updated for production
        this.baseUrl = 'http://localhost:3000/api';
        this.currentCollectionId = null;
    }

    /**
     * Make a fetch request with error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: response.statusText }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }

            // Handle 204 No Content
            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed (${endpoint}):`, error.message);
            throw error;
        }
    }

    /**
     * Get all collections
     */
    async getCollections() {
        return await this.request('/collections');
    }

    /**
     * Get a specific collection
     */
    async getCollection(collectionId) {
        return await this.request(`/collections/${collectionId}`);
    }

    /**
     * Create a new collection
     */
    async createCollection(name) {
        return await this.request('/collections', {
            method: 'POST',
            body: JSON.stringify({ name })
        });
    }

    /**
     * Update collection name
     */
    async updateCollection(collectionId, name) {
        return await this.request(`/collections/${collectionId}`, {
            method: 'PUT',
            body: JSON.stringify({ name })
        });
    }

    /**
     * Delete a collection
     */
    async deleteCollection(collectionId) {
        return await this.request(`/collections/${collectionId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Get all homonym groups for a collection
     */
    async getHomonyms(collectionId) {
        return await this.request(`/collections/${collectionId}/homonyms`);
    }

    /**
     * Search homonyms in a collection
     */
    async searchHomonyms(collectionId, searchTerm) {
        return await this.request(`/collections/${collectionId}/homonyms/search?q=${encodeURIComponent(searchTerm)}`);
    }

    /**
     * Create a new homonym group
     */
    async createHomonymGroup(collectionId, pronunciation, words) {
        return await this.request(`/collections/${collectionId}/homonyms`, {
            method: 'POST',
            body: JSON.stringify({
                pronunciation,
                words
            })
        });
    }

    /**
     * Delete a homonym group
     */
    async deleteHomonymGroup(groupId) {
        return await this.request(`/homonyms/${groupId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Check API health
     */
    async checkHealth() {
        try {
            const health = await this.request('/health');
            return health.database === 'connected';
        } catch (error) {
            return false;
        }
    }

    /**
     * Set the current collection ID for operations
     */
    setCurrentCollection(collectionId) {
        this.currentCollectionId = collectionId;
        localStorage.setItem('currentCollectionId', collectionId);
    }

    /**
     * Get the current collection ID
     */
    getCurrentCollectionId() {
        if (this.currentCollectionId) {
            return this.currentCollectionId;
        }
        
        const stored = localStorage.getItem('currentCollectionId');
        if (stored) {
            this.currentCollectionId = parseInt(stored);
            return this.currentCollectionId;
        }
        
        return null;
    }
}

// Make service available globally
window.ApiService = ApiService;

