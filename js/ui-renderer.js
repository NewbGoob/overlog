// ============================================
// UI RENDERER MODULE
// ============================================

import { CONFIG } from './config.js';
import { state } from './state.js';
import { updateStorageIndicator, checkExportReminder } from './storage.js';

// Dependencies to be injected by main app
let toggleHero, deleteMatch, updateSelectionDisplay, updateSaveButton, showToast;

// Initialize UI renderer with function dependencies
export function initUIRenderer(deps) {
    toggleHero = deps.toggleHero;
    deleteMatch = deps.deleteMatch;
    updateSelectionDisplay = deps.updateSelectionDisplay;
    updateSaveButton = deps.updateSaveButton;
    showToast = deps.showToast;
}

// Render match type buttons (parent types)
export function renderMatchTypeButtons() {
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
export function renderChildTypeButtons(parentId) {
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
export function renderHeroButtons() {
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
export function renderRecentHeroes() {
    const container = document.getElementById('recentHeroesContainer');
    if (!container) return;

    // Check if heroes are disabled in settings
    if (!state.settings.showHeroes) {
        container.style.display = 'none';
        return;
    }

    // Get the count from settings (0 means hide recent heroes)
    const count = state.settings.recentHeroesCount;

    if (count === 0 || state.recentHeroes.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    const recentHeroesButtons = document.getElementById('recentHeroesButtons');

    // Slice to show only the configured number of recent heroes
    const heroesToShow = state.recentHeroes.slice(0, count);

    recentHeroesButtons.innerHTML = heroesToShow.map(heroId => {
        const hero = CONFIG.heroes.find(h => h.id === heroId);
        if (!hero) return '';

        const isSelected = state.selectedHeroes.includes(heroId);
        return `<button class="hero-btn recent-hero-btn ${isSelected ? 'active' : ''}" data-hero="${heroId}">${hero.name}</button>`;
    }).join('');

    // Re-attach event listeners after rendering
    setupRecentHeroListeners();
}

// Setup event listeners for recent hero buttons
export function setupRecentHeroListeners() {
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

// Update UI (master update function)
export function updateUI() {
    updateStats();
    updateSessionInfo();
    updateMatchList();
    updateUndoButton();
    updateStorageIndicator();
    checkExportReminder();
}

// Update stats display
export function updateStats() {
    let matches;

    // Filter matches based on current view
    if (state.statsView === 'session') {
        matches = state.matches.filter(match => {
            const matchDate = new Date(match.timestamp);
            return matchDate >= state.sessionStartTime;
        });
    } else {
        matches = state.matches;
    }

    const total = matches.length;
    const wins = matches.filter(m => m.result === 'win').length;
    const losses = matches.filter(m => m.result === 'loss').length;
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;

    document.getElementById('totalMatches').textContent = total;
    document.getElementById('totalWins').textContent = wins;
    document.getElementById('totalLosses').textContent = losses;
    document.getElementById('overallWR').textContent = `${winRate}%`;

    // Update toggle buttons active state
    document.getElementById('statsToggleAllTime').classList.toggle('active', state.statsView === 'all-time');
    document.getElementById('statsToggleSession').classList.toggle('active', state.statsView === 'session');
}

// Update session info
export function updateSessionInfo() {
    const sessionMatches = state.matches.filter(match => {
        const matchDate = new Date(match.timestamp);
        return matchDate >= state.sessionStartTime;
    });

    const sessionTotal = sessionMatches.length;
    const sessionWins = sessionMatches.filter(m => m.result === 'win').length;
    const sessionWR = sessionTotal > 0 ? ((sessionWins / sessionTotal) * 100).toFixed(1) : 0;

    const sessionInfoContainer = document.querySelector('.session-info');

    // Hide session info if no session matches logged yet
    if (sessionTotal === 0) {
        sessionInfoContainer.style.display = 'none';
    } else {
        sessionInfoContainer.style.display = 'flex';
        document.getElementById('sessionMatches').textContent = `Session: ${sessionTotal} matches`;
        document.getElementById('sessionWR').textContent = `Win Rate: ${sessionWR}%`;
    }
}

// Start a new session
export function startNewSession() {
    // Calculate previous session stats before resetting
    const previousSessionMatches = state.matches.filter(match => {
        const matchDate = new Date(match.timestamp);
        return matchDate >= state.sessionStartTime;
    });
    const prevCount = previousSessionMatches.length;
    const prevWins = previousSessionMatches.filter(m => m.result === 'win').length;
    const prevWR = prevCount > 0 ? ((prevWins / prevCount) * 100).toFixed(1) : 0;

    // Reset session
    state.sessionStartTime = new Date();
    localStorage.setItem('owSessionStart', state.sessionStartTime.toISOString());

    updateSessionInfo();
    updateUI();

    // Show toast notification if enabled
    if (state.settings.showSessionNotification) {
        if (prevCount > 0) {
            showToast(`New session started! Previous: ${prevCount} matches (${prevWR}% WR)`, 'info', 3500);
        } else {
            showToast('New session started!', 'info', 2500);
        }
    }
}

// Update match list
export function updateMatchList() {
    const matchList = document.getElementById('matchList');
    const paginationControls = document.getElementById('paginationControls');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const pageInfo = document.getElementById('pageInfo');

    // Update filter toggle buttons active state
    document.getElementById('matchHistoryToggleAllTime').classList.toggle('active', state.matchHistoryView === 'all-time');
    document.getElementById('matchHistoryToggleSession').classList.toggle('active', state.matchHistoryView === 'session');

    // Filter matches based on current view
    let filteredMatches;
    if (state.matchHistoryView === 'session') {
        // Filter by session - use sessionId if available, otherwise fall back to timestamp comparison
        const currentSessionId = state.sessionStartTime ? state.sessionStartTime.getTime() : null;
        filteredMatches = state.matches.filter(match => {
            if (match.sessionId !== undefined) {
                // New format: use sessionId
                return match.sessionId === currentSessionId;
            } else {
                // Legacy format: use timestamp comparison
                const matchDate = new Date(match.timestamp);
                return matchDate >= state.sessionStartTime;
            }
        });
    } else {
        // Show all matches
        filteredMatches = state.matches;
    }

    // Handle empty state
    if (filteredMatches.length === 0) {
        matchList.innerHTML = '<p class="empty-state">No matches logged yet. Start logging!</p>';
        paginationControls.style.display = 'none';
        return;
    }

    // Calculate pagination
    const matchesPerPage = state.settings.matchesPerPage;
    let paginatedMatches;
    let totalPages = 1;

    if (matchesPerPage === 'all') {
        // Show all matches without pagination
        paginatedMatches = filteredMatches;
        paginationControls.style.display = 'none';
    } else {
        // Paginate matches
        totalPages = Math.ceil(filteredMatches.length / matchesPerPage);

        // Ensure current page is valid
        if (state.matchHistoryPage > totalPages) {
            state.matchHistoryPage = totalPages;
        }
        if (state.matchHistoryPage < 1) {
            state.matchHistoryPage = 1;
        }

        // Get matches for current page
        const startIndex = (state.matchHistoryPage - 1) * matchesPerPage;
        const endIndex = startIndex + matchesPerPage;
        paginatedMatches = filteredMatches.slice(startIndex, endIndex);
    }

    // Render matches
    matchList.innerHTML = paginatedMatches.map(match => {
        const date = new Date(match.timestamp);
        const timeStr = formatTime(date);

        // Get match type label (support both old and new format)
        let typeLabel = '';
        if (match.parentType) {
            // New hierarchical format
            const parent = CONFIG.matchTypes.find(t => t.id === match.parentType);

            if (match.childType) {
                const child = parent ? parent.children.find(c => c.id === match.childType) : null;
                // Use displayLabel if available, otherwise fall back to parent > child
                typeLabel = child && child.displayLabel ? child.displayLabel :
                    (child ? `${parent ? parent.label : match.parentType} > ${child.label}` : match.childType);
            } else {
                // No child, just show parent
                typeLabel = parent ? parent.label : match.parentType;
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
                    <span class="match-result ${match.result}">${getResultText(match.result)}</span>
                    <span class="match-type">${typeLabel}</span>
                    ${heroesHtml}
                    <span class="match-time">${timeStr}</span>
                </div>
                <button class="match-delete" onclick="deleteMatch(${match.id})">Delete</button>
            </div>
        `;
    }).join('');

    // Update pagination controls
    if (matchesPerPage !== 'all' && totalPages > 1) {
        paginationControls.style.display = 'flex';
        pageInfo.textContent = `Page ${state.matchHistoryPage} of ${totalPages}`;
        prevPageBtn.disabled = state.matchHistoryPage === 1;
        nextPageBtn.disabled = state.matchHistoryPage === totalPages;
    } else {
        paginationControls.style.display = 'none';
    }
}

// Update undo button state
export function updateUndoButton() {
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.disabled = state.matches.length === 0;
    }
}

// Format time for display
export function formatTime(date) {
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

// Get result text based on settings
export function getResultText(result) {
    if (state.settings.useOwStyleText) {
        // Overwatch style
        if (result === 'win') return 'VICTORY';
        if (result === 'loss') return 'DEFEAT';
        if (result === 'draw') return 'DRAW';
    } else {
        // Standard style
        if (result === 'win') return 'WIN';
        if (result === 'loss') return 'LOSS';
        if (result === 'draw') return 'DRAW';
    }
    return result ? result.toUpperCase() : '---';
}

// Update result button labels based on settings
export function updateResultButtonLabels() {
    const resultButtons = document.querySelectorAll('.result-btn');
    resultButtons.forEach(btn => {
        const result = btn.dataset.result;
        if (state.settings.useOwStyleText) {
            // Overwatch style
            if (result === 'win') btn.childNodes[0].textContent = 'Victory';
            if (result === 'loss') btn.childNodes[0].textContent = 'Defeat';
            if (result === 'draw') btn.childNodes[0].textContent = 'Draw';
        } else {
            // Standard style
            if (result === 'win') btn.childNodes[0].textContent = 'Win';
            if (result === 'loss') btn.childNodes[0].textContent = 'Loss';
            if (result === 'draw') btn.childNodes[0].textContent = 'Draw';
        }
    });
}

// Update draw button visibility based on settings
export function updateDrawButtonVisibility() {
    const drawBtn = document.querySelector('.result-btn[data-result="draw"]');
    const resultButtonsContainer = document.querySelector('.result-buttons');

    if (!drawBtn || !resultButtonsContainer) return;

    if (state.settings.showDrawButton) {
        drawBtn.style.display = '';
        resultButtonsContainer.classList.remove('two-buttons');
    } else {
        drawBtn.style.display = 'none';
        resultButtonsContainer.classList.add('two-buttons');

        // If draw was selected, clear it
        if (state.selectedResult === 'draw') {
            state.selectedResult = null;
            updateSelectionDisplay();
            updateSaveButton();
        }
    }
}

// Update hero sections visibility based on settings
export function updateHeroSectionsVisibility() {
    const recentHeroesContainer = document.getElementById('recentHeroesContainer');
    const heroSectionWrapper = document.querySelector('.hero-section-wrapper');

    if (!recentHeroesContainer || !heroSectionWrapper) return;

    if (state.settings.showHeroes) {
        recentHeroesContainer.style.display = '';
        heroSectionWrapper.style.display = '';
    } else {
        recentHeroesContainer.style.display = 'none';
        heroSectionWrapper.style.display = 'none';

        // If heroes were selected, clear them
        if (state.selectedHeroes.length > 0) {
            state.selectedHeroes = [];
            updateSelectionDisplay();
            updateSaveButton();
        }
    }
}

// Get current match type display label for notifications
export function getMatchTypeDisplayLabel() {
    if (!state.selectedParentType) return '';

    const parent = CONFIG.matchTypes.find(t => t.id === state.selectedParentType);
    if (!parent) return '';

    // If parent has children and child is selected, use child's displayLabel
    if (parent.children.length > 0 && state.selectedChildType) {
        const child = parent.children.find(c => c.id === state.selectedChildType);
        if (child && child.displayLabel) {
            return child.displayLabel;
        }
        if (child) {
            return `${parent.label} ${child.label}`;
        }
    }

    // No children or no child selected, just return parent label
    return parent.label;
}
