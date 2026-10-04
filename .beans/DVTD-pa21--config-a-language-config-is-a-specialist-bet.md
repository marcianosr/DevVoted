---
# DVTD-pa21
title: 'Config: a language config is a specialist bet'
status: todo
type: feature
priority: normal
created_at: 2026-10-02T18:15:37Z
updated_at: 2026-10-02T18:21:27Z
parent: DVTD-d0fw
blocked_by:
    - DVTD-e0u5
---

**What:** A language config pays off when you know its category, and costs you when you don't.

**Why:** Today a language config barely changes a run, so eleven shop offers are close to no choice at all.

## Done when
- [ ] A player strong in one category wins noticeably more with that category's config than without it
- [ ] A player weak in that category does worse with it than without it
- [ ] The language configs no longer crowd the shop hand with near-identical offers
- [ ] The balance sim shows the language config is no longer within a few points of a bare build

## Notes

Role decided 2026-10-02: a language config is a **specialist bet**, not cheap filler.

### Evidence (balance playtest, 2026-10-02)
Throwaway sweep over the `coverageRatio.model.spec.ts` simulate, 1500 trials, one config alone, uniform accuracy across categories. Win % at accuracy .6 / .7 / .8 / .9:

| Build | .6 | .7 | .8 | .9 |
|---|---|---|---|---|
| bare | 0 | 4 | 25 | 70 |
| `.js` [1 slot] | 0 | 5 | 28 | 73 |
| four language configs [4] | 1 | 8 | 38 | 80 |
| Code Coverage [2] | 1 | 9 | 39 | 81 |
| Intellisense [4] | 11 | 41 | 76 | 97 |

1.25× on about 1 poll in 12 (12 categories) adds about +2% units per correct answer. The sim gives every category the same accuracy, so it cannot show the specialist payoff yet; the "Done when" items need per-category accuracy in the sim to verify.

### Options
- **A. Raise the multiplier.** About ×2.5 on the category matches Intellisense per slot. Simple, but the category still turns up rarely, so it stays a small, swingy effect.
- **B. Tilt the poll draw (recommended).** The config pulls more polls of its category into the gate and pays a bonus on them. Knowing the category gains a lot and not knowing it hurts: a real bet. Overlaps DVTD-4ova (configs that influence poll category choices).
- **C. Merge into one config.** One "language" config whose category you pick on install. Clears the hand; combines with A or B.

Recommended: B, possibly with C.

### Touches
- `src/modules/run/config/domain/configRoster.model.ts` (the eleven `focusCategory` configs)
- the gate's poll draw (date-seeded, ADR-138) if B
- balance sim in `src/modules/run/build/domain/coverageRatio.model.spec.ts`: needs per-category accuracy

### Levelling does not rescue it (2026-10-02 follow-up)
A language config levels to `1 + 0.25 × level`. Each upgrade costs `32 × (level + 1)` KB and needs `level × 5` units of coverage earned in its own category. Sweep, win % at .6 / .7 / .8 / .9:

| Build | .6 | .7 | .8 | .9 |
|---|---|---|---|---|
| `.js` L6 (×2.5) [1 slot] | 1 | 9 | 37 | 78 |
| `.js` L10 (×3.5) [1 slot] | 2 | 10 | 40 | 80 |
| four language configs L6 [4] | 8 | 29 | 66 | 91 |

L6 costs 640 KB and 75 category units, and plays like a level-1 Code Coverage. The limit is how often the category appears (about 1 poll in 12), not the multiplier. Option A is effectively the existing level curve, and it is rejected.

Option B (tilting the draw) contradicts ADR-009 (same polls for everyone, rejected alternatives in docs/adr/rejected.md). Picking it means a superseding ADR.

Levers that keep the polls shared:
- **Wider category:** a config covers a family (e.g. `.jsx` = React + JavaScript + TypeScript), so it applies to about 3 polls in 12.
- **Level-up as the reward:** a level grants a build-wide multiplier, bought with coverage earned in the category.

### Decision (Marciano, 2026-10-02)
Breadth comes from **building**, not from a bigger multiplier or a tilted draw:
- **Owning a set widens:** installed language configs of one family (e.g. `.js` + `.ts` + `.jsx`) also pay on each other's categories.
- **Merging:** an authored recipe folds two into one (`.jsx` + `.ts` → `.tsx`), per DVTD-e0u5 (recipes, one shared version, 64 KB per weight removed).

Estimate from the level sweep (not simulated directly): `.tsx` L1 covers about 2 in 12 polls (about +4%, near bare). At L6 about +25%, near A/B Test. A full 4-category set at L6 wins about 66% at 0.8. A set build competes only with investment, which fits a specialist path. Verify with a sim that models families, merged outputs and per-category accuracy.
