---
# DVTD-zvcv
title: 'Config: a wrong answer earns coverage instead of losing it'
status: todo
type: task
priority: normal
created_at: 2026-09-05T08:45:44Z
updated_at: 2026-09-05T08:45:50Z
parent: DVTD-72d9
blocked_by:
    - DVTD-w0ul
---

A config that, while installed, turns the wrong-answer coverage loss into a gain. Working name: **`Math.abs()`** — it literally makes a negative positive, it is a real function, and the semantics match exactly, which is the naming bar this roster holds itself to.

## The number it touches

`WRONG_COVERAGE_LOSS = 0.5`, and the loss is `coverageLossFor(configs, gatesCleared) = 0.5 × coveragePerCorrectRaw(configs, gatesCleared)`. Two consequences:

- **A wrong answer already costs half of what a right one earns**, so a straight flip makes a wrong answer worth half a right one. Random answering would still climb, which removes the reason to know anything. This needs a bound, and the bound is the design work.
- **The loss scales with the build.** A strong build loses more per miss, so the flipped version pays more the better your build already is. That is a snowball, and it is worth checking against the "aim beats width" measurement before setting the magnitude.

Two things it must not break:
- `coverageLoss` is already zeroed while an audited share is in play (`auditedShare > 0 ? 0 : …`), so the config must not double-dip there.
- `perAnswerPreviewFor` already publishes `coveragePerWrong` as a negative number, so the pre-gate stake screen shows the flip with no new plumbing. It just stops being negative, which is exactly the readable payoff.

## How to bound it

Per the roster's own rule, bind a strong config with a readable condition rather than a fee:

- **Magnitude**: a wrong answer earns a quarter instead of losing a half. Same shape, half the power, and the preview line still flips sign.
- **Count**: only the first wrong answer per gate. This is `try/catch` semantics, catches one throw, and it fits the window's existing per-gate counters.
- **Direction**: the loss becomes storage instead of coverage. That is already a bean, DVTD-w0ul Bug Bounty (+16 KB per wrong answer), so this variant would be a duplicate rather than a sibling.
- **Streak**: whatever the coverage does, a wrong answer still breaks the streak. That keeps a real cost on being wrong without touching the meter, and it interacts with DVTD-1wjl.

My pick: **magnitude plus streak** — a wrong answer pays a quarter and still breaks the streak. Count-limited is the safer alternative if playtests say a quarter is still too kind.

## What DVTD-w0ul already worked out

Bug Bounty is the same trigger on a different axis, and its bean carries the analysis this one inherits: once the window meter clears the gate's demand, extra window coverage is worth nothing because coverage resets per gate. So a loss-flip is strong early in a window and near-worthless once the demand is met, which is a natural brake and should be stated in the config's own copy rather than discovered.

Open question the pair raises: if both ship, is the coverage one strictly better than the storage one? Two loss-side configs are a family, and a family needs a reason to hold both.

## Roster fit

The roster is already heavy on coverage multipliers, so a new coverage config needs a reason. This one has it: nothing else in the roster touches the **loss** term. It is a new shape on a crowded axis, not another multiplier.

Size: this is a build-defining effect, so 4 or 8 slots at 32 KB a slot rather than a cheap pickup.

## Todo

- [ ] Pick the bound (magnitude, count, or both) and the number
- [ ] Confirm the name against the alternatives: `Math.abs()`, `try/catch`, `?? 0`, `Error Boundary`
- [ ] Effect in `effect.model.ts` / `build.model.ts` so `coverageLossFor` reads it; no special-casing in `answer.model.ts`
- [ ] Must not stack with the audited-share zeroing
- [ ] Specs: flipped value, audited case, streak still breaks, preview line sign
- [ ] Decide the relationship to DVTD-w0ul before both ship
- [ ] Wiki roster entry
