/**
 * UI Manager
 * Handles all DOM manipulation and UI rendering
 */

class UIManager {
    constructor() {
        this.elements = this.initializeElements();
        this.setupEventDelegation();
    }

    /**
     * Initialize DOM element references
     * @returns {Object} Object containing DOM element references
     */
    initializeElements() {
        return {
            // Search elements
            searchInput: document.getElementById('searchInput'),
            addButton: document.getElementById('addButton'),
            suggestions: document.getElementById('suggestions'),
            noResults: document.getElementById('noResults'),
            findHomonymsBtn: document.getElementById('findHomonymsBtn'),
            searchTerm: document.getElementById('searchTerm'),

            // Collection elements
            collectionName: document.getElementById('collectionName'),
            collectionCount: document.getElementById('collectionCount'),
            homonymList: document.getElementById('homonymList'),

            // Collection menu elements
            collectionSwitcherBtn: document.getElementById('collectionSwitcherBtn'),
            collectionSwitcherDropdown: document.getElementById('collectionSwitcherDropdown'),
            collectionsList: document.getElementById('collectionsList'),
            collectionMenuBtn: document.getElementById('collectionMenuBtn'),
            collectionDropdown: document.getElementById('collectionDropdown'),

            // Loading modal
            loadingModal: document.getElementById('loadingModal'),
            closeLoading: document.getElementById('closeLoading')
        };
    }

    /**
     * Setup event delegation for dynamic elements
     */
    setupEventDelegation() {
        // Handle clicks on dynamically created elements
        document.addEventListener('click', (e) => {
            // Close dropdowns when clicking outside
            if (!e.target.closest('.collection-menu')) {
                this.hideCollectionMenu();
            }
            if (!e.target.closest('.collection-title')) {
                this.hideCollectionSwitcher();
            }
        });
    }

    /**
     * Render homonyms list
     * @param {Array} homonyms - Array of homonym objects
     * @param {string} searchTerm - Optional search term for highlighting
     */
    renderHomonyms(homonyms, searchTerm = '') {
        if (!homonyms || homonyms.length === 0) {
            this.renderEmptyState();
            return;
        }

        // Sort alphabetically by first word
        const sortedHomonyms = [...homonyms].sort((a, b) => {
            const firstWordA = a.words[0]?.word.toLowerCase() || '';
            const firstWordB = b.words[0]?.word.toLowerCase() || '';
            return firstWordA.localeCompare(firstWordB);
        });

        const homonymHTML = sortedHomonyms.map(homonym => 
            this.renderHomonymCard(homonym, searchTerm)
        ).join('');

        this.elements.homonymList.innerHTML = homonymHTML;
    }

    /**
     * Capitalize first letter of a word (like a real dictionary)
     * @param {string} word - The word to capitalize
     * @returns {string} Capitalized word
     */
    capitalizeWord(word) {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }

    /**
     * Highlight matching search terms in text
     * @param {string} text - The text to highlight
     * @param {string} searchTerm - The search term to highlight
     * @returns {string} HTML string with highlighted text
     */
    highlightText(text, searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return this.escapeHtml(text);
        }

        const escaped = this.escapeHtml(text);
        const term = searchTerm.trim();
        
        // Create a regex that matches the search term (case-insensitive)
        const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
        
