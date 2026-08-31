---
# DVTD-67rh
title: 'Poll screen: pipeline as a horizontal track'
status: completed
type: feature
priority: normal
created_at: 2026-08-28T15:54:50Z
updated_at: 2026-08-28T16:09:08Z
---

Replace the vertical Pipeline fold in the poll screen's sidebar with a horizontal, full-width track sitting under the gate header. Each installed config gets a box as wide as the spots it takes, showing its name over its live standing on the poll on deck.

Decided with Marciano (mock #55):
- Band only. Coverage, Audits and Stake stay in the sidebar rail; only Pipeline moves out.
- Header counts offline only ("1 offline - Dependency Outage") and goes bare when nothing is broken, per the rule set when "will apply" was deleted from the sidebar.
- Paid actions (cross out, peek) make the cell itself the button, cost on the second line, reason-when-unaffordable in a tooltip.
- Green = online, red = offline, grey = skipped. Free spots stay dashed, unreached room stays hatched and unlabelled (wiki 2.9).

## Todo
- [x] Extract occupancy math shared with SpotTrack into spots.ts
- [x] PipelineTrack.ui.tsx + spec + story
- [x] Wire into PollScreen.ui.tsx and PollView.component.tsx
- [x] Update wiki

## Summary of Changes

- `spots.ts`: A_BYTE + occupancyOf, shared by SpotTrack and PipelineTrack so the two surfaces cannot disagree about capacity.
- `status.ts`: skipCopy lifted out of Pipeline.ui so both pipeline surfaces name a skip the same way.
- `PipelineTrack.ui.tsx`: the horizontal band. Box per config sized by spots, two lines (name over standing), green/grey/red by status, dashed free spots, hatched unreached stub. Paid-action configs render the box as a button; everything that does not fit the two lines is on the hover.
- `PipelineRow` gained a required `spots`.
- `PollScreen` gained a `pipeline` slot, full width between the gate header and the body split. `railFor` no longer renders Pipeline and takes only the view; PollView and RevealView both feed `trackFor`.
- ConfigFacts (level, rate, sell price) left the poll screen with the fold that held it: nothing is sellable mid-poll. The config description survives in the cell hover.

## Left open

`Pipeline.ui.tsx` (the vertical fold) now has no caller. Kept in place pending Marcianos call on deleting it.
