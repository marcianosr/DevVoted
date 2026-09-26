---
# DVTD-0ia7
title: Titles and borders share one equip rule
status: todo
type: task
priority: low
created_at: 2026-09-25T19:45:52Z
updated_at: 2026-09-25T19:45:52Z
parent: DVTD-y3vn
blocked_by:
    - DVTD-x242
    - DVTD-ucrn
    - DVTD-n1pr
---

**What:** The title shelf and the border shop use one rule for equipping from an owned catalogue and one mutation hook shape.

**Why:** The same find, verify owned, set logic and the same query-plus-mutation hook are written twice, and neither service has a spec.

## Done when
- [ ] One domain rule decides clear, equip or refused for both catalogues, with a spec
- [ ] Both equip hooks share one mutation hook
- [ ] The border catalogue is read-only, named like the other rosters, and has a catalogue-invariants spec
- [ ] Both services have specs asserting their refusal messages

## Notes
Plan section "Slice 8". New `profile/domain/equippable.model.ts` (`equipFromCatalogue` returns a decision, never throws; `ownedIds` optional because the title path proves ownership in its WHERE clause) and `profile/application/useEquipMutation.hook.ts`. `borders` → `BORDERS: readonly Border[]`. No `Catalogue<T>` type, no generic hook factory, no navigation added (the profile is unreachable from kanto), border equip stays read-then-write. Lands after DVTD-n1pr and the session/envelope and cache slices.
