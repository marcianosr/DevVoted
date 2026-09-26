---
# DVTD-y06t
title: The balance queues its changes instead of overwriting them
status: completed
type: task
priority: normal
tags:
    - ui
    - juice
created_at: 2026-09-26T18:21:29Z
updated_at: 2026-09-26T18:31:23Z
parent: DVTD-np66
---

**What:** A burst of storage changes plays as a sequence, each with its own figure, tint and count.

**Why:** A second change inside the hold overwrites the first before it can be read, so a gain you were paid goes unnamed.

## Done when
- [x] Two changes landing close together are each named, in the order they happened
- [x] The figure lands on each reading in turn rather than jumping to the last
- [x] A gain then a spend reads green then red, never one tint for both
- [x] The after-install preview stays quiet while changes are still playing
- [x] The balance ends on the true reading once the last change has played

## Notes

Extends DVTD-oafa, which gave the balance one change at a time. The queue lives in the readout, not in the run: overlap is a spatial problem, and the coverage bar's pin and the balance pill do not share space, so they can play at once. That reverses the note on the parent.

Accepted cost: the figure lags a draining queue by the hold, once per queued change. The alternative is a figure that is always true but contradicts the pill naming it, and a mixed burst that tints green while the number falls.

## Summary of Changes

The readout in `Header.ui.tsx` keeps a queue of moves instead of one. Each move carries the reading it lands on, what moved, and whether the digits may count (they may not across a unit roll). A move measures from the last reading accepted, not the one still showing, so a burst always sums to the true balance. The pill is keyed per move, because a keyframe only replays on mount and two identical changes in a row would otherwise reuse the node silently.

`HeaderFunds` lost its pre-formatted `amount` and `unit`. The readout renders intermediate readings the viewmodel never produced, so it formats them itself; leaving the strings on the prop would have given one number two formatters. `fundsOf` is now `{ kb, label }`.

The existing fixtures turned out to be fictional: `FUNDS` said `amount: "1843", unit: "KB"` where `kbLabel(1843)` is `1.8 MB`. Every fixture moved below 1024 KB so the reading the ui derives is the one the spec asserts.

Seven specs added. A hold retires exactly one change, and React flushes state on `act` exit, so two holds need two `act` blocks.

ADR-124, the wiki HUD bullet, and the existing changelog entry for the readout.
