---
# DVTD-ndak
title: Dex shows the slot ladder, and what you have unlocked
status: scrapped
type: feature
priority: critical
created_at: 2026-08-25T12:48:33Z
updated_at: 2026-09-04T18:31:27Z
parent: DVTD-u35m
---

ADR-041 split slot unlocks over two axes: gates 1/3/6 open slots 4/5/7, lifetime
coverage 60/140/240 opens slots 6/8/9, and slots 10/11 open on gate 10/11 **or**
coverage 300/380. Nothing in the game lists that ladder in one place. In a run you
only ever see the next rung ("Unlocks at 60% coverage"), and three of the eight
grants hang off no gate at all, so the Gates tab cannot imply them.

The Dex is where the game already catalogues things you unlock (swatches, audits,
gates), so the ladder belongs there.

## Two parts

**1. The Gates tab is now wrong.** `GatesPanel.stories.tsx` still lists a slot in the
`unlocks` column of almost every gate (`slot 4` at gate 1 through `slot 14` at gate
11). Only gates 1, 3, 6, 10 and 11 grant a slot now, and 10/11 should read as
conditional ("slot 10, or 300% coverage"). Same fix belongs in the wiki's gate table
if it drifts again.

**2. A Slots view.** All eight grants in ladder order, each showing its condition and
whether it is earned. Reuses the GatesPanel shape: left border wash for earned, an
outline for the one you are closest to, muted for locked.

## Open question: what does "unlocked" mean on an account page?

Slots are run state (`pipeline.slots`), and the Dex is account-level. Three readings:

- **Account best** — the widest pipeline any run of yours has ever reached. Matches
  how swatches work, needs a new persisted figure.
- **This run** — mirrors the live run when one is in progress, otherwise a plain
  catalogue. No new storage, but the Dex stops being account-level.
- **Catalogue only** — no personal state at all, just the rules. Cheapest, and least
  interesting.

My pick: account best, because it is the only reading that makes the tab a
collection. It needs one number stored per player (widest pipeline reached), or two
if the coverage rungs should tick independently.

## Notes

- The Gates and Audits panels are Storybook-only today; the live Dex route
  (`Dex.component.tsx`) still has Polls / Configs / Swatches. A Slots panel starts as
  a mock next to them and gets wired when the Dex is reskinned.
- Source of truth is `SLOT_UNLOCKS` in `pipeline.model.ts` — the panel must read it,
  never restate the numbers.
- Decide whether this is its own tab or a section under Gates. A tab counting "5/8"
  reads like the rest of the Dex; a section keeps the two axes side by side.

- [ ] Drop the stale gate->slot rows from the Gates panel's unlocks column
- [ ] Answer the "unlocked means what" question
- [ ] Slots panel (mock + story) reading SLOT_UNLOCKS
- [ ] Wire it when the Dex route is reskinned

## Stale (noted 2026-08-31)

This bean is written against ADR-041's two-axis slot ladder, which was superseded
twice: ADR-044 deleted the coverage axis, and ADR-046 made every slot above the
free four **bought** — `SLOT_UNLOCKS` no longer exists (`rules.model.ts` now has
`SLOT_PRICES_KB` / `BASE_SLOTS` / `MAX_SLOTS`). There is no slot unlock ladder for
a Dex panel to show any more. Either scrap this, or rescope it to the slot *price*
ladder if that ever earns a Dex surface.
