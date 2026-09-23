---
# DVTD-7k59
title: 'Config: Regression Test'
status: completed
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-15T13:55:17Z
updated_at: 2026-09-20T14:35:08Z
parent: DVTD-72d9
---

Previously-seen polls pay ×2

## Shipped 2026-09-20

**Regression Test** — 2 slots, 64 KB. A poll this account has answered before without getting it fully right pays **x2 coverage**.

## The bean's mechanic was re-cut first

As written ("previously-seen polls pay x2") the numbers did not work: the bank is **96 polls** and a run costs ~65, so one run sees ~68% of it and "seen before" is a near-flat x2 from run two onward — a 2-slot config strictly dominating AGENTS.md (8 slots, x2). It also collided with **Snapshot Testing** in the wiki's designed-not-built table, same mechanic under another name.

Marciano picked the miss-set cut. It is self-bounding (the pool is small), self-decaying (it SHRINKS as you learn, so a strong player prices it out of their own build), rewards pillar 1 directly, and leaves "seen before" free for Snapshot Testing later.

A **partial counts as a miss** — a regression test covers a case that did not pass. That matches the Dex's own `fullyCorrect` notion.

## How it is wired

- `Config.missedPollMultiplier` + `AnswerContext.previouslyMissed` (required, not optional — both spec helpers centralise construction so it was cheap) + `RunPoll.missedBefore`.
- `coverageOf` folds it in through `minifiedFactor`, so minify halves the bonus to x1.5 like any other gain.
- New `SkipReason` `missedOnly` -> the poll rail reads "polls you have missed" when idle.
- Correctness is NOT decided in SQL. The rows fold through `evaluatePollAnswer`, the same shared rule the Polldex uses, so full/partial/wrong stays one rule in one place.
- The flag is attached when the sequence is READ and never persisted. The snapshot already drops `polls` and rebuilds them from `run_polls` every action, so the set is always fresh — a stored flag would go stale the moment the player learned the poll.

## The query is gated, which is why the blast radius is small

First attempt put an unconditional query in `fetchRunPollsForRun` and **broke 22 tests**: the repository spec's DB mock is a positional queue, so one extra `select` shifts every later result. A subquery builder inside `inArray` would have consumed a second slot on top.

Fixed properly rather than by patching 20 mock queues: `readsMissedHistory(configs)` (roster-authoritative — resolves by id, because a snapshot embeds the config shape from draft time) decides whether the query runs at all. Builds without the config pay nothing, which is both the better engineering and why only the roster-count assertion needed touching. Poll ids come from the rows already in hand, so it is exactly one extra statement.

## Verification

`npm test` **3786 passed / 2 failed** — the two pre-existing `gate.model.spec.ts > the floor rule` specs that fail at HEAD. tsc, oxlint, depcruise (768 modules), prettier all clean. Roster/unlock parity 41/41.

New coverage: effect-level (doubles a missed poll only, halves when minified, reads on any category), status-level (`missedOnly` skip), end-to-end through `answerWith`, and a new `configRoster.model.spec.ts` covering `readsMissedHistory` plus roster id/label uniqueness invariants.

Docs: wiki 4.3 row + count 40->41 + a prose paragraph on why the miss set is the bound, ADR-051 D3 objective row, CHANGELOG.

## Follow-up

**Snapshot Testing** still sits in the wiki's designed-not-built table with "polls you have already seen reward x2". It is now free to keep that trigger, but it needs the pricing rethink the 96-poll bank forces — it cannot be a 4-slot x2. Left as-is, not deleted.
