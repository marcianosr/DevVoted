---
# DVTD-d16l
title: 'Wiki drift: sections 2, 3 and 5 describe the retired model'
status: todo
type: task
priority: normal
created_at: 2026-09-12T12:58:47Z
updated_at: 2026-09-14T17:08:51Z
---

`docs/wiki.md` states the current rules, and after ADR-071, ADR-073 and ADR-074
several of its sections state rules that are decided against but not yet built.
The wiki describes what runs, so it should be rewritten when the code lands, not
before, and this bean holds the list until then.

## What goes stale, and with which bean

- **2.2 Gates** and **2.6 Missing a gate**: a gate has four outcomes, only
  HEALTHY advances, nothing peels on a miss, DANGER ends the run. Lands with
  DVTD-7uil.
- **2.5 Coverage (scoring)**: the gain is flat, coverage resets each gate and
  caps at 100%, the HEALTHY line is the difficulty. §2.7's baseline paragraph
  and §2.8's demand table both carry the old numbers.
- **3 Your Build** and **5.2 The Shop**: no slot ladder, no ceiling, weight
  bills KB every gate.
- **5.1 Storage (KB)**: no cap, and the plan sells free weight instead.
- **10 Numbers reference**: most of it.

## Todo

- [ ] Rewrite each section as its implementing bean lands, not in one pass
- [ ] Check the glossary: "slot", "capacity" and "spot" all change meaning or go
- [ ] Re-sync the Notion snapshot afterwards

## Progress 2026-09-14 (ADR-082 / DVTD-uhub)

The build-space half is done, because the code landed. Rewritten in `docs/wiki.md`:

- **§3 Your Build** — no slot ladder, no ceiling. Room is rented by the gate, the
  rung table is inline, and the door rule and the insolvency drop are stated.
- **§5.1 Storage (KB)** — no cap, no storage plan. The build space ladder replaces
  both, with the bill-on-the-rung-held rule and the weight-earns-and-bills tension.
- **§5.2 The Shop** — Buy/Cash/Open a slot and Storage plan collapse into one
  **Build space** row; the exit lock names the new state.
- **§9 Glossary** — `Slot` re-worded, `Slot ladder` → `Build space`,
  `Storage plan` → `Build space ladder`, `Storage` no longer capped.
- **§10 Numbers reference** — `SLOT_PRICES_KB`/`STORAGE_PLANS`/`MAX_SLOTS`/
  `slotCashOutKb` out, `BUILD_SPACE_RUNGS`/`upkeepForSpace`/
  `highestAffordableSpace`/`BUILD_SPACE_FROM_GATE` in.

A grep for `slot ladder`, `storage plan`, `buy a slot`, `cash a slot`,
`24 slots` and `over capacity` now returns one deliberate historical mention.

Still open: sections 2 and 5 drift that is NOT about width (this bean's other half).
