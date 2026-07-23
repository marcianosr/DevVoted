---
# DVTD-rpl9
title: 'Poll Dex: unlocked configs + per-category polls-answered stats'
status: in-progress
type: feature
priority: normal
created_at: 2026-07-16T20:30:19Z
updated_at: 2026-07-23T13:28:45Z
parent: DVTD-u35m
---

Idea captured, mechanics still TBD.

A collection/stats screen, Pokédex-style: shows which configs the player has unlocked (DVTD-2try) and, per category, how many polls they've answered and which ones — question text only, not the answer options or correctness (avoids leaking answers for polls not yet attempted).

Rough direction: a new route, likely outside src/modules/session-run — closer to domains/polls/profile territory, since ADR-007's scope boundary says outside-the-run features (profile, border shop, etc.) stay as-is for now. This may need a small ADR note carving out an exception, or living under the legacy domains/ area instead of modules/.

Open questions:
- Data source: polls_responses already has poll_id/user_id/run_id — a per-user "polls seen" list can be derived by joining it to polls/polls_categories, no new table strictly required. A dedicated aggregate (something like the CLAUDE.md-documented but currently nonexistent polls_user_performance table) would be an optimization, not a hard requirement.
- "Which ones... only questions visible" — does this mean: list every poll's question text the player has answered at least once, hiding options/correctness? Or does it also list unanswered polls in a category as "???" placeholder rows, classic Dex "not yet encountered" style?
- Layout: one section per category (reusing the existing Kanto categoryTheme + Swatch component, consistent with RunHud's coverage dropdown) with a config sub-grid and a poll list underneath — or two separate tabs (Configs / Polls)?
- Overlaps with DVTD-g8ty (Collect Swatches, also category-progression) and DVTD-2try (config unlocks) — feels like these three (swatches, config unlocks, poll dex) want one shared "Collection" surface rather than three separate screens. Worth a single design pass across all three before building any of them.

## Implementation (this session)

Building the Polldex screen per approved plan (table design, redacted `???` rows, per-user lifetime seen/accuracy). New `src/modules/polls/` module.

- [x] Domain model: `polldex.model.ts` (PolldexEntry + filter/coverage/format/present-categories helpers) + spec
- [x] Infra: `api/queries.ts` (published polls, seen sums, correctness rows) + spec
- [x] Application: `api/handlers.ts` (getPolldexHandler, accuracy maths, redaction) + spec
- [x] Server fn: `api/polldex.ts` (getPolldex, auth) + integration test
- [x] Query key: `pollQueryKeys.polldex(userId)`
- [x] Button: add `isSelected` toggle state + story
- [x] Tier-1 UI: SearchInput, CategoryTag, PolldexFilterBar, PolldexRow, PolldexTable, PolldexScreen, accuracyTone + stories
- [x] Tier-2: Polldex.component.tsx (query + filter/search state)
- [x] Route: `_authed/polldex.tsx` + nav links in `__root.tsx`
- [x] Cleanup: remove profile stub + delete legacy Polldex grid
- [x] Component specs (PolldexRow redaction/colour, Button aria-pressed)
- [x] Verify: Storybook screenshot, npm test, lint, tsc, build; CHANGELOG entry

## Summary of Changes

Built the Polldex poll-catalogue screen (the table design from the mockup) as a new `src/modules/polls/` module.

- **Data pipeline**: `api/queries.ts` (published polls, SUM(times_seen) per user, per-response correctness rows) → `api/handlers.ts` (`getPolldexHandler`: folds correctness through the shared `evaluatePollAnswer`, computes fully-correct% accuracy, redacts unseen polls to `question: null`) → `api/polldex.ts` server fn (auth via `getAuthenticatedUserId`). `polldex.model.ts` holds `PolldexEntry` + pure filter/coverage/dex-number/present-categories helpers.
- **UI (ADR-010 two-tier)**: extended shared `<Button>` with an `isSelected` toggle state (aria-pressed; fixed a text-color conflict so the selected fill's label stays legible). New `src/ui/polls/CategoryTag.ui` (plain-data props). Module presentation: `PolldexScreen/Table/Row/FilterBar.ui`, `accuracyTone.ts`, and Tier-2 `Polldex.component` (query + filter/search state). Route `_authed/polldex.tsx` + nav links.
- Removed the legacy card-grid `Polldex.component` stub and its empty usage in the profile route.
- Verified in Storybook (screenshot matches mockup: colored category pills, accuracy green/yellow/red, redacted `???` rows, category filter buttons glowing in Kanto colors). tsc 0, lint 0 violations, all new specs green (`npm run build` passes).

## Deferred (broader bean scope)
The original bean also envisioned an *unlocked-configs-per-category* collection section (overlaps DVTD-g8ty swatches, DVTD-2try config unlocks). Not built here — this delivers the poll catalogue only. Left in-progress for that remaining slice.

## Update: search box removed
Per follow-up feedback, dropped the search input — Polldex filters by category only now. Removed `SearchInput.ui`/story, the `search` state/props, and the search branch of `filterPolldexEntries` (now category-only).

## Update: sort + seen-count fix
- **Sort by dex number**: entries ordered by `poll_number ?? id` (was ordered by raw `id`, so displayed #s looked shuffled when poll_number is set). Single `dexNumber()` helper feeds both `formatDexNumber` and `sortByDexNumber`; handler returns pre-sorted.
- **Fixed "seen ×0 but revealed"**: `timesSeen = max(views, answeredCount)`. Daily/calendar answers write `polls_responses` but no run-scoped `polls_history` row, so an answered poll could read 0 views. Answering now counts as seeing (never <1 for an answered poll).

## Refactor: reusable sortable table (TanStack Table)
- [x] Add @tanstack/react-table dep
- [x] Generic `src/ui/DataTable.ui.tsx` (headless; sortable th, aria-sort, meta.align/grow, rowClassName, emptyMessage) + story + spec
- [x] `presentation/polldex/polldexColumns.ui.tsx` (ID/Question/Category/Seen/Accuracy; Question unsortable; accuracy nulls-last)
- [x] Wire DataTable into PolldexScreen; delete PolldexTable/Row + their story/spec
- [x] Migrate row assertions to polldexColumns.spec
- [x] Verify: storybook sort, test, lint, tsc, build; CHANGELOG

## Refactor summary (TanStack Table)
Replaced the hand-rolled grid with a reusable, headless `DataTable.ui` (sortable headers, aria-sort, meta.align/grow, rowClassName, emptyMessage; ascending-first via sortDescFirst:false). Polldex supplies `polldexColumns.ui` (ID default asc; Question unsortable; accuracy uses accessor `?? undefined` + sortUndefined:last so unanswered polls stay last both directions). Deleted PolldexTable/Row + their story/spec. Verified live in Storybook (clicking Accuracy reorders, unseen rows stay last) + 873 tests / tsc / lint / build green. Designed generic for the future /polls migration (out of scope here).
