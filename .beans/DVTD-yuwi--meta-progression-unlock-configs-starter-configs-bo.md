---
# DVTD-yuwi
title: 'Meta progression: unlock configs, starter configs, borders'
status: todo
type: feature
priority: normal
created_at: 2026-07-22T12:38:06Z
updated_at: 2026-07-22T12:38:11Z
parent: DVTD-u35m
---

Allow players to unlock new configurations, additional starter configs, and custom borders through meta-progression between runs

## Features to Implement

### Unlockable Configs
- [ ] Design unlock progression system (by runs completed, coverage thresholds, wins, etc.)
- [ ] Add tracking for which configs are unlocked per player
- [ ] Show locked configs in shop with unlock criteria
- [ ] Animate/celebrate config unlocks

### Starter Config Slots
- [ ] Add multiple starter config slot unlock tiers
- [ ] Display slot unlock progress
- [ ] Show which slots are available vs locked
- [ ] Update loadout UI to show available slots

### Custom Borders
- [ ] Design border variants (rarity-based or unlockable)
- [ ] Add border selection UI in loadout
- [ ] Store border preference per player
- [ ] Display selected border on run screens

## Data Model Updates
- [ ] User progression tracking table
- [ ] Config unlock status
- [ ] Starter slot availability
- [ ] Border preference storage

## UI Components Needed
- [ ] UnlockProgress component
- [ ] LockedConfigCard component
- [ ] BorderSelector component
- [ ] Progression display in hub/community screens
