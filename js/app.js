/**
 * Homonym Collector Application
 * Refactored modular architecture with separation of concerns
 */

class HomonymApp {
    constructor() {
        this.initializeServices();
        this.initializeEventListeners();
        this.loadInitialData();
    }

    /**
     * Initialize all services
     */
    initializeServices() {
        this.dictionaryService = new DictionaryService();
        this.storageService = new StorageService();
        this.homonymService = new HomonymService(this.dictionaryService, this.storageService);
        this.uiManager = new UIManager();
        
        console.log('Services initialized successfully');
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Search functionality
        this.uiManager.elements.searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        this.uiManager.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddHomonym();
            }
        });

        // Add button
        this.uiManager.elements.addButton.addEventListener('click', () => {
            this.handleAddHomonym();
        });

        // Find homonyms button (fallback)
        this.uiManager.elements.findHomonymsBtn.addEventListener('click', () => {
            this.handleAddHomonym();
        });

        // Collection management
        this.uiManager.elements.newCollection.addEventListener('click', () => {
            this.createNewCollection();
        });

        this.uiManager.elements.collectionMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.uiManager.toggleCollectionMenu();
        });

        // Loading modal
        this.uiManager.elements.closeLoading.addEventListener('click', () => {
            this.uiManager.hideLoading();
        });

        console.log('Event listeners initialized');
    }

    /**
     * Load initial data and render UI
     */
    async loadInitialData() {
        try {
            // Update UI with current data
            this.updateUI();
            
            // Refresh definitions in background if needed
            const updated = await this.homonymService.refreshAllDefinitions();
            if (updated) {
                console.log('Definitions updated, re-rendering');
                this.updateUI();
            }
            
            console.log('Initial data loaded successfully');
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.uiManager.showError('Failed to load application data');
        }
    }

    /**
     * Handle search input changes
     * @param {string} searchTerm - Search term
     */
    handleSearchInput(searchTerm) {
        this.uiManager.hideSuggestions();
        this.uiManager.hideNoResults();

        if (!searchTerm.trim()) {
            this.showAllHomonyms();
            return;
        }

        this.filterHomonyms(searchTerm);
    }

    /**
     * Handle add homonym action
     */
    async handleAddHomonym() {
        const searchTerm = this.uiManager.getSearchValue();
        
        if (!searchTerm) {
            this.uiManager.showError('Please enter a word to find homonyms.');
            return;
        }

        await this.findHomonyms(searchTerm);
    }

    /**
     * Find homonyms for a word
     * @param {string} word - Word to find homonyms for
     */
    async findHomonyms(word) {
        try {
            this.uiManager.showLoading();
            
            const suggestions = await this.homonymService.findHomonymSuggestions(word);
            this.uiManager.renderSuggestions(word, suggestions);
            
            // Fetch pronunciations in background
            this.fetchPronunciationsInBackground(suggestions);
            
        } catch (error) {
            console.error('Error finding homonyms:', error);
            this.uiManager.showError('Failed to find homonyms. Please try again.');
        } finally {
            this.uiManager.hideLoading();
        }
    }

    /**
     * Fetch pronunciations for suggestions in background
     * @param {Array} suggestions - Array of suggestions
     */
    async fetchPronunciationsInBackground(suggestions) {
        for (const suggestion of suggestions) {
            if (!suggestion.isError && suggestion.word) {
                try {
                    await this.dictionaryService.getPronunciation(suggestion.word);
                } catch (error) {
                    console.warn(`Failed to fetch pronunciation for ${suggestion.word}`);
                }
            }
        }
    }

    /**
     * Filter homonyms by search term
     * @param {string} searchTerm - Search term
     */
    filterHomonyms(searchTerm) {
        const filteredHomonyms = this.homonymService.searchHomonyms(searchTerm);
        
        if (filteredHomonyms.length === 0) {
            this.uiManager.showNoResults(searchTerm);
            this.uiManager.updateCollectionCount(0, true);
        } else {
            this.uiManager.renderHomonyms(filteredHomonyms);
            this.uiManager.updateCollectionCount(filteredHomonyms.length, true);
        }
    }

    /**
     * Show all homonyms (reset filter)
     */
    showAllHomonyms() {
        const allHomonyms = this.homonymService.getHomonyms();
        this.uiManager.renderHomonyms(allHomonyms);
        this.uiManager.updateCollectionCount(allHomonyms.length, false);
    }

    /**
     * Update the entire UI
     */
    updateUI() {
        const homonyms = this.homonymService.getHomonyms();
        const collectionName = this.homonymService.getCollectionName();
        
        this.uiManager.renderHomonyms(homonyms);
        this.uiManager.updateCollectionName(collectionName);
        this.uiManager.updateCollectionCount(homonyms.length, false);
    }

    /**
     * Delete a homonym group
     * @param {number} id - Homonym ID
     */
    deleteHomonymGroup(id) {
        if (!confirm('Are you sure you want to delete this homonym?')) {
            return;
        }

        const success = this.homonymService.deleteHomonymGroup(id);
        
        if (success) {
            this.updateUI();
            this.uiManager.showSuccess('Homonym deleted successfully');
        } else {
            this.uiManager.showError('Failed to delete homonym');
        }
    }

    /**
     * Save homonym group from suggestions
     * @param {string} originalWord - Original searched word
     * @param {Array} suggestions - Suggestions array
     */
    async saveHomonymGroup(originalWord, suggestions) {
        try {
            this.uiManager.showLoading();
            
            // Get selected words
            const checkboxes = document.querySelectorAll('.suggestion-checkbox:checked:not([disabled])');
            const selectedWords = [];
            
            checkboxes.forEach(checkbox => {
                const word = checkbox.getAttribute('data-word');
                if (word) {
                    // Find the word's definition from the UI
                    const wordItem = checkbox.closest('.suggestion-word-item');
                    const definition = wordItem.querySelector('.word-definition').textContent;
                    selectedWords.push({ word, definition });
                }
            });

            if (selectedWords.length < 2) {
                this.uiManager.showError('Please select at least two words to create a homonym.');
                return;
            }

            // Get pronunciation for the first word
            const pronunciation = await this.dictionaryService.getPronunciation(selectedWords[0].word);
            
            // Create homonym group
            const homonymGroup = this.homonymService.addHomonymGroup(selectedWords, pronunciation);
            
            // Update UI
            this.updateUI();
            this.uiManager.clearSearch();
            this.uiManager.hideSuggestions();
            this.showAllHomonyms();
            
            this.uiManager.showSuccess(`Successfully added homonym with ${selectedWords.length} words!`);
            
        } catch (error) {
            console.error('Error saving homonym group:', error);
            this.uiManager.showError('Failed to save homonym. Please try again.');
        } finally {
            this.uiManager.hideLoading();
        }
    }

    /**
     * Add a new word row for manual entry
     */
    addWordRow() {
        const wordsContainer = document.querySelector('.words-container');
        const manualActions = wordsContainer.querySelector('.manual-actions');
        
        // Check if there's already an editable row
        if (wordsContainer.querySelector('.editable-word-row')) {
            return;
        }
        
        const editableRow = document.createElement('div');
        editableRow.className = 'word-item suggestion-word-item editable-word-row';
        editableRow.innerHTML = `
            <input type="checkbox" checked class="suggestion-checkbox">
            <div class="word-info">
                <input type="text" class="word-input" placeholder="Type a word..." />
                <p class="word-definition">Type a word to see its definition</p>
            </div>
            <button class="btn-lookup" onclick="app.lookupWord(this)">
                <i class="fas fa-search"></i>
            </button>
        `;
        
        wordsContainer.insertBefore(editableRow, manualActions);
        
        const input = editableRow.querySelector('.word-input');
        input.focus();
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.lookupWord(editableRow.querySelector('.btn-lookup'));
            }
        });
    }

    /**
     * Lookup a manually entered word
     * @param {Element} buttonElement - Lookup button element
     */
    async lookupWord(buttonElement) {
        const row = buttonElement.closest('.editable-word-row');
        const input = row.querySelector('.word-input');
        const definitionP = row.querySelector('.word-definition');
        const checkbox = row.querySelector('.suggestion-checkbox');
        const word = input.value.trim().toLowerCase();
        
        if (!word) {
            definitionP.textContent = 'Please enter a word';
            definitionP.style.color = '#dc3545';
            return;
        }
        
        // Show loading state
        definitionP.textContent = 'Looking up definition...';
        definitionP.style.color = '#6c757d';
        buttonElement.disabled = true;
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        try {
            const isValid = await this.dictionaryService.validateWord(word);
            
            if (isValid) {
                const definition = await this.dictionaryService.getDefinition(word);
                
                // Word found - update UI
                input.value = word;
                input.disabled = true;
                definitionP.textContent = definition;
                definitionP.style.color = '#666';
                checkbox.setAttribute('data-word', word);
                
                // Change button to success state
                buttonElement.innerHTML = '<i class="fas fa-check"></i>';
                buttonElement.style.background = '#28a745';
                
                // Update classes
                row.classList.remove('editable-word-row');
                row.classList.add('added-word-row');
            } else {
                // Word not found
                definitionP.textContent = 'Word not found in dictionary. Check spelling.';
                definitionP.style.color = '#dc3545';
                checkbox.checked = false;
                checkbox.disabled = true;
                
                // Reset button
                buttonElement.innerHTML = '<i class="fas fa-search"></i>';
                buttonElement.disabled = false;
            }
        } catch (error) {
            console.error('Error looking up word:', error);
            definitionP.textContent = 'Error looking up word. Please try again.';
            definitionP.style.color = '#dc3545';
            
            // Reset button
            buttonElement.innerHTML = '<i class="fas fa-search"></i>';
            buttonElement.disabled = false;
        }
    }

    /**
     * Close suggestions
     */
    closeSuggestions() {
        this.uiManager.hideSuggestions();
        this.uiManager.clearSearch();
        this.showAllHomonyms();
    }

    /**
     * Create a new collection
     */
    createNewCollection() {
        const name = prompt('Enter name for the new collection:', 'New Collection');
        if (name && name.trim()) {
            this.homonymService.clearCollection();
            this.homonymService.setCollectionName(name.trim());
            this.updateUI();
            this.uiManager.showSuccess(`Created new collection: ${name}`);
        }
    }

    /**
     * Rename the current collection
     */
    renameCollection() {
        const currentName = this.homonymService.getCollectionName();
        const newName = prompt('Enter new collection name:', currentName);
        
        if (newName && newName.trim() && newName !== currentName) {
            this.homonymService.setCollectionName(newName.trim());
            this.uiManager.updateCollectionName(newName.trim());
            this.uiManager.showSuccess(`Collection renamed to: ${newName}`);
        }
    }

    /**
     * Duplicate the current collection
     */
    duplicateCollection() {
        const currentName = this.homonymService.getCollectionName();
        const newName = prompt('Enter name for the duplicated collection:', `${currentName} (Copy)`);
        
        if (newName && newName.trim()) {
            const exportData = this.homonymService.duplicateCollection(newName.trim());
            
            // Create download link
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${newName.trim()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.uiManager.showSuccess(`Collection duplicated and downloaded: ${newName}`);
        }
    }

    /**
     * Delete the current collection
     */
    deleteCollection() {
        const currentName = this.homonymService.getCollectionName();
        const confirmText = `Are you sure you want to delete "${currentName}"? This cannot be undone.`;
        
        if (confirm(confirmText)) {
            this.homonymService.clearCollection();
            this.updateUI();
            this.uiManager.showSuccess('Collection deleted');
        }
    }

    /**
     * Restore Oshi's Homonyms collection
     * This method forces a reset and populates the original collection
     */
    async restoreOshiCollection() {
        const confirmText = "This will restore Oshi's original homonym collection (78+ groups) and replace any existing data. Continue?";
        
        if (!confirm(confirmText)) {
            return;
        }

        try {
            this.uiManager.showLoading();
            this.uiManager.showSuccess('Restoring Oshi\'s Homonyms... This may take a few minutes.');
            
            // Reset storage and force re-population
            this.storageService.forceResetForOshiCollection();
            
            // Reinitialize the homonym service which will trigger population
            this.homonymService = new HomonymService(this.dictionaryService, this.storageService);
            
            // Wait for population to complete
            await new Promise(resolve => {
                const checkPopulation = () => {
                    const stats = this.homonymService.getCollectionStats();
                    if (stats.totalHomonyms > 50) { // Most groups should be loaded
                        resolve();
                    } else {
                        setTimeout(checkPopulation, 2000);
                    }
                };
                checkPopulation();
            });
            
            // Update UI
            this.updateUI();
            this.uiManager.showSuccess(`Successfully restored Oshi's Homonyms with ${this.homonymService.getHomonyms().length} groups!`);
            
        } catch (error) {
            console.error('Error restoring Oshi collection:', error);
            this.uiManager.showError('Failed to restore Oshi\'s collection. Please try again.');
        } finally {
            this.uiManager.hideLoading();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Homonym Collector...');
    window.app = new HomonymApp();
    console.log('Homonym Collector initialized successfully');
});
