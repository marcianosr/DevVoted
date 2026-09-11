---
# DVTD-rdgf
title: 'Config: Dry Run projects the gate meter before you submit'
status: completed
type: feature
priority: normal
created_at: 2026-09-11T11:19:24Z
updated_at: 2026-09-11T11:29:08Z
---

While a selection is staged on a poll, Dry Run marks the coverage meter with where the gate lands if the answer scores and where it lands if it misses.

Built only from numbers the player already gets free (`coveragePerCorrect` / `coveragePerWrong` from `perAnswerPreviewFor`), so it leaks nothing about the answer key.

## Why not the literal ask

"Show what THIS selection scores" is unbuildable without leaking the key: `coverageShare()` divides by `correctIds.length` and counts `option.correct`, so any selection-sensitive figure can be binary-searched by toggling options. Best-case and worst-case are already free and already independent of how many you pick, so the projection is the only honest thing left to sell.

## Axis

New. Information configs today: Prefetch (categories/option counts), `.length` (correct count), Telemetry (community split). None touches the meter; Dry Run sells *projection*, not a hidden value.

## Todo

- [x] Config effect flag on the Config type
- [x] Roster entry appended LAST (positional slicing in run.factory/seedCommunity)
- [x] Domain projection function + spec
- [x] effect.model.ts wiring (effectOf / describeConfig)
- [x] Surface the projection through the viewmodel
- [x] UI: meter marks
- [x] Wiki roster + mechanic entry
- [x] CHANGELOG (player-visible)
- [x] Verify: lint, build, tests

## Summary of Changes

**Dry Run** (2 slots, 64 KB, id `dry-run`): while an answer is picked, the coverage gauge marks where the gate lands if it scores and where it lands if it misses.

### Domain

- `config.model.ts` — `projectsGateOutcome?: boolean`
- `configRoster.model.ts` — entry appended LAST (`run.factory`/`seedCommunity` slice positionally)
- `configUnlock.model.ts` — `"dry-run"` earned via `gates-cleared` 30, fallback 700 polls. Reuses an existing metric; no new `ObjectiveMetric` wiring.
- `effect.model.ts` — joins `sellsSomethingHere`, so it reads online during a poll and falls to `notThisPoll` outside one. No new `SkipReason`.
- `build.model.ts` — `projectorFor(configs)` beside `peekerFor`/`budgeterFor`/`prefetcherFor`
- `gate.model.ts` — `GateProjection` + `gateProjectionFor(held, preview, demand)`, floored at 0 the way `closeWindow` floors, with `passClears` / `missClears`

### Surface

- `GateStake.projection?: GateProjection`, populated in `runView.viewmodel.ts` only when `projectorFor` finds the config. Presentation gates on presence alone.
- `CoverageGauge.ui.tsx` — new `missAt?: number` draws a cinnabar line at the miss level, and the aria-label reads both outcomes so the projection is never colour-only.
- `PollScreen.ui.tsx` / `PollView.component.tsx` — `missAt` rides the same "something is selected" condition the existing `pending` ghost already used.

### Why not the literal request

"Show what THIS selection scores" is unbuildable without handing over the answer key: `coverageShare()` counts `option.correct` and divides by `correctIds.length`, so any selection-sensitive figure can be binary-searched by toggling options. Best-case and worst-case were already free (`perAnswerPreviewFor`) and are already independent of how many options you pick, so the gate-relative projection was the only honest thing left to sell. Both marks are identical whichever option is selected.

### Verification

- `npm test` — 4352 passed, 6 skipped, 2 todo
- `npx tsc --noEmit` — 0 errors repo-wide
- `npm run lint` — no dependency violations (986 modules)
- New: 11 domain tests in `gate.model.spec.ts`, 5 gauge tests in `CoverageGauge.spec.tsx`, 2 stories

Roster-count assertions bumped for the 36th config: `configUnlock.model.spec.ts` (27 → 28 earned) and `ConfigdexPanel.spec.tsx` ("8/35" → "8/36"). The 1-slot group count was unmoved since Dry Run is 2 slots.

### Not done

- The **live** `/run/answer` screen renders `AnsweringScreen.ui.tsx` (old-theme), which has no coverage gauge at all. Dry Run is visible on the terminal `PollScreen` (`/proto-run`) only. Same split as the gate hold screen: the newer terminal screen is not the routed one.
- Not upgradable: `isUpgradable` does not include the flag, so it has one version by design.
