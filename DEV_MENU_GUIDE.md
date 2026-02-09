# Dev Menu Guide

The Dev Menu is a development tool for testing UI components, notifications, and modals in Overlog.

## Enabling the Dev Menu

**The dev menu is disabled by default.** To enable it:

1. Open Settings (gear icon in header)
2. Scroll to "Keyboard Shortcuts" section
3. Check the "Dev Menu (`)" checkbox under the keyboard shortcuts subsection
4. Save Settings

## How to Access

Once enabled, press the following key to toggle the Dev Menu:
- **`` ` ``** (Backtick/Grave key, usually above Tab)
- **ESC** to close the menu

## Features

### Toast Notifications
Test all toast notification styles:
- **Success Toast** - Green success message
- **Info Toast** - Blue informational message
- **Warning Toast** - Yellow warning message
- **Error Toast** - Red error message
- **Long Toast** - 5-second duration notification

### Modals
Quick access to application modals:
- **Open Settings** - Launch the settings modal
- **Open Changelog** - Launch the changelog modal

### Banners
Display warning and reminder banners:
- **Storage Warning** - Shows the 80% storage usage banner
- **Export Reminder** - Shows the 100+ matches backup reminder

### Update Notification
- **Show Update** - Displays the update available notification

### Contextual Scenarios
Pre-configured notifications for common user actions:
- **Match Saved** - Shows match saved notification with match type
- **Session Reset** - Shows session reset with previous stats
- **Undo Success** - Shows undo confirmation
- **Import Success** - Shows import completed message
- **Export Success** - Shows export completed message

## Usage Tips

1. **Testing Notifications**: Click any toast button to see how notifications appear and animate
2. **Testing Modals**: Test modal opening/closing behavior and overlays
3. **Testing Banners**: Verify banner positioning and dismiss functionality
4. **Sequential Testing**: You can trigger multiple items in sequence to test stacking behavior
5. **Non-Destructive**: All dev menu actions are visual only and don't modify your actual data

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `` ` `` | Toggle Dev Menu |
| ESC | Close Dev Menu |

## For Developers

The dev menu is implemented in `js/dev-menu.js` and integrates with the main app through dependency injection. It uses the existing toast notification system and modal infrastructure.

### Adding New Test Actions

To add new test scenarios:

1. Add a button to the dev menu UI in `createDevMenuOverlay()`
2. Add a case handler in `handleDevAction()`
3. Use existing app functions (showToast, modals, etc.)

### Architecture

- **Module**: `js/dev-menu.js`
- **Styles**: `assets/css/styles.css` (Dev Menu Styles section)
- **Integration**: `js/app.js` (keyboard handler and initialization)
- **Dependencies**: showToast, openSettingsModal, openChangelogModal
