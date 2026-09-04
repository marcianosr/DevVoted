# ADR-053: Upgrades appear on the shelf, and A/B arms switch mid-poll

## Status

Accepted 2026-09-03. Amends [ADR-039](039-every-upgrade-costs-storage.md) (the
Upgrade press is no longer the only way to buy a version) and reverses the
shop-only switch cadence recorded in `DVTD-p5kx`.

## Context

A playtest pass over the terminal-theme run screens turned up one shape twice:
the game computes something and then withholds it. The shop's Upgrade press was
the only purchase bought blind — no statement of what the next version does, and
a disabled press gave no reason even though the shortfall string was already
built one function away. The A/B Test config had the mirror problem: both arms
are legal all run, but the switch was only reachable in the shop, so a poll in
the wrong category was unanswerable at the arm you would have picked.

## Decision

1. **An upgrade states what it buys, before it is bought.** `upgradePreview`
   diffs `levelUp(config)` against the config through the five level accessors
   and returns one `from → to` chip per axis that actually moves (`1.25× → 1.5×`,
   `+32KB → +64KB`, `+2% → +4%`, `1 in 6 → 1 in 5`, and a worded chip for the
   peek's sample size). Arming an upgrade replaces the row's detail with the
   v-next sentence from `describeConfig(levelUp(config))`. The chips already had
   a renderer; what was there was a placeholder `v1 → v2`, which restates the
   badge next to it and says nothing about the effect.
2. **A disabled Upgrade names its own requirement.** `upgradeShortfalls` already
   produced "Unlocks at 5% Java coverage, you have 0%."; it now reaches the
   press as `reason` and rides in the button's hint. Before, the string was only
   attached to the armed state, which is unreachable precisely when there is a
   shortfall — the requirement existed and could never be read.
3. **Config rows read at the version they are running.** Every shop row and
   offer detail is `describeConfig(config)` rather than the roster's static
   `description`, which is written at level 1. A `.js` upgraded to v2 said
   "pay 1.25× coverage" while paying 1.5×.
4. **The shelf can offer a version of something you own.** `rollDraft` replaces
   one rolled offer with `levelUp(pick)` for a seeded pick among the build's
   upgradable configs, roughly one shop in eight. Buying it swaps the installed
   config for the levelled one at the shelf price: no second slot, and **no
   category coverage requirement** — that waiver is the whole reason to take it
   over the shop's own Upgrade. An owned config can appear on the shelf *only*
   this way; a plain re-buy stays impossible. Upgrade offers cannot be locked
   for the next shop, because a lock re-resolves offers by id from the roster
   and would silently hand back a v1.
5. **A/B Test switches during a poll, and the switch scores that poll.**
   `switch-arm` is accepted while answering as well as rewarding. `switchArm`
   already rewrote the live effect fields, so the answer given after the press
   scores on the new arm with no pending-arm state to model. Per-poll optimising
   is the payoff for the config's two slots: each arm is priced at or below its
   one-trick specialist, so the player is buying optionality, not power.
6. **One KB formatter, and it converts.** `kbLabel` moves to
   `~/shared/lib/storage`; the seven Tier-2 copies of ``const kb = (v) => `${v} KB` ``
   are gone. The shop printed "1024 KB" directly above a storage plan that
   printed "1 MB" for the same quantity.

## Numbers

| Rule | Value |
| --- | --- |
| Upgrade offer frequency | ~1 shop in 8 (`UPGRADE_OFFER_ONE_IN`) |
| Upgrade offer price | the config's normal shelf price (`draftCostIn`) |
| Upgrade offer coverage requirement | none |
| Offers replaced by an upgrade | 1, never a locked one |
| A/B switch cost | free, unlimited, `answering` or `rewarding` |

## Consequences

- The coverage requirement (`upgradeCoverageRequired`) still governs the shop's
  Upgrade press. The shelf is a rare bypass, not a replacement, so it must stay
  rare: too common and the requirement stops meaning anything.
- `UPGRADE_OFFER_ONE_IN` is a flat rate. Scaling it by gate depth or build size
  is open; the spec pins only determinism and owned-only, so the rate can move
  without touching the offer plumbing.
- `RunState` now records `storageBeforeClearKb` at the clear. It is recorded
  rather than derived because both `addStorage` and `cappedStorage` clamp at the
  plan cap, so subtracting the payout back off the balance is wrong exactly when
  a gate overpaid the ceiling.
- WTFPL builds see no upgrade offers: the license already promises the whole
  catalog, and the roll it short-circuits is where the swap happens.
