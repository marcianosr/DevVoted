---
# DVTD-z94q
title: 'Config upgrade system: max level 5 (in-run)'
status: completed
type: feature
priority: normal
created_at: 2026-07-24T12:46:02Z
updated_at: 2026-08-06T16:44:44Z
parent: DVTD-d0fw
---

Implement a config upgrade system where players can upgrade configs from level 1-5, with clear progression and upgrade paths.

⚠ **Plan changed twice since this was written (2026-07-24):** max level 10 → **5** (Marciano), and upgrades are **in-run**, not persistent meta-progression. A config's level lives on the run's own instance and is gone when the run ends. The persistence, vault-spending, dex-driven and education scope moved to **DVTD-fv8x**, which has to decide whether persistent levels should exist at all.

## Level system (1-5) — shipped
- [x] All configs start at level 1 (`config.level ?? 1`)
- [x] Each level increases power — Focus: `focusCoverageMultiplier = 1 + 0.25 × level` (L1 ×1.25 → L5 ×2.25); Unit Tests: flat clear payout × level
- [x] Max level 5 (`DEFAULT_MAX_LEVEL`, per-config override via `maxLevel`), enforced by `isUpgradable` and covered in config.model.spec

## Upgrade currency — shipped, priced differently to the July plan
- [x] Two currencies rather than one rarity table: Focus configs upgrade **free behind a coverage gate** (`upgradeCoverageRequired = level × 5`% in that category), Unit Tests upgrades for **storage** (`32KB × the level being bought`), buying payout AND demand together
- [x] Spent from run storage, not the vault — a deliberate consequence of upgrades being in-run

## Upgrade path clarity — shipped
- [x] Requirements shown on the Upgrade button's tooltip: "Costs 64KB — you have 40KB" / "Unlocks at 5% JavaScript coverage — you have 2%", the category named in its own Kanto colour
- [x] Next level's stats on hover ("L2: JavaScript polls earn 1.5× coverage — but if JavaScript shows, you must get 2 right"), with the current level's on the row beneath it
- [x] Player-friendly wording — the multiplier and the demand in one sentence, no raw stats
- [x] Button disabled with an explaining tooltip when gated; wears the legendary ring once unlocked

## Deferred to DVTD-fv8x
Persistent per-user levels, vault spending, rarity cost table, dex upgrade flow + confirmation dialog, upgrade history log, hub highlight, onboarding, achievement, success animation, ROI line, side-by-side compare, and the `L3/5` ceiling on the chip badge.

## Summary of Changes

Closed on the **in-run** upgrade mechanic, which is complete and tested. Audited against the code on 2026-08-06:

- `config.model.ts`: `DEFAULT_MAX_LEVEL = 5`, `maxLevelOf`, `isUpgradable` (upgradable = a Focus config or the `correct` check-carrier, and below its ceiling), `upgradeCoverageRequired`, `upgradeStorageCost`, `focusCoverageMultiplier`, `focusDemand`.
- `run.model.ts`: the `upgrade` action, guarded by `isUpgradable` and by the coverage/storage gate, applying `levelUp`.
- `ShopScreen.ui.tsx`: the Upgrade button per row, its gate tooltip, the prismatic ring when met, and the level badge on the chip.
- Specs: `config.model.spec` pins the level-5 ceiling and which configs are upgradable at all; `ShopScreen.spec` covers the storage price, the gated tooltip, the unlocked ring, and the dispatch.

Not a code change in this pass beyond one doc fix: the comment above `isUpgradable` still said "default 10" after the cap moved to 5.

Verified: vitest 1134 passed / 114 files, tsc clean, oxlint + depcruise clean.
