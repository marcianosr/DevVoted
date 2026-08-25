---
# DVTD-ecnx
title: 'Start from Gate X: the git tag becomes a visible choice at run start'
status: todo
type: feature
priority: high
created_at: 2026-08-25T15:19:30Z
updated_at: 2026-08-25T15:19:30Z
---

The git tag (ADR-036) works server-side and is invisible to the player. `startRunService` calls `consumePinnedGate(userId)` on every fresh start, so the tag burns silently: the entry screens still read "Start today's climb" and "Start a new run", and nothing tells the player they are about to spend a checkpoint or that they resumed at gate 7 instead of gate 1. A checkpoint the player cannot see is a purchase they cannot reason about.

## Goal

When the account has a planted tag, the run entry screen offers it as a named press: **"Start from gate X"**, beside the plain start. Spending is a click, not a side effect.

## Proposed shape

Two presses on the entry screen when `pinned_gate` is set:

- `Start from gate X` (loud): starts the rescued run, consumes the tag.
- `Start fresh` (quiet): starts at gate 1, keeps the tag planted for a later day.

The tag press names what it grants, in the same figures the shop sold it with: gate X, its swatch/theme name, the slot count it opens (`slotsForGatesCleared`), and the `32KB x N` stipend. Without those the choice is a name and a shrug.

## Decision needed before building

Does "Start fresh" keep the tag, or does every fresh start still burn it? Recommendation: keep it. ADR-036 already flags this as open ("whether abandoning (not dying) should also consume the tag on the next start"), and a player who dies deep, starts a casual run the next morning, and loses a 512KB checkpoint to a button they did not read has been griefed by the UI. Keeping it makes the tag exactly what a git tag is: it sits there until you check it out. If it keeps the tag, ADR-036 Decision 2 needs amending.

## Todos

- [ ] Decide the fresh-start question above, amend ADR-036 (Decision 2 and the open bullet) with the outcome
- [ ] Add a non-destructive read to `run.repository.ts`: `findPinnedGate(userId)`, distinct from the read-and-clear `consumePinnedGate`
- [ ] Expose it: service + server function + hook, keyed under `userQueryKeys` (the run flow has no userId client-side, so it needs a prefix it can name, like `swatchesAll`). The entry screen has no run, so this cannot ride `RunView`
- [ ] `startRun` takes an explicit `useTag: boolean` (validator, session-derived userId, never a client userId). `startRunService` only consumes when it is true
- [ ] `RunStart.component.tsx`: second press when a tag exists, with the gate figures
- [ ] `RunOver.component.tsx`: same press, since a death is where the tag pays off. Prefer the account column over the dead run's `view.pinnedAtGate`, which only covers a tag planted in that same run
- [ ] Server guard: a tag pointing past `GATE_COUNT` or at a gate the rules no longer grant slots for must not start a broken run
- [ ] Tests: fresh start with a tag present does not consume it; `useTag: true` consumes it and starts at gate X; a second start after the burn gets no press; `canStart` clamp holds at a wide start (ADR-036 Decision 3)
- [ ] Wiki 2.8 (see DVTD-4o32, already open on the missing git tag unlock) and CHANGELOG per docs/changelog-maintenance.md

## Files

- `src/modules/run/run/infrastructure/run.repository.ts` (`consumePinnedGate`, add the read)
- `src/modules/run/run/application/run.service.ts` (`startRunService`)
- `src/modules/run/run/application/run.serverfn.ts` (`startRun`)
- `src/modules/run/run/application/useRunActions.hook.ts` (`start`)
- `src/modules/run/run/presentation/RunStart.component.tsx`, `RunOver.component.tsx`
- `docs/adr/036-the-git-tag.md`
