---
# DVTD-gxah
title: Verify coverage mechanics in game
status: completed
type: feature
priority: high
created_at: 2026-08-14T09:00:30Z
updated_at: 2026-08-19T20:36:20Z
parent: DVTD-u35m
---

Check what coverage does in the game:
- How does coverage affect gameplay and progression?
- Does coverage increase storage reward when you get higher coverage?
- Verify that coverage gates content unlock (rungs) correctly
- Document the coverage-storage relationship (if any)
- Test with multiple runs to confirm behavior

This is foundational to understanding the roguelike progression system and how coverage (score) differs from storage (reward).

## Summary of Changes

Answered from `docs/wiki.md` §2.5, §2.8, §5.1 and `rules.model.ts`; no code or design work needed.

- **What coverage does**: two ledgers. The **gate meter** is the window's net coverage, reset every attempt, and is the only number a gate judges (`COVERAGE_DEMANDS` 3 → 340 across 13 gates). **Career totals** (per-category % + run total) feed the leaderboard and Focus upgrades and gate nothing.
- **Does coverage increase the storage reward?** No. The gate faucet is `32 KB × gate × correct ÷ 5` and IndexedDB is +8 KB per correct: both read *correct answers*, never coverage. Coverage and storage share an input, not a formula. Coverage is score, storage is reward.
- **Does coverage gate content unlock (rungs)?** No. Storage rungs are staged by gate number (ADR-030); ADR-034 deleted the total-coverage axis. The only coverage-staged thing left is Focus upgrades, staged by *category* coverage (§4.4).
- **Coverage-storage relationship**: documented in §2.5 and §5.1, plus the overflow rule (clamps only at prep's Start gate).

Remaining bullet ("test with multiple runs") is covered by ordinary `/proto-run` playtesting, not by a standing bean.
