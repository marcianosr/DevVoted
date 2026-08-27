---
# DVTD-zd00
title: 'Config: multiple (single-choice polls price as multiple-choice)'
status: draft
type: task
priority: normal
created_at: 2026-08-27T09:59:01Z
updated_at: 2026-08-27T09:59:01Z
parent: DVTD-72d9
---

A config that pays single-choice polls the multiple-choice difficulty bonus, so the shape of the question stops deciding what it is worth.

## Mechanic

`pollDifficultyMultiplier(optionCount, isMultiple)` adds `OPTION_COVERAGE_STEP` (0.1) per option past 3 and a flat `MULTIPLE_CHOICE_COVERAGE_BONUS` (0.5) for a multi-answer poll. The config grades every poll as if `isMultiple` were true. Nothing about the question changes: a single-choice poll still has one correct answer, it just prices like the harder shape.

Read it off the constant rather than hardcoding +0.5, so a retune of the bonus carries the config with it.

| Poll | Today | With the config | Ratio |
| --- | --- | --- | --- |
| 3-option single | x1.0 | x1.5 | x1.50 |
| 4-option single | x1.1 | x1.6 | x1.45 |
| 5-option single | x1.2 | x1.7 | x1.42 |
| 8-option single | x1.5 | x2.0 | x1.33 |
| any multiple | unchanged | unchanged | - |

## Why the name

`multiple` is the HTML attribute that turns one-of into many-of (`<select multiple>`). It sits with `.length` and `package.json` in the roster's file-and-attribute naming, and it names the real mechanic instead of describing it. Runner-up: Checkbox (the radio group becomes checkboxes), which reads well but points at the input rather than the scoring.

## Legendary? Probably not at this strength

`polls.answer_type` defaults to `single` in the schema, so nearly every poll qualifies. That makes this config an effective flat x1.33 to x1.50 on all coverage, which is Intellisense (rare, 128KB, all coverage x1.5) with a slightly worse ratio on wide polls and a hole on multi polls. It is strictly weaker than a config the roster already sells at rare, so legendary would be a price nobody pays.

Suggested: **uncommon, 64KB**, with the option to move it to rare only if a real poll pool turns out to be multi-heavy (then the config is doing much less work, and the price should go down, not up). Rarity here is price plus signal only: the draft roll is not rarity-weighted.

One thing that argues the other way, and it is worth deciding on purpose: the multi-choice bonus is priced against the risk of having to get every correct option, and `coverageLossFor` reads the build rather than the poll, so a miss costs the same on either shape. Parity therefore buys the reward of the hard shape with none of its risk. That is a real gain the table above does not show.

## If legendary is the goal, change the effect, not the price

- **B. Price every poll as the hardest shape it could have been.** Max option count plus multiple, so every poll floors at x2.0 difficulty, multi polls included. That is AGENTS.md territory (all coverage x2 for 256KB) and reads as one sentence.
- **C. Parity, and the miss prices as multiple too.** Restores the risk the bonus was paying for, which keeps the parity version honest and keeps it at rare.
- **D. Parity plus partial credit on multi polls.** A different axis, and it overlaps DVTD-2ooc (what a partial multiple-choice answer does). Do not bundle it in here.

## Implementation traps

Three surfaces compute this figure, and only one of them is the engine.

- `gradeAnswer` (`answer.model.ts`, near the `difficultyMultiplier` line) derives it from the poll alone. It already holds `liveConfigsOf(state)`, so the build is in reach.
- `answerDifficulty` (`answerScore.viewmodel.ts`) recomputes it from `answered.answerType` with no build in scope. Left alone, the reveal prints x1.0 while the engine scored x1.5, on the exact screen where the player learns the config works.
- `coveragePerCorrectRaw` (`pipeline.model.ts`) ignores poll difficulty entirely, so the pre-gate "per answer" preview would not move at all. Either the preview learns a difficulty assumption, or a config's whole value is missing from the screen that previews builds.

## Todos

- [ ] Decide the strength: parity (uncommon) or one of B/C/D (rare/legendary)
- [ ] Measure first: what share of the live poll pool is `answer_type = 'multiple'`? The whole price depends on it, and the schema default says the answer is "almost none"
- [ ] `Config` field, through `Effect`/`effectOf`, aggregated in `pipeline.model.ts`
- [ ] Engine, reveal and preview all read the same figure, with a spec that pins them to each other
- [ ] Roster entry, wiki roster row + the poll-difficulty section, CHANGELOG
