---
# DVTD-9rw9
title: Hovering a face shows that player's card
status: completed
type: feature
priority: normal
created_at: 2026-09-28T09:07:05Z
updated_at: 2026-09-29T09:02:59Z
---

**What:** Hovering or focusing a player's face shows their card as a read-only tooltip, and clicking the face or the name goes to their in-game profile.

**Why:** The board is the only place a face means anything; everywhere else an avatar is inert or sends you off to GitHub, so the one read the game is about stops at the climb map.

## Done when

- [x] Hovering or focusing a face shows that player's card, read-only, without a request per hover
- [x] Clicking a face or the name beside it goes to the in-game profile, never to GitHub
- [x] The GitHub handle appears only on the profile page
- [x] The card draws the approved mock without its footer: worn title, a coverage panel, a build heading, config chips and three tiles
- [x] One owner folds a standing into card props, and the profile page reads it too
- [x] The climb map still opens the card on a press, so looting and filing keep their home

## Notes

- Plan: `~/.claude-work/plans/can-we-create-this-flickering-turing.md`, approved 2026-09-29. It supersedes `~/.claude-work/plans/when-i-click-on-tingly-stream.md`: the click-opens-a-dialog half is dropped, a click goes to the profile.
- The climb map keeps click-to-card (Marciano, 2026-09-29) because the card is the only place Loot and File live, and touch has no hover.
- Reverses DVTD-4nkm's call that a tap never opens a popup, for hover only; the clipping reason held, the answer is that the tooltip is rendered at the root, not inside the scroller.
- The mock's footer (privacy line and Profile press) and its close mark are left out of the tooltip.
- Out of scope: the audit sender's face (its viewmodel carries no user id), your own face in the nav, and poll-list rows (the whole row is already a link).

## Summary of Changes

- `Climber` takes a `userId`: the face becomes a link to `/profile/$userId` and reports hover and focus through `usePlayerHover` in `~/shared/hooks`. `PlayerFaceLink` is exported so `Author` wraps its own face in the same link.
- `PlayerHover.component` is mounted once in `__root`. It waits `HOVER_INTENT_MS` (300 ms), fetches `getPlayerCard` (a narrow read: profile row, open run, best category) under `userQueryKeys.card`, and renders `PlayerCardTooltip`, which is fixed and placed by `tooltipPlacementFor`.
- `ClimberCard` and `Standing` are redrawn to the mock. `standingFor` in `playerCard.viewmodel` is the one fold, used by the map card, the hover card and the profile page. It uses the new `baseGateLadderAt`.
- The GitHub links are gone from `CategoryLeader`, `Author` and the card; `githubLogin` and the climb standing's `handle` are deleted. `ProfileCard` still links GitHub on the player's own page.
- ADR-141, the ADR-125 D4 and D6 fixes, the wiki (sections 6 and 7.1 and the link rule) and the changelog are updated.
- Deviation from the plan: the root `QueryClient` is untouched. It still mints per render, which the memory note says needs its own bean, so the card cache lasts one page. Cache seeding from the map was dropped, since the map opens its card from data it already has.
