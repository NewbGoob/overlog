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

    subroleDefinitions: {
        // Tank Subroles
        'bruiser': {
            name: 'Bruiser',
            description: 'Reduces critical damage received. While at critical health, gain movement speed'
        },
        'initiator': {
            name: 'Initiator',
            description: 'Staying airborne lightly heals you'
        },
        'stalwart': {
            name: 'Stalwart',
            description: 'Reduces knockbacks and slows received'
        },

        // Damage Subroles
        'sharpshooter': {
            name: 'Sharpshooter',
            description: 'Critical hits reduce your movement ability cooldowns'
        },
        'flanker': {
            name: 'Flanker',
            description: 'Health packs restore more health'
        },
        'specialist': {
            name: 'Specialist',
            description: 'Eliminating an enemy briefly increases your reload speed'
        },
        'recon': {
            name: 'Recon',
            description: 'You detect enemies below half health through walls after damaging them'
        },

        // Support Subroles
        'tactician': {
            name: 'Tactician',
            description: 'You can gain excess ultimate charge which carries over after using your ultimate ability'
        },
        'medic': {
            name: 'Medic',
            description: 'Healing allies with your weapon also heals you'
        },
        'survivor': {
            name: 'Survivor',
            description: 'Using a movement ability activates passive health regeneration'
        }
    },

    heroes: [
        // Tank
        { id: 'dva', name: 'D.Va', role: 'tank', portrait: 'dva.png', stadiumAvailable: true, subrole: 'initiator' },
        { id: 'domina', name: 'Domina', role: 'tank', portrait: '', stadiumAvailable: false, subrole: 'stalwart' },
        { id: 'doomfist', name: 'Doomfist', role: 'tank', portrait: 'doomfist.png', stadiumAvailable: true, subrole: 'initiator' },
        { id: 'hazard', name: 'Hazard', role: 'tank', portrait: 'hazard.png', stadiumAvailable: true, subrole: 'stalwart' },
        { id: 'junkerqueen', name: 'Junker Queen', role: 'tank', portrait: 'junkerqueen.png', stadiumAvailable: true, subrole: 'stalwart' },
        { id: 'mauga', name: 'Mauga', role: 'tank', portrait: 'mauga.png', stadiumAvailable: false, subrole: 'bruiser' },
        { id: 'orisa', name: 'Orisa', role: 'tank', portrait: 'orisa.png', stadiumAvailable: true, subrole: 'bruiser' },
        { id: 'ramattra', name: 'Ramattra', role: 'tank', portrait: 'ramattra.png', stadiumAvailable: false, subrole: 'stalwart' },
        { id: 'reinhardt', name: 'Reinhardt', role: 'tank', portrait: 'reinhardt.png', stadiumAvailable: true, subrole: 'stalwart' },
        { id: 'roadhog', name: 'Roadhog', role: 'tank', portrait: 'roadhog.png', stadiumAvailable: false, subrole: 'bruiser' },
        { id: 'sigma', name: 'Sigma', role: 'tank', portrait: 'sigma.png', stadiumAvailable: true, subrole: 'stalwart' },
        { id: 'winston', name: 'Winston', role: 'tank', portrait: 'winston.png', stadiumAvailable: true, subrole: 'initiator' },
        { id: 'wreckingball', name: 'Wrecking Ball', role: 'tank', portrait: 'wrecking-ball.png', stadiumAvailable: false, subrole: 'initiator' },
        { id: 'zarya', name: 'Zarya', role: 'tank', portrait: 'zarya.png', stadiumAvailable: true, subrole: 'bruiser' },

        // Damage
        { id: 'anran', name: 'Anran', role: 'damage', portrait: '', stadiumAvailable: false, subrole: 'flanker' },
        { id: 'ashe', name: 'Ashe', role: 'damage', portrait: 'ashe.png', stadiumAvailable: true, subrole: 'sharpshooter' },
        { id: 'bastion', name: 'Bastion', role: 'damage', portrait: 'bastion.png', stadiumAvailable: false, subrole: 'specialist' },
        { id: 'cassidy', name: 'Cassidy', role: 'damage', portrait: 'cassidy.png', stadiumAvailable: true, subrole: 'sharpshooter' },
        { id: 'echo', name: 'Echo', role: 'damage', portrait: 'echo.png', stadiumAvailable: false, subrole: 'recon' },
        { id: 'emre', name: 'Emre', role: 'damage', portrait: '', stadiumAvailable: false, subrole: 'specialist' },
        { id: 'freja', name: 'Freja', role: 'damage', portrait: 'freja.png', stadiumAvailable: true, subrole: 'recon' },
        { id: 'genji', name: 'Genji', role: 'damage', portrait: 'genji.png', stadiumAvailable: true, subrole: 'flanker' },
        { id: 'hanzo', name: 'Hanzo', role: 'damage', portrait: 'hanzo.png', stadiumAvailable: false, subrole: 'sharpshooter' },
        { id: 'junkrat', name: 'Junkrat', role: 'damage', portrait: 'junkrat.png', stadiumAvailable: true, subrole: 'specialist' },
        { id: 'mei', name: 'Mei', role: 'damage', portrait: 'mei.png', stadiumAvailable: true, subrole: 'specialist' },
        { id: 'pharah', name: 'Pharah', role: 'damage', portrait: 'pharah.png', stadiumAvailable: true, subrole: 'recon' },
        { id: 'reaper', name: 'Reaper', role: 'damage', portrait: 'reaper.png', stadiumAvailable: true, subrole: 'flanker' },
        { id: 'sojourn', name: 'Sojourn', role: 'damage', portrait: 'sojourn.png', stadiumAvailable: true, subrole: 'sharpshooter' },
        { id: 'soldier76', name: 'Soldier: 76', role: 'damage', portrait: 'soldier-76.png', stadiumAvailable: true, subrole: 'specialist' },
        { id: 'sombra', name: 'Sombra', role: 'damage', portrait: 'sombra.png', stadiumAvailable: false, subrole: 'recon' },
        { id: 'symmetra', name: 'Symmetra', role: 'damage', portrait: 'symetra.png', stadiumAvailable: false, subrole: 'specialist' },
        { id: 'torbjorn', name: 'Torbjörn', role: 'damage', portrait: 'torbjorn.png', stadiumAvailable: true, subrole: 'specialist' },
        { id: 'tracer', name: 'Tracer', role: 'damage', portrait: 'tracer.png', stadiumAvailable: true, subrole: 'flanker' },
        { id: 'vendetta', name: 'Vendetta', role: 'damage', portrait: 'vendetta.png', stadiumAvailable: true, subrole: 'flanker' },
        { id: 'venture', name: 'Venture', role: 'damage', portrait: 'venture.png', stadiumAvailable: false, subrole: 'flanker' },
        { id: 'widowmaker', name: 'Widowmaker', role: 'damage', portrait: 'widowmaker.png', stadiumAvailable: false, subrole: 'sharpshooter' },

        // Support
        { id: 'ana', name: 'Ana', role: 'support', portrait: 'ana.png', stadiumAvailable: true, subrole: 'tactician' },
        { id: 'baptiste', name: 'Baptiste', role: 'support', portrait: 'baptiste.png', stadiumAvailable: false, subrole: 'tactician' },
        { id: 'brigitte', name: 'Brigitte', role: 'support', portrait: 'brigitte.png', stadiumAvailable: true, subrole: 'survivor' },
        { id: 'illari', name: 'Illari', role: 'support', portrait: 'illari.png', stadiumAvailable: false, subrole: 'survivor' },
        { id: 'jetpackcat', name: 'Jetpack Cat', role: 'support', portrait: '', stadiumAvailable: false, subrole: 'tactician' },
        { id: 'juno', name: 'Juno', role: 'support', portrait: 'juno.png', stadiumAvailable: true, subrole: 'survivor' },
        { id: 'kiriko', name: 'Kiriko', role: 'support', portrait: 'kiriko.png', stadiumAvailable: true, subrole: 'medic' },
        { id: 'lifeweaver', name: 'Lifeweaver', role: 'support', portrait: 'lifeweaver.png', stadiumAvailable: false, subrole: 'medic' },
        { id: 'lucio', name: 'Lúcio', role: 'support', portrait: 'lucio.png', stadiumAvailable: true, subrole: 'tactician' },
        { id: 'mercy', name: 'Mercy', role: 'support', portrait: 'mercy.png', stadiumAvailable: true, subrole: 'medic' },
        { id: 'mizuki', name: 'Mizuki', role: 'support', portrait: '', stadiumAvailable: false, subrole: 'survivor' },
        { id: 'moira', name: 'Moira', role: 'support', portrait: 'moira.png', stadiumAvailable: true, subrole: 'medic' },
        { id: 'wuyang', name: 'Wuyang', role: 'support', portrait: 'wuyang.png', stadiumAvailable: true, subrole: 'survivor' },
        { id: 'zenyatta', name: 'Zenyatta', role: 'support', portrait: 'zenyatta.png', stadiumAvailable: true, subrole: 'tactician' }
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
    devMenuEnabled: false, // Enable dev menu hotkey (`)
    sessionAutoReset: 'daily', // 'manual', 'daily', 'onlaunch'
    useOwStyleText: false, // false = Win/Loss/Draw, true = Victory/Defeat/Draw
    showMatchSavedNotification: true, // Show toast when match is saved
    showSessionNotification: true, // Show toast when session is reset
    showDrawButton: false, // Show or hide the draw button
    limitStadiumHeroSelection: true, // Limit to 1 hero in Stadium modes
    disableNonStadiumHeroes: 'dim', // 'none', 'dim', or 'hide' - disable non-Stadium heroes in Stadium mode
    matchesPerPage: 10, // Number of matches to display per page (5, 10, 25, 50)
    showHeroes: true, // Show or hide hero selection sections
    showHeroPortraits: true, // Show hero portraits on hero buttons
    alwaysShowAllHeroes: false, // Always show hero section expanded (hides toggle button)
    showHeroSubroles: false // Display subrole under hero names in the hero selector
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
