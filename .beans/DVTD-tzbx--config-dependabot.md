---
# DVTD-tzbx
title: 'Config: Dependabot'
status: completed
type: task
priority: normal
tags:
    - config
created_at: 2026-08-15T13:55:17Z
updated_at: 2026-08-20T10:53:40Z
parent: DVTD-72d9
---

Free upgrade you cannot decline

## Spec (2026-08-20)

Legendary. After each gate clear, a 1-in-3 roll: on a hit, one random upgradable config in the pipeline levels up, free. Upgradable itself (maxLevel 2): at L2 the odds shorten to 1 in 2. Draft cost: standard legendary 256KB.

- [x] Config axis `autoUpgradeOneIn` + level-aware odds helper
- [x] Roster entry (legendary, economy family)
- [x] Seeded roll + pick on gate clear in the run reducer, with log line
- [x] isUpgradable + describeConfig/givesOf support
- [x] Eligibility rule: Option A — any isUpgradable config, self-bump allowed, Focus mastery gate ignored (Marciano, 2026-08-20)
- [x] Specs for odds helper and roll/pick (reducer hook covered indirectly; add one after eligibility lands)
- [x] Wiki roster table + changelog

## Summary of Changes

New axis autoUpgradeOneIn (config.model) with autoUpgradeOneInOf (L1: 1-in-3, L2: 1-in-2, maxLevel 2, standard legendary 256KB). Seeded roll + pick in config/domain/autoUpgrade.model.ts (Option A eligibility: any isUpgradable config, self-bump allowed, mastery gate ignored — a legendary privilege; ADR-039 still governs the shop). Hooked into closeWindow, rewarding branch only.

Announcement (the run log never shows in the live game): autoUpgradedConfigId on RunState (set at clear, cleared on finish-reward like justUnlockedSlots), exposed as autoUpgradedConfig on the view. Reward screen announces the merge (chip + sentence); the shop RoleList badges it — new Badge tone legendary + pulse prop, tooltip Upgraded-Dependabot-merged-it-free. Offline still wins the badge slot.

1617 tests pass, oxlint + dep-cruiser + tsc clean. Wiki roster + changelog updated. Stories: RoleList JustUpgraded, RewardScreen DependabotMerged (game-design reason: the merge is a build change the player never chose — the announcement is how they learn it happened).
