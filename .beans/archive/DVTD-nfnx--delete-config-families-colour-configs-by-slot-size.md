---
# DVTD-nfnx
title: Delete config families; colour configs by slot size
status: completed
type: feature
priority: normal
created_at: 2026-09-03T09:31:44Z
updated_at: 2026-09-04T08:39:58Z
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

- [x] `families.ts` deleted (`FAMILY_TEXT`, `FAMILY_SOLID`, `FAMILY_ORDER`), replaced by a size ramp table in the same shape
- [x] `Slots.ui.tsx`: `family` prop out, fill from `slots`; the aria-label loses `family · ` and keeps the size
- [x] `SlotTrack.ui.tsx`: segments keyed by size, not `segment.family`
- [x] `FamilyDot.ui.tsx` + story: delete, or land as a size dot if decision 1 says (b)
- [x] `DexChip.ui.tsx` + story: union re-keyed per decision 3
- [x] `ConfigsPanel.ui.tsx`: legend rebuilt off sizes (the tab already groups "by slot", so only the key changes)
- [x] `Version.ui.tsx`: the stale comment, plus hue if you want it there
- [x] Screens dropping the prop: `ShopScreen`, `PrepScreen`, `NewRunScreen`, `GateClearScreen`, `GateHoldScreen`, and `Row.stories`

Tier 2:

- [x] `ShopView`, `PrepView`, `StartView`, `RewardView`, `RemovalView`: stop mapping `family` into row props
- [x] Adapter specs: no change needed, none asserted on `family`

Domain:

- [x] `config.model.ts`: `ConfigFamily` and `Config.family` deleted
- [x] `configRoster.model.ts`: 33 `family:` lines out (roster had grown by one)
- [x] Fixtures in `configRole.model.spec.ts`, `gateReward.model.spec.ts`, `build.model.spec.ts`
- [x] `src/domains/runs/prototype/sessionSlice.ts`: LEFT ALONE on purpose. Its `TagFamily` is an independent type (it has a sixth member, `check`) on a live prototype route and shares no code with `ConfigFamily`; nothing breaks.

Orphans and docs:

- [x] `src/ui/modern-theme/Family.ui.tsx` + spec + story: already unreferenced outside the kit, delete with this
- [x] Landed as **ADR-055** (053 and 054 were both taken): hue is keyed to size. ADR-047 said "no grade colours" and this must not read as walking that back: grades are not returning, the number is simply gaining a fill
- [x] ADR-006's family-taxonomy note and any ADR line that still treats families as live
- [x] CHANGELOG entry, wiki check (the roster tables carry no family column, so likely nothing)

Verify: `npm run lint`, `npm run build`, stories tsconfig, `npm test`.

## Answers DVTD-eyud

DVTD-eyud is the diagnosis: five configs whose family tag disagrees with their effect, and the structural note that family mixes what a config pays with what it costs. This bean is one of the two possible answers, the one that deletes the axis instead of splitting it into payout plus a risk flag. If this lands, DVTD-eyud is moot and should be scrapped rather than worked.

## Summary of Changes

Families are gone from the codebase and hue now means slot size on every surface.

**The ramp** (`src/ui/terminal-theme/sizes.ts`, replacing `families.ts`): 1 celadon, 2 saffron, 4 vermilion, 8 lavender, 12 fuchsia, 16 cinnabar. `--color-fuchsia` already existed in `app.css`, so no token was added.

`sizeFill(slots)` is a **descending threshold walk**, not a `Record<ConfigSize, string>`. This was the one design change against the bean's "size ramp table in the same shape" wording: `slotsOf` floor-halves a minified config, so it can emit values off the 1/2/4/8/12/16 ladder (a minified 12 becomes 6) and a record lookup would return `undefined` and render an unstyled bar. The walk puts 6 on the 4 rung; `?? bg-zinc-500` catches a minified 1-slot collapsing to 0.

