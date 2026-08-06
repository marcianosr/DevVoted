---
# DVTD-hbz5
title: 'Unit Tests upgradable: payout and demand per level, storage-priced'
status: completed
type: feature
priority: normal
created_at: 2026-08-05T11:09:35Z
updated_at: 2026-08-05T11:20:59Z
---

Marciano (2026-08-05): Unit Tests becomes upgradable. Per level: +32KB payout AND +1 correct demand; check stays purely correct-answers (no streak flavors). Demand = min(5, level + min(escalation, 3)): auto-escalation caps at 4-of-5 (one-miss margin survives any depth — resolves the gate-12 impossibility), only bought levels may demand the perfect window. Max level 5. Upgrade costs storage (32KB x next level), unlike coverage-gated focus upgrades.

## Summary of Changes

Mid-work refinements (Marciano): max level is 5 for ALL upgradables (briefly 10 for focus, reverted); the ceiling lives on the config itself (Config.maxLevel, default 5 via maxLevelOf) — ESCALATION_CAP stays in rules.model (a climb rule, not a config property). Focus mastery checks now CLAMP to appearances (min(level, seen)) — chosen via AskUserQuestion; without it L6+ was mathematically unpassable and even L3 auto-failed thin windows.

- config.model: maxLevel field + maxLevelOf (default 5); isUpgradable covers check:correct up to the cap (focus too — previously unbounded); upgradeStorageCost = 32 × level bought; describeConfig/givesOf derive Unit Tests copy from level (roster static gives deleted, description realigned).
- effect.model: benefitOf scales storageOnClear × level; focusCheck clamps target to seen; level-aware demand copy (L1 wording unchanged).
- gate.model: currentRequirement = min(SLICE_WINDOW, base + level-1 + min(escalation, ESCALATION_CAP=3)) — resolves the gate-12 demand impossibility (ADR-017 consequence updated).
- run.model: upgrade reducer branches — focus stays coverage-gated/free; correct-check pays storage (log includes price).
- ShopScreen: Upgrade button wears the KB price for Unit Tests, disabled+tooltip 'Costs 64KB — you have 40KB' when short; prismatic when affordable.
- Specs: 7 old-design tests rewritten (isUpgradable, describeConfig, givesOf, roleRows derivation, shop control, reducer paid-upgrade, gate levels) + new cap/clamp cases.
- Wiki §2.2/§4.1 row/§4.3/§4.4 rewrite/glossary/appendix (3 new rows); CHANGELOG bullet rewritten.

Open: dropCount growth still uncapped (gate 10 failure strips 6); Copilot check (Marciano's, planned).

Verified: vitest 1068 passed / 110 files, tsc clean, oxlint + depcruise clean.
