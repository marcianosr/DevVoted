---
# DVTD-ym11
title: Rarity is a shape, not a hue (bit/crumb/nibble/byte)
status: completed
type: feature
priority: normal
created_at: 2026-08-27T13:09:21Z
updated_at: 2026-08-27T13:40:00Z
---

Part A of the rarity + storage brief. Rarity becomes achromatic and shape-encoded, because every rarity hue already belongs to a gate swatch.

Tiers rename to bit / crumb / nibble / byte (1/2/4/8 bits), so the glyph cell count is the unit definition. Draft costs double to 64/128/256/512 KB so 512 KB = one byte = eight bits.

- [x] Rename Rarity values in modern-theme/rarity.ts + config.model.ts + 15 roster literals
- [x] New RarityGlyph.ui.tsx (SVG cell cluster, one neutral grey, fixed slot)
- [x] New LevelBar.ui.tsx (segmented progress track, shop rows only)
- [x] Add RARITY_WEIGHT + RARITY_ODDS (odds derived from weights), double DRAFT_COST
- [x] Delete every rarity to hue mapping (RARITY_FILL/TEXT/WASH/BORDER, rarityColors importers in modules)
- [x] Delete RarityStripe + RarityWord components
- [x] Delete the three legend rows (StartScreen, ShopScreen, ConfiguringScreen)
- [x] Dex Configs tab: glyph + tier name + odds + size + count, neutral chips
- [x] Specs and stories across the blast radius
- [x] Docs: wiki 4.2 + 8, ADR-043, ADR-006 supersede marker, CHANGELOG rewrite (3 unreleased entries)

Plan: ~/.claude-work/plans/mellow-wiggling-lightning.md
Part B (storage as the only meter) is a separate bean, gated on a balance pass.

## Summary of Changes

Part A of the rarity + storage brief. Rarity is achromatic and shape-encoded; Part B
(storage as the only meter) is a separate, gated piece.

**The grades.** `common/uncommon/rare/legendary` renamed to `bit/crumb/nibble/byte`
(1/2/4/8 bits) in the two live `Rarity` declarations (`ui/modern-theme/rarity.ts`,
`config/domain/config.model.ts`) and the 15 roster literals. Rarity is not persisted,
so no migration. `src/domains/**`, `proto-session-slice.tsx` and `admin.tsx` keep the
old vocabulary as a legacy island.

**New components.** `RarityGlyph.ui.tsx` draws one cell per bit in a 16x16 box, fixed
slot, one neutral grey (no brightness ramp: the cell count already carries the ladder
and it keeps a lone bit legible at the 40% row dim). `LevelBar.ui.tsx` is a segmented
track that DOES draw its empty segments, since a level is a distance along a ladder.
Both with spec + stories.

**Deleted.** `RarityStripe`, `RarityWord`, `RARITY_BORDER/FILL/TEXT/WASH`,
`RARITY_LEGEND` and all three legend mounts (StartScreen, ShopScreen, the
ConfiguringScreen bench legend), `Dot`'s rarity arm and its `bar` shape (no surviving
caller), `ConfigChip`'s cva colour variants and its tooltip grade line,
`PipelineReportRow`'s grade-coloured ghost box, the grade word from `ConfigFacts`.
`app.css`'s `.legendary-*` classes stay: swatches and the prismatic button use them.

**Odds vs weights.** The brief's two tables disagreed (weights 60/25/12/3 make a bit
1 in 1.7, not 1 in 3). Marciano chose weights-as-mechanic, so `RARITY_ODDS` is derived:
1 in 2 / 1 in 4 / 1 in 8 / 1 in 33. A spec asserts the two agree. The draw is still
grade-blind (DVTD-5ljh).

**Prices doubled** to 64/128/256/512 KB, by decision, so 512 KB = one byte = eight
bits exactly. Faucets unchanged, so the early run is tighter: gate 0 pays 32 KB against
a 64 KB bit. `GATE_REWARD_KB` 32 -> 64 is the knob if it bites.

**Dex** is the only surface with grade vocabulary: header carries glyph, name, odds,
size, count.

**Docs.** ADR-043 written, ADR-006 Decision 9 marked superseded, README row added.
Wiki 4.2 rewritten, 39 roster grade cells renamed, section 8 gained a Config level
bullet. CHANGELOG's three rarity entries rewritten in place (none had shipped).

**Verification.** lint + dependency-cruiser clean (780 modules), build clean,
2492 passed / 3 failed - the 3 being the pre-existing RewardScreen copy assertions
(DVTD-9dn0), unchanged from baseline.

**Found in passing, not fixed:** stories are excluded from tsconfig and several carry
real type errors unrelated to this work (RunCommunity `standouts`, GateRewardReport
`checkProgress`, RoleList `requirement`, RunHud `storageBillKb`, Screen `wide`,
Pipeline.stories `.value` on a chance figure, ConfiguringScreen/PrepScreen
`PerAnswerPreview`). Worth its own bean.
