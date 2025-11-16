# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-17

### Added

- **Multi-tab support**: Extension now supports reloading multiple tabs simultaneously, each with independent timers and settings
- Management view to control all timers across tabs
  - View all tabs with active or configured timers
  - Switch to tabs directly from the management view using the "Open Tab" button
  - Start/stop timers for specific tabs
  - Remove timer configurations with the delete button
- Each tab maintains its own reload interval, hard refresh setting, and stop-on-click behavior
- Visual status indicators (active/inactive) for each timer in management view
- Automatic cleanup of zombie timer configurations for closed tabs
- Toggle button in popup header to switch between single tab and management views
- Fallback display name "Unknown Tab" for tabs with undefined titles

### Changed

- Improved vertical spacing and padding throughout the popup interface
- Fixed theme colors for all buttons to properly match dark/light mode
- Popup now uses CSS classes for show/hide instead of inline styles to preserve flexbox layout

### Fixed

- Button appearance now correctly overrides browser default styles
- Management view buttons now display with proper theme colors instead of default browser styles
- Layout gaps now work correctly throughout the interface
