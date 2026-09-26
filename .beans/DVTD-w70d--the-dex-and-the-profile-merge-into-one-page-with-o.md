---
# DVTD-w70d
title: The Dex and the profile merge into one page, with one card
status: completed
type: feature
priority: high
created_at: 2026-09-26T18:05:26Z
updated_at: 2026-09-26T18:39:00Z
parent: DVTD-u35m
---

**What:** Merge the Dex and the profile into one page per player, headed by one card that shows the border, the name and the worn titles.

**Why:** A player's identity lives on two pages that do not link to each other, draw avatars two different ways, and show a stranger nothing but a raw id.

## Done when

- [x] One page per player carries the card, the collection tabs and the shelves you equip from
- [x] A visitor sees the card and headline totals, and nothing private
- [x] A player wears several titles at once, ordered, and the card draws all of them
- [x] Clicking a player anywhere in the game lands on that player's page
- [x] There is one avatar drawing in the codebase, not two
- [x] Borders and titles are equipped from the same page, on the kanto kit, with stories

## Notes

Plan: `~/.claude-work/plans/i-want-to-merge-quirky-emerson.md`. Seven slices.

Decisions taken at planning time:

1. `/profile/$userId` survives; `/dex` becomes a `beforeLoad` redirect to it.
2. A visitor gets the card plus totals (polls seen, configs held, gates cleared, archive). No tab rows.
3. `borders` and `titles` join the six Dex tabs, own-page only. Eight tabs.
4. The `runs` tab stays.
5. Several worn titles, capped at 3 — amends ADR-109 D1.
6. Every identity elsewhere links in-app instead of to github.com.

Containment for decision 5: `equipped_title_ids` is ordered and index 0 is the primary.
The card draws the whole array; the byline, climber card and attack panel keep drawing
the primary, so `PollAuthor.title` and `ClimberCardProps.title` stay singular and nothing
ripples into `src/ui`.

Largely closes DVTD-8kiu's list: the page is linked, the three screens are rebuilt on the
kit with stories, and another player's profile shows their name instead of their id.
Leaves DVTD-8kiu's open decisions on the price axis and on stocking more than borders.

Known trap found while planning: `src/database/seed/cast.ts` seeds swatch ids
`pallet`/`pewter`/`cerulean`/`vermillion`, but `swatch.model.ts` ids are `swatch-${theme}`
and three of those are palette colours, not themes. Lance's gates-cleared total reads 0
until fixed. Title ids are validated on seed; swatch ids are not.

## Summary of Changes

ADR-125 (`docs/adr/125-a-player-has-one-page-and-one-card.md`), wiki §6.4, §6.5,
§6.6 and a new §6.7, CHANGELOG under Unreleased → Changed.

**Several worn titles.** `equipped_title_id` → `equipped_title_ids text[]`, guarded
migration `20260926180000_wear_several_titles.sql` backfills then drops. Domain
`wearTitle` / `removeTitle` / `WORN_TITLE_CAP = 3` return a decision, never throw;
the service maps the refusal to a message. Index 0 is primary, so the byline,
climber card and attack panel keep drawing one title and nothing rippled into
`src/ui`. Four repositories read element 0.

**The card.** `src/ui/kanto-theme/ProfileCard.ui.tsx` + spec + stories, composed on
`Climber` (which gained an `lg` size). `Avatar.ui.tsx` deleted — it was the second
avatar and the one resolving `findBorderById` itself, which `ui-stays-presentational`
forbids. `titleOf` / `borderUrlOf` moved from `run/community/infrastructure/` into
the account module as `primaryTitleName` / `borderUrlOf`.

**The page.** `DexScreen.*` → `ProfileScreen.*`, taking a card, optional totals and
optional tabs. New `profileScreen.viewmodel.ts` assembles eight tabs. `ProfilePage.component`
is the one container; `Dex.component` renders only the active panel and lost its
`useArchiveState` import, removing the existing collection↔wallet coupling.
`ProfilePage.ui.tsx` and `ArchiveSummary.*` deleted.

**The public read.** `fetchPublicProfile` + `publicProfile.service` + `getPublicProfile`
(validated `userId`, public read-only) + `usePublicProfile`, reusing the
already-defined-but-unused `userQueryKeys.profile`. Spec asserts it carries exactly
`identity` and `totals` and no question text.

**The shelves.** `BorderShop.ui` and `TitleShelf.ui` redrawn inside `DexPanel`;
`BorderCard` gained the name the model already carried. Owner-only tabs.

**The triggers.** `CategoryLeader` and `PollAuthor` gained `userId`; all four
surfaces turn the face into a link to `/profile/$userId` via `profilePathFor`
in `~/shared/lib`. The `@handle` still goes to GitHub.

`/dex` is a `beforeLoad` redirect. Nav collapsed "Dex" + "Border Shop (new)" into
one "Profile" entry and the avatar in the dropdown is now a `Climber`, so it draws
your border.

**Verified:** `npm run build` (vite + tsc) clean, `npm run lint` clean
(dependency-cruiser: 754 modules, no violations; wiki in sync), `npm test`
211 files / 4146 tests passing.

**Deleted as dead:** `fetchEquippedTitleIds` (no callers, no spec), `ArchiveSummary`,
`Avatar.ui`, `ProfilePage.ui`.

**Not done, deliberately:** the seed swatch-id mismatch in `src/database/seed/cast.ts`
noted above is untouched, and `npm run db:refresh` was not run.
