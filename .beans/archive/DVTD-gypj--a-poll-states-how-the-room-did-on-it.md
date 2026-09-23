---
# DVTD-gypj
title: A poll states how the room did on it
status: completed
type: feature
priority: normal
created_at: 2026-09-21T11:25:10Z
updated_at: 2026-09-21T12:04:36Z
---

The poll screen adds a two-row fact band above the question: a difficulty
reading drawn from every player's first attempt, and a personal history reading
drawn from this account's answers. The answer list gains a frame with ruled rows.

Decisions (planned 2026-09-21):
- The % is FIRST-ATTEMPT accuracy: each player counts once, on the deal before
  they were ever shown the answer. The only measure that does not drift toward
  "easy" as a poll ages.
- Ladder: brutal <35%, hard 35-59%, fair 60-79%, easy >=80%.
- Below 5 first attempts: a pewter `untested` badge, no percentage.
- Correctness is persisted as an `outcome` column on polls_responses, written by
  the grader at answer time; reads are grouped counts, not row folds.
- The seen-before row counts ANSWERS, not deals.
- Free for everyone now, but carried on an OPTIONAL field so redactPoll can
  withhold it later (the seam 451 and 207 already use).

## Part 1 - persist the outcome
- [x] schema.ts: pollAnswerOutcome pgEnum + `outcome` column on pollResponsesTable
- [x] migration: add column, backfill existing rows, first-attempt partial index
- [x] recordSessionAnswer writes answerOutcome(poll, optionIds)
- [x] legacy calendar writer (pollResponse.queries.ts) writes it too

## Part 2 - read the two statistics
- [x] widen fetchMissedPollIds -> fetchPollHistoryByUser (attempts, misses, lastAnsweredAt)
- [x] new fetchFirstAttemptRates (grouped, mirrored excluded)
- [x] fetchRunPollsForRun attaches both as RunPoll.stats

## Part 3 - the rule and the plumbing
- [x] new domain/pollStats.model.ts: PollStats, ladder, MIN_FIRST_ATTEMPTS
- [x] RunPoll.stats + PollView.stats, forwarded by redactPoll
- [x] pollScreen.viewmodel: pollDifficultyFor, pollHistoryFor
- [x] PollView.component fills the facts prop

## Part 4 - the UI
- [x] new PollFacts.ui.tsx rendered between Panel.Header and Panel.Body
- [x] questionFactsOf moves out of the header meta into the band
- [x] framed answer list: Question CHOICES + Choice ROW
- [x] stories + fixtures

## Part 5 - docs
- [x] ADR-093 + README row
- [x] wiki.md poll screen section
- [x] CHANGELOG.md

## Summary of Changes

Built as ADR-093. Two ruled fact rows between the poll panel header and the
question, plus a framed answer list.

**Data.** `polls_responses` gained an `outcome` column (correct/partial/wrong),
written at answer time by both loops' writers and backfilled by
`20260921120000_add_response_outcome.sql` (verified re-runnable against the
local DB). `fetchMissedPollIds` now reads the column instead of folding option
rows.

**Reads.** New `pollStats.repository.ts` — `fetchPollStats(pollId, userId)`,
two grouped aggregates for the one poll on screen. Mirrored rows are excluded
from both halves.

**Plumbing.** New `pollStats.model.ts` owns the ladder (brutal <35, hard <60,
fair <80, easy; floor of 5 first attempts). `run.service` attaches the result to
`PollView.stats` after `toRunView`; the field is optional, which is the seam a
future config or audit would use.

**UI.** New `PollFacts.ui.tsx` built from `Panel.Rows`/`Panel.Row`.
`questionFactsOf` moved out of the header meta onto the band's trailing slot,
still reading the presented answer type so 207 keeps its secret. `Question`'s
CHOICES became a bordered frame; `Choice`'s ROW rules against its neighbour and
rounds only at the ends.

**Course correction mid-build.** Stats were first attached to `RunPoll` beside
`missedBefore`. That put two aggregates over ~65 polls on every dispatch to show
one poll, and broke 21 repository specs — the signal it was in the wrong layer.
Moved to the service; `readsMissedHistory` was deleted and then restored.

**Verification.** `npm test` 3887 passed, 2 failed (the pre-existing gate-floor
specs). `npm run lint` clean, no dependency violations. `npm run build` passes.
Band and frame eyeballed in Storybook across all four bands.

**Deferred.** Nothing withholds the band yet — no config, no audit.
`missedBefore` still counts mirrored answers (pre-existing; moving it would move
Regression Test's trigger).
