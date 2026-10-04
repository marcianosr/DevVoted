---
# DVTD-wot8
title: The catch is peeled by hand
status: completed
type: feature
priority: normal
created_at: 2026-10-02T15:28:52Z
updated_at: 2026-10-02T15:34:56Z
---

**What:** When Try/Catch catches a fatal close, the player drops it themselves as the first part of the peel instead of it vanishing on its own.

**Why:** The catch deleted itself before the peel screen, so the player never saw it save the run.

## Done when
- [x] A caught gate leaves Try/Catch in the build and the peel owes its full bill
- [x] Try/Catch is the only config the player can drop until it is dropped
- [x] After dropping it the rest of the peel is the same as before
- [x] The wiki, ADR and changelog say the catch is peeled by hand

## Notes
Amends ADR-096 with ADR-177. Parity: the catcher's drop pays no peel refund and does not count toward configsLost.

## Summary of Changes

The reducer keeps the catcher in the build on a caught close and owes max(quota, its weight). Strip refuses without it, and minify, storage and resume are blocked until it is dropped. Dropping it pays no refund and is not a loss. The peel screen locks other chips and storage and badges the catch drop first. ADR-177, wiki row, changelog.
