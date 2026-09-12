---
# DVTD-b78a
title: RunSummary shows the actual death cause, not a generic message
status: todo
type: feature
priority: normal
created_at: 2026-08-12T13:36:36Z
updated_at: 2026-09-12T12:57:01Z
parent: DVTD-kulw
---

RunSummary.ui.tsx hardcodes "Your pipeline was stripped bare and broke." for every
death, regardless of cause. There are (at least) two distinct death paths now and
the run log already distinguishes them:

- ADR-021: a failed gate's peel quota met/exceeded installed configs (stripped bare
  mid-window).
- ADR-031: shop exit blocked (under minConfigsForGate), repair impossible
  (canRepairWidthDemand false), player clicked the explicit "End run" button.
  finishReward (run.model.ts:801) already writes a specific log line for this case:
  `Gate ${gatesCleared} demands ${demanded} configs — the build holds ${installed}
  and the shop can't get it there. Run over.`

RunSummary never reads state.log or otherwise surfaces which of these happened.
The gate ladder shows *where* the run stalled, not *why*.

Not the same bean as the stale docs/old-beans/DVTD-y1ec ("Click death mark to see
why a player died") — that one is about viewing *other players'* death reasons on
a community minimap, references pre-restructure paths (src/domains/runs,
src/routes/_authed/game-over.tsx) that no longer exist, and is out of scope here.

## Todo
- [ ] Decide the shape: reuse state.log's existing strings, or add a typed death-cause
      field (e.g. a discriminated union) that RunSummary maps to copy
- [ ] Wire the cause through RunView -> RunSummary props
- [ ] Replace the hardcoded death subtitle with cause-specific copy
- [ ] Cover both death paths (stripped-bare fail, stuck-width end-run) with a spec

## Model change 2026-09-12 (DVTD-nd6r)

Both death paths above are dead, which makes this bean smaller and clearer
rather than moot.

- ADR-021's strip-bare death: gone. ADR-071 took the peel off a missed gate, and
  ADR-074 made an unpayable upkeep bill peel instead, which is never fatal (a
  build peeled to nothing bills nothing).
- ADR-031's blocked shop exit: retired long before this, ADR-035 owns it.

There is exactly one death now: closing a gate with coverage in DANGER, below
`floorAt(gate)`. So the summary does not need to distinguish causes, it needs to
state the one cause properly: the band the gate closed in, the line that was
missed, and by how much. All three are already on `readCoverage`.

The generic string is still wrong, just wrong about a single case instead of two.
