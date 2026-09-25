---
# DVTD-kh4g
title: 'Mobile playtest pass: 19 read, layout and copy fixes'
status: completed
type: task
priority: high
created_at: 2026-09-24T10:16:45Z
updated_at: 2026-09-24T10:40:47Z
---

A live mobile playtest of the kanto run screens turned up 19 complaints: wrong badge colours, repeated copy, header rows too wide for a phone, popups overflowing the viewport, and screens that keep their scroll position when the run moves on.

Plan: /Users/marciano/.claude-work/plans/it-says-0-and-quirky-nova.md

## A. Header
- [x] A1 Storage balance stacks, label above amount, smaller font
- [x] A2 Gate title becomes "#0 - Pallet Gate"
- [x] A3 New run drops its gate subtitle
- [x] A4 Prep drops "5 of 5 polls answered"

## B. Poll screen
- [x] B1 Scored figures wear the coverage band's colour, not viridian
- [x] B2 Poll header: title alone, badge + facts on a meta row
- [x] B3 Coverage panel header on two lines
- [x] B4 "Next poll" rides the build bar

## C. Gate debrief
- [x] C1 Drop the unanswered next-gate score row
- [x] C2 "Total units" labels the row total
- [x] C3 Category rows get their %
- [x] C4 "Gate cleared" keeps the streak note, drops the tally
- [x] C5 Surplus row: note instead of detail, reworded

## D. Shop and next gate
- [x] D1 Remove "1 of the 5 right clears it."
- [x] D2 NextGate panel stops fighting for one line

## E. Kit-wide
- [x] E1 Scroll to top when the run moves on
- [x] E2 Popups become a bottom sheet on phones

## Summary of Changes

All 19 items done. 188 test files / 3617 tests pass, oxlint + dependency-cruiser + docs:check clean, `tsc --noEmit` reports nothing.

**A. Header** — `HeaderFunds` stacks into a column with the label above the badge at `text-xs`; `STORAGE_BALANCE` moved to `~/shared/lib/copy.ts` and the two header call sites read it. `gateTitleOf(swatch)` is exported from `Header.ui.tsx` as the one gate-name formatter (`#0 - Pallet Gate`); `gateLabelFor` and `NextGate` read it. New run drops its subtitle, prep drops its "5 of 5 polls answered" note.

**B. Poll screen** — `LeadFigure` gained an optional `band`, so the scored line's units and percentage wear the run's own coverage band instead of gain green. The poll panel's header keeps its title only; a new `META_REGION` row under it carries the category badge, the poll's shape, and whatever the build adds (holds, wrong cost). The coverage panel's "what a poll pays" rule drops to its own line. `BuildFooter` gained a `footer?: ScreenFooterProps` slot, so "Next poll" rides the sticky bar instead of a panel of its own.

**C. Gate debrief** — `runPaidFor` filters rows with nothing answered, so a clear screen no longer lists the gate just opened. `PollScores` labels a payout row's total "Total units". `signedPercent` now emits its own `%` (two call sites had been appending one, two had not). The clear row keeps the streak note and drops the tally. Gain rows moved their qualifier from `detail` to `notes`, matching every other row's size, and surplus reads "coverage past the full bar, paid out instead of lost".

**D. Shop** — `nextGateFor` lost its owed note, along with `owedNoteFor`, `CLEARS_TRAIL`, `OUT_OF_REACH_NOTE` and the `unitsPerCorrect` parameter that fed them. `NextGate`'s `note` prop went with them (the shop was its only producer) and its reading row takes its own line below `sm`.

**E. Kit-wide** — new `useScrollToTop` hook mounted in `RunLayout`, keyed on pathname + live poll id + answers landed, because the run hops routes with `replace` and poll→poll never navigates at all. `Tooltip` and `ConfigChip` popups are fixed bottom sheets below `sm` and anchored popups from `sm`.
