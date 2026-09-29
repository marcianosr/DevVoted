# ADR-131: A category record belongs to one run, and there are two of them

## Status

Accepted — 2026-09-27 (Marciano, DVTD-0reh). Supersedes
[ADR-100](100-a-category-has-a-living-record.md) Decision 1 and
[ADR-103](103-the-board-seats-twelve-category-leaders.md) Decision 1; amends
ADR-100 Decision 5 and ADR-103 Decision 2. ADR-100 Decision 3 stands and is
extended by Decision 3 below. ADR-103 Decisions 4 and 6 stand.

## Context

ADR-103 seated twelve category leaders on the community board. The figure is the
longest run of correct answers in that category across every answer the account
has ever given, in either loop.

That measures longevity. DevVoted is a roguelite and its unit of achievement is
one run, so a record built out of a whole account history rewards showing up
rather than playing well.

## Decision 1: a record is the best a single run ever reached

Both figures are bounded to one run, and the record is the best such run, all
time, over finished and active runs alike.

The read filters `run_id is not null` and partitions by
`(user_id, run_id, category_code)`. Answers given outside a run stop counting.

## Decision 2: there are two boards, streak and correct

`Streak leaders` states the longest run of correct answers inside one run.
`Correct leaders` states the most correct answers inside one run. Twelve rows
each, the same roster, ranked independently.

They are two boards rather than two figures on one row because they are two
rankings: the same category can have a different holder on each, and one list
can only be sorted by one of them.

## Decision 3: a gate close does not break the record's streak

Only a wrong answer breaks it, as ADR-100 Decision 3 already had it.

The engine zeroes `RunState.streak` at every gate close, but that is the run's
overall streak across all categories. Nothing in the engine counts a
per-category streak, so there is no number on screen to mirror. Matching the
gate rule would bind a per-category figure to the reset rule of a different
figure.

The consequence is stated rather than hidden: the board's streak may span a gate
boundary; the run's own streak may not. The `&&` config already draws the same
distinction.

## Decision 4: each board has its own floor

`MIN_LEADER` is `{ streak: 3, correct: 4 }`, generalising ADR-100 Decision 5.

A correct count is always at least as large as a streak, so one floor would make
the correct board strictly easier to claim, and would print two claim lines that
read alike at the foot of twelve rows.

## Decision 5: the records are derived, never stored

The read folds `polls_responses`. `run_category_coverage` has the right column
names and no writer, and it stays that way.

Giving it one means a write on the answer-settlement path plus a backfill, and
the backfill is the derived query, so the derived read gets built either way and
then has to be kept in sync. Every run answered before the writer shipped would
read empty.

## Decision 6: the poll screen still states one leader

ADR-103 Decision 4 refused a second figure on the byline row. It is reaffirmed,
and two measures make its argument stronger: the figures sit in different
registers and would be held by two different people, so the line would need two
names as well as two numbers.

The streak is the one that survives, for ADR-100 Decision 1's original reason. A
player is inside a streak, and the poll on screen either extends it or ends it.

## Decision 7: one board shows at a time

The community screen draws one board in a full-width column, with a tab per
board above it. It used to draw both side by side in a half-width grid.

The consequence below, that the two boards read alike while runs are short, is
the reason. Two near-identical twelve-row lists side by side invite a comparison
that is not there yet, and each seat's row has to fit a category name, a handle,
a face and a figure into half the width, which wraps the row on anything narrower
than a desktop. One column at full width reads; the tab makes the comparison a
press rather than a squint.

The tab state lives in `CommunityScreen.ui.tsx`. Nothing outside the screen needs
to know which board is showing, so putting it in the component that wires the
screen would add a `useState` carrying no data.

## Consequences

- **Existing figures drop and seats open.** Every answer given outside a run
  stops counting, which is the whole calendar-era ledger.
- **The correct board costs no extra scan.** Partitioned by run, `max(island)`
  is the streak and `sum(island)` is the correct count, because every correct
  answer falls in exactly one island. One statement still serves both boards.
- **The two boards read alike while runs are short.** A run answers roughly five
  polls per category, so a player who does well in a category tends to top both
  boards with the same number. The seeded data shows this plainly: the pool is
  eight polls per category and both figures land between six and eight. The
  measures separate only when a run answers many polls in one subject.
- **Rank comes back as a string.** `row_number()` is a `bigint`, so a rank
  compared in TypeScript must be coerced. Comparing it strictly against `1`
  silently empties both boards.
- **The seed writes synthetic finished runs.** Backdated answers now carry a
  `run_id`, so `seedAnswerHistory` inserts four state-less finished runs per
  account. They are invisible to run history, the climb map and the fallen lane,
  which all inner-join `run_states`.
- **The SQL is not unit-testable.** Every spec mocks Drizzle positionally and
  the mock does not expose `where` arguments, so the run filter, the partition
  and the sum identity are checked by reading the board after a seed.
