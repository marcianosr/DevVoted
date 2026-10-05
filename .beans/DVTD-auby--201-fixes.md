---
# DVTD-auby
title: 2.0.1 fixes
status: completed
type: bug
priority: normal
created_at: 2026-10-05T08:17:05Z
updated_at: 2026-10-05T09:11:29Z
---

**What:** A batch of 2.0.1 fixes: admin panel cleanup and ops data, a richer click card, one player header, folded community polls, copy, and the free weight figure.

**Why:** Playtesting 2.0 turned up noise, missing info and a wrong figure that players see.

## Done when
- [x] The admin panel hides admin visits, caps the list at 100, drops the daily poll sections and shows ops data
- [x] Clicking a player shows the same info as hovering, swatches included
- [x] Profile and player cards share one header that holds on mobile, with swatches on your own profile
- [x] Community polls start folded, answers read in full, and a review press sits below them
- [x] The seat footer is gone and the Hall of Fame empty line reads the new copy
- [x] The hub build panel states the right free weight

- [x] The polls list filters by explanation and by how often a poll was dealt, in the redesigned filter row
- [x] A poll's detail page shows the poll as a player will meet it

## Summary of Changes

- Admin panel: admin visits hidden (NULL-safe email filter), visits capped at 100, daily-poll sections removed; visitor breakdown, route traffic, signups and retention, poll pool health and dormant players added; recent responses readable.
- One player header shared by the profile hero, click card and hover card; the click card fetches the player card on open; swatches on your own profile.
- Community: polls fold, answers wrap smaller, Review answers press; seat footer removed; Hall of Fame empty copy replaced.
- Review answers draws each poll as its question card with right and wrong marks, who picked what, code examples and the explanation.
- Polls list filters redesigned with explanation and dealt filters plus clearable chips; the poll page draws the run's question card.
- Hub free weight reads the current build space; prep names the next gate generically; poll authors without a GitHub handle are credited by name.
