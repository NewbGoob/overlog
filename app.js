// ============================================
// CONFIGURATION - Edit these to customize
// ============================================

const CONFIG = {
    matchTypes: [
        {
            id: 'unranked',
            label: 'Unranked',
            key: '1',
            children: [
                { id: 'quickplay', label: 'Quick Play', key: 'q' },
                { id: '6v6-openqueue', label: '6V6 Open Queue', key: 'o' },
                { id: 'mystery-heroes', label: 'Mystery Heroes', key: 'm' }
            ]
        },
        {
            id: 'competitive',
            label: 'Competitive',
            key: '2',
            children: [
                { id: 'role-queue', label: 'Role Queue', key: 'r' },
                { id: 'open-queue', label: 'Open Queue', key: 'o' }
            ]
        },
        {
            id: 'stadium',
            label: 'Stadium',
            key: '3',
            children: [
                { id: 'quickplay', label: 'Quick Play', key: 'q' },
                { id: 'competitive', label: 'Competitive', key: 'c' }
            ]
        },
        {
            id: 'arcade',
            label: 'Arcade',
            key: '4',
            children: []
        }
    ],

    heroes: [
        // Tank
        { id: 'dva', name: 'D.Va', role: 'tank' },
        { id: 'doomfist', name: 'Doomfist', role: 'tank' },
        { id: 'junkerqueen', name: 'Junker Queen', role: 'tank' },
        { id: 'mauga', name: 'Mauga', role: 'tank' },
        { id: 'orisa', name: 'Orisa', role: 'tank' },
        { id: 'ramattra', name: 'Ramattra', role: 'tank' },
        { id: 'reinhardt', name: 'Reinhardt', role: 'tank' },
        { id: 'roadhog', name: 'Roadhog', role: 'tank' },
        { id: 'sigma', name: 'Sigma', role: 'tank' },
        { id: 'winston', name: 'Winston', role: 'tank' },
        { id: 'wreckingball', name: 'Wrecking Ball', role: 'tank' },
        { id: 'zarya', name: 'Zarya', role: 'tank' },

        // Damage
        { id: 'ashe', name: 'Ashe', role: 'damage' },
        { id: 'bastion', name: 'Bastion', role: 'damage' },
        { id: 'cassidy', name: 'Cassidy', role: 'damage' },
        { id: 'echo', name: 'Echo', role: 'damage' },
        { id: 'genji', name: 'Genji', role: 'damage' },
        { id: 'hanzo', name: 'Hanzo', role: 'damage' },
        { id: 'junkrat', name: 'Junkrat', role: 'damage' },
        { id: 'mei', name: 'Mei', role: 'damage' },
        { id: 'pharah', name: 'Pharah', role: 'damage' },
        { id: 'reaper', name: 'Reaper', role: 'damage' },
        { id: 'sojourn', name: 'Sojourn', role: 'damage' },
        { id: 'soldier76', name: 'Soldier: 76', role: 'damage' },
        { id: 'sombra', name: 'Sombra', role: 'damage' },
        { id: 'symmetra', name: 'Symmetra', role: 'damage' },
        { id: 'torbjorn', name: 'Torbjörn', role: 'damage' },
        { id: 'tracer', name: 'Tracer', role: 'damage' },
        { id: 'venture', name: 'Venture', role: 'damage' },
        { id: 'widowmaker', name: 'Widowmaker', role: 'damage' },

        // Support
        { id: 'ana', name: 'Ana', role: 'support' },
        { id: 'baptiste', name: 'Baptiste', role: 'support' },
        { id: 'brigitte', name: 'Brigitte', role: 'support' },
        { id: 'illari', name: 'Illari', role: 'support' },
        { id: 'juno', name: 'Juno', role: 'support' },
        { id: 'kiriko', name: 'Kiriko', role: 'support' },
        { id: 'lifeweaver', name: 'Lifeweaver', role: 'support' },
        { id: 'lucio', name: 'Lúcio', role: 'support' },
        { id: 'mercy', name: 'Mercy', role: 'support' },
        { id: 'moira', name: 'Moira', role: 'support' },
        { id: 'wuyang', name: 'Wuyang', role: 'support' },
        { id: 'zenyatta', name: 'Zenyatta', role: 'support' }
    ]
};

// State management
let state = {
    selectedParentType: null,
    selectedChildType: null,
    selectedResult: null,
    selectedHeroes: [],
    matches: [],
    sessionStartTime: null,
    recentHeroes: [], // Track 4 most recently used heroes
    // Keyboard navigation focus
    focusZone: null, // 'parent', 'child', 'hero-toggle', 'recent-heroes', 'heroes', 'clear-heroes', 'result', 'save', or null when defocused
    focusIndex: 0,
    lastHeroFocusIndex: 0, // Remember last focused hero when drawer was open
    lastFocusZone: 'parent', // Remember last zone for refocusing
    lastFocusIndex: 0 // Remember last index for refocusing
};

