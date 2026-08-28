---
# DVTD-t7yk
title: Start and Prep screens still draw slots, not spots
status: completed
type: bug
priority: high
created_at: 2026-08-27T18:53:44Z
updated_at: 2026-08-27T19:18:20Z
---

`/proto-run` opens on StartScreen and it is still on the retired slot model, so ADR-044's capacity never becomes visible where the opening build is actually decided.

Three defects, in severity order:

1. **StartScreen counts configs as spots.** `openSlots.slice(picked)` subtracts a config count from a spot list, and the Fold header reads `{picked} of {spotsAvailable}`. Pick a nibble and the screen still offers three empty cells and says "1 of 4" — it is not a missing visual, it is a wrong number on the budget screen.
2. **No SpotTrack on Start or Prep.** Shop and Configuring got it; the two screens either side of them did not, so the byte never reads as a byte.
3. **`slot {n} opens` in Clear rewards.** `nextSpotGrant.spots` is the new *total*, so "slot 6 opens" names an ordinal that does not exist (a spot has no identity) and uses the retired word.

## Todo

- [x] StartScreen: replace `slots: StartSlot[]` with spot props, derive free cells from spots
- [x] StartScreen: SpotTrack in the pipeline Fold's note slot
- [x] StartScreen: reword the widening reward off the slot ordinal
- [x] PrepScreen: SpotTrack (and its header was counting configs too)
- [x] Specs + stories for both screens
- [x] lint, build, test

## Summary of Changes

`/proto-run` opens on StartScreen, which was still on the slot model, so ADR-044's
capacity was invisible exactly where the opening build is decided.

**The real defect was arithmetic, not a missing visual.** Both screens rebuilt
capacity out of row counts: StartScreen did `openSlots.slice(picked)` (a config
count subtracted from a spot list) and PrepScreen did
`configs.length + freeSlotCount`. Both are correct only while every config is a
bit. Pick a nibble and Start offered three cells that did not exist and read
"1 of 4". Neither screen could be caught by the type system — `slots: number` and
`spots: number` are the same type, so the old maths kept compiling and kept lying.

**Both screens now take capacity rather than deriving it**: `spots`, `maxSpots`,
`fits`, `nextSpotGrant`. `spotsUsed` is summed from the configs' own `spots`
inside the component, so the header count and the track's bars cannot disagree
about one build. `StartSlot`/`PrepSlot` are deleted; `DealtConfig` and
`PrepConfig` carry `spots` (and `PrepConfig` carries `minified`).

**`SpotTrack` now sits on all four pipeline surfaces** (Start, Prep, Shop,
Configuring), in the pipeline Fold's `note` slot.

**Two design calls worth recording:**

1. *The track's `lead` carries the config count, not the occupancy.* The Fold's
   summary row already states "N of M spots" — and it must, since it is the only
   thing visible when the fold is collapsed. Repeating it inside the track said
   nothing, so the left slot carries the other half of the shape instead: "3
   configs · 6 spots" is a byte-versus-eight-bits build in two numbers. Applied to
   the shop too, where the same number was printed twice one line apart.
2. *Prep shows free spots **or** the next widening, never both* — restored, not
   invented: it was a deliberate rule with a comment and a test, and the refactor
   had quietly flipped it. Start still shows both, as it always did.

**`slot {n} opens` was wrong three ways** and is now `pipeline widens · to 6
spots`: `nextSpotGrant.spots` is the new *total*, so it named an ordinal that does
not exist (a spot has no identity), using retired vocabulary, for a thing that is
granted rather than opened. `StartReward.slotOpens` → `spotsOpenTo`.

**Boy-scout, in files already open:**
- `SPOTS_PER_GRADE` exported from `config.model` so stories price off the grade
  they declare instead of hand-writing both. Named that way rather than
  `BASE_SPOTS` because `pipeline.model` already exports a `BASE_SPOTS` meaning the
  opening width — two exported constants with that name would have been a trap.
- `RoleList.stories` was importing `nextSlotRow` from `SlotUnlockRow.ui`, a file
  the ADR-044 work deleted. Migrated to `nextSpotRow`/`freeSpots`, and its
  `role: "requirement"` / `state:` rot fixed (nothing is a requirement since
  ADR-035).
- CHANGELOG's Freemium entry said "hands back its slot". The wider contradiction
  in `## Unreleased` is DVTD-d1ei.

**Verification:** `npm run lint` clean (783 modules, 3225 dependencies) ·
`npm run build` clean · `npx vitest run` **2512 passed, 3 failed** — the three
being the documented `RewardScreen` copy baseline (DVTD-9dn0). Story typechecks
confirmed under a scratchpad tsconfig clearing the `*.stories.tsx` exclusion; my
two story files are clean, and the 40 remaining story errors are the pre-existing
rot (RunCommunity, GateRewardReport, StripScreen, modules/PrepScreen.stories).
