---
# DVTD-fy6v
title: 'Shop exit: block a build with no unconditional check'
status: todo
type: task
created_at: 2026-08-14T13:31:17Z
updated_at: 2026-08-14T13:31:17Z
parent: DVTD-72d9
---

gatePassed counts 'skipped' as passing and there is no gate-level correctness floor (ADR-022), so a pipeline whose every check is draw-excusable (focus, linters, .length) clears a gate on 0/5. Reachable deliberately: draft focus configs for categories your pool rarely serves. Fix at shop exit, not at the gate, so the player can act on it (width-demand precedent, ADR-027/031). Needs a conditional-vs-unconditional split on CheckKind. Unconditional today: correct, min-correct, no-double-miss, breadth, coverage-gain, storage-floor, peek-count, cold-start, pick-budget.
