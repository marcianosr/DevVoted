---
# DVTD-uykj
title: Every pinned screen header states the run and gate
status: completed
type: feature
priority: normal
created_at: 2026-09-29T13:15:24Z
updated_at: 2026-09-29T13:25:33Z
---

**What:** The pinned header on poll, prep, shop and new run shows run number and gate progress next to the balance, like the hub strip.

**Why:** A player mid-run loses track of which run and gate they stand on once they leave the hub.

## Done when
- [x] Poll, prep, shop and new run headers show the run number and gate of total
- [x] The hub strip and the headers draw the same readout from one source
- [x] Tests, lint and build pass

## Notes
One kit primitive for the readout, one builder over the run view feeding hub strip and headers.

## Summary of Changes

New kit primitive RunReadout owns the run/gate badges; the hub strip and the pinned Header both render it. runReadoutFor (run/run/application/runReadout.viewmodel.ts) builds it from gatesCleared and victoryGate. The four route wrappers call useRunNumber and pass runNumber into their Views; proto-run passes none and the run part drops.
