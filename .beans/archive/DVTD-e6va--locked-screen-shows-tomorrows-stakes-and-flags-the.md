---
# DVTD-e6va
title: Locked screen shows tomorrow's stakes and flags the escalation rise
status: scrapped
type: feature
priority: normal
created_at: 2026-07-25T15:23:27Z
updated_at: 2026-07-25T15:48:24Z
---

Escalation (floor(gatesCleared/2)) is invisible: nothing tells the player the bar went up between days. Add requirementRise(pipeline, gatesCleared) to gate.model, expose demands+demandRise on the locked screen, and flag the jump ('up from N') when a cleared gate raised the correct-requirement. Chosen surface: daily locked screen (comeback hook + warning). Follow-ups considered: shop upgrade preview, gate ladder badges.

## Summary of Changes

- `requirementRise(pipeline, gatesCleared)` in `gate/gate.model.ts`: compares `currentRequirement` at gatesCleared-1 vs gatesCleared, returns `{from,to}` or null. 4 specs (jump, hold, first gate, upgraded-level base).
- `RunView.demandRise` exposed from `runView.viewmodel.ts` (next to `demands`, which already carried the pending gate's escalated demand strings); factory default null.
- `LockedScreen.ui`: new 'Tomorrow's stakes' block — 'Gate N demands 2 correct answers ▲ up from 1 · +5% coverage this window'. Rise cue saffron, suppressed mid-window (same gate continues, bar didn't move). 5 UI specs; stories now cover risen/held/mid-window/multi-demand. The TODO(marciano) content block left untouched.
- `RunLocked.component` passes `view.demands`/`view.demandRise`.
- Changelog bullet added (locked screen is unreleased but this is a feature, not a bug fix).

Deferred (candidate follow-ups): shop upgrade preview (combined level+depth demand on the Unit Tests upgrade button), gate ladder demand badges, and a per-row 'scales with depth' marker distinguishing escalating checks (correct, coverage-gain) from flat ones (cold-start, focus mastery).

## Reasons for Scrapping

The locked screen itself was removed the same day (Marciano: the lock is only meant to stop progression, not to be a destination). With no screen there is no surface for tomorrow's stakes — requirementRise/demandRise reverted with it. If the rise cue returns, candidate surfaces from this bean still apply: shop upgrade preview, gate ladder badges.
