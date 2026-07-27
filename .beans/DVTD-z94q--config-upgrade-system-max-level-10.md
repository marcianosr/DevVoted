---
# DVTD-z94q
title: 'Config upgrade system: max level 10'
status: todo
type: feature
priority: normal
created_at: 2026-07-24T12:46:02Z
updated_at: 2026-07-27T14:16:47Z
parent: DVTD-d0fw
---

Implement a config upgrade system where players can upgrade configs from level 1-10, with clear progression and upgrade paths

## Upgrade Mechanics

### Level System (1-10)
- [ ] All configs start at level 1
- [ ] Each level increases config power (e.g., coverage multiplier, strength)
- [ ] Scaling formula: level 1 = base, level 10 = base × 1.8x (or similar)
- [ ] Max level 10 (no further upgrades)

### Upgrade Currency
- [ ] Spend vault KB to upgrade configs
- [ ] Cost scales by current level and rarity:
  - Common: 50KB per level
  - Uncommon: 100KB per level  
  - Rare: 200KB per level
  - Legendary: 400KB per level
- [ ] Total to max: 250KB → 1000KB → 2000KB → 4000KB respectively

### Upgrade Path Clarity
- [ ] Show "Upgrade Requirements" in UI: cost + level requirement
- [ ] Display "Next Level Stats" vs "Current Stats"
- [ ] Explain power increase in player-friendly terms ("+10% coverage")
- [ ] Show progress: "Level 3/10 (30%)"

## Discovery & Education

### When to Upgrade (Clear Signaling)
- [ ] Upgrade suggestion in loadout when player has KB and upgradeable configs
- [ ] Hub screen highlights configs available for upgrade
- [ ] Milestone/achievement: "Upgrade your first config!"
- [ ] Tutorial/onboarding explains upgrade benefit

### How to Upgrade (Clear Steps)
- [ ] Config dex → click config → "Upgrade" button (if available)
- [ ] Confirmation dialog: "Upgrade Config X from Level Y to Level Y+1? Cost: Z KB"
- [ ] Show what changes: old stat → new stat
- [ ] Button disabled with tooltip if insufficient KB
- [ ] Success animation/celebration on upgrade complete

### Educational Content
- [ ] Tooltip: "Higher level configs are more powerful in runs"
- [ ] Compare upgraded vs un-upgraded config side-by-side
- [ ] Show ROI: "This upgrade costs 100KB, gains 0.2x coverage (worth it!)"

## Data Model
- [ ] Config level per user (default level 1)
- [ ] Upgrade history log (for analytics)
- [ ] User KB balance management (spent on upgrades)

## Balance
- [ ] Early upgrades accessible (50KB for common)
- [ ] Late upgrades are luxury (maxing legendary = 4000KB)
- [ ] Veteran players feel rewarded (collecting maxed configs)
- [ ] F2P players can progress steadily (not gated)
