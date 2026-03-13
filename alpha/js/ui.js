/**
 * @file ui.js
 * User interface utilities for Gaeilge Quest
 */

const GQUI = (function() {
    // Configuration
    const config = {
        // How often to run random cyber effects (ms)
        cyberEffectInterval: 5000,
        // Duration of cyber effects (ms)
        cyberEffectDuration: 200
    };

    // Track initialized elements to avoid duplicating effects
    const initialized = new Set();

    /**
     * Initialize global UI elements and interactions
     */
    function initializeGlobalUI() {
        // Skip if already initialized
        if (initialized.has('global')) return;
        initialized.add('global');

        // Mobile navigation toggle
        const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
        if (mobileNavToggle) {
            mobileNavToggle.addEventListener('click', toggleMobileNav);
        }

        // Add hover effects to navigation links
        const navLinks = document.querySelectorAll('nav ul li a');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                // Add subtle glow effect on hover
                link.style.textShadow = '0 0 8px var(--cyber-blue)';
            });
            
            link.addEventListener('mouseleave', () => {
                // Reset on mouse leave
                link.style.textShadow = '';
            });
        });

        // Initialize scroll effects
        initScrollEffects();
    }

    /**
     * Toggle mobile navigation menu
     */
    function toggleMobileNav() {
        const nav = document.querySelector('nav ul');
        if (nav) {
            nav.classList.toggle('mobile-active');
        }
    }

    /**
     * Add scroll-triggered effects
     */
    function initScrollEffects() {
        // Elements that should animate on scroll
        const animElements = document.querySelectorAll('.scroll-anim');
        
        if (animElements.length === 0) return;
        
        // Observer callback
        const onScroll = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scroll-anim-visible');
                    // Optionally stop observing after animation
                    // observer.unobserve(entry.target);
                }
            });
        };
        
        // Create observer
        const scrollObserver = new IntersectionObserver(onScroll, {
            root: null,
            threshold: 0.15,
            rootMargin: '0px'
        });
        
        // Observe all elements
        animElements.forEach(el => {
            scrollObserver.observe(el);
        });
    }

    /**
     * Apply cyber effects to elements
     * @param {NodeList|Array|HTMLElement} elements - Elements to apply effects to
     * @param {Object} options - Effect options
     */
    function applyCyberEffects(elements, options = {}) {
        // Normalize to array
        const elems = elements instanceof NodeList || Array.isArray(elements) 
            ? Array.from(elements) 
            : [elements];

        // Default options
        const opts = Object.assign({
            glowColor: 'var(--cyber-blue)',
            textGlowColor: 'var(--cyber-purple)',
            pulseInterval: config.cyberEffectInterval,
            glowDuration: config.cyberEffectDuration
        }, options);
        
        // Apply to each element
        elems.forEach(el => {
            if (!el || initialized.has(el)) return;
            initialized.add(el);
            
            // Store original styles
            const originalBoxShadow = el.style.boxShadow;
            const originalTextShadow = el.style.textShadow;
            
            // Set up random interval to add effects
            setInterval(() => {
                // Apply glow effect
                el.style.boxShadow = `0 0 15px ${opts.glowColor}`;
                el.style.textShadow = `0 0 5px ${opts.textGlowColor}`;
                
                // Reset after duration
                setTimeout(() => {
                    el.style.boxShadow = originalBoxShadow;
                    el.style.textShadow = originalTextShadow;
                }, opts.glowDuration);
            }, opts.pulseInterval + Math.random() * 2000); // Add randomness
        });
    }

    /**
     * Create a cyber-styled button
     * @param {string} text - Button text
     * @param {Function} onClick - Click handler
     * @param {Object} options - Button options
     * @returns {HTMLElement} The button element
     */
    function createCyberButton(text, onClick, options = {}) {
        const btn = GQUtils.createEl('button', {
            className: `cyber-button ${options.className || ''}`,
            onclick: onClick
        }, text);
        
        // Apply cyber styling
        if (options.applyEffects !== false) {
            applyCyberEffects(btn, {
                pulseInterval: options.pulseInterval || 7000
            });
        }
        
        return btn;
    }
    
    /**
     * Create a dropdown with cyber styling
     * @param {string} id - Dropdown ID
     * @param {Array} options - Array of {value, text} objects
     * @param {Function} onChange - Change handler
     * @param {Object} attrs - Additional attributes
     * @returns {HTMLElement} Select element
     */
    function createCyberDropdown(id, options, onChange, attrs = {}) {
        // Create options elements
        const optElements = options.map(opt => {
            return GQUtils.createEl('option', {
                value: opt.value,
                selected: opt.selected
            }, opt.text);
        });
        
        // Create select element
        const select = GQUtils.createEl('select', {
            id,
            className: `cyber-dropdown ${attrs.className || ''}`,
            onchange: onChange,
            ...attrs
        }, optElements);
        
        return select;
    }
    
    /**
     * Show a notification toast
     * @param {string} message - Message to display
     * @param {string} type - Notification type (success, error, info)
     * @param {number} duration - Duration in ms
     */
    function showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = GQUtils.createEl('div', {
            className: `notification notification-${type}`
        }, [
            GQUtils.createEl('div', { className: 'notification-content' }, message),
            GQUtils.createEl('button', { 
                className: 'notification-close',
                onclick: () => notification.remove()
            }, '×')
        ]);
        
        // Add to document
        document.body.appendChild(notification);
        
        // Add entering animation class
        setTimeout(() => {
            notification.classList.add('notification-visible');
        }, 10);
        
        // Auto-remove after duration
        setTimeout(() => {
            notification.classList.remove('notification-visible');
            setTimeout(() => notification.remove(), 300);
        }, duration);
        
        return notification;
    }
    
    /**
     * Initialize a tooltip on an element
     * @param {HTMLElement} element - Element to add tooltip to
     * @param {string} text - Tooltip text
     * @param {Object} options - Tooltip options
     */
    function initTooltip(element, text, options = {}) {
        const opts = Object.assign({
            position: 'top', // top, right, bottom, left
            className: '',
            delay: 300,
            duration: 0 // 0 = until mouseleave
        }, options);
        
        let tooltip = null;
        let timeout = null;
        
        function showTooltip() {
            // Create tooltip if not already exists
            if (!tooltip) {
                tooltip = GQUtils.createEl('div', {
                    className: `tooltip tooltip-${opts.position} ${opts.className}`
                }, text);
                document.body.appendChild(tooltip);
            }
            
            // Position tooltip relative to element
            const rect = element.getBoundingClientRect();
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            let left, top;
            
            switch (opts.position) {
                case 'top':
                    left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + scrollLeft;
                    top = rect.top - tooltip.offsetHeight - 10 + scrollTop;
                    break;
                case 'right':
                    left = rect.right + 10 + scrollLeft;
                    top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2 + scrollTop;
                    break;
                case 'bottom':
                    left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + scrollLeft;
                    top = rect.bottom + 10 + scrollTop;
                    break;
                case 'left':
                    left = rect.left - tooltip.offsetWidth - 10 + scrollLeft;
                    top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2 + scrollTop;
                    break;
            }
            
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
            
            // Show tooltip
            tooltip.classList.add('tooltip-visible');
            
            // Auto-hide if duration is set
            if (opts.duration > 0) {
                setTimeout(hideTooltip, opts.duration);
            }
        }
        
        function hideTooltip() {
            if (tooltip) {
                tooltip.classList.remove('tooltip-visible');
                setTimeout(() => {
                    if (tooltip) {
                        tooltip.remove();
                        tooltip = null;
                    }
                }, 300);
            }
        }
        
        // Add event listeners
        element.addEventListener('mouseenter', () => {
            timeout = setTimeout(showTooltip, opts.delay);
        });
        
        element.addEventListener('mouseleave', () => {
            clearTimeout(timeout);
            hideTooltip();
        });
    }
    
    // Public API
    return {
        initializeGlobalUI,
        toggleMobileNav,
        applyCyberEffects,
        createCyberButton,
        createCyberDropdown,
        showNotification,
        initTooltip
    };
})();
