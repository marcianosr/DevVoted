# ADR-067: Standouts are four plain standings

## Status

Accepted (2026-09-11, Marciano, DVTD-agt2). Reverses ADR-065 decisions 1 and 2.

## Context

ADR-065 shaped the standouts roster around the climb: deepest, against the
room, clean sweep, widest build, travelling light, comeback. Six awards, each
argued against ADR-042's anti-pillar 4 ("an award for a behaviour teaches
players to farm that behaviour").

Building the kanto community board as the day's home screen made the cost of
that roster visible. Every one of the six needs the reader to already hold the
climb's vocabulary: what a slot is, what a peel costs, why carrying three
configs is hard. On the screen a player lands on *before* their first poll,
six such awards read as six puzzles.

The board's job here is to show a room, not to certify a climb.

## Decision 1: the roster is four standings

Most active · most knowledgeable (per category) · fastest · biggest bank.

Each answers a question a newcomer already has: who is here most, who knows
this best, who is quickest, who has the most. None needs the climb explained
first. Registry order stays grid order.

## Decision 2: the clock and the category come back

ADR-065 retired fastest ("reflex is not a skill axis, and a clock award
teaches rushing the reveal") and most *{category}* ("directly farmable"). Both
return.

The anti-pillar still holds; it just no longer decides this. Farming a
standout costs a player the thing the game actually scores. Coverage is the
score, storage is the reward, and neither moves because your name sat in a box
for a day. The awards are a readable surface on the community board, not a
progression track. Anti-pillar 4 now carries this documented exception.

Fastest ranks the existing `answer_time_ms` capture in `polls_responses`,
which ADR-065 kept for exactly this reason. Most knowledgeable ranks accuracy
within a category, not volume, so answering more does not raise it.

## Decision 3: the six are retired, not archived in code

deepest, against the room, clean sweep, widest build, travelling light and
comeback stop being awards. Depth and width already read on the climb map; a
clean window already reads on the gate debrief. Nothing is lost from the
screen, only from the awards grid.

`RunState.configsLost` (ADR-065 decision 4) stays. It is a run statistic worth
counting whether or not an award reads it.

## Consequences

- **The code disagrees with this ADR today.** `standouts.model.ts` still
  computes ADR-065's six, and the live terminal `/run/community` still renders
  them. This ADR states the intent; `DVTD-j6t1` does the rewrite. Until it
  lands, treat `standouts.model.ts` as the ADR-065 roster and this file as
  where it is going.
- `StandoutInput` regains answer timing and category inputs, which ADR-065's
  consequences removed.
- `fetchActiveRunStats` no longer needs `pollsIntoGate`, `configsLost`,
  `startedAtGate` or per-config footprints for awards; it needs storage held
  and per-category accuracy instead.
- The kanto `CommunityScreen` ships against the four-award shape from the
  start, so its fixture is the target, not the current model.
