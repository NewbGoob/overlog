// ============================================
// MAIN APP MODULE
// ============================================

// Import modules
import { CONFIG, DEFAULT_SETTINGS } from './config.js';
import { state } from './state.js';
import {
    loadData,
    loadSettings,
    saveSettings,
    saveData,
    updateStorageIndicator,
    closeStorageWarning,
    closeExportReminder,
    checkExportReminder
} from './storage.js';
import {
    handleKeyboard,
    handleClickFocus,
    updateFocusVisuals,
    initKeyboardNav
} from './keyboard-navigation.js';
import {
    exportToCSV,
    exportToJSON,
    handleImportFile,
    clearAllData,
    initImportExport
} from './import-export.js';
import {
    saveMatch as saveMatchFromModule,
    undoLastMatch,
    initMatchManager
} from './match-manager.js';
import {
    renderMatchTypeButtons,
    renderChildTypeButtons,
    renderHeroButtons,
    renderRecentHeroes,
    setupRecentHeroListeners,
    updateStats,
    updateSessionInfo,
    updateMatchList,
    updateUndoButton,
    formatTime,
    getResultText as getResultTextFromModule,
    updateResultButtonLabels as updateResultButtonLabelsFromModule,
    updateDrawButtonVisibility as updateDrawButtonVisibilityFromModule,
    updateHeroSectionsVisibility as updateHeroSectionsVisibilityFromModule,
    getMatchTypeDisplayLabel as getMatchTypeDisplayLabelFromModule,
    initUIRenderer
} from './ui-renderer.js';

// ============================================
// THEME FUNCTIONS
// ============================================

function applyTheme(theme) {
    const body = document.body;

    // Remove existing theme classes
    body.classList.remove('theme-auto', 'theme-dark', 'theme-light');

    // Add new theme class
    body.classList.add(`theme-${theme}`);
}

// Get current active theme (resolves 'auto' to actual theme)
function getCurrentActiveTheme() {
    if (state.settings.theme === 'auto') {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        } else {
            return 'light';
        }
    }
    return state.settings.theme;
}

// Toggle theme
function toggleTheme() {
    const currentActive = getCurrentActiveTheme();

    // Switch to opposite theme
    const newTheme = currentActive === 'dark' ? 'light' : 'dark';

    // Update state and save
    state.settings.theme = newTheme;
    saveSettings();
    applyTheme(newTheme);

    // Also update the settings modal dropdown if it's open
    const themeSelect = document.getElementById('settingTheme');
    if (themeSelect) {
        themeSelect.value = newTheme;
    }
}

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================

// Show a toast notification
function showToast(message, type = 'info', duration = 2500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = createToastElement(message, type);
    container.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
        removeToast(toast);
    }, duration);
}

// Create a toast element
function createToastElement(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    // Icon based on type
    let icon = '✓';
    if (type === 'info') icon = 'ℹ';
    if (type === 'warning') icon = '⚠';
    if (type === 'error') icon = '✕';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    return toast;
}

// Remove a toast with animation
function removeToast(toast) {
    if (!toast || !toast.parentElement) return;

    toast.classList.add('toast-hiding');
    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 300); // Match CSS animation duration
}

// ============================================
// HELPER FUNCTIONS (use imported functions)
// ============================================

// Wrapper functions to use imported module functions
const getResultText = getResultTextFromModule;
const updateResultButtonLabels = updateResultButtonLabelsFromModule;
const updateDrawButtonVisibility = updateDrawButtonVisibilityFromModule;
const updateHeroSectionsVisibility = updateHeroSectionsVisibilityFromModule;
const getMatchTypeDisplayLabel = getMatchTypeDisplayLabelFromModule;

// ============================================
// UI INTERACTION FUNCTIONS
// ============================================

