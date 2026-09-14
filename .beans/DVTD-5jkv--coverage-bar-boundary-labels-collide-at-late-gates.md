---
# DVTD-5jkv
title: Coverage bar boundary labels collide at late gates
status: todo
type: bug
created_at: 2026-09-14T13:02:04Z
updated_at: 2026-09-14T13:02:04Z
---

On the poll screen at gate 9 the marks under the coverage bar render as
`survive OKHEALTHY 75%`: the "OK" and "HEALTHY 75%" labels overlap and are
unreadable.

`boundaryMarksOf` (`CoverageBar.ui.tsx`) places three absolutely-positioned,
centre-translated labels at `floor`, `ok` and `healthy`, with no minimum gap
between them. The gap shrinks as the run climbs, because the bands are a fixed
number of ANSWERS (`OK_DROP_UNITS = 2`, `SHAKY_DROP_UNITS = 4`) over a growing
`scoringSlotsAt(gate)`:

- gate 1: 2 units over 10 slots = 20 points apart, fine
- gate 9: 2 units over 50 slots = 4 points apart, collides
- gate 12: 2 units over 65 slots = 3 points apart, worse

Pre-existing, not caused by the PanelV2 port; the bare screen ground just makes
it easier to see.

`WeightTrack.ui.tsx` already solves the identical problem with
`MIN_LABEL_GAP = 0.08` in `labelledRungsOf`, dropping any rung too close to the
last one kept. Same treatment here would work, but it needs a call on which
label loses: "OK" is the least informative (HEALTHY carries the percentage, and
the zone colours still mark the bands), so dropping it is the obvious candidate.

## Todo

- [ ] Decide which boundary label yields when the gap is too small
- [ ] Filter boundary marks by a minimum gap, reusing WeightTrack's approach
- [ ] A spec covers a late-gate ladder keeping its labels apart
