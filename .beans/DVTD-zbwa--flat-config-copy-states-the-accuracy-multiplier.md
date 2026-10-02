---
# DVTD-zbwa
title: Flat config copy states the accuracy multiplier
status: completed
type: task
priority: normal
created_at: 2026-10-02T11:11:44Z
updated_at: 2026-10-02T12:00:08Z
---

**What:** Code Coverage, Math.ceil() and strict: true say what they pay as it is under the accuracy multiplier.

**Why:** Their text says a flat top-up is never amplified, but a perfect window doubles it, so the player is told a smaller number than they get.

## Done when
- [x] Code Coverage and Math.ceil() no longer claim no multiplier touches them
- [x] strict: true states that the wager moves with the gate's accuracy
- [x] The ADR on pooled bonuses agrees with what the code multiplies
- [x] The changelog names the corrected text

## Notes
- `windowOutputOf` → `gateOutputOf(window.unitsEarned, …)`: `unitsEarned` already includes `coverageAdd`, cache, `topUpUnitsFor` and the strict wager, so "flat" means outside the build multipliers only.
- ADR-172 §4 says flat adds stay outside every multiplier; the code disagrees. Fix the copy ("outside your build's multipliers") or the ADR, not the formula, unless Marciano decides otherwise.
- strict: a miss also lowers accuracy, so it is punished twice. Flag in the design bean, not here.
- Source: config audit 2026-10-02 against ADR-161/169/172.

## Summary of Changes

- Roster and `config.model` copy for Code Coverage, Math.ceil() and strict: true now say the gate's accuracy scales them; wiki rows and the Prose/Typography sample strings follow.
- ADR-172 §4 amended: flat adds sit outside the build's multipliers, inside the accuracy multiplier.
- Same change set removed the streak KB multiplier (Marciano: superseded), recorded as an ADR-169 amendment.
- CHANGELOG Changed entry; the Unreleased Code Coverage line corrected.
