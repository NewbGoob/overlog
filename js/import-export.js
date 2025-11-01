// ============================================
// IMPORT/EXPORT MODULE
// ============================================

import { CONFIG, DEFAULT_SETTINGS } from './config.js';
import { state } from './state.js';
import { saveData, saveSettings } from './storage.js';

// Dependencies to be injected by main app
let updateUI, updateStats, updateSessionInfo, renderRecentHeroes;
let updateMatchTypeToggleText, updateSelectionDisplay;

// Initialize import/export with function dependencies
export function initImportExport(deps) {
    updateUI = deps.updateUI;
    updateStats = deps.updateStats;
    updateSessionInfo = deps.updateSessionInfo;
    renderRecentHeroes = deps.renderRecentHeroes;
    updateMatchTypeToggleText = deps.updateMatchTypeToggleText;
    updateSelectionDisplay = deps.updateSelectionDisplay;
}

// Export matches to CSV
export function exportToCSV() {
    if (state.matches.length === 0) {
        alert('No matches to export!');
        return;
    }

    // Show info message about CSV limitations
    const proceedWithCSV = confirm(
        'CSV export includes match data only.\n\n' +
        'For a complete backup (including settings, recent heroes, and session data), ' +
        'use "Export JSON" instead.\n\n' +
        'Continue with CSV export?'
    );

    if (!proceedWithCSV) {
        return;
    }

    const headers = ['Timestamp', 'Match Type', 'Result', 'Heroes'];
    const rows = state.matches.map(match => {
        // Get match type (support both old and new format)
        let matchTypeLabel = '';

        if (match.parentType) {
            // New hierarchical format
            const parent = CONFIG.matchTypes.find(t => t.id === match.parentType);

            if (match.childType) {
                const child = parent ? parent.children.find(c => c.id === match.childType) : null;
                // Use displayLabel if available, otherwise fall back to parent > child
                matchTypeLabel = child && child.displayLabel ? child.displayLabel :
                    (child ? `${parent ? parent.label : match.parentType} > ${child.label}` : match.childType);
            } else {
                // No child, just show parent
                matchTypeLabel = parent ? parent.label : match.parentType;
            }
        } else if (match.type) {
            // Old flat format
            const matchType = CONFIG.matchTypes.find(t => t.id === match.type);
            matchTypeLabel = matchType ? matchType.label : match.type;
        }

        // Get hero names
        let heroNames = '';
        if (match.heroes && match.heroes.length > 0) {
            heroNames = match.heroes.map(heroId => {
                const hero = CONFIG.heroes.find(h => h.id === heroId);
                return hero ? hero.name : heroId;
            }).join('; ');
        }

        return [
            match.timestamp,
            matchTypeLabel,
            match.result,
            heroNames
        ];
    });

    let csv = headers.join(',') + '\n';
    csv += rows.map(row => row.map(cell => {
        // Escape cells that contain commas
        if (cell.includes(',') || cell.includes(';')) {
            return `"${cell}"`;
        }
        return cell;
    }).join(',')).join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overwatch-matches-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Export complete application state to JSON
export function exportToJSON() {
    if (state.matches.length === 0) {
        alert('No matches to export!');
        return;
    }

    // Export complete application state
    const exportData = {
        version: 1, // For future compatibility
        exportDate: new Date().toISOString(),
        matches: state.matches,
        settings: state.settings,
        sessionStartTime: state.sessionStartTime ? state.sessionStartTime.toISOString() : null,
        recentHeroes: state.recentHeroes,
        statsView: state.statsView,
        lastMatchType: state.selectedParentType ? {
            parentType: state.selectedParentType,
            childType: state.selectedChildType
        } : null
    };

    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overwatch-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Validate match data structure
export function validateMatch(match) {
    const errors = [];

    // Check required fields
    if (!match.timestamp) {
        errors.push('Missing timestamp');
    }

    if (!match.result || !['win', 'loss', 'draw'].includes(match.result)) {
        errors.push('Invalid or missing result');
    }

    // Check match type (support both old and new format)
    if (!match.parentType && !match.type) {
        errors.push('Missing match type');
    }

    // Validate parent type if present
    if (match.parentType) {
        const validParent = CONFIG.matchTypes.find(t => t.id === match.parentType);
        if (!validParent) {
            errors.push(`Invalid parent type: ${match.parentType}`);
        }

        // Validate child type if parent has children
        if (validParent && validParent.children.length > 0 && match.childType) {
            const validChild = validParent.children.find(c => c.id === match.childType);
            if (!validChild) {
                errors.push(`Invalid child type: ${match.childType}`);
            }
        }
    }

    // Validate heroes if present
    if (match.heroes && Array.isArray(match.heroes)) {
        match.heroes.forEach(heroId => {
            const validHero = CONFIG.heroes.find(h => h.id === heroId);
            if (!validHero) {
                errors.push(`Unknown hero: ${heroId}`);
            }
        });
    }

    return errors;
}

// Import data from JSON
export function importFromJSON(jsonString) {
    try {
        const data = JSON.parse(jsonString);

        let imported = 0;
        let skipped = 0;
        let errors = [];
        let matchesToImport = [];
        let importedSettings = false;
        let importedUIState = false;

        // Check if this is the new format (object with version) or old format (array)
        if (Array.isArray(data)) {
            // Old format - just matches array
            matchesToImport = data;
        } else if (data.version === 1 && data.matches) {
            // New format - complete application state
            matchesToImport = data.matches;

            // Import settings if present (merge with defaults for safety)
            if (data.settings) {
                state.settings = { ...DEFAULT_SETTINGS, ...data.settings };
                saveSettings();
                importedSettings = true;
            }

            // Import session start time if present
            if (data.sessionStartTime) {
                state.sessionStartTime = new Date(data.sessionStartTime);
                localStorage.setItem('owSessionStart', state.sessionStartTime.toISOString());
            }

            // Import recent heroes if present
            if (data.recentHeroes && Array.isArray(data.recentHeroes)) {
                state.recentHeroes = data.recentHeroes;
                localStorage.setItem('owRecentHeroes', JSON.stringify(state.recentHeroes));
            }

            // Import stats view preference if present
            if (data.statsView && (data.statsView === 'all-time' || data.statsView === 'session')) {
                state.statsView = data.statsView;
                localStorage.setItem('owStatsView', data.statsView);
            }

            // Import last match type if present
            if (data.lastMatchType) {
                const { parentType, childType } = data.lastMatchType;
                // Validate that the saved types still exist in config
                const parent = CONFIG.matchTypes.find(t => t.id === parentType);
                if (parent) {
                    state.selectedParentType = parentType;
                    if (childType && parent.children.some(c => c.id === childType)) {
                        state.selectedChildType = childType;
                    }
                    localStorage.setItem('owLastMatchType', JSON.stringify({
                        parentType,
                        childType: childType || null
                    }));
                }
            }

            importedUIState = true;
        } else {
            throw new Error('Invalid JSON format. Expected matches array or version 1 export data.');
        }

        // Import matches
        matchesToImport.forEach((match, index) => {
            // Validate match
            const validationErrors = validateMatch(match);
            if (validationErrors.length > 0) {
                errors.push(`Match ${index + 1}: ${validationErrors.join(', ')}`);
                skipped++;
                return;
            }

            // Check for duplicates (by ID or timestamp)
            const isDuplicate = state.matches.some(m =>
                m.id === match.id || m.timestamp === match.timestamp
            );

            if (isDuplicate) {
                skipped++;
                return;
            }

            // Ensure match has an ID
            if (!match.id) {
                match.id = Date.now() + Math.random();
            }

            state.matches.push(match);
            imported++;
        });

        // Sort by timestamp (newest first)
        state.matches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        saveData();

        // Build success message
        let message = `Import complete!\n${imported} matches imported, ${skipped} skipped.`;
        if (importedSettings) {
            message += '\n✓ Settings imported';
        }
        if (importedUIState) {
            message += '\n✓ UI state imported (recent heroes, session, preferences)';
        }
        if (errors.length > 0 && errors.length <= 10) {
            message += '\n\nErrors:\n' + errors.join('\n');
        } else if (errors.length > 10) {
            message += `\n\n${errors.length} matches had errors.`;
        }

        alert(message);

        // Reset to first page and force UI update after alert
        state.matchHistoryPage = 1;
        updateUI();
        updateStats();
        updateSessionInfo();
        renderRecentHeroes();

        // Update match type selection display if imported
        if (state.selectedParentType) {
            updateMatchTypeToggleText();
            updateSelectionDisplay();
        }
    } catch (error) {
        alert('Import failed: ' + error.message);
    }
}

// Import data from CSV
export function importFromCSV(csvString) {
    try {
        const lines = csvString.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV file is empty or has no data rows');
        }

        // Parse header
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

        // Find column indices
        const timestampIdx = headers.findIndex(h => h.toLowerCase().includes('timestamp'));
        const resultIdx = headers.findIndex(h => h.toLowerCase().includes('result'));
        const parentTypeIdx = headers.findIndex(h => h.toLowerCase().includes('parent'));
        const childTypeIdx = headers.findIndex(h => h.toLowerCase().includes('child'));
        const heroesIdx = headers.findIndex(h => h.toLowerCase().includes('hero'));

        if (timestampIdx === -1 || resultIdx === -1) {
            throw new Error('CSV must have Timestamp and Result columns');
        }

        let imported = 0;
        let skipped = 0;
        const matches = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV parser (handles quoted fields)
            const fields = [];
            let field = '';
            let inQuotes = false;

            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    fields.push(field.trim());
                    field = '';
                } else {
                    field += char;
                }
            }
            fields.push(field.trim());

            // Build match object
            const match = {
                id: Date.now() + Math.random(),
                timestamp: fields[timestampIdx],
                result: fields[resultIdx].toLowerCase(),
                parentType: parentTypeIdx !== -1 ? fields[parentTypeIdx] : null,
                childType: childTypeIdx !== -1 && fields[childTypeIdx] ? fields[childTypeIdx] : null,
                heroes: heroesIdx !== -1 && fields[heroesIdx] ?
                    fields[heroesIdx].split(';').map(h => h.trim()).filter(h => h) : []
            };

            // Map labels back to IDs
            if (match.parentType) {
                const parent = CONFIG.matchTypes.find(t =>
                    t.label.toLowerCase() === match.parentType.toLowerCase() ||
                    t.id === match.parentType
                );
                if (parent) {
                    match.parentType = parent.id;

                    if (match.childType) {
                        const child = parent.children.find(c =>
                            c.label.toLowerCase() === match.childType.toLowerCase() ||
                            c.id === match.childType
                        );
                        if (child) {
                            match.childType = child.id;
                        }
                    }
                }
            }

            // Map hero names to IDs
            if (match.heroes.length > 0) {
                match.heroes = match.heroes.map(heroName => {
                    const hero = CONFIG.heroes.find(h =>
                        h.name.toLowerCase() === heroName.toLowerCase() ||
                        h.id === heroName
                    );
                    return hero ? hero.id : heroName;
                }).filter(h => h);
            }

            // Validate
            const validationErrors = validateMatch(match);
            if (validationErrors.length > 0) {
                skipped++;
                continue;
            }

            // Check for duplicates
            const isDuplicate = state.matches.some(m => m.timestamp === match.timestamp);
            if (isDuplicate) {
                skipped++;
                continue;
            }

            matches.push(match);
            imported++;
        }

        state.matches.push(...matches);
        state.matches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        saveData();

        alert(`Import complete!\n${imported} matches imported, ${skipped} skipped.`);

        // Reset to first page and force UI update after alert
        state.matchHistoryPage = 1;
        updateUI();
        updateStats();
        updateSessionInfo();
    } catch (error) {
        alert('Import failed: ' + error.message);
    }
}

// Handle file import
export function handleImportFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;

            if (file.name.endsWith('.json')) {
                importFromJSON(content);
            } else if (file.name.endsWith('.csv')) {
                importFromCSV(content);
            } else {
                alert('Unsupported file type. Please use .json or .csv files.');
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

// Clear all data
export function clearAllData() {
    if (confirm('Are you sure you want to clear ALL match data? This cannot be undone!')) {
        state.matches = [];
        state.recentHeroes = [];
        state.matchHistoryPage = 1; // Reset to first page
        state.sessionStartTime = new Date();
        localStorage.setItem('owSessionStart', state.sessionStartTime.toISOString());
        localStorage.setItem('owRecentHeroes', JSON.stringify(state.recentHeroes));
        saveData();
        updateUI();
        renderRecentHeroes(); // Update recent heroes display
    }
}
