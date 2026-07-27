---
# DVTD-5riy
title: 'Demand escalation legibility: per-row climb breakdown + SonarQube rename'
status: in-progress
type: feature
created_at: 2026-07-25T16:06:39Z
updated_at: 2026-07-25T16:06:39Z
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
