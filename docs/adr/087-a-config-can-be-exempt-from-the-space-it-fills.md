# ADR-087: A config can be exempt from the space it fills

## Status

Accepted (2026-09-15, Marciano, DVTD-5cut). Adds one config, `vendor-lock-in`,
and one distinction to the build: the weight a build carries and the weight it
is held to are no longer the same number. Supersedes nothing. Scraps DVTD-kf93
(`--save-exact`), which proposed the same unsellability drawback for a smaller
upside.

## Context

[ADR-042](042-design-pillars-and-anti-pillars.md) records a tension it could not
resolve:

> **3 vs build-craft**: if configs never demand anything, a config is pure
> upside and drafting is never a hard choice.

Thirty-seven configs in, every one is upside with a fee or a condition attached
to its own payout. Freemium bills you, Deprecated decays, Overclock throttles
after the opener. None of them costs the player an option. Drafting is therefore
a question of what you can afford, never of what you are willing to give up.

## Decision 1: one config in the build can stop counting against the rent

`vendor-lock-in` names one config in the build as the run's vendor. That config
keeps its weight and keeps paying its effect, but the space the build rents is
measured as though it were not there.

This is deliberately not a bill discount. [ADR-082](082-build-space-is-rented-by-the-gate.md)
made the bill a function of the rung held, and `settleUpkeep` never sees the
configs, so a per-config term could not reach it even if we wanted one. What the
exemption does is stop the locked config consuming the rung, which the player
banks by renting one rung lower or by fitting more into the rung they hold.

`occupiedSlots` keeps meaning total weight. A new `billableSlotsOf(build)` is
what `freeSlots`, `hasRoomFor`, `overflowSlots` and `isOverCapacity` measure, so
the shop exit door and `canStart` follow the exemption without a signature
change anywhere. The peel quota and audit 413's over-width burn keep reading
`occupiedSlots`: the locked config is still in the build, so it still counts
toward what a missed gate can take.

## Decision 2: the price is paid in flexibility, and nothing else

The locked config cannot be sold or dropped for the rest of the run. No KB
changes hands beyond the install price.

This passes pillar 3's test ("if a cost must sit on a config, it is a fee on a
chosen action, never a condition") because the lock is the fee on a chosen
action: the player names the target, once, at install. Nothing is asked of them
afterwards, and no gate reads the lock.

It satisfies pillar 2 by wearing the consequence: the pick states what it costs
before it commits, the locked chip carries a visible `locked in` badge for the
rest of the run, and its uninstall press is gone rather than silently inert.

## Decision 3: no cap, because its own weight is the cap

`vendor-lock-in` is 4 weight at the standard price. Its own weight sets the
break-even, so the exemption needs no artificial ceiling:

| Locked config | Weight without it | Weight with it | Net |
| --- | --- | --- | --- |
| 2 | 2 | 4 | worse by 2 |
| 4 | 4 | 4 | nothing |
| 8 | 8 | 4 | saves 4 |
| 16 | 16 | 4 | saves 12 |

It only pays on a config heavier than itself, which is the decision the config
exists to pose: the thing worth exempting is the thing you would least like to
be stuck with. Numbers live in `configRoster.model.ts` and the rung ladder in
`rules.model.ts`.

## Decision 4: it cannot lock itself

Self-targeting would be four free weight for the install price with no option
given up, which is the purchasable free weight ADR-082 retired when it deleted
the free-weight subscription as "two ways to buy the same thing". This config is
not a third way to buy room: it is not priced by the KB, it rides one config, it
is bounded by that config's size, and it is paid for in flexibility. The retired
`freeWeightOf` and `upkeepAt` names are not revived.

## Decision 5: a forced drop is not a sale

A peel can still take the locked config. The config promises that you cannot
sell or drop it, and a peel is neither; it is what a missed gate takes from you.
Keeping the peel out of the promise also means no guard sits in the peel path
and no build can be stranded by one.

Every removal clears the lock rather than leaving the id dangling, and that
prune lives inside `withBuild` and `stripConfig` rather than at each call site,
so the engine's own removals (a decayed config, a lapsed subscription) stay
honest without knowing the lock exists. Selling `vendor-lock-in` itself clears
the lock too, which is the player's way out: the target becomes billable again,
and if that puts the build over its rung the shop door holds them until they fix
it.

## Consequences

- `Build` gains `vendorLockedConfigId`. It lives on `Build` and not on the
  `Config` instance because `refreshConfig` rebuilds every build config from the
  roster on hydration and preserves only `level`, so a flag on the instance
  would not survive a round trip. It persists with no migration, since
  `toRunSnapshot` spreads the build whole.
- The same hydration rule means `minified`, `abArm` and Deprecated's decayed
  multiplier are reset on every hydration. Only Deprecated's decay is reachable
  in the live game today. That is a bug this ADR does not fix.
- A build's carried weight and its billable weight can now differ. Any new code
  measuring "does this fit" must read `billableSlotsOf`, not `occupiedSlots`.
- `full-build-clear` now fires on billable space rather than carried weight.
- The unlock roster gains `configs-vendor-locked`, a counter on an existing run
  action, per ADR-051's rule that a metric costs only its counter row.
