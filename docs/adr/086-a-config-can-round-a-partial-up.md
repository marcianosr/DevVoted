# ADR-086: A config can round a partial up to a whole unit

## Status

Accepted, 2026-09-15 (Marciano, DVTD-dfyy). Amends
[ADR-079](079-a-partial-answer-pays-a-quarter-at-a-time.md) Decision 2: the
three quarter ceiling is now something a config can buy past. Sits inside
[ADR-083](083-a-coverage-config-multiplies-or-adds-units.md) rather than
amending it, because the rounding is an add. Leaves
[ADR-081](081-a-multiple-choice-answer-pays-double.md) whole: the credit term is
not touched and the share is not re-quantised.

## Context

ADR-079 snapped a partial to one of three rungs and ADR-081 multiplied a
select-all by a credit of two. A multiple therefore earns exactly 0, 0.5, 1,
1.5 or 2 units, and the two halves are the only fractional figures a bare
answer can produce anywhere in the engine.

The roster sells coverage four ways (a Focus multiplier, an Amplify multiplier,
a flat add and a cached step) but nothing that acts on the *shape* of a partial.
`.length` pays on how many answers a window holds, not on how well any one
landed.

A formatter is the obvious dev-world name for the mechanic (ADR-042 pillar 4):
ragged input, clean output.

## Decision

1. **`.prettierrc` tops a partial select-all up to a whole unit.** A quarter
   caught pays 1 where it paid 0.5, and three quarters pays 2 where it paid 1.5.
   A half catch already pays a whole unit, so the config pays nothing there.

2. **The top-up is a flat add, not a bigger credit.** `topUpUnitsFor` returns
   `ceil(credited) - credited` and is summed by `flatUnitsOf` alongside
   `coverageAdd` and `cacheUnitsFor`, so nothing amplifies it (ADR-083 Decision
   2). The alternative was to `ceil` the credited figure *before* the
   multipliers, which keeps "partials always come out whole" true in every
   build. It was rejected for Decision 3's reason.

3. **Nothing amplifying the top-up is what preserves ADR-079's ordering.**
   Because the multipliers ride the real share and the top-up does not, a
   near-miss trails a full answer again as soon as any coverage multiplier is
   installed:

   | Build | ¼ caught | ½ caught | ¾ caught | exact set |
   | --- | --- | --- | --- | --- |
   | bare | 1.00 | 1.00 | 2.00 | 2.00 |
   | Intellisense ×1.5 | 1.25 | 1.50 | 2.75 | 3.00 |
   | AGENTS.md ×2 | 1.50 | 2.00 | 3.50 | 4.00 |

   On a bare build a three quarter catch and a full set settle to the same
   number, which ADR-079 Decision 2 was written to prevent. That collapse is the
   purchase, confined to the cheapest build a player can hold. Every build above
   bare restores the order, so the ceiling is bought past rather than deleted.

4. **The share is not touched.** `coverageShare` still returns the ADR-079 rung,
   it still persists as `coverageFactors.correct`, and `Verdict` still renders
   `PART ¼` on an answer that paid a whole unit. The badge names the fraction
   caught, not what it paid: the seam ADR-081 Decision 2 set. The check that the
   seam held: `runPoll.model.spec.ts` and the verdict specs pass without edit.

5. **A config effect can read the answer's credited figure.**
   `Effect.coverage` takes it as a second argument, defaulting to zero for "no
   answer scored". The argument is the already-credited `share × credit`
   product rather than the share, so `creditFor` stays in
   `coverageRatio.model.ts` and `config/domain` gains no edge into
   `build/domain`. `BASE_UNIT × share × credit` was inlined at four sites; the
   two that carry a real share now name it once as `creditedUnitsFor`.

6. **It unlocks on a new objective.** `partials-paid` counts answers whose
   outcome is `partial`, which is exactly the set that gets paid something
   (ADR-079 made a cancelled-out answer read `wrong`). Ten of them earn the
   config.

7. **Two new skip reasons, because the two idle states are different facts.**
   `selectAllOnly` on a single-answer poll, where the share is binary and the
   config can never fire; `paysOnPartial` on a select-all, where whether it fires
   is up to the answer. `SKIP_WORDS` is typed against the reason union, so the
   copy could not be forgotten.

## Consequences

Size is 2 slots, 64 KB, next to `.length` and Code Coverage: the tier that pays
on poll shape and is honestly dead in a window of five single-answer polls. The
ceiling is +0.5 a poll and +2.5 a window, and only if every poll is a select-all
landing on an odd rung. It is not upgradable, because the effect is binary.

`headlineFigureOf` returns nothing for it, which is correct: the top-up is
unknowable until the answer lands. The chip states its condition
(`pays on a partial`) before the commit and the receipt states the figure
(`+0.5`) after it, per [ADR-084](084-the-answer-shows-its-own-receipt.md). The
rows still sum, because the breakdown orders `mult === 1` covers first and
`configBonuses` drops a zero-valued row, so a half catch produces no row at all:

```
base 0.50 · .prettierrc +0.50 · AGENTS.md ×2 +0.50  =  paid 1.50
```

**`ScoringRule` is deliberately not parameterised.** The poll screen's ladder
states 0 / 0.5 / 1 / 1.5 / 2 under the note "before the build multiplies it",
and the top-up is build rather than poll, so the panel is still true within its
stated scope. Parameterising it would make a component titled "what a poll
pays" describe a build, and would restate the rounding rule as strings in a
viewmodel. The disclosure lives on the chip, where a build states itself.

The `300 Multiple Choices` audit mirrors every poll in a window into a
select-all, so it is where this config is worth the most. That synergy between a
hostile gate rule and a bought config is allowed to stand: the audit is
disclosed on the stake receipt before entry (ADR-042 pillar 2), so the player
can see the pairing coming and it rewards having drafted for it.

A second config wanting to round would collide: two `roundsPartialUnitsUp`
configs would each compute the same top-up and `flatUnitsOf` would sum both.
Nothing on the roster does, and the field is a boolean rather than a number
precisely so the answer is "there is one formatter".

## Amendment — 2026-09-19: the config is renamed `Math.ceil()`

The mechanic is unchanged; only the label moves. `.prettierrc` was an apt
analogy, but `topUpUnitsFor` is literally `Math.ceil(credited) - credited`, and
ADR-042 pillar 4 asks for the real dev term over the apt one. It joins the
roster's method family (`.reduce()`, `.length`).

"Formatter" above now reads as "the one config that rounds": the field stays a
boolean, and there is still exactly one. `.prettierrc` is free for a config that
actually formats something.
