---
# DVTD-811d
title: Slots are bought, storage is capped again, the pipeline becomes Your Build
status: completed
type: feature
priority: normal
created_at: 2026-08-30T07:58:36Z
updated_at: 2026-08-30T08:40:40Z
---

Removes the gate-staged width schedule and the extra-spot rent. Slots are bought with
KB on a price ladder, empty slots can be cashed back, and the KB cap returns as a
seven-rung subscription. Grades (bit/crumb/nibble/byte) are deleted in favour of a
plain size number. "Pipeline" becomes "Your Build" and "spots" become "slots".

Supersedes ADR-043, ADR-045; amends ADR-044 and ADR-030; revives ADR-023's shape.

## Vocabulary

- Storage = the KB economy and its ceiling
- Build = the active setup
- Slots = capacity within the build
- Configs = things installed in slots

## Numbers

SLOT_PRICES_KB (slots 5..24): 16, 32, 64, 128, 192, 256, 384, 512, 768, 1024, 1536,
2048, 3072, 4096, 6144, 8192, 12288, 16384, 24576, 32768

Cash-out refunds the price of the most expensive slot still held; the purchase index
is a high-water mark that never rolls back, so re-buying always costs the next rung.

STORAGE_PLANS: 512 free / 768 -16 / 1MB -32 / 1.5MB -64 / 2.5MB -128 / 5MB -384 /
10MB -768, billed per gate on clear only.

Config sizes: 1 | 2 | 4 | 8 | 12 | 16. Draft cost = 32 KB x size.

## Todos

- [x] rules.model.ts: slot ladder + storage plans, delete the rung/rent ladders
- [x] config.model.ts + roster: sizes replace grades, price derives from size
- [x] pipeline/ -> build/, Pipeline -> Build, spots -> slots
- [x] run.model / runAction / shopAction / answer.model: buy-slot, cash-slot, set-storage-plan
- [x] view models and presentation
- [x] UI kit: SlotTrack, Slots section, StoragePlan section, delete RarityGlyph
- [x] ADR-046, ADR-047, ADR-048
- [x] wiki, CONTEXT.md, CHANGELOG
- [x] lint, build, test

## Summary of Changes

Slots are bought, not handed over. `SLOT_PRICES_KB` (20 rungs, 16 KB to 32768 KB)
replaces `SPOT_RUNGS` and `EXTRA_SPOT_TIERS`; `STORAGE_PLANS` brings the KB cap back
as a seven-rung subscription billed on clear. Cash-out refunds the price of the most
expensive slot still held while `slotsBought` stays a high-water mark, which closes
the buy-low/cash-high loop.

Grades deleted (ADR-047): `Config.slots` is 1/2/4/8/12/16 and `draftCost` is
32 KB x slots. `RarityGlyph.ui`, `rarity.ts` and the dead `Slot.ui` are gone;
`SlotMark.ui` is the one place a size is drawn.

Renamed (ADR-048): `src/modules/run/pipeline/` -> `build/`, `Pipeline` -> `Build`,
`spots` -> `slots` across src/modules, src/ui/modern-theme and src/routes.
`src/domains/` legacy left alone. The `slot`/`unslot` reducer actions became
`install`/`uninstall`.

ADR-046, ADR-047, ADR-048 written; ADR-045 and ADR-043 marked superseded; ADR index,
wiki (SS2.6, 2.8, 3, 4.2, 4.3, 5.1, 5.2, 8, 9, 10), CONTEXT.md and CHANGELOG updated.

Verified: `npm run lint` clean (787 modules, 0 dependency violations); `npm run build`
passes; `npm test` 2588 passed, 3 failed — all three pre-existing RewardScreen failures
from uncommitted WIP on Screen/Swatch/SwatchTrack.ui, unrelated to this change.

## Deferred

- `RunState.build` changes the persisted `runs.state` jsonb shape. In-flight runs need
  `npm run db:refresh`; no migration was written (pre-release branch).
- `COVERAGE_DEMANDS` deliberately not retuned against the narrower builds this creates.
- Story files carry pre-existing type errors hidden by the tsconfig exclusion
  (RunCommunity, GateRewardReport, StripScreen, RunHud, GatesPanel, ui/Screen).
