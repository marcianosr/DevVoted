---
# DVTD-2try
title: 'Unlock system: configs, starter slots, borders'
status: draft
type: feature
priority: normal
tags:
    - meta-progress
created_at: 2026-07-16T20:29:52Z
updated_at: 2026-08-20T09:20:51Z
parent: DVTD-z2r2
---

Every config in CONFIG_LIST is available from run one; there is no progression gate. Three things should unlock permanently per account: configs, extra starter config slots, and cosmetic borders. Only unlocked configs feed the start-of-run draw and mid-run drafts.

Merged with DVTD-yuwi (scrapped), which carried the starter-slot and border scope.

## The trigger is undecided, and it blocks everything else

- clear gate N, or hit a coverage threshold in the config's own category
- lifetime stats: runs completed, wins (came from DVTD-yuwi)
- DVTD-9d7o: spend vault KB on a random pull

## Open

- Curated per config ("clear gate 3 unlocks Copilot") or rule-based by rarity?
- Persistence: no cross-run unlock store exists (only run_category_coverage, per-run). Needs a new table or a column on usersTable.
- Do locked configs show as silhouettes somewhere (Pokedex "seen but not caught")?
- Slots: in-run slot unlocks already ship (DVTD-ein1, gate swatches). Do account-level starter slots ride the same ledger?
- Shares that ledger with DVTD-g8ty (swatches), or stays separate?
- Borders are cosmetic and depend on no trigger. Split them back out if this bean gets too big to start.

## Work, once the trigger is picked

- [ ] Unlock-state persistence (configs, starter slots, border preference)
- [ ] Starter slots: tiers, unlock criteria, loadout UI showing available vs locked
- [ ] Borders: variants, selection UI, shown on run screens
- [ ] Locked configs visible in the shop with their unlock criteria
