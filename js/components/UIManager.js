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
            newCollection: document.getElementById('newCollection'),
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
        });
    }

    /**
     * Render homonyms list
     * @param {Array} homonyms - Array of homonym objects
     */
    renderHomonyms(homonyms) {
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
            this.renderHomonymCard(homonym)
        ).join('');

        this.elements.homonymList.innerHTML = homonymHTML;
    }

    /**
     * Render a single homonym card
     * @param {Object} homonym - Homonym object
     * @returns {string} HTML string for the homonym card
     */
    renderHomonymCard(homonym) {
        const wordsHTML = homonym.words.map(word => `
            <div class="word-item">
                <h3>${this.escapeHtml(word.word)}</h3>
                <p>${this.escapeHtml(word.definition)}</p>
            </div>
        `).join('');

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
                            <p class="word-definition">${this.escapeHtml(errorSuggestion.definition)}</p>
                        </div>
                    </div>
                    <div class="manual-actions">
                        <button class="btn-add-word" onclick="app.addWordRow()">
                            <i class="fas fa-plus"></i> Add word
                        </button>
                        <button class="btn-add suggestion-add-btn" onclick="app.saveHomonymGroup('${this.escapeHtml(originalWord)}', [])">
                            <i class="fas fa-save"></i> Save homonym
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

        const suggestionsHTML = sortedSuggestions.map(suggestion => `
            <div class="word-item suggestion-word-item">
                <input type="checkbox" checked data-word="${this.escapeHtml(suggestion.word)}" class="suggestion-checkbox">
                <div class="word-info">
                    <h3>${this.escapeHtml(suggestion.word)}</h3>
                    <p class="word-definition">${this.escapeHtml(suggestion.definition || 'Loading definition...')}</p>
                </div>
            </div>
        `).join('');

        this.elements.suggestions.innerHTML = `
            <div class="homonym-group suggestion-group">
                <div class="homonym-header">
                    <span class="homonym-pronunciation">Homonym suggestions for "${this.escapeHtml(originalWord)}"</span>
                    <button class="btn-delete" onclick="app.closeSuggestions()">
                        <i class="fas fa-times"></i>
                        <div class="custom-tooltip">Close suggestions</div>
                    </button>
                </div>
                <div class="words-container">
                    ${suggestionsHTML}
                    ${!hasHomonyms ? `
                        <div class="no-match-message">
                            <p><em>No homonym suggestions found for "${this.escapeHtml(originalWord)}".</em></p>
                        </div>
                    ` : ''}
                    <div class="manual-actions">
                        <button class="btn-add-word" onclick="app.addWordRow()">
                            <i class="fas fa-plus"></i> Add word
                        </button>
                        <button class="btn-add suggestion-add-btn" onclick="app.saveHomonymGroup('${this.escapeHtml(originalWord)}', ${JSON.stringify(homonymSuggestions)})">
                            <i class="fas fa-save"></i> Save homonym
                        </button>
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
