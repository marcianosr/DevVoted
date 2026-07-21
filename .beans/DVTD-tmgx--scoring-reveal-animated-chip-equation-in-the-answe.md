---
# DVTD-tmgx
title: 'Scoring reveal: animated chip equation in the answer beat'
status: in-progress
type: feature
priority: normal
created_at: 2026-07-21T07:41:43Z
updated_at: 2026-07-21T18:35:37Z
---

Chosen from feel-test (DVTD-n4h8 thread): after answering, show the coverage earned as an animated chip equation (base + bonuses = earned), chips popping in after the option badges. No coverage bar, no streak line.

## Done (Storybook prototype)
- [x] Extract ScoreEquationChips.ui.tsx from CoverageEquation (shared, /pipelines unchanged)
- [x] animated + startDelayMs props; chips pop in staggered (reveal-pop)
- [x] ChipEquation story with Replay; verified render

## Remaining
- [ ] BLOCKER: plumb per-poll score breakdown (base/streakBonus/configBonus + config labels) through engine -> RunView; run flow only exposes net coverageEarned today
- [ ] Wire ScoreEquationChips into RunGame reveal beat (AnsweringScreen)
- [ ] Confirm timing/feel (chip stagger 110ms, start 500ms after options)
- [ ] Remove prototype stories (per-pop, count-up) once locked
- [ ] Story + unit coverage for the wired version
- [ ] lint + typecheck + build

## Update: real ConfigChip via slot injection

- Config bonuses now render the real <ConfigChip> (rarity colors), not the plain rarity chip. ScoreEquationChips (src/ui, generic) can't import ConfigChip (ui->modules forbidden by lint:arch), so it gained an optional `chip?: ReactNode` slot; the run flow (stories exempt) injects the node. /pipelines path unchanged (still uses rarity/ConfigCard fallback).
- Only coverage-affecting configs earn score chips: **Copilot** (coverageMultiplier 2, legendary) and **Code Coverage** (coverageAdd 0.5, uncommon). ESLint/Stylelint (defense) and economy configs (Intellisense/IndexedDB storage) do NOT score.
- Real integration must: pass run-module Config objects for coverage configs, filter to coverage-affecting only, and use noTooltip (ConfigChip's default Tooltip nests a <p> in a <p> — pre-existing, follow-up candidate).

## Wiring into the real app (in progress)
- [x] Engine: coverageBreakdownForAnswer helper in pipeline.model + spec (7 tests)
- [x] Store coverageBreakdown on AnsweredPoll (run.model answer())
- [x] Viewmodel: latestAnswerScore(view) helper + spec (3 tests)
- [x] RunGame: compute score on reveal, pass to AnsweringScreen; manual Next advance (removed ANSWER_REVEAL_MS auto-timer)
- [x] AnsweringScreen: render ScoreEquationChips with ConfigChip during reveal + Next button
- [x] AnsweringScreen Revealed story + reveal specs
- [x] lint + typecheck + build + 837 tests pass

## Wiring complete

Scoring reveal is live in the real RunGame flow: answer -> options pop ✓/✕ -> chip equation (base + streak + real ConfigChips = earned) -> player clicks **Next →** to advance (no auto-timer). Coverage-config recognition = effectOf(config).coverage !== undefined AND contribution != 0. Streak = correct-answer streak (grows on correct, resets on wrong, **partial holds** — confirmed by Marciano 2026-07-21).

### Follow-ups (deferred)
- Prototype stories in ScoringReveal.stories.tsx (PerPopTally, CountUpTotal, ChipEquation) + RevealScore.ui.tsx are now superseded by the wired AnsweringScreen Revealed story — candidates for deletion.
- Reveal pacing: was 2000ms auto; now manual. Old DVTD-whl4 note (2s ANSWER_REVEAL_MS) is stale.
