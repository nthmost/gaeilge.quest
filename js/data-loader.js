/**
 * @file data-loader.js
 * Data loading and processing utilities for Gaeilge Quest
 */

const GQData = (function() {
    // Cache for loaded data
    const dataCache = {};
    
    /**
     * Load data from YAML file
     * @param {string} url - URL to YAML file
     * @param {boolean} useCache - Whether to use cached data if available
     * @returns {Promise<Object>} Parsed data
     */
    async function loadYAML(url, useCache = true) {
        // Return cached data if available and requested
        if (useCache && dataCache[url]) {
            return Promise.resolve(dataCache[url]);
        }
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
            }
            
            const yamlText = await response.text();
            
            // Check if js-yaml is available
            if (typeof jsyaml === 'undefined') {
                throw new Error('js-yaml library not loaded. Include it in your HTML.');
            }
            
            // Parse YAML
            const data = jsyaml.load(yamlText);
            
            // Cache the data
            dataCache[url] = data;
            
            return data;
        } catch (error) {
            console.error('Error loading YAML:', error);
            throw error;
        }
    }
    
    /**
     * Load data from JSON file
     * @param {string} url - URL to JSON file
     * @param {boolean} useCache - Whether to use cached data if available
     * @returns {Promise<Object>} Parsed data
     */
    async function loadJSON(url, useCache = true) {
        // Return cached data if available and requested
        if (useCache && dataCache[url]) {
            return Promise.resolve(dataCache[url]);
        }
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache the data
            dataCache[url] = data;
            
            return data;
        } catch (error) {
            console.error('Error loading JSON:', error);
            throw error;
        }
    }
    
    /**
     * Load data based on file extension
     * @param {string} url - URL to data file
     * @param {boolean} useCache - Whether to use cached data if available
     * @returns {Promise<Object>} Parsed data
     */
    async function loadData(url, useCache = true) {
        const extension = url.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'yaml':
            case 'yml':
                return loadYAML(url, useCache);
            case 'json':
                return loadJSON(url, useCache);
            default:
                throw new Error(`Unsupported file extension: ${extension}`);
        }
    }
    
    /**
     * Get data from cache
     * @param {string} key - Cache key (URL)
     * @returns {Object|null} Cached data or null if not found
     */
    function getCachedData(key) {
        return dataCache[key] || null;
    }
    
    /**
     * Clear data cache
     * @param {string} key - Optional key to clear specific cache entry
     */
    function clearCache(key) {
        if (key) {
            delete dataCache[key];
        } else {
            Object.keys(dataCache).forEach(k => delete dataCache[k]);
        }
    }
    
    /**
     * Filter data by search term
     * @param {Array} items - Array of objects to filter
     * @param {string} searchTerm - Search term
     * @param {Array} fields - Fields to search in
     * @returns {Array} Filtered items
     */
    function filterBySearchTerm(items, searchTerm, fields) {
        if (!searchTerm || !items || !Array.isArray(items)) {
            return items;
        }
        
        const term = searchTerm.toLowerCase().trim();
        
        if (!term) {
            return items;
        }
        
        return items.filter(item => {
            return fields.some(field => {
                const value = item[field];
                
                if (!value) {
                    return false;
                }
                
                return String(value).toLowerCase().includes(term);
            });
        });
    }
    
    /**
     * Sort data by field
     * @param {Array} items - Array of objects to sort
     * @param {string} field - Field to sort by
     * @param {boolean} ascending - Sort direction
     * @returns {Array} Sorted items
     */
    function sortByField(items, field, ascending = true) {
        if (!items || !Array.isArray(items)) {
            return items;
        }
        
        return [...items].sort((a, b) => {
            const valA = a[field];
            const valB = b[field];
            
            if (valA < valB) {
                return ascending ? -1 : 1;
            }
            
            if (valA > valB) {
                return ascending ? 1 : -1;
            }
            
            return 0;
        });
    }
    
    /**
     * Group data by field
     * @param {Array} items - Array of objects to group
     * @param {string} field - Field to group by
     * @returns {Object} Grouped items
     */
    function groupByField(items, field) {
        if (!items || !Array.isArray(items)) {
            return {};
        }
        
        return items.reduce((groups, item) => {
            const key = item[field];
            
            if (!groups[key]) {
                groups[key] = [];
            }
            
            groups[key].push(item);
            
            return groups;
        }, {});
    }
    
    // Public API
    return {
        loadYAML,
        loadJSON,
        loadData,
        getCachedData,
        clearCache,
        filterBySearchTerm,
        sortByField,
        groupByField
    };
})();
