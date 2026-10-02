---
# DVTD-su6a
title: A worn swatch themes the profile page
status: completed
type: feature
priority: normal
created_at: 2026-09-29T09:55:27Z
updated_at: 2026-10-02T10:41:34Z
blocked_by:
    - DVTD-fdmd
---

**What:** A player wears one swatch they earned, and their profile page wears its colour for them and for every visitor; pallet when nothing is worn.

**Why:** A flawless gate should be something other players can see, not only a collectible in your own Dex.

## Done when
- [x] The appearance tab lists every swatch; owned ones can be worn with one press, locked ones hide their colour
- [x] Your own profile page wears the worn swatch on every tab
- [x] A visitor sees the same colour on your page
- [x] With nothing worn, or a swatch you no longer own, the page is pallet

## Notes
Decisions (user, 2026-09-29): the worn swatch replaces the per-tab colours on the owner's page; press to wear, no try-on (it costs nothing). Plan: ~/.claude-work/plans/whats-also-important-is-jazzy-lampson.md

### Progress 2026-09-29

Decision reversed by the user: the swatch **joins the drafted look** (DVTD-fdmd). Picking one recolours the preview and the page, and the look's one save press stores it. That replaces the earlier press-to-wear answer.

Done (server side, independent of fdmd):
- users.equipped_swatch_id column + guarded migration 20260929140000_wear_a_swatch.sql
- profileTheme.model: DEFAULT_PROFILE_THEME (pallet), profileThemeFor (stale id falls back to pallet), wearSwatch decision (pallet stored as null)
- repository: archive state and public profile carry ownedSwatchIds + equippedSwatchId; setEquippedSwatch
- equipSwatchService / equipSwatch serverfn / useEquipSwatch hook. **Once fdmd lands, fold it into saveLook and delete it.**
- getPublicProfile returns a top-level theme (kept off ProfileIdentity so fdmd's files keep compiling)
- swatchPick.viewmodel: worn / owned / locked per swatch; locked withholds the colour
- seed: Lance's swatch ids were invalid ("pallet", "pewter"...), now real swatch-* ids, wearing volcano

Left, after fdmd lands:
- Look gains swatchId; the appearance tab draws a swatch row from swatchPicksFor; saveLook writes equipped_swatch_id
- ProfileScreen takes gate: SwatchTheme; both owner and visitor branches pass the worn theme; delete VISITED_THEME and profileThemeOf. The tab colour field on DexTab/ProfileTab then has no reader, so propose deleting it.
- ADR (amends 142 and 125), wiki 6.3 and 6.7, changelog, Story for the swatch row

### 2026-09-30

The press-to-wear swatch path (`equipSwatchService`, `equipSwatch` server function, `useEquipSwatch`, `setEquippedSwatch`) was deleted with DVTD-0ia7: it was voided by the decision above and had no caller. `wearSwatch` in `profileTheme.model.ts` stays for the look: `Look` gains `swatchId`, `lookRefusalOf` calls `wearSwatch`, `setEquippedLook` writes the third column, and `useLookDraft` gains `pickSwatch`.

## Summary of Changes

2026-10-02, ADR-174. `Look.swatchId`; `lookRefusalOf` refuses `swatch-not-owned`; `storedSwatchIdOf` stores pallet as null; `saveLook` writes `equipped_swatch_id` and invalidates the profile and card queries. The Appearance tab draws a swatch row from `swatchPicksFor` (unearned: undiscovered, redacted name, disabled). The owner page wears the drafted swatch; visitors and the hover card read the saved one. Left open: the unused tab `color` field on DexTab/ProfileTab. Not checked in a browser: every browser tool was held by another session.
