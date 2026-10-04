---
# DVTD-gtzw
title: Prep, gate, run-over and start props come from the viewmodel
status: completed
type: task
priority: normal
created_at: 2026-09-25T19:45:49Z
updated_at: 2026-09-30T17:18:32Z
parent: DVTD-y3vn
blocked_by:
    - DVTD-dhfx
---

**What:** The prep, gate outcome, run-over and new-run screens get their props from one application function each.

**Why:** Their wiring components build frames of up to forty fields and call the domain directly, work the layer rules place in the application layer where it can be tested without rendering.

## Done when
- [x] Each of the four screens has one props function over the run view, handlers and local state, covered through its component spec
- [x] No wiring component calls a domain function directly
- [x] The dead reveal and unlock-note helpers are gone

## Notes
Plan section "Slice 5" (5c). `prepScreenPropsFor` absorbs `windowOf`, `asidesFor`, `armedFor`, `respondingFor`, `buildSpaceOf`; `gateOutcomeScreenPropsFor` receives what `gateOutcomeFrameOf` still is after the gate close slice (keep `gateAnswersOf` exported for ReviewView); `runOverFrameOf` → `runOverScreen.viewmodel.ts`; StartView logic → `newRunScreenPropsFor`. Delete `revealedPoll`, `justFiredLines`, `unlockNotesFor`. Un-export `pollScoresFor`, `subscriptionsLedgerFor`.

## Summary of Changes (2026-09-30)

`prepScreenPropsFor` (prepScreen.viewmodel) absorbed the window, asides, start-refusal precedence and handler wiring, so `PrepView` no longer calls `gateClearPayout` itself; `gateOutcomeScreenPropsFor` + `gateOutcomeFrameOf` + `gateAnswersOf` + `GatePeelPicks` live in `gateOutcome.viewmodel.ts` (ReviewView imports `gateAnswersOf` from there); `runOverScreenPropsFor` + `runOverFrameOf` live in `runOverScreen.viewmodel.ts`; `newRunScreenPropsFor` (newRunScreen.viewmodel) absorbed the hand groups, the warm-boot draft panel and the press rule. The four components are 23 to 62 lines: state, hooks, one call. Deleted `revealedPoll`, `justFiredLines`, `unlockNotesFor` and `UnlockAnnouncement` with their specs (no production caller).
