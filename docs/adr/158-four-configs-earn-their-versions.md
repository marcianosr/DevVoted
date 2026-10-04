# ADR-158: Four configs earn their versions

## Status

Accepted — 2026-09-30 (Marciano; DVTD-fixa, DVTD-qfmb, DVTD-cc6f, DVTD-449q).

## Context

Code Coverage, Prefetch and the two linters were pinned at v1: the upgradable list
names effect fields, and named none of theirs, so the shop had nothing to sell them.
ESLint and Stylelint were the same config twice, each locked to a category. Prep named
an outage audit and hid its victim, so a build could see an outage coming and do
nothing about it.

## Decision 1: Code Coverage's add scales with its version

The flat add is the base times the version, halved when minified: +0.1 units a
correct answer at v1, +0.5 at v5, never amplified by a multiplier. The base does not
move, so ADR-083 Decision 5 still holds at v1.

Why: a flat add was the one coverage effect with no lever, and its copy still promised
a percentage it stopped paying in ADR-083.

## Decision 2: Prefetch v1 names the polls, v2 names their shape

v1 reveals this gate's and the next gate's categories. v2 adds each poll's option
count and how many take more than one answer. Prefetch caps at v2, beside Telemetry,
git rebase -i and Dependabot.

Why: one axis per version. A v1 that showed only this gate's categories would have
been git rebase -i v1 without the reorder, at the same weight, since the kanto reveal
is prep-only.

## Decision 3: Linter replaces ESLint and Stylelint, and the version buys the reset, then the price

One draftable Linter, weight 2, every category, in the free eight. A lint costs
8/16/32/64/128/256 KB. At v1 the ladder climbs for the whole run, redo included. At v2
it resets at every clear. At v3 every rung is halved. One wrong answer always stands,
the 429 allowance stays per window, 402 still doubles the fee, and under 510 a Linter
reads as v1 for the gate.

Why: two category-locked linters were shelf space. A linter that reset for free every
gate had nothing left for an upgrade to buy, so the reset became the upgrade.

Existing players are granted Linter and lose the two old ids by migration. A live run
holding ESLint keeps it as a ghost until that run ends.

## Decision 4: npm audit names an outage's target at prep

A 2-weight config. With it installed, prep names under each scheduled outage audit the
config it will take offline: one name when every poll agrees, the play order when the
pick moves, the whole build on poll 1 for 425. The line is computed server-side from
the same seeded pick the gate uses, over the installed build. It unlocks after 3
audited gates cleared.

Why: ADR-038 Decision 5 keeps the casualty off prep because naming it early is a
spoiler. A config that sells the spoiler is the same kind of exception Prefetch made
for upcoming polls. The rule stays; this is its one paid crack.

## Consequences

- The upgradable list gains `coverageAdd`, `revealsUpcomingCategories` and
  `eliminatesWrongOptionsFor`.
- `RunState.lintsThisRun` counts lints for the run; `window.linted` keeps the gate's.
- `outageTargetsFor` reuses the gate's own pick, once per poll position.
- DVTD-e0u5's Merge design keeps its recipes; its 32 KB Linter ladder is superseded.
