---
# DVTD-3ueg
title: 'C — Debrief: storage balance readout and delta'
status: completed
type: task
priority: normal
created_at: 2026-09-24T12:30:35Z
updated_at: 2026-09-24T12:45:44Z
parent: DVTD-c2ha
---

- [x] Item 11: replace the +61 KB hero with the HeaderFunds readout
- [x] Item 12: label STORAGE_BALANCE, drop quiet/headline tones so figures badge, add a delta
- [x] Apply to both clearedStorageRows and heldStorageRows
- [x] Update GateOutcomeScreen.spec

## Summary of Changes

**Item 11.** The cleared branch of `figureOf` showed a hero `+61 KB` delta over a muted `balance 357 KB`, which read as two competing numbers. It now reads the balance itself under the label `Storage balance`. The RUN_OVER branch (coverage %) and the SHAKY branch (peel owed) keep their hero readings — those numbers genuinely are the headline on those screens.

**Item 12.** `BALANCE`/`BALANCE_WORD` now come from the shared `STORAGE_BALANCE`, so every screen spells the balance one way. The two balance rows collapsed into one `balanceRow` helper that emits: the reading moved from (quiet), the reading landed on (a real badge, no `tone`, so `LedgerRows` falls through to `<Badge>`), and the step between them coloured gain or loss. The step is omitted when the balance did not move.

**Found while doing it:** `isGainRow` counted any row carrying a gain-coloured figure, so the new delta made the strip report "4 payouts" instead of 3. A total sums the payouts above it and can never be one, so `isGainRow` now excludes `total` rows. That was a latent bug waiting for any total to carry a colour.
