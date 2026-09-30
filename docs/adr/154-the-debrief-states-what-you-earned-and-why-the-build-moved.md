# ADR-154: The debrief states what you earned and why the build moved

## Status

Accepted — 2026-09-29 (Marciano, DVTD-kmch). Amends ADR-134's grant timing
(titles were settled only when a run ended) and the reward report's swatch
badge (ADR-080 keeps the rule, not the badge).

## Context

The gate debrief stated the swatch twice (a header line and a badge) and drew
Build changes as bare config chips. It never said what the gate unlocked or which
title it earned, because titles were only granted at run end and unlocks lived only
on the dispatch that fired them, so a reload lost them.

## Decision 1: an Earned panel lists the gate's gains

One row per config unlocked and title earned on this gate, then the swatch row:
earned, or missed with the window's count ("3 of 5") and its marks. The strip
counts the new things ("2 new"). With nothing new it folds to one line:
`nothing new · swatch 3 of 5`.

Why: a gate's rewards are the reason to play it, and they were invisible.

## Decision 2: titles are granted at every gate close

Not only when the run ends. The unlocks and titles of a close are stamped on that
close's entry in the run's close record (ADR-147), so the debrief reads them after
a reload. Unlocks fired mid-gate are held until the close.

## Decision 3: the swatch has one home

The header line ("You didn't earn the Pallet swatch") and the **swatch earned**
badge are gone. The header mark still fills when the swatch was won.

## Decision 4: Build changes gives each change its reason

One row per config, led by its weight: **expiring** (the next clear deletes it,
saffron edge, `1 gate left`), **upgraded** (`v1 → v2` and what upgraded it),
**removed** (a deprecation ran out or a subscription went unpaid, cinnabar edge,
`-N weight`). Unlocks moved to Earned. With nothing moved it folds to
`nothing moved`.

## Decision 5: a fold with news opens

Earned and Build changes open when they have rows. The ledgers (By category,
Payout, The five answers) stay folded to their strips.
