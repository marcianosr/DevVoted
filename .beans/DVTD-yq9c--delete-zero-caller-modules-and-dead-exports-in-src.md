---
# DVTD-yq9c
title: Delete zero-caller modules and dead exports in src/ui and shared/lib
status: todo
type: task
created_at: 2026-08-13T13:46:46Z
updated_at: 2026-08-13T13:46:46Z
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

- [ ] Delete `EmptyMessageLine` and `DevPollNavigatorUI` with their spec and story siblings
- [ ] Collapse `PageLayout.component.tsx` into `__root.tsx`
- [ ] Delete the four dead `shared/lib` exports and the ~150 spec lines that cover them
- [ ] Fix the two `dateUtils.ts` comments
