---
# DVTD-5jby
title: Wrong answers leave a backlog on polls
status: draft
type: feature
priority: normal
created_at: 2026-08-24T12:49:22Z
updated_at: 2026-08-25T10:54:23Z
parent: DVTD-z2r2
---

Getting a poll wrong should leave something behind: an item on a backlog the player
can work off later, so a miss is a debt rather than a moment that evaporates.
Shape still to be designed.

## Where it stands today

- A wrong answer costs coverage (`WRONG_COVERAGE_LOSS`) and then leaves no trace
  the player can act on. The only record is the fold-out review at run end
  (`ReviewAnswers`) and lifetime stats in the Polldex.
- The Polldex already carries the data a backlog needs, per poll:
  `PolldexEntry.answeredCount` and `accuracy`
  (`src/modules/collection/dex/domain/polldex.model.ts`).
- `PracticeBank.ui.tsx` exists and lists the pool of past dailies a run draws from,
  with a `seen N× · last <date>` line per poll. It is a pool listing, not a debt list,
  but it is the surface closest to where a backlog would live.
- DVTD-1d4w (bonus awards for re-answering correctly) is the mirror image of this bean:
  it pays the credit, this one records the debt. Design them together or merge them.

## The constraint that decides most of it

ADR-009 Decision 2: each poll in the daily seed is answered **once**, no re-answering,
so per-poll community splits stay honest. ADR-009 also explicitly rejected personal
poll sets, because the shared daily sequence is the water-cooler hook.

So a backlog cannot work off today's shared window, and clearing an item cannot mean
answering the same daily poll again. It has to resolve somewhere else: the practice
pool of past dailies, or a surface of its own. Reconciling "one answer per poll" with
"retry the ones you owe" is the first thing this design has to settle.

## Open design questions

- **Where an item lives.** A badge on the poll's Polldex row, a list of its own, or
  both. A list is a screen to maintain; a badge risks being invisible.
- **What clears it.** Answering that poll correctly when it next comes up in a practice
  draw, an immediate retry offered at reveal, or decay over time.
- **Whether it has teeth.** Four levels, and the choice is the whole design:
  a pure record (honest, low energy); a reward on clearing (that is DVTD-1d4w);
  a cost while it stays open (careful, the wrong answer already cost coverage, and
  charging twice for one miss is the thing to avoid); or content pressure, where an
  open backlog weights what the practice pool draws.
- **Private or visible.** A public backlog count is a shame mechanic. Default private
  unless there is a reason.
- **Does it end with the run or persist.** A per-run miss list is a review feature. A
  persistent one is meta progression, which is why this bean sits under that epic.

## Naming

"Backlog" is a new noun for the game, but it is real industry vocabulary and the
neighbouring words are taken: "check" belongs to configs, "failing test" collides with
the Unit Tests config, "audit" belongs to gates. Backlog is probably the right word.
Confirm it before it reaches a screen, not after.

## Todo

- [ ] Settle how a backlog item is cleared without breaking one-answer-per-daily-poll
- [ ] Pick the teeth level, and say what the miss costs in total across coverage and backlog
- [ ] Decide per-run or persistent, and whether it renders on the Polldex row or its own list
- [ ] Fold DVTD-1d4w in, or state the split between the two beans
- [ ] Confirm "backlog" as the word
- [ ] Write the ADR once the shape is decided; it touches ADR-009 Decision 2's boundary
