---
# DVTD-60he
title: 'Gate audit roster: seven rules, staged by count'
status: completed
type: feature
priority: high
created_at: 2026-08-17T17:17:42Z
updated_at: 2026-08-17T19:38:21Z
parent: DVTD-kulw
---

Marciano's debuff list, taken as audits (his call via AskUserQuestion — one vocabulary, `Audit` keeps the word). Two of the seven already existed (Mirror at 7, the Burn at 9 → renamed Memory Leak with his 16/32 numbers); five are new. Count escalates 0/1/2/3, stepping at gates 3, 8 and 11 — the same shape as the peel curve.

| Gate | Audits |
| --- | --- |
| 0–2 | clean (onboarding) |
| 3 | Cost Overrun |
| 4 | Dependency Outage |
| 5 | Feature Freeze |
| 6 | Read-only |
| 7 | Mirror |
| 8 | Timeout + Cost Overrun |
| 9 | Memory Leak + Dependency Outage |
| 10 | Read-only + Timeout |
| 11 | Strip + Mirror + Feature Freeze |
| 12 | Memory Leak + Strip + Timeout |

Decisions: Read-only shuts the shop that precedes the gate (no draft/upgrade/rebuild/lock/extend/plan/tag), prep still opens. Dependency Outage takes one *installed* config offline for the attempt, picked deterministically off the window's start index so it survives a reload. Timeout scores an over-limit answer as a miss (no earn, bleed applies, streak breaks) — no auto-submit.

- [x] Audit type: feeMultiplier / freezesManualEffects / closesShop / disablesOneConfig / timedPolls + folds
- [x] Roster + schedule, Burn → Memory Leak (16/32)
- [x] Reducer: fees ×N, frozen actions, shop lock, offline config in scoring, timeout scoring
- [x] View: shopLocked, offlineConfig, poll time limit
- [x] UI: shop locked notice, offline mark on the pipeline row, poll countdown
- [x] Specs + stories
- [x] ADR-038, wiki §2.2/§2.10/appendix, CHANGELOG

## Summary of Changes

**Model.** `Audit` gained five data fields (`feeMultiplier`, `freezesManualEffects`, `closesShop`, `disablesOneConfig`, `timedPolls`) with a fold each, so a new rule is a roster entry and never a branch in the reducer. The Burn became **Memory Leak** (16/32KB), "The Mirror"/"The Strip" dropped their articles. Schedule: one audit from gate 3, two from 8, three from 11.

**Two placement rules found by building it.** Read-only only sits on odd gates — the storage rungs unlock on even ones (ADR-030), so shutting the shop the gate a rung arrives at would unlock something unbuyable for a gate. And Elite's mirror leaves the Champion opening on a cold streak, which the summit's 340% now has to be reachable without (the spec's summit build needed a third multiplier to prove it).

**Engine.** Fees route through `lintFeeFor`/`peekFeeFor` so the button prints what the reducer takes; `lintApplies`/`peekApplies` return false under Freeze; `runReducer` refuses the eight shop writes when `isShopLocked`, with `drop` deliberately exempt; `answer()` scores against a live config list (the outage removed) and treats an over-clock answer as a miss that short-circuits the mirror, recording `timedOut` so the review can still say the pick was right.

**UI.** `usePollClock` owns the countdown *and* the submitted `elapsedMs`, so the display can never disagree with what the gate grades. New `PollClock.ui` chip (+ story) in the audit banner, which also names the offline config; the shop takes a `locked` prop that states the rule once at the top and refuses every control beneath it. Wired into `/proto-run` too, including submitting the real clock.

**Verification.** 1566 tests / 121 files green, oxlint + dependency-cruiser + tsc + build clean. ADR-038 written, ADR-035/README marked, wiki §2.2/§2.7/§2.10/§4.6/glossary/appendix updated, CHANGELOG entry added. Uncommitted.

**Left to tune (all `audit.model.ts`):** the ×2 fee, the 16/32KB leak, and above all the clocks — 30s/25s/20s are guesses, and a rhyming question with a code block is not a 20-second read.
