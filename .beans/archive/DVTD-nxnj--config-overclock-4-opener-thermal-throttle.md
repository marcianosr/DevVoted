---
# DVTD-nxnj
title: 'Config: Overclock (×4 opener, thermal throttle)'
status: completed
type: feature
priority: normal
created_at: 2026-08-20T13:50:32Z
updated_at: 2026-08-20T13:57:11Z
---

Risk-family rare config. The gate's first answer earns ×4 coverage; every answer after it runs hot at ×0.5. Cools off (resets) each gate clear.

Design (session 2026-08-20, replacing Marciano's first spec of '×4 opener, lose 16KB per later poll'):
- KB drain rejected: an unavoidable per-poll fee violates the price-is-the-whole-cost rule (Volkswagen precedent), out-drains every economy config (64KB/gate), and reduces to Cold Start plus a tax.
- Throttle shape: all-correct gate = 4 + 4×0.5 = 6 poll-worths vs 5 baseline (×1.2 avg, honestly below Intellisense ×1.5 → rare pricing fair). Miss the opener → 0 + 2 vs baseline 4: the risk identity.
- Live decision: paid tools (ESLint cross-out, Telemetry peek) migrate to the opener. First config to touch intra-gate distribution.
- Name semantics: overclock → runs hot → thermal throttle. Second member of the risk family (next to Volkswagen CI).

Todo:
- [x] New axis on Config (throttle multiplier for non-opener answers)
- [x] Roster entry: risk, rare, opener ×4, throttle ×0.5
- [x] Scoring: apply throttle to every non-opener answer (rides the same first-answer state as Cold Start)
- [x] Specs: model + scoring + stacking with Cold Start
- [x] Wiki roster table + CHANGELOG

## Summary of Changes

- `config.model.ts`: new axis `throttleCoverageMultiplier` — the opener multiplier's counterpart, the one benefit priced below ×1.
- `effect.model.ts`: the throttle is the else-branch of Cold Start's existing `answeredBefore === 0` ternary; `touchesCoverage` includes it.
- `configRoster.model.ts`: `overclock` — risk, rare (128KB), `openerCoverageMultiplier: 4`, `throttleCoverageMultiplier: 0.5`.
- `pipeline.model.ts`: `throttleFor` folds the throttle into `perAnswerPreviewFor`'s floor (a floor that ignores a conditional malus overstates the guarantee — Cold Start's conditional upside stays out). No UI work: the reveal equation already formats negative chips (signed value, cinnabar), so the throttle shows as a red −0.5 Overclock chip automatically.
- Specs: effect (×4 opener / ×0.5 rest), coverageForAnswer (front-load + ×8 stack with Cold Start), breakdown (+3 opener chip / −0.5 throttle chip), preview floor. 1655 tests / 125 files, lint + arch + tsc clean.
- Wiki roster (29 configs) + CHANGELOG entry.

Not committed — awaiting Marciano's review.
