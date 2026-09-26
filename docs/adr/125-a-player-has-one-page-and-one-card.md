# ADR-125: A player has one page and one card

## Status

Accepted — 2026-09-26 (Marciano, DVTD-w70d). Amends
[ADR-109](109-a-title-is-earned-and-worn-one-at-a-time.md) Decisions 1 and 6.

## Context

A player's identity was split across two pages that did not link to each other
and did not agree on how a player looks.

`/dex` was the collection — six tabs, your own account only, reaching into the
profile module for one thing, the archive figure in its header. `/profile/$userId`
was the wallet — archive summary, title shelf, border shop, all of it gated behind
`isOwnProfile`, so visiting somebody else's id rendered `Profile: <uuid>` and an
empty body.

Underneath, identity was assembled three separate times with no shared type, drawn
by two unconnected avatar components — `Avatar.ui.tsx` in the profile module, which
resolved its own border and only drew it on a square, and `Climber.ui.tsx` in the
kit, which took a resolved URL. Every clickable player name in the product linked
off-site to github.com, and no server function could read a player by id at all.

## Decision 1: one page per player, at `/profile/$userId`

`/dex` becomes a `beforeLoad` redirect. The collection was never a second place —
it was your profile with the identity missing.

The route is already parameterised, so another player's page costs nothing extra.
That is the reason it survives rather than `/dex`.

## Decision 2: one card, and it is a kit component

`ProfileCard` lives in `src/ui/kanto-theme/` and takes resolved strings — a name,
a photo URL, a border URL, worn titles. It draws the same on the profile page, on
a poll byline and on the community board, because there is only one of it.

It has to be in the kit rather than in the profile aggregate: it renders on run
screens, and `ui-stays-presentational` forbids `src/ui` importing a runtime value
from a module. That rule is what killed `Avatar.ui.tsx`, which resolved
`findBorderById` itself. The card composes `Climber`, so there is now one avatar
drawing in the codebase instead of two.

`titleOf` and `borderUrlOf` moved out of `run/community/infrastructure/` into the
account module that owns the catalogues, as `primaryTitleName` and `borderUrlOf`.

## Decision 3: a player wears several titles, ordered

ADR-109 D1 said one. It is now up to `WORN_TITLE_CAP`, and `equipped_title_ids` is
an ordered array where index 0 is the primary.

The ordering is what keeps this from spreading. The card draws the whole array;
the poll byline, the climber card and the attack panel keep drawing the primary,
so `PollAuthor.title` and `ClimberCardProps.title` stay singular and nothing
changes in the kit beyond the card itself.

The rule is a pure `wearTitle(worn, titleId, owned)` returning a decision rather
than throwing — unknown, not-owned, already-worn, at-cap — so the domain decides
and the service chooses what the player is told. That is the shape the border
shelf will share when the two equip paths are merged.

## Decision 4: a visitor sees the card and the totals, and nothing else

`getPublicProfile` is a read-only server function taking a validated `userId`,
which the authorization checklist permits for public data. It returns two halves:
the identity the card needs, and four counts — polls seen, configs held, gates
cleared, archive.

No tabs, and nothing behind them. The collection tabs are the account's own record
of what it has been shown, and a visitor reading somebody's unanswered polls would
be reading ahead. This is the boundary the climber card already states in prose:
answers, unanswered polls and prefetch stay private.

## Decision 5: the shelves are tabs, not a separate page

`borders` and `titles` join the six collection tabs, rendered only on your own
page. Both are redrawn on the kit inside `DexPanel`, which is what DVTD-8kiu asked
for. The archive figure rides the collection heading, where it already was, so
`ArchiveSummary` is gone.

There is no separate edit surface. The name and the photo come from the OAuth
account, and everything a player can actually change about how they look is one of
these two tabs — so "edit profile" on the card opens the borders tab rather than
routing anywhere.

## Decision 6: a name goes in-app, a handle goes to GitHub

ADR-109 D6 named three surfaces that show a title. Those surfaces now link to the
page instead of only stating it: the poll byline, the category seat, the climb map
card and the attack panel each turn the **face** into a link to `/profile/$userId`.
The `@handle` beside it still goes to GitHub, because it is a different claim —
one is who they are here, the other is who they are there.

`CategoryLeader` and `PollAuthor` had no `userId` at all; both now carry one, and
both repositories already selected from `users`, so it was one column each.

## Consequences

- `DexScreen` is `ProfileScreen`: it takes a card, optional totals, and optional
  tabs. A visitor's render has no `tablist` element at all rather than an empty one.
- `Dex.component` renders only the active panel and no longer wraps itself in a
  screen. Its `useArchiveState` import is gone, which removes the one existing
  coupling between the collection and the wallet instead of adding another.
- `equipped_title_id` is dropped by a guarded migration that backfills the array
  first. Four repositories read element 0.
- `profilePathFor` in `~/shared/lib` is the one place the profile path is spelled,
  because both routes and modules need it and modules may not import routes.
- `fetchEquippedTitleIds` was deleted. It had no callers and no spec.
