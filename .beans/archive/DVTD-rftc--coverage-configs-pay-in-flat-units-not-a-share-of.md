---
# DVTD-rftc
title: Coverage configs pay in flat units, not a share of the answer
status: completed
type: task
priority: high
created_at: 2026-09-15T08:39:08Z
updated_at: 2026-09-15T08:50:16Z
---

Code Coverage (`coverageAdd: 0.1`) and Cache (`cacheHitStep: 0.25`) land inside the
multiplier product via `buildMultiplierOf = Pi(mult) * (1 + Sum(add))`, so what they pay
depends on the rest of the build: +0.1 units alone, +0.2 on a multiple, +0.4 stacked
with AGENTS.md. A config that cannot state what it pays cannot be reasoned about.

The poll screen has the matching problem: `coverageLeadFor` renders "You have scored
18 out of 15 slots", comparing units to slots.

Numbers do not change. `x1.1` on a 1-unit base IS `+0.1 units`, so a correct
single-choice answer pays exactly what it pays today. Only where the add lands moves.

## Todo

- [x] Split `buildMultiplierOf` into mults-only plus a flat units sum (build.model.ts)
- [x] Move the flat add beside `streakUnitBonus` in `coverageForAnswer`
- [x] Fix `coveragePerCorrectRaw` to `mult * throttle + add`
- [x] Fix `coverageBreakdownForAnswer` attribution to report a flat add
- [x] Replace `cacheMultiplierFor` with a units function (config.model.ts)
- [x] Move the cache term from `mult` to `add` in `coverageOf` (effect.model.ts)
- [x] Add the missing `kind: "coverage"` branch to `figureLabel` (chip reads "+0.1 KB" today)
- [x] Retarget the tally copy to "N units across M slots"
- [x] Update the specs that pin the old algebra
- [x] ADR-083 plus README index entry
- [x] Wiki 2.5 formula, Code Coverage row, Cache row, unbuilt configs, streak contradiction
- [x] CHANGELOG entries
- [x] Run lint, build, tests

## Summary of Changes

`coverageForAnswer` is now `BASE_UNIT x share x credit x mults + adds + streak step`.
`buildMultiplierOf` is the multiplier product alone; `flatUnitsOf` sums the adds.

- **Cache** moved from a multiplier to an add: `cacheMultiplierFor` deleted,
  `cacheUnitsFor` returns `step x min(hits, CACHE_HIT_CAP)`. Four hits pay one unit
  where they used to double the answer.
- **Numbers unchanged.** `coverageAdd` stays 0.1, `cacheHitStep` stays 0.25. The
  roster was not edited. A correct single pays exactly what it paid before.
- **`minifiedUnits` added.** `minifiedAmount` floors (it is for whole KB), so a
  minified Code Coverage was paying 0 rather than 0.05. Every coverage add routes
  through the new fractional-safe helper.
- **`figureLabel` gained its missing `kind: "coverage"` branch.** The Code Coverage
  chip read `+0.1 KB` before this, labelling coverage as storage.
- **Tally copy**: "You have scored 18 units across 15 slots", singular at one.

Balance: an add no longer rides the multiplier product, so it is weaker in stacked
builds. Cache on a fully answered select-all is the largest move, 4 units to 3.

Docs: ADR-083 plus README index; wiki 2.5 earn formula, adds/mults rows, the streak
paragraph (it pays into BOTH meters and DOES reset at a clear, both stated wrongly
before), the reveal arithmetic, Code Coverage and Cache roster rows, the two unbuilt
percentage configs, and two new numbers-reference rows. CHANGELOG: one new entry,
plus the Code Coverage and tally-copy entries amended in place (same unreleased block).

Verification: 4270 passing, lint clean, `tsc --noEmit` clean, prettier clean.
The 2 failures in `gate.model.spec.ts` ("the floor rule") are PRE-EXISTING at HEAD:
`gateClosingFor` has an explicit `TODO(marciano)` where `clearsGateFloor` belongs.
Tracked by DVTD-xl63. Not touched by this work.
