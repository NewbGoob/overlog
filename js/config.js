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
        { id: 'dva', name: 'D.Va', role: 'tank', portrait: 'dva.png' },
        { id: 'doomfist', name: 'Doomfist', role: 'tank', portrait: 'doomfist.png' },
        { id: 'hazard', name: 'Hazard', role: 'tank', portrait: 'hazard.png' },
        { id: 'junkerqueen', name: 'Junker Queen', role: 'tank', portrait: 'junkerqueen.png' },
        { id: 'mauga', name: 'Mauga', role: 'tank', portrait: 'mauga.png' },
        { id: 'orisa', name: 'Orisa', role: 'tank', portrait: 'orisa.png' },
        { id: 'ramattra', name: 'Ramattra', role: 'tank', portrait: 'ramattra.png' },
        { id: 'reinhardt', name: 'Reinhardt', role: 'tank', portrait: 'reinhardt.png' },
        { id: 'roadhog', name: 'Roadhog', role: 'tank', portrait: 'roadhog.png' },
        { id: 'sigma', name: 'Sigma', role: 'tank', portrait: 'sigma.png' },
        { id: 'winston', name: 'Winston', role: 'tank', portrait: 'winston.png' },
        { id: 'wreckingball', name: 'Wrecking Ball', role: 'tank', portrait: 'wrecking-ball.png' },
        { id: 'zarya', name: 'Zarya', role: 'tank', portrait: 'zarya.png' },

        // Damage
        { id: 'ashe', name: 'Ashe', role: 'damage', portrait: 'ashe.png' },
        { id: 'bastion', name: 'Bastion', role: 'damage', portrait: 'bastion.png' },
        { id: 'cassidy', name: 'Cassidy', role: 'damage', portrait: 'cassidy.png' },
        { id: 'echo', name: 'Echo', role: 'damage', portrait: 'echo.png' },
        { id: 'freja', name: 'Freja', role: 'damage', portrait: 'freja.png' },
        { id: 'genji', name: 'Genji', role: 'damage', portrait: 'genji.png' },
        { id: 'hanzo', name: 'Hanzo', role: 'damage', portrait: 'hanzo.png' },
        { id: 'junkrat', name: 'Junkrat', role: 'damage', portrait: 'junkrat.png' },
        { id: 'mei', name: 'Mei', role: 'damage', portrait: 'mei.png' },
        { id: 'pharah', name: 'Pharah', role: 'damage', portrait: 'pharah.png' },
        { id: 'reaper', name: 'Reaper', role: 'damage', portrait: 'reaper.png' },
        { id: 'sojourn', name: 'Sojourn', role: 'damage', portrait: 'sojourn.png' },
        { id: 'soldier76', name: 'Soldier: 76', role: 'damage', portrait: 'soldier-76.png' },
        { id: 'sombra', name: 'Sombra', role: 'damage', portrait: 'sombra.png' },
        { id: 'symmetra', name: 'Symmetra', role: 'damage', portrait: 'symetra.png' },
        { id: 'torbjorn', name: 'Torbjörn', role: 'damage', portrait: 'torbjorn.png' },
        { id: 'tracer', name: 'Tracer', role: 'damage', portrait: 'tracer.png' },
        { id: 'venture', name: 'Venture', role: 'damage', portrait: 'venture.png' },
        { id: 'widowmaker', name: 'Widowmaker', role: 'damage', portrait: 'widowmaker.png' },

        // Support
        { id: 'ana', name: 'Ana', role: 'support', portrait: 'ana.png' },
        { id: 'baptiste', name: 'Baptiste', role: 'support', portrait: 'baptiste.png' },
        { id: 'brigitte', name: 'Brigitte', role: 'support', portrait: 'brigitte.png' },
        { id: 'illari', name: 'Illari', role: 'support', portrait: 'illari.png' },
        { id: 'juno', name: 'Juno', role: 'support', portrait: 'juno.png' },
        { id: 'kiriko', name: 'Kiriko', role: 'support', portrait: 'kiriko.png' },
        { id: 'lifeweaver', name: 'Lifeweaver', role: 'support', portrait: 'lifeweaver.png' },
        { id: 'lucio', name: 'Lúcio', role: 'support', portrait: 'lucio.png' },
        { id: 'mercy', name: 'Mercy', role: 'support', portrait: 'mercy.png' },
        { id: 'moira', name: 'Moira', role: 'support', portrait: 'moira.png' },
        { id: 'wuyang', name: 'Wuyang', role: 'support', portrait: 'wuyang.png' },
        { id: 'zenyatta', name: 'Zenyatta', role: 'support', portrait: 'zenyatta.png' }
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
    showHeroes: true, // Show or hide hero selection sections
    showHeroPortraits: true, // Show hero portraits on hero buttons
    alwaysShowAllHeroes: false // Always show hero section expanded (hides toggle button)
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
