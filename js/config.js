/**
 * Application Configuration
 * Centralized configuration for the Homonym Collector app
 */

const AppConfig = {
    // API Configuration
    api: {
        // Merriam-Webster School Dictionary API
        dictionaryApiKey: '5b652fad-e28b-42ce-9129-d1fc7716d900',
        dictionaryBaseUrl: 'https://www.dictionaryapi.com/api/v3/references/sd4/json/',
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
