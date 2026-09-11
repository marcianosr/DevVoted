---
# DVTD-ow1y
title: 'Kanto gate hold screen: pay the peel in slots'
status: completed
type: feature
priority: normal
created_at: 2026-09-11T08:03:13Z
updated_at: 2026-09-11T08:14:59Z
---

The kanto kit has a GateClearScreen but no counterpart for a missed gate. This is the last unbuilt screen in the run loop's kanto reskin.

A gate that holds the run demands a peel, denominated in SLOTS not configs. The player picks configs whose sizes sum to at least the demand. Integer sizes (1/2/4/8) mean they often overpay, and that waste is the real cost.

Domain is already complete: peelSlotsRemaining is in slots, strip() floors the remainder, quota is ceil(occupiedSlots x failPeelShareFor(gate)). No mechanical change needed.

## Decisions

- Drop only. minifyForPeel() exists in the domain but no UI surfaces it; the wiki promise gets corrected rather than left unkept.
- Kit-only. No routes touched, matching every other kanto screen.
- Overshoot named explicitly: the tally reads "3 slots - 4 chosen - 1 over".

## Todo

- [x] GateHoldScreen.ui.tsx composed from existing kanto parts
- [x] Fixtures in kantoGate.factory.ts (holdTallyOf, holdActionOf, frames)
- [x] GateHoldScreen.stories.tsx
- [x] GateHoldScreen.spec.tsx
- [x] Wiki: correct the minify-pays-a-peel promise
- [x] ADR-037: replace the stale failStripsFor config-count table
- [x] Verify: lint, build, tests

## Summary of Changes

Composed the kanto gate hold screen, the missing sibling of `GateClearScreen`. Kit-only: no route renders it, matching every other kanto screen.

### New

- `src/ui/kanto-theme/GateHoldScreen.ui.tsx` — mirrors GateClearScreen band for band, inverted. Local `GateHoldHeading` and `DropPanel`. Built entirely from existing parts (Screen, Swatch, SwatchTrack, Fold, LedgerRows, ConfigChip, Panel, Audit, ScreenFooter, Typography, Badge). No new primitive.
- `GateHoldScreen.stories.tsx` — 6 static frames plus an interactive `Picking` story.
- `GateHoldScreen.spec.tsx` — 27 tests.

### Changed

- `src/test/kantoGate.factory.ts` — `GateHoldFrame`, `kantoGateHoldAt()`, six named frames, and the `holdTallyOf` / `holdActionOf` copy helpers. Derives every number from real domain rules (`peelQuotaSlotsFor`, `failPeelShareFor`, `faucetKbPerCorrect`, `peelRefundIn`, `auditAt`) rather than hardcoding.
- `docs/wiki.md` — removed the minify-pays-a-peel promise no screen keeps (3 places); documented the overshoot rule instead.
- `docs/adr/037` — replaced the stale `failStripsFor` config-count table with the share model, and fixed four dead identifiers (`stripQuotaOnFail`, `failStripQuotaFor`, `isStakeFatal`, `slotsForGatesCleared`).

### Design decisions

- **Drop only.** `minifyForPeel()` stays in the domain but no UI offers it; the wiki promise was corrected rather than left unkept.
- **Overshoot is named.** The tally reads `3 slots · 4 chosen · 1 over`. Nothing else in the codebase surfaced the waste, and the waste is the real cost.
- **Selection reuses ConfigChip** (pressable badge + `lost` strike-through) rather than adding a kanto `PickBox`. The terminal kit's checkbox is not a kanto idiom.
- **The drop band is not a Fold.** Paying is the screen's work, so it cannot be collapsed.
- **Swatch is `current`, not `discovered`** — a miss earns no swatch, and `current` renders the dashed edge.
- Panel types are declared locally rather than importing `GateClearLedgerPanel`, to avoid coupling two sibling screens through a badly-named type.

### Verification

- `npm test` — 238 files, 4253 passed, 6 skipped, 2 todo
- `npx tsc --noEmit` — 0 errors repo-wide
- `npm run lint` — no dependency violations (967 modules); one pre-existing warning in `Screen.stories.tsx`
- New spec alone: 27/27

No `CHANGELOG.md` entry: kit-only work is not player-visible per `docs/changelog-maintenance.md`.

### Deferred

- The mockup was never received, so the band order, the cinnabar toll colour, the checkbox-vs-badge toggle and the exact wording are derived from the house grammar rather than matched to the image.
- `docs/adr/036` still cites the dead `slotsForGatesCleared`. Out of scope (file not otherwise touched).
- `minifyForPeel()` is now documented nowhere and unreachable by players. Worth a follow-up: surface it or delete it.
