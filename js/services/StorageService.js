/**
 * Storage Service
 * Handles all local storage operations for the application
 */

class StorageService {
    constructor() {
        this.keys = AppConfig.storage;
    }

    /**
     * Save homonyms to localStorage
     * @param {Array} homonyms - Array of homonym objects
     */
    saveHomonyms(homonyms) {
        try {
            const data = {
                homonyms: homonyms,
                lastModified: new Date().toISOString(),
                version: '2.0'
            };
            localStorage.setItem(this.keys.homonymsKey, JSON.stringify(data));
            console.log(`Saved ${homonyms.length} homonyms to storage`);
        } catch (error) {
            console.error('Failed to save homonyms:', error);
            throw new Error('Failed to save data to local storage');
        }
    }

    /**
     * Load homonyms from localStorage
     * @returns {Array} Array of homonym objects
     */
    loadHomonyms() {
        try {
            const stored = localStorage.getItem(this.keys.homonymsKey);
            if (!stored) {
                console.log('No homonyms found in storage, loading defaults');
                return this.getDefaultHomonyms();
            }

            const data = JSON.parse(stored);
            
            // Handle legacy format (direct array)
            if (Array.isArray(data)) {
                console.log('Converting legacy storage format');
                return data;
            }

            // Handle new format (object with metadata)
            if (data.homonyms && Array.isArray(data.homonyms)) {
                console.log(`Loaded ${data.homonyms.length} homonyms from storage`);
                return data.homonyms;
            }

            console.warn('Invalid storage format, loading defaults');
            return this.getDefaultHomonyms();
        } catch (error) {
            console.error('Failed to load homonyms:', error);
            return this.getDefaultHomonyms();
        }
    }

    /**
     * Save collection name to localStorage
     * @param {string} name - Collection name
     */
    saveCollectionName(name) {
        try {
            localStorage.setItem(this.keys.collectionNameKey, name);
        } catch (error) {
            console.error('Failed to save collection name:', error);
        }
    }

    /**
     * Load collection name from localStorage
     * @returns {string} Collection name
     */
    loadCollectionName() {
        try {
            return localStorage.getItem(this.keys.collectionNameKey) || AppConfig.defaults.collectionName;
        } catch (error) {
            console.error('Failed to load collection name:', error);
            return AppConfig.defaults.collectionName;
        }
    }

    /**
     * Save application settings
     * @param {Object} settings - Settings object
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.keys.settingsKey, JSON.stringify(settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    /**
     * Load application settings
     * @returns {Object} Settings object
     */
    loadSettings() {
        try {
            const stored = localStorage.getItem(this.keys.settingsKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Failed to load settings:', error);
            return {};
        }
    }

    /**
     * Clear all application data
     */
    clearAll() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('Cleared all application data');
        } catch (error) {
            console.error('Failed to clear storage:', error);
        }
    }

    /**
     * Export all data as JSON
     * @returns {Object} Exported data
     */
    exportData() {
        return {
            homonyms: this.loadHomonyms(),
            collectionName: this.loadCollectionName(),
            settings: this.loadSettings(),
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
    }

    /**
     * Import data from JSON
     * @param {Object} data - Data to import
     */
    importData(data) {
        try {
            if (data.homonyms) {
                this.saveHomonyms(data.homonyms);
            }
            if (data.collectionName) {
                this.saveCollectionName(data.collectionName);
            }
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            console.log('Successfully imported data');
        } catch (error) {
            console.error('Failed to import data:', error);
            throw new Error('Failed to import data');
        }
    }

    /**
     * Get storage usage information
     * @returns {Object} Storage info
     */
    getStorageInfo() {
        const info = {
            available: true,
            used: 0,
            keys: []
        };

        try {
            Object.values(this.keys).forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    info.used += item.length;
                    info.keys.push(key);
                }
            });
        } catch (error) {
            info.available = false;
            console.error('Storage not available:', error);
        }

        return info;
    }

    /**
     * Get default homonyms collection
     * @returns {Array} Default homonyms
     */
    getDefaultHomonyms() {
        // Return empty array - homonyms will be added by user or populated by service
        return [];
    }

    /**
     * Force reset to populate Oshi's collection
     * This method clears existing data and forces re-population
     */
    forceResetForOshiCollection() {
        try {
            // Clear all existing data
            this.clearAll();
            console.log('Cleared all data to restore Oshi\'s Homonyms');
            return true;
        } catch (error) {
            console.error('Failed to reset for Oshi collection:', error);
            return false;
        }
    }
}

// Make service available globally
window.StorageService = StorageService;
