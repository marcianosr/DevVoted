---
# DVTD-y7hk
title: The hub shows the run so far
status: completed
type: feature
priority: normal
created_at: 2026-09-29T12:32:49Z
updated_at: 2026-09-29T12:45:39Z
---

**What:** The daily run hub leads with a strip, a press that is either ready or waiting, the run so far gate by gate, and the build.

**Why:** The hub is where a player returns each day, and it should say what today asks of them and what the run has earned so far.

## Done when
- [x] Each gate close is remembered with its grade and the KB it paid
- [x] The hub shows the run number, the gate and the balance above the press
- [x] The press reads Continue to the next gate when polls are ready, and when the gate opens when they are not
- [x] The run so far and the build each sit in their own panel
- [x] An incident waiting at the next gate shows as an audit row
- [x] The logo lands on the hub

## Notes
Plan: /Users/marciano/.claude-work/plans/this-should-be-the-streamed-perlis.md. Amends ADR-128 via a new ADR-147. The history lives in the run state JSON as an optional closes list, so no migration is needed. The shop open rule is unchanged, only its copy.

## Summary of Changes

RunState gained an optional closes list (gate, band, cleared, KB) appended at every close. RunView exposes closes and a clean-clear KB quote. A getRunNumber server function counts session runs. The today viewmodel builds the strip, both press states, the shop aside, run so far, build and incoming incidents; TodayScreen.ui draws them with Panel, SwatchTrack, Balance, Audit, Weight and Version. The logo points at /run when signed in. ADR-147, wiki, changelog and ADR index updated.
