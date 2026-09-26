---
# DVTD-rxsk
title: A failed gate peels a config and re-runs the loop
status: completed
type: feature
priority: high
created_at: 2026-08-17T13:54:50Z
updated_at: 2026-08-17T14:15:46Z
parent: DVTD-kulw
---

Reverses ADR-035's free redo (Marciano, 2026-08-17): failing a gate now costs configs and sends the player back through the normal post-gate flow at the SAME gate — build report → strip → shop → prep → answer. Strips are no longer audit-owned; every gate peels on a miss, so the death spiral exists again ("how else are you dying?").

## Decisions

- Base quota: every failed attempt peels 1 config (`GATE_FAIL_STRIPS`, live-tuned).
- The strip audits (Elite/Champion) become *extra* on top of the base: totals stay 2 and 3.
- Death: `isStakeFatal(quota, installed)` — one config left + a miss = run over. Folds in the old bare-legacy guard.
- The failed flow reuses the built strip path: `awaiting-strip` → StripScreen (build report + peel + retry stake) → review → `resume-climb` → shop → prep → same gate.
- No payout screen on a redo: `/run/reward` is a clear payoff (celebratory, +KB). A redoing run's route list starts at the shop.
- The stake receipt states the peel at every gate, and marks a miss fatal when the quota takes the build.

## Todo

- [x] `GATE_FAIL_STRIPS` in rules.model + `failStripQuotaFor` in gate.model
- [x] audit.model: strip quotas become extra; descriptions state the total
- [x] closeWindow: fail → strip quota / death; delete the free-redo branch
- [x] resumeClimb: no longer dormant; lands in the shop
- [x] runView: GateStake.stripsOnFailure + missIsFatal
- [x] GateStakeReceipt: miss copy + fatal line
- [x] Route sync: a redoing rewarding run skips /run/reward
- [x] RunReview failure exit → shop
- [x] Specs green (run/gate/audit/rules/runRoutes/receipt/strip/prep)
- [x] ADR-037 + ADR-035 supersession marker + README index
- [x] wiki §2.7 + CHANGELOG + memory

## Summary of Changes

**Domain.** `GATE_FAIL_STRIPS = 1` (rules.model) + `failStripQuotaFor(configs, gate)` (gate.model) own the peel; `audit.model`'s `stripQuotaFor` became `auditExtraStrips` and the strip audits dropped to extras (1 at Elite, 2 at Champion → totals 2 and 3, descriptions state the total). `closeWindow`'s fail branch collapsed from four branches to two — quota, or death via `isStakeFatal` (which absorbs the old bare-legacy guard) — and the free-redo branch is gone. `resumeClimb` lost its "dormant" comment and is now the way out of every missed gate.

**Flow.** `routesForStatus` reads `redoingGate` and gives a retry `[shop, prep, review]` instead of `[reward, review, shop, prep]` — the reward screen is a "+KB, gate cleared" payoff and would have named the gate just missed. `RunReview`'s failure exit commits `resume-climb` and lands on `/run/shop` (was the community detour). No new screens: the strip screen already carried the build report, the bill and the retry stake.

**Copy.** `GateStake` gained `stripsOnFailure` + `missIsFatal`; `GateStakeReceipt` has a `MissCost` block naming the peel, with a cinnabar line when the peel would empty the build. Swept the HUD gate hint, GameLoopExplainer step 3, `RunSummary`'s break line, `RunStrip`'s "pipeline(s)" hint (peels take configs, not pipelines) and StripScreen's dormant-audit doc comment.

**Specs/stories.** New `failGate`/`payPeel` helpers in run.model.spec; the failure-model and window-meter describes rewritten around the peel, plus a death-clock test (three misses on three configs ends the run). New route test for a redoing run, viewmodel tests for the deepened peel and the fatal flag, PrepScreen tests for both miss lines. Stories: PrepScreen `LastConfigStanding` (the fatal warning — player-visible death signal), StripScreen `EliteDeepPeel`, ChampionSuppressed's audit copy fixed.

**Docs.** ADR-037 written; ADR-035's Decision 3 marked superseded and Decision 4 narrowed; README index row added. Wiki §1.1, §2.2 (outcome table), §2.6, §2.7 (rewritten around the peel), §2.8, §2.9, §2.10, §5.2, §7.2, glossary (Redo → Peel) and the numbers appendix updated. The unreleased CHANGELOG entry was *edited* rather than appended to — the free redo never shipped, so the release notes describe what actually ships.

**Verification.** 1525 tests / 121 files green, oxlint + dependency-cruiser clean, `npm run build` clean. Nothing committed.

**Left to Marciano:** `GATE_FAIL_STRIPS` is the death clock's speed, and ADR-037 leaves open whether repeated misses at the same gate should deepen the peel (a spiral rather than a clock).
