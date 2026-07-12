---
# DVTD-pre0
title: 'ADR: Tech Debt mechanic design rationale'
status: scrapped
type: task
priority: normal
created_at: 2026-06-14T07:36:56Z
updated_at: 2026-06-14T07:50:27Z
parent: DVTD-fapc
---

Write ADR at docs/adr/XXX-tech-debt-mechanic.md capturing the locked design decisions and rejected alternatives from the epic. Per CLAUDE.md, significant design decisions warrant ADRs.

## Todos

- [ ] Pick next ADR number (check docs/adr/ for highest)
- [ ] Document: shape (restriction not bleed), acquisition surfaces, stacking, persistence, cap behavior, clear-condition rules
- [ ] Document rejected alternatives with reasoning (bleed model, wrong-answer acquisition, pipeline-failure acquisition, stacking, retroactivity, meta-leak)
- [ ] Document MVP TD pool table

## Reasons for Scrapping

Marciano correctly pushed back that what I framed as an ADR is actually game design content, not architectural. ADRs are for technical/architectural decisions with trade-offs that affect how code is structured; the design rationale (bleed vs restriction, stacking semantics, etc.) is gameplay design and lives in the epic bean (DVTD-fapc) which already captures it.

Possible future ADRs from this work — none compelling enough to write proactively:
- Tech Debt as its own domain boundary (vs folded into runs/economy)
- Information debuffs vs mechanical debuffs as two code paths
