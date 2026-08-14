---
# DVTD-xbri
title: Inject your run with meta storage
status: todo
type: feature
priority: normal
created_at: 2026-07-24T12:18:12Z
updated_at: 2026-07-27T14:16:47Z
parent: DVTD-z2r2
---

Allow players to spend vault KB during a run to gain bonuses like coverage boost, config unlock, or other run enhancements

## Injection Types

### Coverage Injection
- [ ] Spend X KB to boost coverage by Y% (e.g., 100KB = +5% coverage)
- [ ] Can be used once per poll or limited per run
- [ ] Visual feedback: "Coverage injected: +5%"

### Config Injection  
- [ ] Spend X KB to unlock a temporary config for this run only
- [ ] Cost varies by config rarity/power
- [ ] Config available immediately in shop for rest of run

### Storage Injection
- [ ] Spend X KB to gain X KB storage capacity for this run
- [ ] Useful when close to a gate but storage is bottleneck
- [ ] Clear cost/benefit ratio

### Streak Injection
- [ ] Spend X KB to gain/extend a streak bonus
- [ ] Risky mechanic: rewards gambling with meta-progress
- [ ] Clear cost display

## UI/UX

### Accessibility
- [ ] Inject button visible in RunHub or during poll answering
- [ ] Confirmation dialog showing cost and benefit
- [ ] Show remaining vault KB after injection
- [ ] Warn if injection would leave vault empty/low

### Timing
- [ ] Available at loadout screen (pre-run injection)
- [ ] Available during run at specific points (between gates, between polls)
- [ ] Visual indicator when injection is available

### Feedback
- [ ] Clear animation when injection activates
- [ ] Show breakdown of injection applied
- [ ] Log in end-of-run summary ("Injections used: X KB")

## Balance Considerations
- [ ] Injections cost enough to matter but not gate progression
- [ ] Prevent infinite injection (cap per run or vault)
- [ ] Vault farming: earn rates > injection costs (or adjust)
- [ ] Casual vs hardcore paths (injection helps catch-up players)

## Data Model
- [ ] Track injections used per run
- [ ] Log injection history for analytics
- [ ] User vault KB balance management
