# ADR-141: A face shows the player and leads to them

## Status

Accepted — 2026-09-29 (Marciano, DVTD-9rw9). Reverses DVTD-4nkm's "a tap never
opens a popup", for hover only. Replaces the click-opens-a-dialog plan from
2026-09-28. Replaces [ADR-125](125-a-player-has-one-page-and-one-card.md) D6.
D1 and D5 amended by [ADR-150](150-the-player-card-wears-the-players-look.md): the
card wears the player's look and the standing has one shape.

## Context

Outside the climb map a face was inert or linked to a profile with no preview, and
the name beside it linked to GitHub. So the game's one question, *where is this
player*, got an answer on one screen only.

DVTD-4nkm refused a popup because an anchored popup inside the map's sideways
scroller gets clipped. That reason still holds for anything rendered inside the
scroller.

## Decision

1. **Hover or focus on a face shows that player's card as a read-only tooltip.**
   It is the same card the climb map opens, without loot, file, close or links.
   It waits 300 ms for the pointer to settle before it asks for anything, and a
   player's card is fetched once per page.
2. **The tooltip renders once, at the root, and is positioned `fixed`** from the
   face's rect. It is never a child of the scroller, which answers DVTD-4nkm's
   clipping reason instead of overruling it.
3. **Clicking a face or the name beside it goes to the in-game profile.** Nothing
   next to a face links to GitHub. The handle is stated once, on the profile page.
4. **The climb map keeps press-to-open.** The card there is the only place Loot and
   File live, and a phone has no hover. The face and name inside that card link
   to the profile.
5. **One fold draws a standing** (`standingFor`), used by the map card, the hover
   card and the profile page. A visitor's coverage bar uses the gate's unaudited
   base ladder, because the audit schedule is private run state.
6. **The card states no privacy line.** The boundary still holds: the card simply
   never carries answers, polls left or prefetch.

## Not done

- The audit sender's face carries no user id, so it gets no card yet.
- Your own face in the nav and the rows of the polls list stay as they are,
  because each already sits inside a press.
- The root `QueryClient` is still minted per render, so the card cache lasts one
  page, not the session. Fixing that turns caching on app-wide and needs its own
  bean.
