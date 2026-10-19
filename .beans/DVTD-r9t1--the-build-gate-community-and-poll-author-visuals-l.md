---
# DVTD-r9t1
title: The build, gate, community and poll-author visuals live with their concepts
status: completed
type: task
priority: normal
created_at: 2026-10-16T08:07:20Z
updated_at: 2026-10-16T08:40:11Z
parent: DVTD-5303
blocked_by:
    - DVTD-mfj0
---

**What:** The build slots and weight, the gate swatches and outcomes, the community map and the poll byline move out of the kit.

**Why:** The run screens are built from these, so they move before the screens do.

## Done when

- [x] None of these visuals is left in the kit
- [x] Workarounds that existed only because the kit could not call game rules are gone
- [x] Lint, typecheck and tests are green

## Notes

Targets: run/build, run/gate, run/community, polls/poll. Known workaround: Swatch inlines the finish branch instead of calling themeColorOf; src/test/swatchTrack.factory.ts re-exports roster constants for kit specs.

## Summary of Changes

Build, gate, community and Author moved. Viewmodels that borrowed runtime values from .ui files now own them: coverage band colour and word (coverageBand.viewmodel), gateTitleOf (gateTitle.viewmodel), upkeep label (upkeep.viewmodel), the Dex row labels (dexScreen.viewmodel), the held-audit line (shopScreen.viewmodel), the player card labels (playerCard.viewmodel). weights.ts folded into Weight.ui. Swatch's fill branch draws different markup, so it was not a workaround and stays.
