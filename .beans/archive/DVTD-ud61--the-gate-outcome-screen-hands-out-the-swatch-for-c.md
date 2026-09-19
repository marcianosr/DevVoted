---
# DVTD-ud61
title: The gate outcome screen hands out the swatch for clearing, not for 5 of 5
status: completed
type: bug
priority: high
created_at: 2026-09-16T12:08:15Z
updated_at: 2026-09-16T12:18:16Z
---

Playtest feedback (2026-09-16). Gate 0 closed on 1 of 5 right and the screen read "Pallet earned" with the hero swatch filled. ADR-080 is explicit: the clear reads cumulative coverage and moves the run on, the swatch reads this window alone and needs all five right.

The domain is already correct (`answer.model.ts` stamps `swatchGatesEarned` on `window.correct >= SLICE_WINDOW`, `RunView.swatchGates` exposes it). Presentation reads the band instead:
- `gateOutcome.viewmodel.ts` `OUTCOME_SUFFIX` maps the healthy band to the word "earned"
- `GateOutcomeScreen.ui.tsx` `SWATCH_STATE` maps the band to the hero swatch's discovered/current state
- `swatchTrackTo(gate)` fills one square per gate reached, so the track over-reports too

Decisions taken with Marciano:
1. The headline reports the clear only ("Pallet cleared" / "cleared, thin" / "perfect" / "holds" / "Run over"). A chip announces the swatch.
2. The swatch track shows swatches owned, not gates reached. The gate being played is the dashed square; everything else is filled only if its window came up clean.

- [x] `GateOutcomeFrame` carries the run's earned gates
- [x] Headline drops "earned"; a `swatch earned` chip replaces it
- [x] Hero swatch state follows the earned list, not the band
- [x] `swatchTrackFor(earned, current)` replaces `swatchTrackTo(reached)` on the run screens
- [x] Specs updated

## Summary of Changes

`swatchTrackTo(reached)` is deleted rather than kept beside the new builder: while a function exists that fills a square for walking past a gate, a screen will use it. The run-over viewmodel had already grown a private copy of the honest version, so the shared `swatchTrackFor` replaces both. `trackTo` survives in `src/test/swatchTrack.factory` as a fixture shorthand, implemented on top of `swatchTrackFor`, so the ten stories that only want *a track with some squares filled* did not have to be rewritten.

The gate-outcome fixtures derive `swatchGates` from their own answers (`correct >= SLICE_WINDOW`) rather than stating it, so no story can show a swatch a window did not earn.

Bands still decide the headline, and the chip row is where the swatch lands, which keeps the two prizes ADR-080 separated visibly separate: PERFECT is a full bar, the swatch is five right answers, and a screen can now show one without the other.

Docs: the wiki's reward-report bullet and the stale `[Unreleased]` changelog line both still described the header handing over "the swatch the clear awarded".
