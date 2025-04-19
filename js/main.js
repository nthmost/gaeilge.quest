// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize elements with cyber glitch effects
    initCyberEffects();

    // Add event listeners to activity cards
    initActivityInteractions();
});

// Function to initialize cyber glitch effects on certain elements
function initCyberEffects() {
    const siteTitle = document.querySelector('.site-title');
    const heroTitle = document.querySelector('.hero h1');

    // Subtle pulse effect for site title
    if (siteTitle) {
        setInterval(() => {
            if (Math.random() > 0.95) { // Random effect
                siteTitle.style.textShadow = `0 0 10px var(--cyber-blue),
                                             0 0 15px var(--cyber-blue)`;

                setTimeout(() => {
                    siteTitle.style.textShadow = '0 0 10px rgba(0, 242, 255, 0.3)';
                }, 150);
            }
        }, 3000);
    }

    // Subtle glow effect for hero title
    if (heroTitle) {
        setInterval(() => {
            heroTitle.style.textShadow = '0 0 20px rgba(255, 215, 0, 0.5)';

            setTimeout(() => {
                heroTitle.style.textShadow = '0 0 15px rgba(255, 215, 0, 0.3)';
            }, 800);
        }, 3000);
    }

    // Neon logo pulse effect
    const logo = document.querySelector('.logo img');
    if (logo) {
        setInterval(() => {
            logo.style.filter = 'drop-shadow(0 0 12px var(--cyber-blue))';

            setTimeout(() => {
                logo.style.filter = 'drop-shadow(0 0 8px var(--cyber-blue))';
            }, 1000);
        }, 4000);
    }

    // Celtic frame glow effects
    setInterval(() => {
        const activityFrames = document.querySelectorAll('.activity-frame');

        // Randomly select one frame to pulse
        if (activityFrames.length > 0) {
            const randomIndex = Math.floor(Math.random() * activityFrames.length);
            const randomFrame = activityFrames[randomIndex];

            randomFrame.style.boxShadow = '0 0 10px var(--cyber-blue), 0 0 15px rgba(0, 242, 255, 0.5)';

            setTimeout(() => {
                randomFrame.style.boxShadow = '0 0 5px var(--cyber-blue)';
            }, 500);
        }
    }, 2000);
}

// Function to initialize activity card interactions
function initActivityInteractions() {
    const activityCards = document.querySelectorAll('.activity-card');

    activityCards.forEach(card => {
        // Get the icon element in this card
        const icon = card.querySelector('.activity-icon');

        // Add subtle bounce effect on hover
        if (icon) {
            card.addEventListener('mouseenter', function() {
                icon.style.animation = 'bounce 0.5s ease';
                setTimeout(() => { icon.style.animation = ''; }, 500);
            });
        }

        // Handle directions card 'Coming Soon' functionality
        const exploreBtn = card.querySelector('a.activity-button');

        if (exploreBtn && exploreBtn.textContent === 'Coming Soon') {
            exploreBtn.addEventListener('click', function(e) {
                e.preventDefault();

                // Get the activity name
                const activityName = card.querySelector('h3').textContent;
                console.log(`${activityName} activity will be developed soon`);
                alert(`${activityName} activity coming soon!`);
            });
        }
    });
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return; // Skip if it's just "#"

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add a keyframe animation for the bounce effect
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(style);
