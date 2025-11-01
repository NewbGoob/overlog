# Changelog

All notable changes to Overlog will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2025-11-01
### Added
- "Disable Non-Stadium Heroes" setting in Stadium Settings with three modes: Allow All Heroes, Dim Unavailable Heroes (default), and Hide Unavailable Heroes
- Stadium availability tracking for all 41 heroes (28 available in Stadium mode)
- Automatic filtering of non-Stadium heroes when switching to Stadium mode
- Recent Heroes backfill to maintain configured count when hiding unavailable heroes
- Tooltips on disabled heroes indicating they are not available in Stadium mode
### Changed
- Reorganized settings into more logical categories: Log Match Settings, Hero Settings, Stadium Settings, Session Settings, UI Settings, and Keyboard Shortcuts
### Fixed
- WASD navigation now properly skips disabled/dimmed heroes in all directions (W/A/S/D)
- North navigation (W key) from top of hero grid now correctly skips hidden hero toggle when "Always Show All Heroes" is enabled

## [1.6.0] - 2025-10-30
### Added
- Hero portrait images for all 38 heroes
- "Show Hero Portraits" setting in UI Settings to display hero portraits on hero selection buttons (enabled by default)
- "Always Show All Heroes" setting in UI Settings to keep hero section permanently expanded (disabled by default)
### Changed
- Hero selection container now displays all heroes without scrolling
- E keyboard shortcut focuses hero area instead of toggling visibility when "Always Show All Heroes" is enabled
- Hero section no longer auto-collapses after saving a match when "Always Show All Heroes" is enabled
- WASD keyboard navigation automatically skips hero toggle button when "Always Show All Heroes" is enabled

## [1.5.1] - 2025-10-30
### Fixed
- Recent Heroes section no longer appears when Recent Heroes Count is set to 0
- Match type toggle and hero toggle buttons now have consistent heights
### Changed
- Draw button now hidden by default (can be enabled in Settings)
- Improved keyboard focus priority after match type selection
- Removed Space indicator from Save Match button
- Number keys (1-4) now open match type section if closed

## [1.5.0] - 2025-10-30
### Added
- Match history pagination with configurable page size (5, 10, 25, 50, All)
- All Time / This Session filter toggle for match history
- Session ID tracking for accurate session-based filtering
- "Show Heroes" setting in UI Settings to hide/show hero selection sections
### Changed
- Renamed "Recent Matches" to "Match History"
- Moved result buttons (Win/Loss/Draw) below hero selection sections
- Updated WASD keyboard navigation to work with new layout and Show Heroes setting

## [1.4.0] - 2025-10-30
### Changed
- **Code Architecture:** Refactored monolithic app.js (2,924 lines) into modular ES6 structure with 8 focused modules
  - `config.js` - Configuration and constants
  - `state.js` - Shared application state
  - `storage.js` - localStorage operations and storage management
  - `keyboard-navigation.js` - Complete WASD navigation system
  - `import-export.js` - CSV/JSON import/export functionality
  - `match-manager.js` - Match saving and management
  - `ui-renderer.js` - UI rendering and statistics
  - `app.js` - Main application initialization and coordination
- Optimized for AI agent context management (75-90% reduction in context size for targeted tasks)
- Improved code maintainability and organization
- No user-facing changes - all functionality preserved
- No build step required - native ES6 modules work directly in modern browsers
- Fully compatible with GitHub Pages deployment

## [1.3.2] - 2025-10-30
### Fixed
- Result buttons no longer deselect when clicking on hero buttons, recent hero buttons, or the Show/Hide Heroes toggle

## [1.3.1] - 2025-10-30
### Added
- External link indicator icon next to Changelog modal title
### Changed
- Changelog modal now displays formatted markdown instead of plain text
- Changelog modal title is now a clickable link to GitHub CHANGELOG.md
- Changelog modal title color now matches other modals (orange at rest)

## [1.3.0] - 2025-10-30
### Added
- Optional "Limit Stadium Hero Selection" setting in Behavior Settings to restrict hero selection to 1 in Stadium game modes (enabled by default)
- Changelog info button next to version number in footer that displays CHANGELOG.md in a modal

## [1.2.0] - 2025-10-28
### Added
- Result button deselection via spacebar toggle or clicking outside the result buttons area
- Optional "Remember Hero Selection" setting in Behavior Settings to persist hero selections across multiple matches

## [1.1.0] - 2025-10-16
### Added
- Hyperlinked version number in footer to GitHub repo
- GNU General Public License v3.0
- README.md
- CHANGELOG.md
### Changed
- Re-organized project directory structure
### Fixed
- Added Freja and Hazard to roster

## [1.0.0] - 2025-10-16
### Added
- Initial release of Overlog - Overwatch Match Logger
- Match logging with Win/Loss/Draw tracking
- Support for multiple match types (Competitive, Unranked, Stadium, Arcade)
- Hero selection and tracking across all roles (Tank, DPS, Support)
- Recent heroes quick-select feature
- Session-based statistics tracking
- Overall statistics view (all-time and per-session)
- Dark/Light/Auto theme modes
- Keyboard shortcuts for navigation and quick actions
  - WASD navigation
  - Space to save
  - Ctrl+Z to undo
  - Number keys for match types
- Data management features
  - CSV export
  - JSON export
  - Import functionality
  - Clear all data option
- Local storage persistence
- Storage usage warnings and backup reminders
- Match preview window
- Customizable settings
  - Theme preferences
  - Recent heroes count
  - Overwatch-style text toggle
  - Auto-collapse sections
  - Session auto-reset options
  - Keyboard shortcut toggles
- Toast notifications for user feedback
- Version display in footer with commit hash
- GitHub Actions deployment workflow

[1.7.0]: https://github.com/NewbGoob/overlog/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/NewbGoob/overlog/compare/v1.5.1...v1.6.0
[1.5.1]: https://github.com/NewbGoob/overlog/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/NewbGoob/overlog/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/NewbGoob/overlog/compare/v1.3.2...v1.4.0
[1.3.2]: https://github.com/NewbGoob/overlog/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/NewbGoob/overlog/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/NewbGoob/overlog/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/NewbGoob/overlog/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/NewbGoob/overlog/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/NewbGoob/overlog/tree/v1.0.0
