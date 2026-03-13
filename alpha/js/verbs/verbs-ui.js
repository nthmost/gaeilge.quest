/**
 * @file verbs-ui.js
 * UI interactions for the Irish verb conjugation page
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the verbs page
    initVerbsPage();
});

/**
 * Initialize the verbs page
 */
function initVerbsPage() {
    // Set up event listeners
    setupEventListeners();

    // Load verb data and populate the UI
    loadAndPopulateVerbData();

    // Add cyber effects
    initCyberEffects();
}

/**
 * Set up event listeners for the page
 */
function setupEventListeners() {
    // Mood dropdown change
    const moodDropdown = GQUtils.getEl('mood-dropdown');
    if (moodDropdown) {
        moodDropdown.addEventListener('change', function() {
            const selectedMood = this.value;
            updateTenseDropdown(selectedMood);
            updateVerbDisplay();
        });
    }

    // Tense dropdown change
    const tenseDropdown = GQUtils.getEl('tense-dropdown');
    if (tenseDropdown) {
        tenseDropdown.addEventListener('change', function() {
            updateVerbDisplay();
        });
    }

    // Verb search
    const verbSearch = GQUtils.getEl('verb-search');
    if (verbSearch) {
        verbSearch.addEventListener('input', GQUtils.debounce(function() {
            filterVerbs(this.value.toLowerCase());
        }, 300));
    }
}

/**
 * Update the tense dropdown based on selected mood
 * @param {string} mood - The selected mood
 */
function updateTenseDropdown(mood) {
    const tenseDropdown = GQUtils.getEl('tense-dropdown');
    if (!tenseDropdown) return;

    // Clear existing options
    tenseDropdown.innerHTML = '';

    // Get tenses for the selected mood
    const tenses = VerbsData.getTenses(mood);

    // Add option elements
    tenses.forEach(tense => {
        const option = GQUtils.createEl('option', {
            value: tense.value
        }, tense.text);

        tenseDropdown.appendChild(option);
    });

    // Select first option by default
    if (tenseDropdown.options.length > 0) {
        tenseDropdown.selectedIndex = 0;
    }
}


/**
 * Update the initialization order for dropdowns to handle Tense first, Mood second
 */
function loadAndPopulateVerbData() {
    try {
        // First load the verbs to populate the list
        VerbsData.loadVerbList()
            .then(verbs => {
                // Populate the verb list
                populateVerbList(verbs);

                // Initialize mood dropdown
                populateMoodDropdown();

                // Update tense dropdown for default mood
                const moodDropdown = GQUtils.getEl('mood-dropdown');
                const defaultMood = moodDropdown ? moodDropdown.value : 'indicative';
                updateTenseDropdown(defaultMood);
            })
            .catch(error => {
                console.error('Error loading verb list:', error);
                showErrorMessage('Failed to load verb list');
            });
    } catch (error) {
        console.error('Error loading verb data:', error);
        showErrorMessage('Failed to load verb data');
    }
}

/**
 * Since we now have tense first and mood second, the relationship is reversed
 * This function needs to update what tenses are available for a given mood
 */
function setupEventListeners() {
    // Mood dropdown change
    const moodDropdown = GQUtils.getEl('mood-dropdown');
    if (moodDropdown) {
        moodDropdown.addEventListener('change', function() {
            const selectedMood = this.value;
            // When mood changes, we need to update the tenses available
            updateTenseDropdown(selectedMood);
            updateVerbDisplay();
        });
    }

    // Tense dropdown change
    const tenseDropdown = GQUtils.getEl('tense-dropdown');
    if (tenseDropdown) {
        tenseDropdown.addEventListener('change', function() {
            updateVerbDisplay();
        });
    }

    // Verb search
    const verbSearch = GQUtils.getEl('verb-search');
    if (verbSearch) {
        verbSearch.addEventListener('input', GQUtils.debounce(function() {
            filterVerbs(this.value.toLowerCase());
        }, 300));
    }
}


/**
 * Populate the mood dropdown
 */
function populateMoodDropdown() {
    const moodDropdown = GQUtils.getEl('mood-dropdown');
    if (!moodDropdown) return;

    // Clear existing options
    moodDropdown.innerHTML = '';

    // Get moods
    const moods = VerbsData.getMoods();

    // Add option elements
    moods.forEach(mood => {
        const option = GQUtils.createEl('option', {
            value: mood.value
        }, mood.text);

        moodDropdown.appendChild(option);
    });
}

