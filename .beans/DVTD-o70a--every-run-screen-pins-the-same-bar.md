---
# DVTD-o70a
title: Every run screen pins the same bar
status: completed
type: feature
priority: normal
created_at: 2026-09-29T13:44:38Z
updated_at: 2026-09-29T13:57:34Z
---

**What:** The debrief, review and run over screens pin the same one-row bar as new run, shop, prep and poll, and the debrief payout ledger reads in one style.

**Why:** The top of the screen changed shape between run screens, and the payout ledger mixed cases, note styles and repeated its own total.

## Done when
- [x] Debrief, review and run over pin the shared bar with the gate readout and inline balance
- [x] The payout ledger uses sentence-case labels and one note style
- [x] The balance row no longer repeats the change the fold already states
- [x] ADR-132, wiki and changelog say every run screen but the hub pins the bar

## Notes
Plan: ~/.claude-work/plans/can-we-keep-the-velvet-moore.md. Hub keeps its strip (ADR-128/147).

## Summary of Changes

- `Header`: `badge` became `badges` (one pill per outcome, coloured), plus `marked` for the PERFECT ring.
- Gate result, review and run over drop their hero headings for the pinned `Header`; viewmodels build `HeaderProps` and take the readout from `runReadoutFor`. Run over's gates-of-12 figure and caption are gone (the readout and the track state them).
- Payout ledger: sentence-case labels, every note as a `notes` line, surplus note shortened, balance row `0 → 94 KB` without the repeated delta, no bills clause when none was sent.
- ADR-132 D1 amended, README row, wiki reward report and hub line, changelog bullet.