**Decisions taken** (bean's three open questions):

1. Hue by size everywhere, option (a), as asked.
2. Fill follows the drawn value, so it always agrees with bar length by construction.
3. Unseen `DexChip` gives up its size; said out loud in ADR-055 Decision 4.

**Two things the bean did not predict:**

- `SlotTrack`'s "sitting out" gap was encoded as `family: undefined`, so absence of data *was* the meaning. With every segment now colouring itself from `slots`, that gap needed an explicit `open?: boolean` flag or it would have rendered as a filled segment.
- `Slots` used to drop out of the accessibility tree whenever `family` was absent. It is now always `role="img"` with `aria-label="N slots"`, and the two callers that state the size in adjacent text (the Dex group header and the new `SlotKey` legend) wrap it in `<span aria-hidden>` instead.

`FamilyDot` deleted: the Dex chip now leads with the block-strip mark itself (dimmed when unseen), which matches the mock. The Dex legend became `SlotKey`, keyed off `slotSizes(configs)` so it only prints rungs the roster actually populates.

**Verification**: `npm run lint` clean (898 modules, no dependency violations). `npm run build` clean including `tsc`. `npm test` 2669 passed, 3 failed. The 3 failures are in `src/ui/modern-theme/screens/RewardScreen.spec.tsx` and are **pre-existing**: both files match HEAD exactly, and restoring the deleted `Family.ui/spec/stories` trio reproduces the same 3 failures, so this change is not the cause. Stories are excluded from `tsconfig`, so they were separately typechecked with a scratchpad config that clears the exclusion: 0 errors in `terminal-theme`, 29 pre-existing errors in unrelated files (community, gate, run presentation, modern-theme, ui/Screen).

**Playtest note carried forward**: 16 of 33 configs sit on the 1 rung, so a build rail reads as mostly celadon. The bean flagged the rail as where this would look worst, and that prediction stands unverified: worth a look before any further Dex work follows this scheme.


## Follow-up: wired to the authed game (2026-09-04)

ADR-055 originally shipped the ramp to `src/ui/terminal-theme/` only, which reaches nothing a player sees: `/proto-run` is `import.meta.env.PROD`-guarded and ADR-002 calls it a dev rig. The authed game (`/run/*`, `/dex`) draws configs through a different screen set and got no colour at all.

Fixed by promoting the ramp and hitting the two root causes:

- `src/ui/terminal-theme/sizes.ts` moved to **`src/ui/sizes.ts`** (global primitive), now exporting `sizeFill` (solid, small marks) and `sizeTint` (same rungs at 15% alpha, for large segments drawn behind a label).
- **`ConfigChip.ui.tsx`** leads with a size-coloured block strip. It takes a whole `Config`, so it derives `slotsOf` itself: all **12 call sites** unchanged. Covers prep, answer, shop, configure, reward, run summary, build report rows, config actions, and the Configdex.
- **modern-theme `SlotTrack.ui.tsx`** (`/run/configure`, `/run/shop` build bars): size owns the fill via `sizeTint`, install state keeps the border. `INSTALLED`/`MINIFIED` gave up their own `bg-zinc-800/*` first, because a second `bg-*` utility on one element loses to Tailwind source order instead of overriding.
- **`ConfigdexPanel.ui.tsx`** slot-group headers get a proportional bar in the group's colour.

Two things worth recording:

- The chip's mark had to be `aria-hidden`. Labelling it (as terminal-theme's standalone `Slots` is) renamed every pressable chip to "1 slot .js" and broke **27 name-based queries** across four spec files. Reverted to decorative; the terminal-theme mark stays labelled because it is not nested in a button.
- modern-theme's `SlotMark` (size as grey text) and `Chip`'s `slots` arm were left alone: no non-story importers, so they are island code.

Deliberately not done: converging `/run/*` onto the terminal-theme screens. That is the standing convergence question, not a colour change.

Filed **DVTD-ati1** for `/presentation` and `/admin`, which still colour configs by the ADR-047-deleted `rarity` axis via `src/ui/rarityColors.ts`.

Verified again after the wiring: `npm run lint` clean, `npm run build` clean, `npm test` 2669 passed with the same 3 pre-existing `RewardScreen.spec.tsx` failures, stories typecheck still 29 pre-existing errors and none in any touched file.
