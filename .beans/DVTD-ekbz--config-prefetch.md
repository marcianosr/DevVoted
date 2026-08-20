---
# DVTD-ekbz
title: 'Config: Prefetch'
status: completed
type: task
priority: normal
tags:
    - config
created_at: 2026-08-19T20:36:09Z
updated_at: 2026-08-20T13:33:28Z
parent: DVTD-72d9
---

Between-poll info config (brainstorm 2026-08-19).

On the between-poll screen, shows the NEXT poll's category. Category only, not
the question — honest partial info (withhold, never falsify). First config on
the between-poll surface: turns the beat between polls into a planning moment
(brace for the weak category, know whether ESLint applies next). Family:
defense, uncommon.

## Superseded spec (Marciano, 2026-08-20)

Scope grew from next-1-poll to: categories of every poll left today plus ALL of tomorrow's five (chosen from three horizon options: this gate + next gate, max 10). Tomorrow's shared seed is rolled a day early on first ask — category-only, questions stay sealed. Supersedes Bundle Analyzer (designed, not built).

## Summary of Changes

Shipped at the horizon Marciano picked (this gate + next gate, max 10): the categories of every dealt-but-unanswered poll plus all five of tomorrow's, category-only.

- New Config axis `revealsUpcomingCategories`; roster entry Prefetch (defense, rare 128KB — ten categories of drafting foresight vs Telemetry's one-poll peek at uncommon; supersedes Bundle Analyzer's role in the designed-not-built list, though that wiki row was left for a later sweep of the pair paragraph with Rebase).
- Two halves: the client half is `RunView.upcomingCategories` (dealt polls from `state.polls`, null without the config — the one sanctioned crack in "never expose upcoming polls", pinned by a viewmodel spec). The server half is tomorrow's five via `prefetch.service.ts` → `fetchSeedCategoriesForDate` — calling `getOrCreateDailyRunSeed(tomorrow)` IS the early roll (the persisted-once invariant holds, everyone still shares one sequence). Gated server-side on holding the config (Telemetry-split precedent: the information is the product).
- Editorial consequence, documented in the repository comment: once a holder asks, tomorrow's poll set freezes — polls published later today wait a day.
- New `getTomorrowDateString` in dateUtils; query key `sessionRunQueryKeys.upcomingCategories(date)` keyed by today so the cache dies at rollover.
- One Tier-1 (`UpcomingCategories.ui.tsx`: "Prefetch" eyebrow + today/tomorrow pill groups, duplicates preserved, renders nothing when empty) mounted on three surfaces: AnsweringScreen (under the poll bar), ShopScreen (between offers and controls), PrepScreen (after the pipeline box). "today" includes the on-screen poll: it states what is left, not what is next.
- Specs: prefetch.service (serves/refuses without config and never rolls the seed/refuses without run), UpcomingCategories UI, viewmodel gating. Stories: GateStart/MidGate/AtTheShop (the shrinking row). Wiki roster 28, changelog entry.
- Verified: 1646 tests pass (125 files), oxlint + dependency-cruiser + tsc clean.

## Playtest follow-up (same day)

Marciano could not find the reveal: he playtests on /proto-run, which renders the .ui screens directly and never got the upcoming prop. Fixes: (1) viewmodel now caps the reveal at window edges (proto's state holds the whole pool — an uncapped slice read the entire run) and gained nextGateCategories (empty in the live game, filled locally in proto); (2) useUpcomingCategories now takes the view and returns merged {thisGate, nextGate} — after a clear the window has already advanced, so tomorrow's five fill 'this gate' up to the window size before spilling into 'next gate'; (3) proto-run wires upcoming on all three screens (and picked up the missed rebuildAvailable); (4) UI labels renamed today/tomorrow -> this gate/next gate, which stays true across day-spanning windows and in proto.
