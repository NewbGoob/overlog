// ============================================
// MATCH MANAGER MODULE
// ============================================

import { CONFIG } from './config.js';
import { state } from './state.js';
import { saveData } from './storage.js';

// Dependencies to be injected by main app
let renderRecentHeroes, updateHeroButtons, updateMatchTypeToggleText;
let updateSelectionDisplay, updateSaveButton, updateUI, updateFocusVisuals;
let getMatchTypeDisplayLabel, getResultText, showToast;

// Initialize match manager with function dependencies
export function initMatchManager(deps) {
    renderRecentHeroes = deps.renderRecentHeroes;
    updateHeroButtons = deps.updateHeroButtons;
    updateMatchTypeToggleText = deps.updateMatchTypeToggleText;
    updateSelectionDisplay = deps.updateSelectionDisplay;
    updateSaveButton = deps.updateSaveButton;
    updateUI = deps.updateUI;
    updateFocusVisuals = deps.updateFocusVisuals;
    getMatchTypeDisplayLabel = deps.getMatchTypeDisplayLabel;
    getResultText = deps.getResultText;
    showToast = deps.showToast;
}

// Save a new match
export function saveMatch() {
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
        timestamp: new Date().toISOString(),
        sessionId: state.sessionStartTime ? state.sessionStartTime.getTime() : Date.now()
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
        // Keep only up to the configured count (or 8 max to keep history)
        const maxRecent = Math.max(state.settings.recentHeroesCount, 8);
        state.recentHeroes = state.recentHeroes.slice(0, maxRecent);
        // Save to localStorage
        localStorage.setItem('owRecentHeroes', JSON.stringify(state.recentHeroes));
        // Re-render recent heroes
        renderRecentHeroes();
    }

    // Reset only result and heroes (keep match type selected for quick back-to-back logging)
    state.selectedResult = null;

    // Only clear heroes if the setting is disabled
    if (!state.settings.rememberHeroSelection) {
        state.selectedHeroes = [];
    }

    // Update UI - clear only result and hero selections
    document.querySelectorAll('.result-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Remove result color class from save button
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.classList.remove('win', 'loss', 'draw');

    updateHeroButtons();

    // Auto-collapse hero section after match submission (if enabled in settings)
    if (state.settings.autoCollapseHero) {
        const heroSection = document.getElementById('heroSelection');
        const heroToggle = document.getElementById('heroSectionToggle');
        if (heroSection && heroSection.style.display !== 'none') {
            heroSection.style.display = 'none';
            heroToggle.innerHTML = '<span class="key-hint">E</span> Add Heroes (Optional) ▼';
        }
    }

    // Auto-collapse match type section after first match (if enabled in settings)
    if (state.settings.autoCollapseMatchType) {
        const matchTypeSection = document.getElementById('matchTypeSection');
        if (matchTypeSection && matchTypeSection.style.display !== 'none') {
            matchTypeSection.style.display = 'none';
            updateMatchTypeToggleText();
        }
    }

    // Move focus to result for next match
    state.focusZone = 'result';
    state.focusIndex = 0;

    // Reset to first page to show newly saved match
    state.matchHistoryPage = 1;

    updateSelectionDisplay();
    updateSaveButton();
    updateUI();
    updateFocusVisuals();

    // Visual feedback
    saveBtn.textContent = 'Saved!';
    setTimeout(() => {
        saveBtn.textContent = 'Save Match';
    }, 1000);

    // Show toast notification if enabled
    if (state.settings.showMatchSavedNotification) {
        const matchTypeLabel = getMatchTypeDisplayLabel();
        const resultText = getResultText(state.selectedResult || match.result);
        showToast(`Match saved! <span class="toast-match-details">${matchTypeLabel} - ${resultText}</span>`, 'success', 2500);
    }
}

// Undo last match
export function undoLastMatch() {
    if (state.matches.length === 0) {
        return;
    }

    state.matches.shift(); // Remove first (most recent) match
    state.matchHistoryPage = 1; // Reset to first page
    saveData();
    updateUI();
}

// Delete specific match
export function deleteMatch(id) {
    if (confirm('Delete this match?')) {
        state.matches = state.matches.filter(match => match.id !== id);
        state.matchHistoryPage = 1; // Reset to first page
        saveData();
        updateUI();
    }
}
