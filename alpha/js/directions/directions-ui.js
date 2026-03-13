/**
 * @file directions-ui.js
 * UI interaction for the Irish directions learning page
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const categoryButtons = document.querySelectorAll('.category-btn');
    const levelButtons = document.querySelectorAll('.level-btn');
    const activityArea = document.getElementById('activity-area');
    const feedbackMessage = document.getElementById('feedback-message');
    const progressFill = document.getElementById('progress-fill');
    const progressCount = document.getElementById('progress-count');
    const modal = document.getElementById('explanation-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalContinue = document.getElementById('modal-continue');
    const closeButton = document.querySelector('.close-button');
    const categoryStatusValue = document.getElementById('category-status-value');
    const levelStatusValue = document.getElementById('level-status-value');
    const startActivityBtn = document.getElementById('start-activity');

    // State
    let currentCategory = null;
    let currentLevel = null;
    let currentScenarioIndex = 0;
    let scenarios = [];
    let completedScenarios = 0;
    let userSelections = {};

    // Initialize
    function init() {
        attachEventListeners();
        // Add some cyberpunk effects
        addCyberEffects();
    }

    // Event listeners
    function attachEventListeners() {
        // Category selection
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.dataset.category;
                selectCategory(category);
                updateSelectionStatus();
            });
        });

        // Level selection
        levelButtons.forEach(button => {
            button.addEventListener('click', function() {
                const level = this.dataset.level;
                selectLevel(level);
                updateSelectionStatus();
            });
        });

        // Start activity button
        startActivityBtn.addEventListener('click', function() {
            if (currentCategory && currentLevel) {
                loadScenarios();
            }
        });

        // Modal
        closeButton.addEventListener('click', closeModal);
        modalContinue.addEventListener('click', closeModal);

        // Close modal when clicking outside of it
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }

    // Update selection status display
    function updateSelectionStatus() {
        // Update category status
        if (currentCategory) {
            const categoryText = document.querySelector(`.category-btn[data-category="${currentCategory}"]`).querySelector('.btn-text').textContent;
            categoryStatusValue.textContent = categoryText;
            categoryStatusValue.classList.add('selected');
        } else {
            categoryStatusValue.textContent = 'Not selected';
            categoryStatusValue.classList.remove('selected');
        }

        // Update level status
        if (currentLevel) {
            const levelText = document.querySelector(`.level-btn[data-level="${currentLevel}"]`).querySelector('.btn-text').textContent;
            levelStatusValue.textContent = levelText;
            levelStatusValue.classList.add('selected');
        } else {
            levelStatusValue.textContent = 'Not selected';
            levelStatusValue.classList.remove('selected');
        }

        // Update start button state
        if (currentCategory && currentLevel) {
            startActivityBtn.classList.remove('disabled');
            startActivityBtn.classList.add('ready');
        } else {
            startActivityBtn.classList.add('disabled');
            startActivityBtn.classList.remove('ready');
        }
    }

    // Cyberpunk visual effects
    function addCyberEffects() {
        // Randomly add glow effect to direction cards
        const directionCards = document.querySelectorAll('.direction-card');
        setInterval(() => {
            const randomIndex = Math.floor(Math.random() * directionCards.length);
            const card = directionCards[randomIndex];

            if (card) {
                card.style.boxShadow = '0 0 10px var(--cyber-blue)';
                card.style.borderColor = 'var(--cyber-blue)';

                setTimeout(() => {
                    card.style.boxShadow = '';
                    card.style.borderColor = 'var(--copper)';
                }, 1000);
            }
        }, 3000);

        // Add pulse effect to selection buttons
        const buttons = document.querySelectorAll('.category-btn, .level-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.querySelector('.btn-deco').style.background = 'linear-gradient(90deg, transparent, var(--cyber-blue))';
            });

            button.addEventListener('mouseleave', function() {
                if (!this.classList.contains('selected')) {
                    this.querySelector('.btn-deco').style.background = 'linear-gradient(90deg, transparent, rgba(184, 115, 51, 0.2))';
                }
            });
        });
    }

    // Select category
    function selectCategory(category) {
        // Clear previous selection
        categoryButtons.forEach(btn => btn.classList.remove('selected'));

        // Set new selection
        const selectedButton = document.querySelector(`.category-btn[data-category="${category}"]`);
        if (selectedButton) {
            selectedButton.classList.add('selected');
            currentCategory = category;

            // Reset scenario index
            currentScenarioIndex = 0;
            completedScenarios = 0;
        }
    }

    // Select level
    function selectLevel(level) {
        // Clear previous selection
        levelButtons.forEach(btn => btn.classList.remove('selected'));

        // Set new selection
        const selectedButton = document.querySelector(`.level-btn[data-level="${level}"]`);
        if (selectedButton) {
            selectedButton.classList.add('selected');
            currentLevel = level;

            // Reset scenario index
            currentScenarioIndex = 0;
            completedScenarios = 0;
        }
    }

    // Load scenarios for current category and level
    function loadScenarios() {
        scenarios = DirectionsData.getScenario(currentCategory, currentLevel);

        if (scenarios && scenarios.length > 0) {
            // Hide the start button during activities
            startActivityBtn.style.display = 'none';

            loadCurrentScenario();
            updateProgressTracker();
        } else {
            // Handle case where no scenarios exist
            activityArea.innerHTML = `
                <div class="no-scenarios">
                    <p>No scenarios available for this category and level yet. Please try another combination.</p>
                    <button class="cyber-btn back-btn">Go Back</button>
                </div>
            `;

            // Attach event listener to back button
            const backBtn = document.querySelector('.back-btn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    resetSelections();
                });
            }
        }
    }

    // Reset selections
    function resetSelections() {
        // Clear selections
        categoryButtons.forEach(btn => btn.classList.remove('selected'));
        levelButtons.forEach(btn => btn.classList.remove('selected'));

        // Reset state
        currentCategory = null;
        currentLevel = null;
        currentScenarioIndex = 0;
        completedScenarios = 0;

        // Update UI
        updateSelectionStatus();

        // Show placeholder
        activityArea.innerHTML = `
            <div class="activity-placeholder">
                <p>Select a category and level above to begin practicing!</p>
                <div class="cyber-decoration">
                    <div class="deco-line"></div>
                    <div class="deco-circle"></div>
                    <div class="deco-line"></div>
                </div>
            </div>
        `;

        // Show start button again
        startActivityBtn.style.display = 'block';

        // Reset progress
        updateProgressTracker();
    }

    // Load the current scenario
    function loadCurrentScenario() {
        if (!scenarios || currentScenarioIndex >= scenarios.length) {
            showCompletionMessage();
            return;
        }

        const scenario = scenarios[currentScenarioIndex];
        userSelections = {}; // Reset user selections for new scenario

        // Create the scenario HTML
        const scenarioHtml = createScenarioHtml(scenario);
        activityArea.innerHTML = scenarioHtml;

        // Attach event listeners to word slots and check answer button
        attachScenarioEventListeners(scenario);
    }

    // Create HTML for a scenario
    function createScenarioHtml(scenario) {
        // Create exercises HTML
        let exercisesHtml = '';
        scenario.exercises.forEach((exercise, index) => {
            // Split the sentence around blanks
            const sentenceParts = exercise.sentence.split('____');

            // Build the exercise HTML with blanks
            let exerciseHtml = `
                <div class="exercise-sentence">
            `;

            // Add sentence parts with blanks between them
            sentenceParts.forEach((part, i) => {
                exerciseHtml += `<span>${part}</span>`;

                // Add blank if not the last part
                if (i < sentenceParts.length - 1) {
                    const blank = exercise.blanks[i];
                    exerciseHtml += `
                        <span class="word-slot" data-blank-id="${blank.id}" data-exercise-index="${index}" data-blank-index="${i}">
                            Roghnaigh focal...
                            <div class="word-selector">
                                ${blank.options.map(option => `
                                    <div class="word-option" data-word="${option}">${option}</div>
                                `).join('')}
                            </div>
                        </span>
                    `;
                }
            });

            exerciseHtml += `
                </div>
                <div class="exercise-translation">${exercise.translation}</div>
            `;

            exercisesHtml += exerciseHtml;
        });

        // Build the full scenario HTML
        return `
            <div class="scenario" style="display: block;">
                <div class="scenario-image-container">
                    <img src="${scenario.image}" alt="${scenario.title}" class="scenario-image">
                </div>
                <h3>${scenario.title}</h3>
                <div class="scenario-description">${scenario.description}</div>
                <div class="scenario-exercise">
                    ${exercisesHtml}
                    <button class="check-answer-btn">Seiceáil mo fhreagra</button>
                </div>
            </div>
        `;
    }

    // Attach event listeners to elements in the scenario
    function attachScenarioEventListeners(scenario) {
        // Word slot click events
        const wordSlots = document.querySelectorAll('.word-slot');
        wordSlots.forEach(slot => {
            slot.addEventListener('click', function() {
                // Hide any other open selectors
                document.querySelectorAll('.word-selector').forEach(selector => {
                    selector.style.display = 'none';
                });

                // Show this selector
                const selector = this.querySelector('.word-selector');
                selector.style.display = 'block';
            });
        });

        // Word option click events
        const wordOptions = document.querySelectorAll('.word-option');
        wordOptions.forEach(option => {
            option.addEventListener('click', function() {
                const word = this.dataset.word;
                const slot = this.closest('.word-slot');
                const blankId = slot.dataset.blankId;
                const exerciseIndex = slot.dataset.exerciseIndex;
                const blankIndex = slot.dataset.blankIndex;

                // Update the slot text
                slot.textContent = word;

                // Store the selection
                if (!userSelections[exerciseIndex]) {
                    userSelections[exerciseIndex] = {};
                }
                userSelections[exerciseIndex][blankIndex] = word;

                // Re-append the selector (it was removed when updating textContent)
                const selector = this.closest('.word-selector').cloneNode(true);
                slot.appendChild(selector);
                selector.style.display = 'none';

                // Re-attach event listeners to selector options
                attachWordOptionListeners(selector);
            });
        });

        // Check answer button
        const checkButton = document.querySelector('.check-answer-btn');
        if (checkButton) {
            checkButton.addEventListener('click', function() {
                checkAnswers(scenario);
            });
        }
    }

    // Re-attach event listeners to word options after DOM updates
    function attachWordOptionListeners(selector) {
        const options = selector.querySelectorAll('.word-option');
        options.forEach(option => {
            option.addEventListener('click', function() {
                const word = this.dataset.word;
                const slot = this.closest('.word-slot');
                const blankId = slot.dataset.blankId;
                const exerciseIndex = slot.dataset.exerciseIndex;
                const blankIndex = slot.dataset.blankIndex;

                // Update the slot text
                slot.textContent = word;

                // Store the selection
                if (!userSelections[exerciseIndex]) {
                    userSelections[exerciseIndex] = {};
                }
                userSelections[exerciseIndex][blankIndex] = word;

                // Re-append the selector
                slot.appendChild(selector);
                selector.style.display = 'none';

                // Re-attach event listeners
                attachWordOptionListeners(selector);
            });
        });
    }

    // Check user answers against correct answers
    function checkAnswers(scenario) {
        let allCorrect = true;
        let incorrectBlanks = [];

        // Check each exercise
        scenario.exercises.forEach((exercise, exerciseIndex) => {
            // Check each blank in the exercise
            exercise.blanks.forEach((blank, blankIndex) => {
                const userAnswer = userSelections[exerciseIndex] ? userSelections[exerciseIndex][blankIndex] : null;

                // If blank wasn't answered or is incorrect
                if (!userAnswer || userAnswer !== blank.correct) {
                    allCorrect = false;
                    incorrectBlanks.push({
                        exerciseIndex,
                        blankIndex,
                        blankId: blank.id,
                        correctAnswer: blank.correct,
                        explanation: blank.explanation
                    });
                }
            });
        });

        if (allCorrect) {
            // All answers correct
            showSuccess();
            completedScenarios++;
            updateProgressTracker();

            // Show modal with explanations
            setTimeout(() => {
                showExplanationModal(scenario);
            }, 1500);
        } else {
            // Some answers incorrect
            showIncorrect(incorrectBlanks);
        }
    }

    // Show success message
    function showSuccess() {
        feedbackMessage.textContent = 'Maith thú! Tá na freagraí ar fad ceart. (Well done! All answers are correct.)';
        feedbackMessage.className = 'feedback-message correct';

        // Highlight word slots as correct
        const wordSlots = document.querySelectorAll('.word-slot');
        wordSlots.forEach(slot => {
            slot.style.borderColor = 'var(--cyber-blue)';
            slot.style.backgroundColor = 'rgba(0, 242, 255, 0.1)';
            // Add animation
            slot.style.animation = 'pulse-success 2s infinite';
        });

        // Disable check button
        const checkButton = document.querySelector('.check-answer-btn');
        if (checkButton) {
            checkButton.disabled = true;
            checkButton.textContent = 'Tá sé seiceáilte agat! (You\'ve checked it!)';
        }

        // Show next button if there are more scenarios
        if (currentScenarioIndex < scenarios.length - 1) {
            const scenarioExercise = document.querySelector('.scenario-exercise');
            const nextButton = document.createElement('button');
            nextButton.className = 'check-answer-btn';
            nextButton.textContent = 'Ar aghaidh go dtí an ceann eile (Next scenario)';
            nextButton.style.marginLeft = '10px';
            nextButton.addEventListener('click', () => {
                currentScenarioIndex++;
                loadCurrentScenario();
            });
            scenarioExercise.appendChild(nextButton);
        } else {
            // Show completion button if all scenarios are done
            const scenarioExercise = document.querySelector('.scenario-exercise');
            const completeButton = document.createElement('button');
            completeButton.className = 'check-answer-btn';
            completeButton.textContent = 'Críochnaithe! (Completed!)';
            completeButton.style.marginLeft = '10px';
            completeButton.addEventListener('click', () => {
                showCompletionMessage();
            });
            scenarioExercise.appendChild(completeButton);
        }
    }

    // Show incorrect feedback
    function showIncorrect(incorrectBlanks) {
        feedbackMessage.textContent = 'Níl na freagraí ar fad ceart. Bain triail eile as! (Not all answers are correct. Try again!)';
        feedbackMessage.className = 'feedback-message incorrect';

        // Highlight incorrect word slots
        incorrectBlanks.forEach(incorrect => {
            const slot = document.querySelector(`.word-slot[data-blank-id="${incorrect.blankId}"]`);
            if (slot) {
                slot.style.borderColor = 'rgba(255, 80, 80, 0.8)';
                slot.style.backgroundColor = 'rgba(255, 80, 80, 0.1)';

                // Add shake animation
                slot.classList.add('shake');
                setTimeout(() => {
                    slot.classList.remove('shake');
                }, 500);
            }
        });
    }

    // Show explanation modal
    function showExplanationModal(scenario) {
        modalTitle.textContent = 'Míniúchán ar na Freagraí (Explanation of Answers)';

        let content = '<div class="explanations">';

        // Add each explanation
        scenario.exercises.forEach((exercise, exerciseIndex) => {
            exercise.blanks.forEach((blank, blankIndex) => {
                const userAnswer = userSelections[exerciseIndex][blankIndex];

                content += `
                    <div class="explanation-item">
                        <div class="explanation-title">
                            <span class="word-highlight">${blank.correct}</span>
                        </div>
                        <div class="explanation-text">
                            ${blank.explanation}
                        </div>
                    </div>
                `;
            });
        });

        content += '</div>';
        modalContent.innerHTML = content;

        // Update continue button text
        if (currentScenarioIndex < scenarios.length - 1) {
            modalContinue.textContent = 'Ar aghaidh go dtí an ceann eile (Continue to next)';
            modalContinue.onclick = function() {
                closeModal();
                currentScenarioIndex++;
                loadCurrentScenario();
            };
        } else {
            modalContinue.textContent = 'Críochnaithe! (Completed!)';
            modalContinue.onclick = function() {
                closeModal();
                showCompletionMessage();
            };
        }

        // Show modal
        modal.style.display = 'flex';
    }

    // Close modal
    function closeModal() {
        modal.style.display = 'none';
    }

    // Show completion message
    function showCompletionMessage() {
        activityArea.innerHTML = `
            <div class="completion-message">
                <h2>Comhghairdeas! (Congratulations!)</h2>
                <p>Tá na cleachtaí ar fad déanta agat don leibhéal seo!</p>
                <p>You have completed all exercises for this level!</p>

                <div class="cyber-decoration">
                    <div class="deco-line"></div>
                    <div class="deco-circle"></div>
                    <div class="deco-line"></div>
                </div>

                <div class="completion-actions">
                    <button class="cyber-btn restart-btn">Déan arís é (Do it again)</button>
                    <button class="cyber-btn new-selection-btn">Roghnaigh cineál nua (New selection)</button>
                </div>
            </div>
        `;

        // Attach event listeners to completion buttons
        const restartBtn = document.querySelector('.restart-btn');
        const newSelectionBtn = document.querySelector('.new-selection-btn');

        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                currentScenarioIndex = 0;
                completedScenarios = 0;
                loadScenarios();
            });
        }

        if (newSelectionBtn) {
            newSelectionBtn.addEventListener('click', () => {
                resetSelections();
            });
        }
    }

    // Update progress tracker
    function updateProgressTracker() {
        if (scenarios && scenarios.length > 0) {
            const percentage = (completedScenarios / scenarios.length) * 100;
            progressFill.style.width = `${percentage}%`;
            progressCount.textContent = `${completedScenarios}/${scenarios.length}`;
        } else {
            progressFill.style.width = '0%';
            progressCount.textContent = '0/0';
        }
    }

    // Document click handler to close open selectors
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.word-slot')) {
            document.querySelectorAll('.word-selector').forEach(selector => {
                selector.style.display = 'none';
            });
        }
    });

    // Initialize
    init();
});
