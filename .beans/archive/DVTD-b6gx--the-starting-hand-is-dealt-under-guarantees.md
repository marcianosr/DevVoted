---
# DVTD-b6gx
title: The starting hand is dealt under guarantees
status: completed
type: feature
priority: high
created_at: 2026-09-06T07:31:44Z
updated_at: 2026-09-06T07:41:43Z
---

The deal has no variance today: STARTER_POOL holds 5 live configs and HAND_SIZE is 5, so the hand is the whole pool reshuffled. When DVTD-p9ah swaps the pool to the account's granted configs, curation stops holding by construction (ADR-052 D6) and Grant dilutes itself (17% chance of seeing a given config at a pool of 29, ~3 months at 2 runs/month).

Phase 1 shapes the draw so it can never be degenerate at any pool size. Phase 2 (the new-grant guarantee) is blocked by DVTD-clgs and folds into DVTD-p9ah.

## Rules

| Rule | Why |
| --- | --- |
| Configs larger than the slot budget are never dealt | A card you cannot install is not a choice (agentsMd is 8 slots vs BASE_SLOTS 4) |
| The three smallest dealt configs fit the slot budget together | A three-config build is always reachable, not just the one-config floor |
| Between one and two focus configs | Reproduces STARTER_POOL's passive majority; count varies by seed |
| The newest granted, never-installed config takes one hand slot | Phase 2 — the objective taught the mechanic, the grant should let you use it |

Not added, deliberately: a separate coverage-earner rule (touchesCoverage is implied by focusCategory), dedupe-by-effect, can-trigger-today, rarity weighting.

## Todo — Phase 1

- [x] hand.model.spec.ts: failing tests for all four Phase 1 invariants + invariant sweep over 200 seeds against full CONFIG_LIST
- [x] STARTER_POOL becomes ADR-051 D2's free eight (js, ts, css, eslint, unitTests, codeCoverage, indexedDb, coldStart); drop gitRebase and the commented-out entries
- [x] startingHand(pool, seed, slotBudget): eligible filter, focus band 1-2, three-smallest repair
- [x] Update callers: run.service.ts, proto-run.tsx
- [x] docs/adr/062-the-starting-hand-is-dealt-under-guarantees.md + README index row
- [x] wiki §6.2: the deal's rules, and fix the nine/eight drift
- [x] CHANGELOG entry
- [x] npm run lint + npm run build + npm test

## Flagged drift (not fixed here)

- Five roster configs have no objective row: gitRebase, abTest, yarnLock, cache, garbageCollection. ADR-051 D5 requires one per config.
- wiki §6.2 says "Nine configs are granted at signup" — stale since the 2026-09-04 amendment to eight.
- DVTD-clgs says "seed the free nine" in two todos — same staleness.

## Summary of Changes

Phase 1 shipped; Phase 2 (the new-grant guarantee) stays with DVTD-p9ah, blocked by DVTD-clgs.

**hand.model.ts** — STARTER_POOL is now ADR-051's free eight (gitRebase and the five commented-out entries removed). `startingHand(pool, seed, slotBudget)` takes the budget as a third argument, matching `recommendedPicks(hand, maxSlots)`; the domain does not reach into rules.model for it. New exports `FOCUS_BAND` (1..2) and `PAIRABLE_PICKS` (3). The draw filters to installable configs, deals under the focus band with a seed-derived count, then repairs pairability by swapping the heaviest spare card for the lightest bench card. `heaviestSpare` refuses to evict the last focus config and `lightestAddable` refuses to breach the band, so the two guarantees cannot fight; the repair terminates because each recursion removes one card from the bench.

**Callers** — run.service.ts and proto-run.tsx pass BASE_SLOTS.

**Tests** — 30 passing in hand.model.spec.ts, including a 200-seed invariant sweep against the full CONFIG_LIST. That sweep is the real proof: the free eight are all 1 or 2 slots, so they satisfy every rule by accident and only a roster-sized pool exercises the draw.

**Docs** — ADR-062 written; inline amendment markers added to ADR-052 D6 (answered) and ADR-050 D2 (amended); README index row; wiki §3 (the deal's rules), §6.2 (nine → eight, plus the oversized-config consequence) and the constants table; CHANGELOG entry.

## Notes

- One test of mine was wrong on the first run: `intellisense` at exactly 4 slots is installable at a budget of 4, so the rule is larger-than, not as-large-as. Kept as an explicit positive test.
- Verification: lint clean (923 modules, no dependency violations), build passes, 3510/3521 tests pass. The 3 failures are pre-existing in RewardScreen.spec.tsx (swatch naming, shortfall wording, "kept" vs "earned"); both that spec and its subject are unchanged vs HEAD and neither imports anything touched here.
- An LSP diagnostic claimed `"rebase"` was not assignable to the RunAction union in proto-run.tsx:626. It is (runAction.model.ts:45) and the build passes; phantom.

## Follow-ups worth beans

- Five roster configs have no objective row (gitRebase, abTest, yarnLock, cache, garbageCollection). ADR-051 D5 requires one per config, so they are unreachable through Grant.
- DVTD-clgs says "seed the free nine" in two todos, stale since the 2026-09-04 amendment to eight.
- Open question, deferred not rejected: should the deal guarantee one dealt focus config matches a category in gate 0's polls, so the calibration gate demonstrates an effect?