        return escaped.replace(regex, '<span class="highlight">$1</span>');
    }

    /**
     * Escape special regex characters
     * @param {string} string - String to escape
     * @returns {string} Escaped string
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Format definition text to make word types italic
     * @param {string} definition - The definition text
     * @param {string} searchTerm - Optional search term to highlight
     * @returns {string} Formatted HTML with word types in italic and highlighted terms
     */
    formatDefinition(definition, searchTerm = '') {
        // First highlight search terms (which also escapes HTML)
        let formatted = searchTerm ? this.highlightText(definition, searchTerm) : this.escapeHtml(definition);
        
        // Then replace word types like (verb), (noun), (adjective), etc. with italic spans
        // Be careful not to affect highlighted text
        formatted = formatted.replace(/\(([^)]+)\)(?![^<]*<\/span>)/g, '<span class="word-type">($1)</span>');
        
        return formatted;
    }

    /**
     * Render a single homonym card
     * @param {Object} homonym - Homonym object
     * @param {string} searchTerm - Optional search term for highlighting
     * @returns {string} HTML string for the homonym card
     */
    renderHomonymCard(homonym, searchTerm = '') {
        const wordsHTML = homonym.words.map(word => {
            const capitalizedWord = this.capitalizeWord(word.word);
            const highlightedWord = searchTerm ? this.highlightText(capitalizedWord, searchTerm) : this.escapeHtml(capitalizedWord);
            
            return `
            <div class="word-item">
                <div class="word-info">
                    <h3>${highlightedWord}</h3>
                    <p class="word-definition">${this.formatDefinition(word.definition, searchTerm)}</p>
                </div>
            </div>
        `}).join('');

        return `
            <div class="homonym-group" data-id="${homonym.id}">
                <div class="homonym-header">
                    <span class="homonym-pronunciation">${this.escapeHtml(homonym.pronunciation)}</span>
                    <button class="btn-delete" onclick="app.deleteHomonymGroup(${homonym.id})">
                        <i class="fas fa-trash"></i>
                        <div class="custom-tooltip">Delete homonym</div>
                    </button>
                </div>
                <div class="words-container">
                    ${wordsHTML}
                </div>
            </div>
        `;
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        this.elements.homonymList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <p>No homonyms added yet. Start by searching above!</p>
            </div>
        `;
    }

    /**
     * Render homonym suggestions
     * @param {string} originalWord - Original searched word
     * @param {Array} suggestions - Array of suggestion objects
     */
    renderSuggestions(originalWord, suggestions) {
        const isError = suggestions.length === 1 && suggestions[0].isError;
        
        if (isError) {
            this.renderErrorSuggestions(originalWord, suggestions[0]);
        } else {
            this.renderValidSuggestions(originalWord, suggestions);
        }
        
        this.showSuggestions();
    }

    /**
     * Render error suggestions (invalid word)
     * @param {string} originalWord - Original word
     * @param {Object} errorSuggestion - Error suggestion object
     */
    renderErrorSuggestions(originalWord, errorSuggestion) {
        this.elements.suggestions.innerHTML = `
            <div class="homonym-group suggestion-group">
                <div class="homonym-header">
                    <span class="homonym-pronunciation">Word validation for "${this.escapeHtml(originalWord)}"</span>
                    <button class="btn-delete" onclick="app.closeSuggestions()">
                        <i class="fas fa-times"></i>
                        <div class="custom-tooltip">Close suggestions</div>
                    </button>
                </div>
                <div class="words-container">
                    <div class="word-item suggestion-word-item error-item">
                        <input type="checkbox" data-word="${this.escapeHtml(errorSuggestion.word)}" class="suggestion-checkbox" disabled>
                        <div class="word-info">
                            <h3>Word not found in dictionary</h3>
                            <p class="word-definition">${this.formatDefinition(errorSuggestion.definition)}</p>
                        </div>
                    </div>
                    <div class="manual-actions">
                        <button class="btn-add-word" onclick="app.addWordRow()">
                            <i class="fas fa-plus"></i> Add word
                        </button>
                        <button class="btn-add suggestion-add-btn" onclick="app.saveHomonymGroup('${this.escapeHtml(originalWord)}', [])">
                            <i class="fas fa-save"></i> Save homonym to collection
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render valid suggestions
     * @param {string} originalWord - Original word
     * @param {Array} suggestions - Valid suggestions
     */
    renderValidSuggestions(originalWord, suggestions) {
        const homonymSuggestions = suggestions.filter(s => !s.isOriginal);
        const hasHomonyms = homonymSuggestions.length > 0;
        
        // Sort all suggestions alphabetically
        const sortedSuggestions = [...suggestions].sort((a, b) => 
            a.word.toLowerCase().localeCompare(b.word.toLowerCase())
        );

        const suggestionsHTML = sortedSuggestions.map(suggestion => {
            const capitalizedWord = this.capitalizeWord(suggestion.word);
            return `
            <div class="word-item suggestion-word-item">
                <input type="checkbox" checked data-word="${this.escapeHtml(suggestion.word)}" class="suggestion-checkbox">
                <div class="word-info">
                    <h3>${this.escapeHtml(capitalizedWord)}</h3>
                    <p class="word-definition">${this.formatDefinition(suggestion.definition || 'Loading definition...')}</p>
                </div>
            </div>
        `}).join('');

        this.elements.suggestions.innerHTML = `
            <div class="homonym-group suggestion-group">
                <div class="homonym-header">
                    <span class="homonym-pronunciation">Suggestions for "${this.escapeHtml(this.capitalizeWord(originalWord))}"</span>
                    <button class="btn-delete" onclick="app.closeSuggestions()">
                        <i class="fas fa-times"></i>
                        <div class="custom-tooltip">Close suggestions</div>
                    </button>
                </div>
                <div class="words-container">
                    ${suggestionsHTML}
                    ${!hasHomonyms ? `
                        <div class="no-match-message">
                            <p><em>No homonym suggestions found for "${this.escapeHtml(this.capitalizeWord(originalWord))}".</em></p>
                        </div>
                    ` : ''}
                    <div class="manual-actions">
                        <button class="btn-add-word" onclick="app.addWordRow()">
                            <i class="fas fa-plus"></i> Add word
                        </button>
                        <button class="btn-add suggestion-add-btn" onclick="app.saveHomonymGroup('${this.escapeHtml(originalWord)}', ${JSON.stringify(homonymSuggestions)})">
                            <i class="fas fa-save"></i> Save homonym to collection
                        </button>
                    </div>
                    <div class="mw-attribution">
                        Definitions powered by <a href="https://dictionaryapi.com/" target="_blank" rel="noopener">Merriam-Webster's School Dictionary</a>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Update collection name display
     * @param {string} name - Collection name
     */
    updateCollectionName(name) {
        this.elements.collectionName.textContent = name;
    }

    /**
     * Update collection count display
     * @param {number} count - Number of homonyms
     * @param {boolean} isFiltered - Whether the count represents filtered results
     */
    updateCollectionCount(count, isFiltered = false) {
        const text = isFiltered 
            ? `${count} match${count !== 1 ? 'es' : ''}`
            : `${count} homonym${count !== 1 ? 's' : ''}`;
        this.elements.collectionCount.textContent = text;
    }

    /**
     * Show suggestions container
     */
    showSuggestions() {
        this.elements.suggestions.classList.remove('hidden');
        this.hideNoResults();
    }

    /**
     * Hide suggestions container
     */
    hideSuggestions() {
        this.elements.suggestions.classList.add('hidden');
    }

    /**
     * Show no results message
     * @param {string} searchTerm - The search term
     */
    showNoResults(searchTerm) {
        this.elements.searchTerm.textContent = searchTerm;
        this.elements.noResults.classList.remove('hidden');
        this.hideSuggestions();
    }

    /**
     * Hide no results message
     */
    hideNoResults() {
        this.elements.noResults.classList.add('hidden');
    }

    /**
     * Show loading modal
     */
    showLoading() {
        this.elements.loadingModal.classList.remove('hidden');
        this.elements.loadingModal.style.display = 'flex';
    }

    /**
     * Hide loading modal
     */
    hideLoading() {
        this.elements.loadingModal.classList.add('hidden');
        this.elements.loadingModal.style.display = 'none';
    }

    /**
     * Show collection menu
     */
    showCollectionMenu() {
        this.elements.collectionDropdown.classList.remove('hidden');
    }

    /**
     * Hide collection menu
     */
    hideCollectionMenu() {
        this.elements.collectionDropdown.classList.add('hidden');
    }

    /**
     * Toggle collection menu
     */
    toggleCollectionMenu() {
        this.elements.collectionDropdown.classList.toggle('hidden');
        // Close collection switcher when opening menu
        this.hideCollectionSwitcher();
    }

    /**
     * Hide collection switcher dropdown
     */
    hideCollectionSwitcher() {
        this.elements.collectionSwitcherDropdown.classList.add('hidden');
    }

    /**
     * Toggle collection switcher dropdown
     */
    toggleCollectionSwitcher() {
        this.elements.collectionSwitcherDropdown.classList.toggle('hidden');
        // Close collection menu when opening switcher
        this.hideCollectionMenu();
        
        // If opening, render the collections list
        if (!this.elements.collectionSwitcherDropdown.classList.contains('hidden')) {
            this.renderCollectionsList();
        }
    }

    /**
     * Render collections list in switcher dropdown
     */
    async renderCollectionsList() {
        // This will be populated by the app
        // For now, just trigger the app to load collections
        if (window.app && window.app.loadCollectionsList) {
            await window.app.loadCollectionsList();
        }
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.showMessage(message, 'error');
    }

    /**
     * Show message toast
     * @param {string} message - Message text
     * @param {string} type - Message type (success, error, info)
     */
    showMessage(message, type = 'info') {
        // Remove existing messages
        document.querySelectorAll('.toast-message').forEach(el => el.remove());

        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.innerHTML = `
            <span>${this.escapeHtml(message)}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        document.body.appendChild(toast);

        // Auto-remove after delay
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, AppConfig.ui.toastDuration);
    }

    /**
     * Clear search input
     */
    clearSearch() {
        this.elements.searchInput.value = '';
    }

    /**
     * Get search input value
     * @returns {string} Search input value
     */
    getSearchValue() {
        return this.elements.searchInput.value.trim();
    }

    /**
     * Set search input value
     * @param {string} value - Value to set
     */
    setSearchValue(value) {
        this.elements.searchInput.value = value;
    }

    /**
     * Focus search input
     */
    focusSearch() {
        this.elements.searchInput.focus();
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Add CSS class to element
     * @param {string} selector - CSS selector
     * @param {string} className - Class name to add
     */
    addClass(selector, className) {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add(className);
        }
    }

    /**
     * Remove CSS class from element
     * @param {string} selector - CSS selector
     * @param {string} className - Class name to remove
     */
    removeClass(selector, className) {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.remove(className);
        }
    }

    /**
     * Toggle CSS class on element
     * @param {string} selector - CSS selector
     * @param {string} className - Class name to toggle
     */
    toggleClass(selector, className) {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.toggle(className);
        }
    }
}

// Make UI manager available globally
window.UIManager = UIManager;
