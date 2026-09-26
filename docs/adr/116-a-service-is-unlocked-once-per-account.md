# ADR-116: A service is unlocked once, per account

## Status

Accepted — 2026-09-25 (Marciano, DVTD-k59a). Amends
[ADR-115](115-services-have-two-scopes.md) Decision 1 on availability. Reverses
the Reveal-only stance DVTD-2try and DVTD-8zb3 took for the shop's verbs.
Decision 3 amended 2026-09-25, later the same day (DVTD-lm8p): a locked
service is named, not redacted.

## Context

ADR-115 made every service a fixed row the moment its gate opened. Two beans had
kept the shop's verbs Reveal-only, because the player who keeps dying at gate 3
is the one who needs Extend. Marciano's note of 2026-09-25 asked for services as
unlockables, redacted until earned with a line saying how, and this ADR records
that choice.

## Decision 1: one objective per service, on the ledger configs already use

| Service | Unlock | Built |
| --- | --- | --- |
| Rebuild | starter | yes |
| Extend | Reach Cascade for the first time | yes |
| Hot Reload | Rebuild the Registry 5 times | counter yes; press DVTD-r2fg |
| Return Policy | Sell 5 drafted configs | counter yes; press DVTD-rte1 |
| kill -9 | Clear gate 5 | yes |
| git tag | Reach gate 4 | yes |
| Boot Cache | Bank at least 256 KB from one run | counter yes; purchase DVTD-0now |
| Docker Image | Finish a run with one starting config still installed | counter yes; purchase DVTD-0now |

The captions the rows state are shorter than this table (`Reach Cascade`, `Bank
256 KB in one run`), since they sit where a price does.

Objectives use ADR-051's closed metric set. Depth needed a metric of its own,
`reached-gate:N`, incremented for every gate a clear reaches: `gates-cleared`
sums across runs and cannot say how deep one climb went. Boot Cache and Docker
Image use two one-shot run-end metrics, `banked-256-one-run` off the archive
credit and `finished-holding-a-dealt-config` off the dealt hand, which
`RunState.available` keeps unchanged for the whole run.

## Decision 2: the grant is a row

`user_service_unlocks` has the shape of `user_config_unlocks` and is written by
the same seam, in the same transaction as the action that crossed the target.
A starter service has no row; the roster says it is everyone's. No backfill
(ADR-051): the ledger starts now.

## Decision 3: locked means named, with the line that earns it

The shop and the Dex both show a locked service in its roster place, named,
with `?` for its glyph and `unlock · <objective>` where its price would go, and
no press. The Dex is a catalogue, and a name you cannot read is a row you cannot
aim at. The Dex no longer derives "met" from the deepest gate reached: for
services, Reveal collapses into Grant.

## Decision 4: staging stays on top

An unlocked service is still sold only from its gate: Extend from gate 3, the
tag in gates 4 to 10. The unlock says whether, the gate says when.

## What this overrules, and what stands

Overruled: Reveal-only shop verbs (DVTD-2try, DVTD-8zb3). Stands: ADR-050
Decision 2, "Grant gates the hand, never the shelf", which is about configs; a
service is not on the shelf.

## Consequences

- An account that reached Cascade before this ledger existed shows Extend locked
  until it reaches Cascade again.
- The two depth unlocks a first run can meet are granted in the transaction that
  meets them, so the shop that follows already sells them.
- Skip shop (ADR-115 D4) is a starter beside Rebuild.
- The Dex reads `getServiceUnlocks`; `GateRunsData.deepestGate` is gone.
- An earned service nobody sells yet reads "not for sale yet" in the Dex
  (ADR-115 Decision 10).
