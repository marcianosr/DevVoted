---
# DVTD-4xjs
title: yarn.lock config (immunity to requirement raises)
status: draft
type: feature
priority: deferred
created_at: 2026-07-12T17:54:52Z
updated_at: 2026-07-12T17:54:52Z
parent: DVTD-5jpw
---

Parked: yarn.lock config + immuneToRaise/locksBar mechanism, removed from session-run for now.

Behavior when removed: locksBar made effectiveRequirement ignore Risk requirementDelta (kept escalation). Description 'This gate can never get harder' overpromised (escalation still hardened it). If rebuilt, decide: (1) also freeze escalation to match the label, or (2) reframe as 'cancels Risk penalties, keep the reward'.
