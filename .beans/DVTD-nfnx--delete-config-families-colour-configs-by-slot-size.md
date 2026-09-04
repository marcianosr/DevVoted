---
# DVTD-nfnx
title: Delete config families; colour configs by slot size
status: todo
type: feature
priority: normal
created_at: 2026-09-03T09:31:44Z
updated_at: 2026-09-03T09:32:00Z
parent: DVTD-cb52
blocking:
    - DVTD-eyud
---

Delete `ConfigFamily` and every colour keyed to it. A config's only visual class becomes its size, so the hue that today says "focus" or "risk" says "2 slots" or "8 slots" instead.

Families cost nothing to remove because they already do nothing. `Config.family` has **zero** non-test reads in `src/modules` and `src/domains`: no check, no reward, no shop roll, no gate reads it. It is a label and five Tailwind classes. The docs got there first: ADR-006's taxonomy was marked "presentation-era grouping only" by ADR-016, and ADR-035 then retired the duality outright ("configs are pure enhancements").

## The ramp

`ConfigSize` is 1, 2, 4, 8, 12, 16 and `slots` defaults to 1. On today's roster of 32 configs that is **15 at size 1, 7 at 2, 5 at 4, 5 at 8**; 12 and 16 are reserved by ADR-047 and unused. So the ramp needs six rungs with four in play.

Precedent to copy: `Version.ui.tsx` already runs a five-rung ramp as pure value (zinc 800 up to zinc 100, text flipping dark at v4). Its comment says the ramp is monochrome because "hue already means family in this theme" — that sentence dies with this story, and it is also the argument for giving versions the hue that families vacate, if you want it.

## Decisions needed

1. **Where hue goes at all.** Size is already stated three ways once colour joins: the word ("4 slots"), the bar length in `Slots.ui`, and now the fill. Meanwhile 15 of 32 configs sit on the size-1 rung, so the pipeline rail goes from five hues to mostly one. Options: (a) hue by size everywhere, as asked; (b) hue by size only where no bar is drawn (`DexChip`, dots), leaving bars plain zinc; (c) no hue at all, size stays length plus number, which is ADR-047 read literally. My pick: (a) as asked, but the rail is where it will look worst, so worth a playtest before the Dex work follows it.
2. **Base size or current size.** `slotsOf` halves a minified config, `baseSlotsOf` does not. Colouring by the drawn value means minify visibly demotes a byte from the 8-rung to the 4-rung. My pick: follow the drawn value, since bar length already does.
3. **What an unseen Dex chip hands over.** `DexChip`'s union exists so an unseen config gives up its family and nothing else. With families gone it gives up its size instead, which is a slightly bigger tell (size is price). Fine by me, but say so out loud.

## Touch list

Kit (`src/ui/terminal-theme/`):

- [ ] `families.ts` deleted (`FAMILY_TEXT`, `FAMILY_SOLID`, `FAMILY_ORDER`), replaced by a size ramp table in the same shape
- [ ] `Slots.ui.tsx`: `family` prop out, fill from `slots`; the aria-label loses `family · ` and keeps the size
- [ ] `SlotTrack.ui.tsx`: segments keyed by size, not `segment.family`
- [ ] `FamilyDot.ui.tsx` + story: delete, or land as a size dot if decision 1 says (b)
- [ ] `DexChip.ui.tsx` + story: union re-keyed per decision 3
- [ ] `ConfigsPanel.ui.tsx`: legend rebuilt off sizes (the tab already groups "by slot", so only the key changes)
- [ ] `Version.ui.tsx`: the stale comment, plus hue if you want it there
- [ ] Screens dropping the prop: `ShopScreen`, `PrepScreen`, `NewRunScreen`, `GateClearScreen`, `GateHoldScreen`, and `Row.stories`

Tier 2:

- [ ] `ShopView`, `PrepView`, `StartView`, `RewardView`, `RemovalView`: stop mapping `family` into row props
- [ ] Adapter specs updated in the same commit

Domain:

- [ ] `config.model.ts`: `ConfigFamily` and `Config.family` deleted
- [ ] `configRoster.model.ts`: 32 `family:` lines out
- [ ] Fixtures in `configRole.model.spec.ts`, `gateReward.model.spec.ts`, `build.model.spec.ts`
- [ ] `src/domains/runs/prototype/sessionSlice.ts` (legacy, still compiles)

Orphans and docs:

- [ ] `src/ui/modern-theme/Family.ui.tsx` + spec + story: already unreferenced outside the kit, delete with this
- [ ] ADR-053: hue is keyed to size. ADR-047 said "no grade colours" and this must not read as walking that back: grades are not returning, the number is simply gaining a fill
- [ ] ADR-006's family-taxonomy note and any ADR line that still treats families as live
- [ ] CHANGELOG entry, wiki check (the roster tables carry no family column, so likely nothing)

Verify: `npm run lint`, `npm run build`, stories tsconfig, `npm test`.

## Answers DVTD-eyud

DVTD-eyud is the diagnosis: five configs whose family tag disagrees with their effect, and the structural note that family mixes what a config pays with what it costs. This bean is one of the two possible answers, the one that deletes the axis instead of splitting it into payout plus a risk flag. If this lands, DVTD-eyud is moot and should be scrapped rather than worked.
