# ADR-166: A player's face and a collection count each have one owner

## Status

Accepted — 2026-10-01 (Marciano, DVTD-82ln, DVTD-e5nl). Builds on
[ADR-125](125-a-player-has-one-page-and-one-card.md) (one page, one card) and
[ADR-129](129-a-visitor-reads-the-record-not-the-collection.md) (a visitor reads
counts only). Resolves the consequence in
[ADR-142](142-the-profile-shows-what-others-see.md) that the owner's identity had
no GitHub handle loaded.

## Context

Who a player is was assembled three times. The public profile service and the
hover card service each turned a `users` row into a name, border, worn titles,
theme and authorship, and each turned the open run into a standing with the same
coverage arithmetic. Your own profile built a third identity in the browser from
four hooks, with no handle and no worn titles, and needed an extra server
function (`getAuthorship`) only to fill the authorship line.

The collection counts had no owner either. The profile counted polls seen as raw
history rows against every published poll, so a poll you answered without a
history row did not count, a history row for an unpublished poll did, and the
number disagreed with the Dex. Titles counted every owned id against the titles
on show, so a retired id made held exceed total. The `"9 of 96"` string was
written twice.

## Decision 1: one face, built in the domain

`profileFaceOf` (`account/profile/domain/profile.model.ts`) turns a profile row,
the published-poll counts and the polls answered into `{ identity, theme }`. The
public profile, the hover card and your own profile all read it. The profile
types (`ProfileIdentity`, `ProfileRecord`, `ProfileTotals`) live in that model,
because the service returns them and an application service must not depend on a
screen's viewmodel.

An open run's standing is `standingOf` (`run/community/domain/standing.model.ts`),
one shape for the profile's "Climbing now" and the card. The profile's unused
`band` field is gone; the card derives the band from the coverage, as it did.

## Decision 2: your own profile reads the public profile

Your face is public data keyed by user id (CLAUDE.md allows a `userId` parameter
for public reads), so `OwnProfile` reads `getPublicProfile` like a visitor does.
What only the owner may touch — the look draft, the archive balance used to buy —
still comes from the session reads (`getArchiveState`, `getTitleState`).
`getAuthorship` is deleted. A visitor's "you" figures read the same cache entry
your own page fills.

## Decision 3: one tally rule per collection

`tally.model.ts` (`collection/dex/domain`) owns `Tally = { held, total }` and the
rule for each collection: `pollTallyOf`, `configTallyOf`, `titleTallyOf`. The
profile and the Dex call the same functions, and `HELD_OF` in
`~/shared/lib/copy.ts` is the one way to state a tally.

**A poll is seen** when it has been dealt or answered at least once
(`timesSeenOf` takes the larger of the two counts, `isSeenPoll` asks for more
than zero), and it **counts** only while it is published in a category the Dex
lists. That is the Dex's definition, chosen over raw history rows because the
wiki already promises it ("tracks every poll you have been dealt") and because
nothing in the session engine writes `poll_history` yet, so answers are the only
reliable trace.

**A title is held** when it is owned and visible on the shelf: an id with no
title behind it is never counted, so held never exceeds total. Borders on the
appearance tab use the same generic `tallyOf` over the roster.

## Consequences

- The profile's poll count can only move closer to the Dex's; for a player whose
  history held unpublished polls it drops.
- Your own card now states your GitHub handle, as a visitor sees it.
- The profile reads polls as id and category only, plus an answered count per
  poll: it no longer loads every question.
