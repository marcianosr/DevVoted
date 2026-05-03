# Changelog

All notable changes to this project will be documented in this file.

---

## [1.3.0] - May 2026

### Added
- **Post-answer tabbed carousel**: Answers, score, and shop are now split into three tabs — "Today's Poll", "Score & Pipelines", "Shop" — eliminating the long scroll after answering
- **Shop open/closed nudge**: The "Shop" tab label now shows a green "(open)" or red "(closed)" indicator so players know at a glance whether the shop is available
- **StorageBreakdown in Shop**: Storage usage is now displayed inline in the shop using the existing StorageBreakdown component

### Fixed
- **Question invisible pre-answer**: Poll question, code block, and sandbox embed were missing from the pre-answer screen
- **"Bonusses" typo**: Corrected to "Bonuses" in ScoreBlock
- **Shop card cut off**: Third card was clipped with no visible scroll affordance — layout now allows full horizontal scrolling
- **Page height gap**: Post-answer carousel had a large blank space below content caused by all steps rendering simultaneously; fixed by switching to conditional step rendering

### Changed
- **Pipeline upgrade as full-page takeover**: When a pipeline upgrade is available, the entire screen is replaced by the upgrade selection UI — no other content is visible until a choice is made
- **Score & Pipelines layout**: ScoreBlock (1/3 width) and CI Pipelines are side-by-side; CategoryCoverageGrid sits full-width below
- **CI Pipelines header**: Demoted to secondary label style so ScoreBlock reads as the primary element

---

## [1.1.0] - April 2026

### Added
- **CI Pipelines**: Redesigned gate system — every few polls your pipeline is evaluated and all checks must pass or the run ends
- **Pipeline check types**: correct answers, coverage gain, short window, cold start — each with difficulty tiers (low → medium → high → critical)
- **Upgrade cards**: pass a pipeline to choose a new check or raise the difficulty of an existing one for a higher storage reward
- **Post-victory / endless mode**: keep playing after all pipelines are passed, aiming for 100% coverage
- **"First good"** community stat: tracks who was first to answer correctly
- **New categories**: Ruby, Python, Java, General Backend
- **New configs**: legendary config, public config, decreasing category weight configs
- **Stats page**: personal run statistics
- **Category weights display**: shows tomorrow's poll category distribution
- **Admin configs table**: usage stats and popularity sorting
- **Active config counter** shown in-run
- **`/polls` search**: filter by category with poll counts per category
- **My Polls** link in navigation
- **Leaderboard cards** UI
- **Last updated** timestamp in footer
- **Presentation mode**

### Fixed
- Game-over navigation reliability
- HTTP 414 error on large poll submissions
- Shop bug: deinstalling one of 3 items caused another to disappear
- Deflate config synergy
- Poll filter buttons now use category theme colors
- Unreadable placeholder text
- Duplicate poll response dedup

### Changed
- Pipeline evaluation live progress shown during a window
- Shop item prices and booster sizes rebalanced
- Refund amount shown directly on the deinstall button
- Shop items persist across poll changes
- Migrated from ESLint to oxlint
- Refactored poll answer orchestrator into pipeline stages

---

## [1.0.0] - January 2026 ❄️

🎉 **DevVoted is officially released!** The core gameplay loop is complete with all MVP features.

### Added
- **Levels Past 100**: Coverage can now exceed 100% with tier progression (L2, L3, etc.)
- **Shop Preview on Results**: See upcoming shop items after answering polls
- **Challenge Mode Expansion**: More varied CI gate challenges with persistent configs
- **Probability-Based Configs**: Configs that influence category selection weights
- **Leaderboard CI Gate Column**: Displays current CI gate in leaderboard
- **Show Missed Correct Answers**: After answering, see which correct options you didn't pick
- **Category Weights for Polls**: Configs can now influence which category appears next
- **Power-Down Telemetry Config**: New config that affects poll selection

### Fixed
- **Streak Display**: Streak now shows correct value instead of being +1 ahead
- **Category Weights Calculation**: Weights calculated on-the-fly when no snapshot exists
- **Gate Requirements**: Cleaned up gate challenge requirements
- **Multiple Choice Indeterminate State**: Correctly shows indeterminate state when some correct answers are selected
- **Duplicate Poll Responses**: Added database-level unique constraint to prevent race condition duplicates
- **Fastest Responder Stats**: Fixed NULL run_id handling in community stats query
- **Shop "0" Display Bug**: Fixed React rendering issue where `0 && <JSX>` rendered "0"

### Changed
- **Try/Catch Config**: Now persistent across gates
- **Leaderboard Responsiveness**: Improved mobile display

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
