# ADR-100: A category has a living record

## Status

Accepted — 2026-09-22 (Marciano, DVTD-pb7v). Decisions 2 and 4 collapsed by
[ADR-103](103-the-board-seats-twelve-category-leaders.md); 1, 3, 5 and 6 stand
and are why the read is unchanged. Uses the seam
[ADR-093](093-a-poll-states-how-the-room-did.md) opened when it put read data on
`PollView` and said so: *"`stats` is optional, and that is the seam."* First
slice of the per-category living records sketched in `docs/old-beans/DVTD-vje6`.

## Context

ADR-093 gave the poll a history of its own — how the room fared on it, how this
account fared on it. It says nothing about the **category** the poll belongs to.
The category is stated as a badge in the panel header and carries no stakes: it
labels the question and stops there.

Meanwhile the answer ledger already holds a per-category history nobody reads.
`polls_responses` carries an account, a grade and a timestamp; `polls` carries
the category. The longest unbroken run of correct answers anyone has strung
together in a category is a query, not a feature request.

The pull is the pillar in
[ADR-042](042-design-pillars-and-anti-pillars.md): a run is played against other
people's play, not against a difficulty dial. A record with a name on it is the
cheapest possible version of that — no matchmaking, no live opponent, one row.

## Decision 1: the record is the longest run of correct answers, all-time

Not coverage, not participation, not accuracy. DVTD-vje6 lists four candidate
per-category metrics; the streak is the one the poll screen can put a player
*inside*. Coverage and participation describe a season's grinding. A streak
describes the next answer.

All-time rather than seasonal because seasons do not exist: `seasons` is a table
with no writer and `runs.season_id` is its only reference. A "season record"
that silently means *since the dawn of time* is worse than an all-time record
that says so.

## Decision 2: your own figure is your personal best, never a live streak

Dead — [ADR-103](103-the-board-seats-twelve-category-leaders.md) Decision 4
drops `your best` from the row. No live figure replaces it.

## Decision 3: a partial neither extends nor breaks a run

The SQL cuts islands on `outcome = 'wrong'` alone and counts only `'correct'`,
which is exactly `nextStreak` in `runPoll.model.ts`.

The obvious implementation — break wherever `outcome <> 'correct'` — is one
character shorter and wrong. A player whose in-run streak survived a partial
would watch the hall of fame count it as a break, and the screen would be
teaching them something the engine does not do. A figure that contradicts the
rules is worse than no figure.

## Decision 4: the title is derived from the category, never stored

Dead — [ADR-103](103-the-board-seats-twelve-category-leaders.md) Decision 3
drops the title. DVTD-vje6's named award registry stays unbuilt and stays a
different thing: those are earned and kept, this is a standing somebody can take
from you tonight.

## Decision 5: below a floor, the record is unclaimed

`MIN_RECORD_STREAK = 3`. Two right answers in a row is not evidence of anything,
and a `JavaScript Maintainer` badge earned by two devalues the badge in every
category that earned it honestly.

The floor is not a reason to hide the block. An unclaimed record reads as an
invitation — the one state where the player can see exactly what it takes.
Hiding it would make a young category look like a broken feature.

## Decision 6: the record is withheld while the category is hidden

The caption names the topic in full: *longest run of correct JavaScript
answers*. An audit that blinds the category badge and left this standing would
hand back the very thing it took, so `hallOfFameFor` returns `undefined` on
`categoryHidden` — caption and all, not a blinded caption.

## Consequences

- **`fetchCategoryRecord` scans a category's answers on every poll view**, next
  to the two reads `fetchPollStats` already makes. Every existing index on
  `polls_responses` leads with `poll_id`, so this one scans. At the current
  ledger size that is free; it grows. The honest read ships first, and caching
  or materialising it is a later decision with real numbers behind it.
- **Two reads, not one statement.** The holder needs the whole category folded;
  your own best needs only your rows, and pushing the account filter down makes
  the second read cheap. Sharing one CTE would have made both as expensive as
  the first.
- **The tie-break is `user_id` ascending.** Postgres row order is otherwise
  arbitrary, and a record held jointly would change hands between two identical
  requests.
- **The seed had to grow a history.** The pool is eight questions per category
  in category order, so the community pass — which slices the opening gates —
  gave two categories everything and ten nothing, and the accounts you log in as
  had no answers at all. `seedAnswerHistory` writes two backdated passes over
  the whole pool as `mode: 'calendar'` rows. Session rows dated today would have
  been read by `fetchAnsweredPollIdsForDay` as *already answered in today's run*
  and opened every run with its sequence spent.
- **`hashOf` is too linear for a run-length measure.** It is a `hash * 31 + char`
  fold, so keys ending in consecutive poll ids walk a short cycle: an 88%
  account crossed a whole category without once landing above its threshold, and
  six of twelve records came back at the category ceiling. The seed folds a
  second hash over a differently-shaped key. The seed stays reproducible.
- **The row is drawn in the live mood only**, like the byline above it. During
  the reveal the footer belongs to the explanation, and a "your best" that
  ticked up mid-screen would be the live figure Decision 2 rejects.
