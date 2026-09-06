---
# DVTD-qtqu
title: 'Prep screen: one coverage readout, labelled rebase figure'
status: completed
type: task
created_at: 2026-09-05T20:17:52Z
updated_at: 2026-09-05T20:17:52Z
---

The prep screen read coverage twice and left the rebase figure unnamed.

- [x] Drop the header Coverage meter on Prep — the gate window's `target` row is the same reading with the same bar. Poll / Reveal / Shop keep theirs; there it is the only coverage readout.
- [x] Label the `git rebase -i` figure as coverage, so `1.2%` reads as coverage banked in that category this run rather than as something the poll pays.

## Summary of Changes

- `PrepView.component.tsx`: dropped `coverage: coverageFor(view)` from the header props and the now-unused `coverageFor` import.
- `PrepScreen.ui.tsx`: the rebase row's figure renders `{slot.coverage} coverage`. The word lives in the .ui with `pick`, not in the adapter — it is chrome, not data.
- `PrepView.spec.tsx`: rebase assertions tightened to `8% coverage` / `74.2% coverage`; new test that Prep reads coverage once, in the window rather than the header.

Considered and rejected: replacing the figure with a forward-looking per-poll earn. It is the number reordering actually moves, but it is a design change, not a clarity fix.
