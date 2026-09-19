---
# DVTD-afyx
title: Coverage reads as a banded bar on the poll screen
status: completed
type: feature
priority: normal
created_at: 2026-09-12T10:25:33Z
updated_at: 2026-09-12T10:31:34Z
---

Replace the CoverageRing in the kanto poll header with a horizontal banded bar whose track IS the gate's ladder: danger/shaky/ok/healthy zones, blue fill at 100%.

## Summary of Changes

`CoverageBar.ui.tsx` draws the gate's ladder as the track: four zones sized by
floor / OK / HEALTHY, boundaries named underneath, fill wearing the band it
stands in. Blue is a fill state at 100%, not a zone.

- `CoverageBar.{ui,spec,stories}.tsx` — new, 23 specs, 11 stories
- `Header.ui.tsx` — `HeaderReading` widened to `ring | bar | coverage`, so
  ADR-068's "coverage exactly once per screen" stays enforced by the type
- `kantoPoll.factory.ts` — `createKantoCoverageBarProps`, reading the real gate-9
  ladder from `floorAt`/`okAt`/`healthyAt`; the poll screen now takes `bar`
- `app.css` — `.coverage-bar-fill` width transition, `@starting-style`, reduced
  motion. Own `--coverage-bar-duration` because `CoverageRing.spec` counts the
  ring's variable sheet-wide to prove the arc and digits cannot desync
- `coverageRatio.model.ts` — `BAND.perfect.colour` seafoam -> cerulean
- ADR-070 (the bar, amends 068), ADR-071 (band consequences, unbuilt)

Verified: 248 files / 4485 tests pass (+23, nothing else moved), lint clean,
depcruise 0 violations (998 modules), build exit 0.

Follow-up: DVTD-7uil (draft) wires ADR-071.

Note: `PollScreen.ui.tsx` itself needed no change — it forwards `header`
verbatim, so the ring was never in that file. The kanto poll screen has no
route yet, so nothing binds the bar's props to the gate's real thresholds.