/**
 * Filter verbs based on search input
 * @param {string} searchTerm - The search term to filter by
 */
async function filterVerbs(searchTerm) {
    try {
        const filteredVerbs = await VerbsData.filterVerbs(searchTerm);
        updateVerbList(filteredVerbs, searchTerm);
    } catch (error) {
        console.error('Error filtering verbs:', error);
        GQUI.showNotification('Error filtering verbs.', 'error');
    }
}

/**
 * Update the verb list with filtered verbs
 * @param {Array} verbs - Array of verb objects
 * @param {string} searchTerm - The search term
 */
function updateVerbList(verbs, searchTerm) {
    const verbList = GQUtils.getEl('verb-list');
    if (!verbList) return;

    // Get currently active verb if any
    const activeVerb = verbList.querySelector('.active');
    const activeVerbId = activeVerb ? activeVerb.dataset.verbId : null;

    // Clear the list
    verbList.innerHTML = '';

    // Add each verb to the list
    verbs.forEach(verb => {
        const li = GQUtils.createEl('li', {
            dataset: {
                verbId: verb.id,
                infinitive: verb.infinitive,
                meaning: verb.meaning
            },
            onclick: function() {
                selectVerb(this);
            }
        }, [
            GQUtils.createEl('span', { className: 'verb-irish' }, verb.infinitive),
            GQUtils.createEl('span', { className: 'verb-english' }, verb.meaning)
        ]);

        // Re-select active verb if it's in the filtered list
        if (verb.id === activeVerbId) {
            li.classList.add('active');
        }

        verbList.appendChild(li);
    });

    // Show message if no verbs match
    const noResultsMsg = GQUtils.getEl('no-results-message');

    if (verbs.length === 0 && searchTerm) {
        if (!noResultsMsg) {
            const newMsg = GQUtils.createEl('div', {
                id: 'no-results-message',
                className: 'no-results'
            }, `No verbs match "${searchTerm}"`);

            verbList.parentNode.appendChild(newMsg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }

    // Select first verb if no verb is selected
    if (!verbList.querySelector('.active') && verbList.firstChild) {
        selectVerb(verbList.firstChild);
    }
}

/**
 * Select a verb from the list
 * @param {HTMLElement} verbElement - The verb list item element
 */
async function selectVerb(verbElement) {
    // Remove active class from all verbs
    const allVerbs = GQUtils.getEls('#verb-list li');
    allVerbs.forEach(v => v.classList.remove('active'));

    // Add active class to selected verb
    verbElement.classList.add('active');

    try {
        // Load the full verb data
        const verbId = verbElement.dataset.verbId;
        const verb = await VerbsData.loadVerb(verbId);

        // Display verb conjugations
        displayVerbConjugations(verb);
    } catch (error) {
        console.error('Error loading verb details:', error);
        GQUI.showNotification('Error loading verb details.', 'error');
    }
}

/**
 * Display conjugations for the selected verb
 * @param {Object} verb - The verb object
 */
function displayVerbConjugations(verb) {
    // Update header
    updateVerbHeader(verb);

    // Get current mood and tense
    const moodDropdown = GQUtils.getEl('mood-dropdown');
    const tenseDropdown = GQUtils.getEl('tense-dropdown');

    const mood = moodDropdown ? moodDropdown.value : 'indicative';
    const tense = tenseDropdown ? tenseDropdown.value : 'present';

    // Display conjugations
    displayConjugationsForMoodAndTense(verb, mood, tense);

    // Update notes
    updateVerbNotes(verb, mood, tense);
}




/**
 * Display an error message to the user
 * @param {string} message - The error message
 */
function showErrorMessage(message) {
    const verbDisplay = GQUtils.getEl('conjugation-display');
    if (verbDisplay) {
        GQUtils.setHTML(verbDisplay, `
            <div class="placeholder-message">
                <p>${message}. Please try refreshing the page.</p>
                <div class="cyber-decoration">
                    <div class="deco-line"></div>
                    <div class="deco-circle"></div>
                    <div class="deco-line"></div>
                </div>
            </div>
        `);
    }

    // Show notification if available
    if (GQUI && GQUI.showNotification) {
        GQUI.showNotification(message, 'error');
    }
}


/**
 * Enhanced update verb display function
 * Gets current mood and tense, and displays the appropriate conjugations
 */
function updateVerbDisplay() {
    const verbList = GQUtils.getEl('verb-list');
    const activeVerb = verbList ? verbList.querySelector('.active') : null;

    if (activeVerb) {
        const verbId = activeVerb.dataset.verbId;

        // Get the current mood and tense
        const moodDropdown = GQUtils.getEl('mood-dropdown');
        const tenseDropdown = GQUtils.getEl('tense-dropdown');

        const mood = moodDropdown ? moodDropdown.value : 'indicative';
        const tense = tenseDropdown ? tenseDropdown.value : 'present';

        // Load the full verb data and update display
        VerbsData.loadVerb(verbId)
            .then(verb => {
                // Update header
                updateVerbHeader(verb);

                // Display conjugations with separate mood and tense parameters
                displayConjugationsForMoodAndTense(verb, mood, tense);

                // Update notes
                updateVerbNotes(verb, mood, tense);
            })
            .catch(error => {
                console.error('Error updating verb display:', error);
                showErrorMessage('Error updating verb display');
            });
    }
}


/**
 * Update the verb header with the selected verb
 * @param {Object} verb - The verb object
 */
function updateVerbHeader(verb) {
    const verbHeader = GQUtils.getEl('verb-header');
    if (!verbHeader) return;

    GQUtils.setHTML(verbHeader, `
        <h2>${verb.infinitive}</h2>
        <p class="verb-meaning">${verb.meaning} <span class="verb-type">(${verb.type})</span></p>
    `);
}

/**
 * Display conjugations for a specific mood and tense
 * @param {Object} verb - The verb object
 * @param {string} mood - The verb mood
 * @param {string} tense - The verb tense
 */
function displayConjugationsForMoodAndTense(verb, mood, tense) {
    const conjugationDisplay = GQUtils.getEl('conjugation-display');
    if (!conjugationDisplay) return;

    // Get the conjugations
    const conjugations = VerbsData.getConjugations(verb, mood, tense);

    if (!conjugations) {
        GQUtils.setHTML(conjugationDisplay, `
            <div class="placeholder-message">
                <p>No conjugation data available for ${VerbsData.getTenseName(mood, tense)}.</p>
                <div class="cyber-decoration">
                    <div class="deco-line"></div>
                    <div class="deco-circle"></div>
                    <div class="deco-line"></div>
                </div>
            </div>
        `);
        return;
    }

    // Create HTML for conjugations
    let html = '';

    // Singular section
    if (conjugations.singular) {
        html += `
            <div class="conjugation-section">
                <h3>Singular</h3>
                <div class="conjugation-list">
        `;

        // First person singular
        if (conjugations.singular.first) {
            html += createConjugationItem('I', conjugations.singular.first, verb);
        }

        // Second person singular
        if (conjugations.singular.second) {
            html += createConjugationItem('You', conjugations.singular.second, verb);
        }

        // Third person singular (he)
        if (conjugations.singular.thirdMasc) {
            html += createConjugationItem('He', conjugations.singular.thirdMasc, verb);
        }

        // Third person singular (she)
        if (conjugations.singular.thirdFem) {
            html += createConjugationItem('She', conjugations.singular.thirdFem, verb);
        }

        html += `
                </div>
            </div>
        `;
    }

    // Plural section
    if (conjugations.plural) {
        html += `
            <div class="conjugation-section">
                <h3>Plural</h3>
                <div class="conjugation-list">
        `;

        // First person plural
        if (conjugations.plural.first) {
            html += createConjugationItem('We', conjugations.plural.first, verb);
        }

        // Second person plural
        if (conjugations.plural.second) {
            html += createConjugationItem('You (pl)', conjugations.plural.second, verb);
        }

        // Third person plural
        if (conjugations.plural.third) {
            html += createConjugationItem('They', conjugations.plural.third, verb);
        }

        html += `
                </div>
            </div>
        `;
    }

    // Autonomous/Passive form if available
    if (conjugations.autonomous) {
        html += `
            <div class="conjugation-section">
                <h3>Autonomous</h3>
                <div class="conjugation-list">
                    ${createConjugationItem('One/People', conjugations.autonomous, verb)}
                </div>
            </div>
        `;
    }

    conjugationDisplay.innerHTML = html;
}

/**
 * Create HTML for a single conjugation item
 * @param {string} pronoun - The pronoun (I, You, etc.)
 * @param {string} conjugation - The conjugated form
 * @param {Object} verb - The verb object
 * @returns {string} HTML for the conjugation item
 */
function createConjugationItem(pronoun, conjugation, verb) {
    // Highlight root vs. ending if possible
    let displayForm = conjugation;

    // Extract root and ending based on verb type (basic implementation)
    if (verb.root && conjugation.includes(verb.root)) {
        const rootIndex = conjugation.indexOf(verb.root);
        const endingIndex = rootIndex + verb.root.length;

        const root = conjugation.substring(rootIndex, endingIndex);
        const ending = conjugation.substring(endingIndex);
        const prefix = conjugation.substring(0, rootIndex);

        displayForm = `${prefix}<span class="verb-root">${root}</span><span class="verb-ending">${ending}</span>`;
    }

    return `
        <div class="conjugation-item">
            <div class="pronoun">${pronoun}</div>
            <div class="conjugated-form">${displayForm}</div>
        </div>
    `;
}

/**
 * Update the notes section with verb-specific notes
 * @param {Object} verb - The verb object
 * @param {string} mood - The verb mood
 * @param {string} tense - The verb tense
 */
function updateVerbNotes(verb, mood, tense) {
    const notesContent = GQUtils.getEl('verb-notes-content');
    if (!notesContent) return;

    if (verb.notes) {
        GQUtils.setHTML(notesContent, `<p>${verb.notes}</p>`);
    } else {
        const tenseName = VerbsData.getTenseName(mood, tense);
        let genericNote = `<p>The verb <span class="note-highlight">${verb.infinitive}</span> (${verb.meaning}) `;

        // Customize note based on mood and tense
        if (mood === 'imperative') {
            genericNote += `is used in the imperative mood to give commands or instructions.`;
        } else if (mood === 'conditional') {
            genericNote += `is used in the conditional mood to express hypothetical situations.`;
        } else if (mood === 'habitual') {
            genericNote += `in the ${tenseName.toLowerCase()} form expresses actions that ${tense === 'present' ? 'are' : 'were'} habitual or recurring.`;
        } else {
            genericNote += `follows the standard conjugation pattern for ${verb.type} verbs in the ${tenseName.toLowerCase()}.`;
        }

        genericNote += `</p>`;

        GQUtils.setHTML(notesContent, genericNote);
    }
}

/**
 * Populate the verb list with verbs
 * @param {Array} verbs - Array of verb objects
 */
function populateVerbList(verbs) {
    const verbList = GQUtils.getEl('verb-list');

    // Exit if element not found
    if (!verbList) return;

    // Clear the list first
    verbList.innerHTML = '';

    // Add each verb to the list
    verbs.forEach(verb => {
        const li = GQUtils.createEl('li', {
            dataset: {
                verbId: verb.id,
                infinitive: verb.infinitive,
                meaning: verb.meaning
            },
            onclick: function() {
                selectVerb(this);
            }
        }, [
            GQUtils.createEl('span', { className: 'verb-irish' }, verb.infinitive),
            GQUtils.createEl('span', { className: 'verb-english' }, verb.meaning)
        ]);

        verbList.appendChild(li);
    });

    // Select the first verb by default
    if (verbs.length > 0 && verbList.firstChild) {
        selectVerb(verbList.firstChild);
    }
}

/**
 * Add cyber effects to elements
 */
function initCyberEffects() {
    // Add subtle pulse to header
    const verbHeader = GQUtils.getEl('verb-header');
    if (verbHeader) {
        GQUI.applyCyberEffects(verbHeader.querySelector('h2') || verbHeader, {
            textGlowColor: 'var(--gold)',
            pulseInterval: 5000
        });
    }

    // Add subtle animation to deco elements
    const decoCircle = document.querySelector('.deco-circle');
    if (decoCircle) {
        GQUI.applyCyberEffects(decoCircle, {
            glowColor: 'var(--cyber-blue)',
            pulseInterval: 3000
        });
    }

    // Add subtle effects to verb list items
    const verbItems = GQUtils.getEls('.verb-list li');
    if (verbItems.length > 0) {
        verbItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.borderColor = 'var(--cyber-blue)';
                item.style.transform = 'translateX(5px)';
            });

            item.addEventListener('mouseleave', () => {
                if (!item.classList.contains('active')) {
                    item.style.borderColor = 'transparent';
                    item.style.transform = '';
                }
            });
        });
    }
}
