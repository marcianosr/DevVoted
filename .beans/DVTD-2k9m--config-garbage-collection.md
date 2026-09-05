---
# DVTD-2k9m
title: 'Config: Garbage Collection'
status: completed
type: task
priority: normal
tags:
    - config
created_at: 2026-08-15T13:55:00Z
updated_at: 2026-09-05T08:08:44Z
parent: DVTD-72d9
---

Peeled configs pay sell value

## Summary of Changes

Built as **Garbage Collection** (2 slots, 64 KB): every config you *drop* to settle a peel
refunds its sell value.

### Decisions taken with Marciano
- **Only a drop pays.** `minifyForPeel` refunds nothing, which turns the two ways of paying
  a peel into a real choice (keep half the effect, or take the money) instead of a formality
  where minify was near-strictly better.
- **Priced by `sellRefundIn`**, read against the build *before* the config leaves it, so a
  peel is never a better price than a shop sale. WTFPL zeroes it, Freemium halves it, free.
- **Flat, non-upgradable.** Deliberately out of `isUpgradable`.
- **Pays for its own removal.** WTFPL's "its own included" precedent.
- Accepted balance risk: it pays 0 KB in a clean run. Pure insurance. If playtest says the
  slots are wasted, turn the rate, not the mechanic.

### Engine
- `Config.refundsPeeledConfigs` + roster entry appended **last** (`run.factory.ts` and
  `seedCommunity.ts` both `.slice(0, n)` the roster, so mid-list insertion rewrites fixtures).
- `peelRefundIn(configs, config)` in `strip.model.ts` — sums collectors so a second would
  stack, and halves for a minified collector via `minifiedAmount`.
- `paid()` gained an optional 5th `refundKb` arg defaulting to 0, so `minifyForPeel` is
  unpaid *by omission* rather than by a branch.
- `RunState.peelRefundKb`, opened at 0 in `answer.model.ts`'s awaiting-strip branch and reset
  in `resumeClimb`. Persists free: `RunSnapshot = Omit<RunState, "polls">`.
- New `SkipReason` `paysOnPeel` + both copy tables.

### Two engine facts found while building
1. **`addStorage(x, 0, tier)` is not a no-op** — it re-clamps to the plan cap. Without the
   `refundKb === 0` guard, minifying to pay a peel would burn an over-cap balance on an
   action that never touched money. Covered by a named test.
2. **A build holding this config can never die to a peel.** `isPeelFatal` is
   `ceil(occupied * share) >= occupied` and share tops out at 0.5, so only a one-slot build
   is ever fatal — and this config fills two. A fatal miss also returns `dead` *before*
   `awaiting-strip`, so nothing refunds on the miss that ends a run. Both are tests.

### UI
Strip screen quotes what dropping each config pays next to its remove button (new
`removalPrice` on `BuildReportRow`; `note` is swallowed by `detail` and `trailing` is
unreachable on a removable row). The collector's own row totals what the peel recovered, and
reports `skipped` rather than `kb(0)` so a cleared gate does not print "+0KB".

Known hole, accepted for v1: dropping the collector itself pays, then its row leaves with it,
so the running total vanishes. The HUD balance ticks up live and the log records the amount.

### Verified
3308 tests pass (210 files), `tsc --noEmit` clean, oxlint + dependency-cruiser clean (902
modules). 3 failures in `src/ui/modern-theme/screens/RewardScreen.spec.tsx` are **pre-existing**
from uncommitted WIP in `modern-theme/format.ts` — proved by dependency-cruiser: zero of the 21
modules reachable from that spec is a file this bean touched. Uncommitted per house rule.

### Deferred
- `runSnapshot.model.ts`'s `refreshConfig` drops `minified` and `abArm` on hydrate (keeps only
  `level`), so a minified config returns full-size after a reload. Pre-existing, affects every
  config, wants its own bean.
- `src/ui/modern-theme/screens/RemovalScreen.ui.tsx` still says the peel happens "without the
  uninstall refund" as a flat rule. Superseded island, only mounted by `/proto-run`.
