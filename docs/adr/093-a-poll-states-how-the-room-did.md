# ADR-093: A poll states how the room did on it, and what you did to it

## Status

Accepted — 2026-09-21 (Marciano, DVTD-gypj). Adds a fact band to the poll panel
alongside the meta [ADR-092](092-207-multi-status-hides-the-answer-type.md)
governs, and frames the answer list ADR-007's kit shipped borderless.

## Context

The poll screen has always told the player what the poll *is* — its category,
its option count, its answer type — and nothing about what the poll *has done*.
Two facts were sitting in the database, unread:

- **How the room fares on it.** Session answers are written as real
  `polls_responses` rows precisely so the social layer can query them
  ([ADR-005](005-session-runs.md), slice 2).
- **How this account has fared on it.** The same rows carry the account, the
  picks and the timestamp. `missedBefore` already reads a boolean out of them
  for Regression Test's trigger and throws the rest away.

The information is worth the most *before* the question is read. "31% of the
room got this right first time" is the reason to spend a peek, or to decline a
wager. Stated afterwards it is trivia.

## Decision 1: the figure is first-attempt accuracy

Each player counts **once**, on the deal they took before they had ever seen the
answer.

Two alternatives were considered and both drift:

| measure | what a year does to it |
|---|---|
| players who ever got it right | only climbs — everyone eventually cracks a poll after its reveal, so every poll ages into "easy" |
| share of all attempts correct | also climbs, since re-deals are answered by people who have been told the answer |
| **first attempt only** | **stable** — one data point per player, taken before they were taught |

A figure that silently changes meaning as data accumulates is worse than a
cruder figure that means one thing forever. This is the same reasoning
[ADR-073](073-coverage-is-a-flat-gain-reset-every-gate.md) applied to coverage:
a number the player compares across time has to keep its denominator still.

The cost is that the measure is conservative — it can only ever describe a
population that has shrunk to one row each — and that it says nothing about
whether a poll is *learnable*. That is a second statistic, not this one.

## Decision 2: four bands, and an honest `untested`

`brutal` under 35%, `hard` to 59%, `fair` to 79%, `easy` at 80% and above,
toned cinnabar / saffron / celadon / viridian.

Below **five** first attempts the poll says `untested` in pewter and states no
percentage. Four players getting a question wrong is not evidence that it is
brutal, and a red badge resting on that evidence is worse than no badge: it
tells the player to spend a peek they did not need. Naming the gap keeps the
row's height stable, which matters because the band sits above the question on
every poll.

Polldex's own 40/70 thresholds were considered for reuse and rejected: they band
*your* accuracy over a poll's whole life, which is a different axis wearing the
same numbers. Sharing them would imply a relationship that does not exist.

## Decision 3: the grade is stored, not folded

`polls_responses` gains an `outcome` column (`correct` / `partial` / `wrong`),
written at answer time by the grader that already computes it — once per loop,
in `recordSessionAnswer` and in the calendar writer.

Correctness was previously derived by joining `polls_response_options` to
`polls_options` and folding through `evaluatePollAnswer`, which is correct and
keeps one rule in one place. It does not survive contact with this feature: the
room's figure is an aggregate over *every player's* first attempt, so a fold
would fan out to (players × options) rows for a single number on the screen the
player looks at most.

The rule stays single because the *writers* stay single. The only place the rule
is restated in SQL is the migration's one-off backfill, which never runs again.
`fetchMissedPollIds` got simpler as a side effect — it reads the column instead
of folding.

## Decision 4: mirrored answers are excluded, except where they already counted

A response given under the Mirror audit ([ADR-038](038-the-audit-roster.md))
answered a different question: pick the *incorrect* options. Grading it against
the real key reports a miss the player never made.

Both halves of the band therefore exclude `mirrored = true`, following
`fetchPollSplit`. `missedBefore` deliberately does **not** change: it has always
counted mirrored rows, and moving it would move a config's trigger as a side
effect of a presentation change. That inconsistency is real and left standing on
purpose; it belongs to Regression Test, not to this band.

## Decision 5: the band is read where the view is built

`fetchPollStats(pollId, userId)` is called by `run.service` after `toRunView`,
and its result rides `PollView.stats`.

It was first attached to `RunPoll` beside `missedBefore`, which reads well — the
same "attached when the sequence is read, never persisted" rule applies, since
every figure moves while the run is open. It was wrong for two reasons the test
suite made obvious:

- **The engine does not want it.** `RunPoll` is what the reducer consumes.
  Hydrating state for a dispatch would have paid for statistics no rule reads.
- **It priced 65 polls to show one.** The band describes the poll on screen.
  Scoping the read to that poll makes it one indexed query on view paths only,
  instead of two aggregates on every dispatch.

`stats` is **optional**, and that is the seam. A config that reveals the room's
accuracy, or an audit that blinds you to it, leaves the field undefined — the
band disappears and the option count falls back to the panel header it used to
live in. Nothing is built here; the shape is.

## Decision 6: the answer list is framed

The choices move from gapped, self-rounded rows into one bordered box whose rows
rule against each other, rounding only at the ends so a picked fill stays inside
the frame.

This reverses a call made twice in session — the terminal kit rejected "one
framed container with `divide-y` rows" for keycaps, and the kanto composition
recorded that "the mock draws bordered answer rows, the shipped borderless rows
won". Neither was ever written down as a decision, which is the actual failure
being corrected here: a design call worth making twice is worth recording once.

The frame earns its place now that the band sits above it. Two ruled fact rows
and then a loose column of floating answers read as two unrelated screens; the
frame makes the panel one object.

## Consequences

- **The figure wears its band's colour.** ADR-066 requires the percentage to be
  badged, and an unsigned figure takes no colour — so it followed the screen
  theme and came out *louder* than the verdict beside it. Both badges now take
  the band's tone, which is the first place in the kit where a figure is toned
  by meaning rather than by sign.
- **`readsMissedHistory` survives.** It briefly lost its purpose when the stats
  read went on the sequence path, and was deleted; Decision 5 gave it its
  purpose back.
- **A dealt-but-skipped poll does not count.** The history row counts answers,
  because an answer is the only thing with an outcome to report. A poll linted
  away or left to the clock is invisible to it. `run_polls` could supply the
  deal count, at the price of a second read and a third clause in the sentence.
- **Dev data reads honestly but thinly.** The seed writes eight climbers against
  the community polls, so those sit just above the floor and band in the 50–63%
  range; every other poll reads `untested`. That is the rule working, not a gap.
- **Open: nothing yet withholds the band.** Free information that shapes a
  decision is the kind of thing this game normally charges for
  ([ADR-058](058-451-redacts-the-answers-and-sells-them-back.md),
  [ADR-092](092-207-multi-status-hides-the-answer-type.md)). Whether difficulty
  should be a Telemetry rung, and whether an audit should strip it, is left for
  playtesting — which is why the field is optional on day one.
