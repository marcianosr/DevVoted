---
# DVTD-iq13
title: Decouple gate depth from pipeline width; swatches become gate badges
status: completed
type: feature
priority: normal
created_at: 2026-08-06T14:51:00Z
updated_at: 2026-08-06T15:34:26Z
---

Marciano (2026-08-06): ADR-018 welded depth to width (gate N needs slot N), which made the gate number redundant with the slot count and turned a held clear into an enforced replay treadmill — the very farming ADR-017 already prices out. Clearing a gate is a checks test; coverage buys width. They are separate axes and stay separate.

Decision: every clear advances the gate. Swatches re-key from slots to gates (you beat the leader, you get the badge). 13 gates (0-12) after splitting the Elite Four finale into Elite (gate 11, indigo/Indigo Plateau) then Champion (gate 12, legendary). Slots stay MAX_SLOTS 14 with the existing rungs.

- [x] rules.model: VICTORY_GATE 12, GATE_COUNT 13, reward multiplier cap
- [x] pipeline.model: drop slotsRequiredForGate / gateFitsPipeline
- [x] run.model: closeWindow always advances; drop heldAtGate; addSlot just widens
- [x] swatch.model: re-key by gate; Elite + Champion; drop coverage from rungs
- [x] viewmodel: drop heldAtGate; unlock row no longer names a gate
- [x] GateSegmentBar pips read pure depth (no coverage in the popover)
- [x] RewardScreen: earned-swatch moment replaces the held branch
- [x] SlotSwatchRow becomes a plain next-slot row (no swatch chip)
- [x] server: award swatch on gate clear, not on slot add
- [x] app.css: elite (indigo + ring), champion (legendary)
- [x] ADR-019 superseding ADR-018; wiki; CHANGELOG

## Summary of Changes

Depth decoupled from width. `closeWindow` always advances; `heldAtGate`, `slotsRequiredForGate` and `gateFitsPipeline` deleted; `addSlot` is a pure widening. VICTORY_GATE 11 to 12 (13 gates), GATE_COUNT 13, reward multiplier cap now derives from GATE_COUNT.

Swatches re-keyed slot to gate and moved to `modules/run/gate/swatch.model.ts`, 13 of them, awarded server-side on the clear that beat the gate. Elite Four split into Elite (gate 11, indigo + rim, Indigo Plateau) and Champion (gate 12, Kanto gradient); new `SwatchFinish` (flat|plate|fill) with one renderer, `src/ui/SwatchMark.component.tsx`.

UI: HUD pips read pure depth and fill the current gate by window progress; the reward report names the badge just earned; the shop/configure row became `SlotUnlockRow` with no chip. Pipeline rows gained slot numbers in a gutter column (PipelineTable `numbered`, FoldableRow `placement`), the detail rule moved under the status mark, and the per-row rarity word was dropped: all three Marciano's asks mid-session.

Also fixed a real a11y defect: the earned-badge line was two flex siblings, so it read "Boulder Swatchearned".

Deferred: DVTD-ziss (narrow builds can coast now that width is not a toll gate).

Verified: vitest 1131 passed / 114 files, tsc clean, oxlint + depcruise clean.
