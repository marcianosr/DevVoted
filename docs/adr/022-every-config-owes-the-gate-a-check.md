# ADR-022: Every config owes the gate a check; the checklist is the whole rulebook

## Status

Accepted (2026-08-07, Marciano; the linter rule reversed and settled
2026-08-12). **Closes the anti-freeload requirement
[ADR-017](017-no-baseline-check.md) §2 left open**, and supplies the rule
[ADR-028](028-the-defeat-device.md) carves its one exception out of.

Written late (2026-08-13): the decision shipped first and the code has cited
"ADR-022" since, in `effect.model.ts`, `configRoster.model.ts`, `gate.model.ts`
and their specs. This file records what those citations point at, including the
two designs that were tried and rejected on the way, because both are the kind
of idea that looks obviously correct on a second pass.

> ⚠ Superseded by [ADR-035](035-gates-are-auditors.md) (2026-08-17): no config owes the gate anything — the friction moved onto the gate's own demand and audits.

## Context

ADR-017 removed the synthesized baseline check on the motto *the gate should
demand only what your build demands*, accepting a named risk: the freeloader
build. Claude objected at the time; Marciano confirmed the removal with the
explicit requirement that farming still be dealt with. It was not, and the hole
turned out to be worse than "banks nearly nothing".

Driven through the real reducer, a build of **Copilot + ESLint + Stylelint**
summited: 13 gates cleared, status `won`, all 13 swatches written to
`users.owned_swatch_ids`, on **zero correct answers**.

Two mechanics combined:

- `gate.model.ts` counts a `skipped` check as a pass, so a build whose every
  check *can* skip has an effectively empty checklist, and `[].every(...)` is
  `true`.
- Copilot carried no check at all, and a linter's check bound only when the
  player chose to lint. Both rows were skippable by choice rather than by draw.

ADR-021's peel death never fired, because the build never failed a gate. And
ADR-017's bet (scale the payout with correctness and farming prices itself out)
missed that **the climb is itself the reward**: gate depth, swatches and victory
were all free. A 0/5 clear paying 0KB is no deterrent when the thing being
farmed is the summit.

## Decision

**Every config owes the gate a check, and nothing the player chooses may excuse
one.** Only the draw may.

1. **The roster type enforces it.** `RosterConfig` (`configRoster.model.ts`)
   admits a config only via an authored `check`, a `focusCategory`, or a
   non-empty list of linted categories. A config with none of them contributes
   no checklist row, which is what let a build pass vacuously. Enforced on the
   roster rather than on `Config` because the roster is the only place configs
   are authored, and a partial `Config` is legitimate elsewhere (the configure
   screen prices previewed loadouts). Verified by deletion: removing the check
   makes `tsc` fail.

   The linter route is a non-empty tuple deliberately. An empty category list
   would satisfy a looser type and still owe nothing, which is the exact hole.

2. **Copilot became AGENTS.md and carries `min-correct: 1`**, unconditional and
   never excused by the draw. A legendary's 256KB draft price is most of what it
   costs, so its check is light; light is not free.

3. **Linters owe mastery of what they lint, never proof that they were used**
   (2026-08-12, reversing the rule below). `masteryCheck(config, categories)`
   generalises the Focus check: ESLint owes "1 JS/TS poll correct this window",
   Stylelint owes "1 CSS poll correct". A Focus config passes one category, a
   linter passes `eliminatesWrongOptionsFor`. Identical mechanic, one checklist
   row per config, excused by an unlucky draw and by nothing else.

### Rejected: a gate-level correctness floor

The first fix was `MIN_CORRECT_TO_CLEAR`, a floor sitting beside `isBare` in the
definition of a clear: no gate clears on zero correct answers, which catches the
all-excused window directly. It was built, and it broke nothing (1262 tests
passed), so no existing test relied on clearing at 0/5.

Marciano rejected it the same day. "Get one right" already exists as Unit Tests'
check, so a gate rule duplicating it **charges every build for something only
one build bought**, and adds a demand with no checklist row to show it. That
invisible demand was the very thing making the rules read as unclear. The
checklist is the whole rulebook: if a demand is real, some config's row says so.

The floor's job moved to AGENTS.md's `min-correct`, where the player can see it,
choose it, and pay for it.

### Rejected: the declined-lint pledge

The second fix made a *declined* lint a failure. `LintTally` gained an `offered`
counter so the reducer could tell "no JS/TS poll appeared" (unavoidable) from "a
JS/TS poll appeared and I declined to lint it" (a dodge), and a dodge failed at
window close. Affordability was explicitly not an excuse: a build that cannot
fund what it promised is a bad build, not an unlucky one.

Marciano reversed this on 2026-08-12: **linting must stay optional.** Forcing
the fee is a trap. A window the player cannot afford becomes fatal through no
decision of theirs, which is precisely the trap
[ADR-031](031-shop-exit-blocks-under-width-builds.md) had just reversed at the
shop door. Both variants considered ("one lint redeems the window", "every offer
must be taken") force the fee, so the check had to stop depending on the effect
being used at all.

Hence the mastery check: competence is owed, spending is not. A lint you get
wrong now costs the fee and nothing more. `lint-correct`, `LintTally`,
`lintedByConfig` and the `offered` counter became dead and were deleted.

### Sizing: why the mastery check is load-bearing

A first pass argued the width demand ([ADR-027](027-gate-width-demand.md))
already bounds this, since two linters only cover gates 0-2. Marciano corrected
it in the same session: that holds for today's roster and fails for the planned
one. There are 12 categories and the width demand tops out at 8 configs, so a
linter-per-category roster (DVTD-72d9, in progress) supplies more than enough
check-less-by-choice configs to fill every required slot.

So this is not an early-game hole; it is a hole that **grows with the roster**.
The mastery check also scales the right way: with a linter per category, every
drawn poll belongs to some linter's category, so a full-linter build fires a
mastery check on nearly every poll and becomes one of the hardest builds to
clear rather than the easiest. "Accept it and pin a test" would have aged badly.

## Consequences

- **Accepted residual: an all-excused window still clears on 0/5.** Three focus
  configs whose categories are none of them drawn leave every row excused, and
  the gate demands nothing. That is the honest reading of "the gate demands only
  what your build demands", and it cannot be chained into a climb because the
  draw cannot be chosen. Pinned by a test rather than fixed
  (`run.model.spec.ts`, "carries no gate-level correctness floor").
- The freeloader build now dies at gate 0: AGENTS.md's row is unconditional, so
  a 0/5 window fails it, and ADR-021's peel death becomes reachable again.
- A gate failure names the checks that failed in the run log
  (`Gate 0 failed: AGENTS.md`), rather than reporting only the gate.
- [ADR-028](028-the-defeat-device.md) carves the single exception: Volkswagen CI
  reports one failing check as passing, and pays for the waiver with a 384KB
  price and a floor of 3 other checks that actually ran and passed.
- The legacy prototype engine (`src/domains/runs/prototype/`) keeps the old lint
  pledge; it is parked and diverges knowingly, the same way it does on ADR-017.
