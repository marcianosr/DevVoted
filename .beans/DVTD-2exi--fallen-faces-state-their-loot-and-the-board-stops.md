---
# DVTD-2exi
title: Fallen faces state their loot, and the board stops replaying its entrance
status: completed
type: task
priority: normal
created_at: 2026-10-08T12:28:37Z
updated_at: 2026-10-08T12:35:48Z
---

**What:** A fallen face you can loot reads "x KB to loot" on hover. Opening a player card no longer replays the board's entrance or hides the card behind later panels. The seed gives every login and climber a Ken Sugimori portrait and adds a Johto cast.

**Why:** The map named a corpse but not what it was worth, opening a card made the page jump and buried the card, and half the seeded faces were initials.

## Done when

- [x] A lootable fallen face reads its figure on hover; a spent or own run reads the name
- [x] Opening a climber card leaves the board still and draws the card above everything
- [x] Lance, Agatha, Lorelei, Bruno, Blue, Red, Bill and Prof. Oak seed with a portrait
- [x] Gold, Silver and the eight Johto gym leaders climb the seeded board
- [x] Every login but Blue logs in to a populated board: three climbing today, Agatha fallen

## Notes

- Remount: CommunityView switched between CommunityScreen and a WithOpenedCard wrapper, so React remounted the screen and `screen-rise` replayed. Now one render path; `usePlayerCard` takes `string | undefined` and uses `skipToken`.
- Stacking: `.screen-rise > *` used fill-mode `both`, which keeps each block a stacking context after landing and trapped the map's fixed overlay. Now `backwards`.
- Portraits: Bulbagarden Archives. Johto from the Gold/Silver Sugimori busts, Red/Blue/Lance/Oak/Bill from the gen-1 watercolors, Lorelei/Bruno/Agatha from FireRed/LeafGreen (no gen-1 watercolor exists). 128x128 on a cream edge with a tinted square, same as the gym leaders.
- `npm run db:seed` stops at poll options until the local DB has `polls_options.explanation` (migration 20261008140000, from the in-flight poll-explanation work).

- Logins had no run today, and the community service shows nothing to a viewer without one. Lance, Lorelei and Bruno now start through the real start-run service, so the run is playable; Agatha gets the same display-only fallen run as the climbers.
- Lance's archived runs were stamped finished_at = now, so he counted as dying today and as a champion since today. They now finish on their own past day.
