---
# DVTD-yq9c
title: Delete zero-caller modules and dead exports in src/ui and shared/lib
status: completed
type: task
priority: normal
created_at: 2026-08-13T13:46:46Z
updated_at: 2026-08-13T15:56:00Z
parent: DVTD-82c4
---

Straight deletions, no design decision needed. Verified by grep 2026-08-13.

## src/ui — zero production callers

| Module | Files | Callers |
|---|---|---|
| `EmptyMessageLine.component.tsx` (9 lines, one `<p className="text-pewter">`) | + story | 0 |
| `DevPollNavigatorUI.component.tsx` (33 lines) | + spec (59 lines) + story | 0 |

## PageLayout — a Tier-2 file with no Tier-2 job

`src/components/PageLayout.component.tsx` (5 lines) has **zero wiring** — no hook, no query, no mutation. Its whole body is `<PageLayoutUI footer={<Footer />}>{children}</PageLayoutUI>`, for one call site (`routes/__root.tsx:105`). Four files plus a spec and a story deliver `<main className="flex flex-col min-h-screen pb-24">` with a footer slot.

## shared/lib — exported, never called

| Export | Callers |
|---|---|
| `seededRandom.createSeededRandom` | 0 (spec only, :63-100) |
| `seededRandom.selectMultipleWeightedSeededRandom` | 0 (spec only, :213-295) |
| `seededRandom.WeightedItem` (type) | 0 outside the file |
| `storage.parseStorage` | 0 (spec only, :57-77) |

`seededRandom.spec.ts` is 300 lines, the largest file in `src/shared/lib/`, and roughly half of it exercises the two unreachable exports. The live surface is `selectSeededRandom` (12 refs) and `selectWeightedSeededRandom` (2 refs).

## Two doc-comment fixes in dateUtils.ts

The stacked comments at :27-38 sit above `formatCompactDuration`, but the first one ("Game-copy duration: `9s` ... `1m45`") describes `formatDurationMs`, defined ten lines lower with no comment. `getTodayDateString` (32 refs) still carries a commented-out date override at :4.

## Story-only files — already tracked

`GameOverScreen`, `PracticeBank`, `RevealScore`, `StepHeading`, `CoverageByCategory` are all still story-only (re-verified 2026-08-13). They await Marciano's keep-or-delete ruling on **DVTD-ylsm**; not duplicated here.

Two notes for that ruling: `GameOverScreen.ui.tsx` (82 lines) duplicates ground `RunSummary.ui.tsx` already covers, and its `lootCollected` prop maps to no `RunView` field. `CoverageByCategory.ui.tsx` shares a coverage-split derivation with the live `RunHud.ui.tsx:32-36` — if it stays, that derivation belongs on the view as a `coverageSplit` field.

## Todo

- [x] Delete `EmptyMessageLine` and `DevPollNavigatorUI` with their spec and story siblings
- [x] Collapse `PageLayout.component.tsx` into `__root.tsx`
- [x] Deleted three; `WeightedItem` un-exported instead — see below
- [x] Fix the two `dateUtils.ts` comments

## Summary of Changes

**Six files deleted**: `EmptyMessageLine.component` + story, `DevPollNavigatorUI.component` + spec + story, and `PageLayout.component.tsx`. `__root.tsx` now calls `PageLayoutUI` with `footer={<Footer />}` directly — the Tier-2 file had no wiring to justify the hop.

**One correction to this bean.** `WeightedItem` was listed as a dead export, but it is not dead: it is the parameter type of the live `selectWeightedSeededRandom`. It is un-exported rather than deleted, since nothing outside the file names it. `createSeededRandom` and `selectMultipleWeightedSeededRandom` were genuinely unreachable and are gone with their describe blocks — `seededRandom.spec.ts` drops from 300 lines to 158.

`parseStorage` deleted with its describe block.

**dateUtils**: the stacked doc comment now sits on `formatDurationMs`, the function it actually describes, instead of on `formatCompactDuration` above it. `getTodayDateString` lost its commented-out date override and became a one-line arrow.

Test count drops 1493 → 1473 because the deleted specs covered deleted code. tsc 0 errors, oxlint clean, depcruise 0 violations.
