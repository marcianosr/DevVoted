---
# DVTD-k13o
title: Enforce 'pick exactly one' reward + 5-slot cap
status: completed
type: bug
priority: high
created_at: 2026-07-16T13:18:05Z
updated_at: 2026-07-16T13:37:47Z
parent: DVTD-5jpw
---

Gate-clear reward screen doesn't enforce ADR-006 Decision 1 (5-slot cap) or Decision 7 ("pick exactly one" reward). Found during playtest (DVTD-8eij): after a gate clear, was able to add a slot, draft a config for 20KB, then add another slot in the same round -- pipeline grew past the documented 5-slot cap and the game offered "Add a slot: 5 -> 6".

This is the highest-leverage fix from the review: every other balance number (drop-N, escalation rate, reward multipliers) is being tuned against a game that isn't the one ADR-006 describes, since storage can currently buy every reward instead of forcing a real choice.

Also surfaced: a 20KB draft cost exists but isn't documented anywhere in ADR-006's economy section (Decision 10 lists only rebuild-cost Fibonacci and 40KB lint-cost as sinks) -- decide whether to document it or remove it as part of this fix.

## Summary of Changes

Pivoted the fix after design discussion — "pick exactly one" (ADR-006 Decision 7) was scrapped, not enforced.

**Decision (see new ADR-008):**
- Reward screen is a **Balatro-style multi-buy shop** bounded by storage — the reducer's multi-action `rewarding` phase is now the intended design.
- `add-slot` is gated on **total coverage** (a threshold, not a spend): 3→4 @20%, 4→5 @45%, 5→6 @75%, 6→7 @110%, 7→8 @150%. Hard cap stays MAX_SLOTS=8 (confirmed by owner; ADR-006's "grow to 5" was stale).
- The undocumented rarity draft cost is **kept and documented** as the shop's storage sink.

**Code:**
- `pipeline.model.ts` — `SLOT_COVERAGE_GATE` ladder + `coverageToAddSlot()` + `canAddSlot()`.
- `sessionRun.model.ts` — `addSlot` guards on `canAddSlot(slots, coverage)`.
- `proto-session-run.tsx` — passes coverage + threshold; `canAddSlot` computed from coverage.
- `ShopScreen.ui.tsx` — shows the coverage requirement inline when a slot is locked.
- Tests: new "slot coverage gate" describe (below-threshold refusal, meets-threshold add, hard-cap hold); ShopScreen locked-slot test; SlotLocked story.

**Docs:** ADR-008 created (supersedes ADR-006 Decision 7, amends Decisions 1 & 10); pointer added to ADR-006 status.
