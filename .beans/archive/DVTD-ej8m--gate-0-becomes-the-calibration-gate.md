---
# DVTD-ej8m
title: Gate 0 becomes the calibration gate
status: completed
type: feature
priority: high
created_at: 2026-09-04T14:55:27Z
updated_at: 2026-09-04T15:21:24Z
parent: DVTD-u35m
---

Plan: ~/.claude-work/plans/i-d-change-it-to-cozy-rain.md

Marciano, 2026-09-04. Gate 0 (Pallet) gets one clean role: tutorial/calibration. It still measures you (3% demand stays) but cannot cost you anything, and the opening build stops deciding for the player.

Five rules:
1. Opening build is EMPTY. One config is the minimum to play — the floor, NOT a pre-installed or locked config. Reaffirms ADR-052 D3; does not revive ADR-017's dead `fixed: [CONFIGS.unitTests]`.
2. HAND_SIZE stays 5.
3. RECOMMENDED_SIZE 3 -> 2, and the recommendation becomes an advisory MARKER, not an install.
4. A Pallet miss peels 0 and cannot kill.
5. Boulder (gate 1) onward the peel curve is unchanged.

Decided alongside: gate 0 keeps its 3% demand (resolves ADR-034 open q3); a waived miss lands on /run/review, skipping only the repair screen; both configure screens get the marker, prototype first.

## Todos
- [x] RECOMMENDED_SIZE 3 -> 2 + a pin on the literal
- [x] Stop preselecting: drop withRecommendedBuild from run.service + proto-run, delete it, cut its 3 specs
- [x] RunView.recommendedConfigIds, recomputed not persisted; runView.factory default
- [x] Marker: terminal-theme DealRow.recommended, then production ConfiguringScreen bench chips
- [x] GATE_FAIL_PEEL_SHARE[0] = 0
- [x] gateStake.missIsFree + the waived-miss log line
- [x] Route a waived miss to /run/review (widen the routesForStatus Picks)
- [x] Strip screen explains the free miss (reachable by direct nav)
- [x] 0-guards: MissCost, GateRewardReport, GatesPanel (-0 renders +0), StartView, PrepView, RemovalView, Stake
- [x] Boy-scout: GateStakeReceipt/GateRewardReport label slots as configs
- [x] Spec moves to gate 1 + new gate-0 tests
- [x] ADR-057, amend ADR-052/034/README, wiki, CHANGELOG
- [x] lint, tsc, test

## Baseline before starting
tsc --noEmit: 0 errors (the ADR-056 audit refactor landed clean).
npm test: 2716 passed, 3 failed — all in modern-theme/RewardScreen.spec.tsx, pre-existing copy assertions on an unmodified component.

## Summary of Changes

ADR-057 written; ADR-052 D2 amended and D3 reaffirmed inline; ADR-034's open
question 3 struck (keep the 3%, waive the peel); README indexed; wiki §2.8 gate
table, its new calibration-gate paragraph, §4 "Starting a run" and the pinned
numbers row updated; two CHANGELOG entries edited in place (both were unreleased)
plus one new.

**The mechanic is one table cell.** `GATE_FAIL_PEEL_SHARE[0] = 0`. Chosen over a
branch in `peelQuotaSlotsFor` or `failPeelQuotaFor` because `gatedex.model.ts`
reads `failPeelShareFor` directly, bypassing the quota — any lower branch would
leave the routed Dex publishing a 20% Pallet peel the engine never takes. Audits
still compose on top, and `rules.model.spec.ts`'s "rounds a quota up" test passes
its share explicitly, so the rounding rule was never touched.

**Branch order is load-bearing.** The waived-miss path sits after `isPeelFatal`,
because `isPeelFatal(0, 0)` is true and that is what still kills a bare build.
Narrowing `isPeelFatal` to `>` would strand such a run; the strip spec now says so
where somebody might "optimise" it.

**Routing, not a new status.** Marciano chose (after I raised it) to land a waived
miss on `/run/review` rather than skipping to the shop: `/run/review` is linked
only from the strip and reward screens, and reward is excluded for a redo, so
skipping would have made the failed gate's five answers unreachable at the one gate
where reading them is the point. `routesForStatus` flips to `[review, strip]` when
`peelSlotsRemaining === 0`. Because `syncTarget` only moves a player whose current
screen is not allowed, somebody who just paid their last slot on the strip screen
stays there — pinned by a new test.

This made the change SMALLER than planned: no `resumeClimb` call from
`closeWindow`, no new `answer.model -> strip.model` import edge, no cycle risk.

**The recommendation is derived, not stored.** `RunView.recommendedConfigIds` is
recomputed in `toRunView`; `recommendedPicks` is deterministic in
`(hand, slotBudget)` and both inputs already survive a snapshot. A persisted field
would have needed either a required key that breaks in-flight hydration or an
optional one whose only fallback is recomputing. Pinned by a reload test.

**Also fixed (found by an agent, verified by hand):** `signed(-0)` returns `"+0"`
because `-0 < 0` is false, so the routed Dex would have shown Pallet as "+0". Now
renders "none". The column's own label is wrong in a separate way — filed as
DVTD-vedd rather than silently redefining a Dex column.

**Boy-scout, in files already being touched:** `GateStakeReceipt`'s `MissCost` now
takes `peelConfigsOnFailure` (a range) instead of the slot count, and the repair
screen quotes slots as slots. `gate.model.ts:66-70` warns against exactly the
confusion those two had. Also fixed the stale `stripsOnFailure` key in
`StripScreen.stories.tsx`, which was a silent excess-property error hidden by the
`*.stories.tsx` tsconfig exclusion.

## Not done, deliberately

- `PollView.component.tsx:284` returns no retry-cost fact at all when the peel is
  0, so the poll screen says nothing about it at gate 0. A positive "this gate
  takes nothing" line is probably better teaching than silence, but that is a
  design call, not a guard.
- `agentsMd` is 8 slots against `BASE_SLOTS` 4, so it is an unpickable card in a
  five-card deal and can never be recommended. Pre-existing, more visible now.
- `plural`/`countRange`/`signed` are duplicated across the two theme `format.ts`
  files; I added a third `countRange` rather than consolidating into `~/shared/lib`.

## Verification

`npm run lint` clean (900 modules). `npx tsc --noEmit` 0 errors. Stories
typechecked against a scratchpad tsconfig clearing the `*.stories.tsx` exclusion:
clean. `npm test` 2735 passed, 3 failed — the same three pre-existing
`modern-theme/RewardScreen.spec.tsx` copy assertions as the baseline (2716/3), so
+19 net tests and no new failures.
