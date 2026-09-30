# ADR-153: The new run screen is the warm boot, where the archive buys a run's start

## Status

Accepted — 2026-09-29 (Marciano, DVTD-0now). Amends
[ADR-115](115-services-have-two-scopes.md) Decisions 1, 3 and 10,
[ADR-112](112-the-archive-carries-and-buys-appearance.md) Decisions 1 and 4,
and the status line of [ADR-036](036-the-git-tag.md). Rejects an archive-bought
weight slot a third time (see `rejected.md`).

## Context

The archive's only built sink is borders. ADR-115's run services were placed on
the profile, a page nothing links to, and none were built. Marciano asked for a
warm boot: spend the archive at the moment a run opens, on the screen where it
opens.

## Decision 1: the new run screen is where the archive buys a run's start

One panel on the new run screen, while the run is configuring. The picks are a
local draft; the start press commits them in one transaction with the guarded
archive debit. Once per run.

Why one press: the wallet stays whole until the player says go, and the moment
of the decision is the moment the run opens.

## Decision 2: Boot Cache is three rungs at two to one

| archive | banked as run storage |
| --- | --- |
| 128 KB | 64 KB |
| 256 KB | 128 KB |
| 512 KB | 256 KB |

Pick one. The banked KB is ordinary run storage and banks back at the outcome
rate like any other. The credit rate never exceeds one, so a round trip returns
half at best: injecting can never grow the archive. The top rung is about one
gate's payout, never a whole shop.

## Decision 3: a service is carried in, then pressed

Every service is unlocked once (ADR-116), carried into a run at new run for an
archive price or free, then pressed in the shop for run storage at its ladder,
or applied at the start. Rebuild, Skip shop and kill -9 carry free and need no
pick. Extend and the git tag carry now; Hot Reload, Return Policy and Docker
Image take a carry price when their presses ship.

New run lists only what is unlocked. A locked service is a row with nothing to
do, and the Dex already names the line that earns it. With nothing unlocked the
panel is not drawn.

The archive buys the right, not the use, so ADR-029 stands: the press still
competes with the configs on the table. ADR-115's two scopes collapse into this
one shape, and `scope` leaves the roster.

## Decision 4: a service not carried is named in the shop, without a press

The row keeps its glyph and detail; the price slot says where it is carried and
for how much. ADR-116 Decision 3's argument: a row you cannot read is a row you
cannot aim at.

## Decision 5: nothing buys width, a third time

Boot Cache buys width through rent, which is the brake ADR-044 and ADR-074
demand. A slot bought from the archive would skip that brake.

## Decision 6: the checkout of a planted tag is unchanged

This ADR decides how a run gets a tag to plant. What a fresh start does with a
tag already planted stays DVTD-ecnx.

## What this overrules, and what stands

Overruled: ADR-115 Decision 1's wallet split and "on the profile", Decision 3
as the tag's own shape, Decision 10's profile shelf; ADR-115's
`user_run_services` table, never built and no longer needed. ADR-112 Decision 4
now reads: nothing past the start action spends the archive.

Stands: ADR-116, ADR-036 Decisions 2 and 3, ADR-050 Decision 4 and ADR-051
Decision 1, ADR-082, ADR-112 Decisions 2 and 3.

## Consequences

- `RunState.warmBoot` records the storage banked, the services carried and the
  bytes paid. Old snapshots read it as absent.
- `warm-boot` is a server-minted action. `warmBoot.service.ts` builds it from
  the client's pick and the account's unlocks, and the guarded debit
  (`UPDATE users … WHERE archived_storage >= bytes RETURNING`) rides the
  dispatch transaction's settle seam, so a refused reducer never debits.
- The roster gains `carryBytes`; `CarriedServiceId` is derived from it, so a
  new carry price fails to compile until the Dex prices its press.
- The profile keeps borders only. The community milestone is a draft bean.
