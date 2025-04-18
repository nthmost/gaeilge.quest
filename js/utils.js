/**
 * @file utils.js
 * Core utility functions used across Gaeilge Quest
 */

const GQUtils = (function() {
    /**
     * Create an element with attributes and children
     * @param {string} tag - HTML tag name
     * @param {Object} attrs - Attributes to set on the element
     * @param {Array|string} children - Child elements or text content
     * @returns {HTMLElement} The created element
     */
    function createEl(tag, attrs = {}, children = []) {
        const el = document.createElement(tag);
        
        // Set attributes
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'className') {
                el.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.entries(value).forEach(([prop, val]) => {
                    el.style[prop] = val;
                });
            } else if (key.startsWith('on') && typeof value === 'function') {
                el.addEventListener(key.substring(2).toLowerCase(), value);
            } else if (key === 'dataset' && typeof value === 'object') {
                Object.entries(value).forEach(([dataKey, dataVal]) => {
                    el.dataset[dataKey] = dataVal;
                });
            } else {
                el.setAttribute(key, value);
            }
        });
        
        // Add children
        if (Array.isArray(children)) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    el.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    el.appendChild(child);
                }
            });
        } else if (typeof children === 'string') {
            el.textContent = children;
        } else if (children instanceof Node) {
            el.appendChild(children);
        }
        
        return el;
    }
    
    /**
     * Helper to safely get an element by ID
     * @param {string} id - Element ID
     * @returns {HTMLElement|null} The element or null if not found
     */
    function getEl(id) {
        return document.getElementById(id);
    }
    
    /**
     * Get all elements matching a selector
     * @param {string} selector - CSS selector
     * @param {HTMLElement} parent - Parent element (defaults to document)
     * @returns {NodeList} List of matching elements
     */
    function getEls(selector, parent = document) {
        return parent.querySelectorAll(selector);
    }
    
    /**
     * Add a class to an element
     * @param {HTMLElement} el - The element
     * @param {string} className - Class to add
     */
    function addClass(el, className) {
        if (el) el.classList.add(className);
    }
    
    /**
     * Remove a class from an element
     * @param {HTMLElement} el - The element
     * @param {string} className - Class to remove
     */
    function removeClass(el, className) {
        if (el) el.classList.remove(className);
    }
    
    /**
     * Toggle a class on an element
     * @param {HTMLElement} el - The element
     * @param {string} className - Class to toggle
     * @param {boolean} force - If set, adds or removes regardless of current state
     */
    function toggleClass(el, className, force) {
        if (el) el.classList.toggle(className, force);
    }
    
    /**
     * Set HTML content safely
     * @param {HTMLElement} el - Element to update
     * @param {string} html - HTML content
     */
    function setHTML(el, html) {
        if (el) el.innerHTML = html;
    }
    
    /**
     * Set text content
     * @param {HTMLElement} el - Element to update
     * @param {string} text - Text content
     */
    function setText(el, text) {
        if (el) el.textContent = text;
    }
    
    /**
     * Debounce a function call
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    function debounce(func, wait = 300) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    /**
     * Check if a variable is defined and not null
     * @param {*} value - The value to check
     * @returns {boolean} True if the value is defined and not null
     */
    function isDefined(value) {
        return typeof value !== 'undefined' && value !== null;
    }
    
    /**
     * Format a string with placeholders
     * @param {string} str - String with {placeholders}
     * @param {Object} args - Values to replace placeholders
     * @returns {string} Formatted string
     */
    function formatString(str, args) {
        return str.replace(/{(\w+)}/g, (match, key) => {
            return isDefined(args[key]) ? args[key] : match;
        });
    }
    
    /**
     * Generate a random ID
     * @param {string} prefix - Prefix for the ID
     * @returns {string} Random ID
     */
    function generateId(prefix = 'gq-') {
        return `${prefix}${Math.random().toString(36).substring(2, 9)}`;
    }
    
    /**
     * Clone an object deeply
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    // Public API
    return {
        createEl,
        getEl,
        getEls,
        addClass,
        removeClass,
        toggleClass,
        setHTML,
        setText,
        debounce,
        isDefined,
        formatString,
        generateId,
        deepClone
    };
})();
