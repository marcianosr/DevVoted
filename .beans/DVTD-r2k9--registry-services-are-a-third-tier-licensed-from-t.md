---
# DVTD-r2k9
title: 'Services have two scopes: the registry''s and the run''s'
status: todo
type: epic
priority: normal
created_at: 2026-09-24T18:25:34Z
updated_at: 2026-09-25T11:00:14Z
parent: DVTD-z2r2
---

**What:** The shop's non-config purchases are services in two scopes: registry services bought in the shop with run storage, and run services bought once per run from the archive before the run starts.

**Why:** Two tiers were doing three jobs, and a licence bought a permanent right that saturates once every one is owned.

⚠️ 2026-09-25: the licence model this bean was created for is dead (ADR-115 replaced ADR-110). The Notes keep it for the reasoning. The children are the checklist.

## Notes

### Reversed 2026-09-25 (ADR-115)

- Registry services, bought in the shop with run storage, repeatable: Rebuild, Skip shop, Extend, Hot Reload (replace one offer), Return Policy, Repackage.
- Run services, bought once per run from the archive before the run, consumed with it: Boot Cache, Docker Image, git tag (deposit before the run, placement in the shop for run storage).
- The player-facing word is services; the code keeps control.
- Children: DVTD-jscc, DVTD-0now, DVTD-plrc, DVTD-2l5k, DVTD-r2fg, DVTD-rte1, DVTD-8as9, DVTD-oc69.

### The licence design (2026-09-24, superseded)


**What:** A third kind of thing in the shop — a temporary change to the terms of one registry visit, licensed permanently from the archive and equipped one at a time before a run.

**Why:** The archive only ever goes up, and two tiers are doing three jobs.

## Done when

- The four tiers are written down, each differing on availability, duration and cost
- A licence is bought on the profile and equipped before a run starts
- A service turns up once a climb, and rebuilding cannot fish for it
- The controls heading is plural, and a services panel renders only when it holds something
- The dex names both tiers side by side, each with its cost and how long it lasts
- Three services are designed, priced, and none of them hand over value for free

## Notes

### The taxonomy

| Tier | Availability | Duration | Cost | Takes weight |
| --- | --- | --- | --- | --- |
| Config | rolled among five offers | until sold or lost | draft price + upkeep | yes |
| Control | always, after its gate opens | immediate, reusable | run storage | no |
| Service | licensed, then under special conditions | one visit or one use | varies | no |
| Licence | bought on the profile | permanent | archived storage | no |

One line each: the registry sells configs, controls manipulate the registry,
services temporarily change the terms of one registry visit, and licences are
the meta unlocks that let a service be brought into a run.

Each row differs on *all three* of availability, duration and cost. That is the
same test the three control horizons were held to: rows that vary on one axis
only are one mechanic wearing several prices.

### One licence equipped, never a pool

Spend archived storage to own a licence forever. Before a run, equip one. Its
service becomes available once during that climb. The licence is never consumed;
a service may still charge run storage when used.

If every owned licence entered a shared random pool, buying a second would lower
the odds of seeing the first, so collecting would punish itself. Equipping means
you know what you brought, and only *when* it turns up is unknown.

### The profile sells, the dex states the price

Everything permanent is bought on the profile, which today stocks only borders
and which nothing links to. The dex's controls tab becomes a **shop** tab with
two panels and two footers, because the footers are exactly where the tiers
differ:

```
SHOP

CONTROLS                         met 1 of 3
Rebuild the registry
???
???

SERVICES                     licensed 2 of 3
Hot Reload                       licensed
Return Policy                    licensed
???                              512 KB archive
```

- Controls open through gate progress, cost run storage, and are never owned
  between runs.
- Services are permanently licensed from the archive. Equip one before a run; it
  becomes available once during that climb.

The dex states a licence's price and requirement but never sells one: no dex tab
has ever sold anything, and a control you have not reached is already withheld
there rather than priced.

### Where the appearance is rolled

Pick the eligible gate once at run start, from the run's own seed — never from
the seed the offers roll off, which counts rebuilds. Rebuilding starts at 4 KB,
so anything rolled off that seed can be fished for with a cheap press. The
mystery-offer bean found this first and reached the same answer.

Picking once at run start also keeps the shop derived state, so a rehydrated
snapshot reproduces the shop the player left.

### A panel renders only when it holds something

No "nothing today" furniture. The mystery-offer bean has the same open question
for its own section; this answers both.

### The three services

**Hot Reload — every fifth rebuild in a visit is free.**

