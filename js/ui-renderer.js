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

    const showPortraits = state.settings.showHeroPortraits;
    const isStadiumMode = state.selectedParentType === 'stadium';
    const disableSetting = state.settings.disableNonStadiumHeroes;

    const renderHeroButton = (hero) => {
        // Check if hero should be hidden in Stadium mode
        if (isStadiumMode && disableSetting === 'hide' && !hero.stadiumAvailable) {
            return ''; // Skip rendering this hero
        }

        // Determine if hero should be disabled
        const isDisabled = isStadiumMode && disableSetting === 'dim' && !hero.stadiumAvailable;
        const disabledClass = isDisabled ? ' disabled' : '';
        const tooltipAttr = isDisabled ? ' title="Not available in Stadium mode"' : '';

        if (showPortraits && hero.portrait) {
            return `<button class="hero-btn with-portrait${disabledClass}" data-hero="${hero.id}"${tooltipAttr}>
                        <img src="assets/images/heroes/${hero.portrait}" alt="${hero.name}" class="hero-portrait">
                        <span class="hero-name">${hero.name}</span>
                    </button>`;
        } else {
            return `<button class="hero-btn${disabledClass}" data-hero="${hero.id}"${tooltipAttr}>${hero.name}</button>`;
        }
    };

    const tankIcon = `<svg class="role-icon" width="24" height="24" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M29.9106 14.02C29.9568 12.1907 28.5026 11.9133 27.2643 11.605C25.3688 11.1712 23.4277 10.9693 21.4836 11.0038V11.0038C19.5395 10.9693 17.5984 11.1712 15.703 11.605C14.4646 11.9133 13.0105 12.1907 13.0568 14.02C13.1236 16.548 13.0568 19.0761 13.0568 21.6042C13.0439 22.0212 13.1414 22.4342 13.3394 22.8014C15.1845 26.1776 17.7876 29.0797 20.9441 31.2797C21.0905 31.398 21.27 31.4681 21.4579 31.4801V31.4801C21.6458 31.4681 21.8253 31.398 21.9717 31.2797C25.1282 29.0797 27.7314 26.1776 29.5765 22.8014C29.7745 22.4342 29.872 22.0212 29.8591 21.6042C29.8951 19.0761 29.8438 16.548 29.9106 14.02Z" fill="currentColor"/>
        <circle cx="21.0002" cy="21.0001" r="19.1818" stroke="currentColor" stroke-width="2"/>
    </svg>`;

    const damageIcon = `<svg class="role-icon" width="24" height="24" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.0996 29.0399V30.9638C12.0996 31.1202 12.1618 31.2701 12.2723 31.3807C12.3829 31.4912 12.5328 31.5533 12.6892 31.5533H16.0547C16.211 31.5533 16.361 31.4912 16.4715 31.3807C16.5821 31.2701 16.6441 31.1202 16.6441 30.9638V29.0399H12.0996Z" fill="currentColor"/>
        <path d="M14.5429 11.028C14.4482 10.9907 14.3428 10.9907 14.2481 11.028C12.1527 11.9444 12.1045 14.983 12.1045 14.983V27.2768H16.649V14.983C16.649 14.983 16.6169 11.9551 14.5429 11.028Z" fill="currentColor"/>
        <path d="M18.7881 29.0399V30.9638C18.7881 31.1202 18.8502 31.2701 18.9608 31.3807C19.0713 31.4912 19.2213 31.5533 19.3776 31.5533H22.7485C22.9044 31.5519 23.0536 31.4894 23.1638 31.3791C23.2741 31.2689 23.3366 31.1197 23.338 30.9638V29.0399H18.7881Z" fill="currentColor"/>
        <path d="M21.2099 11.028C21.1152 10.9907 21.0098 10.9907 20.9151 11.028C18.8197 11.9444 18.7715 14.983 18.7715 14.983V27.2768H23.3214V14.983C23.3214 14.983 23.3053 11.9551 21.2099 11.028Z" fill="currentColor"/>
        <path d="M25.4756 29.0399V30.9638C25.4756 31.1202 25.5377 31.2701 25.6483 31.3807C25.7588 31.4912 25.9088 31.5533 26.0651 31.5533H29.436C29.5924 31.5533 29.7423 31.4912 29.8529 31.3807C29.9634 31.2701 30.0255 31.1202 30.0255 30.9638V29.0399H25.4756Z" fill="currentColor"/>
        <path d="M27.8982 11.028C27.8035 10.9907 27.6983 10.9907 27.6036 11.028C25.5082 11.9444 25.46 14.983 25.46 14.983V27.2768H30.0098V14.983C30.0098 14.983 29.9937 11.9551 27.8982 11.028Z" fill="currentColor"/>
        <circle cx="21.0002" cy="21.0001" r="19.1818" stroke="currentColor" stroke-width="2"/>
    </svg>`;

    const supportIcon = `<svg class="role-icon" width="24" height="24" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M31.0114 17.5325H25.2376C25.1797 17.5312 25.1245 17.5073 25.084 17.4659C25.0435 17.4245 25.0207 17.3688 25.0207 17.3108V11.5419C25.0207 11.3982 24.9637 11.2603 24.8621 11.1587C24.7605 11.0571 24.6226 11 24.4789 11H18.0745C17.9308 11 17.7929 11.0571 17.6913 11.1587C17.5897 11.2603 17.5325 11.3982 17.5325 11.5419V17.3108C17.5325 17.3696 17.5091 17.426 17.4676 17.4676C17.426 17.5092 17.3696 17.5325 17.3109 17.5325H11.542C11.3982 17.5325 11.2604 17.5896 11.1588 17.6913C11.0571 17.7929 11 17.9307 11 18.0745V24.4789C11 24.6226 11.0571 24.7605 11.1588 24.8621C11.2604 24.9637 11.3982 25.0208 11.542 25.0208H17.3109C17.3696 25.0208 17.426 25.0442 17.4676 25.0857C17.5091 25.1273 17.5325 25.1837 17.5325 25.2425V31.0114C17.5325 31.1552 17.5897 31.293 17.6913 31.3946C17.7929 31.4963 17.9308 31.5534 18.0745 31.5534H24.4789C24.6226 31.5534 24.7605 31.4963 24.8621 31.3946C24.9637 31.293 25.0207 31.1552 25.0207 31.0114V25.2524C25.0207 25.1944 25.0435 25.1388 25.084 25.0973C25.1245 25.0559 25.1797 25.032 25.2376 25.0307H31.0114C31.1552 25.0307 31.293 24.9736 31.3946 24.8719C31.4963 24.7703 31.5533 24.6325 31.5533 24.4888V18.0843C31.5546 18.0123 31.5415 17.9408 31.5149 17.8739C31.4883 17.807 31.4486 17.7461 31.3981 17.6947C31.3477 17.6434 31.2875 17.6026 31.2211 17.5747C31.1547 17.5469 31.0834 17.5325 31.0114 17.5325V17.5325Z" fill="currentColor"/>
        <circle cx="21.0002" cy="21.0001" r="19.1818" stroke="currentColor" stroke-width="2"/>
    </svg>`;

    container.innerHTML = `
        <div class="hero-role-section">
            <h4>${tankIcon}Tank</h4>
            <div class="hero-buttons">
                ${herosByRole.tank.map(renderHeroButton).join('')}
            </div>
        </div>
        <div class="hero-role-section">
            <h4>${damageIcon}Damage</h4>
            <div class="hero-buttons">
                ${herosByRole.damage.map(renderHeroButton).join('')}
            </div>
        </div>
        <div class="hero-role-section">
            <h4>${supportIcon}Support</h4>
            <div class="hero-buttons">
                ${herosByRole.support.map(renderHeroButton).join('')}
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

    const isStadiumMode = state.selectedParentType === 'stadium';
    const disableSetting = state.settings.disableNonStadiumHeroes;
    const showPortraits = state.settings.showHeroPortraits;

    let heroesToShow;

    // Handle backfill for Stadium mode with hide setting
    if (isStadiumMode && disableSetting === 'hide') {
        // Scan full recent heroes history to find Stadium-valid heroes
        heroesToShow = state.recentHeroes
            .map(heroId => CONFIG.heroes.find(h => h.id === heroId))
            .filter(hero => hero && hero.stadiumAvailable)
            .slice(0, count);
    } else {
        // Normal behavior: just slice to the configured count
        heroesToShow = state.recentHeroes.slice(0, count)
            .map(heroId => CONFIG.heroes.find(h => h.id === heroId))
            .filter(hero => hero);
    }

    recentHeroesButtons.innerHTML = heroesToShow.map(hero => {
        const isSelected = state.selectedHeroes.includes(hero.id);

        // Apply disabled class for dim mode
        const isDisabled = isStadiumMode && disableSetting === 'dim' && !hero.stadiumAvailable;
        const disabledClass = isDisabled ? ' disabled' : '';
        const tooltipAttr = isDisabled ? ' title="Not available in Stadium mode"' : '';

        if (showPortraits && hero.portrait) {
            return `<button class="hero-btn recent-hero-btn with-portrait${disabledClass} ${isSelected ? 'active' : ''}" data-hero="${hero.id}"${tooltipAttr}>
                        <img src="assets/images/heroes/${hero.portrait}" alt="${hero.name}" class="hero-portrait">
                        <span class="hero-name">${hero.name}</span>
                    </button>`;
        } else {
            return `<button class="hero-btn recent-hero-btn${disabledClass} ${isSelected ? 'active' : ''}" data-hero="${hero.id}"${tooltipAttr}>${hero.name}</button>`;
        }
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
        // Don't touch recentHeroesContainer - let renderRecentHeroes() handle it based on count
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
