# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- **Category-based theme system**: Polls now dynamically display colors based on their category
    - HTML polls → Vermillion (orange-red)
    - CSS polls → Cerulean (blue)
    - JavaScript polls → Saffron (yellow)
    - TypeScript polls → Lavender (purple)
    - General Frontend polls → Fuchsia (pink)
    - React polls → Celadon (green)
    - Git polls → Pewter (gray)
- Theme utility classes (`.text-theme`, `.bg-theme`, `.border-theme`) that automatically adapt to poll category
- Category-aware meter bars that change color based on poll category

### Changed

- Replaced all hardcoded `-saffron` color classes with dynamic `-theme` classes across the application
- Updated poll question display, category grid, score breakdown, and UI elements to use theme colors
- Refactored CSS to use scoped `[data-category-theme]` selectors for theme management
- Meter elements now inherit colors from category theme instead of hardcoded saffron

### Technical Details

- Added `data-category-theme` attribute to PollPageContainer wrapper
- Created 7 scoped CSS theme blocks for each category
- Removed default hardcoded meter colors in favor of theme-based colors
- All theme colors reference existing Kanto city color palette

## Week of October 18-24, 2025

### Added

- **Extended Game Rounds**: Rounds now include 5 polls instead of 3
- **Victory Conditions**: Proper win state with dedicated end screen
- **Poll Encyclopedia (Polldex)**: Track encountered questions and answer history
- **Run Reset Anytime**: Reset current run without losing overall progress
- **Smarter Shop Management**: Rebuild costs only increase on CI gate progression
- **Enhanced Configuration System**:
    - Improved bonus calculations with better mathematical foundations
    - More granular tracking with decimal percentage coverage
    - Random configuration generation with comprehensive test coverage

### Changed

- **Better Button States**: Shop buttons properly disable when out of storage space
- **Clearer Terminology**: Changed "reroll" to "rebuild" in shop
- **Refined Scoring System**: Complete overhaul of configuration and score calculations

### Fixed

- **Retroactive Config Bonus Bug**: Configuration bonuses now apply correctly
- **End Screen Display**: End screen now shows properly after run completion
