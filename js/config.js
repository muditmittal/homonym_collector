/**
 * Application Configuration
 * Centralized configuration for the Homonym Collector app
 */

const AppConfig = {
    // API Configuration
    api: {
        dictionaryBaseUrl: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
        timeout: 8000,
        retryAttempts: 3,
        retryDelay: 1000
    },

    // Storage Configuration
    storage: {
        homonymsKey: 'homonym-collector-homonyms',
        collectionNameKey: 'homonym-collector-collection-name',
        settingsKey: 'homonym-collector-settings'
    },

    // UI Configuration
    ui: {
        loadingDelay: 500, // Minimum loading time for UX
        animationDuration: 300,
        toastDuration: 3000,
        maxSuggestions: 10
    },

    // Default Values
    defaults: {
        collectionName: 'My Homonyms',
        maxHomonymsPerGroup: 10
    },

    // Feature Flags
    features: {
        enableOfflineMode: false,
        enableAnalytics: false,
        enableExport: true,
        enableImport: true
    }
};

// Make config available globally
window.AppConfig = AppConfig;
