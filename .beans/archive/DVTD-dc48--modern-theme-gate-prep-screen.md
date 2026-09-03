---
# DVTD-dc48
title: 'Modern theme: gate prep screen'
status: completed
type: feature
priority: normal
created_at: 2026-08-23T15:34:24Z
updated_at: 2026-08-23T15:39:19Z
---

Storybook-only reskin of the post-shop prep hub (ADR-032). Two columns: stake left, build right. No coverage meter, read-only pipeline.

- [x] screens/PrepScreen.ui.tsx
- [x] PrepScreen.stories.tsx (Lavender, Fatal, Locked, Lean, Elite)
- [x] PrepScreen.spec.tsx
- [x] Verify: tsc, stories typecheck, tests, lint, emitted CSS

## Summary of Changes

Storybook only, nothing routed. One new file plus its spec and stories — **no new primitives**: `GateHeader`, `Fold`, `Entry`, `Slot`, `Delta`, `Chip`, `Swatch`, `Dot`, `Action` and `Tooltip` covered every row.

**Layout** — two columns copied verbatim from `ShopScreen`'s body (stake left, build right), so prep and the shop sit the same way on the page.

**Decisions taken** — no coverage meter (nothing to draw at 0%; the bar belongs on the poll screen where it fills); the pipeline is read-only with "Change your build in the shop." pointing at `← Back to shop`; bills are signed negative like a `LedgerEntry`, so a call site never bolts a minus on.

**Derived, not passed** — width (`configs + slots`), the subscription total, and the on-miss subtotal. The total row is suppressed at a single bill, where it would only repeat the row above it.

**Kept from the live receipt** — the multipliers named beside the base they ride on, the two bill triggers held apart ("pass or fail" vs "on clear"), a suppressed audit struck rather than hidden (ADR-028), and the fatal line as the one place the screen raises its voice.

**Verified** — tsc clean, stories typecheck clean, lint clean (728 modules), 277 passing, 22 of them new. The emitted CSS kept the same content hash as the previous build, so the screen introduced zero new utilities and needs no Storybook restart. The 5 reds are the pre-existing `RewardScreen.spec.tsx` copy drift.
