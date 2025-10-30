# Changelog

All notable changes to Overlog will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.3.1]: https://github.com/NewbGoob/overlog/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/NewbGoob/overlog/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/NewbGoob/overlog/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/NewbGoob/overlog/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/NewbGoob/overlog/tree/v1.0.0
