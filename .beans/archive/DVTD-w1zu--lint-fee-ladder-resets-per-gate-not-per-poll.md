---
# DVTD-w1zu
title: Lint fee ladder resets per gate, not per poll
status: completed
type: task
priority: normal
created_at: 2026-08-26T13:00:11Z
updated_at: 2026-08-26T14:04:49Z
---

ESLint/Stylelint's cross-out stays unlimited — any poll in the gate, in the categories the linter covers — but the fee ladder (8, 16, 32, 64, 128, 256 KB) now runs for the whole gate and resets only at the clear, mirroring Telemetry's peek.

Reverses the per-poll reset the wiki justified as "stops lint-spam": a gate-scoped ladder stops spam harder, and by pricing it rather than by capping it.

- [x] `GateWindow.linted` counter, reset by `EMPTY_WINDOW`/`freshWindow`
- [x] Carry `linted` through the per-answer window rebuild in answer.model
- [x] `lintFeeFor` reads the window, not `manualDisabled.length`
- [x] Roster copy on ESLint + Stylelint says the reset
- [x] Wiki 4.5 + roster table + glossary
- [x] Specs

## Summary of Changes

The cross-out stays unlimited; the fee ladder is what meters it, and it now runs for
the whole gate instead of resetting on every answer.

- `GateWindow.linted` added beside `peeked` (`effect.model.ts`), `linted: 0` in
  `EMPTY_WINDOW` — so `freshWindow` resets it for free at a gate clear *and* at a
  redo (`strip.model.ts` `resumeClimb`). Optional, like `peeked`: `GateWindow` is
  persisted in the run's state JSON and legacy snapshots have no such field.
- `answer.model.ts` carries `linted` through the per-answer window rebuild. That
  window is a field-by-field literal, so an uncarried field is a dropped field.
- `lintFeeFor` reads `state.window.linted ?? 0` instead of `manualDisabled.length`;
  `spendLint` increments it. `lintCost`'s param renamed `usesThisGate`.
- Roster `costs` on ESLint + Stylelint now matches Telemetry's: "The fee doubles
  each use, and resets each gate".
- Wiki 4.5, the roster table rows and the glossary entry. The old text justified the
  per-poll reset as "which stops lint-spam" — deleted, since spam is now priced
  rather than capped.
- Four specs in `paidAction.model.spec.ts`; two specs that hardcoded the copy string
  (`StackPreviewList.spec`, `ConfiguringScreen.spec`) now read `CONFIGS.eslint.costs`
  so the next copy edit does not re-break them.

Kept deliberately: the `wrongStillOn(state).length > 1` guard in `lintApplies`. It is
what stops a player buying the answer outright — the roster's information configs
withhold, they never hand it over.

Verified: `npx tsc --noEmit` clean, `npm run lint` clean (766 modules, 3143
dependencies, no violations), `npm test` 2402 passed. The 3 remaining failures are
pre-existing in `RewardScreen.spec.tsx` and unrelated.
