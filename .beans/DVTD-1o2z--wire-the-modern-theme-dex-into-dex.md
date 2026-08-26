---
# DVTD-1o2z
title: Wire the modern-theme Dex into /dex
status: completed
type: feature
priority: normal
created_at: 2026-08-25T19:41:43Z
updated_at: 2026-08-25T20:02:38Z
---

The modern-theme Dex exists in Storybook only (DVTD-gkln shell+Gates, DVTD-4b38 Polls). /dex still renders the legacy `ui/` kit through `modules/collection/dex/presentation/DexScreen.ui.tsx`. Wire the real screen.

Decisions (2026-08-25):
- Four tabs: Polls, Configs, Audits, Gates. Swatches is dropped — GatesPanel already draws every swatch with its earned state off the same source, same n/13 counter.
- Configs keeps the legacy ConfigdexPanel until it is reskinned.
- Gate clears come from `users.owned_swatch_ids`: a swatch is appended exactly when its gate is cleared, so it already is the account-level record. No new storage.
- Audit tiers: faced = its gate is cleared, unlocked = its first gate is the next gate, unseen otherwise.
- The Storybook Gates mock hardcoded its unlock chips and the slot column is stale (says slot 5 at gate 2; SLOT_UNLOCKS says gate 3). Real screen derives every chip from SLOT_UNLOCKS, STORAGE_PLANS, LOCK_FROM_GATE, EXTEND_FROM_GATE, PIN_FROM_GATE.

- [x] gatedex.model.ts + spec: the gate ladder as a collection, cleared/next/locked off owned swatch ids
- [x] auditdex.model.ts + spec: roster deduped on name, tier per gate progress
- [x] polldex.model.ts: seen/mastered/fumbled/all filter axis + unmet reveal
- [x] GatesView / AuditsView / PollsView Tier-2 components
- [x] Dex.component.tsx rewritten onto the modern shell
- [x] Delete the dead legacy panels (DexScreen.ui, PolldexPanel, PolldexFilterBar, polldexColumns, polldex.factory, SwatchdexPanel)
- [x] Verify: lint, build, tests
- [x] Redact a locked gate's audits, slots and plans (added mid-session)

## Summary of Changes

The Dex at /dex is the modern-theme screen, four tabs: Polls, Configs, Audits, Gates.

New domain in `modules/collection/dex/domain/`:
- `gatedex.model.ts` — the 13-gate ladder as a collection, cleared/next/locked read off `users.owned_swatch_ids`. `grantedByClearing` converts a `gatesCleared` floor to the gate you actually clear, once, which is what fixed the Storybook mock's off-by-one on lock, extend, git tag and every storage plan. Slot chips come off `SLOT_UNLOCKS.gate`, which uses the other convention and needed no shift.
- `auditdex.model.ts` — the roster deduped on name (11, not the 14 that counting `timeout-3/4/5` and `strip-1/2` gives). Tier: faced = its gate is cleared, unlocked = its gate is next, unseen otherwise.
- `polldex.model.ts` — the seen/unseen axis became seen/mastered/fumbled/all, plus `polldexTallies` and `unmetCount`.

`Audit` gained an optional `dexRule`, set only on the timeout and strip factories: their `description` states the gate's own figures, which reads as a lie on a catalogue row covering three gates.

Tier-2 in `presentation/`: `GatesView`, `AuditsView`, `PollsView`, and a rewritten `Dex.component`. Gates and Audits need only the swatch query, so the Polls tab carries its own loading and error state rather than blanking the screen.

A locked gate withholds its audits, slots and plans as counted `???` chips (`auditsHidden` / `unlocksHidden` on `DexGate`). Audit redaction keys on the audit's own tier, not the gate's state, so a name the Audits tab shows stays readable on a locked gate's row. Shop actions stay named.

Deleted: `DexScreen.ui`, `PolldexPanel`, `PolldexFilterBar`, `polldexColumns`, `polldex.factory`, `SwatchdexPanel` and their stories.

Verification: build passes, `npm run lint` clean, dependency-cruiser clean (763 modules), 2378 tests pass. The 3 failures in `RewardScreen.spec.tsx` are pre-existing RTL text-split assertions on this branch, untouched by this work.
