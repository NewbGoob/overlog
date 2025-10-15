// State management
let state = {
    selectedType: null,
    selectedResult: null,
    matches: [],
    sessionStartTime: null
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
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('owMatches', JSON.stringify(state.matches));
}

// Initialize the app
function init() {
    loadData();
    setupEventListeners();
    updateUI();
}

// Setup event listeners
function setupEventListeners() {
    // Match type buttons
    document.querySelectorAll('.match-type-btn').forEach(btn => {
        btn.addEventListener('click', () => selectMatchType(btn.dataset.type));
    });

    // Result buttons
    document.querySelectorAll('.result-btn').forEach(btn => {
        btn.addEventListener('click', () => selectResult(btn.dataset.result));
    });

    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveMatch);

    // Undo button
    document.getElementById('undoBtn').addEventListener('click', undoLastMatch);

    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);

    // Clear button
    document.getElementById('clearBtn').addEventListener('click', clearAllData);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

// Handle keyboard shortcuts
function handleKeyboard(e) {
    // Prevent shortcuts if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }

    // Match type shortcuts (1-5)
    const typeMap = {
        '1': 'competitive',
        '2': 'quickplay',
        '3': 'arcade',
        '4': 'unranked',
        '5': 'custom'
    };

    if (typeMap[e.key]) {
        e.preventDefault();
        selectMatchType(typeMap[e.key]);
    }

    // Result shortcuts (W, L, D)
    const resultMap = {
        'w': 'win',
        'W': 'win',
        'l': 'loss',
        'L': 'loss',
        'd': 'draw',
        'D': 'draw'
    };

    if (resultMap[e.key]) {
        e.preventDefault();
        selectResult(resultMap[e.key]);
    }

    // Save shortcut (Enter)
    if (e.key === 'Enter' && state.selectedType && state.selectedResult) {
        e.preventDefault();
        saveMatch();
    }

    // Undo shortcut (Ctrl+Z)
    if (e.ctrlKey && e.key === 'z' && state.matches.length > 0) {
        e.preventDefault();
        undoLastMatch();
    }
}

// Select match type
function selectMatchType(type) {
    state.selectedType = type;

    // Update UI
    document.querySelectorAll('.match-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
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

    updateSelectionDisplay();
    updateSaveButton();
}

// Update selection display
function updateSelectionDisplay() {
    const typeDisplay = document.getElementById('selectedType');
    const resultDisplay = document.getElementById('selectedResult');

    if (state.selectedType) {
        typeDisplay.textContent = state.selectedType.replace(/([A-Z])/g, ' $1').trim();
        typeDisplay.style.textTransform = 'capitalize';
    } else {
        typeDisplay.textContent = 'Select match type...';
    }

    if (state.selectedResult) {
        resultDisplay.textContent = state.selectedResult.toUpperCase();
        resultDisplay.className = state.selectedResult;
    } else {
        resultDisplay.textContent = '';
        resultDisplay.className = '';
    }
}

// Update save button state
function updateSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = !(state.selectedType && state.selectedResult);
}

// Save match
function saveMatch() {
    if (!state.selectedType || !state.selectedResult) {
        return;
    }

    const match = {
        id: Date.now(),
        type: state.selectedType,
        result: state.selectedResult,
        timestamp: new Date().toISOString()
    };

    state.matches.unshift(match); // Add to beginning of array
    saveData();

    // Reset selection
    state.selectedType = null;
    state.selectedResult = null;

    // Update UI
    document.querySelectorAll('.match-type-btn, .result-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    updateSelectionDisplay();
    updateSaveButton();
    updateUI();

    // Visual feedback
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.textContent = 'Saved!';
    setTimeout(() => {
        saveBtn.innerHTML = 'Save Match <span class="key-hint">Enter</span>';
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

        return `
            <div class="match-item ${match.result}">
                <div class="match-info">
                    <span class="match-result ${match.result}">${match.result.toUpperCase()}</span>
                    <span class="match-type">${match.type}</span>
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
    undoBtn.disabled = state.matches.length === 0;
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

    const headers = ['Timestamp', 'Match Type', 'Result'];
    const rows = state.matches.map(match => [
        match.timestamp,
        match.type,
        match.result
    ]);

    let csv = headers.join(',') + '\n';
    csv += rows.map(row => row.join(',')).join('\n');

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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
