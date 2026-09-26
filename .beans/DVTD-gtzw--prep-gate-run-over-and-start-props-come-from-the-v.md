---
# DVTD-gtzw
title: Prep, gate, run-over and start props come from the viewmodel
status: todo
type: task
priority: normal
created_at: 2026-09-25T19:45:49Z
updated_at: 2026-09-25T19:45:49Z
parent: DVTD-y3vn
blocked_by:
    - DVTD-dhfx
---

**What:** The prep, gate outcome, run-over and new-run screens get their props from one application function each.

**Why:** Their wiring components build frames of up to forty fields and call the domain directly, work the layer rules place in the application layer where it can be tested without rendering.

## Done when
- [ ] Each of the four screens has one props function over the run view, handlers and local state, with a spec
- [ ] No wiring component calls a domain function directly
- [ ] The dead reveal and unlock-note helpers are gone

## Notes
Plan section "Slice 5" (5c). `prepScreenPropsFor` absorbs `windowOf`, `asidesFor`, `armedFor`, `respondingFor`, `buildSpaceOf`; `gateOutcomeScreenPropsFor` receives what `gateOutcomeFrameOf` still is after the gate close slice (keep `gateAnswersOf` exported for ReviewView); `runOverFrameOf` → `runOverScreen.viewmodel.ts`; StartView logic → `newRunScreenPropsFor`. Delete `revealedPoll`, `justFiredLines`, `unlockNotesFor`. Un-export `pollScoresFor`, `subscriptionsLedgerFor`.
