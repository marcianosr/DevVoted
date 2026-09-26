---
# DVTD-ptum
title: The new run screen quotes a refund it never pays
status: completed
type: bug
priority: high
created_at: 2026-09-26T16:58:43Z
updated_at: 2026-09-26T17:06:23Z
---

**What:** Stop the new run screen promising storage back for an uninstall it does not pay.

**Why:** Installing there is free and uninstalling refunds nothing, so the figure is a promise the screen cannot keep.

## Done when

- [x] The uninstall press on the new run build carries no gain
- [x] A shelf offer on that screen no longer quotes what it uninstalls for
- [x] The shop is untouched, where the refund is real
- [x] A test pins the bare press, not just the press existing

## Notes

Reported from a screenshot: the press reads `+32kb`, but pressing it changes storage
not at all.

The shop remains the only place an uninstall pays. Its own quote is computed with
the undiscounted refund while it pays the discount-aware one; that gap is a
separate follow-up, tracked on DVTD-ea7h.

## Summary of Changes

ADR-123 decision 1. The chip is dressed with no-refund facts on the one screen that pays nothing.

`settledFactsFor` already existed as the no-refund facts builder, used by the gate outcome and run over screens. It gained a chip-level pair, `settledChipFor`, sharing one private builder with `chipFor` so the two shapes cannot drift. The new run build and its shelf take those instead of `chipFor` / `infoFor`. With no sell price the press falls to its capless branch: a bare Uninstall, hint `Uninstall .js`, and no footer line.

The kanto fixture rebuilt a new run build chip beside the producer with its own `chipFor`, so it moved too. It also adds a figure badge the live producer never makes; left alone, flagged below.

Verification: 4062 tests across 208 files, typecheck, oxlint, dependency-cruiser and docs:check green.

## Follow-ups worth a bean

- `kantoNewRunBuild` still rebuilds a build chip beside `newRunBuildFor` rather than calling it, and embellishes it with a badge the app does not draw. Same drift `kantoHandCards` had before DVTD-458u.
- The shop quotes the undiscounted refund while paying the discount-aware one. Tracked on DVTD-ea7h.
