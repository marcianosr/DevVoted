# ADR-054: Offer locks ship with yarn.lock

## Status

Accepted (2026-09-03, Marciano; DVTD-fkr2). Supersedes the Lock halves of
[ADR-029](029-shop-controls-three-horizons.md): Decision 1's Lock bullet,
Decision 4's Lock staging, and the one-at-a-time cap. Rebuild and Extend stand
unchanged.

## Context

Lock was a built-in shop control: from gate 2, 16 KB pinned one offer so rebuilds
skipped it and later shops led with it. DVTD-fkr2 offered three readings of the
yarn.lock idea; Marciano picked the strongest two together — locking moves behind
a config, at the rest-of-run horizon the code already implemented (ADR-029's
"reaches the next shop" title was stale against `finishReward`).

## Decision

1. **Locking requires yarn.lock in the build.** A new economy config, 1 slot,
   32 KB list price, `locksOffers: true`. `lockerFor` sits beside the other
   grant lookups in `build.model.ts`. `LOCK_FROM_GATE` is deleted, and with it
   gate 1's "lock" line in the Gates dex — the Gatedex `lock` action is gone.
2. **The fee stays: 16 KB a lock.** Legal under Pillar 3
   ([ADR-042](042-design-pillars-and-anti-pillars.md)): a fee on a chosen press,
   like Telemetry's peek — never a condition. DVTD-fkr2's per-use-fee objection
   predates that pillar's fee-on-actions reading.
3. **Locks are plural.** `MAX_LOCKED_OFFERS` is deleted. Each held offer
   occupies one shelf slot in every roll, so locking the whole shelf freezes it —
   the fee and the frozen shelf are the only brakes, both self-inflicted.
4. **Release is a free action** (`unlock-offer`) and refunds nothing: the 16 KB
   bought the holding up to that point. A released offer stays on the table this
   visit and stops leading the next roll.
5. **Locks live and die with the lockfile.** Selling, dropping, or a gate peel
   stripping yarn.lock releases every lock, no refund (`locksSurviving`). Without
   this, buy–lock–sell-back keeps the pins for a net 16 KB and the config never
   earns its slot.
6. **WTFPL still retires locking** (the `shopOffersFullRoster` clause stays), and
   a lock already held still leads the full catalog. yarn.lock is dead weight
   beside the license, which the shelf already communicates by hiding the padlock.

| Number | Value |
| --- | --- |
| yarn.lock | economy · 1 slot · 32 KB |
| `LOCK_COST_KB` | 16 KB a lock |
| Simultaneous locks | unbounded (the shelf bounds it) |
| Release / dissolve refund | 0 KB |

## Consequences

- A control every build had from gate 2 is now bought. The counterweight is what
  it buys: any number of pins instead of one, and a release press that never
  existed (ADR-029 had no unlock at all; modern-theme's "Release" control was
  orphaned design).
- The padlock press is a true toggle for the first time — pinned state was
  unreachable in production while `MAX_LOCKED_OFFERS` hid the affordance at 1.
- Wiki §2.8 loses gate 1's unlock; §5.2's Lock row now names yarn.lock.
