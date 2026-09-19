---
# DVTD-p82p
title: The paid row repeats the gate name instead of the poll count
status: completed
type: task
priority: normal
created_at: 2026-09-15T09:08:52Z
updated_at: 2026-09-15T09:12:49Z
---

On the poll screen's Coverage panel, each paid row leads with the gate swatch and gate name, which the header already states. It should read the gate's poll progress instead. The slots re-base note above it is dropped from this screen; the shop and the gate debrief already carry that copy.

## Summary of Changes

The poll screen's **what each poll paid** row no longer repeats the gate name the
header above it already states. In `payouts` mode the first column counts the polls
that gate has answered instead: `4 out of 5`. The swatch stays, so the row still
carries the gate's colour, and the `aria-label` still opens on the gate name, so the
row reads to a screen reader as `Pallet — paid 4.0`. Prep's counts mode is untouched:
it still names its gates.

The slots re-base note under the coverage sentence ("Every gate opens 5 more slots.
Seafoam scored out of 45; Volcano takes it to 50.") is gone from this screen. The gate
debrief and the shop's **Next gate** panel already carry that copy at the moment the
denominator actually moves (DVTD-65yi), which is where it lands rather than where it
is being re-read for the fourth time.

### Files

- `PollScores.ui.tsx` — `labelOf`/`answeredOf`; `NAME` renamed `LABEL`, gains
  `tabular-nums`
- `PollScreen.ui.tsx` — `PollCoverage` loses `slotsNote`; `CoverageExplainer` had one
  child left, so it collapsed into the panel body
- `pollScreen.viewmodel.ts` — `slotsNoteFor` deleted, `SLICE_WINDOW` import with it
- `PollView.component.tsx`, `kantoPoll.factory.ts` — the wiring and `kantoSlotsNote`
- Specs: 2 new on `PollScores`, the ruler test dropped from `PollScreen.spec`, the
  `slotsNoteFor` block dropped from the viewmodel spec
- `CHANGELOG.md` (the DVTD-khtk entry is still unreleased, so amended in place),
  `docs/wiki.md` section 7

## Verified

`npm run lint` clean (1 pre-existing warning in `Screen.stories.tsx`), depcruise clean
over 980 modules, `npx tsc --noEmit` clean, prettier clean. 4269 passing; the 2
failures are `gate.model.spec.ts`'s floor rule, red before this work (DVTD-xl63).
