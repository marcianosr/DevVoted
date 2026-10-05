# ADR-191: A better clearing band pays more

## Status

Accepted — 2026-10-05 (Marciano, DVTD-tjc7). Supersedes ADR-096's finding that
"OK, HEALTHY and PERFECT pay identical KB" and closes the open choice in
ADR-076 Decision 3.

## Context

A gate's clear pays `correct ÷ 5` of its reward and never reads the band.
ADR-075 later added ×1.5 on a PERFECT close, but OK and HEALTHY still paid the
same. Prep's At stake ladder quotes each band the KB of the fewest right
answers that reach its line, and at most gates those counts match. So the OK
and HEALTHY rows both read +58 KB, and the ladder's middle step looked
worthless.

ADR-076 designed a cut: an OK close is paid `coverage ÷ the gate's line`. That
cut was never built (`payoutRatioFor` was reachable only from a test factory).

## Decision 1: the band multiplies the clear, and OK is the baseline

| Band    | Multiplier on the clear |
| ------- | ----------------------- |
| OK      | ×1                      |
| HEALTHY | ×1.25                   |
| PERFECT | ×1.5                    |

SHAKY and DANGER clear nothing, so they have nothing to multiply.
`BAND_BONUS` and `bandBonusKbFor` in `coverageRatio.model.ts` own the table.
The close records the extra as `bandBonusThisGateKb` (it was
`perfectBonusThisGateKb`), and the debrief shows it as **Band bonus**.

**Why a boost and not a cut.** A cut nerfs every thin clear in the game.
`correct ÷ 5` already pays fewer right answers less, so a coverage-ratio cut
on top would charge each miss twice. A boost leaves the floor where players
already stand and makes the line worth reaching.

## Decision 2: the dead slope is deleted

`payoutRatioFor`, `gatePayoutKb`, `perfectBonusFor`, `PAYOUT_RATIO_CAP` and
`KB_PER_PROVEN_SLOT` are gone. The gate-outcome story factory now prices a close
with `gateClearPayout` + `bandBonusOnClear`, the engine's own path. The prep
factory shares `prepPayoutFor` with the screen.

## Consequences

- HEALTHY is the common clear, so the KB economy inflates by up to a quarter of
  the clear on most gates. The ADR-161 balance specs in `runAction.model.spec.ts`
  still pass. If the shop starts to feel cheap, retune `BAND_BONUS.healthy`
  before reaching for prices.
- SLA (ADR-096) is no longer the only thing that makes a better band pay. It
  stacks on top: SLA pays the band you promised, the band bonus pays the band
  you landed in.
- The debrief no longer says an OK close "cuts the payout". It says it earned no
  band bonus, which is what the engine does.