// Toggle hero selection
function toggleHero(heroId) {
    const index = state.selectedHeroes.indexOf(heroId);
    if (index > -1) {
        // Remove if already selected
        state.selectedHeroes.splice(index, 1);
    } else {
        // Add if not selected
        // Check if we're in Stadium mode with the limit enabled
        const isStadiumMode = state.selectedParentType === 'stadium';
        const limitStadiumHeroes = state.settings.limitStadiumHeroSelection;

        if (isStadiumMode && limitStadiumHeroes && state.selectedHeroes.length > 0) {
            // In Stadium mode with limit - replace the existing hero
            state.selectedHeroes = [heroId];
        } else {
            // Normal mode or no limit - add to array
            state.selectedHeroes.push(heroId);
        }
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

// Toggle match type section visibility
function toggleMatchTypeSection() {
    const section = document.getElementById('matchTypeSection');
    const toggle = document.getElementById('matchTypeToggle');
    const toggleText = document.getElementById('matchTypeToggleText');
    const isHidden = section.style.display === 'none';

    section.style.display = isHidden ? 'block' : 'none';

    // Update toggle text to show current selection or prompt
    updateMatchTypeToggleText();

    // When collapsing match type section, move focus to result if match type is selected
    if (!isHidden) {
        // Section was just collapsed
        if (state.focusZone === 'parent' || state.focusZone === 'child') {
            // Move to result buttons if match type is complete
            const parent = CONFIG.matchTypes.find(t => t.id === state.selectedParentType);
            const typeComplete = state.selectedParentType &&
                (!parent || parent.children.length === 0 || state.selectedChildType);

            if (typeComplete) {
                state.focusZone = 'result';
                state.focusIndex = 0;
            } else {
                state.focusZone = 'match-type-toggle';
                state.focusIndex = 0;
            }
            updateFocusVisuals();
        }
    }
}

// Update match type toggle button text
function updateMatchTypeToggleText() {
    const toggleText = document.getElementById('matchTypeToggleText');

    if (state.selectedParentType) {
        const parent = CONFIG.matchTypes.find(t => t.id === state.selectedParentType);

        // If parent has children and child is selected, use child's displayLabel
        if (parent && parent.children.length > 0) {
            if (state.selectedChildType) {
                const child = parent.children.find(c => c.id === state.selectedChildType);
                const displayText = child && child.displayLabel ? child.displayLabel :
                    (child ? `${parent.label} > ${child.label}` : state.selectedChildType);
                toggleText.textContent = displayText;
            } else {
                toggleText.textContent = `${parent.label} (select type...)`;
            }
        } else {
            // No children, just show parent label
            const displayText = parent ? parent.label : state.selectedParentType;
            toggleText.textContent = displayText;
        }
    } else {
        toggleText.textContent = 'Select Match Type';
    }
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

// Update hero section based on alwaysShowAllHeroes setting
function updateAlwaysShowAllHeroes() {
    const heroSectionWrapper = document.querySelector('.hero-section-wrapper');
    const heroSection = document.getElementById('heroSelection');
    const heroToggle = document.getElementById('heroSectionToggle');

    if (!heroSectionWrapper || !heroSection || !heroToggle) return;

    // Check if heroes are disabled in settings
    if (!state.settings.showHeroes) {
        // If heroes are disabled, hide everything
        heroSectionWrapper.style.display = 'none';
        return;
    }

    if (state.settings.alwaysShowAllHeroes) {
        // Hide the toggle button
        heroToggle.style.display = 'none';
        // Show the hero section
        heroSection.style.display = 'block';
        // Show the wrapper
        heroSectionWrapper.style.display = '';
    } else {
        // Show the toggle button
        heroToggle.style.display = '';
        // Hero section visibility is controlled by toggle
        // Show the wrapper
        heroSectionWrapper.style.display = '';
    }
}

// Select parent match type
function selectParentType(parentId) {
    state.selectedParentType = parentId;
    state.selectedChildType = null; // Reset child selection
    state.selectedResult = null; // Reset result when parent changes

    // Check if switching to Stadium mode with hero limit enabled
    const isStadiumMode = parentId === 'stadium';
    const limitStadiumHeroes = state.settings.limitStadiumHeroSelection;

    if (isStadiumMode && limitStadiumHeroes && state.selectedHeroes.length > 1) {
        // Keep only the first selected hero
        state.selectedHeroes = [state.selectedHeroes[0]];
        updateHeroButtons();
    }

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
        // Save to localStorage without child (child will be saved when selected)
        localStorage.setItem('owLastMatchType', JSON.stringify({
            parentType: parentId,
            childType: null
        }));
    } else {
        // No children, selection is complete
        document.getElementById('childTypes').style.display = 'none';
        // Save to localStorage
        localStorage.setItem('owLastMatchType', JSON.stringify({
            parentType: parentId,
            childType: null
        }));
    }

    updateSelectionDisplay();
    updateMatchTypeToggleText();
    updateSaveButton();
}

// Select child match type
function selectChildType(childId) {
    state.selectedChildType = childId;

    // Update UI - highlight selected child
    document.querySelectorAll('.child-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === childId);
    });

    // Save to localStorage
    localStorage.setItem('owLastMatchType', JSON.stringify({
        parentType: state.selectedParentType,
        childType: childId
    }));

    updateSelectionDisplay();
    updateMatchTypeToggleText();
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
        previewResult.textContent = getResultText(state.selectedResult);
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

        // If parent has children and child is selected, use child's displayLabel
        if (parent && parent.children.length > 0) {
            if (state.selectedChildType) {
                const child = parent.children.find(c => c.id === state.selectedChildType);
                const displayText = child && child.displayLabel ? child.displayLabel :
                    (child ? `${parent.label} > ${child.label}` : state.selectedChildType);
                previewType.textContent = displayText;
            } else {
                previewType.textContent = `${parent.label} (select type...)`;
            }
        } else {
            // No children, just show parent label
            const displayText = parent ? parent.label : state.selectedParentType;
            previewType.textContent = displayText;
        }
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

// ============================================
// SESSION MANAGEMENT
// ============================================

// Start a new session
function startNewSession() {
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

// ============================================
// MATCH OPERATIONS
// ============================================

// Wrapper for saveMatch that includes UI updates
function saveMatch() {
    saveMatchFromModule();
}

// Delete specific match
function deleteMatch(id) {
    if (confirm('Delete this match?')) {
        state.matches = state.matches.filter(match => match.id !== id);
        saveData();
        updateUI();
    }
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

// Update UI
function updateUI() {
    updateStats();
    updateSessionInfo();
    updateMatchList();
    updateUndoButton();
    updateStorageIndicator();
    checkExportReminder();
}

// ============================================
// SETTINGS MODAL FUNCTIONS
// ============================================

// Open settings modal
function openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (!modal) return;

    // Populate form with current settings
    document.getElementById('settingTheme').value = state.settings.theme;
    document.getElementById('settingAutoCollapseMatchType').checked = state.settings.autoCollapseMatchType;
    document.getElementById('settingAutoCollapseHero').checked = state.settings.autoCollapseHero;
    document.getElementById('settingRememberHeroSelection').checked = state.settings.rememberHeroSelection;
    document.getElementById('settingLimitStadiumHeroSelection').checked = state.settings.limitStadiumHeroSelection;
    document.getElementById('settingRecentHeroesCount').value = state.settings.recentHeroesCount;
    document.getElementById('recentHeroesCountValue').textContent = state.settings.recentHeroesCount;
    document.getElementById('settingMatchesPerPage').value = state.settings.matchesPerPage;
    document.getElementById('settingUseOwStyleText').checked = state.settings.useOwStyleText;
    document.getElementById('settingShowDrawButton').checked = state.settings.showDrawButton;
    document.getElementById('settingShowHeroes').checked = state.settings.showHeroes;
    document.getElementById('settingShowHeroPortraits').checked = state.settings.showHeroPortraits;
    document.getElementById('settingAlwaysShowAllHeroes').checked = state.settings.alwaysShowAllHeroes;
    document.getElementById('settingShowMatchSavedNotification').checked = state.settings.showMatchSavedNotification;
    document.getElementById('settingShowSessionNotification').checked = state.settings.showSessionNotification;
    document.getElementById('settingSessionAutoReset').value = state.settings.sessionAutoReset;
    document.getElementById('settingKeyboardShortcutsEnabled').checked = state.settings.keyboardShortcutsEnabled;
    document.getElementById('settingWasdEnabled').checked = state.settings.wasdEnabled;
    document.getElementById('settingNumberKeysEnabled').checked = state.settings.numberKeysEnabled;
    document.getElementById('settingHotkeysEnabled').checked = state.settings.hotkeysEnabled;

    // Update subsection visibility
    updateKeyboardShortcutsSubsection();

    // Update storage indicator
    updateStorageIndicator();

    modal.style.display = 'flex';
}

// Close settings modal
function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Save settings from modal
function saveSettingsFromModal() {
    // Get values from form
    state.settings.theme = document.getElementById('settingTheme').value;
    state.settings.autoCollapseMatchType = document.getElementById('settingAutoCollapseMatchType').checked;
    state.settings.autoCollapseHero = document.getElementById('settingAutoCollapseHero').checked;
    state.settings.rememberHeroSelection = document.getElementById('settingRememberHeroSelection').checked;
    state.settings.limitStadiumHeroSelection = document.getElementById('settingLimitStadiumHeroSelection').checked;
    state.settings.recentHeroesCount = parseInt(document.getElementById('settingRecentHeroesCount').value);
    const matchesPerPageValue = document.getElementById('settingMatchesPerPage').value;
    state.settings.matchesPerPage = matchesPerPageValue === 'all' ? 'all' : parseInt(matchesPerPageValue);
    state.settings.useOwStyleText = document.getElementById('settingUseOwStyleText').checked;
    state.settings.showDrawButton = document.getElementById('settingShowDrawButton').checked;
    state.settings.showHeroes = document.getElementById('settingShowHeroes').checked;
    state.settings.showHeroPortraits = document.getElementById('settingShowHeroPortraits').checked;
    state.settings.alwaysShowAllHeroes = document.getElementById('settingAlwaysShowAllHeroes').checked;
    state.settings.showMatchSavedNotification = document.getElementById('settingShowMatchSavedNotification').checked;
    state.settings.showSessionNotification = document.getElementById('settingShowSessionNotification').checked;
    state.settings.sessionAutoReset = document.getElementById('settingSessionAutoReset').value;
    state.settings.keyboardShortcutsEnabled = document.getElementById('settingKeyboardShortcutsEnabled').checked;
    state.settings.wasdEnabled = document.getElementById('settingWasdEnabled').checked;
    state.settings.numberKeysEnabled = document.getElementById('settingNumberKeysEnabled').checked;
    state.settings.hotkeysEnabled = document.getElementById('settingHotkeysEnabled').checked;

    // Save to localStorage
    saveSettings();

    // Apply theme change
    applyTheme(state.settings.theme);

    // Update UI based on new settings
    renderHeroButtons(); // Re-render hero buttons to show/hide portraits
    renderRecentHeroes(); // Re-render recent heroes to show/hide portraits
    updateResultButtonLabels(); // Update result button labels
    updateDrawButtonVisibility(); // Update draw button visibility
    updateHeroSectionsVisibility(); // Update hero sections visibility
    updateAlwaysShowAllHeroes(); // Update always show all heroes setting
    updateSelectionDisplay(); // Update result text display
    updateMatchList(); // Update match list to reflect new text style

    // Close modal
    closeSettingsModal();
}

// Reset settings to defaults
function resetSettingsToDefaults() {
    if (confirm('Reset all settings to defaults?')) {
        state.settings = { ...DEFAULT_SETTINGS };
        saveSettings();

        // Apply default theme
        applyTheme(state.settings.theme);

        // Re-open modal to show updated values
        openSettingsModal();

        // Update UI
        renderRecentHeroes();
    }
}

// Update keyboard shortcuts subsection visibility
function updateKeyboardShortcutsSubsection() {
    const masterToggle = document.getElementById('settingKeyboardShortcutsEnabled');
    const subsection = document.getElementById('keyboardShortcutsSub');

    if (masterToggle && subsection) {
        const isEnabled = masterToggle.checked;
        subsection.style.opacity = isEnabled ? '1' : '0.5';
        subsection.style.pointerEvents = isEnabled ? 'auto' : 'none';

        // Disable/enable child checkboxes
        subsection.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.disabled = !isEnabled;
        });
    }
}

// ============================================
// CHANGELOG MODAL FUNCTIONS
// ============================================

// Open changelog modal
async function openChangelogModal() {
    const modal = document.getElementById('changelogModal');
    const content = document.getElementById('changelogContent');
    if (!modal || !content) return;

    modal.style.display = 'flex';

    // Fetch and display changelog
    const changelogText = await loadChangelog();
    const changelogHTML = parseMarkdownToHTML(changelogText);
    content.innerHTML = changelogHTML;
}

// Close changelog modal
function closeChangelogModal() {
    const modal = document.getElementById('changelogModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Load changelog from file
async function loadChangelog() {
    try {
        const response = await fetch('CHANGELOG.md');
        const text = await response.text();
        return text;
    } catch (error) {
        console.error('Failed to load changelog:', error);
        return 'Failed to load changelog. Please visit the GitHub repository.';
    }
}

// Parse basic markdown to HTML for changelog display
function parseMarkdownToHTML(markdown) {
    let html = '';
    const lines = markdown.split('\n');
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Skip the title line (# Changelog)
        if (line.startsWith('# ')) {
            continue;
        }

        // Handle h2 headers (## Version)
        if (line.startsWith('## ')) {
            if (inList) {
                html += '</ul>\n';
                inList = false;
            }
            const headerText = line.substring(3);
            html += `<h2>${headerText}</h2>\n`;
            continue;
        }

        // Handle h3 headers (### Added, Changed, Fixed)
        if (line.startsWith('### ')) {
            if (inList) {
                html += '</ul>\n';
                inList = false;
            }
            const headerText = line.substring(4);
            html += `<h3>${headerText}</h3>\n`;
            continue;
        }

        // Handle list items
        if (line.startsWith('- ')) {
            if (!inList) {
                html += '<ul>\n';
                inList = true;
            }
            let listItem = line.substring(2);
            // Convert markdown links [text](url) to HTML
            listItem = listItem.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
            html += `<li>${listItem}</li>\n`;
            continue;
        }

        // Handle empty lines
        if (line.trim() === '') {
            if (inList) {
                html += '</ul>\n';
                inList = false;
            }
            continue;
        }

        // Handle regular text (like the description lines)
        if (line.trim().length > 0 && !line.startsWith('[')) {
            if (inList) {
                html += '</ul>\n';
                inList = false;
            }
            // Convert markdown links in regular text
            line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
            html += `<p class="changelog-description">${line}</p>\n`;
        }
    }

    // Close any open list
    if (inList) {
        html += '</ul>\n';
    }

    return html;
}

// Load and display version info
async function loadVersionInfo() {
    try {
        const response = await fetch('version.json');
        const versionData = await response.json();
        const versionElement = document.getElementById('appVersion');
        if (versionElement) {
            const versionText = `Version ${versionData.version}`;
            const commitHash = versionData.commitHash ? ` (${versionData.commitHash})` : '';
            versionElement.textContent = versionText + commitHash;
        }
    } catch (error) {
        console.error('Failed to load version info:', error);
        // Fallback if version.json can't be loaded
        const versionElement = document.getElementById('appVersion');
        if (versionElement) {
            versionElement.textContent = 'Version 1.1.0';
        }
    }
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

// Setup settings event listeners
function setupSettingsListeners() {
    // New session button
    const newSessionBtn = document.getElementById('newSessionBtn');
    if (newSessionBtn) {
        newSessionBtn.addEventListener('click', startNewSession);
    }

    // Theme toggle button
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettingsModal);
    }

    // Close button
    const closeBtn = document.getElementById('closeSettingsBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSettingsModal);
    }

    // Save button
    const saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveSettingsFromModal);
    }

    // Reset button
    const resetBtn = document.getElementById('resetSettingsBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSettingsToDefaults);
    }

    // Recent heroes count slider
    const recentHeroesSlider = document.getElementById('settingRecentHeroesCount');
    if (recentHeroesSlider) {
        recentHeroesSlider.addEventListener('input', (e) => {
            document.getElementById('recentHeroesCountValue').textContent = e.target.value;
        });
    }

    // Keyboard shortcuts master toggle
    const masterToggle = document.getElementById('settingKeyboardShortcutsEnabled');
    if (masterToggle) {
        masterToggle.addEventListener('change', updateKeyboardShortcutsSubsection);
    }

    // Data management buttons in modal
    const importBtnModal = document.getElementById('importBtnModal');
    if (importBtnModal) {
        importBtnModal.addEventListener('click', handleImportFile);
    }

    const exportBtnModal = document.getElementById('exportBtnModal');
    if (exportBtnModal) {
        exportBtnModal.addEventListener('click', exportToCSV);
    }

    const exportJsonBtnModal = document.getElementById('exportJsonBtnModal');
    if (exportJsonBtnModal) {
        exportJsonBtnModal.addEventListener('click', exportToJSON);
    }

    const clearBtnModal = document.getElementById('clearBtnModal');
    if (clearBtnModal) {
        clearBtnModal.addEventListener('click', clearAllData);
    }

    // Click outside modal to close
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeSettingsModal();
            }
        });
    }

    // Changelog button
    const changelogBtn = document.getElementById('changelogBtn');
    if (changelogBtn) {
        changelogBtn.addEventListener('click', openChangelogModal);
    }

    // Close changelog button
    const closeChangelogBtn = document.getElementById('closeChangelogBtn');
    if (closeChangelogBtn) {
        closeChangelogBtn.addEventListener('click', closeChangelogModal);
    }

    // Click outside changelog modal to close
    const changelogModal = document.getElementById('changelogModal');
    if (changelogModal) {
        changelogModal.addEventListener('click', (e) => {
            if (e.target === changelogModal) {
                closeChangelogModal();
            }
        });
    }
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

    // Click outside result buttons to deselect
    document.addEventListener('click', (e) => {
        const resultButtonsContainer = document.querySelector('.result-buttons');

        // Check if click is on a hero button or any hero-related element
        const clickedElement = e.target;
        const isHeroButton = clickedElement.closest('.hero-btn');
        const isRecentHeroContainer = clickedElement.closest('#recentHeroesContainer');
        const isHeroSectionWrapper = clickedElement.closest('.hero-section-wrapper');
        const isHeroToggle = clickedElement.closest('#heroSectionToggle') ||
                            clickedElement.classList?.contains('hero-toggle-btn');

        const isHeroClick = isHeroButton || isRecentHeroContainer || isHeroSectionWrapper || isHeroToggle;

        if (state.selectedResult &&
            resultButtonsContainer &&
            !resultButtonsContainer.contains(e.target) &&
            !isHeroClick) {
            selectResult(null);
        }
    });

    // Hero buttons (delegated)
    document.getElementById('heroButtons').addEventListener('click', (e) => {
        const btn = e.target.closest('.hero-btn');
        if (btn) toggleHero(btn.dataset.hero);
    });

    // Match type section toggle
    document.getElementById('matchTypeToggle').addEventListener('click', toggleMatchTypeSection);

    // Hero section toggle
    document.getElementById('heroSectionToggle').addEventListener('click', toggleHeroSection);

    // Clear heroes button
    document.getElementById('clearHeroesBtn').addEventListener('click', clearHeroes);

    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveMatch);

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

    // Settings modal listeners
    setupSettingsListeners();

    // Stats toggle buttons
    document.getElementById('statsToggleAllTime').addEventListener('click', () => {
        state.statsView = 'all-time';
        localStorage.setItem('owStatsView', state.statsView);
        updateStats();
    });

    document.getElementById('statsToggleSession').addEventListener('click', () => {
        state.statsView = 'session';
        localStorage.setItem('owStatsView', state.statsView);
        updateStats();
    });

    // Match history toggle buttons
    document.getElementById('matchHistoryToggleAllTime').addEventListener('click', () => {
        state.matchHistoryView = 'all-time';
        state.matchHistoryPage = 1; // Reset to first page
        localStorage.setItem('owMatchHistoryView', state.matchHistoryView);
        updateMatchList();
    });

    document.getElementById('matchHistoryToggleSession').addEventListener('click', () => {
        state.matchHistoryView = 'session';
        state.matchHistoryPage = 1; // Reset to first page
        localStorage.setItem('owMatchHistoryView', state.matchHistoryView);
        updateMatchList();
    });

    // Pagination controls
    document.getElementById('prevPageBtn').addEventListener('click', () => {
        if (state.matchHistoryPage > 1) {
            state.matchHistoryPage--;
            updateMatchList();
        }
    });

    document.getElementById('nextPageBtn').addEventListener('click', () => {
        state.matchHistoryPage++;
        updateMatchList();
    });
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize the app
function init() {
    loadSettings(); // Load settings first so they're available for loadData()
    applyTheme(state.settings.theme); // Apply theme after loading settings
    loadData();

    // Initialize dependency injection for modules
    initKeyboardNav({
        toggleMatchTypeSection,
        selectParentType,
        selectChildType,
        toggleHeroSection,
        toggleHero,
        clearHeroes,
        selectResult,
        saveMatch,
        undoLastMatch
    });

    initImportExport({
        updateUI,
        updateStats,
        updateSessionInfo,
        renderRecentHeroes,
        updateMatchTypeToggleText,
        updateSelectionDisplay
    });

    initMatchManager({
        renderRecentHeroes,
        updateHeroButtons,
        updateMatchTypeToggleText,
        updateSelectionDisplay,
        updateSaveButton,
        updateUI,
        updateFocusVisuals,
        getMatchTypeDisplayLabel,
        getResultText,
        showToast
    });

    initUIRenderer({
        toggleHero,
        deleteMatch,
        updateSelectionDisplay,
        updateSaveButton,
        showToast
    });

    renderMatchTypeButtons();
    renderHeroButtons();
    renderRecentHeroes();
    setupEventListeners();

    // Apply loaded match type selection if any
    if (state.selectedParentType) {
        // Highlight the selected parent
        document.querySelectorAll('.parent-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === state.selectedParentType);
        });

        // Render child types if parent has children
        const parent = CONFIG.matchTypes.find(t => t.id === state.selectedParentType);
        if (parent && parent.children.length > 0) {
            renderChildTypeButtons(state.selectedParentType);

            // Highlight the selected child if any
            if (state.selectedChildType) {
                document.querySelectorAll('.child-type-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.type === state.selectedChildType);
                });
            }
        }

        // Update the toggle button text and selection display
        updateMatchTypeToggleText();
        updateSelectionDisplay();
    }

    updateUI();
    updateStorageIndicator();
    checkExportReminder();

    // Ensure save button starts in neutral state (no result color classes)
    // Also clear any stale result from state
    state.selectedResult = null;

    // Update displays to reflect cleared state
    updateSelectionDisplay();
    updateSaveButton();

    // Update result button labels based on settings
    updateResultButtonLabels();

    // Update draw button visibility based on settings
    updateDrawButtonVisibility();

    // Update hero sections visibility based on settings
    updateHeroSectionsVisibility();

    // Update always show all heroes setting
    updateAlwaysShowAllHeroes();

    const saveBtn = document.getElementById('saveBtn');
    saveBtn.classList.remove('win', 'loss', 'draw');

    // Don't set initial focus - start defocused
    // User can press WASD or spacebar to begin navigating

    // Show notification if session was automatically reset
    if (state.pendingSessionResetNotification && state.settings.showSessionNotification) {
        const stats = state.pendingSessionResetNotification;
        if (stats.count > 0) {
            showToast(`New session started! Previous: ${stats.count} matches (${stats.winRate}% WR)`, 'info', 3500);
        } else {
            showToast('New session started!', 'info', 2500);
        }
        // Clear the pending notification
        delete state.pendingSessionResetNotification;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        loadVersionInfo();
    });
} else {
    init();
    loadVersionInfo();
}

// ============================================
// EXPORTS FOR HTML ONCLICK HANDLERS
// ============================================

// Make deleteMatch available globally for HTML onclick handlers
window.deleteMatch = deleteMatch;
