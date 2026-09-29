---
# DVTD-aig9
title: The polls list is a searchable, filterable table
status: completed
type: feature
priority: normal
created_at: 2026-09-28T12:25:49Z
updated_at: 2026-09-28T12:42:57Z
---

**What:** The polls page lists polls in a kit-styled table with a search box, status, answer-type, code and category filters, a creators select for admins, and ten rows at a time with load more.

**Why:** It is the one screen every player reaches from the nav that still wears the legacy look, and two filters players want (answer type, code example) do not exist.

## Done when

- [x] The page is built from the Kanto kit: heading with a count, a Suggest a poll press, a panel table with # / category / question / by / status
- [x] Search narrows on question text; status, answer type, category and with-code filters each show honest counts
- [x] Admins can filter by creator and see who wrote each poll; players see only their own polls without those columns
- [x] Ten rows show at a time, load more reveals the next ten, every row opens the poll
- [x] Story, specs, lint and typecheck are green; changelog has a player-facing entry

## Notes

Mock supplied by Marciano on 2026-09-28 (2x retina). New filters (answer type, with code) sit on the toolbar beside status. Rows link via href, the BY column resolves client-side from the creators query, three new kit primitives (Segmented, SearchField, Select) and a Button href arm.

## Summary of Changes

The polls page is rebuilt on the Kanto kit: a cerulean wide Screen, a headline with the count and a Suggest a poll link, one Panel holding the toolbar (search, status, answer type, with code, creators for admins), the category chips, a column strip, one linked row per poll and a footer with load more.

- New viewmodel pollList.viewmodel.ts owns the filter, faceted counts (each axis counted under the other filters), question segments, rows and the ten-row window; 26 specs
- Three new kit primitives with stories and specs: Segmented (radiogroup, joined or loose), SearchField, Select; Icon gains search and plus
- Button gains an href arm rendering an anchor with the same class recipe, so a link can look like a press; PollList.ui.tsx imports nothing from the router
- The BY column resolves creators client-side from the query the admin already runs; a player sees no BY column and no creators select
- One owner each for the poll paths (pollPath.ts), the nav copy (copy.ts) and the backtick splitter (codeSpans.ts, also used by PollMarkdown.ui.tsx); PollCreator moved to the domain model
- ADR-133 D2 no longer lists the poll list among unthemed pages; changelog entry under Changed

Verified: 4595 tests pass; the 14 failures are all in CommunityView.spec.tsx, which another session left mid-edit (typecheck reports the same file). Lint, dependency-cruiser and the wiki check are clean.

Known caveat: an ambient-tone link gets no hover tint because that tone uses enabled: variants, which anchors never match. The one link shipped is action tone, which has no such variant. Filter-in-URL search params are a follow-up.
