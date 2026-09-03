---
# DVTD-7fm9
title: 'Modern-theme: gate ladder comes from gate/domain, not six story copies'
status: completed
type: task
priority: normal
created_at: 2026-08-23T19:07:24Z
updated_at: 2026-08-23T19:45:08Z
---

The 13-gate ladder is copy-pasted as story fixture data across six files instead of coming
from `ALL_SWATCHES` (`src/modules/run/gate/domain/swatch.model.ts:125`), which already
documents itself as "the gate ladder itself: exactly one entry per gate".

Dependency-cruiser's `ui-stays-presentational` rule exempts `.stories.` paths
(`.dependency-cruiser.cjs:122`), so story files may runtime-import from `src/modules/`.
The kit being an island is a rule about its components, not their fixtures.

Shipped drift the copies produced:
- gate 4 is "Free tier"/512 in PollScreen.stories and "Standard plan"/640 in PrepScreen.stories
- RewardScreen.stories.tsx:183 sets theme="saffron", not one of the 13 gate themes; falls back to cerulean
- the kit's SwatchFinish omits `plate`, so gate 11 (Elite) cannot draw its rim

Deepening: `SwatchTrack` stops taking 13 pre-assembled cells and takes the roster plus a
position, so a caller can no longer hand it a ladder with a gap or two current cells.

- [x] Fix the two red PrepScreen tests left from the audit-icon round
- [x] SwatchTrack takes `gates` + `cleared` + `atCleared`; SwatchTrackItem deleted
- [x] Swatch gains the `plate` finish; SwatchFinish/SwatchTheme type-imported from the domain
- [x] Six story files import ALL_SWATCHES; LADDER and ladderAt deleted
- [x] GatesPanel roster maps ALL_SWATCHES with coverageDemandFor and failStripsFor
- [x] GateHeader and RewardScreen forward SwatchTrackProps instead of an item array
- [x] Fix GateHeader.stories.tsx:47 stale `audit` prop (invisible to CI)
- [x] SwatchTrack spec covers won run, pending cell, caption off the roster
- [x] tsc, stories typecheck, tests, lint (lint:arch proves the import rule)


## Summary of Changes

SwatchTrack now takes `gates` + `cleared` + `atCleared` instead of thirteen pre-assembled cells; `SwatchTrackItem` deleted. Six ladder copies removed, stories read `ALL_SWATCHES`, GatesPanel derives coverage/peels from `coverageDemandFor` / `failStripsFor` / `stripQuotaOnFail`.

Specs use small local fixtures, NOT the domain roster: `ui-stays-presentational` exempts `.stories.` but not `.spec.`, and a spec importing the live 13-gate content would break whenever a gate is added. The dependency-cruiser config was not touched.

Also fixed: Swatch gained the `plate` finish (Elite renders its rim); the invalid `theme=saffron` story; NotEarned pending at Elite rather than Lavender; the stale `audit` prop in GateHeader.stories; the missing `excludeStories` (by deleting the export). Then per follow-up decisions: the RewardScreen detail toggle restored as an Action with `aria-expanded` (new optional `expanded` prop on Action), the swatch subtitle switched to the spec wording (reviving `clearedGate`), and the two Ledger footer labels lowercased to match Ledger own default.

Verified: tsc clean, lint + lint:arch clean (704 modules), 2058 tests passing / 0 failing, stories typecheck clean in modern-theme, `ring-pewter` present in the emitted CSS. Storybook needs a restart for the new CSS hash.
