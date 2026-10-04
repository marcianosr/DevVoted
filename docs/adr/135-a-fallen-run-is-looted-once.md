# ADR-135: A fallen run is looted once, by a run that is still climbing

## Status

Accepted — 2026-09-28 (Marciano, DVTD-545v). Narrows
[ADR-101](101-builds-are-open.md) D3: a live run may now take a payout off
another run's *storage*, but still never off another run's build.

## Context

When a run dies, `finishSessionRun` banks `gatesCleared / 13` of its storage to
`users.archived_storage`. The rest is written off, and the debrief names it
`run balance, lost`. Nobody gets it.

The community board already draws every run that died today, in a lane per gate,
with a card stating its gate, storage and build. The corpse, the figure and the
surface were all there; nothing could be taken off them.

DVTD-545v named three guard rails: only completed runs, in a pool fixed at a day
boundary; nothing already banked may be taken; and who you can loot may not vary
per player, because the seed is shared.

## Decision 1: the take is the unbanked remainder

`unbankedKb(held, gatesCleared) = held − round(held × gatesCleared / 13)` — the
arithmetic complement of the archive credit, and the same function the debrief
uses to print `lost`. One rule, two surfaces, so the two figures cannot disagree.

This satisfies the "never lose what you banked" rail **by construction** rather
than by a check: `users.archived_storage` is not read or written anywhere on the
loot path, and there is no second formula to tune out of agreement.

The richest corpses belong to the shortest runs, which is the right way round: a
deep run already got paid.

## Decision 2: only a live run may loot, and it loots into its own balance

The looter must hold an active session run. The take lands in `RunState.storage`,
spendable in the shop this gate, not in the archive.

That makes looting a run decision rather than a meta one: a corpse found at the
right moment pays for the draft you could not afford. A player whose run is over
has nothing to do here, which is correct, because the board is where you go
*between* gates.

## Decision 3: one taker per fallen run, no cap on the taker

First claim wins. A looted run is spent, and its card names who got there first.
One run may take any number of corpses: the race against the other live players
is the only constraint.

The pool is day-scoped and identical for everyone, so the race is fair in the
sense the shared seed requires: nobody is offered a corpse nobody else can see.

## Decision 4: the claim rides the run's own transaction

`dispatchRunActionService` already takes a `settle` hook that runs inside the
run's transaction. The loot service validates outside it, then claims inside it,
exactly as `fireAuditService` files an incident. The claim is a guarded update:

```sql
UPDATE runs SET looted_by_user_id = …, looted_at = …, loot_amount = …
WHERE id = … AND looted_by_user_id IS NULL RETURNING id
```

Zero rows means somebody else got there first; the throw rolls back the storage
credit with it. No ordering credits a looter without marking the corpse, or
marks the corpse without crediting the looter.

`loot_amount` is **KB**, matching `RunState.storage`. The column is a bare
`integer` and its name does not say so.

## Decision 5: loot is minted by the server, never sent by the client

`loot` is a `RunAction` and runs through the reducer like every other state
change, but it is deliberately **absent from `runActionSchema`**, the zod union
`dispatchRunAction` validates. A client that could post
`{ type: "loot", kb: 999999 }` could mint storage at will.

`run.validation.ts` carries a compile-time assertion that the schema covers every
action. It now excludes a named `ServerMintedAction` set, so a new action still
cannot be forgotten, and the carve-out has to be written down to be taken.

## Decision 6: the press lives on the fallen climber's card

Not a new panel. The climb map already draws fallen runs and opens a card on a
chip press; the loot press is one row on that card, under the standing block.
The figure rides the press (`Loot 67 KB`) per [ADR-123](123-a-card-states-a-figure-only-where-it-is-paid.md).

Three states, picked by the same `lootRefusalOf` the server validates with:
a press when the run is takeable and you are climbing, the bare figure
(`67 KB unbanked`) when it is not yours to take, and `looted by Misty · 67 KB`
once it is spent.

## Consequences

- `runs.looted_by_user_id`, `looted_at` and `loot_amount` come back into use.
  They survived from the old game with no readers, and DVTD-lzds listed them for
  deletion; that list loses those three rows.
- `ClimbFallen` carries `lootKb`, `lootedById` and `lootedByName`; the fallen
  read gains an aliased `users` join for the looter's name. `ClimbTodayView`
  gains a `viewer`, because who is reading changes what the card offers.
- A live run reads a completed run's storage. ADR-101 D2 already made storage
  public and D3's refusal of payouts off another run's *build* stands. What is
  new is that a figure the reader could already see now pays.
- The seed gives climbers storage. Before this, every seeded card read 0 KB.

## Rejected

- **Looting into the archive instead of the run.** Safer (no reducer change, no
  payout into a live run), but it turns a run decision into a meta drip and
  leaves nothing to decide at the moment you find the corpse.
- **Minting a flat bounty by gate reached** (`min(gate × 20, 100) KB`, what the
  old game shipped). It makes the deepest corpse the prize, but the figure has
  nothing to do with what the run held, and it needs its own balance pass the
  moment the economy moves.
- **Everyone loots every corpse once.** Non-rivalrous and fits DVTD-kgch's
  open-source framing, but it needs a claims table, and a take nobody can lose
  to anybody is a reward rather than a find.
- **Capping the looter at one take per run.** A real choice (grab this one or
  hold out for a richer one), rejected for now because it makes an empty board
  early in the day punishing to arrive at.
- **A "Fallen today" panel.** More discoverable than a press two interactions
  deep, but ADR-101 already refused a new community section for reading builds,
  and the same argument holds: the corpse belongs beside the person.