A flat free rebuild has been refused three times, and all three refusals land on
the same thing: value handed over with nothing traded for it. A rebate is
different. Reaching the fifth press costs 4 + 8 + 16 + 32 KB of run storage that
could have bought a config, so the licence hands over nothing — it changes the
shape of a decision the player paid their own way into. And a coupon is spent at
the moment of your choosing, whereas this pays only a player already deep in a
ladder that doubles, which is exactly where rebuilding stops being affordable.

**The free press must not reset the ladder.** Free, then back to 4 KB, is an
unbounded loop of cheap rerolls. The press costs nothing and the count still
advances, which makes the service self-limiting: a second free press would sit
behind 128 + 256 + 512 KB, so in practice it is one free rebuild a visit.

Per visit, not per run — the count already resets each shop, and a run-long
loyalty counter would be the config row wearing a licence.

**Return Policy.** The next config installed may be returned at full price
before this registry visit closes.

**No Dependencies.** Accept it before doing anything else, then leave without
another registry action to be paid. Pays only on completion.

### What is deliberately not here

- **Repackage stays a control**, as already decided on the sealed-audit bean:
  flat 32 KB, once a shop, opened audits only. A licence gate would make a bad
  audit roll unfixable for any run that did not bring the licence.
- **Nothing here buys a config.** Unlocks stay achievement-only and storage
  still never buys one. A licence is not a config grant, and the decision record
  says so out loud rather than leaving a reader to infer it.
- **A licence does not open a run wider.** Width is rented by the gate; that
  stands untouched.

### Open

- A fourth service, if the roster should match the controls at four rather than
  three.
- **Hot Reload is probably the wrong name now.** It was chosen when the service
  was a free rebuild; as a rebate on the rebuild ladder it is not hot-reload
  shaped at all. DVTD-ecyi holds the same name for a config that swaps a config
  into a live pipeline mid-window, which is what the term actually means, so its
  claim is the stronger one. The service wants a name about buying from the
  registry cheaply. Not renamed unilaterally.
- Whether the dex row for an unlicensed service shows its price, its
  requirement, or both.

### Build order

1. The controls heading goes plural, and the shop gains a services panel that
   renders only when occupied.
2. The service roster: one table, read by both the shop and the dex, the way the
   control roster already is.
3. The dex tab becomes shop, with two panels, two counts and two footers.
4. Licences: the owned-many-equip-one shape, bought on the profile against
   archived storage.
5. The three services, one at a time.

### Reuse, so the design work is not repeated

- `RegistryControl.ui.tsx` already carries the exact row a service needs — glyph,
  title, detail, price badge, `refusal`, `layout="row"`. The service row differs
  only in that the badge reads `Activate · 16 KB`. Do not write a second row
  component.
- `registryControl.model.ts` is the roster shape to copy: one
  `as const satisfies Record<Id, Spec>` table read by both the shop and the Dex,
  as `CONTEXT.md` records. Suffix stays `.model.ts`, so no collision with
  ADR-002's reserved `.service.ts`.
- `controldex.model.ts`'s union is the Dex row shape — its unmet arm carries
  `control?: never`, so an unreached row cannot leak its name. The service
  version is three-state: `licensed | unlicensed | unmet`.
- `user_titles` is the ownership precedent: owned rows in a join table plus one
  `equipped_*_id` pointer on `users` (ADR-109). Of the codebase's four ad-hoc
  permanence patterns it is the only owned-many-equip-one.
- Rebuild `debitArchivedStorageGuarded`. DVTD-lqjt preserves its exact shape and
  its reasoning: a guarded `UPDATE … WHERE archived_storage >= bytes` is atomic
  under READ COMMITTED, so there is no TOCTOU race and no SELECT-then-UPDATE.
- `upgradeOfferFor` in `draft.model.ts` is the rate-roll pattern — its own salt,
  its own one-in constant, the rate left as a playtest dial.
- Hot Reload's free press is a zero case on `rebuildCost(rebuildsUsed)`
  (`draft.model.ts`, the `[4, 8, 16, 32, 64, 128, 256, 512]` ladder), not a new
  reducer. The count still increments, so `finishReward`'s existing reset keeps
  working.
- Units. Run storage is KB; `archived_storage` and `border.cost` are bytes;
  `peak_storage_kb` is KB. Licence prices go in bytes beside the borders
  (256 KB – 32 MB). The conversion point is `run.repository.ts`.

### Related

- DVTD-lqjt asks whether the archive needs a sink. This answers it, with a sink
  that is not width.
- DVTD-8kiu asks whether the profile ever sells in-run power. This answers it
  yes, and gives that page its second shelf.
- DVTD-trc0 shares the render-only-when-occupied rule and the
  exclude-the-rebuild-count-from-the-seed rule.
- DVTD-406l keeps Repackage as a control.
- DVTD-st9e would add a fourth row to the taxonomy if a "Next run" section lands.
