// ============================================
// DEV MENU MODULE
// For testing notifications, modals, and UI states
// ============================================

// Dependencies to be injected
let showToast, openSettingsModal, openChangelogModal, state;
let isDevMenuOpen = false;

// Initialize dev menu with function dependencies
export function initDevMenu(deps) {
    showToast = deps.showToast;
    openSettingsModal = deps.openSettingsModal;
    openChangelogModal = deps.openChangelogModal;
    state = deps.state;
}

// Create dev menu overlay
function createDevMenuOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'devMenuOverlay';
    overlay.className = 'dev-menu-overlay';
    overlay.innerHTML = `
        <div class="dev-menu-panel">
            <div class="dev-menu-header">
                <h3>🛠️ Dev Menu</h3>
                <button class="dev-menu-close" id="devMenuClose">&times;</button>
            </div>
            <div class="dev-menu-body">
                <div class="dev-menu-section">
                    <h4>Toast Notifications</h4>
                    <div class="dev-menu-buttons">
                        <button class="dev-btn" data-action="toast-success">Success Toast</button>
                        <button class="dev-btn" data-action="toast-info">Info Toast</button>
                        <button class="dev-btn" data-action="toast-warning">Warning Toast</button>
                        <button class="dev-btn" data-action="toast-error">Error Toast</button>
                        <button class="dev-btn" data-action="toast-long">Long Toast (5s)</button>
                    </div>
                </div>

                <div class="dev-menu-section">
                    <h4>Modals</h4>
                    <div class="dev-menu-buttons">
                        <button class="dev-btn" data-action="modal-settings">Open Settings</button>
                        <button class="dev-btn" data-action="modal-changelog">Open Changelog</button>
                    </div>
                </div>

                <div class="dev-menu-section">
                    <h4>Banners</h4>
                    <div class="dev-menu-buttons">
                        <button class="dev-btn" data-action="banner-storage">Storage Warning</button>
                        <button class="dev-btn" data-action="banner-export">Export Reminder</button>
                    </div>
                </div>

                <div class="dev-menu-section">
                    <h4>Update Notification</h4>
                    <div class="dev-menu-buttons">
                        <button class="dev-btn" data-action="update-notification">Show Update</button>
                    </div>
                </div>

                <div class="dev-menu-section">
                    <h4>Contextual Scenarios</h4>
                    <div class="dev-menu-buttons">
                        <button class="dev-btn" data-action="scenario-match-saved">Match Saved</button>
                        <button class="dev-btn" data-action="scenario-session-reset">Session Reset</button>
                        <button class="dev-btn" data-action="scenario-undo">Undo Success</button>
                        <button class="dev-btn" data-action="scenario-import">Import Success</button>
                        <button class="dev-btn" data-action="scenario-export">Export Success</button>
                    </div>
                </div>
            </div>
            <div class="dev-menu-footer">
                <p class="dev-menu-hint">Press <kbd>\`</kbd> to toggle</p>
            </div>
        </div>
    `;
    return overlay;
}

// Handle dev menu actions
function handleDevAction(action) {
    switch (action) {
        // Toast notifications
        case 'toast-success':
            showToast('This is a success notification!', 'success', 2500);
            break;
        case 'toast-info':
            showToast('This is an informational message', 'info', 2500);
            break;
        case 'toast-warning':
            showToast('Warning! Something needs attention', 'warning', 2500);
            break;
        case 'toast-error':
            showToast('Error! Something went wrong', 'error', 2500);
            break;
        case 'toast-long':
            showToast('This is a longer notification that stays visible for 5 seconds', 'info', 5000);
            break;

        // Modals
        case 'modal-settings':
            closeDevMenu();
            openSettingsModal();
            break;
        case 'modal-changelog':
            closeDevMenu();
            openChangelogModal();
            break;

        // Banners
        case 'banner-storage':
            showStorageWarningBanner();
            break;
        case 'banner-export':
            showExportReminderBanner();
            break;

        // Update notification
        case 'update-notification':
            showUpdateNotification();
            break;

        // Contextual scenarios
        case 'scenario-match-saved':
            showToast('Match saved! Competitive Role Queue', 'success', 2500);
            break;
        case 'scenario-session-reset':
            showToast('New session started! Previous: 15 matches (53.3% WR)', 'info', 3500);
            break;
        case 'scenario-undo':
            showToast('Last match undone', 'info', 2000);
            break;
        case 'scenario-import':
            showToast('Imported 47 matches successfully', 'success', 3000);
            break;
        case 'scenario-export':
            showToast('Exported 128 matches to overlog_export.csv', 'success', 3000);
            break;

        default:
            console.warn('Unknown dev action:', action);
    }
}

// Show storage warning banner
function showStorageWarningBanner() {
    const banner = document.getElementById('storageWarningBanner');
    if (banner) {
        banner.style.display = 'flex';
    }
}

// Show export reminder banner
function showExportReminderBanner() {
    const banner = document.getElementById('exportReminderBanner');
    if (banner) {
        banner.style.display = 'flex';
    }
}

// Show update notification (from app.js)
function showUpdateNotification() {
    // Check if notification already exists
    if (document.getElementById('updateNotification')) {
        return;
    }

    const notification = document.createElement('div');
    notification.id = 'updateNotification';
    notification.className = 'update-notification';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');

    notification.innerHTML = `
        <div class="update-content">
            <span class="update-icon">🔄</span>
            <div class="update-text">
                <strong>Update Available</strong>
                <p>A new version of Overlog is available!</p>
            </div>
            <div class="update-buttons">
                <button id="updateReloadBtn" class="update-btn update-btn-primary">Reload Now</button>
                <button id="updateDismissBtn" class="update-btn update-btn-secondary">Dismiss</button>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    // Add event listeners
    document.getElementById('updateReloadBtn').addEventListener('click', () => {
        window.location.reload(true);
    });

    document.getElementById('updateDismissBtn').addEventListener('click', () => {
        notification.remove();
    });

    // Auto-show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
}

// Open dev menu
export function openDevMenu() {
    if (isDevMenuOpen) return;

    const overlay = createDevMenuOverlay();
    document.body.appendChild(overlay);
    isDevMenuOpen = true;

    // Add event listeners
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.id === 'devMenuClose') {
            closeDevMenu();
        }
    });

    overlay.querySelectorAll('.dev-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            handleDevAction(action);
        });
    });

    // Show with animation
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
}

// Close dev menu
export function closeDevMenu() {
    const overlay = document.getElementById('devMenuOverlay');
    if (!overlay) return;

    overlay.classList.remove('show');
    setTimeout(() => {
        overlay.remove();
        isDevMenuOpen = false;
    }, 300);
}

// Toggle dev menu
export function toggleDevMenu() {
    if (isDevMenuOpen) {
        closeDevMenu();
    } else {
        openDevMenu();
    }
}

// Handle keyboard shortcut
export function handleDevMenuKeyboard(e) {
    // Check if dev menu is enabled in settings
    if (!state || !state.settings.devMenuEnabled) {
        return false;
    }

    // Check for backtick (`) key
    if (e.key === '`') {
        e.preventDefault();
        toggleDevMenu();
        return true;
    }

    // Check for Escape to close dev menu
    if (e.key === 'Escape' && isDevMenuOpen) {
        e.preventDefault();
        closeDevMenu();
        return true;
    }

    return false;
}
