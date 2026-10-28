---
# DVTD-d9ol
title: Guests stay off the board and are counted in the header
status: completed
type: task
priority: high
created_at: 2026-10-20T10:18:35Z
updated_at: 2026-10-28T11:21:41Z
parent: DVTD-nr8f
blocked_by:
    - DVTD-ojkl
    - DVTD-y7oz
---

**What:** Guests play under a generated Kanto name and appear on the board for account holders, but never see the community page, seat a leader board or the Hall of Fame.

**Why:** Other players should see who is playing today, and the board is the first thing an account buys.

## Done when
- [x] A guest is named after a trait, a Kanto or Johto Pokémon and a number
- [x] A guest viewer sees the community page and the review page as a blurred sample under a card listing what an account buys, and the server refuses a guest both reads
- [x] Account holders see guests among faces, on the map, in turnout and records, with a card that has no swatch strip and no profile link
- [x] No guest seats a category board or the Hall of Fame
- [x] The header counts guests apart and omits the figure at zero
- [x] A guest cannot loot; a guest can be looted and audited

## Notes
- Slice 4 of DVTD-nr8f. Filter users.is_guest in climbers, community, hallOfFame repositories and playerCard. guestPlayers beside totalPlayers in the community view.

- Decided 2026-10-28, reversing 2026-10-08: guests are not allowed to see the community, it is blurred for them with "Create an account to see what other players did!". Guests never get a leader position or the Hall of Fame. They are taken into account on the board, so the random names are handy; account holders can see guests' player cards; guests have no swatches at all. Guests cannot loot; guests can be looted. The name does not survive linking GitHub.
- The name is `guestNameOf(userId)` in the auth domain: FNV-1a over the id picks a trait, a Kanto or Johto Pokémon and a number below 10000. Deterministic, so no storage decision; stored in display_name at insert.
- The repository filters (leaders, champions) and the guest column on the climber and answer rows have no spec, since the Drizzle mock cannot assert a where clause.

## Summary of Changes

A guest's row is named by `guestNameOf(userId)` (trait + Kanto/Johto Pokémon + number). The community view carries `guestPlayers`; the header draws a second stat, N guests, when it is above zero, and totalPlayers counts everyone. Answer, climber and public profile rows carry the guest flag; a guest climber or corpse is marked `guest` so the ladder gives its card no profile link, the player card service omits the swatch strip, and the public profile page refuses a guest id. Category leaders and champions filter `users.is_guest`. `lootRefusalOf` refuses a guest first. A guest viewer gets the board blurred and inert behind a Create an account press that goes to /login. ADR-178 Decision 3 rewritten, wiki 6.8 and 7.1, CHANGELOG three Added entries, AsAGuest story.

- 2026-10-28, same day: Marciano asked whether the blur can be removed client side. It could: the server still served the board. Now getRunCommunity, getReviewPolls and getHallOfFame are withMemberUser, the hub skips the community query for a guest, and the locked pages draw the Storybook kanto fixtures behind `AccountLock` (account/auth/presentation), which owns the card copy: the lead line, five benefits (view the community, save your progress, collect cosmetics, review your answers, join the competition) and the press to /login. Save your progress is true only once DVTD-l4kh ships.

- 2026-10-28: the lock card is headed "Sign up to see what other players did!" in the headline variant and its press is the xl size (lg renders text-xs). Guest progress is to be kept on sign-up: the Save your progress line stays and DVTD-l4kh delivers it.
