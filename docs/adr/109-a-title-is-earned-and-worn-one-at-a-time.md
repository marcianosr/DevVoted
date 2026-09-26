# ADR-109: A title is earned, permanent, and worn one at a time

## Status

Accepted — 2026-09-24 (Marciano, DVTD-0imu). Frees the word `title` from the
account role, which [ADR-100](100-a-category-has-a-living-record.md) Decision 4
and [ADR-103](103-the-board-seats-twelve-category-leaders.md) Decision 3 had
already dropped from the category seat.

## Context

An account says what it owns and nothing about what it has done. A border is
bought with archive storage; a swatch is earned but never shown outside the
Dex; the only label beside a name is the account role, `Poll editor` or
`Admin`, which is authority rather than achievement.

The old calendar game had an `awards` roster and it is the wrong shape to
revive. Its predicate took every user and returned the winners — `most correct
Git answers`, `always first to answer`. That is a standing, losable the moment
somebody passes you, which is the category seat ADR-103 already built and
deliberately kept separate. Thirteen of its entries were that. Fourteen more
were participation tiers on one axis, a name for how much you had played.

## Decision 1: a title is a predicate over one account's own record

Not a comparison against other accounts. `category-correct:git >= 25`, never
`the most correct Git answers`. Every title is reachable by everybody and taken
from nobody.

The consequence that matters is permanence. Once the predicate holds, a row is
written and the predicate is never asked again — a record that later stops
being true costs nobody their title. Permanence lives in the ledger, not in the
check, which is exactly what the old `requirements` function could not express.

## Decision 2: the ledger is what decides a title is new

`user_titles` is `(user_id, title_id, exclusive, earned_at)`. Writes are
`ON CONFLICT DO NOTHING … RETURNING`, so re-crossing a threshold is a no-op and
the returned rows are precisely the newly earned ids the run-over screen
announces. This is the idempotence `awardConfigUnlocks` already has, for the
same reason.

No read asks "does this account already hold it". The insert is the check.

## Decision 3: a race title is settled by a unique index, not a query

`First Ascent` goes to the first account ever to clear thirteen gates.
Answering "am I first?" with a read is a race: two accounts can both read
"nobody holds it" before either writes.

So `exclusive` is denormalised from the catalogue onto the row, with
`CREATE UNIQUE INDEX … ON user_titles (title_id) WHERE exclusive`. The first
transaction to insert wins; every later one conflicts away, and because
`ON CONFLICT DO NOTHING` is per-row, the rest of that account's batch still
lands.

## Decision 4: titles settle when the run ends

Not when the counter moves. Two reasons, and the second is the real one.

`RETURNING` on the objective upsert holds only the metrics this one action
touched. That is enough for a single threshold but cannot answer `a correct
answer in every category`, because eleven of those twelve counters sat still.
Reading the ledger wide on every correct answer to cover one title is the wrong
trade.

And the run-over screen is the only place a title is announced anyway. Granting
where the announce happens makes one read and one insert per run, instead of
per answer, and nothing is delayed that the player would otherwise have seen.

## Decision 5: the role keeps the handle line, the title gets its own

`Poll editor` and `Admin` stay exactly where they are, after the handle and a
separator. The earned title sits on a second line beneath:

```
Created by @tsurge · Poll editor
Git Maintainer
```

`PollAuthor.title` is renamed to `role` and `ROLE_TITLES` to `ROLE_LABELS`, so
the two never share a word again. Authority and achievement are different
claims and a reader must be able to tell which one they are looking at.

## Decision 6: three surfaces, and the climb chip is not one of them

The profile, the open build ([ADR-101](101-builds-are-open.md)) and the poll
byline. A compact climb chip stays avatar-only: it is already carrying a
border, a ring for you, and a dim for fallen, and a name does not fit it.

Wiring the title into the open build also fixed something that was already
wrong — `AttackPanel` was the one climber chip in the kit passing no `photoUrl`
and no `borderUrl`, so every rival was faceless on the surface whose whole
point is showing you who you are about to fire at.

## Decision 7: no participation ladder

`Poll Newbie` through `Polls Galore!` is not revived. A title everybody passes
through by showing up says nothing about the account wearing it, and most
players would wear whichever tier they had reached because it was the only
title they held. How much somebody has played is already legible as gates
cleared and archived storage.

## Consequences

- `runs-won` joins the objective metrics as a cumulative counter. `gates-cleared`
  counts gates across every run and can never say thirteen of them fell in one,
  which is what `Summit` asks.
- The objective ledger starts at its migration, 2026-09-06. Play before that is
  uncounted, and `Legacy Tester` — a granted title with no predicate — is what
  covers the accounts it under-credits rather than a backfill.
- The shared Drizzle test mock now resolves an exhausted queue to no rows
  instead of `undefined`. A real query always returns an array, and specs that
  queue results for the statements they assert on should not break when an
  unrelated statement is added upstream.
