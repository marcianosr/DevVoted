---
# DVTD-ecjo
title: A spent day still offers Start, then fails with a raw error
status: todo
type: bug
priority: critical
created_at: 2026-09-19T18:52:15Z
updated_at: 2026-09-24T12:49:38Z
parent: DVTD-0x5c
blocking:
    - DVTD-6vw2
---

**What:** Every entry point checks how many of today's five polls the player has left, instead of how far the current run got.

**Why:** The hub advertises five polls ready on a spent day, and the press dies on a raw server error.

## Done when
- [ ] The hub says how many of today's polls are actually left
- [ ] Start is refused in plain words when the day is spent, never with a raw error
- [ ] A retry cannot spend a second day's polls on the same date
- [ ] Specs cover: no run with the day spent, and a finished run with the day part spent

## Notes

**1 gate = 1 day = 5 polls (ADR-014).** Once a player has answered today's five,
the climb must park until tomorrow. The dealing layer enforces this correctly.
The **entry points do not**, so a player who has spent today can still be invited
to start, and lands on a raw server error.

## What is already correct (verified 2026-09-19)

- `SEED_LENGTH = SLICE_WINDOW` (`seed.model.ts:13`) and `rollDailySeedSequence`
  slices to it, so a day's shared sequence is exactly 5 polls. Spec-pinned at
  `seed.model.spec.ts:25`.
- `isAwaitingTomorrow(state)` is derived, not a status (`run.model.ts:218`),
  exactly as ADR-014 Decision 2 requires.
- `syncTarget` redirects an awaiting-tomorrow player to `/run/community`
  (`runRoutes.viewmodel.ts:97`).
- Prep refuses to start the gate when the segment is spent
  (`PrepView.component.tsx:105`) and shows the countdown instead
  (`RunPrep.component.tsx:59`).
- `fetchAnsweredPollIdsForDay(userId, date)` (`run.repository.ts:116`) is the
  authoritative per-player, per-day signal, and `run.service.ts:110` subtracts it
  so a same-day restart can never re-answer a poll.

## The bug

`RunStart` derives readiness from the **current run** rather than from the
**player's day**:

    // RunStart.component.tsx:53
    const spent = view?.pollsExhausted === true && !countdown.isOpen;
    const polls = spent ? { ready: false, ... } : { ready: true, count: SLICE_WINDOW };

`pollsExhausted` is `currentIndex >= polls.length` for *that run*
(`runView.viewmodel.ts:474`). So whenever the player's current run is not itself
exhausted, the hub advertises **"5 polls ready"** even though the day is spent:

1. `view` is `null` (no run yet today, but the player already answered five in a
   run that has since ended).
2. The run ended `won` or `dead` partway through the window, so
   `currentIndex < polls.length` and `pollsExhausted` is `false`, yet the player
   has still answered some or all of today's five.

Pressing **Start** then calls `start.mutate()` → `startRunService` →
`run.service.ts:114`:

    if (polls.length === 0) {
        throw new Error("No polls left for a run today");
    }

A raw error string, from a button the screen said was ready.

## The fix, in one sentence

Readiness is a property of the **player's day**, not of one run: surface how many
of today's five remain from `fetchAnsweredPollIdsForDay`, and let every entry
point read that.

## Todo

- Add the day's remaining-poll count to the view (server-derived from
      `fetchAnsweredPollIdsForDay`), so no screen has to infer it from one run
- `RunStart`: derive `spent` from that, not from `view?.pollsExhausted`;
      stop printing `count: SLICE_WINDOW` when fewer remain
- Refuse `start` in the service with a typed, player-readable refusal rather
      than `throw new Error("No polls left for a run today")`
- Cover the two reproductions above with specs: no run + day spent, and a
      finished run with the day partly spent
- Check the retry path: ADR-076 says a SHAKY retry costs a day, so a retry
      must not be able to consume a second window on the same date
- Wiki: state the rule where a player reads it (the hub and prep both say
      when tomorrow's polls land)

## Related

- **DVTD-6vw2** (in-progress) owns the sibling symptom on `/run/over`: the same
  "Start new run" press fails silently there. Its open exhausted-window item and
  this bean should land together.
- **DVTD-uret** (todo) is the *monetisation* lever on the same boundary, pay KB
  to continue past the gate. Deliberately out of scope here: this bean is the
  free rule working correctly. Note `rejected.md` already refuses buying past a
  **missed gate**; paying within a day is the distinction DVTD-uret must state.
- ADR-014 (the rule), ADR-011 (rollover), ADR-009 (the shared daily seed),
  ADR-076 (a retry costs a day).
