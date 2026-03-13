/**
 * @file verbs-data.js
 * Verb data handling for the Irish verb conjugation page
 */

const VerbsData = (function() {
    // Configuration
    const config = {
        verbsBasePath: '/data/verbs/',

        // Mood-tense mapping
        moodTenses: {
            indicative: ['present', 'past', 'future'],
            imperative: ['present'],
            conditional: ['present'],
            habitual: ['present', 'past']
        },

        tenseNames: {
            present: 'Present Tense',
            past: 'Past Tense',
            future: 'Future Tense',
            habitual_present: 'Present Habitual',
            habitual_past: 'Past Habitual'
        },

        moodNames: {
            indicative: 'Indicative',
            imperative: 'Imperative',
            conditional: 'Conditional',
            habitual: 'Habitual'
        }
    };

    const verbsCache = {};
    let verbListCache = null;

    function getTenseName(mood, tense) {
        if (mood === 'habitual') return config.tenseNames[`habitual_${tense}`] || tense;
        if (mood === 'conditional') return config.moodNames.conditional;
        return config.tenseNames[tense] || tense;
    }

    function getTensesForMood(mood) {
        return config.moodTenses[mood] || [];
    }

    function getMoodsForTense(tense) {
        return Object.entries(config.moodTenses)
            .filter(([_, tenses]) => tenses.includes(tense))
            .map(([mood]) => mood);
    }

    function getAllTenses() {
        const allTenses = new Set();
        Object.values(config.moodTenses).forEach(tenses => tenses.forEach(t => allTenses.add(t)));
        return Array.from(allTenses).map(t => ({ value: t, text: config.tenseNames[t] || t }));
    }

    function getConjugationKey(mood, tense) {
        if (mood === 'habitual') return `habitual_${tense}`;
        if (mood === 'conditional' || mood === 'imperative') return mood;
        return tense;
    }

    async function loadVerb(verbId) {
        if (verbsCache[verbId]) return verbsCache[verbId];
        try {
            const response = await fetch(`${config.verbsBasePath}${verbId}.yaml`);
            const yamlText = await response.text();
            const verb = jsyaml.load(yamlText);
            verbsCache[verbId] = verb;
            return verb;
        } catch (err) {
            console.error(`Error loading verb ${verbId}:`, err);
            throw err;
        }
    }

    async function loadVerbList() {
        if (verbListCache) return verbListCache;
        try {
            const response = await fetch(`${config.verbsBasePath}index.yaml`);
            const yamlText = await response.text();
            verbListCache = jsyaml.load(yamlText);
            return verbListCache;
        } catch (err) {
            console.error('Error loading verb list:', err);
            throw err;
        }
    }

    async function loadAllVerbs(forceRefresh = false) {
        const verbList = await loadVerbList();
        const verbPromises = verbList.map(meta => loadVerb(meta.id));
        return Promise.all(verbPromises);
    }

    async function getVerbByInfinitive(infinitive) {
        const verbList = await loadVerbList();
        const match = verbList.find(v => v.infinitive === infinitive);
        return match ? loadVerb(match.id) : null;
    }

    async function filterVerbs(searchTerm) {
        const verbList = await loadVerbList();
        if (!searchTerm) return verbList;
        const term = searchTerm.toLowerCase().trim();
        return verbList.filter(v =>
            v.infinitive.toLowerCase().includes(term) ||
            v.meaning.toLowerCase().includes(term)
        );
    }

    function getConjugations(verb, mood, tense) {
        if (!verb?.conjugations) return null;
        const key = getConjugationKey(mood, tense);
        return verb.conjugations[key] || null;
    }

    function getMoods() {
        return Object.keys(config.moodTenses).map(m => ({ value: m, text: config.moodNames[m] || m }));
    }

    function getTenses(mood) {
        return getTensesForMood(mood).map(t => ({ value: t, text: getTenseName(mood, t) }));
    }

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

