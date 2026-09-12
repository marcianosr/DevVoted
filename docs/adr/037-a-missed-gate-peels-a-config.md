# ADR-037: A missed gate peels a config and re-runs the loop

## Status

Accepted — 2026-08-17 (Marciano, DVTD-rxsk; Decision 1's flat peel replaced by a per-gate table the same day, DVTD-rdr5, after a playtest reached Rainbow and still only lost one config). Supersedes ADR-035 Decision 3 (the free redo) and narrows its Decision 4 (strips are no longer audit-owned).

**Dead, 2026-09-12 (DVTD-nd6r): Decisions 1 and 2.** A miss no longer peels and no longer kills. [ADR-071](071-the-closing-band-decides-the-gate.md) owns what a gate does: only HEALTHY advances, OK and SHAKY repeat the gate on five fresh polls, DANGER ends the run outright. The peel itself survives with a different trigger, in [ADR-074](074-weight-is-what-the-build-costs-to-run.md) Decision 4: configs come off when the build's upkeep is unaffordable, not when a gate is missed. ADR-021's death rule is not revived by that, since a build peeled to nothing bills nothing and so can always pay.

**Live:** Decision 3, the loop a repeat runs, minus its strip step.

## Context

The free redo made a miss weightless: the same gate dealt five fresh polls with the same build, so the only way to lose a run was to reach gate 11 and fail its audit. Marciano's objection was the short version of it — "how else are you dying?" — and the second half of the objection was about shape, not stakes: a retry that jumps straight back to the polls never passes the shop, so the player replays the attempt that just failed instead of buying a different one.

## Decision 1: a miss peels configs

Dead. [ADR-071](071-the-closing-band-decides-the-gate.md) owns what a missed gate does. The peel's mechanism — a quota the player pays in whole configs, their choice which — moves to [ADR-074](074-weight-is-what-the-build-costs-to-run.md) Decision 4, where an unpayable upkeep bill fires it.

## Decision 2: the run ends when the peel has nothing left to take

Dead. A run ends by closing a gate in DANGER ([ADR-071](071-the-closing-band-decides-the-gate.md)), not by running out of configs to lose.

## Decision 3: a retry runs the whole post-gate loop

A repeated gate goes review → shop → prep → the same gate, which is the clear's loop minus the payout. It went through a strip screen too until the peel moved off the miss; that step is gone, and the attempt's report is the gate-clear debrief with an outcome that is not a clear. Nothing new was built for it: `awaiting-strip` and `resume-climb` already routed that way for the strip audits. What changed is where resuming lands (the shop, not the community detour) and that a retry never reaches `/run/reward` — the reward screen is a "+KB, gate cleared" celebration and the gate it would name is the one just missed, so `routesForStatus` sends a `redoingGate` run to the shop instead.

A failed attempt pays nothing (`gateRewardKb`, interest and extra-pick payouts all reset), so the retry's budget is the storage faucet earned inside the failed window plus whatever was banked. The storage bill still collects on every close, pass or fail.

Amended 2026-09-12 (DVTD-nd6r): OK and SHAKY are paid for the coverage they proved (ADR-071), so "a failed attempt pays nothing" now holds for DANGER alone, and DANGER ends the run. Amended 2026-09-05 (DVTD-2k9m): the *peel* can pay too. **Garbage Collection** refunds a dropped config's sell value (`peelRefundIn`, `strip.model.ts`), priced by the shop's own `sellRefundIn` so a peel is never a better price than a sale. Minifying to settle the same quota pays nothing, since the config stays installed. That refund follows the peel to its new trigger.

## Consequences

- Decision 3 is the only part of this ADR still standing, and it is the part nothing was built for: it reused `awaiting-strip` and `resume-climb`. With the strip gone from the miss path, the routing needs rebuilding rather than re-pointing.
- Volkswagen CI loses the asymmetry this ADR gave it. It suppressed a gate's first audit and so cancelled a deepened peel; with no peel on a miss there is nothing to cancel, and ADR-028's own terms are what is left.
- Beans: DVTD-eguq (debt cards as a strip replacement) and DVTD-ineo (partial reward on failure) were scrapped as arguments against the free redo. ADR-071's OK band pays for proven coverage, which is what DVTD-ineo asked for, so that one is worth reopening.
- Open, and inherited by ADR-071: whether repeating the *same* gate twice should cost more the second time. This ADR left the same question open about the peel.
