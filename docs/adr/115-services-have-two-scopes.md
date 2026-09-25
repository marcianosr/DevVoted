# ADR-115: Services have two scopes, the registry's paid by the run and the run's paid by the archive

## Status

Accepted — 2026-09-25 (Marciano, DVTD-r2k9). Replaces
[ADR-110](README.md#retired), which is deleted. Amends
[ADR-112](112-the-archive-carries-and-buys-appearance.md) Decision 1 and
[ADR-036](036-the-git-tag.md) Decision 1. Overrules
[ADR-029](029-shop-controls-three-horizons.md)'s rejection of account-level
rerolls for run services only. Amended 2026-09-25, later the same day
(DVTD-lm8p, DVTD-bh9d): Decision 10 puts every service in one catalogue
surfaced by context, Decision 11 makes abandoning a service.

## Context

ADR-110 gave the shop a licensed third tier: a service bought forever from the
archive, one equipped per run, and Hot Reload as a rebate on the fifth Rebuild.
ADR-112 Decision 1 then wrote down that the archive never buys power. One noun
and two scopes replace both: nothing is licensed or equipped, and the archive
buys the run scope once per run, before the run.

## Decision 1: two scopes, one roster

| Scope | Bought where | Wallet | Available | Lasts | Repeatable |
| --- | --- | --- | --- | --- | --- |
| Registry service | in the shop | run KB | once unlocked (ADR-116), then once its gate opens | the visit, the run, or one placement | yes, at its ladder |
| Run service | before the run, on the profile | archived KB (bytes) | once unlocked (ADR-116), any account with the balance | consumed with the run | once per run |

Registry services: Rebuild, Skip shop, Extend, Hot Reload, Return Policy,
kill -9 (Decision 11), Repackage (DVTD-406l, unchanged). Run services: Boot
Cache, Docker Image, git tag. Configs are untouched.

One roster table carries a `scope` field and, since Decision 10, a `soldIn`
field; the shop and the Dex both read it, and nothing else in code tells the
scopes apart.

## Decision 2: a run service is consumed with the run

Bought once from the archive, before the run. Gone at run end, used or not.
A right that outlives the run is the licence again, and licences saturate once
every one is owned.

## Decision 3: the git tag is a run service, deposit then placement

A flat archive deposit before the run carries one unplaced tag in. Placing it
at a gate 4 to 10 shop charges `pinCostFor(gate)` from run storage, as today,
and burns on use (ADR-036 Decisions 2 and 3 stand). The placement price is the
tag's worth; the deposit is the right to hold one.

**A run that did not bring one is never sold a tag.** A first run with an empty
archive has none. The deposit is priced knowing that.

## Decision 4: Skip shop pays for leaving the Registry untouched

From the first shop, beside Rebuild. Leaving with no registry action pays a
flat `SKIP_SHOP_KB`; the first registry action of the visit locks it. The
payout sits below the cheapest draft so it never beats buying.

## Decision 5: Hot Reload replaces one chosen offer, for run KB

Not a rebate. Its price is a dial with one constraint: never below Rebuild's
current rung, or a targeted reroll dominates the full one.

DVTD-ecyi holds the same name for a draft config. Recommendation: the service
keeps it, because swapping one module while the rest keeps running is what the
term means. Settled in that bean.

## Decision 6: Return Policy refunds the last config installed this visit

Full draft price back, for run KB, until the shop closes.

## Decision 7: Boot Cache and Docker Image

Boot Cache adds starting run KB. It is a straight stipend and knowingly
overrules DVTD-8ty4's "never a straight upgrade" rule for this one row; that
rule now covers granted packages only.

Docker Image guarantees one config from the previous finished build among the
first shop's offers, at its normal price. An offer, never a grant.

## Decision 8: the word is "services"; the code keeps "control"

The player sees services: Dex tab, panel headers, "Unmet service", wiki,
glossary. Code keeps `RegistryControl*`, `controldex`, `shopControls` and the
tab id `controls`. ADR-002 reserves `.service.ts` for application
orchestration, and a `registryService.model.ts` beside `archive.service.ts`
would give one suffix two meanings.

## Decision 9: kept from ADR-110

A panel renders only when it holds something. The profile sells and the Dex
states; no Dex tab has ever sold anything. One roster table, read by both.

## Decision 10: one catalogue, surfaced by context

Players are not asked to learn registry services and run services as two
systems. Where a service is bought is a roster fact, `soldIn: "shop" |
"archive"`: the shop lists the registry services and the tag's placement, the
profile lists Boot Cache and Docker Image, and the Dex lists all of them in one
section, each row naming where it is bought and how long it lasts, then its
price or the line that earns it. Filter chips only if the roster passes twenty;
eight does not need them.

An earned service enters the roster when its counter ticks, so the ledger
starts counting; a starter enters when its press exists. An earned service
nobody sells yet reads "not for sale yet".

## Decision 11: abandoning is the service kill -9

A registry service with no price: earned once per account by clearing gate 5,
then in every shop. Two presses, the first arming the row, the second ending
the run. It banks nothing (ADR-036's abandon rate stands) and the next run
starts fresh the same day. SIGKILL is the name because no cleanup runs.

## What this overrules, and what stands

Overruled: ADR-110 whole. ADR-112 Decision 1's "never buys power". ADR-029's
rejection of account-level rerolls, for run services only; a registry service
is still paid by the run it competes in. DVTD-8ty4's rule, for Boot Cache.

Stands: ADR-050 Decision 4 and ADR-051 Decision 1 (nothing buys a config),
ADR-082 (nothing buys width), ADR-112 Decisions 2, 3 and 4 (balances carry,
the top-up, nothing inside a run spends the archive), ADR-036 Decisions 2
and 3.

## Consequences

- A bought-not-yet-started run service lives in a `user_run_services` table
  `(user_id, service_id, bought_at, consumed_by_run_id nullable)` with a partial
  unique index on `(user_id, service_id) WHERE consumed_by_run_id IS NULL`. A
  purchase precedes the run, so it cannot key on `run_id`; one waiting row per
  service is "once per run" enforced by the database. `createRun` consumes
  waiting rows before creating, the `consumePinnedGate` precedent, and stamps
  what it consumed into the snapshot.
- The archive debit rebuilds the guarded `UPDATE … WHERE archived_storage >=
  bytes` DVTD-lqjt kept. `purchaseBorderTx` does SELECT-then-UPDATE today and
  is not the model to copy. Run-service prices are bytes beside `border.cost`;
  Boot Cache's grant is KB.
- Skip shop needs "interacted this visit": `rebuildsUsed`, `soldThisShop` and
  `draftedThisGate` already reset per visit in `finishReward`; locks, extends,
  upgrades and planting need a per-visit marker.
- DVTD-st9e's "Next run" section, paid with run KB, is not a shape this ADR
  has. git revert is a run-service candidate. No Dependencies became Skip shop.
- The roster carries `scope` and `soldIn`. The Dex listed the scopes as two
  panels for a day and now lists every service in one section (Decision 10).
