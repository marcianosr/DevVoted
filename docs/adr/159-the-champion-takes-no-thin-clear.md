# ADR-159: The Champion takes no thin clear

## Status

Accepted — 2026-09-30 (Marciano). Amends the band table of
[ADR-076](076-the-closing-band-decides-what-it-costs.md) at one gate. Built the
same day.

## Context

OK clears a gate "thin": full payout, no streak. At gates 0 to 11 that is a fair
trade, because the next gate starts from the same bank and asks more of it. At
the Champion there is no next gate, so the thin clear cost nothing and a run
could win the game on its weakest passing band.

## Decision

At the Champion (`VICTORY_GATE`), only HEALTHY or PERFECT clears. An OK close
there is held on the band, exactly like SHAKY: pay the peel and retry, or
refuse the gate. Every other gate is unchanged.

`clearsAt(band, gate)` in `gate.model.ts` is the one owner of the rule. The
ruling, the debrief, prep's At stake ladder and its clearing objective all read
it, so the static `CLEARING_BANDS` table is deleted.

The debrief draws a held Champion's meter where it really stood, inside OK, and
titles it **Champion holds**. A won Champion's meter is lifted onto HEALTHY,
never onto OK.

## Consequences

- The OK band still draws at the Champion; prep's ladder prices it as a peel.
- An SLA promise of OK at the Champion can never pay, since an OK close there
  does not clear. It is left promisable rather than special-cased.
