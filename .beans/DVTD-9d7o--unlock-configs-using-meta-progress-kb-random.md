---
# DVTD-9d7o
title: Unlock configs using meta-progress KB (random)
status: todo
type: feature
priority: normal
created_at: 2026-07-23T13:37:05Z
updated_at: 2026-07-25T14:59:50Z
parent: DVTD-u35m
---

Allow players to spend accumulated vault KB to unlock random configs between runs, creating a progression loop

## Mechanics

### Unlock System
- [ ] Players can spend KB from vault to unlock a random config
- [ ] Cost scales by config rarity (common = 50KB, uncommon = 150KB, rare = 300KB, legendary = 500KB)
- [ ] Cost may increase if config already rolled multiple times (pity system)
- [ ] Show cost clearly before unlock attempt

### Randomization
- [ ] Only offer configs not yet unlocked to player
- [ ] Weight probability by rarity (common more likely, legendary rare)
- [ ] Optional: seasonal/rotating config pools
- [ ] Display odds/probabilities to player

### Progression Loop
- [ ] Runs earn vault KB → stored in user vault
- [ ] Hub screen shows "Unlock a Config" button
- [ ] Spending KB unlocks config → available in next run's loadout
- [ ] Celebrate unlock with animation/feedback

### Pity/Safety Mechanics
- [ ] Guarantee legendary unlock after N pulls (e.g., 10 pulls)
- [ ] Prevent duplicate spends (button disabled if insufficient KB)
- [ ] Show path to next guaranteed legendary

## Data Model
- [ ] User vault KB balance
- [ ] Unlocked configs per player (with unlock date/method)
- [ ] Unlock attempt history (for pity tracking)
- [ ] Config rarity/cost tier mapping

## UI/UX
- [ ] Vault KB display in hub/loadout
- [ ] "Unlock Config" dialog with cost and odds
- [ ] Spinning/reveal animation on unlock
- [ ] Unlock history/collection view
- [ ] Show "X more pulls to guaranteed legendary" progress

## Future Ideas
- Seasonal config unlock events
- Weekly free unlock token
- Trade/merge duplicate configs (post-launch)

## Mechanics decisions (2026-07-25)

Cap/grant edge cases resolved in [ADR-015](../docs/adr/015-storage-cap-policy-grant-and-cap-extender-configs.md): one-shot grant configs are strip fodder (no item class), grants clip at cap with the clip shown in the shop, cap-extenders use a soft over-cap on removal (excess persists, gains freeze), and no-selling is recorded as deliberate.
