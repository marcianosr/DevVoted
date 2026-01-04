# Changelog

All notable changes to this project will be documented in this file.


## January 2026

### Added
- **Leaderboard CI Gate Column**: Displays current CI gate in leaderboard
- **Show Missed Correct Answers**: After answering, see which correct options you didn't pick
- **Category Weights for Polls**: Configs can now influence which category appears next
- **Power-Down Telemetry Config**: New config that affects poll selection

### Fixed
- **Multiple Choice Indeterminate State**: Correctly shows indeterminate state when some correct answers are selected
- **Duplicate Poll Responses**: Added database-level unique constraint to prevent race condition duplicates
- **Fastest Responder Stats**: Fixed NULL run_id handling in community stats query
- **Shop "0" Display Bug**: Fixed React rendering issue where `0 && <JSX>` rendered "0"

---

## December 2025 (Week 4: Dec 27-31)

### Added

- **New Configs**: `.length`, `indexed-db`, `includes`, and `telemetry` configs
- **Scoring for Incorrect Answers**: Partial credit system for wrong answers

### Fixed

- **Midnight Poll Invalidation**: Polls now properly refresh at midnight
- **Config Persistence**: Fixed bug where configs were lost between sessions
- **Shop Skip Reward**: Increased from 60KB to 64KB

---

## December 2025 (Week 3: Dec 18-26)

### Added

- **Gate Progress on Daily Poll**: Mini status bar showing CI gate progress while answering
- **Game Loop Explainer**: Onboarding text explaining game mechanics
- **Edit Poll Link**: Admins can now edit polls directly from daily poll view

### Fixed

- **Shop Refresh**: New shop offers now appear each day
- **Active Config Cards**: Fixed display issues on desktop
- **Score Display**: Corrected scoring breakdown presentation
- **Progress Sticky Footer**: Improved mobile responsiveness

### Changed

- **Improved Scoring Display**: Better visual breakdown of earned coverage

---

## December 2025 (Week 2: Dec 10-17)

### Added

- **Flexible CI Gate Challenges**: Configurable gate requirements
- **Deinstall Costs**: Removing configs now has a storage penalty
- **Skip Shop Feature**: Earn 64KB storage by skipping the shop

### Fixed

- **Large Poll Submissions**: Polls with 10+ options now submit correctly
- **Special Character Encoding**: Fixed `+`, `-`, `<`, `>` display in answers
- **localStorage Config**: Fixed storage calculation bugs
- **Poll Editing**: Resolved issues with saving poll changes

### Changed

- **Package Upgrades**: Updated all dependencies to latest versions

---

## December 2025 (Week 1: Dec 1-9)

### Added

- **Community Stats**: See who answered today's poll, first responder, fastest responder
- **Suggest Polls System**: Players can now submit poll suggestions
- **Explanation Field**: Polls can include explanations shown after answering
- **New Configs**: NoDeps, Intellisense, Copilot, Stylelint, grid-template-areas
- **GitHub Issue Link**: Quick link to report bugs
- **Code-Formatted Answers**: Markdown rendering in answer summaries

### Fixed

- **Daily Poll Performance**: Optimized database queries with new daily_polls table
- **N+1 Query Issues**: Reduced database calls on progress page
- **Response Count**: Fixed incorrect community response counts
- **Countdown Z-Index**: Poll countdown no longer hidden behind elements

### Changed

- **Simplified Game Over Screen**: Cleaner end-of-run experience
- **Leaderboard Display**: Added explanatory text

---

## November 2025 (Week 4: Nov 24-30)

### Added

- **Poll History in Gates**: See which polls you answered at each gate
- **Coverage Table**: Visual breakdown of category coverage
- **Poll Submitter Display**: Shows who created each poll
- **Simple Community Stats**: Basic participation metrics

### Fixed

- **Rebuild Loading State**: Shows loading message during config rebuilds
- **ESLint Config**: Fixed behavior and added Stylelint config

### Changed

- **Shop Architecture**: Complete rewrite for better maintainability
- **Config Effects Management**: Centralized effect handling
- **Footer**: Updated from "Tanstack Query" to "Tanstack Start"

---

## November 2025 (Week 3: Nov 21-23)

### Added

- **Server-Side Daily Poll Loading**: Improved initial load performance
- **Score Display**: Shows coverage earned after answering
- **Selected Answers View**: Review your choices after submitting

### Changed

- **Active Run Flow**: Improved navigation between game states
- **Daily Poll Layout**: Better organization of poll information

---

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
