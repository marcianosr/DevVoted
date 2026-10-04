---
# DVTD-pb7v
title: 'Hall of fame: a category''s living streak record under the poll byline'
status: completed
type: feature
priority: normal
created_at: 2026-09-22T19:32:56Z
updated_at: 2026-09-22T19:50:01Z
---

Beneath the poll author byline, state the all-time record for the longest
unbroken run of correct answers in this poll's category, who holds it, and
your own personal best.

```
hall of fame  longest run of correct JavaScript answers
[avatar] @alice  [JavaScript Maintainer]  [17 in a row]      your best 4
```

## Decisions (asked and answered)

1. Your figure is your **personal best all-time** in the category, not a live
   streak — it never moves mid-run, so the row is a target, not a flicker.
2. The badge is **derived**: holding the record makes you
   `${CATEGORY_METADATA[code].name} Maintainer`. One rule, twelve categories.
3. The caption reads **hall of fame** — seasons do not exist yet.
4. Below `MIN_RECORD_STREAK = 3` the row reads `— unclaimed —` rather than
   crowning a 2-in-a-row or hiding.

Mirrors ADR-093's layer path: read in a repository, attach in the service after
`toRunView`, never on `RunPoll`. First slice of docs/old-beans/DVTD-vje6.

## Todo

- [x] `categoryRecord.model.ts` — CategoryRecord, MIN_RECORD_STREAK, maintainerTitleOf
- [x] `categoryRecord.repository.ts` — gaps-and-islands, partial preserves
- [x] `PollView.record` + `withPollReads` in run.service
- [x] `hallOfFameFor` in pollScreen.viewmodel (withheld under categoryHidden)
- [x] `HallOfFame.ui.tsx` + story + spec
- [x] Wire into PollScreen.ui + PollView.component (live mood only)
- [x] Seed: widen category coverage, give SEED_PLAYERS answers
- [x] ADR-100, CHANGELOG, wiki
- [x] lint, typecheck, tests

## Summary of Changes

ADR-100. The poll panel closes on a second region under the byline.

**Domain** `run/domain/categoryRecord.model.ts` — `CategoryRecord`,
`MIN_RECORD_STREAK = 3`, `isRecordStreak`, `maintainerTitleOf`.

**Infrastructure** `run/infrastructure/categoryRecord.repository.ts` —
gaps-and-islands over `polls_responses JOIN polls`. The island key is a running
`count(*) filter (where outcome = 'wrong') over (partition by user_id order by
created_at, response_id)`, so a partial neither breaks nor extends a run,
matching `nextStreak`. Filters `mirrored = false`, `user_id is not null`,
`outcome is not null`. Two reads: the holder folds the whole category, your best
pushes the account filter down. Tie-break `best desc, user_id asc`.

**Application** `PollView.record`; `withPollStats` became `withPollReads` and
`Promise.all`s both reads; `hallOfFameFor` in `pollScreen.viewmodel` withholds
on `categoryHidden`, drops the trailing at 0 and when you are the holder.

**Presentation** new `src/ui/kanto-theme/HallOfFame.ui.tsx` (+ story + spec),
its own `border-t px-4 py-3` region after `PollCredit`. Live mood only.

**Seed** `seedAnswerHistory` writes two backdated passes over the whole pool as
`mode: 'calendar'` rows for climbers *and* players — session rows dated today
would have been read as already answered in today's run. `SeedPlayer.accuracy`
is new. `hashOf` is too linear for a run-length measure (six of twelve records
came back at the category ceiling), so the roll folds a second hash over a
differently-shaped key.

**Verified** 4134 tests pass (229 files), lint + depcruise clean, `npm run build`
clean, and the row renders live at `/run/poll`:
`hall of fame · longest run of correct CSS answers` / `@blaine · CSS Maintainer ·
24 in a row · your best 4`.

## Deferred

`fetchCategoryRecord` scans a category's answers on every poll view and every
index on `polls_responses` leads with `poll_id`. Free at current size; worth a
cached or materialised record once there are real numbers behind it.
