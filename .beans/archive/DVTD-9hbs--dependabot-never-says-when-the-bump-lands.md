---
# DVTD-9hbs
title: Dependabot never says when the bump lands
status: completed
type: bug
priority: normal
created_at: 2026-09-15T14:36:44Z
updated_at: 2026-09-15T14:42:53Z
---

The poll screen draws Dependabot as a bare chip. Nothing on it says how close the free upgrade is, so the one config whose whole value is a countdown is the only one that never states its own state.

The parts already exist and are unreachable:

- `autoUpgradeRemaining(configs, progress)` is written and specced in `autoUpgrade.model.ts`.
- `RunView.autoUpgradeRemaining` is computed in `runView.viewmodel.ts` and read by nobody.
- `kantoPoll.factory.ts` already fixes the intended badge: `{ label: "bump in 2", color: "vermillion" }`.
- `configs/Dependabot.stories.tsx` has CountingUp / OneAnswerFromAnUpgrade / AWrongAnswerStartsOver, all three of which render identically today.

`configStatusFor` keeps Dependabot `online` via `countsThisAnswer`, but the online arm carries only `coverage`, so `pollNoteFor` has nothing to badge.

## Todo

- [x] `PollStatusContext` carries `autoUpgradeProgress`; the online arm of `ConfigStatus` carries `bumpIn`
- [x] `pollNoteFor` badges it vermillion, matching the fixture wording
- [x] `runView.viewmodel.ts` passes `state.autoUpgradeProgress` into the status context
- [x] Specs: effect.model, configChip.viewmodel, plus an engine-driven story assertion
- [x] Wiki / CHANGELOG if the rule reads differently to a player

## Summary of Changes

The chip now reads `bump in 3` in vermillion, counting down with the streak and snapping back to `bump in 5` after a miss.

- `autoUpgrade.model.ts`: `bumpInFor(config, progress)` extracted; `autoUpgradeRemaining` now calls it, so build-level and config-level answers cannot drift.
- `effect.model.ts`: `PollStatusContext` carries `autoUpgradeProgress` (required, like `faucetRemainingKb`); the `online` arm of `ConfigStatus` carries `bumpIn`.
- `configChip.viewmodel.ts`: `pollNoteFor` badges `bump in N` vermillion. Coverage still leads if a config ever pays both.
- `runView.viewmodel.ts`: feeds `state.autoUpgradeProgress` into the status context.
- `configStories.spec.tsx`: CountingUp / OneAnswerFromAnUpgrade / AWrongAnswerStartsOver rendered identically before this; they now assert 3, 1 and 5 through the real reducer.
- `docs/wiki.md`: the countdown quote was `"in 3"`, now `"bump in 3"`.

No CHANGELOG entry: both the wiki and the Unreleased entry already described this countdown, so it was a promise the screen had not kept rather than a change of rules.

### Left alone

The count can still promise a bump that lands on nothing when every config in the build is at max level; `autoUpgradeOnAnswer` silently resets in that case. Raised with Marciano rather than guessed at.

### Verification

4458 passed, 2 failed, both in `gate.model.spec.ts` (the floor rule) and both failing identically with these files reverted to HEAD. `tsc --noEmit` clean, `lint` clean apart from two pre-existing story warnings.
