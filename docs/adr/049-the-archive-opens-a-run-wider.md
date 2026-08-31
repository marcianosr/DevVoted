# ADR-049: The archive opens a run wider

## Status

Accepted (2026-08-31, Marciano, DVTD-dcpq).
**Amends [ADR-046](046-slots-are-bought-storage-is-capped-again.md)** Decisions 1 and 2:
the slot ladder gains a second purse and, on the start screen only, a rollback. Numbers
live in `SLOT_PRICES_KB` in `rules.model.ts` and `START_SLOT_PREMIUM` in
`startSlot.model.ts`.

## Context

A run opens on four slots however many runs came before it, so the archive — the
meta-currency every finished run pays into — had nothing to say about width. ADR-042
names retention the top structural risk and archived storage one of its answers, and
the archive's only sink today is borders.

## Decision 1: archived storage buys slots before the run starts, at double the rung

The start screen sells the same ladder the shop sells, at **twice the price**, paid from
`users.archived_storage` rather than run storage. A start purchase counts on the ladder:
buy the fifth slot for 32 KB of archive and the shop's next slot is the sixth at 32 KB
of run storage, not the fifth at 16.

| slot | in-run | at start |
| --- | --- | --- |
| 5 | 16 | 32 |
| 6 | 32 | 64 |
| 7 | 64 | 128 |
| 8 | 128 | 256 |
| 9 | 192 | 384 |
| 12 | 512 | 1024 |

Double, rather than a flat surcharge, because the premium has to scale with the rung or
it stops mattering at the top of the ladder.

## Decision 2: no cap on how wide the archive can open a run

The doubled ladder is the brake, the same argument ADR-046 makes for the in-run ladder.
Opening at eight slots costs 480 KB, about a sixth of what a perfect gate-12 clear
banks; opening at twelve costs 3.1 MB, more than that clear pays. So the archive can buy
a real head start and cannot buy an endless-run build.

The thing to watch in playtest is a returning account opening at eight every single run.
If that reads as the only sane opening, the premium is too low, not the cap too high.

## Decision 3: a slot bought here is refundable until Start, and the ladder rolls back

Pressing Start commits the width. Before that, an empty slot hands back for **exactly**
what it cost, and the ladder rolls back with it.

This does not reopen the loop ADR-046 Decision 2 closed. That rule refunds at the
position held rather than at the price paid, because a run that cashes mid-climb has
earned the rungs in between; here nothing has happened yet, the refund is the price
paid, and the round trip nets zero by construction. Withholding the refund would only
punish a mis-press on a screen where nothing is at stake.

## Decision 4: the offer closes when the run starts

Both presses are gated on `status === "configuring"`, which only `createRun` sets and
nothing restores. `RunState.slotsBought` does not record which purse paid for a slot, so
a refund still reachable mid-run would sell a 16 KB shop slot back for 32 KB of archive.
The gate lives in the domain rather than in screen routing so that the exploit is closed
wherever the function is called from.
