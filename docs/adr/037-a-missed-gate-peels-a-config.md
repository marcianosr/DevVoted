# ADR-037: A missed gate peels a config and re-runs the loop

## Status

Accepted — 2026-08-17 (Marciano, DVTD-rxsk; Decision 1's flat peel replaced by a per-gate table the same day, DVTD-rdr5, after a playtest reached Rainbow and still only lost one config). Supersedes ADR-035 Decision 3 (the free redo) and narrows its Decision 4 (strips are no longer audit-owned). Amends ADR-021's death rule back toward its original shape: a run still dies when its build empties, but only ever at a gate it missed. ADR-036's git tag keeps its meaning and gains value, since deaths now start early.

## Context

The free redo made a miss weightless: the same gate dealt five fresh polls with the same build, so the only way to lose a run was to reach gate 11 and fail its audit. Marciano's objection was the short version of it — "how else are you dying?" — and the second half of the objection was about shape, not stakes: a retry that jumps straight back to the polls never passes the shop, so the player replays the attempt that just failed instead of buying a different one.

## Decision 1: a miss peels configs

Failing a gate takes configs off the pipeline and the player chooses which. The count is a per-gate table (`failStripsFor`, `rules.model.ts`) that escalates with depth, because width does too: a clear grants a slot, so one config is a third of an opening build and a fourteenth of a summit build. The rows hold roughly a quarter of `slotsForGatesCleared` at that depth, which keeps the death clock at three or four misses the whole way up.

| Gate | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Peel | 1 | 1 | 1 | 2 | 2 | 2 | 2 | 3 | 3 | 3 | 3 | 4 | 4 |

Strip audits add on top of the row rather than owning it, so Elite peels 5 and Champion 6 (`stripQuotaOnFail` is an extra; `failStripQuotaFor` in `gate.model.ts` owns the total). Every gate therefore costs a run something, and the death clock is the pipeline itself: keep missing and you keep shrinking.

## Decision 2: the run ends when the peel has nothing left to take

`isStakeFatal(quota, installed)` — a miss holding one config ends the run, and at a strip-audit gate it ends two configs earlier. The old bare-legacy guard folds into the same check. The receipt states both the peel and the fatal case before the player commits, so death is never a surprise; it is the one line on the receipt that shouts.

## Decision 3: a retry runs the whole post-gate loop

A missed gate goes strip → review → shop → prep → the same gate, which is the clear's loop minus the payout. Nothing new was built for it: `awaiting-strip` and `resume-climb` already routed that way for the strip audits. What changed is where resuming lands (the shop, not the community detour) and that a retry never reaches `/run/reward` — the reward screen is a "+KB, gate cleared" celebration and the gate it would name is the one just missed, so `routesForStatus` sends a `redoingGate` run to the shop instead. The failed attempt's own report is the strip screen: the pipeline, the bill, the retry's stake.

A failed attempt pays nothing (`gateRewardKb`, interest and extra-pick payouts all reset), so the retry's budget is the storage faucet earned inside the failed window plus whatever was banked. The storage bill still collects on every close, pass or fail.

## Consequences

- The demand table is unchanged, but its difficulty is not: a miss now costs configs, so the rows in `rules.model.ts` are the first thing to loosen if early gates read as punishing.
- A rescued run (ADR-036) is the sharp edge of the escalation: it opens deep, with a deep gate's peel, on a build of three starters plus whatever the stipend bought. The receipt says so in red, and the tag's price already assumes one careful gate; if playtests show the rescue dying on its first miss, the fix is the stipend, not the peel.
- Volkswagen CI gains an asymmetry worth knowing: it suppresses a gate's *first* audit, so at Elite it cancels the deepened peel, while at Champion it only stops the burn and leaves the strip in force.
- Beans: DVTD-eguq (debt cards as a strip replacement) and DVTD-ineo (partial reward on failure) stay scrapped — both were argued against the free redo, and neither returns with it gone.
- Open: whether repeated misses at the *same* gate should deepen the peel further — a spiral on top of the depth curve. Left out until playtests say the curve alone is too soft.
