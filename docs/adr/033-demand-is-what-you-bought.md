# ADR-033: The correct-answer demand is what you bought

## Status

Accepted, 2026-08-12. Reverses the escalation half of
[ADR-017](017-no-baseline-check.md). ADR-017's Decision 1 (checks come only from
configs) still stands.

> ⚠ Superseded by [ADR-035](035-gates-are-auditors.md) (2026-08-17): the correct-answer demand is deleted with every other check; Unit Tests keeps only its payout.

## Context

Unit Tests' check demanded `checkAmount + (level - 1) + escalation(gatesCleared)`,
capped at `+3` and clamped to the window. The escalation term rose on its own:
+1 for every two gates cleared. An un-upgraded Unit Tests demanded 1 correct
answer at gates 0-1 and 4 from gate 6 to the summit, without the player buying
anything.

The config's `level` never moved. Only the demand did. But the two are hard to
tell apart from the player's seat, because a level is exactly what raises a
demand everywhere else: the gate report shows the same config asking for more
each visit, and the only mechanism the game teaches for "asks for more" is an
upgrade you paid for.

## Decision

The demand is what you bought:

```
currentRequirement = min(SLICE_WINDOW, checkAmount + level - 1)
```

Gate depth no longer enters it. `escalation` and `ESCALATION_CAP` are deleted.

**Unchanged:** the strip quota still grows with depth (`dropCount`), the linter
fee still doubles per use, and bought levels still add +1 each. Escalation as a
concept is not banned; tying it to *depth on a check the player did not choose*
is.

## Consequences

### Positive

- The gate report can no longer read as a config that upgraded itself.
- One fewer number moving under the player between visits to the same screen.
- `currentRequirement(pipeline)` loses its `gatesCleared` parameter, so the
  demand is a pure function of the build.

### Negative

**Depth is not unpriced, but it is priced in one place fewer.** The gate's width
demand (ADR-027, ADR-031) is what makes depth expensive now, and it is the
larger of the two prices:

| gate | 0 | 2 | 4 | 6 | 8 | 10 | 12 |
|---|---|---|---|---|---|---|---|
| configs demanded | 0 | 2 | 4 | 5 | 6 | 7 | 8 |

Every config owes the gate a check (the roster invariant, ADR-022), so gate 12
judges eight checks on the same 5-answer window that gate 2 judges two on.
Escalation raised one check's target by at most 3. Losing it removes the smaller
term. `dropCount` still scales the strip quota on top.

The residual worry is not narrowness, which the width demand now blocks at the
shop door. It is **excusal**: a check whose category never appears skips, and a
skip passes. A build can therefore carry eight configs and owe very little in a
window that draws the wrong categories. That hole is `DVTD-ezij`'s subject, not
this ADR's, and the width demand only bites once it is closed.

`DVTD-ziss` measured the coasting risk on 2026-08-06 and concluded "the wall
already exists". That conclusion still holds. Its wall was `dropCount`, not
escalation, and ADR-027 built a second one four days later.

## Links

- [ADR-017, No baseline check](017-no-baseline-check.md): the decision this half-reverses
- [ADR-027, Gate width demand](027-gate-width-demand.md): what actually prices depth
- [ADR-031, Shop exit blocks under-width builds](031-shop-exit-blocks-under-width-builds.md): where the width demand is enforced
- `DVTD-ezij`: excusal, the residual hole the width demand depends on
- `DVTD-o57b`: this change