// Load data from localStorage on init
function loadData() {
    const savedMatches = localStorage.getItem('owMatches');
    if (savedMatches) {
        state.matches = JSON.parse(savedMatches);
    }

    const savedSession = localStorage.getItem('owSessionStart');
    if (savedSession) {
        const sessionDate = new Date(savedSession);
        const today = new Date();

        // Reset session if it's a new day
        if (sessionDate.toDateString() === today.toDateString()) {
            state.sessionStartTime = sessionDate;
        } else {
            state.sessionStartTime = new Date();
            localStorage.setItem('owSessionStart', state.sessionStartTime.toISOString());
        }
    } else {
        state.sessionStartTime = new Date();
        localStorage.setItem('owSessionStart', state.sessionStartTime.toISOString());
    }

    // Load recent heroes
    const savedRecentHeroes = localStorage.getItem('owRecentHeroes');
    if (savedRecentHeroes) {
        state.recentHeroes = JSON.parse(savedRecentHeroes);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('owMatches', JSON.stringify(state.matches));
}

// Initialize the app
function init() {
    loadData();
    renderMatchTypeButtons();
    renderHeroButtons();
    renderRecentHeroes();
    setupEventListeners();
    updateUI();
    updateStorageIndicator();
    checkExportReminder();

    // Ensure save button starts in neutral state (no result color classes)
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.classList.remove('win', 'loss', 'draw');

    // Don't set initial focus - start defocused
    // User can press WASD or spacebar to begin navigating
}

// Dynamically render match type buttons from config
function renderMatchTypeButtons() {
    const container = document.querySelector('.match-type-buttons');

    // Render parent type buttons
    container.innerHTML = `
        <div class="parent-types">
            ${CONFIG.matchTypes.map(type => `
                <button class="match-type-btn parent-type-btn" data-type="${type.id}" data-key="${type.key}">
                    <span class="key-hint">${type.key}</span>
                    ${type.label}
                </button>
            `).join('')}
        </div>
        <div class="child-types" id="childTypes" style="display: none;">
            <!-- Child buttons will be rendered here when parent is selected -->
        </div>
    `;
}

// Render child type buttons when parent is selected
function renderChildTypeButtons(parentId) {
    const childContainer = document.getElementById('childTypes');
    const parent = CONFIG.matchTypes.find(t => t.id === parentId);

    if (!parent || parent.children.length === 0) {
        childContainer.style.display = 'none';
        return;
    }

    childContainer.style.display = 'block';
    childContainer.innerHTML = `
        <div class="child-types-header">Select type:</div>
        <div class="child-type-buttons">
            ${parent.children.map(child => `
                <button class="match-type-btn child-type-btn" data-type="${child.id}">
                    ${child.label}
                </button>
            `).join('')}
        </div>
    `;
}

// Dynamically render hero buttons from config
function renderHeroButtons() {
    const container = document.getElementById('heroButtons');

    const herosByRole = {
        tank: CONFIG.heroes.filter(h => h.role === 'tank'),
        damage: CONFIG.heroes.filter(h => h.role === 'damage'),
        support: CONFIG.heroes.filter(h => h.role === 'support')
    };

    container.innerHTML = `
        <div class="hero-role-section">
            <h4>Tank</h4>
            <div class="hero-buttons">
                ${herosByRole.tank.map(hero => `
                    <button class="hero-btn" data-hero="${hero.id}">${hero.name}</button>
                `).join('')}
            </div>
        </div>
        <div class="hero-role-section">
            <h4>Damage</h4>
            <div class="hero-buttons">
                ${herosByRole.damage.map(hero => `
                    <button class="hero-btn" data-hero="${hero.id}">${hero.name}</button>
                `).join('')}
            </div>
        </div>
        <div class="hero-role-section">
            <h4>Support</h4>
            <div class="hero-buttons">
                ${herosByRole.support.map(hero => `
                    <button class="hero-btn" data-hero="${hero.id}">${hero.name}</button>
                `).join('')}
            </div>
        </div>
    `;
}

// Render recently used heroes
function renderRecentHeroes() {
    const container = document.getElementById('recentHeroesContainer');
    if (!container) return;

    if (state.recentHeroes.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    const recentHeroesButtons = document.getElementById('recentHeroesButtons');

    recentHeroesButtons.innerHTML = state.recentHeroes.map(heroId => {
        const hero = CONFIG.heroes.find(h => h.id === heroId);
        if (!hero) return '';

        const isSelected = state.selectedHeroes.includes(heroId);
        return `<button class="hero-btn recent-hero-btn ${isSelected ? 'active' : ''}" data-hero="${heroId}">${hero.name}</button>`;
    }).join('');

    // Re-attach event listeners after rendering
    setupRecentHeroListeners();
}

// Setup event listeners for recent hero buttons
function setupRecentHeroListeners() {
    const recentHeroesButtons = document.getElementById('recentHeroesButtons');
    if (!recentHeroesButtons) return;

    // Remove old listener if exists
    const newButtons = recentHeroesButtons.cloneNode(true);
    recentHeroesButtons.parentNode.replaceChild(newButtons, recentHeroesButtons);

    // Add new listener
    newButtons.addEventListener('click', (e) => {
        const btn = e.target.closest('.hero-btn');
        if (btn) toggleHero(btn.dataset.hero);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Match type buttons (delegated)
    document.querySelector('.match-type-buttons').addEventListener('click', (e) => {
        const btn = e.target.closest('.match-type-btn');
        if (!btn) return;

        if (btn.classList.contains('parent-type-btn')) {
            selectParentType(btn.dataset.type);
        } else if (btn.classList.contains('child-type-btn')) {
            selectChildType(btn.dataset.type);
        }
    });

    // Result buttons
    document.querySelectorAll('.result-btn').forEach(btn => {
        btn.addEventListener('click', () => selectResult(btn.dataset.result));
    });

    // Hero buttons (delegated)
    document.getElementById('heroButtons').addEventListener('click', (e) => {
        const btn = e.target.closest('.hero-btn');
        if (btn) toggleHero(btn.dataset.hero);
    });

    // Hero section toggle
    document.getElementById('heroSectionToggle').addEventListener('click', toggleHeroSection);

    // Clear heroes button
    document.getElementById('clearHeroesBtn').addEventListener('click', clearHeroes);

    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveMatch);

    // Export CSV button
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);

    // Export JSON button
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', exportToJSON);
    }

    // Import button
    const importBtn = document.getElementById('importBtn');
    if (importBtn) {
        importBtn.addEventListener('click', handleImportFile);
    }

    // Clear button
    document.getElementById('clearBtn').addEventListener('click', clearAllData);

    // Banner close buttons
    const closeStorageWarningBtn = document.getElementById('closeStorageWarning');
    if (closeStorageWarningBtn) {
        closeStorageWarningBtn.addEventListener('click', closeStorageWarning);
    }

    const closeExportReminderBtn = document.getElementById('closeExportReminder');
    if (closeExportReminderBtn) {
        closeExportReminderBtn.addEventListener('click', closeExportReminder);
    }

    // Quick export from reminder
    const quickExportBtn = document.getElementById('quickExportBtn');
    if (quickExportBtn) {
        quickExportBtn.addEventListener('click', () => {
            exportToJSON();
            closeExportReminder();
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

    // Click to focus - add listeners to all focusable elements
    document.addEventListener('click', handleClickFocus);
}

// Handle click to focus
function handleClickFocus(e) {
    // Check if clicked element is a focusable button
    const target = e.target.closest('button, .match-type-btn, .result-btn, .hero-btn, .save-btn, .undo-btn');

    if (!target) {
        // Clicked outside any focusable element - defocus
        state.focusZone = null;
        updateFocusVisuals();
        return;
    }

    // Determine what was clicked and set focus accordingly
    if (target.classList.contains('parent-type-btn')) {
        const parentButtons = Array.from(document.querySelectorAll('.parent-type-btn'));
        const index = parentButtons.indexOf(target);
        if (index >= 0) {
            state.focusZone = 'parent';
            state.focusIndex = index;
            updateFocusVisuals();
        }
    } else if (target.classList.contains('child-type-btn')) {
        const childButtons = Array.from(document.querySelectorAll('.child-type-btn'));
        const index = childButtons.indexOf(target);
        if (index >= 0) {
            state.focusZone = 'child';
            state.focusIndex = index;
            updateFocusVisuals();
        }
    } else if (target.classList.contains('recent-hero-btn')) {
        const recentButtons = Array.from(document.querySelectorAll('.recent-hero-btn'));
        const index = recentButtons.indexOf(target);
        if (index >= 0) {
            state.focusZone = 'recent-heroes';
            state.focusIndex = index;
            updateFocusVisuals();
        }
    } else if (target.id === 'heroSectionToggle') {
        state.focusZone = 'hero-toggle';
        state.focusIndex = 0;
        updateFocusVisuals();
    } else if (target.classList.contains('hero-btn') && !target.classList.contains('recent-hero-btn')) {
        const heroButtons = Array.from(document.querySelectorAll('.hero-btn:not(.recent-hero-btn)'));
        const index = heroButtons.indexOf(target);
        if (index >= 0) {
            state.focusZone = 'heroes';
            state.focusIndex = index;
            updateFocusVisuals();
        }
    } else if (target.id === 'clearHeroesBtn') {
        state.focusZone = 'clear-heroes';
        state.focusIndex = 0;
        updateFocusVisuals();
    } else if (target.classList.contains('result-btn')) {
        const resultButtons = Array.from(document.querySelectorAll('.result-btn'));
        const index = resultButtons.indexOf(target);
        if (index >= 0) {
            state.focusZone = 'result';
            state.focusIndex = index;
            updateFocusVisuals();
        }
    } else if (target.id === 'saveBtn') {
        state.focusZone = 'save';
        state.focusIndex = 0;
        updateFocusVisuals();
    }
}

// Handle keyboard shortcuts - WASD navigation
function handleKeyboard(e) {
    // Prevent shortcuts if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }

    const key = e.key.toLowerCase();

    // WASD Navigation
    if (['w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        // If defocused, restore last focus
        if (state.focusZone === null) {
            state.focusZone = state.lastFocusZone;
            state.focusIndex = state.lastFocusIndex;
        } else {
            handleWASDNavigation(key);
        }
        updateFocusVisuals();
        return;
    }

    // Spacebar - Select current focused item or restore focus if defocused
    if (e.key === ' ') {
        e.preventDefault();
        if (state.focusZone === null) {
            // Restore focus without triggering selection
            state.focusZone = state.lastFocusZone;
            state.focusIndex = state.lastFocusIndex;
            updateFocusVisuals();
        } else {
            // Trigger selection
            handleSpacebarSelection();
        }
        return;
    }

    // Undo shortcut (Ctrl+Z)
    if (e.ctrlKey && e.key === 'z' && state.matches.length > 0) {
        e.preventDefault();
        undoLastMatch();
        return;
    }

    // E key - Toggle hero drawer
    if (key === 'e') {
        e.preventDefault();
        toggleHeroSectionWithFocus();
        return;
    }

    // Parent type hotkeys (1, 2, 3, 4, etc.)
    // Check if the pressed key matches any parent type key
    const matchingParentType = CONFIG.matchTypes.find(type => type.key === key);
    if (matchingParentType) {
        e.preventDefault();
        selectParentType(matchingParentType.id);

        // Auto-advance focus to child types if available, otherwise results
        if (matchingParentType.children.length > 0) {
            state.focusZone = 'child';
            state.focusIndex = 0;
        } else {
            state.focusZone = 'result';
            state.focusIndex = 0;
        }
        updateFocusVisuals();
        return;
    }
}

// Handle WASD navigation
function handleWASDNavigation(key) {
    const currentZone = state.focusZone;
    const heroSection = document.getElementById('heroSelection');
    const isHeroSectionVisible = heroSection && heroSection.style.display !== 'none';
    const recentHeroesContainer = document.getElementById('recentHeroesContainer');
    const hasRecentHeroes = recentHeroesContainer && recentHeroesContainer.style.display !== 'none';

    // Special handling for heroes zone - W/S moves vertically in grid
    if (currentZone === 'heroes' && (key === 'w' || key === 's')) {
        handleHeroGridNavigation(key);
        return;
    }

    if (key === 'w') {
        // Move up (previous zone)
        if (currentZone === 'save') {
            // Move from save to clear-heroes if drawer visible, otherwise hero-toggle
            if (isHeroSectionVisible) {
                state.focusZone = 'clear-heroes';
                state.focusIndex = 0;
            } else {
                state.focusZone = 'hero-toggle';
                state.focusIndex = 0;
            }
        } else if (currentZone === 'clear-heroes') {
            // Move from clear-heroes to heroes
            state.focusZone = 'heroes';
            // Start at the bottom of the hero list when coming from below
            const heroButtons = document.querySelectorAll('.hero-btn:not(.recent-hero-btn)');
            state.focusIndex = Math.max(0, heroButtons.length - 1);
        } else if (currentZone === 'heroes') {
            // Move from heroes to hero-toggle
            state.focusZone = 'hero-toggle';
            state.focusIndex = 0;
        } else if (currentZone === 'hero-toggle') {
            // Move from hero-toggle to recent-heroes if available, otherwise result buttons
            if (hasRecentHeroes) {
                state.focusZone = 'recent-heroes';
                state.focusIndex = 0;
            } else {
                state.focusZone = 'result';
                state.focusIndex = 0;
            }
        } else if (currentZone === 'recent-heroes') {
            // Move from recent-heroes to result buttons
            state.focusZone = 'result';
            state.focusIndex = 0;
        } else if (currentZone === 'result') {
            // Move from result to child types if visible, otherwise parent types
            const childTypes = document.getElementById('childTypes');
            if (childTypes && childTypes.style.display !== 'none') {
                state.focusZone = 'child';
                state.focusIndex = 0;
            } else {
                state.focusZone = 'parent';
                state.focusIndex = 0;
            }
        } else if (currentZone === 'child') {
            state.focusZone = 'parent';
            state.focusIndex = 0;
        }
    } else if (key === 's') {
        // Move down (next zone)
        if (currentZone === 'parent') {
            // Check if child types are visible
            const childTypes = document.getElementById('childTypes');
            if (childTypes && childTypes.style.display !== 'none') {
                state.focusZone = 'child';
                state.focusIndex = 0;
            } else {
                state.focusZone = 'result';
                state.focusIndex = 0;
            }
        } else if (currentZone === 'child') {
            state.focusZone = 'result';
            state.focusIndex = 0;
        } else if (currentZone === 'result') {
            // Move to recent-heroes if available, otherwise hero-toggle
            if (hasRecentHeroes) {
                state.focusZone = 'recent-heroes';
                state.focusIndex = 0;
            } else {
                state.focusZone = 'hero-toggle';
                state.focusIndex = 0;
            }
        } else if (currentZone === 'recent-heroes') {
            state.focusZone = 'hero-toggle';
            state.focusIndex = 0;
        } else if (currentZone === 'hero-toggle') {
            // Move to heroes if visible, otherwise save button
            if (isHeroSectionVisible) {
                state.focusZone = 'heroes';
                state.focusIndex = 0;
            } else {
                // Check if save button is enabled
                const saveBtn = document.getElementById('saveBtn');
                if (saveBtn && !saveBtn.disabled) {
                    state.focusZone = 'save';
                    state.focusIndex = 0;
                }
            }
        } else if (currentZone === 'heroes') {
            state.focusZone = 'clear-heroes';
            state.focusIndex = 0;
        } else if (currentZone === 'clear-heroes') {
            // Check if save button is enabled
            const saveBtn = document.getElementById('saveBtn');
            if (saveBtn && !saveBtn.disabled) {
                state.focusZone = 'save';
                state.focusIndex = 0;
            }
        }
    } else if (key === 'a') {
        // Move left within current zone
        if (state.focusIndex > 0) {
            state.focusIndex--;
        }
    } else if (key === 'd') {
        // Move right within current zone
        const maxIndex = getMaxIndexForZone(currentZone);
        if (state.focusIndex < maxIndex) {
            state.focusIndex++;
        }
    }
}

// Handle vertical navigation within hero grid
function handleHeroGridNavigation(key) {
    const heroButtons = document.querySelectorAll('.hero-btn:not(.recent-hero-btn)');
    if (heroButtons.length === 0) return;

    const currentIndex = state.focusIndex;
    const currentButton = heroButtons[currentIndex];
    if (!currentButton) return;

    const currentLeft = currentButton.offsetLeft;
    const currentTop = currentButton.offsetTop;

    let bestMatch = null;
    let bestDistance = Infinity;

    if (key === 'w') {
        // Move up - find closest button above current position
        for (let i = 0; i < heroButtons.length; i++) {
            const btn = heroButtons[i];
            const btnTop = btn.offsetTop;
            const btnLeft = btn.offsetLeft;

            // Only consider buttons above current position
            if (btnTop < currentTop) {
                // Calculate distance (prioritize vertical proximity, then horizontal)
                const verticalDist = currentTop - btnTop;
                const horizontalDist = Math.abs(btnLeft - currentLeft);
                const distance = verticalDist * 1000 + horizontalDist;

                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = i;
                }
            }
        }

        if (bestMatch !== null) {
            state.focusIndex = bestMatch;
            state.lastHeroFocusIndex = bestMatch;
        } else {
            // No button above, exit to hero-toggle zone
            state.lastHeroFocusIndex = state.focusIndex;
            state.focusZone = 'hero-toggle';
            state.focusIndex = 0;
        }
    } else if (key === 's') {
        // Move down - find closest button below current position
        for (let i = 0; i < heroButtons.length; i++) {
            const btn = heroButtons[i];
            const btnTop = btn.offsetTop;
            const btnLeft = btn.offsetLeft;

            // Only consider buttons below current position
            if (btnTop > currentTop) {
                // Calculate distance (prioritize vertical proximity, then horizontal)
                const verticalDist = btnTop - currentTop;
                const horizontalDist = Math.abs(btnLeft - currentLeft);
                const distance = verticalDist * 1000 + horizontalDist;

                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = i;
                }
            }
        }

        if (bestMatch !== null) {
            state.focusIndex = bestMatch;
            state.lastHeroFocusIndex = bestMatch;
        } else {
            // No button below, exit to clear-heroes zone
            state.lastHeroFocusIndex = state.focusIndex;
            state.focusZone = 'clear-heroes';
            state.focusIndex = 0;
        }
    }
}

// Get maximum index for current focus zone
function getMaxIndexForZone(zone) {
    if (zone === 'parent') {
        return CONFIG.matchTypes.length - 1;
    } else if (zone === 'child') {
        const childButtons = document.querySelectorAll('.child-type-btn');
        return Math.max(0, childButtons.length - 1);
    } else if (zone === 'recent-heroes') {
        const recentButtons = document.querySelectorAll('.recent-hero-btn');
        return Math.max(0, recentButtons.length - 1);
    } else if (zone === 'hero-toggle') {
        return 0; // Only one button
    } else if (zone === 'heroes') {
        const heroButtons = document.querySelectorAll('.hero-btn:not(.recent-hero-btn)');
        return Math.max(0, heroButtons.length - 1);
    } else if (zone === 'clear-heroes') {
        return 0; // Only one button
    } else if (zone === 'result') {
        return 2; // Win, Loss, Draw
    } else if (zone === 'save') {
        return 0; // Only one button
    }
    return 0;
}

// Handle spacebar selection
function handleSpacebarSelection() {
    const zone = state.focusZone;
    const index = state.focusIndex;

    if (zone === 'parent') {
        const parentButtons = document.querySelectorAll('.parent-type-btn');
        if (parentButtons[index]) {
            const typeId = parentButtons[index].dataset.type;
            selectParentType(typeId);

            // Auto-advance to child types if available, otherwise results
            const parent = CONFIG.matchTypes.find(t => t.id === typeId);
            if (parent && parent.children.length > 0) {
                state.focusZone = 'child';
                state.focusIndex = 0;
            } else {
                state.focusZone = 'result';
                state.focusIndex = 0;
            }
        }
    } else if (zone === 'child') {
        const childButtons = document.querySelectorAll('.child-type-btn');
        if (childButtons[index]) {
            const typeId = childButtons[index].dataset.type;
            selectChildType(typeId);
            // Auto-advance to results
            state.focusZone = 'result';
            state.focusIndex = 0;
        }
    } else if (zone === 'recent-heroes') {
        const recentButtons = document.querySelectorAll('.recent-hero-btn');
        if (recentButtons[index]) {
            const heroId = recentButtons[index].dataset.hero;
            toggleHero(heroId);
            // Don't auto-advance, stay in recent-heroes zone
        }
    } else if (zone === 'hero-toggle') {
        // Toggle hero section visibility
        toggleHeroSection();
        // Check if section is now visible and move to it, otherwise move to save button
        const heroSection = document.getElementById('heroSelection');
        const isHeroSectionVisible = heroSection && heroSection.style.display !== 'none';
        if (isHeroSectionVisible) {
            state.focusZone = 'heroes';
            state.focusIndex = 0;
        } else {
            const saveBtn = document.getElementById('saveBtn');
            if (saveBtn && !saveBtn.disabled) {
                state.focusZone = 'save';
                state.focusIndex = 0;
            }
        }
    } else if (zone === 'heroes') {
        const heroButtons = document.querySelectorAll('.hero-btn');
        if (heroButtons[index]) {
            const heroId = heroButtons[index].dataset.hero;
            toggleHero(heroId);
            // Don't auto-advance, stay in heroes zone for multi-selection
        }
    } else if (zone === 'clear-heroes') {
        // Clear all selected heroes
        clearHeroes();
        // Stay in clear-heroes zone
    } else if (zone === 'result') {
        const resultButtons = document.querySelectorAll('.result-btn');
        if (resultButtons[index]) {
            const result = resultButtons[index].dataset.result;
            selectResult(result);
            // Auto-advance to save if available
            const saveBtn = document.getElementById('saveBtn');
            if (saveBtn && !saveBtn.disabled) {
                state.focusZone = 'save';
                state.focusIndex = 0;
            }
        }
    } else if (zone === 'save') {
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn && !saveBtn.disabled) {
            saveMatch();
            // Reset focus to result for next match
            state.focusZone = 'result';
            state.focusIndex = 0;
        }
    }

    updateFocusVisuals();
}

// Update visual focus indicators
function updateFocusVisuals() {
    // Remove all existing focus classes
    document.querySelectorAll('.keyboard-focused').forEach(el => {
        el.classList.remove('keyboard-focused');
    });

    const zone = state.focusZone;
    const index = state.focusIndex;

    // If defocused, don't show any focus
    if (zone === null) {
        return;
    }

    // Remember last focus for restoration
    state.lastFocusZone = zone;
    state.lastFocusIndex = index;

    let focusedElement = null;

    if (zone === 'parent') {
        const parentButtons = document.querySelectorAll('.parent-type-btn');
        focusedElement = parentButtons[index];
    } else if (zone === 'child') {
        const childButtons = document.querySelectorAll('.child-type-btn');
        focusedElement = childButtons[index];
    } else if (zone === 'recent-heroes') {
        const recentButtons = document.querySelectorAll('.recent-hero-btn');
        focusedElement = recentButtons[index];
    } else if (zone === 'hero-toggle') {
        focusedElement = document.getElementById('heroSectionToggle');
    } else if (zone === 'heroes') {
        const heroButtons = document.querySelectorAll('.hero-btn:not(.recent-hero-btn)');
        focusedElement = heroButtons[index];
    } else if (zone === 'clear-heroes') {
        focusedElement = document.getElementById('clearHeroesBtn');
    } else if (zone === 'result') {
        const resultButtons = document.querySelectorAll('.result-btn');
        focusedElement = resultButtons[index];
    } else if (zone === 'save') {
        focusedElement = document.getElementById('saveBtn');
    }

    if (focusedElement) {
        focusedElement.classList.add('keyboard-focused');
        // Scroll into view if needed
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Toggle hero selection
function toggleHero(heroId) {
    const index = state.selectedHeroes.indexOf(heroId);
    if (index > -1) {
        state.selectedHeroes.splice(index, 1);
    } else {
        state.selectedHeroes.push(heroId);
    }
    updateHeroButtons();
    updateSelectionDisplay();
}

// Clear all selected heroes
function clearHeroes() {
    state.selectedHeroes = [];
    updateHeroButtons();
    updateSelectionDisplay();
}

// Update hero button states
function updateHeroButtons() {
    document.querySelectorAll('.hero-btn').forEach(btn => {
        btn.classList.toggle('active', state.selectedHeroes.includes(btn.dataset.hero));
    });
    // Also update recent heroes if they exist
    renderRecentHeroes();
}

// Toggle hero section visibility
function toggleHeroSection() {
    const section = document.getElementById('heroSelection');
    const toggle = document.getElementById('heroSectionToggle');
    const isHidden = section.style.display === 'none';

    section.style.display = isHidden ? 'block' : 'none';
    toggle.innerHTML = isHidden
        ? '<span class="key-hint">E</span> Hide Heroes ▲'
        : '<span class="key-hint">E</span> Add Heroes (Optional) ▼';

    // When collapsing hero section, move focus to save button if enabled, otherwise hero-toggle
    if (!isHidden) {
        // Section was just collapsed
        if (state.focusZone === 'heroes' || state.focusZone === 'clear-heroes') {
            // Check if save button is enabled
            const saveBtn = document.getElementById('saveBtn');
            if (saveBtn && !saveBtn.disabled) {
                state.focusZone = 'save';
                state.focusIndex = 0;
            } else {
                state.focusZone = 'hero-toggle';
                state.focusIndex = 0;
            }
            updateFocusVisuals();
        }
    }
}

// Toggle hero section with focus memory (for E key)
function toggleHeroSectionWithFocus() {
    const section = document.getElementById('heroSelection');
    const toggle = document.getElementById('heroSectionToggle');
    const isHidden = section.style.display === 'none';

    section.style.display = isHidden ? 'block' : 'none';
    toggle.innerHTML = isHidden
        ? '<span class="key-hint">E</span> Hide Heroes ▲'
        : '<span class="key-hint">E</span> Add Heroes (Optional) ▼';

    if (isHidden) {
        // Opening the drawer - move to heroes zone with remembered position
        state.focusZone = 'heroes';
        const heroButtons = document.querySelectorAll('.hero-btn:not(.recent-hero-btn)');
        // Use last focused position if valid, otherwise start at 0
        state.focusIndex = Math.min(state.lastHeroFocusIndex, Math.max(0, heroButtons.length - 1));
        updateFocusVisuals();
    } else {
        // Closing the drawer - save position and move focus to save button if enabled
        if (state.focusZone === 'heroes' || state.focusZone === 'clear-heroes') {
            state.lastHeroFocusIndex = state.focusIndex;

            // Check if save button is enabled
            const saveBtn = document.getElementById('saveBtn');
            if (saveBtn && !saveBtn.disabled) {
                state.focusZone = 'save';
                state.focusIndex = 0;
            } else {
                state.focusZone = 'hero-toggle';
                state.focusIndex = 0;
            }
            updateFocusVisuals();
        }
    }
}

// Select parent match type
function selectParentType(parentId) {
    state.selectedParentType = parentId;
    state.selectedChildType = null; // Reset child selection
    state.selectedResult = null; // Reset result when parent changes

    // Update UI - highlight selected parent
    document.querySelectorAll('.parent-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === parentId);
    });

    // Clear result button selection
    document.querySelectorAll('.result-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Find parent and check if it has children
    const parent = CONFIG.matchTypes.find(t => t.id === parentId);

    if (parent && parent.children.length > 0) {
        // Show child options
        renderChildTypeButtons(parentId);
    } else {
        // No children, selection is complete
        document.getElementById('childTypes').style.display = 'none';
    }

    updateSelectionDisplay();
    updateSaveButton();
}

// Select child match type
function selectChildType(childId) {
    state.selectedChildType = childId;

    // Update UI - highlight selected child
    document.querySelectorAll('.child-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === childId);
    });

    updateSelectionDisplay();
    updateSaveButton();
}

// Select result
function selectResult(result) {
    state.selectedResult = result;

    // Update UI
    document.querySelectorAll('.result-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.result === result);
    });

    // Update save button color to match result
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.classList.remove('win', 'loss', 'draw');
    if (result) {
        saveBtn.classList.add(result);
    }

    updateSelectionDisplay();
    updateSaveButton();
}

// Update selection display (match preview)
function updateSelectionDisplay() {
    const matchPreview = document.getElementById('matchPreview');
    const previewResult = document.getElementById('previewResult');
    const previewType = document.getElementById('previewType');
    const previewHeroes = document.getElementById('previewHeroes');

    // Update result
    if (state.selectedResult) {
        previewResult.textContent = state.selectedResult.toUpperCase();
        previewResult.className = `match-result ${state.selectedResult}`;
        matchPreview.className = `match-preview ${state.selectedResult}`;
    } else {
        previewResult.textContent = '---';
        previewResult.className = 'match-result';
        matchPreview.className = 'match-preview';
    }

    // Build match type display
    if (state.selectedParentType) {
        const parent = CONFIG.matchTypes.find(t => t.id === state.selectedParentType);
        let displayText = parent ? parent.label : state.selectedParentType;

        // If parent has children and child is selected, add it
        if (parent && parent.children.length > 0) {
            if (state.selectedChildType) {
                const child = parent.children.find(c => c.id === state.selectedChildType);
                displayText += ` > ${child ? child.label : state.selectedChildType}`;
            } else {
                displayText += ' (select type...)';
            }
        }

        previewType.textContent = displayText;
    } else {
        previewType.textContent = 'Select match type...';
    }

    // Update heroes display
    if (state.selectedHeroes.length > 0) {
        const heroNames = state.selectedHeroes.map(heroId => {
            const hero = CONFIG.heroes.find(h => h.id === heroId);
            return hero ? hero.name : heroId;
        });
        previewHeroes.textContent = heroNames.join(', ');
        previewHeroes.style.display = 'inline';
    } else {
        previewHeroes.style.display = 'none';
    }
}

// Update save button state
function updateSaveButton() {
    const saveBtn = document.getElementById('saveBtn');

    // Check if match type selection is complete
    let typeComplete = false;
    if (state.selectedParentType) {
        const parent = CONFIG.matchTypes.find(t => t.id === state.selectedParentType);
        if (parent) {
            // If parent has children, child must be selected
            if (parent.children.length > 0) {
                typeComplete = !!state.selectedChildType;
            } else {
                // No children, parent selection is enough
                typeComplete = true;
            }
        }
    }

    saveBtn.disabled = !(typeComplete && state.selectedResult);
}

// Save match
function saveMatch() {
    // Validate selection
    const parent = CONFIG.matchTypes.find(t => t.id === state.selectedParentType);
    if (!parent || !state.selectedResult) {
        return;
    }

    // If parent has children, child must be selected
    if (parent.children.length > 0 && !state.selectedChildType) {
        return;
    }

    const match = {
        id: Date.now(),
        parentType: state.selectedParentType,
        childType: state.selectedChildType || null,
        result: state.selectedResult,
        heroes: [...state.selectedHeroes], // Copy the array
        timestamp: new Date().toISOString()
    };

    state.matches.unshift(match); // Add to beginning of array
    saveData();

    // Update recently used heroes (if any were selected)
    if (match.heroes.length > 0) {
        // Add new heroes to recent list
        match.heroes.forEach(heroId => {
            // Remove if already in list
            const existingIndex = state.recentHeroes.indexOf(heroId);
            if (existingIndex > -1) {
                state.recentHeroes.splice(existingIndex, 1);
            }
            // Add to beginning
            state.recentHeroes.unshift(heroId);
        });
        // Keep only 4 most recent
        state.recentHeroes = state.recentHeroes.slice(0, 4);
        // Save to localStorage
        localStorage.setItem('owRecentHeroes', JSON.stringify(state.recentHeroes));
        // Re-render recent heroes
        renderRecentHeroes();
    }

    // Reset only result and heroes (keep match type selected for quick back-to-back logging)
    state.selectedResult = null;
    state.selectedHeroes = [];

    // Update UI - clear only result and hero selections
    document.querySelectorAll('.result-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Remove result color class from save button
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.classList.remove('win', 'loss', 'draw');

    updateHeroButtons();

    // Auto-collapse hero section after match submission
    const heroSection = document.getElementById('heroSelection');
    const heroToggle = document.getElementById('heroSectionToggle');
    if (heroSection && heroSection.style.display !== 'none') {
        heroSection.style.display = 'none';
        heroToggle.innerHTML = '<span class="key-hint">E</span> Add Heroes (Optional) ▼';
    }

    // Move focus to result for next match
    state.focusZone = 'result';
    state.focusIndex = 0;

    updateSelectionDisplay();
    updateSaveButton();
    updateUI();
    updateFocusVisuals();

    // Visual feedback
    saveBtn.textContent = 'Saved!';
    setTimeout(() => {
        saveBtn.innerHTML = 'Save Match <span class="key-hint">Space</span>';
    }, 1000);
}

// Undo last match
function undoLastMatch() {
    if (state.matches.length === 0) {
        return;
    }

    state.matches.shift(); // Remove first (most recent) match
    saveData();
    updateUI();
}

// Delete specific match
function deleteMatch(id) {
    if (confirm('Delete this match?')) {
        state.matches = state.matches.filter(match => match.id !== id);
        saveData();
        updateUI();
    }
}

// Update UI
function updateUI() {
    updateStats();
    updateSessionInfo();
    updateMatchList();
    updateUndoButton();
    updateStorageIndicator();
    checkExportReminder();
}

// Update stats
function updateStats() {
    const total = state.matches.length;
    const wins = state.matches.filter(m => m.result === 'win').length;
    const losses = state.matches.filter(m => m.result === 'loss').length;
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;

    document.getElementById('totalMatches').textContent = total;
    document.getElementById('totalWins').textContent = wins;
    document.getElementById('totalLosses').textContent = losses;
    document.getElementById('overallWR').textContent = `${winRate}%`;
}

// Update session info
function updateSessionInfo() {
    const sessionMatches = state.matches.filter(match => {
        const matchDate = new Date(match.timestamp);
        return matchDate >= state.sessionStartTime;
    });

    const sessionTotal = sessionMatches.length;
    const sessionWins = sessionMatches.filter(m => m.result === 'win').length;
    const sessionWR = sessionTotal > 0 ? ((sessionWins / sessionTotal) * 100).toFixed(1) : 0;

    document.getElementById('sessionMatches').textContent = `Session: ${sessionTotal} matches`;
    document.getElementById('sessionWR').textContent = `Win Rate: ${sessionWR}%`;
}

// Update match list
function updateMatchList() {
    const matchList = document.getElementById('matchList');

    if (state.matches.length === 0) {
        matchList.innerHTML = '<p class="empty-state">No matches logged yet. Start logging!</p>';
        return;
    }

    matchList.innerHTML = state.matches.map(match => {
        const date = new Date(match.timestamp);
        const timeStr = formatTime(date);

        // Get match type label (support both old and new format)
        let typeLabel = '';
        if (match.parentType) {
            // New hierarchical format
            const parent = CONFIG.matchTypes.find(t => t.id === match.parentType);
            typeLabel = parent ? parent.label : match.parentType;

            if (match.childType) {
                const child = parent ? parent.children.find(c => c.id === match.childType) : null;
                typeLabel += ` > ${child ? child.label : match.childType}`;
            }
        } else if (match.type) {
            // Old flat format (backward compatibility)
            const matchType = CONFIG.matchTypes.find(t => t.id === match.type);
            typeLabel = matchType ? matchType.label : match.type;
        }

        // Get hero names
        let heroesHtml = '';
        if (match.heroes && match.heroes.length > 0) {
            const heroNames = match.heroes.map(heroId => {
                const hero = CONFIG.heroes.find(h => h.id === heroId);
                return hero ? hero.name : heroId;
            });
            heroesHtml = `<span class="match-heroes">${heroNames.join(', ')}</span>`;
        }

        return `
            <div class="match-item ${match.result}">
                <div class="match-info">
                    <span class="match-result ${match.result}">${match.result.toUpperCase()}</span>
                    <span class="match-type">${typeLabel}</span>
                    ${heroesHtml}
                    <span class="match-time">${timeStr}</span>
                </div>
                <button class="match-delete" onclick="deleteMatch(${match.id})">Delete</button>
            </div>
        `;
    }).join('');
}

// Update undo button state
function updateUndoButton() {
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.disabled = state.matches.length === 0;
    }
}

// Format time
function formatTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) {
        return 'Just now';
    } else if (diffMins < 60) {
        return `${diffMins}m ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else {
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

// Export to CSV
function exportToCSV() {
    if (state.matches.length === 0) {
        alert('No matches to export!');
        return;
    }

    const headers = ['Timestamp', 'Parent Type', 'Child Type', 'Result', 'Heroes'];
    const rows = state.matches.map(match => {
        // Get match types (support both old and new format)
        let parentType = '';
        let childType = '';

        if (match.parentType) {
            // New hierarchical format
            const parent = CONFIG.matchTypes.find(t => t.id === match.parentType);
            parentType = parent ? parent.label : match.parentType;

            if (match.childType) {
                const child = parent ? parent.children.find(c => c.id === match.childType) : null;
                childType = child ? child.label : match.childType;
            }
        } else if (match.type) {
            // Old flat format
            const matchType = CONFIG.matchTypes.find(t => t.id === match.type);
            parentType = matchType ? matchType.label : match.type;
        }

        // Get hero names
        let heroNames = '';
        if (match.heroes && match.heroes.length > 0) {
            heroNames = match.heroes.map(heroId => {
                const hero = CONFIG.heroes.find(h => h.id === heroId);
                return hero ? hero.name : heroId;
            }).join('; ');
        }

        return [
            match.timestamp,
            parentType,
            childType,
            match.result,
            heroNames
        ];
    });

    let csv = headers.join(',') + '\n';
    csv += rows.map(row => row.map(cell => {
        // Escape cells that contain commas
        if (cell.includes(',') || cell.includes(';')) {
            return `"${cell}"`;
        }
        return cell;
    }).join(',')).join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overwatch-matches-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear ALL match data? This cannot be undone!')) {
        state.matches = [];
        state.sessionStartTime = new Date();
        localStorage.setItem('owSessionStart', state.sessionStartTime.toISOString());
        saveData();
        updateUI();
    }
}

// ============================================
// PHASE 1: Data Management Features
// ============================================

// Calculate localStorage usage
function getStorageInfo() {
    let totalSize = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length + key.length;
        }
    }

    // Estimate in bytes (each char is ~2 bytes in UTF-16)
    const sizeInBytes = totalSize * 2;
    const sizeInKB = sizeInBytes / 1024;
    const sizeInMB = sizeInKB / 1024;

    // Most browsers have 5-10MB limit, we'll use 5MB as conservative estimate
    const limitMB = 5;
    const percentUsed = (sizeInMB / limitMB) * 100;

    return {
        sizeInBytes,
        sizeInKB,
        sizeInMB: sizeInMB.toFixed(2),
        limitMB,
        percentUsed: percentUsed.toFixed(1),
        isNearLimit: percentUsed > 80
    };
}

// Update storage indicator in UI
function updateStorageIndicator() {
    const indicator = document.getElementById('storageIndicator');
    if (!indicator) return;

    const info = getStorageInfo();

    // Show KB if less than 1 MB, otherwise show MB
    const sizeDisplay = info.sizeInMB < 1
        ? `${info.sizeInKB.toFixed(1)}KB`
        : `${info.sizeInMB}MB`;

    indicator.textContent = `Storage: ${sizeDisplay} / ~${info.limitMB}MB (${info.percentUsed}%)`;

    // Update warning if near limit
    if (info.isNearLimit) {
        indicator.classList.add('warning');
        showStorageWarning();
    } else {
        indicator.classList.remove('warning');
        hideStorageWarning();
    }
}

// Show storage warning banner
function showStorageWarning() {
    const banner = document.getElementById('storageWarningBanner');
    if (banner) {
        banner.style.display = 'block';
    }
}

// Hide storage warning banner
function hideStorageWarning() {
    const banner = document.getElementById('storageWarningBanner');
    if (banner) {
        banner.style.display = 'none';
    }
}

// Close storage warning banner
function closeStorageWarning() {
    hideStorageWarning();
}

// Check and show export reminder
function checkExportReminder() {
    const lastExportReminder = localStorage.getItem('lastExportReminder');
    const matchCount = state.matches.length;

    // Show reminder every 100 matches
    if (matchCount > 0 && matchCount % 100 === 0) {
        if (!lastExportReminder || parseInt(lastExportReminder) !== matchCount) {
            showExportReminder();
            localStorage.setItem('lastExportReminder', matchCount.toString());
        }
    }
}

// Show export reminder banner
function showExportReminder() {
    const banner = document.getElementById('exportReminderBanner');
    if (banner) {
        banner.style.display = 'block';
    }
}

// Hide export reminder banner
function closeExportReminder() {
    const banner = document.getElementById('exportReminderBanner');
    if (banner) {
        banner.style.display = 'none';
    }
}

// Validate match data structure
function validateMatch(match) {
    const errors = [];

    // Check required fields
    if (!match.timestamp) {
        errors.push('Missing timestamp');
    }

    if (!match.result || !['win', 'loss', 'draw'].includes(match.result)) {
        errors.push('Invalid or missing result');
    }

    // Check match type (support both old and new format)
    if (!match.parentType && !match.type) {
        errors.push('Missing match type');
    }

    // Validate parent type if present
    if (match.parentType) {
        const validParent = CONFIG.matchTypes.find(t => t.id === match.parentType);
        if (!validParent) {
            errors.push(`Invalid parent type: ${match.parentType}`);
        }

        // Validate child type if parent has children
        if (validParent && validParent.children.length > 0 && match.childType) {
            const validChild = validParent.children.find(c => c.id === match.childType);
            if (!validChild) {
                errors.push(`Invalid child type: ${match.childType}`);
            }
        }
    }

    // Validate heroes if present
    if (match.heroes && Array.isArray(match.heroes)) {
        match.heroes.forEach(heroId => {
            const validHero = CONFIG.heroes.find(h => h.id === heroId);
            if (!validHero) {
                errors.push(`Unknown hero: ${heroId}`);
            }
        });
    }

    return errors;
}

// Import data from JSON
function importFromJSON(jsonString) {
    try {
        const data = JSON.parse(jsonString);

        if (!Array.isArray(data)) {
            throw new Error('Invalid format: expected array of matches');
        }

        let imported = 0;
        let skipped = 0;
        let errors = [];

        data.forEach((match, index) => {
            // Validate match
            const validationErrors = validateMatch(match);
            if (validationErrors.length > 0) {
                errors.push(`Match ${index + 1}: ${validationErrors.join(', ')}`);
                skipped++;
                return;
            }

            // Check for duplicates (by ID or timestamp)
            const isDuplicate = state.matches.some(m =>
                m.id === match.id || m.timestamp === match.timestamp
            );

            if (isDuplicate) {
                skipped++;
                return;
            }

            // Ensure match has an ID
            if (!match.id) {
                match.id = Date.now() + Math.random();
            }

            state.matches.push(match);
            imported++;
        });

        // Sort by timestamp (newest first)
        state.matches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        saveData();

        let message = `Import complete!\n${imported} matches imported, ${skipped} skipped.`;
        if (errors.length > 0 && errors.length <= 10) {
            message += '\n\nErrors:\n' + errors.join('\n');
        } else if (errors.length > 10) {
            message += `\n\n${errors.length} matches had errors.`;
        }

        alert(message);

        // Force UI update after alert
        updateUI();
        updateStats();
        updateSessionInfo();
    } catch (error) {
        alert('Import failed: ' + error.message);
    }
}

// Import data from CSV
function importFromCSV(csvString) {
    try {
        const lines = csvString.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV file is empty or has no data rows');
        }

        // Parse header
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

        // Find column indices
        const timestampIdx = headers.findIndex(h => h.toLowerCase().includes('timestamp'));
        const resultIdx = headers.findIndex(h => h.toLowerCase().includes('result'));
        const parentTypeIdx = headers.findIndex(h => h.toLowerCase().includes('parent'));
        const childTypeIdx = headers.findIndex(h => h.toLowerCase().includes('child'));
        const heroesIdx = headers.findIndex(h => h.toLowerCase().includes('hero'));

        if (timestampIdx === -1 || resultIdx === -1) {
            throw new Error('CSV must have Timestamp and Result columns');
        }

        let imported = 0;
        let skipped = 0;
        const matches = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV parser (handles quoted fields)
            const fields = [];
            let field = '';
            let inQuotes = false;

            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    fields.push(field.trim());
                    field = '';
                } else {
                    field += char;
                }
            }
            fields.push(field.trim());

            // Build match object
            const match = {
                id: Date.now() + Math.random(),
                timestamp: fields[timestampIdx],
                result: fields[resultIdx].toLowerCase(),
                parentType: parentTypeIdx !== -1 ? fields[parentTypeIdx] : null,
                childType: childTypeIdx !== -1 && fields[childTypeIdx] ? fields[childTypeIdx] : null,
                heroes: heroesIdx !== -1 && fields[heroesIdx] ?
                    fields[heroesIdx].split(';').map(h => h.trim()).filter(h => h) : []
            };

            // Map labels back to IDs
            if (match.parentType) {
                const parent = CONFIG.matchTypes.find(t =>
                    t.label.toLowerCase() === match.parentType.toLowerCase() ||
                    t.id === match.parentType
                );
                if (parent) {
                    match.parentType = parent.id;

                    if (match.childType) {
                        const child = parent.children.find(c =>
                            c.label.toLowerCase() === match.childType.toLowerCase() ||
                            c.id === match.childType
                        );
                        if (child) {
                            match.childType = child.id;
                        }
                    }
                }
            }

            // Map hero names to IDs
            if (match.heroes.length > 0) {
                match.heroes = match.heroes.map(heroName => {
                    const hero = CONFIG.heroes.find(h =>
                        h.name.toLowerCase() === heroName.toLowerCase() ||
                        h.id === heroName
                    );
                    return hero ? hero.id : heroName;
                }).filter(h => h);
            }

            // Validate
            const validationErrors = validateMatch(match);
            if (validationErrors.length > 0) {
                skipped++;
                continue;
            }

            // Check for duplicates
            const isDuplicate = state.matches.some(m => m.timestamp === match.timestamp);
            if (isDuplicate) {
                skipped++;
                continue;
            }

            matches.push(match);
            imported++;
        }

        state.matches.push(...matches);
        state.matches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        saveData();

        alert(`Import complete!\n${imported} matches imported, ${skipped} skipped.`);

        // Force UI update after alert
        updateUI();
        updateStats();
        updateSessionInfo();
    } catch (error) {
        alert('Import failed: ' + error.message);
    }
}

// Handle file import
function handleImportFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;

            if (file.name.endsWith('.json')) {
                importFromJSON(content);
            } else if (file.name.endsWith('.csv')) {
                importFromCSV(content);
            } else {
                alert('Unsupported file type. Please use .json or .csv files.');
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

// Export to JSON
function exportToJSON() {
    if (state.matches.length === 0) {
        alert('No matches to export!');
        return;
    }

    const data = JSON.stringify(state.matches, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overwatch-matches-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
