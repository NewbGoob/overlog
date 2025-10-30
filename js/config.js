// ============================================
// CONFIGURATION - Edit these to customize
// ============================================

export const CONFIG = {
    matchTypes: [
        {
            id: 'unranked',
            label: 'Unranked',
            key: '1',
            children: [
                { id: 'quickplay', label: 'Quick Play', displayLabel: 'Quick Play', key: 'q' },
                { id: '6v6-openqueue', label: '6V6 Open Queue', displayLabel: '6V6 Open Queue', key: 'o' },
                { id: 'mystery-heroes', label: 'Mystery Heroes', displayLabel: 'Mystery Heroes', key: 'm' }
            ]
        },
        {
            id: 'competitive',
            label: 'Competitive',
            key: '2',
            children: [
                { id: 'role-queue', label: 'Role Queue', displayLabel: 'Competitive Role Queue', key: 'r' },
                { id: 'open-queue', label: 'Open Queue', displayLabel: 'Competitive Open Queue', key: 'o' }
            ]
        },
        {
            id: 'stadium',
            label: 'Stadium',
            key: '3',
            children: [
                { id: 'quickplay', label: 'Quick Play', displayLabel: 'Stadium Quick Play', key: 'q' },
                { id: 'competitive', label: 'Competitive', displayLabel: 'Stadium Competitive', key: 'c' }
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
        { id: 'hazard', name: 'Hazard', role: 'tank' },
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
        { id: 'freja', name: 'Freja', role: 'damage' },
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

// Default settings configuration
export const DEFAULT_SETTINGS = {
    theme: 'auto', // 'auto', 'dark', 'light'
    autoCollapseMatchType: true,
    autoCollapseHero: true,
    rememberHeroSelection: false,
    recentHeroesCount: 4,
    keyboardShortcutsEnabled: true,
    wasdEnabled: true,
    numberKeysEnabled: true,
    hotkeysEnabled: true,
    sessionAutoReset: 'daily', // 'manual', 'daily', 'onlaunch'
    useOwStyleText: false, // false = Win/Loss/Draw, true = Victory/Defeat/Draw
    showMatchSavedNotification: true, // Show toast when match is saved
    showSessionNotification: true, // Show toast when session is reset
    showDrawButton: false, // Show or hide the draw button
    limitStadiumHeroSelection: true, // Limit to 1 hero in Stadium modes
    matchesPerPage: 10, // Number of matches to display per page (5, 10, 25, 50)
    showHeroes: true // Show or hide hero selection sections
};

// Create initial state structure
export function createInitialState() {
    return {
        selectedParentType: null,
        selectedChildType: null,
        selectedResult: null,
        selectedHeroes: [],
        matches: [],
        sessionStartTime: null,
        recentHeroes: [], // Track 4 most recently used heroes
        settings: { ...DEFAULT_SETTINGS }, // User settings
        statsView: 'all-time', // 'all-time' or 'session'
        matchHistoryView: 'all-time', // 'all-time' or 'session' - filter for match history
        matchHistoryPage: 1, // Current page number for match history pagination
        // Keyboard navigation focus
        focusZone: null, // 'match-type-toggle', 'parent', 'child', 'result', 'recent-heroes', 'hero-toggle', 'heroes', 'clear-heroes', 'save', or null when defocused
        focusIndex: 0,
        lastHeroFocusIndex: 0, // Remember last focused hero when drawer was open
        lastFocusZone: 'parent', // Remember last zone for refocusing
        lastFocusIndex: 0 // Remember last index for refocusing
    };
}
