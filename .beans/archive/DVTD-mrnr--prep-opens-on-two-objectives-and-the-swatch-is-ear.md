---
# DVTD-mrnr
title: Prep opens on two objectives, and the swatch is earned by a perfect window
status: completed
type: feature
priority: high
created_at: 2026-09-14T09:07:41Z
updated_at: 2026-09-14T09:24:55Z
---

Prep's "Objectives and rewards" panel drops its three prose readings and becomes
a two-row objective list: clear the gate (reach OK or better, gate N+1 opens
tomorrow) and earn the gate's swatch (answer 5 of 5, kept for good). The two are
won separately, which is a rules change: today `swatch.model.ts` awards the
swatch for clearing.

Also: the prep footer loses "Starting locks this build for the window."

## Todo

- [x] Drop PREP_LOCK_NOTE from the prep footer
- [x] Objectives.ui.tsx in kanto-theme (rows, tick/dashed mark, trail badge) + story + spec
- [x] objectives viewmodel: live state per row, gate name, next gate name
- [x] BandOutcomes drops `lead` on prep; drop base-poll-score and coverage-held readings
- [x] RunState gains the earned-swatch gate; closeWindow sets it on a 5-of-5 window
- [x] run.repository awards off the perfect window, not off the clear
- [x] swatch.model doc comment reversed
- [x] ADR reversing ADR-019's "clearing awards the swatch"
- [x] wiki + CHANGELOG

## Summary of Changes

**Prep panel.** `Objectives.ui.tsx` is a new kanto part: a Panel of divided rows, each a mark (tick when met, dashed box when not), a name, a detail, and a requirement read as lead + badge + optional trail. It renders inside `BandOutcomes` where the three prose lead lines used to sit, so the section keeps one title. `outcomesLeadFor` collapsed to the single line "Two things are on the table today, and they are won separately"; the base-poll-score and coverage-standing readings are gone, the bar under them already drawing both. Added a `tick` icon.

**Live rows.** `objectivesFor` reads both rows off the frame: the clear is met when `coverageBandOf(held, ladder)` is a clearing band, the swatch when the window holds 5 correct. `BandOutcomesFrame` traded `unitsHeld` (only the deleted prose used it) for `correctThisGate`. `CLEARING_BANDS` is now exported from `gateOutcome.viewmodel`.

**Rule change (ADR-080).** `closeWindow` stamps the gate into `RunState.swatchGatesEarned` when `window.correct >= SLICE_WINDOW`, on every exit including a hold, and dedupes a retried gate. `run.repository` awards the freshly stamped gates instead of the cleared one. `swatchesEarnedAt(gatesCleared)` became `swatchesEarnedFrom(gates)`; `RunView.swatchGates` threads it to `RunSummary`.

**Footer.** `PREP_LOCK_NOTE` deleted.

## Not done

The mockup ticks "Clear the gate" at gate 0 with 0% held. The engine bands that as SHAKY (gate 0 collapses OK onto HEALTHY), so the row reads unmet there. Flagged to Marciano rather than faked.

## Verified

`npm run build` green, `npm run lint` green (one pre-existing warning in Screen.stories.tsx), depcruise clean. 4286 tests: 4 failing, all in files byte-identical to HEAD (`gate.model.spec` floor rule x2, `PollScreen.spec` missing `<nav>` x2) and caused by other uncommitted WIP in `rules.model.ts` / `pollScreen.viewmodel.ts`.
