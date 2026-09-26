---
# DVTD-s57f
title: 'PR#78 review followups: bean sync, shared gate constant, end-run error visibility'
status: completed
type: task
priority: normal
created_at: 2026-06-04T11:56:24Z
updated_at: 2026-06-04T11:58:18Z
---

From gameplay review of feat/metaprogress.

## Summary of Changes

- DVTD-amsp bean body fixed: removed contradiction (death IS tiered, not 'full credit')
- Extracted MIN_GATE_FOR_MANUAL_END constant to pipelineEvaluator.service.ts; consumed by both deriveNavRunState.ts (client) and handlers.ts (server); error message now interpolates the constant
- ConfirmDialog gained errorMessage + isConfirming props; errors render INSIDE the modal (previously hidden behind backdrop); buttons disable during pending state
- __root.tsx wires finishRun.error/isPending into the dialog; finishRun.reset() on open/cancel so a stale error doesn't carry between attempts

Verified: tsc clean, lint 0/0, 34 targeted tests pass.
