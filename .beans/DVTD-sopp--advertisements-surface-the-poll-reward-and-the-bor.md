---
# DVTD-sopp
title: Advertisements surface the poll reward and the border market
status: completed
type: feature
priority: normal
created_at: 2026-10-05T09:58:21Z
updated_at: 2026-10-05T10:23:00Z
---

**What:** A small in-world advertisement on the hub, new run, profile, community and poll screens that points at suggesting a poll or at one random border you can buy.

**Why:** The +16 KB reward for an approved poll and the border market both live off the run's path, so players never find them.

## Done when
- [x] A player sees either the poll-editors advertisement or one random border they can still buy
- [x] An admin never sees the poll-editors advertisement, and nobody is offered a border they own or can only win
- [x] The border advertisement shows the player's own face wearing it and opens the border market
- [x] Closing an advertisement keeps it closed for the rest of the session
- [x] The poll screen shows a one-line strip that never takes a key press

## Notes
- Selection is random per mount, rolled after hydration so server and client render the same markup.
- Player-crafted listings are deferred to a future marketplace.
- Designs: notched ADVERTISEMENT legend, icon, bold title over a muted line, green CTA, ×.

## Summary of Changes

Advertisement card (poll editors or one border for sale) on the hub, new run, community and profile; a one-line strip on the poll screen. Rolled after hydration, dismissed per screen per session. Profile tabs moved into the URL so the border card can open the market. ADR-189, wiki §6.5, CHANGELOG 2.0.2.
