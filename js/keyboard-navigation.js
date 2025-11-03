// ============================================
// KEYBOARD NAVIGATION MODULE
// ============================================

import { CONFIG } from './config.js';
import { state } from './state.js';

// These functions will be injected by the main app to avoid circular dependencies
let toggleMatchTypeSection, selectParentType, selectChildType;
let toggleHeroSection, toggleHero, clearHeroes;
let selectResult, saveMatch, undoLastMatch;

// Initialize keyboard navigation with function dependencies
export function initKeyboardNav(deps) {
    toggleMatchTypeSection = deps.toggleMatchTypeSection;
    selectParentType = deps.selectParentType;
    selectChildType = deps.selectChildType;
    toggleHeroSection = deps.toggleHeroSection;
    toggleHero = deps.toggleHero;
    clearHeroes = deps.clearHeroes;
    selectResult = deps.selectResult;
    saveMatch = deps.saveMatch;
    undoLastMatch = deps.undoLastMatch;
}

// Helper function to check if hero toggle should be shown
function shouldShowHeroToggle() {
    return !state.settings.alwaysShowAllHeroes;
}

// Handle focus when clicking on elements
export function handleClickFocus(e) {
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
        // Only allow focus if hero toggle is shown
        if (shouldShowHeroToggle()) {
            state.focusZone = 'hero-toggle';
            state.focusIndex = 0;
            updateFocusVisuals();
        }
    } else if (target.classList.contains('hero-btn') && !target.classList.contains('recent-hero-btn')) {
        const heroButtons = Array.from(document.querySelectorAll('.hero-btn:not(.recent-hero-btn)'));
        const index = heroButtons.indexOf(target);
        if (index >= 0) {
            state.focusZone = 'heroes';
            state.focusIndex = index;
            updateFocusVisuals();
        }
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
export function handleKeyboard(e) {
    // Prevent shortcuts if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
    }

    // Check if keyboard shortcuts are globally enabled
    if (!state.settings.keyboardShortcutsEnabled) {
        return;
    }

    const key = e.key.toLowerCase();

    // WASD Navigation
    if (state.settings.wasdEnabled && ['w', 'a', 's', 'd'].includes(key)) {
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
    if (state.settings.hotkeysEnabled && e.key === ' ') {
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
    if (state.settings.hotkeysEnabled && e.ctrlKey && e.key === 'z' && state.matches.length > 0) {
        e.preventDefault();
        undoLastMatch();
        return;
    }

    // T key - Toggle match type drawer
    if (state.settings.hotkeysEnabled && key === 't') {
        e.preventDefault();
        toggleMatchTypeSectionWithFocus();
        return;
    }

    // E key - Toggle hero drawer
    if (state.settings.hotkeysEnabled && key === 'e') {
        e.preventDefault();
        toggleHeroSectionWithFocus();
        return;
    }

    // C key - Clear heroes
    if (state.settings.hotkeysEnabled && key === 'c') {
        e.preventDefault();
        clearHeroes();
        return;
    }

    // Parent type hotkeys (1, 2, 3, 4, etc.)
    // Check if the pressed key matches any parent type key
    if (state.settings.numberKeysEnabled) {
        const matchingParentType = CONFIG.matchTypes.find(type => type.key === key);
        if (matchingParentType) {
            e.preventDefault();

            // Check if match type section is hidden, if so open it first
            const matchTypeSection = document.getElementById('matchTypeSection');
            const isHidden = !matchTypeSection || matchTypeSection.style.display === 'none';

            if (isHidden) {
                toggleMatchTypeSection();
            }

            selectParentType(matchingParentType.id);

            // Auto-advance focus to child types if available, otherwise use priority logic
            if (matchingParentType.children.length > 0) {
                state.focusZone = 'child';
                state.focusIndex = 0;
            } else {
                const nextFocus = getNextFocusAfterMatchTypeSelection();
                state.focusZone = nextFocus.zone;
                state.focusIndex = nextFocus.index;
            }
            updateFocusVisuals();
            return;
        }
    }
}

// Handle WASD navigation
function handleWASDNavigation(key) {
    const currentZone = state.focusZone;
    const heroSection = document.getElementById('heroSelection');
    const isHeroSectionVisible = heroSection && heroSection.style.display !== 'none';
    const recentHeroesContainer = document.getElementById('recentHeroesContainer');
    const hasRecentHeroes = recentHeroesContainer && recentHeroesContainer.style.display !== 'none';
    const showHeroes = state.settings.showHeroes;

    // Special handling for heroes zone - W/S moves vertically in grid
    if (currentZone === 'heroes' && (key === 'w' || key === 's')) {
        handleHeroGridNavigation(key);
        return;
    }

    if (key === 'w') {
        // Move up (previous zone)
        if (currentZone === 'parent') {
            // Can't go up from parent types (it's at the top now)
            return;
        } else if (currentZone === 'child') {
            // Move from child to parent
            state.focusZone = 'parent';
            state.focusIndex = 0;
        } else if (currentZone === 'result') {
            // If heroes are visible, go to heroes (if drawer open) or hero-toggle (if shown) or recent heroes
            if (showHeroes) {
                if (isHeroSectionVisible || !shouldShowHeroToggle()) {
                    // Hero section is visible, or always shown - go to heroes
                    state.focusZone = 'heroes';
                    const heroButtons = document.querySelectorAll('.hero-btn:not(.recent-hero-btn)');
                    state.focusIndex = Math.max(0, heroButtons.length - 1);
                } else {
                    // Hero section is hidden and toggle is shown - go to toggle
                    state.focusZone = 'hero-toggle';
                    state.focusIndex = 0;
                }
            } else {
                // Heroes hidden, go to match types
                const matchTypeSection = document.getElementById('matchTypeSection');
                if (matchTypeSection && matchTypeSection.style.display !== 'none') {
                    // Check if child types are visible
                    const childTypes = document.getElementById('childTypes');
                    if (childTypes && childTypes.style.display !== 'none') {
                        state.focusZone = 'child';
                        state.focusIndex = 0;
                    } else {
                        state.focusZone = 'parent';
                        state.focusIndex = 0;
                    }
                } else {
                    // Match type section is collapsed, can't navigate to it
                    return;
                }
            }
        } else if (currentZone === 'save') {
            // Always move from save to result buttons
            state.focusZone = 'result';
            state.focusIndex = 0;
        } else if (currentZone === 'heroes') {
            // Move from heroes up - skip hero-toggle if not shown
            if (shouldShowHeroToggle()) {
                state.focusZone = 'hero-toggle';
                state.focusIndex = 0;
            } else if (hasRecentHeroes) {
                state.focusZone = 'recent-heroes';
                state.focusIndex = 0;
            } else {
                // No toggle, no recent heroes - go to match types
                const matchTypeSection = document.getElementById('matchTypeSection');
                if (matchTypeSection && matchTypeSection.style.display !== 'none') {
                    // Check if child types are visible
                    const childTypes = document.getElementById('childTypes');
                    if (childTypes && childTypes.style.display !== 'none') {
                        state.focusZone = 'child';
                        state.focusIndex = 0;
                    } else {
                        state.focusZone = 'parent';
                        state.focusIndex = 0;
                    }
                } else {
                    // Match type section is collapsed, can't navigate to it
                    return;
                }
            }
        } else if (currentZone === 'hero-toggle') {
            // Move from hero-toggle to recent-heroes if available, otherwise match types
            if (hasRecentHeroes) {
                state.focusZone = 'recent-heroes';
                state.focusIndex = 0;
            } else {
                // No recent heroes, go to match types
                const matchTypeSection = document.getElementById('matchTypeSection');
                if (matchTypeSection && matchTypeSection.style.display !== 'none') {
                    // Check if child types are visible
                    const childTypes = document.getElementById('childTypes');
                    if (childTypes && childTypes.style.display !== 'none') {
                        state.focusZone = 'child';
                        state.focusIndex = 0;
                    } else {
                        state.focusZone = 'parent';
                        state.focusIndex = 0;
                    }
                } else {
                    // No match type section visible, can't navigate to it
                    return;
                }
            }
        } else if (currentZone === 'recent-heroes') {
            // Move from recent-heroes to match types
            const matchTypeSection = document.getElementById('matchTypeSection');
            if (matchTypeSection && matchTypeSection.style.display !== 'none') {
                // Check if child types are visible
                const childTypes = document.getElementById('childTypes');
                if (childTypes && childTypes.style.display !== 'none') {
                    state.focusZone = 'child';
                    state.focusIndex = 0;
                } else {
                    state.focusZone = 'parent';
                    state.focusIndex = 0;
                }
            } else {
                // No match type section visible, can't navigate to it
                return;
            }
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
                // No child types, check if heroes are visible
                if (showHeroes) {
                    if (hasRecentHeroes) {
                        state.focusZone = 'recent-heroes';
                        state.focusIndex = 0;
                    } else if (shouldShowHeroToggle()) {
                        state.focusZone = 'hero-toggle';
                        state.focusIndex = 0;
                    } else {
                        // Heroes always shown, go to heroes
                        state.focusZone = 'heroes';
                        state.focusIndex = 0;
                    }
                } else {
                    state.focusZone = 'result';
                    state.focusIndex = 0;
                }
            }
        } else if (currentZone === 'child') {
            // Check if heroes are visible
            if (showHeroes) {
                if (hasRecentHeroes) {
                    state.focusZone = 'recent-heroes';
                    state.focusIndex = 0;
                } else if (shouldShowHeroToggle()) {
                    state.focusZone = 'hero-toggle';
                    state.focusIndex = 0;
                } else {
                    // Heroes always shown, go to heroes
                    state.focusZone = 'heroes';
                    state.focusIndex = 0;
                }
            } else {
                state.focusZone = 'result';
                state.focusIndex = 0;
            }
        } else if (currentZone === 'result') {
            // Move to save button
            const saveBtn = document.getElementById('saveBtn');
            if (saveBtn && !saveBtn.disabled) {
                state.focusZone = 'save';
                state.focusIndex = 0;
            }
        } else if (currentZone === 'recent-heroes') {
            // Move down from recent heroes - skip hero-toggle if not shown
            if (shouldShowHeroToggle()) {
                state.focusZone = 'hero-toggle';
                state.focusIndex = 0;
            } else {
                // Skip to heroes
                state.focusZone = 'heroes';
                state.focusIndex = 0;
            }
        } else if (currentZone === 'hero-toggle') {
            // Move to heroes if visible, otherwise results
            if (isHeroSectionVisible) {
                state.focusZone = 'heroes';
                state.focusIndex = 0;
            } else {
                state.focusZone = 'result';
                state.focusIndex = 0;
            }
        } else if (currentZone === 'heroes') {
            // Move to results
            state.focusZone = 'result';
            state.focusIndex = 0;
        }
    } else if (key === 'a') {
        // Move left within current zone
        if (currentZone === 'heroes') {
            // Special handling for heroes zone - skip disabled heroes
            const heroButtons = document.querySelectorAll('.hero-btn:not(.recent-hero-btn)');
            let newIndex = state.focusIndex - 1;

            // Find next enabled hero to the left
            while (newIndex >= 0) {
                if (!heroButtons[newIndex].classList.contains('disabled')) {
                    state.focusIndex = newIndex;
                    state.lastHeroFocusIndex = newIndex;
                    break;
                }
                newIndex--;
            }
        } else {
            if (state.focusIndex > 0) {
                state.focusIndex--;
            }
        }
    } else if (key === 'd') {
        // Move right within current zone
        if (currentZone === 'heroes') {
            // Special handling for heroes zone - skip disabled heroes
            const heroButtons = document.querySelectorAll('.hero-btn:not(.recent-hero-btn)');
            const maxIndex = heroButtons.length - 1;
            let newIndex = state.focusIndex + 1;

            // Find next enabled hero to the right
            while (newIndex <= maxIndex) {
                if (!heroButtons[newIndex].classList.contains('disabled')) {
                    state.focusIndex = newIndex;
                    state.lastHeroFocusIndex = newIndex;
                    break;
                }
                newIndex++;
            }
        } else {
            const maxIndex = getMaxIndexForZone(currentZone);
            if (state.focusIndex < maxIndex) {
                state.focusIndex++;
            }
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

            // Skip disabled heroes
            if (btn.classList.contains('disabled')) continue;

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
            // No button above, exit upward - skip hero-toggle if not shown
            state.lastHeroFocusIndex = state.focusIndex;
            const recentHeroesContainer = document.getElementById('recentHeroesContainer');
            const hasRecentHeroes = recentHeroesContainer && recentHeroesContainer.style.display !== 'none';

            if (shouldShowHeroToggle()) {
                state.focusZone = 'hero-toggle';
                state.focusIndex = 0;
            } else if (hasRecentHeroes) {
                state.focusZone = 'recent-heroes';
                state.focusIndex = 0;
            } else {
                // No toggle and no recent heroes, go to child or parent match types
                const childTypes = document.getElementById('childTypes');
                if (childTypes && childTypes.style.display !== 'none') {
                    state.focusZone = 'child';
                    state.focusIndex = 0;
                } else {
                    state.focusZone = 'parent';
                    state.focusIndex = 0;
                }
            }
        }
    } else if (key === 's') {
        // Move down - find closest button below current position
        for (let i = 0; i < heroButtons.length; i++) {
            const btn = heroButtons[i];

            // Skip disabled heroes
            if (btn.classList.contains('disabled')) continue;

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
            // No button below, exit to result zone
            state.lastHeroFocusIndex = state.focusIndex;
            state.focusZone = 'result';
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
    } else if (zone === 'result') {
        // Return 2 for three buttons (Win, Loss, Draw) or 1 for two buttons (Win, Loss)
        return state.settings.showDrawButton ? 2 : 1;
    } else if (zone === 'save') {
        return 0; // Only one button
    }
    return 0;
}

// Determine next focus after match type selection
function getNextFocusAfterMatchTypeSelection() {
    const showHeroes = state.settings.showHeroes;

    if (showHeroes) {
        // Priority 1: Currently selected hero in recent heroes
        const recentButtons = document.querySelectorAll('.recent-hero-btn');
        if (recentButtons.length > 0) {
            for (let i = 0; i < recentButtons.length; i++) {
                const heroId = recentButtons[i].dataset.hero;
                if (state.selectedHeroes.includes(heroId)) {
                    return { zone: 'recent-heroes', index: i };
                }
            }
            // Priority 2: First listed hero in recent heroes
            return { zone: 'recent-heroes', index: 0 };
        }

        // Priority 3: First selected hero in main heroes section
        const heroButtons = document.querySelectorAll('.hero-btn:not(.recent-hero-btn)');
        const heroSection = document.getElementById('heroSelection');
        const isHeroSectionVisible = heroSection && heroSection.style.display !== 'none';
        const alwaysShowAllHeroes = state.settings.alwaysShowAllHeroes;

        if ((isHeroSectionVisible || alwaysShowAllHeroes) && heroButtons.length > 0) {
            for (let i = 0; i < heroButtons.length; i++) {
                const heroId = heroButtons[i].dataset.hero;
                if (state.selectedHeroes.includes(heroId)) {
                    return { zone: 'heroes', index: i };
                }
            }
            // Priority 4: First listed hero in main heroes section
            return { zone: 'heroes', index: 0 };
        }

        // Priority 5: Add Heroes button (only if toggle is shown)
        if (shouldShowHeroToggle()) {
            return { zone: 'hero-toggle', index: 0 };
        }
    }

    // Priority 6 (for both heroes disabled and heroes always shown with no heroes): Result buttons
    // Check for currently selected result button
    const resultButtons = document.querySelectorAll('.result-btn');
    const visibleResultButtons = Array.from(resultButtons).filter(btn => btn.style.display !== 'none');

    if (state.selectedResult) {
        for (let i = 0; i < visibleResultButtons.length; i++) {
            if (visibleResultButtons[i].dataset.result === state.selectedResult) {
                return { zone: 'result', index: i };
            }
        }
    }

    // Priority 7: First listed result button (Win)
    return { zone: 'result', index: 0 };
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

            // Check if this parent has children
            const parent = CONFIG.matchTypes.find(t => t.id === typeId);
            if (parent && parent.children.length > 0) {
                // Has children, go to child selection
                state.focusZone = 'child';
                state.focusIndex = 0;
            } else {
                // No children, match type is complete - use priority logic
                const nextFocus = getNextFocusAfterMatchTypeSelection();
                state.focusZone = nextFocus.zone;
                state.focusIndex = nextFocus.index;
            }
        }
    } else if (zone === 'child') {
        const childButtons = document.querySelectorAll('.child-type-btn');
        if (childButtons[index]) {
            const typeId = childButtons[index].dataset.type;
            selectChildType(typeId);
            // Match type is complete - use priority logic
            const nextFocus = getNextFocusAfterMatchTypeSelection();
            state.focusZone = nextFocus.zone;
            state.focusIndex = nextFocus.index;
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
        const heroButtons = document.querySelectorAll('.hero-btn:not(.recent-hero-btn)');
        if (heroButtons[index]) {
            const heroId = heroButtons[index].dataset.hero;
            toggleHero(heroId);
            // Don't auto-advance, stay in heroes zone for multi-selection
        }
    } else if (zone === 'result') {
        // Only include visible result buttons
        const allResultButtons = document.querySelectorAll('.result-btn');
        const visibleResultButtons = Array.from(allResultButtons).filter(btn => btn.style.display !== 'none');
        if (visibleResultButtons[index]) {
            const result = visibleResultButtons[index].dataset.result;

            // Toggle: if already selected, deselect it
            if (state.selectedResult === result) {
                selectResult(null);
                // Stay in result zone when deselecting
            } else {
                selectResult(result);
                // Auto-advance to save if available
                const saveBtn = document.getElementById('saveBtn');
                if (saveBtn && !saveBtn.disabled) {
                    state.focusZone = 'save';
                    state.focusIndex = 0;
                }
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
export function updateFocusVisuals() {
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

        // If focused hero is disabled, find nearest enabled hero
        if (focusedElement && focusedElement.classList.contains('disabled')) {
            let nearestEnabled = null;
            let nearestDistance = Infinity;

            // Search all hero buttons for nearest enabled one
            for (let i = 0; i < heroButtons.length; i++) {
                const btn = heroButtons[i];
                if (!btn.classList.contains('disabled')) {
                    const distance = Math.abs(i - index);
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestEnabled = i;
                    }
                }
            }

            // Update focus to nearest enabled hero
            if (nearestEnabled !== null) {
                state.focusIndex = nearestEnabled;
                state.lastHeroFocusIndex = nearestEnabled;
                focusedElement = heroButtons[nearestEnabled];
            } else {
                // No enabled heroes, exit zone
                state.focusZone = 'hero-toggle';
                state.focusIndex = 0;
                focusedElement = document.getElementById('heroSectionToggle');
            }
        }
    } else if (zone === 'result') {
        // Only include visible result buttons
        const allResultButtons = document.querySelectorAll('.result-btn');
        const visibleResultButtons = Array.from(allResultButtons).filter(btn => btn.style.display !== 'none');
        focusedElement = visibleResultButtons[index];
    } else if (zone === 'save') {
        focusedElement = document.getElementById('saveBtn');
    }

    if (focusedElement) {
        focusedElement.classList.add('keyboard-focused');
        // Scroll into view if needed
        focusedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Toggle match type section with focus management
function toggleMatchTypeSectionWithFocus() {
    toggleMatchTypeSection();
    const matchTypeSection = document.getElementById('matchTypeSection');
    const isVisible = matchTypeSection && matchTypeSection.style.display !== 'none';

    if (isVisible) {
        state.focusZone = 'parent';
        state.focusIndex = 0;
    } else {
        state.focusZone = 'result';
        state.focusIndex = 0;
    }
    updateFocusVisuals();
}

// Toggle hero section with focus management
function toggleHeroSectionWithFocus() {
    // If always showing all heroes, just focus the heroes area instead of toggling
    if (state.settings.alwaysShowAllHeroes) {
        state.focusZone = 'heroes';
        state.focusIndex = 0;
        updateFocusVisuals();
        return;
    }

    toggleHeroSection();
    const heroSection = document.getElementById('heroSelection');
    const isVisible = heroSection && heroSection.style.display !== 'none';

    if (isVisible) {
        state.focusZone = 'heroes';
        state.focusIndex = 0;
    } else {
        state.focusZone = 'save';
        state.focusIndex = 0;
    }
    updateFocusVisuals();
}
