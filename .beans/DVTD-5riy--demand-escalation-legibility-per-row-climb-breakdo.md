---
# DVTD-5riy
title: 'Demand escalation legibility: per-row climb breakdown + SonarQube rename'
status: scrapped
type: feature
priority: normal
created_at: 2026-07-25T16:06:39Z
updated_at: 2026-08-04T16:14:34Z
parent: DVTD-cb52
---

Escalating demands (Unit Tests correct-count, coverage-gain threshold) silently fold climb escalation into config rows, and the coverage-gain config is named "Coverage" — colliding with coverage-the-score.

Decisions (Marciano, 2026-07-25):
- Rename coverage-gain config label "Coverage" → "SonarQube" (id stays `coverage-gain`; run snapshots store config ids).
- Attribute escalation per-row where the number is shown: "Requires 3 correct answers (1 base + 2 climb)", "+6% coverage this window (4% base + 2% climb)". No breakdown when escalation is 0.
- Draft/dex text must stop lying: demand-carrying config descriptions become gate-aware, with a "rises as you climb" cue when no gate context exists.

## Todos

- [ ] Shared breakdown formatter next to escalation() in rules.model.ts
- [ ] Correct-check demand shows breakdown (gate.model.ts)
- [ ] coverage-gain demand shows breakdown (effect.model.ts)
- [ ] Rename label Coverage → SonarQube in configRoster; check label follows config label
- [ ] Gate-aware describeConfig for demand-carrying configs (draft/shop/dex surfaces)
- [ ] Update affected specs + stories
- [ ] ADR-006 + CHANGELOG updates

## Parked 2026-07-28 — pickup notes

No code written yet; decisions + surface map below are complete.

Surface map (explored):
- Pipeline rows (RoleList → PipelineReportRow) render chips with `noTooltip` — they're covered purely by the demand strings; no prop threading needed there.
- Dynamic demand strings: `correctDemand()` in `gate/gate.model.ts` (add `gatesCleared` + breakdown) and coverage-gain `demand()` in `configs/effect.model.ts`.
- Shared formatter goes next to `escalation()` in `rules.model.ts`: `climbBreakdown(base, gatesCleared, unit?)` → " (1 base + 2 climb)" / " (4% base + 2% climb)", empty while escalation is 0.
- Check labels should derive from `config.label` in `effect.model.ts` (coverage-gain hardcodes "Coverage" at line ~95) so the SonarQube rename can't drift. Note: existing specs assert labels "Coverage" and "Cold start" (gate.model.spec, effect.model.spec).
- Stale-tooltip surfaces (static `describeConfig`): draft chips in ShopScreen (has `gateNumber` = gatesCleared + 1), bench chips in ConfiguringScreen (run start, escalation 0 — skip), ConfigActions popover chip (shop loadout), ConfigdexPanel (no run context → "Rises as you climb." cue).
- Plan: `describeConfig(config, gatesCleared?)` — with context show escalated total + breakdown; without context (or escalation 0) append "Rises as you climb." for the two escalating configs (correct-check, coverage-gain). Cold Start/focus untouched.
- Rename label only; id `coverage-gain` stays (run snapshots reference config ids).
- Wrap up with: spec updates (gate.model.spec:63-66 expects ["Correct","Coverage"], effect.model.spec:41-51), stories touching coverageGain, ADR-006 lines 29/41 ("○ Coverage 2%/4%", "Coverage (+4% this window, ×1.5)"), CHANGELOG (player-visible rename + clearer demand text).
