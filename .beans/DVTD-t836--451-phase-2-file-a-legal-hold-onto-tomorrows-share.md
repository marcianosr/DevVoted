---
# DVTD-t836
title: '451 Phase 2: file a legal hold onto tomorrow''s shared day'
status: todo
type: feature
created_at: 2026-09-16T18:56:15Z
updated_at: 2026-09-16T18:56:15Z
parent: DVTD-72d9
---

The social half of 451, split out of DVTD-ltqb 2026-09-16 when that bean closed
for the Phase 1 audit it delivered. Until now this scope survived only as prose
in DVTD-ltqb and in ADR-058 Decision 5, with no todo items anywhere.

A player pays to **file a legal hold onto tomorrow's shared day**, sealing
answers for everyone climbing it, and collects the victims' 4 KB buy-backs.

## Shape (ADR-058 Decision 5)

- Escalating price: **32 / 64 / 128 / 256 KB** per answer sealed.
- The filer collects victims' buy-backs into their own `archived_storage`,
  **capped at 3x the stake**, so it can never become a farm.
- It is a **shop control, not a config**: a fourth press beside Rebuild / Lock /
  Extend, on the horizon past all three (this visit / next shop / rest of run /
  tomorrow's world, ADR-029). Costs KB, occupies no slots.
- **The filer is immune to their own filing.** DVTD-mvhv rejects symmetric
  effects.
- **The filer is named**, on the stake receipt and in the answer cue. This is
  what settles the named-or-anonymous question DVTD-ltqb left open.
- 403 does not defeat a filed hold.

## Why an intent, not a poll list

Tomorrow's `daily_run_polls` do not exist until the day's first player rolls
them, so the record is `(date, by_user_id, seals)` and the seals bind to polls at
roll time through the same seeded `redactedOptionIdsFor`.

## Recorded trap

A **filed** 451 is not drawn from a pool, so the `poll-reading` family rule will
not protect it from co-drawing with 403. That guard has to be written explicitly.

## Todo

- [ ] The filing intent record `(date, by_user_id, seals)` — new table, plus the
      roll-time binding to the day's polls
- [ ] The shop filing press, the fourth beside Rebuild / Lock / Extend
- [ ] The 32 / 64 / 128 / 256 KB ladder and the 3x-stake cap on collections
- [ ] Credit the filer in the **service layer** — the reducer is pure and may not
      write another player's row
- [ ] Filer attribution on the stake receipt and in the answer cue
- [ ] Filer immunity to their own filing
- [ ] Explicit guard against a filed 451 co-drawing with 403

## Related

Groups with DVTD-8zt9 "Thwarts (attack/penalty configs)", which could not be the
parent because a feature may not parent a feature. Parented to DVTD-72d9, the
same epic DVTD-ltqb sat under. Design brief: DVTD-mvhv "PvP thwarting: where a
config may affect other players".

Note: DVTD-ltqb and ADR-058 both reference a bean **DVTD-w5pb**, which does not
exist. This bean replaces that dangling pointer.
