/**
 * @file verbs-data.js
 * Verb data handling for the Irish verb conjugation page
 */

const VerbsData = (function() {
    // Configuration
    const config = {
        // Base path to verb data files
        verbsBasePath: '/data/verbs/',
        
        // List of available verbs (filenames without .yaml extension)
        availableVerbs: [
            'abair', 'bagair', 'bi', 'caith', 'can', 'ceannaigh', 'deanaimh', 
            'diol', 'feic', 'foghlaim', 'goid', 'imir', 'insigh', 'ith', 
            'plearail', 'rith', 'tabhair', 'tar', 'teigh', 'tog'
        ],
        
        // Mood-tense mapping
        moodTenses: {
            indicative: ['present', 'past', 'future'],
            imperative: ['present'],
            conditional: ['present'],
            habitual: ['present', 'past']
        },
        
        // Display names for tenses
        tenseNames: {
            'present': 'Present Tense',
            'past': 'Past Tense',
            'future': 'Future Tense',
            'habitual_present': 'Present Habitual',
            'habitual_past': 'Past Habitual'
        },
        
        // Display names for moods
        moodNames: {
            'indicative': 'Indicative',
            'imperative': 'Imperative',
            'conditional': 'Conditional',
            'habitual': 'Habitual'
        }
    };
    
    // Cache for loaded verb data
    const verbsCache = {};
    
    /**
     * Get display name for tense
     * @param {string} mood - The verb mood
     * @param {string} tense - The verb tense
     * @returns {string} Display name
     */
    function getTenseName(mood, tense) {
        if (mood === 'habitual') {
            return config.tenseNames[`habitual_${tense}`] || tense;
        }
        if (mood === 'conditional') {
            return config.moodNames.conditional;
        }
        return config.tenseNames[tense] || tense;
    }
    
    /**
     * Get list of available tenses for a mood
     * @param {string} mood - The verb mood
     * @returns {Array} List of tenses
     */
    function getTensesForMood(mood) {
        return config.moodTenses[mood] || [];
    }
    
    /**
     * Get list of moods that support a specific tense
     * @param {string} tense - The tense to check for
     * @returns {Array} List of moods that support this tense
     */
    function getMoodsForTense(tense) {
        const moods = [];
        
        Object.entries(config.moodTenses).forEach(([mood, tenses]) => {
            if (tenses.includes(tense)) {
                moods.push(mood);
            }
        });
        
        return moods;
    }
    
    /**
     * Get all available tenses
     * @returns {Array} List of all available tenses
     */
    function getAllTenses() {
        const allTenses = new Set();
        
        // Collect all unique tenses from all moods
        Object.values(config.moodTenses).forEach(tenses => {
            tenses.forEach(tense => allTenses.add(tense));
        });
        
        // Convert to array of objects with value and text
        return Array.from(allTenses).map(tense => {
            return {
                value: tense,
                text: config.tenseNames[tense] || tense
            };
        });
    }
    
    /**
     * Get the conjugation key to use
     * @param {string} mood - The verb mood
     * @param {string} tense - The verb tense 
     * @returns {string} Conjugation key
     */
    function getConjugationKey(mood, tense) {
        if (mood === 'indicative') {
            return tense;
        }
        if (mood === 'habitual') {
            return `habitual_${tense}`;
        }
        if (mood === 'conditional') {
            return 'conditional';
        }
        if (mood === 'imperative') {
            return 'imperative';
        }
        return tense;
    }
    
    /**
     * Load a specific verb's data
     * @param {string} verbId - The verb identifier (filename without .yaml)
     * @returns {Promise<Object>} Verb data
     */
    async function loadVerb(verbId) {
        // Return cached data if available
        if (verbsCache[verbId]) {
            return Promise.resolve(verbsCache[verbId]);
        }
        
        try {
            // Construct the URL for the verb file
            const url = `${config.verbsBasePath}${verbId}.yaml`;
            
            // Load data using fetch and js-yaml
            const response = await fetch(url);
            const yamlText = await response.text();
            const verb = jsyaml.load(yamlText);
            
            // Cache the verb data
            verbsCache[verbId] = verb;
            
            return verb;
        } catch (error) {
            console.error(`Error loading verb ${verbId}:`, error);
            throw error;
        }
    }
    
    /**
     * Load all verb metadata (without full conjugation data)
     * This loads basic info to display in the verb list
     * @returns {Promise<Array>} Array of verb metadata objects
     */
    async function loadVerbList() {
        try {
            // Load index file with basic verb info
            const verbListUrl = `${config.verbsBasePath}index.yaml`;
            const response = await fetch(verbListUrl);
            const yamlText = await response.text();
            const verbList = jsyaml.load(yamlText);
            
            return verbList;
        } catch (error) {
            console.error('Error loading verb list:', error);
            
            // Fallback: Load each verb individually if the index file isn't available
            try {
                const verbPromises = config.availableVerbs.map(async verbId => {
                    const verb = await loadVerb(verbId);
                    return {
                        id: verbId,
                        infinitive: verb.infinitive,
                        meaning: verb.meaning,
                        type: verb.type
                    };
                });
                
                return Promise.all(verbPromises);
            } catch (fallbackError) {
                console.error('Fallback verb loading failed:', fallbackError);
                throw fallbackError;
            }
        }
    }
    
    /**
     * Load all verbs (full data)
     * @param {boolean} forceRefresh - Force refresh from files
     * @returns {Promise<Array>} Array of verb objects
     */
    async function loadAllVerbs(forceRefresh = false) {
        try {
            // First load the verb list
            const verbList = await loadVerbList();
            
            // Then load each verb's full data
            const verbPromises = verbList.map(verbMeta => 
                loadVerb(verbMeta.id, forceRefresh)
            );
            
            return Promise.all(verbPromises);
        } catch (error) {
            console.error('Error loading all verbs:', error);
            throw error;
        }
    }
    
    /**
     * Get verb by infinitive
     * @param {string} infinitive - The verb infinitive
     * @returns {Promise<Object|null>} Verb object or null if not found
     */
    async function getVerbByInfinitive(infinitive) {
        try {
            // Get the verb list
            const verbList = await loadVerbList();
            
            // Find the verb ID for the given infinitive
            const verbMeta = verbList.find(v => v.infinitive === infinitive);
            
            if (!verbMeta) {
                return null;
            }
            
            // Load the full verb data
            return loadVerb(verbMeta.id);
        } catch (error) {
            console.error('Error getting verb by infinitive:', error);
            throw error;
        }
    }
    
    /**
     * Filter verbs by search term
     * @param {string} searchTerm - Search term
     * @returns {Promise<Array>} Filtered verbs
     */
    async function filterVerbs(searchTerm) {
        try {
            // Get the verb list
            const verbList = await loadVerbList();
            
            if (!searchTerm) {
                return verbList;
            }
            
            const term = searchTerm.toLowerCase().trim();
            
            // Filter the verb list by the search term
            const filteredList = verbList.filter(verb => {
                return verb.infinitive.toLowerCase().includes(term) || 
                       verb.meaning.toLowerCase().includes(term);
            });
            
            return filteredList;
        } catch (error) {
            console.error('Error filtering verbs:', error);
            throw error;
        }
    }
    
    /**
     * Get conjugations for a verb in specified mood and tense
     * @param {Object} verb - The verb object
     * @param {string} mood - The verb mood
     * @param {string} tense - The verb tense
     * @returns {Object|null} Conjugation object or null if not available
     */
    function getConjugations(verb, mood, tense) {
        if (!verb || !verb.conjugations) {
            return null;
        }
        
        const conjugationKey = getConjugationKey(mood, tense);
        
        return verb.conjugations[conjugationKey] || null;
    }
    
    /**
     * Get list of moods
     * @returns {Array} Array of mood objects
     */
    function getMoods() {
        return Object.keys(config.moodTenses).map(mood => {
            return {
                value: mood,
                text: config.moodNames[mood] || mood
            };
        });
    }
    
    /**
     * Get list of tenses for the specified mood
     * @param {string} mood - The verb mood
     * @returns {Array} Array of tense objects
     */
    function getTenses(mood) {
        const tenses = getTensesForMood(mood);
        
        return tenses.map(tense => {
            return {
                value: tense,
                text: getTenseName(mood, tense)
            };
        });
    }
    
    // Public API
    return {
        loadVerb,
        loadVerbList,
        loadAllVerbs,
        getVerbByInfinitive,
        filterVerbs,
        getConjugations,
        getMoods,
        getTenses,
        getTenseName,
        getConjugationKey,
        getMoodsForTense,
        getAllTenses
    };
})();
