# ADR-037: A missed gate peels a config and re-runs the loop

## Status

Accepted — 2026-08-17 (Marciano, DVTD-rxsk; Decision 1's flat peel replaced by a per-gate table the same day, DVTD-rdr5, after a playtest reached Rainbow and still only lost one config). Supersedes ADR-035 Decision 3 (the free redo) and narrows its Decision 4 (strips are no longer audit-owned).

**Dead, 2026-09-12 (DVTD-zu24): Decision 2.** A run no longer dies by emptying its build. [ADR-076](076-the-closing-band-decides-what-it-costs.md) owns what a gate does: PERFECT, HEALTHY and OK clear, SHAKY holds the gate and owes a peel the player can pay or refuse, DANGER ends the run outright. **Decision 1 survives, narrowed to SHAKY**, and the peel has a second trigger in [ADR-074](074-weight-is-what-the-build-costs-to-run.md) Decision 4: configs also come off when the build's upkeep is unaffordable. ADR-021's death rule is not revived by either, since refusing a gate banks the climb and a build peeled to nothing bills nothing.

**Live:** Decision 3, the loop a repeat runs, minus its strip step.

## Context

The free redo made a miss weightless: the same gate dealt five fresh polls with the same build, so the only way to lose a run was to reach gate 11 and fail its audit. Marciano's objection was the short version of it — "how else are you dying?" — and the second half of the objection was about shape, not stakes: a retry that jumps straight back to the polls never passes the shop, so the player replays the attempt that just failed instead of buying a different one.

## Decision 1: a miss peels configs

Live, narrowed to a SHAKY close ([ADR-076](076-the-closing-band-decides-what-it-costs.md) Decision 4); a DANGER close ends the run before any bill is drawn. The mechanism is unchanged, a quota the player pays in whole configs, their choice which, and ADR-076 Decision 6 prices that quota in KB so the archive can settle it instead. It fires a second way as well, from an unpayable upkeep bill ([ADR-074](074-weight-is-what-the-build-costs-to-run.md) Decision 4).

## Decision 2: the run ends when the peel has nothing left to take

Dead. A run ends by closing a gate in DANGER, or by the player refusing a SHAKY gate ([ADR-076](076-the-closing-band-decides-what-it-costs.md)), not by running out of configs to lose.

## Decision 3: a retry runs the whole post-gate loop

A repeated gate goes review → shop → prep → the same gate, which is the clear's loop minus the payout. It went through a strip screen too until the peel moved off the miss; that step is gone, and the attempt's report is the gate-clear debrief with an outcome that is not a clear. Nothing new was built for it: `awaiting-strip` and `resume-climb` already routed that way for the strip audits. What changed is where resuming lands (the shop, not the community detour) and that a retry never reaches `/run/gate` — the cleared verdict is a "+KB, gate cleared" celebration and the gate it would name is the one just missed, so `routesForStatus` sends a `redoingGate` run to the shop instead.

A failed attempt pays nothing (`gateRewardKb`, interest and extra-pick payouts all reset), so the retry's budget is the storage faucet earned inside the failed window plus whatever was banked. The storage bill still collects on every close, pass or fail.

Amended 2026-09-12 (DVTD-zu24): OK clears and is paid for the coverage it proved (ADR-076), so "a failed attempt pays nothing" now holds for SHAKY and DANGER, and DANGER ends the run. Amended 2026-09-05 (DVTD-2k9m): the *peel* can pay too. **Garbage Collection** refunds a dropped config's sell value (`peelRefundIn`, `strip.model.ts`), priced by the shop's own `sellRefundIn` so a peel is never a better price than a sale. Minifying to settle the same quota pays nothing, since the config stays installed. That refund follows the peel to its new trigger.

## Consequences

- Decision 3 is the only part of this ADR still standing, and it is the part nothing was built for: it reused `awaiting-strip` and `resume-climb`. With the strip gone from the miss path, the routing needs rebuilding rather than re-pointing.
- Volkswagen CI loses the asymmetry this ADR gave it. It suppressed a gate's first audit and so cancelled a deepened peel; with no peel on a miss there is nothing to cancel, and ADR-028's own terms are what is left.
- Beans: DVTD-eguq (debt cards as a strip replacement) and DVTD-ineo (partial reward on failure) were scrapped as arguments against the free redo. ADR-076's OK band pays for proven coverage, which is what DVTD-ineo asked for, so that one is worth reopening.
- Open, and inherited by ADR-076: whether retrying the *same* gate twice should cost more the second time. This ADR left the same question open about the peel.
