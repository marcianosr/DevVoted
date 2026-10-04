---
# DVTD-32wo
title: The run-over screen is wrong in play
status: todo
type: bug
created_at: 2026-09-25T17:51:54Z
updated_at: 2026-09-25T17:51:54Z
parent: DVTD-u35m
---

**What:** Play a run to its end, both ways, and fix what the end-of-run screen reports wrongly.

**Why:** The screen is built and wired, but it does not hold up in an actual climb.

## Done when
- [ ] What is wrong is written down here, from a real run, with the figures it showed against the figures it should have shown
- [ ] Every panel on the screen is checked against the run that produced it, not against a fixture
- [ ] A dead run and a summited run are both walked end to end
- [ ] Each mismatch found is fixed, or has a bean of its own if it belongs elsewhere
- [ ] The specs pin the mismatches so they cannot come back

## What was seen

_To be filled from the playtest. The symptom that opened this bean has not been recorded yet._

## Notes

The screen itself is not missing. `RunOverScreen.ui.tsx` ships, `/run/over` is routed
and reachable through `runRoutes.viewmodel.ts`, the footer's Start new run and
community presses are wired in `RunOverView.component.tsx`, and a dead run already
names the band it closed in, the line it missed and by how much. So this is a
correctness and feel problem in the numbers or the framing, not an unbuilt screen.

Seven panels to check, each against what the run actually did:

- **the heading** — where you stopped, the swatch, the gate name
- **coverage** — the bar as it closed, and the shortfall under it
- **gate by gate** — one row per gate, the best gate flagged, totalling to the bar
- **by category** — every right answer across the run, best and leak named
- **the build at the end** — configs held, space billed per gate, upkeep across the climb
- **storage** — what banks into the archive against what burns with the run
- **unlocked** — swatches kept, configs registered, and what plainly does not carry

Three known-fragile joins, worth reading first when a figure looks wrong:

- The total row reads `frame.unitsHeld` and never a sum of the gate rows. Retries and
  banked-versus-window units make those drift, so a disagreement between the total
  and the rows means the rows are lying, not the total.
- `lineOf` reads `bar.floor` for a dead run and `bar.healthy` for a summit, both off
  the bar rather than the raw ladder, because an audit scales the gate's demand.
  A line the player never faced is the classic symptom of reading the ladder direct.
- The bar is built by `closedBarFor` from `view.gateStake`, which is the **last**
  gate's stake. A summited run passes `victoryGate` as its gate, so check the two
  agree on a win.

Also worth confirming in play: `archiveAfterKb` is optional and absent wherever no
server answered, so the archive figure can silently go missing rather than read zero.

Related, and probably already satisfied by the shipped screen — close it or fold it
in once the sweep says so: DVTD-b78a (the run-over screen says why the run ended).
