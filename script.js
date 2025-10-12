class HomonymApp {
    constructor() {
        // Ensure clean state on initialization
        this.forceHideLoading();
        
        this.homonyms = this.loadFromStorage();
        this.initializeEventListeners();
        this.loadCollectionName(); // Load saved collection name
        this.renderHomonyms();
        this.updateCollectionCount();
        
        // Ensure clean state - no loading, no errors
        this.clearAllMessages();
        console.log('Constructor completed successfully');
        
        // Refresh definitions in background to ensure consistency
        this.refreshAllDefinitions().then(updated => {
            if (updated) {
                console.log('Definitions refreshed, re-rendering homonyms');
                this.renderHomonyms();
            }
        });
    }

    forceHideLoading() {
        const modal = document.getElementById('loadingModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none'; // Extra safety
            console.log('Loading modal forcibly hidden');
        } else {
            console.log('Loading modal not found!');
        }
    }

    clearAllMessages() {
        // Remove any existing error or success messages
        const existingMessages = document.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(message => message.remove());
    }

    initializeEventListeners() {
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        // Persistent Add button (always visible)
        document.getElementById('addButton').addEventListener('click', () => {
            const searchTerm = document.getElementById('searchInput').value.trim();
            if (searchTerm) {
                this.findHomonyms(searchTerm);
            } else {
                this.showError('Please enter a word to find homonyms.');
            }
        });

        // Enter key in search input - also triggers add
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = document.getElementById('searchInput').value.trim();
                if (searchTerm) {
                    this.findHomonyms(searchTerm);
                }
            }
        });

        // Find homonyms button (appears when no results found) - keep for backward compatibility
        document.getElementById('findHomonymsBtn').addEventListener('click', () => {
            const searchTerm = document.getElementById('searchInput').value.trim();
            this.findHomonyms(searchTerm);
        });

        // New collection button
        document.getElementById('newCollection').addEventListener('click', () => {
            this.createNewCollection();
        });

        // Collection menu toggle
        document.getElementById('collectionMenuBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleCollectionMenu();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            this.closeCollectionMenu();
        });

        // Close loading modal
        document.getElementById('closeLoading').addEventListener('click', () => {
            this.hideLoading();
        });
    }

    handleSearchInput(searchTerm) {
        // Clear any existing suggestions
        this.hideSuggestions();
        this.hideNoResults();
        
        if (!searchTerm.trim()) {
            // Show all homonyms when search is empty
            this.showAllHomonyms();
            return;
        }
        
        // Just filter existing homonyms - no need to show "no results" since we have persistent add button
        this.filterHomonyms(searchTerm);
    }

    handleEnterKey() {
        const searchTerm = document.getElementById('searchInput').value.trim();
        if (searchTerm) {
            // Check if there are any visible homonym groups
            const visibleGroups = document.querySelectorAll('.homonym-group:not([style*="display: none"])');
            if (visibleGroups.length === 0) {
                // No results found, trigger add workflow
                this.findHomonyms(searchTerm);
            }
        }
    }

    showNoResults(searchTerm) {
        const noResults = document.getElementById('noResults');
        const searchTermSpan = document.getElementById('searchTerm');
        searchTermSpan.textContent = searchTerm;
        noResults.classList.remove('hidden');
    }

    hideNoResults() {
        const noResults = document.getElementById('noResults');
        noResults.classList.add('hidden');
    }

    hideSuggestions() {
        const suggestions = document.getElementById('suggestions');
        suggestions.classList.add('hidden');
    }

    closeSuggestions() {
        this.hideSuggestions();
        // Also clear the search input
        document.getElementById('searchInput').value = '';
        // Show all homonyms again
        this.showAllHomonyms();
    }

    showAllHomonyms() {
        const homonymGroups = document.querySelectorAll('.homonym-group');
        homonymGroups.forEach(group => {
            group.style.display = 'block';
        });
        // Reset count to show total homonyms
        this.updateCollectionCount();
    }

    async findHomonyms(word) {
        if (!word) {
            const searchInput = document.getElementById('searchInput');
            word = searchInput.value.trim().toLowerCase();
        } else {
            word = word.toLowerCase();
        }
        
        if (!word) {
            this.showError('Please enter a word to search for homonyms.');
            return;
        }

        this.hideNoResults();
        this.showLoading();
        
        try {
            const homonymSuggestions = await this.getHomonymSuggestions(word);
            this.hideLoading();
            this.displaySuggestions(word, homonymSuggestions);
        } catch (error) {
            console.error('Error finding homonyms:', error);
            this.hideLoading();
            this.showError('Failed to find homonyms. Please try again.');
        }
    }

    async getHomonymSuggestions(word) {
        // Comprehensive homonym database based on your collection with your daughter!
        const commonHomonyms = {
            // Single letters
            'b': ['be', 'bee'],
            'be': ['b', 'bee'],
            'bee': ['b', 'be'],
            'c': ['sea', 'see'],
            'sea': ['c', 'see'],
            'see': ['c', 'sea'],
            'i': ['eye'],
            'eye': ['i'],
            'o': ['oh'],
            'oh': ['o'],
            'p': ['pea', 'pee'],
            'pea': ['p', 'pee'],
            'pee': ['p', 'pea'],
            'r': ['are'],
            'are': ['r'],
            't': ['tea', 'tee'],
            'tea': ['t', 'tee'],
            'tee': ['t', 'tea'],
            'u': ['you'],
            'you': ['u'],
            'v': ['we'],
            'we': ['v'],
            'y': ['why'],
            'why': ['y'],
            
            // A words
            'ail': ['ale'],
            'ale': ['ail'],
            
            // B words
            'bao': ['bow'],
            'bow': ['bao'],
            'bail': ['bale'],
            'bale': ['bail'],
            'bare': ['bear'],
            'bear': ['bare'],
            'bean': ['been'],
            'been': ['bean'],
            'beat': ['beet'],
            'beet': ['beat'],
            'berth': ['birth'],
            'birth': ['berth'],
            'board': ['bored'],
            'bored': ['board'],
            'blew': ['blue'],
            'blue': ['blew'],
            'by': ['bye', 'buy'],
            'bye': ['by', 'buy'],
            'buy': ['by', 'bye'],
            
            // C words
            'cale': ['kale'],
            'kale': ['cale'],
            'cease': ['seas', 'sees', 'seize'],
            'seas': ['cease', 'sees', 'seize'],
            'sees': ['cease', 'seas', 'seize'],
            'seize': ['cease', 'seas', 'sees'],
            'cent': ['scent', 'sent'],
            'scent': ['cent', 'sent'],
            'sent': ['cent', 'scent'],
            'chute': ['shoot'],
            'shoot': ['chute'],
            
            // D words
            'dear': ['deer'],
            'deer': ['dear'],
            'doe': ['dough'],
            'dough': ['doe'],
            
            // E words
            'earn': ['urn'],
            'urn': ['earn'],
            
            // F words
            'fair': ['fare'],
            'fare': ['fair'],
            'flea': ['flee'],
            'flee': ['flea'],
            'flew': ['flu'],
            'flu': ['flew'],
            
            // H words
            'hair': ['hare'],
            'hare': ['hair'],
            'hi': ['high'],
            'high': ['hi'],
            'heard': ['herd'],
            'herd': ['heard'],
            'hence': ['hens'],
            'hens': ['hence'],
            'hour': ['our'],
            'our': ['hour'],
            
            // K/N words
            'knight': ['night'],
            'night': ['knight'],
            'knot': ['not'],
            'not': ['knot'],
            'know': ['no'],
            'no': ['know'],
            'knows': ['nose'],
            'nose': ['knows'],
            
            // L words
            'lead': ['led'],
            'led': ['lead'],
            'leak': ['leek'],
            'leek': ['leak'],
            
            // M words
            'mail': ['male'],
            'male': ['mail'],
            'maid': ['made'],
            'made': ['maid'],
            'mat': ['matte'],
            'matte': ['mat'],
            
            // O words
            'one': ['won'],
            'won': ['one'],
            'oar': ['or', 'ore'],
            'or': ['oar', 'ore'],
            'ore': ['oar', 'or'],
            
            // P words
            'pail': ['pale'],
            'pale': ['pail'],
            'pair': ['pear'],
            'pear': ['pair'],
            'peace': ['piece'],
            'piece': ['peace'],
            'pi': ['pie'],
            'pie': ['pi'],
            'pole': ['poll'],
            'poll': ['pole'],
            'principal': ['principle'],
            'principle': ['principal'],
            
            // R words
            'rain': ['rein', 'reign'],
            'rein': ['rain', 'reign'],
            'reign': ['rain', 'rein'],
            'read': ['reed', 'red'],
            'reed': ['read', 'red'],
            'red': ['read', 'reed'],
            'right': ['rite', 'write'],
            'rite': ['right', 'write'],
            'write': ['right', 'rite'],
            'roll': ['role'],
            'role': ['roll'],
            
            // S words
            'scene': ['seen'],
            'seen': ['scene'],
            'seam': ['seem'],
            'seem': ['seam'],
            'sail': ['sale'],
            'sale': ['sail'],
            'so': ['sow'],
            'sow': ['so'],
            'stationary': ['stationery'],
            'stationery': ['stationary'],
            'steel': ['steal'],
            'steal': ['steel'],
            
            // T words
            'team': ['teem'],
            'teem': ['team'],
            'their': ['there', 'theyre'],
            'there': ['their', 'theyre'],
            'theyre': ['their', 'there'],
            'thigh': ['thai'],
            'thai': ['thigh'],
            'to': ['too'],
            'too': ['to'],
            'toe': ['tow'],
            'tow': ['toe'],
            
            // V/W words
            'veil': ['wail', 'whale'],
            'wail': ['veil', 'whale'],
            'whale': ['veil', 'wail'],
            'vet': ['wet', 'whet'],
            'wet': ['vet', 'whet'],
            'whet': ['vet', 'wet'],
            'vow': ['wow'],
            'wow': ['vow'],
            'vile': ['while'],
            'while': ['vile'],
            'waist': ['waste'],
            'waste': ['waist'],
            'wait': ['weight'],
            'weight': ['wait'],
            'waive': ['wave'],
            'wave': ['waive'],
            'weak': ['week'],
            'week': ['weak'],
            'weather': ['whether'],
            'whether': ['weather'],
            'witch': ['which'],
            'which': ['witch']
        };

        const suggestions = [];
        
        // Check our common homonyms database first
        if (commonHomonyms[word]) {
            for (const homonym of commonHomonyms[word]) {
                // Validate each suggestion exists in dictionary and get its definition
                try {
                    const definition = await this.getDefinition(homonym);
                    if (definition && !definition.includes('No definition found')) {
                        suggestions.push({
                            word: homonym,
                            pronunciation: 'Loading...',
                            definition: definition
                        });
                    }
                } catch (error) {
                    console.log(`Skipping invalid word: ${homonym}`);
                }
            }
        }

        // If no common homonyms found, validate the input word first
        if (suggestions.length === 0) {
            // Try to validate the input word exists in dictionary
            try {
                const inputDefinition = await this.getDefinition(word);
                if (inputDefinition && !inputDefinition.includes('No definition found')) {
                    suggestions.push({
                        word: 'No common homonyms found',
                        pronunciation: 'Try a different word',
                        definition: `"${word}" is a valid word, but we don't have homonyms for it in our database.`
                    });
                } else {
                    suggestions.push({
                        word: 'Word not found',
                        pronunciation: 'Check spelling',
                        definition: `"${word}" was not found in the dictionary. Please check the spelling.`
                    });
                }
            } catch (error) {
                suggestions.push({
                    word: 'No common homonyms found',
                    pronunciation: 'Try a different word',
                    definition: 'This word is not in our curated homonym database.'
                });
            }
        }

        return suggestions.slice(0, 5);
    }

    displaySuggestions(originalWord, suggestions) {
        const suggestionsContainer = document.getElementById('suggestions');
        
        // Check if we have any real suggestions (not just "no homonyms found")
        const realSuggestions = suggestions.filter(s => !s.word.includes('no homonyms found') && !s.word.includes('Word not found'));
        
        if (realSuggestions.length === 0) {
            // No real suggestions found - show the searched word only
            suggestionsContainer.innerHTML = `
                <div class="homonym-group suggestion-group">
                    <div class="homonym-header">
                        <span class="homonym-pronunciation">Homonym suggestions for "${originalWord}"</span>
                        <button class="btn-delete" onclick="app.closeSuggestions()">
                            <i class="fas fa-times"></i>
                            <div class="custom-tooltip">Close suggestions</div>
                        </button>
                    </div>
                    <div class="words-container">
                        <div class="word-item suggestion-word-item">
                            <input type="checkbox" checked data-word="${originalWord}" class="suggestion-checkbox">
                            <div class="word-info">
                                <h3>${originalWord}</h3>
                                <p class="word-definition">Loading definition...</p>
                            </div>
                        </div>
                        <div class="no-match-message">
                            <p><em>No match found.</em></p>
                        </div>
                        <button class="btn-add suggestion-add-btn" onclick="app.addHomonymGroup('${originalWord}', [])">
                            <i class="fas fa-plus"></i> Manually add homonym
                        </button>
                    </div>
                </div>
            `;
        } else {
            // We have real suggestions - show suggested words + searched word
            // Sort all words alphabetically (suggestions + searched word)
            const allWords = [...realSuggestions, { 
                word: originalWord, 
                pronunciation: 'Loading...', 
                definition: 'Loading definition...' 
            }];
            
            allWords.sort((a, b) => a.word.toLowerCase().localeCompare(b.word.toLowerCase()));
            
            suggestionsContainer.innerHTML = `
                <div class="homonym-group suggestion-group">
                    <div class="homonym-header">
                        <span class="homonym-pronunciation">Homonym suggestions for "${originalWord}"</span>
                        <button class="btn-delete" onclick="app.closeSuggestions()">
                            <i class="fas fa-times"></i>
                            <div class="custom-tooltip">Close suggestions</div>
                        </button>
                    </div>
                    <div class="words-container">
                        ${allWords.map(suggestion => {
                            if (suggestion.word === originalWord) {
                                // This is the searched word
                                return `
                                    <div class="word-item suggestion-word-item">
                                        <input type="checkbox" checked data-word="${suggestion.word}" class="suggestion-checkbox">
                                        <div class="word-info">
                                            <h3>${suggestion.word}</h3>
                                            <p class="word-definition">Loading definition...</p>
                                        </div>
                                    </div>
                                `;
                            } else {
                                // This is a suggested homonym
                                return `
                                    <div class="word-item suggestion-word-item">
                                        <input type="checkbox" checked data-word="${suggestion.word}" class="suggestion-checkbox">
                                        <div class="word-info">
                                            <h3>${suggestion.word}</h3>
                                            <p class="word-definition">${suggestion.definition || 'Loading definition...'}</p>
                                        </div>
                                    </div>
                                `;
                            }
                        }).join('')}
                        <button class="btn-add suggestion-add-btn" onclick="app.addHomonymGroup('${originalWord}', ${JSON.stringify(realSuggestions)})">
                            <i class="fas fa-plus"></i> Add homonym
                        </button>
                    </div>
                </div>
            `;
        }
        
        suggestionsContainer.classList.remove('hidden');

        // Fetch definition and pronunciation for the searched word
        this.fetchDataForSearchedWord(originalWord);
        
        // Start fetching pronunciations for suggested words (if any)
        if (realSuggestions.length > 0) {
            this.fetchDataInBackground(realSuggestions);
        }
    }

    async fetchDataForSearchedWord(word) {
        try {
            // Fetch definition and pronunciation for the searched word
            const definition = await this.getDefinition(word);
            const pronunciation = await this.getPhonetic(word);
            
            // Update the searched word's display in suggestions
            const suggestionWordItems = document.querySelectorAll('.suggestion-word-item');
            suggestionWordItems.forEach(element => {
                const checkbox = element.querySelector('.suggestion-checkbox');
                const wordH3 = element.querySelector('.word-info h3');
                if (checkbox && wordH3 && checkbox.getAttribute('data-word') === word) {
                    const definitionP = element.querySelector('.word-definition');
                    if (definitionP) {
                        definitionP.textContent = definition;
                    }
                }
            });
        } catch (error) {
            console.error(`Error fetching data for searched word ${word}:`, error);
        }
    }

    async fetchDataInBackground(suggestions) {
        // Fetch pronunciations and definitions for each suggestion
        for (const suggestion of suggestions) {
            if (suggestion.word === 'No common homonyms found') continue;
            
            try {
                // Try to get pronunciation
                const pronunciation = await this.getPhonetic(suggestion.word);
                suggestion.pronunciation = pronunciation;
                
                // Update UI if suggestions are still visible
                this.updateSuggestionDisplay(suggestion);
            } catch (error) {
                console.log('Background fetch failed for:', suggestion.word);
            }
        }
    }

    updateSuggestionDisplay(suggestion) {
        const suggestionElements = document.querySelectorAll('.suggestion-item .suggestion-word');
        suggestionElements.forEach(element => {
            if (element.textContent === suggestion.word) {
                const pronunciationElement = element.nextElementSibling;
                if (pronunciationElement) {
                    pronunciationElement.textContent = suggestion.pronunciation;
                }
            }
        });
    }

    async getPhonetic(word) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, {
                signal: controller.signal
            });
            clearTimeout(timeout);
            
            if (response.ok) {
                const data = await response.json();
                if (data[0] && data[0].phonetics && data[0].phonetics[0]) {
                    return data[0].phonetics[0].text || '/phonetic/';
                }
            }
        } catch (error) {
            console.log('Phonetic lookup failed for:', word);
        }
        return '/phonetic/';
    }

    async getDefinition(word) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, {
                signal: controller.signal
            });
            clearTimeout(timeout);
            
            if (response.ok) {
                const data = await response.json();
                if (data[0] && data[0].meanings && data[0].meanings[0]) {
                    const meaning = data[0].meanings[0];
                    const partOfSpeech = meaning.partOfSpeech;
                    const definition = meaning.definitions[0].definition;
                    return `(${partOfSpeech}) ${definition}`;
                }
            }
        } catch (error) {
            console.log('Definition lookup failed for:', word);
        }
        return 'Definition not available';
    }

    async addHomonymGroup(originalWord, suggestions) {
        this.showLoading();
        
        try {
            // Get selected words
            const checkboxes = document.querySelectorAll('.suggestion-checkbox:checked');
            const selectedWords = [];
            
            checkboxes.forEach(checkbox => {
                const word = checkbox.getAttribute('data-word');
                if (word && word !== 'No common homonyms found') {
                    selectedWords.push(word);
                }
            });

            if (selectedWords.length < 2) {
                this.hideLoading();
                this.showError('Please select at least two words to create a homonym.');
                return;
            }

            // Get definitions for all words
            const wordsWithDefinitions = [];
            for (const word of selectedWords) {
                const definition = await this.getDefinition(word);
                wordsWithDefinitions.push({
                    word: word,
                    definition: definition
                });
            }

            // Get pronunciation (use first word)
            const pronunciation = await this.getPhonetic(selectedWords[0]);

            // Create homonym group
            const homonymGroup = {
                id: Date.now(),
                pronunciation: pronunciation,
                words: wordsWithDefinitions,
                dateAdded: new Date().toISOString()
            };

            // Add to collection
            this.homonyms.push(homonymGroup);
            this.saveToStorage();
            this.renderHomonyms();
            this.updateCollectionCount();

            // Clear inputs and hide suggestions
            document.getElementById('searchInput').value = '';
            document.getElementById('suggestions').classList.add('hidden');
            this.showAllHomonyms(); // Show all homonyms again
            
            this.hideLoading();
            this.showSuccess(`Successfully added homonym with ${selectedWords.length} words!`);
        } catch (error) {
            console.error('Error adding homonym:', error);
            this.hideLoading();
            this.showError('Failed to add homonym. Please try again.');
        }
    }

    renderHomonyms() {
        const homonymList = document.getElementById('homonymList');
        
        if (this.homonyms.length === 0) {
            homonymList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <p>No homonyms added yet. Start by entering a word above!</p>
                </div>
            `;
            return;
        }

        // Sort alphabetically by first word in each group
        const sortedHomonyms = [...this.homonyms].sort((a, b) => {
            const firstWordA = a.words[0].word.toLowerCase();
            const firstWordB = b.words[0].word.toLowerCase();
            return firstWordA.localeCompare(firstWordB);
        });

        homonymList.innerHTML = sortedHomonyms.map(group => `
            <div class="homonym-group">
                <div class="homonym-header">
                    <span class="homonym-pronunciation">${group.pronunciation}</span>
                    <button class="btn-delete" onclick="app.deleteHomonymGroup(${group.id})">
                        <i class="fas fa-trash"></i>
                        <div class="custom-tooltip">Delete homonym</div>
                    </button>
                </div>
                <div class="words-container">
                    ${group.words.map(wordObj => `
                        <div class="word-item">
                            <div class="word-info">
                                <h3>${wordObj.word}</h3>
                                <p class="word-definition">${wordObj.definition}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    filterHomonyms(searchTerm) {
        const homonymGroups = document.querySelectorAll('.homonym-group');
        const term = searchTerm.toLowerCase();
        let visibleCount = 0;

        homonymGroups.forEach(group => {
            const text = group.textContent.toLowerCase();
            if (text.includes(term)) {
                group.style.display = 'block';
                visibleCount++;
            } else {
                group.style.display = 'none';
            }
        });

        // Update count to show matches instead of total
        this.updateCollectionCount(visibleCount, true);
        
        return visibleCount > 0;
    }

    deleteHomonymGroup(id) {
        if (confirm('Are you sure you want to delete this homonym?')) {
            this.homonyms = this.homonyms.filter(group => group.id !== id);
            this.saveToStorage();
            this.renderHomonyms();
            this.updateCollectionCount();
        }
    }

    // Collection Management Methods
    createNewCollection() {
        const name = prompt('Enter a name for your new collection:', 'My Homonyms');
        if (name && name.trim()) {
            if (confirm(`Create a new collection called "${name.trim()}"? This will clear your current collection.`)) {
                // Clear current collection
                this.homonyms = [];
                this.saveToStorage();
                
                // Update collection name
                this.updateCollectionName(name.trim());
                this.renderHomonyms();
                this.updateCollectionCount();
                
                this.showSuccess(`Created new collection: "${name.trim()}"`);
            }
        }
    }

    toggleCollectionMenu() {
        const dropdown = document.getElementById('collectionDropdown');
        dropdown.classList.toggle('hidden');
    }

    closeCollectionMenu() {
        const dropdown = document.getElementById('collectionDropdown');
        dropdown.classList.add('hidden');
    }

    renameCollection() {
        this.closeCollectionMenu();
        const currentName = document.getElementById('collectionName').textContent;
        const newName = prompt('Enter new collection name:', currentName);
        
        if (newName && newName.trim() && newName.trim() !== currentName) {
            this.updateCollectionName(newName.trim());
            this.showSuccess(`Collection renamed to "${newName.trim()}"`);
        }
    }

    duplicateCollection() {
        this.closeCollectionMenu();
        const currentName = document.getElementById('collectionName').textContent;
        const newName = prompt('Enter name for the duplicate collection:', `${currentName} Copy`);
        
        if (newName && newName.trim()) {
            // Save current collection data to a backup (in real app, this would create a new collection)
            const collectionData = {
                name: newName.trim(),
                homonyms: [...this.homonyms],
                created: new Date().toISOString()
            };
            
            // For demo purposes, just show success message
            // In a real app, you'd save this as a separate collection
            this.showSuccess(`Collection "${newName.trim()}" would be created with ${this.homonyms.length} homonyms. (Feature demo)`);
        }
    }

    deleteCollection() {
        this.closeCollectionMenu();
        const currentName = document.getElementById('collectionName').textContent;
        
        if (confirm(`Are you sure you want to delete the collection "${currentName}"? This action cannot be undone.`)) {
            // Clear the collection
            this.homonyms = [];
            this.saveToStorage();
            this.renderHomonyms();
            this.updateCollectionCount();
            
            // Reset to default name
            this.updateCollectionName('My Homonyms');
            
            this.showSuccess(`Collection "${currentName}" has been deleted.`);
        }
    }

    updateCollectionName(name) {
        document.getElementById('collectionName').textContent = name;
        // In a real app, you'd also save this to storage/database
        localStorage.setItem('collectionName', name);
    }

    loadCollectionName() {
        const savedName = localStorage.getItem('collectionName');
        if (savedName) {
            document.getElementById('collectionName').textContent = savedName;
        }
    }

    async refreshAllDefinitions() {
        console.log('Refreshing all definitions with API data...');
        let updated = false;
        
        for (let group of this.homonyms) {
            for (let wordObj of group.words) {
                try {
                    const apiDefinition = await this.getDefinition(wordObj.word);
                    if (apiDefinition && !apiDefinition.includes('No definition found')) {
                        if (wordObj.definition !== apiDefinition) {
                            console.log(`Updating definition for "${wordObj.word}"`);
                            wordObj.definition = apiDefinition;
                            updated = true;
                        }
                    }
                } catch (error) {
                    console.log(`Could not update definition for "${wordObj.word}":`, error);
                }
            }
        }
        
        if (updated) {
            this.saveToStorage();
            console.log('Definitions updated and saved to storage');
            return true;
        }
        return false;
    }

    loadCompleteCollection() {
        console.log('Loading complete collection of 78 homonym groups...');
        return [
            // Copy all the homonym data from the loadFromStorage method
        ];
    }

    updateCollectionCount(count = null, isFiltered = false) {
        const displayCount = count !== null ? count : this.homonyms.length;
        const label = isFiltered ? 'match' : 'homonym';
        const pluralLabel = isFiltered ? 'matches' : 'homonyms';
        
        document.getElementById('collectionCount').textContent = 
            `${displayCount} ${displayCount === 1 ? label : pluralLabel}`;
    }

    saveToStorage() {
        localStorage.setItem('homonymCollection', JSON.stringify(this.homonyms));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('homonymCollection');
        let homonyms = stored ? JSON.parse(stored) : [];
        
        // Force load the complete collection if we have fewer than 78 groups
        // This ensures your complete collection is always available
        if (homonyms.length < 78) {
            console.log('Loading complete homonym collection...');
            homonyms = [
                // 1. B, Be, Bee
                {
                    id: Date.now() - 78000,
                    pronunciation: 'bee',
                    words: [
                        { word: 'B', definition: '(noun) The second letter of the alphabet' },
                        { word: 'be', definition: '(verb) To exist or live' },
                        { word: 'bee', definition: '(noun) A flying insect that makes honey' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 2. C, Sea, See  
                {
                    id: Date.now() - 77000,
                    pronunciation: 'see',
                    words: [
                        { word: 'C', definition: '(noun) The third letter of the alphabet' },
                        { word: 'sea', definition: '(noun) A large body of salt water' },
                        { word: 'see', definition: '(verb) To perceive with the eyes' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 3. I, Eye
                {
                    id: Date.now() - 76000,
                    pronunciation: 'eye',
                    words: [
                        { word: 'I', definition: '(pronoun) Used to refer to oneself' },
                        { word: 'eye', definition: '(noun) The organ of sight' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 4. O, Oh
                {
                    id: Date.now() - 75000,
                    pronunciation: 'oh',
                    words: [
                        { word: 'O', definition: '(noun) The fifteenth letter of the alphabet' },
                        { word: 'oh', definition: '(exclamation) Used to express surprise or realization' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 5. P, Pea, Pee
                {
                    id: Date.now() - 74000,
                    pronunciation: 'pee',
                    words: [
                        { word: 'P', definition: '(noun) The sixteenth letter of the alphabet' },
                        { word: 'pea', definition: '(noun) A small round green seed' },
                        { word: 'pee', definition: '(verb) To urinate' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 6. R, Are
                {
                    id: Date.now() - 73000,
                    pronunciation: 'are',
                    words: [
                        { word: 'R', definition: '(noun) The eighteenth letter of the alphabet' },
                        { word: 'are', definition: '(verb) Present tense plural of "be"' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 7. T, Tea, Tee
                {
                    id: Date.now() - 72000,
                    pronunciation: 'tea',
                    words: [
                        { word: 'T', definition: '(noun) The twentieth letter of the alphabet' },
                        { word: 'tea', definition: '(noun) A hot drink made from leaves' },
                        { word: 'tee', definition: '(noun) A small peg for supporting a golf ball' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 8. U, You
                {
                    id: Date.now() - 71000,
                    pronunciation: 'you',
                    words: [
                        { word: 'U', definition: '(noun) The twenty-first letter of the alphabet' },
                        { word: 'you', definition: '(pronoun) Used to refer to the person being addressed' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 9. V, We
                {
                    id: Date.now() - 70000,
                    pronunciation: 'we',
                    words: [
                        { word: 'V', definition: '(noun) The twenty-second letter of the alphabet' },
                        { word: 'we', definition: '(pronoun) Used to refer to oneself and others' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 10. Y, Why
                {
                    id: Date.now() - 69000,
                    pronunciation: 'why',
                    words: [
                        { word: 'Y', definition: '(noun) The twenty-fifth letter of the alphabet' },
                        { word: 'why', definition: '(adverb) For what reason or purpose' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 11. Ail, Ale
                {
                    id: Date.now() - 68000,
                    pronunciation: 'ale',
                    words: [
                        { word: 'ail', definition: '(verb) To trouble or afflict' },
                        { word: 'ale', definition: '(noun) A type of beer' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 12. Bao, Bow
                {
                    id: Date.now() - 67000,
                    pronunciation: 'bow',
                    words: [
                        { word: 'bao', definition: '(noun) A type of steamed bun' },
                        { word: 'bow', definition: '(verb) To bend forward or (noun) a weapon for shooting arrows' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 13. Bail, Bale
                {
                    id: Date.now() - 66000,
                    pronunciation: 'bale',
                    words: [
                        { word: 'bail', definition: '(noun) Money paid to release someone from jail' },
                        { word: 'bale', definition: '(noun) A large bundle of hay or cotton' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 14. Bare, Bear
                {
                    id: Date.now() - 65000,
                    pronunciation: 'bear',
                    words: [
                        { word: 'bare', definition: '(adjective) Naked or uncovered' },
                        { word: 'bear', definition: '(noun) A large mammal or (verb) to carry' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 15. Bean, Been
                {
                    id: Date.now() - 64000,
                    pronunciation: 'been',
                    words: [
                        { word: 'bean', definition: '(noun) An edible seed' },
                        { word: 'been', definition: '(verb) Past participle of "be"' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 16. Beat, Beet
                {
                    id: Date.now() - 63000,
                    pronunciation: '/biːt/',
                    words: [
                        { word: 'beat', definition: '(verb) To strike repeatedly' },
                        { word: 'beet', definition: '(noun) A root vegetable' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 17. Berth, Birth
                {
                    id: Date.now() - 62000,
                    pronunciation: '/bɜːrθ/',
                    words: [
                        { word: 'berth', definition: '(noun) A sleeping place on a ship or train' },
                        { word: 'birth', definition: '(noun) The act of being born' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 18. Board, Bored
                {
                    id: Date.now() - 61000,
                    pronunciation: '/bɔːrd/',
                    words: [
                        { word: 'board', definition: '(noun) A flat piece of wood' },
                        { word: 'bored', definition: '(adjective) Feeling weary from lack of interest' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 19. Blew, Blue
                {
                    id: Date.now() - 60000,
                    pronunciation: '/bluː/',
                    words: [
                        { word: 'blew', definition: '(verb) Past tense of "blow"' },
                        { word: 'blue', definition: '(adjective) The color of the sky' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 20. By, Bye, Buy
                {
                    id: Date.now() - 59000,
                    pronunciation: '/baɪ/',
                    words: [
                        { word: 'by', definition: '(preposition) Near or through' },
                        { word: 'bye', definition: '(exclamation) Goodbye' },
                        { word: 'buy', definition: '(verb) To purchase' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 21. Cale, Kale
                {
                    id: Date.now() - 58000,
                    pronunciation: '/keɪl/',
                    words: [
                        { word: 'cale', definition: '(noun) A type of cabbage' },
                        { word: 'kale', definition: '(noun) A leafy green vegetable' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 22. Cease, Seas, Sees, Seize
                {
                    id: Date.now() - 57000,
                    pronunciation: '/siːz/',
                    words: [
                        { word: 'cease', definition: '(verb) To stop or end' },
                        { word: 'seas', definition: '(noun) Plural of sea' },
                        { word: 'sees', definition: '(verb) Third person singular of "see"' },
                        { word: 'seize', definition: '(verb) To grab or take hold of' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 23. Cent, Scent, Sent
                {
                    id: Date.now() - 56000,
                    pronunciation: '/sɛnt/',
                    words: [
                        { word: 'cent', definition: '(noun) A monetary unit worth one hundredth of a dollar' },
                        { word: 'scent', definition: '(noun) A distinctive smell' },
                        { word: 'sent', definition: '(verb) Past tense of "send"' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 24. Chute, Shoot
                {
                    id: Date.now() - 55000,
                    pronunciation: '/ʃuːt/',
                    words: [
                        { word: 'chute', definition: '(noun) A sloping channel or slide' },
                        { word: 'shoot', definition: '(verb) To fire a gun or take a photograph' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 25. Dear, Deer
                {
                    id: Date.now() - 54000,
                    pronunciation: '/dɪr/',
                    words: [
                        { word: 'dear', definition: '(adjective) Beloved or expensive' },
                        { word: 'deer', definition: '(noun) A hoofed mammal' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 26. Doe, Dough
                {
                    id: Date.now() - 53000,
                    pronunciation: '/doʊ/',
                    words: [
                        { word: 'doe', definition: '(noun) A female deer' },
                        { word: 'dough', definition: '(noun) A mixture of flour and water for baking' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 27. Earn, Urn
                {
                    id: Date.now() - 52000,
                    pronunciation: '/ɜːrn/',
                    words: [
                        { word: 'earn', definition: '(verb) To receive money in return for work' },
                        { word: 'urn', definition: '(noun) A vase-shaped container' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 28. Fair, Fare
                {
                    id: Date.now() - 51000,
                    pronunciation: '/fɛr/',
                    words: [
                        { word: 'fair', definition: '(adjective) Just or reasonable' },
                        { word: 'fare', definition: '(noun) The price of travel' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 29. Flea, Flee
                {
                    id: Date.now() - 50000,
                    pronunciation: '/fliː/',
                    words: [
                        { word: 'flea', definition: '(noun) A small jumping insect' },
                        { word: 'flee', definition: '(verb) To run away quickly' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 30. Flew, Flu
                {
                    id: Date.now() - 49000,
                    pronunciation: '/fluː/',
                    words: [
                        { word: 'flew', definition: '(verb) Past tense of "fly"' },
                        { word: 'flu', definition: '(noun) Influenza illness' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 31. Hair, Hare
                {
                    id: Date.now() - 48000,
                    pronunciation: '/hɛr/',
                    words: [
                        { word: 'hair', definition: '(noun) Strands growing from the skin' },
                        { word: 'hare', definition: '(noun) A fast-running mammal like a rabbit' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 32. Hi, High
                {
                    id: Date.now() - 47000,
                    pronunciation: '/haɪ/',
                    words: [
                        { word: 'hi', definition: '(exclamation) An informal greeting' },
                        { word: 'high', definition: '(adjective) Far up or tall' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 33. Heard, Herd
                {
                    id: Date.now() - 46000,
                    pronunciation: '/hɜːrd/',
                    words: [
                        { word: 'heard', definition: '(verb) Past tense of "hear"' },
                        { word: 'herd', definition: '(noun) A group of animals' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 34. Hence, Hens
                {
                    id: Date.now() - 45000,
                    pronunciation: '/hɛns/',
                    words: [
                        { word: 'hence', definition: '(adverb) Therefore or from now' },
                        { word: 'hens', definition: '(noun) Plural of hen, female chickens' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 35. Hour, Our
                {
                    id: Date.now() - 44000,
                    pronunciation: '/aʊər/',
                    words: [
                        { word: 'hour', definition: '(noun) A period of sixty minutes' },
                        { word: 'our', definition: '(pronoun) Belonging to us' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 36. Knight, Night
                {
                    id: Date.now() - 43000,
                    pronunciation: '/naɪt/',
                    words: [
                        { word: 'knight', definition: '(noun) A medieval warrior' },
                        { word: 'night', definition: '(noun) The time when it is dark' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 37. Knot, Not
                {
                    id: Date.now() - 42000,
                    pronunciation: '/nɒt/',
                    words: [
                        { word: 'knot', definition: '(noun) A tied loop in rope or string' },
                        { word: 'not', definition: '(adverb) Used to negate' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 38. Know, No
                {
                    id: Date.now() - 41000,
                    pronunciation: '/noʊ/',
                    words: [
                        { word: 'know', definition: '(verb) To be aware of or understand' },
                        { word: 'no', definition: '(adverb) Used to give a negative response' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 39. Knows, Nose
                {
                    id: Date.now() - 40000,
                    pronunciation: '/noʊz/',
                    words: [
                        { word: 'knows', definition: '(verb) Third person singular of "know"' },
                        { word: 'nose', definition: '(noun) The organ of smell' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 40. Lead, Led
                {
                    id: Date.now() - 39000,
                    pronunciation: '/lɛd/',
                    words: [
                        { word: 'lead', definition: '(noun) A heavy metal' },
                        { word: 'led', definition: '(verb) Past tense of "lead"' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 41. Leak, Leek
                {
                    id: Date.now() - 38000,
                    pronunciation: '/liːk/',
                    words: [
                        { word: 'leak', definition: '(verb) To allow liquid to escape' },
                        { word: 'leek', definition: '(noun) A vegetable related to onions' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 42. Mail, Male
                {
                    id: Date.now() - 37000,
                    pronunciation: '/meɪl/',
                    words: [
                        { word: 'mail', definition: '(noun) Letters and packages sent by post' },
                        { word: 'male', definition: '(adjective) Of the masculine gender' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 43. Maid, Made
                {
                    id: Date.now() - 36000,
                    pronunciation: '/meɪd/',
                    words: [
                        { word: 'maid', definition: '(noun) A female domestic servant' },
                        { word: 'made', definition: '(verb) Past tense of "make"' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 44. Mat, Matte
                {
                    id: Date.now() - 35000,
                    pronunciation: '/mæt/',
                    words: [
                        { word: 'mat', definition: '(noun) A piece of material used as a floor covering' },
                        { word: 'matte', definition: '(adjective) Having a dull, non-reflective surface' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 45. One, Won
                {
                    id: Date.now() - 34000,
                    pronunciation: '/wʌn/',
                    words: [
                        { word: 'one', definition: '(number) The number 1' },
                        { word: 'won', definition: '(verb) Past tense of "win"' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 46. Oar, Or, Ore
                {
                    id: Date.now() - 33000,
                    pronunciation: '/ɔːr/',
                    words: [
                        { word: 'oar', definition: '(noun) A pole used to row a boat' },
                        { word: 'or', definition: '(conjunction) Used to link alternatives' },
                        { word: 'ore', definition: '(noun) A mineral containing metal' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 47. Pail, Pale
                {
                    id: Date.now() - 32000,
                    pronunciation: '/peɪl/',
                    words: [
                        { word: 'pail', definition: '(noun) A bucket' },
                        { word: 'pale', definition: '(adjective) Light in color' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 48. Pair, Pear
                {
                    id: Date.now() - 31000,
                    pronunciation: '/pɛr/',
                    words: [
                        { word: 'pair', definition: '(noun) A set of two' },
                        { word: 'pear', definition: '(noun) A sweet fruit' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 49. Peace, Piece
                {
                    id: Date.now() - 30000,
                    pronunciation: '/piːs/',
                    words: [
                        { word: 'peace', definition: '(noun) A state of harmony' },
                        { word: 'piece', definition: '(noun) A part or portion of something' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 50. Pi, Pie
                {
                    id: Date.now() - 29000,
                    pronunciation: '/paɪ/',
                    words: [
                        { word: 'pi', definition: '(noun) The mathematical constant 3.14159...' },
                        { word: 'pie', definition: '(noun) A baked dish with pastry' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 51. Pole, Poll
                {
                    id: Date.now() - 28000,
                    pronunciation: '/poʊl/',
                    words: [
                        { word: 'pole', definition: '(noun) A long stick or rod' },
                        { word: 'poll', definition: '(noun) A survey of opinions' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 52. Principal, Principle
                {
                    id: Date.now() - 27000,
                    pronunciation: '/ˈprɪnsəpəl/',
                    words: [
                        { word: 'principal', definition: '(noun) The head of a school' },
                        { word: 'principle', definition: '(noun) A fundamental rule or belief' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 53. Rain, Rein, Reign
                {
                    id: Date.now() - 26000,
                    pronunciation: '/reɪn/',
                    words: [
                        { word: 'rain', definition: '(noun) Water falling from clouds' },
                        { word: 'rein', definition: '(noun) A strap used to control a horse' },
                        { word: 'reign', definition: '(verb) To rule as monarch' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 54. Read, Reed
                {
                    id: Date.now() - 25000,
                    pronunciation: '/riːd/',
                    words: [
                        { word: 'read', definition: '(verb) To look at and understand written words' },
                        { word: 'reed', definition: '(noun) A tall grass that grows in water' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 55. Read, Red
                {
                    id: Date.now() - 24000,
                    pronunciation: '/rɛd/',
                    words: [
                        { word: 'read', definition: '(verb) Past tense of "read"' },
                        { word: 'red', definition: '(adjective) The color of blood' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 56. Right, Rite, Write
                {
                    id: Date.now() - 23000,
                    pronunciation: '/raɪt/',
                    words: [
                        { word: 'right', definition: '(adjective) Correct or proper' },
                        { word: 'rite', definition: '(noun) A ceremonial act' },
                        { word: 'write', definition: '(verb) To form letters or words on paper' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 57. Roll, Role
                {
                    id: Date.now() - 22000,
                    pronunciation: '/roʊl/',
                    words: [
                        { word: 'roll', definition: '(verb) To move by turning over' },
                        { word: 'role', definition: '(noun) A part played by an actor' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 58. Scene, Seen
                {
                    id: Date.now() - 21000,
                    pronunciation: '/siːn/',
                    words: [
                        { word: 'scene', definition: '(noun) A place where something happens' },
                        { word: 'seen', definition: '(verb) Past participle of "see"' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 59. Seam, Seem
                {
                    id: Date.now() - 20000,
                    pronunciation: '/siːm/',
                    words: [
                        { word: 'seam', definition: '(noun) A line where two pieces of fabric are sewn together' },
                        { word: 'seem', definition: '(verb) To appear to be' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 60. Sail, Sale
                {
                    id: Date.now() - 19000,
                    pronunciation: '/seɪl/',
                    words: [
                        { word: 'sail', definition: '(noun) A piece of fabric that catches wind to move a boat' },
                        { word: 'sale', definition: '(noun) The exchange of goods for money' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 61. So, Sow
                {
                    id: Date.now() - 18000,
                    pronunciation: '/soʊ/',
                    words: [
                        { word: 'so', definition: '(adverb) To such a degree' },
                        { word: 'sow', definition: '(verb) To plant seeds' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 62. Stationary, Stationery
                {
                    id: Date.now() - 17000,
                    pronunciation: '/ˈsteɪʃəˌnɛri/',
                    words: [
                        { word: 'stationary', definition: '(adjective) Not moving' },
                        { word: 'stationery', definition: '(noun) Writing materials like paper and pens' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 63. Steel, Steal
                {
                    id: Date.now() - 16000,
                    pronunciation: '/stiːl/',
                    words: [
                        { word: 'steel', definition: '(noun) A strong metal alloy' },
                        { word: 'steal', definition: '(verb) To take without permission' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 64. Team, Teem
                {
                    id: Date.now() - 15000,
                    pronunciation: '/tiːm/',
                    words: [
                        { word: 'team', definition: '(noun) A group working together' },
                        { word: 'teem', definition: '(verb) To be full of or swarming with' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 65. Their, There, They're
                {
                    id: Date.now() - 14000,
                    pronunciation: '/ðɛr/',
                    words: [
                        { word: 'their', definition: '(pronoun) Belonging to them' },
                        { word: 'there', definition: '(adverb) In that place' },
                        { word: 'theyre', definition: '(contraction) They are' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 66. Thigh, Thai
                {
                    id: Date.now() - 13000,
                    pronunciation: '/taɪ/',
                    words: [
                        { word: 'thigh', definition: '(noun) The upper part of the leg' },
                        { word: 'thai', definition: '(adjective) Related to Thailand' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 67. To, Too
                {
                    id: Date.now() - 12000,
                    pronunciation: '/tuː/',
                    words: [
                        { word: 'to', definition: '(preposition) Expressing direction or intention' },
                        { word: 'too', definition: '(adverb) Also or excessively' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 68. Toe, Tow
                {
                    id: Date.now() - 11000,
                    pronunciation: '/toʊ/',
                    words: [
                        { word: 'toe', definition: '(noun) A digit of the foot' },
                        { word: 'tow', definition: '(verb) To pull along' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 69. Veil, Wail, Whale
                {
                    id: Date.now() - 10000,
                    pronunciation: '/weɪl/',
                    words: [
                        { word: 'veil', definition: '(noun) A piece of fabric worn over the face' },
                        { word: 'wail', definition: '(verb) To cry loudly' },
                        { word: 'whale', definition: '(noun) A large marine mammal' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 70. Vet, Wet, Whet
                {
                    id: Date.now() - 9000,
                    pronunciation: '/wɛt/',
                    words: [
                        { word: 'vet', definition: '(noun) A veterinarian' },
                        { word: 'wet', definition: '(adjective) Covered with water' },
                        { word: 'whet', definition: '(verb) To sharpen or stimulate' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 71. Vow, Wow
                {
                    id: Date.now() - 8000,
                    pronunciation: '/waʊ/',
                    words: [
                        { word: 'vow', definition: '(noun) A solemn promise' },
                        { word: 'wow', definition: '(exclamation) Expression of surprise' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 72. Vile, While
                {
                    id: Date.now() - 7000,
                    pronunciation: '/waɪl/',
                    words: [
                        { word: 'vile', definition: '(adjective) Extremely unpleasant' },
                        { word: 'while', definition: '(conjunction) During the time that' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 73. Waist, Waste
                {
                    id: Date.now() - 6000,
                    pronunciation: '/weɪst/',
                    words: [
                        { word: 'waist', definition: '(noun) The part of the body between ribs and hips' },
                        { word: 'waste', definition: '(verb) To use carelessly' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 74. Wait, Weight
                {
                    id: Date.now() - 5000,
                    pronunciation: '/weɪt/',
                    words: [
                        { word: 'wait', definition: '(verb) To stay in expectation' },
                        { word: 'weight', definition: '(noun) The heaviness of something' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 75. Waive, Wave
                {
                    id: Date.now() - 4000,
                    pronunciation: '/weɪv/',
                    words: [
                        { word: 'waive', definition: '(verb) To give up a right or claim' },
                        { word: 'wave', definition: '(noun) A moving ridge of water' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 76. Weak, Week
                {
                    id: Date.now() - 3000,
                    pronunciation: '/wiːk/',
                    words: [
                        { word: 'weak', definition: '(adjective) Lacking strength' },
                        { word: 'week', definition: '(noun) A period of seven days' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 77. Weather, Whether
                {
                    id: Date.now() - 2000,
                    pronunciation: '/ˈwɛðər/',
                    words: [
                        { word: 'weather', definition: '(noun) Atmospheric conditions' },
                        { word: 'whether', definition: '(conjunction) If or expressing doubt' }
                    ],
                    dateAdded: new Date().toISOString()
                },
                // 78. Witch, Which
                {
                    id: Date.now() - 1000,
                    pronunciation: '/wɪtʃ/',
                    words: [
                        { word: 'witch', definition: '(noun) A person who practices magic' },
                        { word: 'which', definition: '(pronoun) Used to specify one or more from a set' }
                    ],
                    dateAdded: new Date().toISOString()
                }
            ];
            
            // Save the complete collection
            localStorage.setItem('homonymCollection', JSON.stringify(homonyms));
            console.log('Pre-populated with', homonyms.length, 'homonym groups');
        }
        
        return homonyms;
    }

    showLoading() {
        const modal = document.getElementById('loadingModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = ''; // Remove inline style to let CSS take over
            console.log('Loading modal shown');
        }
    }

    hideLoading() {
        const modal = document.getElementById('loadingModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none'; // Force hide with inline style
            console.log('Loading modal hidden');
        }
    }

    showError(message) {
        this.clearAllMessages();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        
        const addSection = document.querySelector('.add-section');
        addSection.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showSuccess(message) {
        this.clearAllMessages();
        
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            background: #d4edda;
            color: #155724;
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            border: 1px solid #c3e6cb;
        `;
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
        const addSection = document.querySelector('.add-section');
        addSection.appendChild(successDiv);

        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    
    // Force hide the modal immediately
    const modal = document.getElementById('loadingModal');
    if (modal) {
        modal.classList.add('hidden');
        console.log('Modal forcibly hidden');
    }
    
    app = new HomonymApp();
    console.log('App initialized successfully');
});