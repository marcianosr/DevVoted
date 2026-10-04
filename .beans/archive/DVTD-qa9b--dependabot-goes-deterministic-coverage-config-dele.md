---
# DVTD-qa9b
title: Dependabot goes deterministic, Coverage config deleted
status: completed
type: task
priority: normal
created_at: 2026-09-04T11:58:39Z
updated_at: 2026-09-04T12:13:53Z
---

Two roster changes decided by Marciano 2026-09-04.

**Dependabot: remove the gamble.** Today it is `autoUpgradeOneIn: 3` — a seeded 1-in-3 roll on gate clear, then a seeded pick among the build's upgradable configs (1-in-2 at L2, maxLevel 2). Replace with: every odd gate clear, upgrade the config sitting immediately after Dependabot in the build.

**Delete the Coverage config.** `CONFIGS.coverageGain` (2 slots, coverageMultiplier 2) and `CONFIGS.agentsMd` (8 slots, coverageMultiplier 2) are the same effect at an 8x price difference — 64KB vs 256KB to draft. Coverage strictly dominates, so AGENTS.md is unbuyable. Coverage also collides with coverage-the-score (wiki 4.3 open item), so its name goes with it.

## Todos
- [x] Delete `coverageGain` from configRoster.model.ts
- [x] Sweep `CONFIGS.coverageGain` out of STARTER_POOL, run.factory handed, specs and stories
- [x] Rewrite Dependabot's clear effect in autoUpgrade.model.ts (deterministic, positional)
- [x] Update config.model.ts description/gives/upgrade-delta copy and effect.model.ts skip reason
- [x] Update wiki 4.3 roster table (config count, Dependabot row, Coverage row, the rename open item) and ADR-050 free-at-signup list
- [x] CHANGELOG entry
- [x] npm run lint, build, test

## Summary of Changes

**Dependabot.** The 1-in-3 roll is gone; the random *target* stays. New axis
`autoUpgradeEveryNClears` replaces `autoUpgradeOneIn` (L1: 2, so it fires on odd
gate numbers; L2: 1, every clear; floored at 1). `autoUpgradeOnClear` takes
`gateNumber` as a second argument and decides firing from it, keeping the seed
only for the target pick, so a replayed clear still replays its outcome. The
`isUpgradable` eligibility rule is untouched: any upgradable config, Dependabot
itself included, Focus mastery gate ignored (DVTD-tzbx Option A, 2026-08-20).
That reasoning moved out of code comments and into that bean plus the wiki row.

`ConfigFigure`'s `chance` arm was deleted with the odds it rendered: Dependabot
was its only producer. `percent` became the fallback arm in both
`modern-theme/Figure.ui.tsx` and `PollView.component.tsx`.

**Balance note, not asked for but implied.** Twelve clears reach the
auto-upgrade (gate 12 wins before it runs). Odd gates give 6 guaranteed fires
where 1-in-3 averaged 4; L2 gives 12 where 1-in-2 averaged 6. The change is a
buff as well as a de-gamble.

**Coverage deleted.** `coverageGain` (2 slots, 64 KB, `coverageMultiplier: 2`)
was `agentsMd` (8 slots, 256 KB) at a quarter of the price, since
`draftCost` is a flat 32 KB per slot. Swept from `STARTER_POOL`,
`run.factory` `handed`, 8 specs and 5 stories. Substitutes were chosen to
preserve what each test was actually measuring: `abTest` (2 slots) in
`hand.model.spec.ts` so the seeded `shuffleSeeded` draw keeps its pool length,
`agentsMd` where the assertion was on a x2 coverage product, `codeCoverage`
where it was on "a 2-slot config". The redundant "Coverage doubles gains"
effect test was deleted rather than rewritten: the AGENTS.md case below it
asserts the same claim.

**Open, for Marciano.** The free starter set is now eight, not nine (ADR-051
Decision 2, amended in place). Whether a ninth config takes the empty slot is
undecided.

## Verification

`npm run lint` clean (oxlint + dependency-cruiser, 898 modules). `npm run build`
(vite + `tsc --noEmit`) clean. `npm test`: 2681 passed, 3 failed. The 3 failures
are pre-existing `modern-theme/RewardScreen.spec.tsx` copy assertions ("short
by", "gate 0 cleared - yours across every run") on an unmodified component that
imports nothing this bean touched. Stories are excluded from `tsconfig.json`, so
they were typechecked separately against a scratchpad config that clears the
exclusion; the only errors there (`stripsOnFailure`, `AuditView.code`) sit
outside this bean's hunks.

## Revision 2026-09-04: the cadence became a counter

Marciano, same session: "It might be more interesting and to debuff if there is
a counter: autoupgrade in: 3 counting down, resetting if you answer a poll wrong
or fail a gate." He offered two metrics, gate clears or consecutive correct
polls.

**Measured first, then built.** A gate-clear counter that resets on any wrong
answer needs 15 straight correct answers for 3 clean gates: 0.04 fires a run at
70% accuracy, 1.1 at 90%. That is not a debuff, it is a delete, and it
reintroduces the "sat through five gates doing nothing" problem the roll had. So
the counter ticks on **correct answers**, not clears.

**Shipped.** `autoUpgradeAfterCorrect: 5` (L1 5, L2 4). `RunState.autoUpgradeProgress`
counts consecutive correct answers; `autoUpgradeOnAnswer` fires on the answer that
completes the count and resets to 0, a wrong answer resets to 0, a partial leaves it
alone (matching `nextStreak`), and `closeWindow`'s fail branch resets it. The seed
now only picks the target. `autoUpgradeOnClear` is gone from the clear path.

Dependabot is `online` on every poll now (`countsThisAnswer` in `effect.model`),
since every answer either advances or resets the count. Its row shows the
countdown as "in N" via `RunView.autoUpgradeRemaining`, taking the slot the
deleted `chance` figure used to occupy.

**Rejected: reusing `RunState.streak`.** It already counts consecutive correct
answers and already resets on wrong, so `streak % 5 === 0` would have needed no
new state. But `streak` drives the reward multiplier, so adding the gate-fail
reset Marciano asked for would have silently changed a different mechanic. A
dedicated field keeps the two meters independent.

**Balance, measured against the shipped model (60 polls, per climb):**

| accuracy | X=4 | X=5 shipped | X=6 | X=7 |
| --- | --- | --- | --- | --- |
| 70% | 7.1 | 4.3 | 2.7 | 1.7 |
| 80% | 8.7 | 6.9 | 4.8 | 3.4 |
| 85% | 9.0 | 8.1 | 6.1 | 4.6 |
| 90% | 9.0 | 8.8 | 7.5 | 5.9 |

Reference points: the old 1-in-3 roll averaged 4, the odd-gate cadence was a flat
6. So X=5 is a debuff below roughly 78% accuracy and a buff above it: skill-gated
rather than a flat nerf. **If a flat debuff was the goal, X=6 or X=7 is the dial**,
and it is one number in the roster plus two copy strings and two test expectations.

A narrow build saturates: three configs offer only 9 bumps total (js and Unit
Tests cap at L5, Dependabot at L2), so a perfect climb stops paying once they are
exhausted. Seven configs offer 22. That is a genuine synergy with wide,
upgradable builds rather than a bug.

## Verification (revision)

`npm run lint` clean. `npx tsc --noEmit` clean. `npm test`: 2688 passed, 3 failed
(the same pre-existing `modern-theme/RewardScreen.spec.tsx` copy assertions).
Stories typechecked against the scratchpad config that clears the `*.stories.tsx`
exclusion: `ConfigsInAction.stories.tsx` clean.
