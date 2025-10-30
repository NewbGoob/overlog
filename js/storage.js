// ============================================
// STORAGE MODULE - LocalStorage operations
// ============================================

import { CONFIG, DEFAULT_SETTINGS } from './config.js';
import { state } from './state.js';

// Load data from localStorage on init
// Returns info about auto-reset if it occurred
export function loadData() {
    const savedMatches = localStorage.getItem('owMatches');
    if (savedMatches) {
        state.matches = JSON.parse(savedMatches);
    }

    const savedSession = localStorage.getItem('owSessionStart');
    let autoResetOccurred = false;
    let previousSessionStats = null;

    if (savedSession) {
        const sessionDate = new Date(savedSession);
        const today = new Date();

        // Check if session should be reset based on settings
        let shouldReset = false;

        if (state.settings.sessionAutoReset === 'onlaunch') {
            // Always reset on app launch
            shouldReset = true;
        } else if (state.settings.sessionAutoReset === 'daily') {
            // Reset if it's a new day
            shouldReset = sessionDate.toDateString() !== today.toDateString();
        }
        // If 'manual', never auto-reset (shouldReset stays false)

        if (shouldReset) {
            // Calculate previous session stats before resetting
            const previousSessionMatches = state.matches.filter(match => {
                const matchDate = new Date(match.timestamp);
                return matchDate >= sessionDate;
            });
            const prevCount = previousSessionMatches.length;
            const prevWins = previousSessionMatches.filter(m => m.result === 'win').length;
            const prevWR = prevCount > 0 ? ((prevWins / prevCount) * 100).toFixed(1) : 0;

            previousSessionStats = { count: prevCount, winRate: prevWR };
            autoResetOccurred = true;

            state.sessionStartTime = new Date();
            localStorage.setItem('owSessionStart', state.sessionStartTime.toISOString());
        } else {
            state.sessionStartTime = sessionDate;
        }
    } else {
        state.sessionStartTime = new Date();
        localStorage.setItem('owSessionStart', state.sessionStartTime.toISOString());
    }

    // Store auto-reset info for later toast display (after init completes)
    if (autoResetOccurred) {
        state.pendingSessionResetNotification = previousSessionStats;
    }

    // Load recent heroes
    const savedRecentHeroes = localStorage.getItem('owRecentHeroes');
    if (savedRecentHeroes) {
        state.recentHeroes = JSON.parse(savedRecentHeroes);
    }

    // Load last selected match type
    const savedMatchType = localStorage.getItem('owLastMatchType');
    if (savedMatchType) {
        try {
            const { parentType, childType } = JSON.parse(savedMatchType);
            // Validate that the saved types still exist in config
            const parent = CONFIG.matchTypes.find(t => t.id === parentType);
            if (parent) {
                state.selectedParentType = parentType;
                if (childType && parent.children.some(c => c.id === childType)) {
                    state.selectedChildType = childType;
                }
            }
        } catch (e) {
            // Invalid saved data, ignore
        }
    }

    // Load stats view preference
    const savedStatsView = localStorage.getItem('owStatsView');
    if (savedStatsView && (savedStatsView === 'all-time' || savedStatsView === 'session')) {
        state.statsView = savedStatsView;
    }

    // Load match history view preference
    const savedMatchHistoryView = localStorage.getItem('owMatchHistoryView');
    if (savedMatchHistoryView && (savedMatchHistoryView === 'all-time' || savedMatchHistoryView === 'session')) {
        state.matchHistoryView = savedMatchHistoryView;
    }
}

// Load settings from localStorage
// Note: Caller should apply theme after loading
export function loadSettings() {
    const savedSettings = localStorage.getItem('owSettings');
    if (savedSettings) {
        try {
            const parsed = JSON.parse(savedSettings);
            // Merge with defaults to handle new settings added in updates
            state.settings = { ...DEFAULT_SETTINGS, ...parsed };
        } catch (e) {
            // Invalid settings data, use defaults
            state.settings = { ...DEFAULT_SETTINGS };
        }
    } else {
        state.settings = { ...DEFAULT_SETTINGS };
    }
}

// Save settings to localStorage
// Note: Caller should apply theme after saving if needed
export function saveSettings() {
    localStorage.setItem('owSettings', JSON.stringify(state.settings));
}

// Save match data to localStorage
export function saveData() {
    localStorage.setItem('owMatches', JSON.stringify(state.matches));
}

// ============================================
// STORAGE MANAGEMENT
// ============================================

// Get storage usage information
export function getStorageInfo() {
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
export function updateStorageIndicator() {
    const info = getStorageInfo();

    // Show KB if less than 1 MB, otherwise show MB
    const sizeDisplay = info.sizeInMB < 1
        ? `${info.sizeInKB.toFixed(1)}KB`
        : `${info.sizeInMB}MB`;

    const displayText = `Local Storage: ${sizeDisplay} / ~${info.limitMB}MB (${info.percentUsed}%)`;

    // Update modal indicator
    const indicatorModal = document.getElementById('storageIndicatorModal');
    if (indicatorModal) {
        indicatorModal.textContent = displayText;
        if (info.isNearLimit) {
            indicatorModal.classList.add('warning');
        } else {
            indicatorModal.classList.remove('warning');
        }
    }

    // Update warning banner if near limit
    if (info.isNearLimit) {
        showStorageWarning();
    } else {
        hideStorageWarning();
    }
}

// Show storage warning banner
export function showStorageWarning() {
    const banner = document.getElementById('storageWarningBanner');
    if (banner) {
        banner.style.display = 'block';
    }
}

// Hide storage warning banner
export function hideStorageWarning() {
    const banner = document.getElementById('storageWarningBanner');
    if (banner) {
        banner.style.display = 'none';
    }
}

// Close storage warning banner
export function closeStorageWarning() {
    hideStorageWarning();
}

// Check and show export reminder
export function checkExportReminder() {
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
export function showExportReminder() {
    const banner = document.getElementById('exportReminderBanner');
    if (banner) {
        banner.style.display = 'block';
    }
}

// Hide export reminder banner
export function closeExportReminder() {
    const banner = document.getElementById('exportReminderBanner');
    if (banner) {
        banner.style.display = 'none';
    }
}
