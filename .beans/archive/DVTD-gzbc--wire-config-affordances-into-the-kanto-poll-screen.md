---
# DVTD-gzbc
title: Wire config affordances into the kanto poll screen, then a story page per config
status: completed
type: feature
priority: high
created_at: 2026-09-13T09:31:22Z
updated_at: 2026-09-13T09:52:07Z
---

Three bugs from playing /proto-run share one root cause: the kanto Tier-1 kit has every affordance these configs need, and the Tier-2 adapter populates none of them.

- ConfigChip press badge -> pollScreen.viewmodel.ts hardcodes `badges: []`
- Choice.onUnseal -> Question.ui.tsx never threads it
- RunView.correctAnswersThisGate -> no kanto screen reads it

Plan: ~/.claude-work/plans/why-can-t-i-replicated-cherny.md

## Todo

### Part A - wire the affordances
- [x] A1 buildCountsOf becomes a real ADR-069 partition (applies/ready/offline), reusing configStatusFor
- [x] A1 BuildFooter BuildCounts keys + READINGS words; update spec/stories/factory
- [x] A1 amend ADR-069 reading table + drop stale dotFor citation
- [x] A2 paidActions.viewmodel gains lintRefusal/peekRefusal (one copy table)
- [x] A2 pollBuildFor emits press badges from paidActions
- [x] A2 PollView gains onLint/onPeek/onSwitchArm
- [x] A2 proto-run dispatches lint-poll/peek-poll/switch-arm
- [x] A3 Trail gains optional `holds`; trailFor fills it from correctAnswersThisGate
- [x] A3 runView.viewmodel uses liveConfigsOf for budgeterFor/prefetcherFor
- [x] A4 new pollScreen.viewmodel.spec.ts
- [x] A5 supply onUnseal from the adapter (Question already passes the seal object through, so no Question.ui change was needed)

### Part B - story pages
- [x] src/test/configRun.harness.tsx ported from HEAD:ConfigsInAction.stories.tsx
- [x] 26 story pages under src/ui/kanto-theme/configs/ (65 stories) + configStories.spec render guard

### Verification
- [x] npm run lint
- [x] npm test
- [x] npm run build
- [x] scratchpad tsc over the new stories

## Summary of Changes

All three reported bugs shared one cause: the kanto Tier-1 kit had the affordances, the Tier-2 adapter populated none of them.

**A1 counts.** `buildCountsOf` counted `focusCategory` matches as `usable`, a regression against ADR-069. Rewrote it as a real partition over a new `RunView.configStatuses`, computed in `toRunView` from the already-existing but production-dead `configStatusFor` (ADR-040). Readings renamed `usable`/`running` -> `ready`/`applies`; ADR-069 amended.

**A2 presses.** `pollBuildFor` hardcoded `badges: []`. Added `pollPressesOf` as the ONE source for both the chip badges and the footer count, so a count can no longer promise a press the screen does not draw. New `lintRefusalOf`/`peekRefusalOf` in the domain give one refusal-copy table. A refused press wears its reason as its visible label (`hint` only reaches the DOM as an aria-label, invisible to sighted players and it clobbers the button name).

**A3 .length.** `correctAnswersThisGate` reached the view and nothing read it. `Trail` gained optional `holds`. Also fixed `budgeterFor`/`prefetcherFor` reading `state.build.configs` instead of `liveConfigsOf`, so an audit that takes .length offline now takes its readout off screen too.

**A5 unseal.** `Choice.onUnseal` rides on the `seal` object which `Question` already passes through, so only the adapter needed to supply it. No `Question.ui.tsx` change.

**Part B.** `src/test/configRun.harness.tsx` (engine-driven, ported from the deleted ConfigsInAction) + 26 pages / 65 stories under `src/ui/kanto-theme/configs/`, plus `configStories.spec.tsx` which renders every story and asserts none falls back to a dead end.

Verification: lint + depcruise clean (973 modules), 4216 tests pass, `npm run build` clean, story tsc back to the 27-error pre-existing baseline.
